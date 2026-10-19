import { useQuery } from '@tanstack/react-query'
import { getCatalogWorks } from '../api'
import type { WorkCatalogItemDto } from '../types/works'
import { WORKS_LISTING_KEY } from './query-keys'

interface UseWorksOptions {
  currentPage?: number
  pageSize?: number
  search?: string
  publisherId?: number
  franchiseId?: number
  seriesId?: number
  workTypeId?: number
  orderBy?: string
  orderDir?: string
  enabled?: boolean
}

export const WORKS_PAGE_SIZE = 24

export function useWorks(options: UseWorksOptions = {}) {
  const { enabled = true, ...params } = options

  return useQuery({
    queryKey: ['works', params],
    queryFn: () => getCatalogWorks({ pageSize: WORKS_PAGE_SIZE, ...params }),
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

interface InfiniteWorksOptions {
  search?: string
  publisherId?: number
  franchiseId?: number
  seriesId?: number
  workTypeId?: number
  /** Only the favorites of the authenticated user when `true`. */
  isFavorite?: boolean
  orderBy?: string
  orderDir?: string
  /**
   * Cache namespace of the listing. The favorites listing has its own: it is
   * the catalog with the `isFavorite` criterion, so it holds a different set
   * of works.
   */
  namespace?: string
}

export function useInfiniteWorks(options: InfiniteWorksOptions = {}) {
  const { namespace = WORKS_LISTING_KEY, ...params } = options
  const searchParams = new URLSearchParams()

  searchParams.set('pageSize', String(WORKS_PAGE_SIZE))
  if (params.search) searchParams.set('search', params.search)
  if (params.publisherId !== undefined && params.publisherId !== null) searchParams.set('publisherId', String(params.publisherId))
  if (params.franchiseId !== undefined && params.franchiseId !== null) searchParams.set('franchiseId', String(params.franchiseId))
  if (params.seriesId !== undefined && params.seriesId !== null) searchParams.set('seriesId', String(params.seriesId))
  if (params.workTypeId !== undefined && params.workTypeId !== null) searchParams.set('workTypeId', String(params.workTypeId))
  if (params.isFavorite !== undefined) searchParams.set('isFavorite', String(params.isFavorite))
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)

  const baseQueryKey = [namespace, Object.fromEntries(searchParams)]

  return {
    baseQueryKey,
    pageSize: WORKS_PAGE_SIZE,
  }
}

export function extractEntities(works: WorkCatalogItemDto[]): {
  publishers: Map<number, { id: number; name: string; color: string }>
  franchises: Map<number, { id: number; name: string; color: string; publisherId: number; publisherName: string; publisherColor: string }>
  series: Map<number, { id: number; name: string; color: string; franchiseId: number; franchiseName: string; franchiseColor: string; publisherId: number; publisherName: string; publisherColor: string }>
  workTypes: Map<number, { id: number; name: string }>
} {
  const publishers = new Map<number, { id: number; name: string; color: string }>()
  const franchises = new Map<number, { id: number; name: string; color: string; publisherId: number; publisherName: string; publisherColor: string }>()
  const series = new Map<number, { id: number; name: string; color: string; franchiseId: number; franchiseName: string; franchiseColor: string; publisherId: number; publisherName: string; publisherColor: string }>()
  const workTypes = new Map<number, { id: number; name: string }>()

  for (const work of works) {
    if (work.publisher && !publishers.has(work.publisher.id)) {
      publishers.set(work.publisher.id, {
        id: work.publisher.id,
        name: work.publisher.name,
        color: work.publisher.color,
      })
    }

    if (work.franchise && work.publisher && !franchises.has(work.franchise.id)) {
      franchises.set(work.franchise.id, {
        id: work.franchise.id,
        name: work.franchise.name,
        color: work.franchise.color,
        publisherId: work.publisher.id,
        publisherName: work.publisher.name,
        publisherColor: work.publisher.color,
      })
    }

    if (work.series && work.franchise && work.publisher && !series.has(work.series.id)) {
      series.set(work.series.id, {
        id: work.series.id,
        name: work.series.name,
        color: work.series.color,
        franchiseId: work.franchise.id,
        franchiseName: work.franchise.name,
        franchiseColor: work.franchise.color,
        publisherId: work.publisher.id,
        publisherName: work.publisher.name,
        publisherColor: work.publisher.color,
      })
    }

    if (work.workTypeId != null && !workTypes.has(work.workTypeId)) {
      workTypes.set(work.workTypeId, {
        id: work.workTypeId,
        name: work.workTypeName,
      })
    }
  }

  return { publishers, franchises, series, workTypes }
}
