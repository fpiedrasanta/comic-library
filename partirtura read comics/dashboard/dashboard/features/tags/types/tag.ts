export interface Tag {
  id: number
  name: string
  isActive: boolean
}

export interface TagListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: Tag[]
}

export interface CreateTagResponse {
  id: number
  name: string
}
