import { useInfiniteQuery } from '@tanstack/react-query'
import type { GetCatalogCardsParams } from '../api/entity-cards-repository'
import type { CatalogCardListResponse, CatalogEntityKind } from '../types/entity-cards'

/** Multiple of 12, so the card grid fills evenly on every breakpoint. */
export const ENTITY_CARD_PAGE_SIZE = 24
/** How many skeletons the first paint shows while page 1 is in flight. */
export const ENTITY_CARD_SKELETON_COUNT = 12

const STALE_TIME_MS = 1000 * 60 * 2

export type EntityCardsFetcher<T> = (params: GetCatalogCardsParams) => Promise<CatalogCardListResponse<T>>

export interface UseEntityCardsOptions<T> {
  /** Part of the query key, so the three listings never share a cache entry. */
  kind: CatalogEntityKind
  search?: string
  /** A module-level function, stable across renders. */
  fetcher: EntityCardsFetcher<T>
}

/**
 * Infinite listing for the three US-0026 explore pages.
 *
 * React Query owns one request per page and hands the next page only when it
 * is asked, which is what keeps a scroll from firing the same page twice or
 * two requests for it at once.
 */
export function useEntityCards<T>({ kind, search, fetcher }: UseEntityCardsOptions<T>) {
  const trimmedSearch = search?.trim() ?? ''

  return useInfiniteQuery({
    // The search is part of the key, so changing it starts a fresh query at
    // page 1 and the pages of the previous search stop counting as results.
    queryKey: ['catalog-cards', kind, trimmedSearch],
    queryFn: ({ pageParam }) =>
      fetcher({ currentPage: pageParam, pageSize: ENTITY_CARD_PAGE_SIZE, search: trimmedSearch || undefined }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage ?? null : null),
    staleTime: STALE_TIME_MS,
  })
}

/**
 * The accumulated cards, in page order and deduplicated by id.
 *
 * The backend pages by name with an id tie-breaker, so an item can in
 * principle land on two pages; deduplicating here means it renders once.
 */
export function flattenEntityCards<T extends { id: number }>(pages: T[][] | undefined): T[] {
  if (!pages) return []

  const byId = new Map<number, T>()

  for (const page of pages) {
    for (const card of page) {
      if (!byId.has(card.id)) byId.set(card.id, card)
    }
  }

  return Array.from(byId.values())
}
