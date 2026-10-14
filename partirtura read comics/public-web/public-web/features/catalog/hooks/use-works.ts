import { useQuery } from '@tanstack/react-query'
import { getCatalogWorks } from '../api'
import type { WorkCatalogItemDto } from '../types/works'

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
  orderBy?: string
  orderDir?: string
}

export function useInfiniteWorks(options: InfiniteWorksOptions = {}) {
  const searchParams = new URLSearchParams()

  searchParams.set('pageSize', String(WORKS_PAGE_SIZE))
  if (options.search) searchParams.set('search', options.search)
  if (options.publisherId !== undefined && options.publisherId !== null) searchParams.set('publisherId', String(options.publisherId))
  if (options.franchiseId !== undefined && options.franchiseId !== null) searchParams.set('franchiseId', String(options.franchiseId))
  if (options.seriesId !== undefined && options.seriesId !== null) searchParams.set('seriesId', String(options.seriesId))
  if (options.workTypeId !== undefined && options.workTypeId !== null) searchParams.set('workTypeId', String(options.workTypeId))
  if (options.orderBy) searchParams.set('orderBy', options.orderBy)
  if (options.orderDir) searchParams.set('orderDir', options.orderDir)

  const baseQueryKey = ['works', Object.fromEntries(searchParams)]

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
