import type { ApiError, ApiResponse } from '@/types/api'
import { getAccessToken, refreshAccessToken } from '@/features/authentication/services/auth-interceptor'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5131/api'

const REFRESH_TOKEN_ENDPOINT = 'users/refresh-token'

function isRefreshTokenEndpoint(endpoint: string): boolean {
  return endpoint.replace(/^\//, '') === REFRESH_TOKEN_ENDPOINT
}

type ApiErrorHandler = (message: string, code: number, status: number) => void
const apiErrorHandlers: Set<ApiErrorHandler> = new Set()

export function onApiError(handler: ApiErrorHandler): () => void {
  apiErrorHandlers.add(handler)
  return () => apiErrorHandlers.delete(handler)
}

function notifyApiError(message: string, code: number, status: number) {
  apiErrorHandlers.forEach((handler) => handler(message, code, status))
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')

  if (!response.ok) {
    let errorMessage = response.statusText
    let errorCode = response.status

    if (contentType?.includes('application/json')) {
      try {
        const errorData = (await response.json()) as ApiResponse<null>
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // Keep default statusText if parsing fails
      }
    }

    notifyApiError(errorMessage, errorCode, response.status)

    const error = new Error(errorMessage) as ApiError
    error.status = response.status
    error.code = errorCode
    error.message = errorMessage
    throw error
  }

  if (contentType?.includes('application/json')) {
    const data = (await response.json()) as ApiResponse<T>
    if (data.success === false) {
      const errorMessage = data.message || 'Error en la respuesta del servidor'
      const errorCode = data.code || 0
      notifyApiError(errorMessage, errorCode, response.status)
      const error = new Error(errorMessage) as ApiError
      error.status = response.status
      error.code = errorCode
      error.message = errorMessage
      throw error
    }
    return data.payload
  }

  return response as unknown as T
}

async function makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const accessToken = getAccessToken()

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers,
    },
  })

  return handleResponse<T>(response)
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    return await makeRequest<T>(endpoint, options)
  } catch (error) {
    const apiError = error as ApiError

    if (apiError.status === 401 && !isRefreshTokenEndpoint(endpoint)) {
      try {
        const newToken = await refreshAccessToken()
        if (newToken) {
          const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
          const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
              ...options?.headers,
            },
          })
          return handleResponse<T>(response)
        }
      } catch {
        // Refresh failed, redirect to login
      }

      window.location.href = '/login'
      throw new Error('Session expired. Redirecting to login.')
    }

    throw error
  }
}

export async function apiClientBlob(endpoint: string, options?: RequestInit): Promise<Blob> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const accessToken = getAccessToken()

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = response.statusText
    let errorCode = response.status

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const errorData = (await response.json()) as ApiResponse<null>
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // Keep default statusText if parsing fails
      }
    }

    notifyApiError(errorMessage, errorCode, response.status)

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Session expired. Redirecting to login.')
    }

    const error = new Error(errorMessage) as ApiError
    error.status = response.status
    error.code = errorCode
    error.message = errorMessage
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    const data = (await response.json()) as ApiResponse<Blob>
    if (data.success === false) {
      const errorMessage = data.message || 'Error en la respuesta del servidor'
      const errorCode = data.code || 0
      notifyApiError(errorMessage, errorCode, response.status)
      const error = new Error(errorMessage) as ApiError
      error.status = response.status
      error.code = errorCode
      error.message = errorMessage
      throw error
    }
    return data.payload
  }

  return response.blob()
}

export { API_BASE_URL }
