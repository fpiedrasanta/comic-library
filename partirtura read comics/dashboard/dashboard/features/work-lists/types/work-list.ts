export type WorkVisibility = 0 | 1

export const WorkVisibilityLabel: Record<WorkVisibility, string> = {
  0: 'Pública',
  1: 'Privada',
}

export const WorkVisibilityOptions: { value: WorkVisibility; label: string }[] = [
  { value: 0, label: 'Pública (Visible en la app global)' },
  { value: 1, label: 'Privada (Sólo admins)' },
]

export interface WorkListListItemDto {
  id: number
  name: string
  type: string
  urlCover: string | null
  coverId: number | null
  createdAt: string
  isActive: boolean
}

export interface WorkListListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: WorkListListItemDto[]
}

export interface WorkListWorkDto {
  id: number
  title: string
  numberValue: string | null
  seriesId: number | null
  seriesName: string | null
  franchiseId: number | null
  franchiseName: string | null
  publisherId: number | null
  publisherName: string | null
  urlCover: string | null
  coverId: number | null
  isActive: boolean
}

export interface WorkListWorkItemDto {
  workId: number
  position: number
  work: WorkListWorkDto
}

export interface WorkListDetailDto {
  id: number
  name: string
  description: string | null
  urlCover: string | null
  coverId: number | null
  color: string | null
  listTypeId: number
  listTypeName: string
  visibility: WorkVisibility
  ownerType: string
  ownerUserId: number | null
  isActive: boolean
  createdAt: string
  works: WorkListWorkItemDto[]
}

export interface WorkListWorkItemRequest {
  workId: number
  position: number
}

export interface CreateWorkListRequest {
  name: string
  description: string | null
  coverData?: string | null
  coverFileName?: string | null
  color: string | null
  listTypeId: number
  visibility: WorkVisibility
  works: WorkListWorkItemRequest[]
}

export interface UpdateWorkListRequest {
  name: string
  description: string | null
  coverData?: string | null
  coverFileName?: string | null
  coverImageId?: number | null
  color: string | null
  listTypeId: number
  visibility: WorkVisibility
  works: WorkListWorkItemRequest[]
}

export interface SearchWorkParams {
  currentPage?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  languageId?: number
  contentStatus?: number
  publicationDateFrom?: string
  publicationDateTo?: string
  orderBy?: string
  orderDir?: string
  franchiseId?: number
  publisherId?: number
  seriesId?: number
}

export interface SearchWorkResult {
  id: number
  title: string
  numberValue: string | null
  seriesName: string | null
  franchiseName: string | null
  publisherName: string | null
  urlCover: string | null
  isActive: boolean
  workType: string
}

export interface SearchWorkListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: SearchWorkResult[]
}
