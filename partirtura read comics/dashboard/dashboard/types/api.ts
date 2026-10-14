export interface ApiError extends Error {
  status: number
  code: number
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  code: number
  payload: T
}

export interface ListResponse<T> {
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

export interface ValidationError {
  field: string
  message: string
}
