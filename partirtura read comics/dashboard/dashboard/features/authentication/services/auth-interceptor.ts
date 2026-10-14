import { useAuthStore } from '@/store/auth-store'
import { authService } from './auth.service'

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await authService.refreshToken()
    useAuthStore.getState().setAccessToken(response.accessToken)
    return response.accessToken
  } catch {
    useAuthStore.getState().logout()
    return null
  }
}
