import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { CatalogCardListResponse } from '../types/entity-cards'
import type { CatalogListCardDto, CatalogListDetailDto } from '../types/lists'
import type { EntityOption } from '../types/works'

/** The two orderings the endpoint accepts. */
export type CatalogListOrderBy = 'name' | 'createdat'
export type CatalogListOrderDir = 'ASC' | 'DESC'

export interface GetCatalogListsParams {
  currentPage?: number
  pageSize?: number
  search?: string
  publisherId?: number
  franchiseId?: number
  seriesId?: number
  listTypeId?: number
  /**
   * Only the personal lists of the authenticated user when `true`. Any other
   * value keeps the lists of the system, which is the previous behavior.
   */
  myLists?: boolean
  orderBy?: CatalogListOrderBy
  orderDir?: CatalogListOrderDir
}

/**
 * `GET /api/catalog/lists`.
 *
 * The search matches the list name or its description, and the
 * hierarchical filters match lists that contain at least one work of
 * the given publisher, franchise or series. All of them combine with
 * `AND`, and so does the search.
 *
 * `myLists=true` returns the personal lists of the authenticated user
 * instead of the lists of the system.
 *
 * No `orderBy`/`orderDir` is sent by the client: the ordering of the
 * listing is a rule of the use case and the endpoint defaults to
 * `CreatedAt DESC`.
 */
export function getCatalogLists(
  params: GetCatalogListsParams = {},
): Promise<CatalogCardListResponse<CatalogListCardDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.publisherId !== undefined) searchParams.set('publisherId', String(params.publisherId))
  if (params.franchiseId !== undefined) searchParams.set('franchiseId', String(params.franchiseId))
  if (params.seriesId !== undefined) searchParams.set('seriesId', String(params.seriesId))
  if (params.listTypeId !== undefined) searchParams.set('listTypeId', String(params.listTypeId))
  if (params.myLists !== undefined) searchParams.set('myLists', String(params.myLists))
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)

  const query = searchParams.toString()

  return fetchApi(`/catalog/lists${query ? `?${query}` : ''}`)
}

/** `GET /api/list-types`. Returns active list types for the autocomplete. */
export function getListTypes(search?: string, pageSize = 24): Promise<CatalogCardListResponse<EntityOption>> {
  const searchParams = new URLSearchParams()
  if (search) searchParams.set('search', search)
  searchParams.set('pageSize', String(pageSize))
  searchParams.set('orderBy', 'name')
  searchParams.set('orderDir', 'ASC')

  return fetchApi(`/list-types?${searchParams.toString()}`)
}

/** `GET /api/catalog/lists/{id}`. A missing or inactive list is a 404. */
export function getCatalogListDetail(id: number): Promise<CatalogListDetailDto> {
  return fetchApi(`/catalog/lists/${id}`)
}
