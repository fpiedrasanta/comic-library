import { fetchApi } from '@/infrastructure/api/client/api-client'
import type {
  CatalogCardListResponse,
  CatalogFranchiseCardDto,
  CatalogPublisherCardDto,
  CatalogSeriesCardDto,
} from '../types/entity-cards'

export interface GetCatalogCardsParams {
  currentPage?: number
  search?: string
  pageSize?: number
}

/**
 * The three US-0026 listings live under `/api/catalog/*` and are deliberately
 * separate from `/api/publishers`, `/api/franchises` and `/api/series`, which
 * stay the autocomplete and filter contract of `GET /api/works`.
 *
 * None of them takes `orderBy`/`orderDir`: the ordering is a rule of the use
 * case and is always `Name ASC`.
 */
function catalogPath(entity: string, params: GetCatalogCardsParams): string {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)

  const query = searchParams.toString()

  return `/catalog/${entity}${query ? `?${query}` : ''}`
}

export function getCatalogPublishers(
  params: GetCatalogCardsParams = {},
): Promise<CatalogCardListResponse<CatalogPublisherCardDto>> {
  return fetchApi(catalogPath('publishers', params))
}

export function getCatalogFranchises(
  params: GetCatalogCardsParams = {},
): Promise<CatalogCardListResponse<CatalogFranchiseCardDto>> {
  return fetchApi(catalogPath('franchises', params))
}

export function getCatalogSeries(
  params: GetCatalogCardsParams = {},
): Promise<CatalogCardListResponse<CatalogSeriesCardDto>> {
  return fetchApi(catalogPath('series', params))
}
