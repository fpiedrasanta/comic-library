import { useMutation, useIsMutating, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { addFavorite, removeFavorite } from '../api'
import type { CatalogFilterListResponse, WorkCatalogItemDto } from '../types/works'
import {
  FAVORITES_LISTING_KEY,
  WORK_STATE_LISTING_KEYS,
} from './query-keys'

/** Key of the mutation that adds or removes the favorite of a work. */
function favoriteMutationKey(workId: number) {
  return ['favorite', workId] as const
}

function isWorksPage(
  data: unknown,
): data is CatalogFilterListResponse<WorkCatalogItemDto> {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { items?: unknown }).items)
  )
}

/**
 * Sets the favorite state of a work inside a cached listing.
 *
 * The recommended works come as a plain array and the rest as a page of
 * works, so both shapes are handled here.
 */
function withFavoriteState(data: unknown, workId: number, isFavorite: boolean): unknown {
  if (Array.isArray(data)) {
    const index = data.findIndex((work) => work.id === workId)
    if (index === -1) return data

    const works = [...data]
    works[index] = { ...works[index], isFavorite }
    return works
  }

  if (isWorksPage(data)) {
    const index = data.items.findIndex((work) => work.id === workId)
    if (index === -1) return data

    const items = [...data.items]
    items[index] = { ...items[index], isFavorite }
    return { ...data, items }
  }

  return data
}

/** Removes a work from a cached page of works, keeping the count coherent. */
function withoutWork(data: unknown, workId: number): unknown {
  if (!isWorksPage(data)) return data

  const items = data.items.filter((work) => work.id !== workId)
  if (items.length === data.items.length) return data

  return { ...data, items, totalCount: Math.max(0, data.totalCount - 1) }
}

function isListingOf(query: { queryKey: readonly unknown[] }, namespaces: readonly string[]): boolean {
  const [namespace] = query.queryKey
  return typeof namespace === 'string' && namespaces.includes(namespace)
}

/**
 * Propagates a confirmed favorite change to every cached listing.
 *
 * The favorites listing drops the work when it is removed, so its card leaves
 * the results without a new request. The other listings only reflect the new
 * state of the work, so every card of that work shows the same star.
 */
function applyFavoriteChange(queryClient: QueryClient, workId: number, isFavorite: boolean): void {
  queryClient.setQueriesData(
    { predicate: (query) => isListingOf(query, [FAVORITES_LISTING_KEY]) },
    (data) => (isFavorite ? data : withoutWork(data, workId)),
  )

  queryClient.setQueriesData(
    { predicate: (query) => isListingOf(query, WORK_STATE_LISTING_KEYS) },
    (data) => withFavoriteState(data, workId, isFavorite),
  )

  if (isFavorite) {
    // A new favorite has to appear in the favorites listing, and only the
    // backend knows where it belongs in the order and the pagination.
    queryClient.invalidateQueries({
      predicate: (query) => isListingOf(query, [FAVORITES_LISTING_KEY]),
    })
  }
}

/**
 * Adds or removes the favorite of a work.
 *
 * The state shown by the star is the one the backend returned with the work,
 * and it only changes once the operation succeeds: a failed request never
 * leaves a state that contradicts the persisted one.
 */
export function useToggleFavorite(workId: number, isFavorite: boolean) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: favoriteMutationKey(workId),
    mutationFn: (shouldBeFavorite: boolean) =>
      shouldBeFavorite ? addFavorite(workId) : removeFavorite(workId),
    onSuccess: (_payload, shouldBeFavorite) => {
      applyFavoriteChange(queryClient, workId, shouldBeFavorite)
    },
  })

  // The same work can be on screen more than once, so the pending state is
  // counted over every mutation of the work and not over this button only.
  const pendingMutations = useIsMutating({ mutationKey: favoriteMutationKey(workId) })

  return {
    toggle: () => mutation.mutate(!isFavorite),
    isPending: pendingMutations > 0,
    error: mutation.error,
  }
}
