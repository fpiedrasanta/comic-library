import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { CatalogFilterListResponse, WorkCatalogItemDto } from '../types/works'

export interface GetCatalogWorksParams {
  currentPage?: number
  pageSize?: number
  search?: string
  publisherId?: number
  franchiseId?: number
  seriesId?: number
  workTypeId?: number
  /** Only the favorites of the authenticated user when `true`. */
  isFavorite?: boolean
  orderBy?: string
  orderDir?: string
}

/**
 * `GET /api/works`.
 * Public catalog listing of works with filters, search, sorting and pagination.
 */
export async function getCatalogWorks(
  params: GetCatalogWorksParams = {},
): Promise<CatalogFilterListResponse<WorkCatalogItemDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.publisherId !== undefined && params.publisherId !== null) searchParams.set('publisherId', String(params.publisherId))
  if (params.franchiseId !== undefined && params.franchiseId !== null) searchParams.set('franchiseId', String(params.franchiseId))
  if (params.seriesId !== undefined && params.seriesId !== null) searchParams.set('seriesId', String(params.seriesId))
  if (params.workTypeId !== undefined && params.workTypeId !== null) searchParams.set('workTypeId', String(params.workTypeId))
  if (params.isFavorite !== undefined) searchParams.set('isFavorite', String(params.isFavorite))
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)

  const query = searchParams.toString()
  const endpoint = `/works${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<WorkCatalogItemDto>>(endpoint)
}