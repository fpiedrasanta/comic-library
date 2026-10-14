import { apiClient } from '@/infrastructure/api/client/api-client'
import type { TagListResponse, CreateTagResponse } from '../types/tag'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  createdAt: 'CreatedAt',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getTags(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
}): Promise<TagListResponse> {
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

  return apiClient<TagListResponse>(`/admin-tags?${searchParams.toString()}`)
}

export async function createTag(payload: { name: string }): Promise<CreateTagResponse> {
  return apiClient<CreateTagResponse>('/admin-tags', {
    method: 'POST',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function updateTag(
  tagId: number,
  payload: { name: string },
): Promise<void> {
  return apiClient<void>(`/admin-tags/${tagId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: payload.name }),
  })
}

export async function deactivateTag(tagId: number): Promise<void> {
  return apiClient<void>(`/admin-tags/${tagId}/deactivate`, {
    method: 'POST',
  })
}

export async function activateTag(tagId: number): Promise<void> {
  return apiClient<void>(`/admin-tags/${tagId}/activate`, {
    method: 'POST',
  })
}
