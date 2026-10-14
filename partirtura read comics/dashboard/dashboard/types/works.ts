export type ContentStatus = 0 | 1 | 2 | 3

export const ContentStatusLabel: Record<ContentStatus, string> = {
  0: 'Faltante',
  1: 'Procesando',
  2: 'Finalizado OK',
  3: 'Error',
}

export const IAStatusLabel: Record<0 | 1 | 2 | 3, string> = {
  0: 'Pendiente',
  1: 'Procesando',
  2: 'Completado',
  3: 'Error',
}

export interface WorkTypeDto {
  id: number
  name: string
  isActive: boolean
  createdAt: string
}

export interface WorkTypeListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: WorkTypeDto[]
}

export interface WorkListItemDto {
  id: number
  title: string
  description: string | null
  languageId: number | null
  languageName: string | null
  coverId: number | null
  urlCover: string | null
  isActive: boolean
  publicationDate: string | null
  createdAt: string
  contentStatus: ContentStatus
  contentError: string | null
  workType: string
  seriesId: number | null
  seriesName: string | null
  franchiseId: number | null
  franchiseName: string | null
  publisherId: number | null
  publisherName: string | null
  publisherCountryName: string | null
  numberValue: string | null
  previousNumberValue: string | null
  nextNumberValue: string | null
  iaRequest: boolean
  iaStatus: number | null
  iaRequestedAt: string | null
  since: string | null
}

export interface WorkListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: WorkListItemDto[]
}

export interface NumberReferenceDto {
  id: number | null
  numberValue: string | null
  title: string | null
}

export interface PersonByRoleDto {
  personId: number | null
  personName: string | null
  roleId: number | null
  roleName: string | null
}

export interface TagDto {
  id: number | null
  name: string | null
}

export interface WorkDetailDto {
  id: number
  workTypeId: number
  workTypeName: string
  title: string
  description: string | null
  languageId: number | null
  languageName: string | null
  coverId: number | null
  urlCover: string | null
  isActive: boolean
  publicationDate: string | null
  createdAt: string
  contentStatus: ContentStatus
  contentError: string | null
  seriesId: number | null
  seriesName: string | null
  franchiseId: number | null
  franchiseName: string | null
  publisherId: number | null
  publisherName: string | null
  publisherCountryName: string | null
  numberValue: string | null
  previousNumber: NumberReferenceDto | null
  nextNumber: NumberReferenceDto | null
  fileId: number | null
  pageCount: number
  personByRoles: PersonByRoleDto[]
  tags: TagDto[]
  iaStatus: number | null
  iaResult: ComicAnalysisResult | null
  iaRequestedAt: string | null
}

export interface WorkImageItemDto {
  id: number
  url: string
  pageNumber?: number
}

export interface WorkImagesResponse {
  images: WorkImageItemDto[]
}

export interface SetCoverRequest {
  imageId: number
}

export interface AnalyzeComicRequest {
  imageIds: number[]
}

export interface ComicAnalysisResult {
  title: string | null
  publisher: string | null
  number: string | null
  description: string | null
  summary: string | null
  publicationDate: string | null
  writers: string[]
  artists: string[]
  inkers: string[]
  tags: string[]
  characters: string[]
}

export interface PersonByRoleForm {
  personId: number
  roleId: number
}

export interface WorkFormTag {
  id: number
  name: string
}

export interface WorkFormContextState {
  franchiseId?: number
  franchiseName?: string
  publisherId?: number
  publisherName?: string
  publisherCountryName?: string | null
  seriesId?: number
  seriesName?: string
}

export type WorkFormData = {
  workTypeId: number
  title: string
  description?: string | null
  numberValue?: string | null
  languageId: number
  publicationDate?: string | null
}
