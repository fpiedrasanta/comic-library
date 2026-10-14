import { apiClient } from '@/infrastructure/api/client/api-client'
import type { RoleListResponse, CreateRoleResponse } from '@/types/roles'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  createdAt: 'CreatedAt',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getRoles(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
}): Promise<RoleListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

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

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  return apiClient<RoleListResponse>(`/admin-roles?${searchParams.toString()}`)
}

export async function createRole(payload: {
  name: string
}): Promise<CreateRoleResponse> {
  return apiClient<CreateRoleResponse>('/admin-roles', {
    method: 'POST',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function updateRole(
  roleId: number,
  payload: { name: string },
): Promise<void> {
  return apiClient<void>(`/admin-roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function deactivateRole(roleId: number): Promise<void> {
  return apiClient<void>(`/admin-roles/${roleId}/deactivate`, {
    method: 'POST',
  })
}

export async function activateRole(roleId: number): Promise<void> {
  return apiClient<void>(`/admin-roles/${roleId}/activate`, {
    method: 'POST',
  })
}
