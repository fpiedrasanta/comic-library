import type { ListResponse } from '@/types/api'
import type { MyReadingProgressDto } from './work-detail'

export interface WorkCatalogNodeDto {
  id: number
  name: string
  color: string
}

export interface WorkCatalogItemDto {
  id: number
  workTypeId: number
  workTypeName: string
  title: string
  description: string
  numberValue: string | null
  publicationDate: string
  createdAt: string
  coverId: number
  urlCover: string
  series: WorkCatalogNodeDto | null
  franchise: WorkCatalogNodeDto | null
  publisher: WorkCatalogNodeDto | null
  /**
   * Average rating of the work, `null` when it has no active ratings. Present in
   * every listing (`GET /api/works`, recommended, reading history) since
   * TASK-API-0300.
   */
  averageRating: number | null
  /**
   * Reading progress of the authenticated user, from `GET /api/works`.
   * Optional because the endpoints that build this DTO for other contexts
   * (list details, for example) do not expose it.
   */
  myReadingProgress?: MyReadingProgressDto | null
  /**
   * Whether the work is a favorite of the authenticated user. The backend
   * resolves it for the catalog, the reading history and the recommended
   * works, so the star never needs a query of its own.
   */
  isFavorite: boolean
}

export type WorkCatalogListResponse = ListResponse<WorkCatalogItemDto>

/**
 * States of the reading history filter (`GET /api/users/me/reading-history`).
 * The backend treats any unknown value as `all`, so the filter never has to
 * validate before calling.
 */
export type ReadingHistoryState = 'reading' | 'completed' | 'all'

/**
 * Ordering criteria of `GET /api/works/recommended`. Any other value is rejected
 * by the backend with 422, so the frontend never sends one.
 */
export type RecommendedSortField = 'MostPopular' | 'RecentlyAdded' | 'MostRated'

export type WorkSortField = 'Title' | 'PublicationDate' | 'CreatedAt' | 'Number'
export type WorkSortDirection = 'asc' | 'desc'
export type WorkTypeFilter = 'ALL' | number

export interface CatalogFilters {
  search: string
  publisherId: number | null
  franchiseId: number | null
  seriesId: number | null
  workTypeId: WorkTypeFilter
}

export interface CatalogSort {
  field: WorkSortField
  direction: WorkSortDirection
}

export interface PublisherNode {
  id: number
  name: string
  color: string
}

export interface FranchiseNode {
  id: number
  name: string
  color: string
  /**
   * A franchise cannot exist without a publisher: the FK is required and
   * restricts deletion. The DTO still types it nullable, so the node is only
   * built once an id actually comes back.
   */
  publisherId: number
  publisherName: string
  publisherColor: string
}

export interface SeriesNode {
  id: number
  name: string
  color: string
  franchiseId: number
  franchiseName: string
  publisherId: number
  publisherName: string
}

export interface EntityNodeDto {
  id: number
  name: string
  /** Nullable when the entity has no stored color. */
  color?: string | null
}

export interface SeriesDetailDto {
  id: number
  name: string
  description: string | null
  color: string | null
  urlImage: string | null
  franchise: EntityNodeDto | null
  publisher: EntityNodeDto | null
}

export interface PublisherFilterDto {
  id: number
  name: string
  color: string
}

export interface PublisherDetailDto {
  id: number
  name: string
  color: string | null
  urlImage: string | null
  countryName: string | null
  foundedYear: number | null
  website: string | null
  description: string | null
  history: string | null
}

export interface FranchiseDetailDto {
  id: number
  name: string
  description: string | null
  color: string | null
  urlImage: string | null
  publisherId: number | null
  publisherName: string | null
  publisherColor: string | null
}

export interface FranchiseFilterDto {
  id: number
  name: string
  color: string
  publisherId: number | null
  publisherName: string | null
}

export interface SeriesFilterDto {
  id: number
  name: string
  color: string
  franchiseId: number | null
  franchiseName: string | null
  publisherId: number | null
  publisherName: string | null
}

export interface WorkTypeFilterDto {
  id: number
  name: string
}

export interface CatalogFilterListResponse<T> {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: T[]
}

export interface EntityOption {
  id: number
  name: string
  color?: string
  context?: string
  secondaryContext?: string
  publisherId?: number
  franchiseId?: number
}

export interface EntityChainSelection {
  publisherId?: number
  franchiseId?: number
  seriesId?: number
}

export type HierarchyLevel = 'publisher' | 'franchise' | 'series'

export type CatalogFilterOption =
  | ({ type: 'publisher' } & PublisherFilterDto)
  | ({ type: 'franchise' } & FranchiseFilterDto)
  | ({ type: 'series' } & SeriesFilterDto)
  | ({ type: 'workType' } & WorkTypeFilterDto)
