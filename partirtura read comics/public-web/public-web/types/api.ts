export interface ApiError {
  status?: number
  code?: number
  message: string
  payload?: {
    errors?: Array<{ field: string; message: string }>
    detail?: string
  } | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  code: number
  payload: T
}

export interface ListResponse<T> {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: T[]
}

export type RequestError = ApiError

export interface CountryDto {
  id: number
  code: string
  name: string
  isActive: boolean
}

export interface ValidateEmailPayload {
  token: string
  user: {
    userId: number
    email: string
    fullName: string
  }
  role: string
}

export interface AuthResponse {
  accessToken: string
  userId: number
  email: string
  fullName: string
  role: string
}

export interface ResendValidationPayload {
  expiresInMinutes: number
}

export interface RegisterPayload {
  userId: number
  expiresInMinutes: number
}

export interface ValidateEmailRequest {
  email: string
  code: string
}

export interface ResendValidationRequest {
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  expiresInMinutes: number
}

export interface ResendPasswordResetCodeRequest {
  email: string
}

export interface ResendPasswordResetCodeResponse {
  expiresInMinutes: number
}

export interface ValidatePasswordResetCodeRequest {
  email: string
  code: string
}

export interface ValidatePasswordResetCodeResponse {
  authorizationToken: string
}

export interface ResetPasswordRequest {
  email: string
  authorizationToken: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface GoogleClientIdResponse {
  clientId: string
}

export interface UserProfileResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  countryId: number | null
  countryName: string | null
}

export interface RequestAccountDeletionResponse {
  expiresInMinutes: number
}

export interface ConfirmAccountDeletionResponse {
  message: string
}
