export interface FranchiseListItemDto {
  id: number
  name: string
  publisherName: string
  publisherCountryName: string
  imageId: number
  color: string
  isFeatured: boolean
  isOngoing: boolean
  isActive: boolean
}

export interface FranchiseDetailDto {
  id: number
  name: string
  description: string
  publisherId: number
  publisherName: string
  publisherCountryName: string
  imageId: number
  color: string
  isFeatured: boolean
  isOngoing: boolean
  isActive: boolean
}

export interface FranchiseListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: FranchiseListItemDto[]
}
