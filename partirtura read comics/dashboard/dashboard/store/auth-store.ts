import type { User } from '@/types/auth'
import { create } from 'zustand'

export interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAccessToken: (token: string | null) => void
  setUser: (user: User | null) => void
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (token, user) => {
    set({ accessToken: token, user, isAuthenticated: true })
  },
  logout: () => {
    set({ accessToken: null, user: null, isAuthenticated: false })
  },
}))
