export interface AdminPublisherListItemDto {
  id: number
  name: string
  countryName: string
  color: string
  urlImage: string
  isAlive: boolean
  isFeatured: boolean
  isActive: boolean
  createdAt: string
}

export interface AdminPublisherDetailDto {
  id: number
  name: string
  description: string
  website: string
  countryId: number
  countryName: string
  foundedYear: number
  history: string
  isAlive: boolean
  imageId: number
  urlImage: string
  color: string
  isFeatured: boolean
  isActive: boolean
  createdAt: string
}

export interface PublisherListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: AdminPublisherListItemDto[]
}

export interface CreatePublisherResponse {
  id: number
}

export interface UploadPublisherImageResponse {
  imageId: number
  urlImage: string
}

export interface Publisher {
  id: number
  name: string
  country: string
  color: string
  isFeatured: boolean
  isAlive: boolean
  isActive: boolean
  imageUrl: string | null
  description: string
  website: string | null
  foundedYear: number | null
  history: string
}
