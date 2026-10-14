import { apiClient } from '@/infrastructure/api/client/api-client'
import type { PersonListResponse, CreatePersonResponse, Person } from '@/types/persons'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  createdAt: 'CreatedAt',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getPersons(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
}): Promise<PersonListResponse> {
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

  return apiClient<PersonListResponse>(`/admin-persons?${searchParams.toString()}`)
}

export async function createPerson(payload: {
  name: string
}): Promise<CreatePersonResponse> {
  return apiClient<CreatePersonResponse>('/admin-persons', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
    }),
  })
}

export async function updatePerson(personId: number, payload: {
  name: string
}): Promise<Person> {
  return apiClient<Person>(`/admin-persons/${personId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: payload.name,
    }),
  })
}

export async function deactivatePerson(personId: number): Promise<void> {
  return apiClient<void>(`/admin-persons/${personId}/deactivate`, {
    method: 'POST',
  })
}

export async function activatePerson(personId: number): Promise<void> {
  return apiClient<void>(`/admin-persons/${personId}/activate`, {
    method: 'POST',
  })
}
