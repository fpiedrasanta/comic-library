import { apiClient } from '@/infrastructure/api/client/api-client'
import type {
  WorkListListResponse,
  WorkListDetailDto,
  CreateWorkListRequest,
  UpdateWorkListRequest,
  SearchWorkListResponse,
  SearchWorkParams,
} from '../types/work-list'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  createdAt: 'CreatedAt',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getWorkLists(params: {
  page?: number
  pageSize?: number
  search?: string
  franchiseId?: number
  publisherId?: number
  listTypeId?: number
  isActive?: boolean
  createdAtFrom?: string
  createdAtTo?: string
  orderBy?: string
  orderDir?: string
}): Promise<WorkListListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.franchiseId) {
    searchParams.set('franchiseId', String(params.franchiseId))
  }

  if (params.publisherId) {
    searchParams.set('publisherId', String(params.publisherId))
  }

  if (params.listTypeId) {
    searchParams.set('listTypeId', String(params.listTypeId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.createdAtFrom) {
    searchParams.set('createdAtFrom', params.createdAtFrom)
  }

  if (params.createdAtTo) {
    searchParams.set('createdAtTo', params.createdAtTo)
  }

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDirection', mapped)
  }

  return apiClient<WorkListListResponse>(`/admin-work-lists?${searchParams.toString()}`)
}

export async function getWorkListById(workListId: number): Promise<WorkListDetailDto> {
  return apiClient<WorkListDetailDto>(`/admin-work-lists/${workListId}`)
}

export async function createWorkList(payload: CreateWorkListRequest): Promise<WorkListDetailDto> {
  return apiClient<WorkListDetailDto>('/admin-work-lists', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateWorkList(workListId: number, payload: UpdateWorkListRequest): Promise<WorkListDetailDto> {
  return apiClient<WorkListDetailDto>(`/admin-work-lists/${workListId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateWorkList(workListId: number): Promise<void> {
  return apiClient<void>(`/admin-work-lists/${workListId}`, {
    method: 'DELETE',
  })
}

export async function activateWorkList(workListId: number): Promise<void> {
  return apiClient<void>(`/admin-work-lists/${workListId}/activate`, {
    method: 'POST',
  })
}

export async function searchWorks(params: SearchWorkParams): Promise<SearchWorkListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.languageId) {
    searchParams.set('languageId', String(params.languageId))
  }

  if (params.contentStatus !== undefined) {
    searchParams.set('contentStatus', String(params.contentStatus))
  }

  if (params.publicationDateFrom) {
    searchParams.set('publicationDateFrom', params.publicationDateFrom)
  }

  if (params.publicationDateTo) {
    searchParams.set('publicationDateTo', params.publicationDateTo)
  }

  if (params.orderBy) {
    searchParams.set('orderBy', params.orderBy)
  }

  if (params.orderDir) {
    searchParams.set('orderDir', params.orderDir)
  }

  if (params.franchiseId) {
    searchParams.set('franchiseId', String(params.franchiseId))
  }

  if (params.publisherId) {
    searchParams.set('publisherId', String(params.publisherId))
  }

  if (params.seriesId) {
    searchParams.set('seriesId', String(params.seriesId))
  }

  return apiClient<SearchWorkListResponse>(`/admin-works?${searchParams.toString()}`)
}
