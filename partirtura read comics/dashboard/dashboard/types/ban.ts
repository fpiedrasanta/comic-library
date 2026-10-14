export interface Ban {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  createdAt: string
  startDate: string
  endDate: string | null
  reason: string
  isActive: boolean
  status: 'Active' | 'Finished' | 'Revoked'
}

export interface BanListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: Ban[]
}
