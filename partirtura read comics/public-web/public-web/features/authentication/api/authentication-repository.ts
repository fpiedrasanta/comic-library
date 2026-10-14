import { fetchApi } from '@/infrastructure/api/client/api-client'
import type {
  ValidateEmailRequest,
  ValidateEmailPayload,
  ResendValidationRequest,
  ResendValidationPayload,
  RegisterPayload,
  AuthResponse,
  LoginRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResendPasswordResetCodeRequest,
  ResendPasswordResetCodeResponse,
  ValidatePasswordResetCodeRequest,
  ValidatePasswordResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GoogleLoginRequest,
  GoogleClientIdResponse,
  UserProfileResponse,
  RequestAccountDeletionResponse,
  ConfirmAccountDeletionResponse,
} from '@/types/api'

export class AuthenticationRepository {
  async register(formData: FormData): Promise<RegisterPayload> {
    return fetchApi<RegisterPayload>('/users/register', {
      method: 'POST',
      body: formData,
    })
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async validateEmail(request: ValidateEmailRequest): Promise<ValidateEmailPayload> {
    return fetchApi<ValidateEmailPayload>('/users/validate-email', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async resendValidationEmail(
    request: ResendValidationRequest,
  ): Promise<ResendValidationPayload> {
    return fetchApi<ResendValidationPayload>('/users/resend-validation-email', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async refreshToken(): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/users/refresh-token', {
      method: 'POST',
    })
  }

  async logout(): Promise<void> {
    await fetchApi<void>('/users/logout', {
      method: 'POST',
    })
  }

  async logoutAll(): Promise<void> {
    await fetchApi<void>('/users/logout-all', {
      method: 'POST',
    })
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return fetchApi<ForgotPasswordResponse>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async resendPasswordResetCode(
    request: ResendPasswordResetCodeRequest,
  ): Promise<ResendPasswordResetCodeResponse> {
    return fetchApi<ResendPasswordResetCodeResponse>('/users/resend-password-reset-code', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async validatePasswordResetCode(
    request: ValidatePasswordResetCodeRequest,
  ): Promise<ValidatePasswordResetCodeResponse> {
    return fetchApi<ValidatePasswordResetCodeResponse>('/users/validate-password-reset-code', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return fetchApi<ResetPasswordResponse>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async googleLogin(request: GoogleLoginRequest): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/users/google-login', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getGoogleClientId(): Promise<GoogleClientIdResponse> {
    return fetchApi<GoogleClientIdResponse>('/users/google-client-id', {
      method: 'GET',
    })
  }

  async getProfile(): Promise<UserProfileResponse> {
    return fetchApi<UserProfileResponse>('/users/me', {
      method: 'GET',
    })
  }

  async updateProfile(formData: FormData): Promise<UserProfileResponse> {
    return fetchApi<UserProfileResponse>('/users/me', {
      method: 'PUT',
      body: formData,
    })
  }

  async requestAccountDeletion(): Promise<RequestAccountDeletionResponse> {
    return fetchApi<RequestAccountDeletionResponse>('/users/account-deletion/request', {
      method: 'POST',
    })
  }

  async confirmAccountDeletion(code: string): Promise<ConfirmAccountDeletionResponse> {
    return fetchApi<ConfirmAccountDeletionResponse>('/users/account-deletion/confirm', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }
}

export const authenticationRepository = new AuthenticationRepository()
