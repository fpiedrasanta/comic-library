import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const [isInitializing, setIsInitializing] = useState(true)
  const { setAccessToken, setUser, logout } = useAuthStore()

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authService.refreshToken()
        setAccessToken(response.accessToken)
        const user = await authService.getProfile()
        setUser(user)
      } catch {
        logout()
      } finally {
        setIsInitializing(false)
      }
    }

    restoreSession()
  }, [setAccessToken, setUser, logout])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    useAuthStore.getState().login(response.accessToken, {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      firstName: response.fullName.split(' ')[0],
      lastName: response.fullName.split(' ').slice(1).join(' ') || '',
      role: response.role,
      avatarUrl: null,
      countryId: null,
      countryName: null,
    })
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Continue with logout even if API call fails
    } finally {
      logout()
    }
  }

  return {
    user: useAuthStore.getState().user,
    isAuthenticated: useAuthStore.getState().isAuthenticated,
    isLoading: isInitializing,
    login,
    logout: handleLogout,
  }
}
