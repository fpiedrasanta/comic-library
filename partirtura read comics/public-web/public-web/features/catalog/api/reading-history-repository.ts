import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { CatalogFilterListResponse, ReadingHistoryState, WorkCatalogItemDto } from '../types/works'

export interface GetReadingHistoryParams {
  currentPage?: number
  pageSize?: number
  state?: ReadingHistoryState
}

/**
 * `GET /api/users/me/reading-history`.
 * Reading history of the authenticated user, identified from the JWT: the same
 * catalog `WorkCard` contract, with `myReadingProgress` never null.
 */
export function getReadingHistory(
  params: GetReadingHistoryParams = {},
): Promise<CatalogFilterListResponse<WorkCatalogItemDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.state !== undefined) searchParams.set('state', params.state)

  const query = searchParams.toString()
  const endpoint = `/users/me/reading-history${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<WorkCatalogItemDto>>(endpoint)
}
