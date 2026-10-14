export interface User {
  id: number
  email: string
  fullName: string
  firstName: string
  lastName: string
  role: string
  avatarUrl: string | null
  countryId: number | null
  countryName: string | null
}

export interface AuthResponse {
  accessToken: string
  userId: number
  email: string
  fullName: string
  role: string
}

export interface ForgotPasswordResponse {
  expiresInMinutes: number
}

export interface ResendPasswordResetCodeResponse {
  expiresInMinutes: number
}

export interface ValidatePasswordResetCodeResponse {
  authorizationToken: string
}

export interface ResetPasswordResponse {
  success: boolean
}

export interface RequestAccountDeletionResponse {
  expiresInMinutes: number
}

export interface ConfirmAccountDeletionResponse {
  message: string
}

export interface UserListItem {
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  countryName: string | null
  isActive: boolean
  isBanned: boolean
  banCount: number
  createdAt: string
}

export interface UserListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: UserListItem[]
}

export interface UserDetail {
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  countryName: string | null
}

export interface AdminUserListItem {
  id: number
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  countryName: string | null
  createdAt: string
  isActive: boolean
}

export interface AdminUserListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: AdminUserListItem[]
}

export interface CreateAdminResponse {
  id: number
}
