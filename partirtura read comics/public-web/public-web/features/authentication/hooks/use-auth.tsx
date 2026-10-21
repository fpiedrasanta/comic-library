import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authenticationRepository } from '@/features/authentication/api'
import {
  storeAccessToken,
  clearAccessToken,
  onSessionExpired,
} from '@/infrastructure/auth/token-storage'
import type { AuthResponse } from '@/types/api'

export type AuthState = 'initializing' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  authState: AuthState
  user: {
    userId: number
    email: string
    fullName: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    countryId: number | null
    countryName: string | null
  } | null
  role: string | null
  login: (payload: AuthResponse) => void
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>('initializing')
  const [user, setUser] = useState<{
    userId: number
    email: string
    fullName: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    countryId: number | null
    countryName: string | null
  } | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const loadProfile = async () => {
    try {
      const profile = await authenticationRepository.getProfile()
      setUser({
        userId: profile.id,
        email: profile.email,
        fullName: `${profile.firstName} ${profile.lastName}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        countryId: profile.countryId,
        countryName: profile.countryName,
      })
    } catch {
      // Mantener datos existentes si el perfil no puede cargarse
    }
  }

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const payload = await authenticationRepository.refreshToken()

        if (!isMounted) return

        storeAccessToken(payload.accessToken)
        setUser({
          userId: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          firstName: payload.fullName.split(' ')[0] || payload.fullName,
          lastName: payload.fullName.split(' ').slice(1).join(' ') || '',
          avatarUrl: null,
          countryId: null,
          countryName: null,
        })
        setRole(payload.role)
        setAuthState('authenticated')

        if (isMounted) {
          loadProfile()
        }
      } catch {
        if (!isMounted) return

        clearAccessToken()
        setUser(null)
        setRole(null)
        setAuthState('unauthenticated')
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return onSessionExpired(() => {
      clearAccessToken()
      setUser(null)
      setRole(null)
      setAuthState('unauthenticated')
    })
  }, [])

  const login = (payload: AuthResponse) => {
    storeAccessToken(payload.accessToken)
    setUser({
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      firstName: payload.fullName.split(' ')[0] || payload.fullName,
      lastName: payload.fullName.split(' ').slice(1).join(' ') || '',
      avatarUrl: null,
      countryId: null,
      countryName: null,
    })
    setRole(payload.role)
    setAuthState('authenticated')

    loadProfile()
  }

  const logout = async () => {
    try {
      await authenticationRepository.logout()
    } catch {
      // Swallow logout errors to ensure local state is always cleared
    } finally {
      clearAccessToken()
      setUser(null)
      setRole(null)
      setAuthState('unauthenticated')
    }
  }

  const logoutAll = async () => {
    try {
      await authenticationRepository.logoutAll()
    } catch {
      // Swallow logout errors to ensure local state is always cleared
    } finally {
      clearAccessToken()
      setUser(null)
      setRole(null)
      setAuthState('unauthenticated')
    }
  }

  const refreshProfile = async () => {
    await loadProfile()
  }

  return (
    <AuthContext.Provider value={{ authState, user, role, login, logout, logoutAll, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
