import { fetchApi } from '@/infrastructure/api/client/api-client'
import type {
  PublisherFilterDto,
  PublisherDetailDto,
  FranchiseFilterDto,
  FranchiseDetailDto,
  SeriesFilterDto,
  SeriesDetailDto,
  WorkTypeFilterDto,
  CatalogFilterListResponse,
} from '../types/works'

export interface GetPublishersParams {
  currentPage?: number
  pageSize?: number
  search?: string
  orderBy?: string
  orderDir?: string
}

export async function getPublishers(params: GetPublishersParams = {}): Promise<CatalogFilterListResponse<PublisherFilterDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)

  const query = searchParams.toString()
  const endpoint = `/publishers${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<PublisherFilterDto>>(endpoint)
}

export async function getPublisherDetail(id: number): Promise<PublisherDetailDto> {
  return fetchApi<PublisherDetailDto>(`/publishers/${id}`)
}

export interface GetFranchisesParams {
  currentPage?: number
  pageSize?: number
  search?: string
  orderBy?: string
  orderDir?: string
  publisherId?: number
}

export async function getFranchises(params: GetFranchisesParams = {}): Promise<CatalogFilterListResponse<FranchiseFilterDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)
  if (params.publisherId !== undefined && params.publisherId !== null) searchParams.set('publisherId', String(params.publisherId))

  const query = searchParams.toString()
  const endpoint = `/franchises${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<FranchiseFilterDto>>(endpoint)
}

export async function getFranchiseDetail(id: number): Promise<FranchiseDetailDto> {
  return fetchApi<FranchiseDetailDto>(`/franchises/${id}`)
}

export interface GetSeriesParams {
  currentPage?: number
  pageSize?: number
  search?: string
  orderBy?: string
  orderDir?: string
  franchiseId?: number
  publisherId?: number
}

export async function getSeries(params: GetSeriesParams = {}): Promise<CatalogFilterListResponse<SeriesFilterDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)
  if (params.franchiseId !== undefined && params.franchiseId !== null) searchParams.set('franchiseId', String(params.franchiseId))
  if (params.publisherId !== undefined && params.publisherId !== null) searchParams.set('publisherId', String(params.publisherId))

  const query = searchParams.toString()
  const endpoint = `/series${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<SeriesFilterDto>>(endpoint)
}

export async function getSeriesDetail(id: number): Promise<SeriesDetailDto> {
  return fetchApi<SeriesDetailDto>(`/series/${id}`)
}

export interface GetWorkTypesParams {
  currentPage?: number
  pageSize?: number
  search?: string
  orderBy?: string
  orderDir?: string
}

export async function getWorkTypes(params: GetWorkTypesParams = {}): Promise<CatalogFilterListResponse<WorkTypeFilterDto>> {
  const searchParams = new URLSearchParams()

  if (params.currentPage !== undefined) searchParams.set('currentPage', String(params.currentPage))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)

  const query = searchParams.toString()
  const endpoint = `/work-types${query ? `?${query}` : ''}`

  return fetchApi<CatalogFilterListResponse<WorkTypeFilterDto>>(endpoint)
}
