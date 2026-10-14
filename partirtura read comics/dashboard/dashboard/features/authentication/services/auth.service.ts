import { apiClient } from '@/infrastructure/api/client/api-client'
import type {
  AuthResponse,
  User,
  ForgotPasswordResponse,
  ResendPasswordResetCodeResponse,
  ValidatePasswordResetCodeResponse,
  ResetPasswordResponse,
  RequestAccountDeletionResponse,
  ConfirmAccountDeletionResponse,
} from '@/types/auth'

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/users/refresh-token', {
      method: 'POST',
    })
  },

  async logout(): Promise<void> {
    await apiClient<void>('/users/logout', {
      method: 'POST',
    })
  },

  async logoutAll(): Promise<void> {
    await apiClient<void>('/users/logout-all', {
      method: 'POST',
    })
  },

  async getProfile(): Promise<User> {
    return apiClient<User>('/users/me')
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return apiClient<ForgotPasswordResponse>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resendPasswordResetCode(email: string): Promise<ResendPasswordResetCodeResponse> {
    return apiClient<ResendPasswordResetCodeResponse>('/users/resend-password-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async validatePasswordResetCode(email: string, code: string): Promise<ValidatePasswordResetCodeResponse> {
    return apiClient<ValidatePasswordResetCodeResponse>('/users/validate-password-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  },

  async resetPassword(email: string, authorizationToken: string, newPassword: string): Promise<ResetPasswordResponse> {
    return apiClient<ResetPasswordResponse>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, authorizationToken, newPassword }),
    })
  },

  async requestAccountDeletion(): Promise<RequestAccountDeletionResponse> {
    return apiClient<RequestAccountDeletionResponse>('/users/account-deletion/request', {
      method: 'POST',
    })
  },

  async confirmAccountDeletion(code: string): Promise<ConfirmAccountDeletionResponse> {
    return apiClient<ConfirmAccountDeletionResponse>('/users/account-deletion/confirm', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },
}
