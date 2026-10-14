import type { ApiError } from '@/types/api'
import { getAccessToken, clearAccessToken } from '@/infrastructure/auth/token-storage'
import { authenticationRepository } from '@/features/authentication/api'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

let refreshPromise: Promise<void> | null = null

async function refreshSession(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const payload = await authenticationRepository.refreshToken()
      const token = payload.accessToken

      if (typeof token === 'string') {
        const { storeAccessToken } = await import('@/infrastructure/auth/token-storage')
        storeAccessToken(token)
      }
    } catch {
      clearAccessToken()
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function isSuccessResponse(data: unknown): data is { success: boolean; payload: unknown } {
  return typeof data === 'object' && data !== null && 'success' in data && (data as { success: boolean }).success
}

function normalizeApiError(response: Response, json: unknown): ApiError {
  if (isSuccessResponse(json)) {
    const normalized = json as {
      message?: string
      code?: number
      payload?: unknown
    }

    const error = new Error(normalized.message ?? response.statusText) as ApiError
    error.status = response.status
    if (typeof normalized.code === 'number') {
      error.code = normalized.code
    }
    error.message = normalized.message ?? response.statusText
    if (normalized.payload !== undefined) {
      error.payload = normalized.payload as ApiError['payload']
    }
    return error
  }

  if (
    typeof json === 'object' &&
    json !== null &&
    'success' in json &&
    !(json as { success: boolean }).success
  ) {
    const normalized = json as {
      success: boolean
      message: string
      code: number
      payload: unknown
    }

    const error = new Error(normalized.message) as ApiError
    error.status = normalized.code
    error.code = normalized.code
    error.message = normalized.message
    error.payload = normalized.payload as ApiError['payload']
    return error
  }

  if (typeof json === 'object' && json !== null && 'errors' in json) {
    const validationError = json as {
      title?: string
      status?: number
      errors?: Record<string, string[]>
    }

    const messages = Object.values(validationError.errors ?? {}).flat()
    const message = messages[0] ?? validationError.title ?? response.statusText

    const error = new Error(message) as ApiError
    error.status = validationError.status ?? response.status
    error.code = response.status
    error.message = message
    error.payload = {
      errors: validationError.errors
        ? Object.entries(validationError.errors).map(([field, messages]) => ({
            field,
            message: messages[0] ?? '',
          }))
        : undefined,
    }
    return error
  }

  const error = new Error(response.statusText) as ApiError
  error.status = response.status
  error.code = response.status
  error.message = response.statusText
  return error
}

async function executeRequest(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  }

  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
    credentials: 'include',
  })

  if (response.status === 401 && endpoint !== '/users/refresh-token') {
    await refreshSession()

    const newToken = getAccessToken()
    if (!newToken) {
      return response
    }

    const retryHeaders: Record<string, string> = {
      Authorization: `Bearer ${newToken}`,
    }

    if (!(options?.body instanceof FormData)) {
      retryHeaders['Content-Type'] = 'application/json'
    }

    return fetch(url, {
      ...options,
      headers: { ...retryHeaders, ...options?.headers },
      credentials: 'include',
    })
  }

  return response
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await executeRequest(endpoint, options)
  const json = await response.json()

  if (!response.ok || !isSuccessResponse(json)) {
    throw normalizeApiError(response, json)
  }

  return json.payload as T
}

export async function fetchApiBlob(endpoint: string, options?: RequestInit): Promise<Blob> {
  const response = await executeRequest(endpoint, options)

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw normalizeApiError(response, json)
  }

  return response.blob()
}

export { API_BASE_URL }
