export interface SeriesListItemDto {
  id: number
  name: string
  franchiseName: string
  publisherName: string
  publisherCountryName: string
  imageId: number
  urlImage: string
  color: string
  isFeatured: boolean
  isOngoing: boolean
  isActive: boolean
  createdAt: string
}

export interface SeriesDetailDto {
  id: number
  name: string
  description: string | null
  franchiseId: number
  franchiseName: string
  franchiseImageId: number
  franchiseUrlImage: string
  franchiseColor: string
  franchiseIsFeatured: boolean
  franchiseIsOngoing: boolean
  franchiseIsActive: boolean
  publisherId: number | null
  publisherName: string | null
  publisherCountryName: string | null
  imageId: number
  urlImage: string
  color: string
  isFeatured: boolean
  isOngoing: boolean
  isActive: boolean
}

export interface SeriesListResponse {
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  previousPage: number | null
  totalCount: number
  items: SeriesListItemDto[]
}

export interface FranchiseSelectItem {
  id: number
  name: string
  publisherName: string
  imageId: number
  color: string
  isFeatured: boolean
  isOngoing: boolean
  isActive: boolean
}

export interface FranchiseListResponseForSelect {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: FranchiseSelectItem[]
}
