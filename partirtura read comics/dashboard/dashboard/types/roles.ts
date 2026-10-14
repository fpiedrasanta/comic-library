export interface Role {
  id: number
  name: string
  isActive: boolean
}

export interface RoleListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: Role[]
}

export interface CreateRoleResponse {
  id: number
  name: string
  isActive: boolean
}
