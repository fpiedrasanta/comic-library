import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { CatalogFilterListResponse, WorkCatalogItemDto } from '../types/works'
import {
  FAVORITES_LISTING_KEY,
  READING_HISTORY_KEY,
  RECOMMENDED_WORKS_KEY,
  WORKS_LISTING_KEY,
} from './query-keys'

/**
 * The listings that show works with the state of the user: the catalog, the
 * favorites, the reading history and the recommended works.
 */
const WORKS_LISTING_KEYS = [
  WORKS_LISTING_KEY,
  FAVORITES_LISTING_KEY,
  READING_HISTORY_KEY,
  RECOMMENDED_WORKS_KEY,
] as const

function isWorksListing(query: { queryKey: readonly unknown[] }): boolean {
  const [namespace] = query.queryKey
  return (
    typeof namespace === 'string' &&
    (WORKS_LISTING_KEYS as readonly string[]).includes(namespace)
  )
}

function isWorksPage(
  data: unknown
): data is CatalogFilterListResponse<WorkCatalogItemDto> {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { items?: unknown }).items)
  )
}

/**
 * Maps the works of a cached listing. The mapper returns `null` for the works
 * it does not change.
 */
function mapWorks(
  data: unknown,
  map: (work: WorkCatalogItemDto) => WorkCatalogItemDto | null
): unknown {
  if (Array.isArray(data)) {
    let changed = false
    const works = data.map((work) => {
      const mapped = map(work)
      if (mapped === null) return work
      changed = true
      return mapped
    })
    return changed ? works : data
  }

  if (isWorksPage(data)) {
    let changed = false
    const items = data.items.map((work) => {
      const mapped = map(work)
      if (mapped === null) return work
      changed = true
      return mapped
    })
    return changed ? { ...data, items } : data
  }

  return data
}

/** Removes a work from a cached page of works, keeping the count coherent. */
function removeWorkFromPage(data: unknown, workId: number): unknown {
  if (!isWorksPage(data)) return data

  const items = data.items.filter((work) => work.id !== workId)
  if (items.length === data.items.length) return data

  return { ...data, items, totalCount: Math.max(0, data.totalCount - 1) }
}

/**
 * The cached state of the works of the listings.
 *
 * Every listing that shows works shares the same cache, so the state of a work
 * — whether it is a favorite, whether it belongs to a personal list — is
 * updated in all of them at once, and a card never shows a state that another
 * screen already changed.
 */
export function useWorksListingCache() {
  const queryClient = useQueryClient()

  /** Sets the state of a work in every cached listing that shows it. */
  const updateWork = useCallback(
    (workId: number, update: (work: WorkCatalogItemDto) => WorkCatalogItemDto) => {
      queryClient.setQueriesData({ predicate: isWorksListing }, (data) =>
        mapWorks(data, (work) => (work.id === workId ? update(work) : null))
      )
    },
    [queryClient]
  )

  /** Removes a work from the listings of the given namespaces. */
  const removeWorkFrom = useCallback(
    (workId: number, namespaces: readonly string[]) => {
      queryClient.setQueriesData(
        {
          predicate: (query) =>
            isWorksListing(query) &&
            namespaces.includes(String(query.queryKey[0])),
        },
        (data) => removeWorkFromPage(data, workId)
      )
    },
    [queryClient]
  )

  /**
   * Asks the backend for the state of the works again.
   *
   * Used when a change affects works the client does not know about, as when a
   * personal list is deleted and its works stop belonging to any list.
   */
  const invalidateWorksListings = useCallback(() => {
    queryClient.invalidateQueries({ predicate: isWorksListing })
  }, [queryClient])

  return { updateWork, removeWorkFrom, invalidateWorksListings }
}
