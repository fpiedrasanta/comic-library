import { useCallback, useEffect, useRef, useState } from 'react'
import { getCatalogLists } from '../api/lists-repository'
import type { CatalogCardListResponse } from '../types/entity-cards'
import type { CatalogListCardDto } from '../types/lists'

/** Multiple of 12, so the card grid fills evenly on every breakpoint. */
export const LIST_CARD_PAGE_SIZE = 24
/** How many skeletons the first paint shows while page 1 is in flight. */
export const LIST_CARD_SKELETON_COUNT = 10

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

export interface CatalogLists {
  /** The lists of every page loaded, in order and deduplicated by id. */
  items: CatalogListCardDto[]
  totalCount: number
  hasNextPage: boolean
  /** There is nothing on screen yet: the page shows its loading state. */
  isLoading: boolean
  /** A page after the first is being loaded. */
  isFetchingMore: boolean
  error: Error | null
  /** Asks for the next page. */
  loadMore: () => void
  /** Asks the backend again, from the first page. */
  refetch: () => void
}

/**
 * The listing of lists of `/lists` and `/my-lists`.
 *
 * The pages are asked one at a time and kept in the state of the screen, with
 * no cache between screens: opening the listing always shows what the backend
 * answers at that moment, and the same list never shows up twice when the
 * pages of the backend shift.
 */
export function useCatalogLists(filters: ListCardsFilters): CatalogLists {
  const trimmedSearch = filters.search?.trim() ?? ''
  const myLists = filters.myLists ?? false

  const [pages, setPages] = useState<CatalogCardListResponse<CatalogListCardDto>[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  // The request that is in flight when the filters change is discarded.
  const requestRef = useRef(0)

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      const requestId = requestRef.current + 1
      requestRef.current = requestId

      if (append) setIsFetchingMore(true)
      else setIsRefreshing(true)
      setError(null)

      try {
        const response = await getCatalogLists({
          currentPage: page,
          pageSize: LIST_CARD_PAGE_SIZE,
          search: trimmedSearch || undefined,
          publisherId: filters.publisherId ?? undefined,
          franchiseId: filters.franchiseId ?? undefined,
          seriesId: filters.seriesId ?? undefined,
          listTypeId: filters.listTypeId ?? undefined,
          myLists,
        })

        if (requestId !== requestRef.current) return

        setPages((current) => (append ? [...current, response] : [response]))
        setHasNextPage(response.hasNextPage)
        setNextPage(response.nextPage)
      } catch (reason) {
        if (requestId !== requestRef.current) return
        setError(reason instanceof Error ? reason : new Error(String(reason)))
      } finally {
        if (requestId === requestRef.current) {
          setIsRefreshing(false)
          setIsFetchingMore(false)
        }
      }
    },
    [
      trimmedSearch,
      filters.publisherId,
      filters.franchiseId,
      filters.seriesId,
      filters.listTypeId,
      myLists,
    ]
  )

  // The first page is asked again when the filters change.
  useEffect(() => {
    void loadPage(1, false)
  }, [loadPage, reloadCount])

  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasNextPage || nextPage === null) return
    void loadPage(nextPage, true)
  }, [isFetchingMore, hasNextPage, nextPage, loadPage])

  const refetch = useCallback(() => setReloadCount((count) => count + 1), [])

  return {
    items: flattenListCards(pages),
    totalCount: pages[0]?.totalCount ?? 0,
    hasNextPage,
    isLoading: isRefreshing && pages.length === 0,
    isFetchingMore,
    error,
    loadMore,
    refetch,
  }
}

/**
 * The lists of every page loaded, in order and deduplicated by id.
 *
 * The backend pages by name with an id tie-breaker, so a list can in
 * principle land on two pages; deduplicating here means it renders once.
 */
function flattenListCards(
  pages: CatalogCardListResponse<CatalogListCardDto>[]
): CatalogListCardDto[] {
  const byId = new Map<number, CatalogListCardDto>()

  for (const page of pages) {
    for (const list of page.items) {
      if (!byId.has(list.id)) byId.set(list.id, list)
    }
  }

  return Array.from(byId.values())
}
