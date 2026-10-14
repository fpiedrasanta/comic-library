import { apiClient } from '@/infrastructure/api/client/api-client'
import type { BanListResponse, Ban } from '@/types/ban'
import type { UserListResponse } from '@/types/auth'

const ORDER_BY_MAP: Record<string, string> = {
  createdAt: 'CreatedAt',
  firstName: 'FirstName',
  lastName: 'LastName',
  email: 'Email',
  startDate: 'StartDate',
  endDate: 'EndDate',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export function toUtcDate(localDateTime: string): string {
  const date = new Date(localDateTime)
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return utcDate.toISOString().split('T')[0]
}

export async function getBans(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}): Promise<BanListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 48))

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.startDate) {
    searchParams.set('startDate', params.startDate)
  }

  if (params.endDate) {
    searchParams.set('endDate', params.endDate)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  return apiClient<BanListResponse>(`/bans?${searchParams.toString()}`)
}

export async function createBan(payload: {
  userId: number
  startDate: string
  endDate?: string | null
  reason: string
}): Promise<{ id: number }> {
  return apiClient<{ id: number }>('/bans', {
    method: 'POST',
    body: JSON.stringify({
      userId: payload.userId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    }),
  })
}

export async function updateBan(
  banId: number,
  payload: {
    startDate: string
    endDate?: string | null
    reason: string
  }
): Promise<void> {
  return apiClient<void>(`/bans/${banId}`, {
    method: 'PUT',
    body: JSON.stringify({
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    }),
  })
}

export async function getBanById(banId: number): Promise<Ban> {
  return apiClient<Ban>(`/bans/${banId}`)
}

export async function deactivateBan(banId: number): Promise<void> {
  return apiClient<void>(`/bans/${banId}/deactivate`, {
    method: 'PATCH',
  })
}


const USERS_ORDER_BY_MAP: Record<string, string> = {
  createdAt: 'CreatedAt',
  firstName: 'FirstName',
  lastName: 'LastName',
  email: 'Email',
}

const USERS_ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getActiveUsersForBan(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
}): Promise<UserListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 48))
  if (params.orderBy) searchParams.set('orderBy', USERS_ORDER_BY_MAP[params.orderBy] ?? params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', USERS_ORDER_DIR_MAP[params.orderDir] ?? params.orderDir)
  if (params.search) searchParams.set('search', params.search)

  return apiClient<UserListResponse>(`/users/active-for-ban?${searchParams.toString()}`)
}
