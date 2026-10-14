import { apiClient, API_BASE_URL } from '@/infrastructure/api/client/api-client'
import { getAccessToken } from '@/features/authentication/services/auth-interceptor'
import type {
  PublisherListResponse,
  CreatePublisherResponse,
  AdminPublisherDetailDto,
} from '@/types/publisher'

const ORDER_BY_MAP: Record<string, string> = {
  name: 'Name',
  country: 'Country',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getPublishers(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  isActive?: boolean
  isFeatured?: boolean
  isAlive?: boolean
}): Promise<PublisherListResponse> {
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

  if (params.isFeatured !== undefined) {
    searchParams.set('isFeatured', String(params.isFeatured))
  }

  if (params.isAlive !== undefined) {
    searchParams.set('isAlive', String(params.isAlive))
  }

  return apiClient<PublisherListResponse>(`/admin-publishers?${searchParams.toString()}`)
}

export async function getPublisher(publisherId: number): Promise<AdminPublisherDetailDto> {
  return apiClient<AdminPublisherDetailDto>(`/admin-publishers/${publisherId}`)
}

export async function createPublisher(formData: FormData): Promise<CreatePublisherResponse> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-publishers`

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

export async function updatePublisher(
  publisherId: number,
  formData: FormData
): Promise<void> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-publishers/${publisherId}`

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
}

export async function deactivatePublisher(publisherId: number): Promise<void> {
  return apiClient<void>(`/admin-publishers/${publisherId}/deactivate`, {
    method: 'PATCH',
  })
}

export async function activatePublisher(publisherId: number): Promise<void> {
  return apiClient<void>(`/admin-publishers/${publisherId}/activate`, {
    method: 'PATCH',
  })
}
