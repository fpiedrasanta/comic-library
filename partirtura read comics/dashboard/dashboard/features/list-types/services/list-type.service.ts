import { apiClient } from '@/infrastructure/api/client/api-client'
import type { ListTypeListResponse, CreateListTypeResponse } from '../types/list-type'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  createdAt: 'CreatedAt',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getListTypes(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
}): Promise<ListTypeListResponse> {
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

  return apiClient<ListTypeListResponse>(`/admin-list-types?${searchParams.toString()}`)
}

export async function createListType(payload: { name: string }): Promise<CreateListTypeResponse> {
  return apiClient<CreateListTypeResponse>('/admin-list-types', {
    method: 'POST',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function updateListType(
  listTypeId: number,
  payload: { name: string },
): Promise<void> {
  return apiClient<void>(`/admin-list-types/${listTypeId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function deactivateListType(listTypeId: number): Promise<void> {
  return apiClient<void>(`/admin-list-types/${listTypeId}/deactivate`, {
    method: 'POST',
  })
}

export async function activateListType(listTypeId: number): Promise<void> {
  return apiClient<void>(`/admin-list-types/${listTypeId}/activate`, {
    method: 'POST',
  })
}
