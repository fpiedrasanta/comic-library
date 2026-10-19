import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { CatalogFilterListResponse, WorkCatalogItemDto } from '../types/works'

/** How long a listing is considered fresh, as in the catalog. */
const WORKS_STALE_TIME = 1000 * 60 * 2

/** Fetches one page of a works listing. */
export type WorksPageFetcher = (
  page: number,
) => Promise<CatalogFilterListResponse<WorkCatalogItemDto>>

interface UseWorksPaginationParams {
  /** Key of the first page. Every change restarts the listing at page 1. */
  queryKey: readonly unknown[]
  fetchPage: WorksPageFetcher
  /**
   * Time the listing stays fresh. `0` forces a refetch on every mount, for
   * listings that mirror live user state instead of catalog content.
   */
  staleTime?: number
}

/**
 * First page plus infinite scroll of a works listing.
 *
 * The catalog, the favorites and the reading history are the same shape — a
 * paginated list of works — and only differ in where a page comes from. All of
 * them use this so the accumulate, deduplicate, preload and observe behavior
 * is written once.
 *
 * The accumulated works are read from the cache of every loaded page, and not
 * kept apart in a local list. That way a listing reflects the cached state of
 * its works as soon as it changes — the favorite star of a work, for example —
 * without the listing losing the pages already loaded.
 */
export function useWorksPagination({
  queryKey,
  fetchPage,
  staleTime = WORKS_STALE_TIME,
}: UseWorksPaginationParams) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const listingKey = JSON.stringify(queryKey)
  const [loadedPages, setLoadedPages] = useState({ listingKey, count: 1 })

  // Another listing starts again at its first page.
  const loadedPageCount = loadedPages.listingKey === listingKey ? loadedPages.count : 1

  const pageQueries = useQueries({
    queries: Array.from({ length: loadedPageCount }, (_, index) => ({
      queryKey: index === 0 ? queryKey : [...queryKey, 'page', index + 1],
      queryFn: () => fetchPage(index + 1),
      staleTime,
    })),
  })

  const works: WorkCatalogItemDto[] = []
  const loadedWorkIds = new Set<number>()
  for (const page of pageQueries) {
    for (const work of page.data?.items ?? []) {
      if (loadedWorkIds.has(work.id)) continue
      loadedWorkIds.add(work.id)
      works.push(work)
    }
  }

  const firstPage = pageQueries[0]
  const totalCount = firstPage.data?.totalCount ?? 0
  const hasNextPage = works.length < totalCount
  const isFetchingPage = pageQueries.some((page) => page.isFetching)
  const lastRequestedPage = pageQueries[pageQueries.length - 1]

  const loadMore = useCallback(() => {
    if (isFetchingPage || !hasNextPage) return

    // A page that failed is retried instead of skipped, so the listing never
    // loses the works of a page in the middle.
    if (lastRequestedPage?.isError) {
      void lastRequestedPage.refetch()
      return
    }

    setLoadedPages({ listingKey, count: loadedPageCount + 1 })
  }, [isFetchingPage, hasNextPage, lastRequestedPage, listingKey, loadedPageCount])

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  return {
    works,
    firstPageItems: firstPage.data?.items ?? [],
    totalCount,
    isLoading: firstPage.isLoading,
    isError: firstPage.isError,
    error: firstPage.error as Error | null,
    hasNextPage,
    loaderRef,
    refetch: firstPage.refetch,
  }
}
