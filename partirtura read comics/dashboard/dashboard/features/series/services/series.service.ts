import { apiClient, API_BASE_URL } from '@/infrastructure/api/client/api-client'
import { getAccessToken } from '@/features/authentication/services/auth-interceptor'
import type { SeriesListResponse, SeriesDetailDto, FranchiseListResponseForSelect } from '@/types/series'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'name',
  franchise: 'franchise',
  publisher: 'publisher',
  country: 'country',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getSeries(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  publisherId?: number
  franchiseId?: number
  isActive?: boolean
  isFeatured?: boolean
  isOngoing?: boolean
}): Promise<SeriesListResponse> {
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

  if (params.publisherId !== undefined) {
    searchParams.set('publisherId', String(params.publisherId))
  }

  if (params.franchiseId !== undefined) {
    searchParams.set('franchiseId', String(params.franchiseId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.isFeatured !== undefined) {
    searchParams.set('isFeatured', String(params.isFeatured))
  }

  if (params.isOngoing !== undefined) {
    searchParams.set('isOngoing', String(params.isOngoing))
  }

  return apiClient<SeriesListResponse>(`/admin-series?${searchParams.toString()}`)
}

export async function getSeriesById(seriesId: number): Promise<SeriesDetailDto> {
  return apiClient<SeriesDetailDto>(`/admin-series/${seriesId}`)
}

export async function createSeries(formData: FormData): Promise<SeriesDetailDto> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-series`

  const response = await fetch(url, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = response.statusText
    let errorCode = response.status

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const errorData = (await response.json()) as { success: false; message: string; code: number; payload: null }
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // Keep default statusText if parsing fails
      }
    }

    const error = new Error(errorMessage) as Error & { status: number; code: number }
    error.status = response.status
    error.code = errorCode
    error.message = errorMessage
    throw error
  }

  return response.json()
}

export async function updateSeries(
  seriesId: number,
  formData: FormData,
): Promise<SeriesDetailDto> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-series/${seriesId}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = response.statusText
    let errorCode = response.status

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const errorData = (await response.json()) as { success: false; message: string; code: number; payload: null }
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // Keep default statusText if parsing fails
      }
    }

    const error = new Error(errorMessage) as Error & { status: number; code: number }
    error.status = response.status
    error.code = errorCode
    error.message = errorMessage
    throw error
  }

  return response.json()
}

export async function deactivateSeries(seriesId: number): Promise<void> {
  return apiClient<void>(`/admin-series/${seriesId}/deactivate`, {
    method: 'PATCH',
  })
}

export async function activateSeries(seriesId: number): Promise<void> {
  return apiClient<void>(`/admin-series/${seriesId}/activate`, {
    method: 'PATCH',
  })
}

export async function getFranchisesForSelect(params: {
  currentPage?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}): Promise<FranchiseListResponseForSelect> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 10))

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  return apiClient<FranchiseListResponseForSelect>(`/admin-franchises?${searchParams.toString()}`)
}
