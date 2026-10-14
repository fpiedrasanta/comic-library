export interface Person {
  id: number
  name: string
  isActive: boolean
}

export interface PersonListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: Person[]
}

export interface CreatePersonResponse {
  id: number
  name: string
  isActive: boolean
}
