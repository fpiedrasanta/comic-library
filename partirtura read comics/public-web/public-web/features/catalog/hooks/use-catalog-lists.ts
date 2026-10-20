import { useInfiniteQuery } from '@tanstack/react-query'
import { getCatalogLists } from '../api/lists-repository'
import { CATALOG_LISTS_KEY } from './query-keys'

/** Multiple of 12, so the card grid fills evenly on every breakpoint. */
export const LIST_CARD_PAGE_SIZE = 24
/** How many skeletons the first paint shows while page 1 is in flight. */
export const LIST_CARD_SKELETON_COUNT = 10

const STALE_TIME_MS = 1000 * 60 * 2

export interface ListCardsFilters {
  search?: string
  publisherId?: number | null
  franchiseId?: number | null
  seriesId?: number | null
  listTypeId?: number | null
  /**
   * Only the personal lists of the authenticated user when `true`. Any other
   * value keeps the lists of the system.
   */
  myLists?: boolean
}

/**
 * Infinite listing for `/lists` and `/my-lists`.
 *
 * Every filter is part of the query key, so changing one starts a fresh
 * query at page 1 and the pages of the previous combination stop
 * counting as results. React Query owns one request per page and hands
 * the next page only when it is asked, which keeps a scroll from
 * firing the same page twice.
 */
export function useCatalogLists(filters: ListCardsFilters) {
  const trimmedSearch = filters.search?.trim() ?? ''
  const myLists = filters.myLists ?? false

  return useInfiniteQuery({
    queryKey: [
      CATALOG_LISTS_KEY,
      myLists,
      trimmedSearch,
      filters.publisherId ?? null,
      filters.franchiseId ?? null,
      filters.seriesId ?? null,
      filters.listTypeId ?? null,
    ],
    queryFn: ({ pageParam }) =>
      getCatalogLists({
        currentPage: pageParam,
        pageSize: LIST_CARD_PAGE_SIZE,
        search: trimmedSearch || undefined,
        publisherId: filters.publisherId ?? undefined,
        franchiseId: filters.franchiseId ?? undefined,
        seriesId: filters.seriesId ?? undefined,
        listTypeId: filters.listTypeId ?? undefined,
        myLists,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage ?? null : null),
    staleTime: STALE_TIME_MS,
  })
}
