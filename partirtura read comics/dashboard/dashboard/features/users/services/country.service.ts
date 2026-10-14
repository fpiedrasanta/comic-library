import { apiClient } from '@/infrastructure/api/client/api-client'
import type { CountryListResponse, CreateCountryResponse } from '@/types/country'

const ORDER_BY_MAP: Record<string, string> = {
  code: 'Code',
  name: 'Name',
  isActive: 'IsActive',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getCountries(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
}): Promise<CountryListResponse> {
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

  return apiClient<CountryListResponse>(`/admin-countries?${searchParams.toString()}`)
}

export async function createCountry(payload: {
  code: string
  name: string
}): Promise<CreateCountryResponse> {
  return apiClient<CreateCountryResponse>('/admin-countries', {
    method: 'POST',
    body: JSON.stringify({
      code: payload.code,
      name: payload.name,
    }),
  })
}

export async function updateCountry(
  countryId: number,
  payload: {
    code: string
    name: string
  }
): Promise<void> {
  return apiClient<void>(`/admin-countries/${countryId}`, {
    method: 'PUT',
    body: JSON.stringify({
      code: payload.code,
      name: payload.name,
    }),
  })
}

export async function deactivateCountry(countryId: number): Promise<void> {
  return apiClient<void>(`/admin-countries/${countryId}/deactivate`, {
    method: 'PATCH',
  })
}

export async function activateCountry(countryId: number): Promise<void> {
  return apiClient<void>(`/admin-countries/${countryId}/activate`, {
    method: 'PATCH',
  })
}
