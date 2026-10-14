import { apiClient, API_BASE_URL } from '@/infrastructure/api/client/api-client'
import { getAccessToken } from '@/features/authentication/services/auth-interceptor'
import type { AdminUserListResponse, CreateAdminResponse, AdminUserListItem } from '@/types/auth'

const ORDER_BY_MAP: Record<string, string> = {
  createdAt: 'CreatedAt',
  firstName: 'FirstName',
  lastName: 'LastName',
  email: 'Email',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

export async function getAdmins(params: {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
}): Promise<AdminUserListResponse> {
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

  return apiClient<AdminUserListResponse>(`/admin-users?${searchParams.toString()}`)
}

export async function createAdmin(formData: FormData): Promise<CreateAdminResponse> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-users`

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

export async function updateAdmin(
  userId: number,
  formData: FormData
): Promise<void> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-users/${userId}`

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

export async function deactivateAdmin(userId: number): Promise<void> {
  return apiClient<void>(`/admin-users/${userId}/deactivate`, {
    method: 'PATCH',
  })
}

export async function activateAdmin(userId: number): Promise<void> {
  return apiClient<void>(`/admin-users/${userId}/activate`, {
    method: 'PATCH',
  })
}

export async function getAdminById(userId: number): Promise<AdminUserListItem> {
  return apiClient<AdminUserListItem>(`/admin-users/${userId}`)
}
