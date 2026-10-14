import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { CountryDto, ListResponse } from '@/types/api'

export interface GetCountriesRequest {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
}

export class CountryRepository {
  async getPaged(request: GetCountriesRequest): Promise<ListResponse<CountryDto>> {
    const params = new URLSearchParams({
      currentPage: String(request.currentPage ?? 1),
      pageSize: String(request.pageSize ?? 12),
    })

    if (request.orderBy) {
      params.append('orderBy', request.orderBy)
    }
    if (request.orderDir) {
      params.append('orderDir', request.orderDir)
    }
    if (request.search) {
      params.append('search', request.search)
    }

    return fetchApi<ListResponse<CountryDto>>(`/countries?${params.toString()}`)
  }
}

export const countryRepository = new CountryRepository()
