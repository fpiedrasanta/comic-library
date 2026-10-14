import { apiClient } from '@/infrastructure/api/client/api-client'
import type { UserListResponse, UserDetail } from '@/types/auth'

const ORDER_BY_MAP: Record<string, string> = {
  lastName: 'LastName',
  createdAt: 'CreatedAt',
  banCount: 'BanCount',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getUsers(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
  isBanned?: boolean
}): Promise<UserListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))
  if (params.orderBy) searchParams.set('orderBy', ORDER_BY_MAP[params.orderBy] ?? params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', ORDER_DIR_MAP[params.orderDir] ?? params.orderDir)
  if (params.search) searchParams.set('search', params.search)
  if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
  if (params.isBanned !== undefined) searchParams.set('isBanned', String(params.isBanned))

  return apiClient<UserListResponse>(`/users?${searchParams.toString()}`)
}

export async function getUserById(userId: number): Promise<UserDetail> {
  return apiClient<UserDetail>(`/users/${userId}`)
}
