import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { RecommendedSortField, WorkCatalogItemDto } from '../types/works'

export interface GetRecommendedWorksParams {
  sortBy?: RecommendedSortField
}

/**
 * `GET /api/works/recommended`.
 * Up to 12 works the authenticated user has not started, ordered by the requested
 * criterion. Selection, metrics and ordering are resolved by the backend; the list
 * is never filtered or reordered here.
 */
export function getRecommendedWorks(
  params: GetRecommendedWorksParams = {},
): Promise<WorkCatalogItemDto[]> {
  const searchParams = new URLSearchParams()

  if (params.sortBy) searchParams.set('sortBy', params.sortBy)

  const query = searchParams.toString()
  const endpoint = `/works/recommended${query ? `?${query}` : ''}`

  return fetchApi<WorkCatalogItemDto[]>(endpoint)
}
