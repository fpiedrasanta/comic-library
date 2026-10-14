import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CatalogFilterListResponse, WorkCatalogItemDto } from '../types/works'
import { WORKS_PAGE_SIZE } from './use-works'

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
  pageSize?: number
  /**
   * Time the listing stays fresh. `0` forces a refetch on every mount, for
   * listings that mirror live user state instead of catalog content.
   */
  staleTime?: number
}

/**
 * First page plus infinite scroll of a works listing.
 *
 * The catalog and the reading history are the same shape — a paginated list of
 * works — and only differ in where a page comes from. Both use this so the
 * accumulate, deduplicate, preload and observe behavior is written once.
 */
export function useWorksPagination({
  queryKey,
  fetchPage,
  pageSize = WORKS_PAGE_SIZE,
  staleTime = WORKS_STALE_TIME,
}: UseWorksPaginationParams) {
  const queryClient = useQueryClient()
  const loaderRef = useRef<HTMLDivElement>(null)
  const [accumulatedWorks, setAccumulatedWorks] = useState<WorkCatalogItemDto[]>([])

  const firstPageQuery = useQuery({
    queryKey,
    queryFn: () => fetchPage(1),
    staleTime,
  })

  useEffect(() => {
    if (firstPageQuery.data?.items) {
      setAccumulatedWorks(firstPageQuery.data.items)
    }
  }, [firstPageQuery.data?.items])

  const totalCount = firstPageQuery.data?.totalCount ?? 0
  const hasNextPage = accumulatedWorks.length < totalCount

  const loadMore = useCallback(async () => {
    if (firstPageQuery.isFetching || !hasNextPage) return
    const nextPage = Math.floor(accumulatedWorks.length / pageSize) + 1
    try {
      const nextData = await queryClient.fetchQuery({
        queryKey: [...queryKey, 'page', nextPage],
        queryFn: () => fetchPage(nextPage),
      })
      setAccumulatedWorks((prev) => {
        const existingIds = new Set(prev.map((work) => work.id))
        const newItems = nextData.items.filter((work) => !existingIds.has(work.id))
        return [...prev, ...newItems]
      })
    } catch {
      // Error handling is managed by the query cache
    }
  }, [firstPageQuery.isFetching, hasNextPage, accumulatedWorks.length, pageSize, queryClient, queryKey, fetchPage])

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
    works: accumulatedWorks,
    firstPageItems: firstPageQuery.data?.items ?? [],
    totalCount,
    isLoading: firstPageQuery.isLoading,
    isError: firstPageQuery.isError,
    error: firstPageQuery.error as Error | null,
    hasNextPage,
    refetch: firstPageQuery.refetch,
    loaderRef,
  }
}
