export interface ListType {
  id: number
  name: string
  isActive: boolean
}

export interface ListTypeListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: ListType[]
}

export interface CreateListTypeResponse {
  id: number
  name: string
}
