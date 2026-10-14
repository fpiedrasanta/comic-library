import { apiClient, apiClientBlob, API_BASE_URL } from '@/infrastructure/api/client/api-client'
import { getAccessToken } from '@/features/authentication/services/auth-interceptor'
import type {
  WorkListResponse,
  WorkDetailDto,
  WorkTypeListResponse,
  WorkImagesResponse,
  ContentStatus,
  PersonByRoleForm,
  WorkImageItemDto,
} from '@/types/works'

const ORDER_BY_MAP: Record<string, string> = {
  title: 'Title',
  publicationDate: 'PublicationDate',
  createdAt: 'CreatedAt',
  language: 'Language',
  number: 'Number',
}

const ORDER_DIR_MAP: Record<string, string> = {
  asc: 'ASC',
  desc: 'DESC',
}

async function handleMultipartError(
  response: Response,
): Promise<Error & { status: number; code: number }> {
  let errorMessage = response.statusText
  let errorCode = response.status

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    const data = await response.json() as {
      success: false
      message: string
      code: number
      payload: null
    }
    errorMessage = data.message || errorMessage
    errorCode = data.code || errorCode
  }

  const error = new Error(errorMessage) as Error & { status: number; code: number }
  error.status = response.status
  error.code = errorCode
  error.message = errorMessage
  return error
}

interface GetWorksParams {
  currentPage?: number
  pageSize?: number
  orderBy?: string
  orderDir?: string
  search?: string
  workTypeId?: number
  isActive?: boolean
  languageId?: number
  contentStatus?: ContentStatus
  publicationDateFrom?: string
  publicationDateTo?: string
  createdAtFrom?: string
  createdAtTo?: string
  publisherId?: number
  franchiseId?: number
  seriesId?: number
  iaRequest?: boolean
  iaStatus?: number
  withDescription?: boolean
}

export async function getWorks(params: GetWorksParams): Promise<WorkListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.workTypeId !== undefined) {
    searchParams.set('workTypeId', String(params.workTypeId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.languageId !== undefined) {
    searchParams.set('languageId', String(params.languageId))
  }

  if (params.contentStatus !== undefined) {
    searchParams.set('contentStatus', String(params.contentStatus))
  }

  if (params.publicationDateFrom) {
    searchParams.set('publicationDateFrom', params.publicationDateFrom)
  }

  if (params.publicationDateTo) {
    searchParams.set('publicationDateTo', params.publicationDateTo)
  }

  if (params.createdAtFrom) {
    searchParams.set('createdAtFrom', params.createdAtFrom)
  }

  if (params.createdAtTo) {
    searchParams.set('createdAtTo', params.createdAtTo)
  }

  if (params.publisherId !== undefined) {
    searchParams.set('publisherId', String(params.publisherId))
  }

  if (params.franchiseId !== undefined) {
    searchParams.set('franchiseId', String(params.franchiseId))
  }

  if (params.seriesId !== undefined) {
    searchParams.set('seriesId', String(params.seriesId))
  }

  if (params.iaRequest !== undefined) {
    searchParams.set('iaRequest', String(params.iaRequest))
  }

  if (params.iaStatus !== undefined) {
    searchParams.set('iaStatus', String(params.iaStatus))
  }

  if (params.withDescription !== undefined) {
    searchParams.set('withDescription', String(params.withDescription))
  }

  return apiClient<WorkListResponse>(`/admin-works?${searchParams.toString()}`)
}

export async function getWorksByFranchise(
  franchiseId: number,
  params: Omit<GetWorksParams, 'franchiseId'>,
): Promise<WorkListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.workTypeId !== undefined) {
    searchParams.set('workTypeId', String(params.workTypeId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.languageId !== undefined) {
    searchParams.set('languageId', String(params.languageId))
  }

  if (params.contentStatus !== undefined) {
    searchParams.set('contentStatus', String(params.contentStatus))
  }

  if (params.publicationDateFrom) {
    searchParams.set('publicationDateFrom', params.publicationDateFrom)
  }

  if (params.publicationDateTo) {
    searchParams.set('publicationDateTo', params.publicationDateTo)
  }

  if (params.iaRequest !== undefined) {
    searchParams.set('iaRequest', String(params.iaRequest))
  }

  if (params.iaStatus !== undefined) {
    searchParams.set('iaStatus', String(params.iaStatus))
  }

  if (params.withDescription !== undefined) {
    searchParams.set('withDescription', String(params.withDescription))
  }

  return apiClient<WorkListResponse>(
    `/admin-works/franchise/${franchiseId}?${searchParams.toString()}`,
  )
}

export async function getWorksBySeries(
  seriesId: number,
  params: Omit<GetWorksParams, 'seriesId'>,
): Promise<WorkListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.workTypeId !== undefined) {
    searchParams.set('workTypeId', String(params.workTypeId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.languageId !== undefined) {
    searchParams.set('languageId', String(params.languageId))
  }

  if (params.contentStatus !== undefined) {
    searchParams.set('contentStatus', String(params.contentStatus))
  }

  if (params.publicationDateFrom) {
    searchParams.set('publicationDateFrom', params.publicationDateFrom)
  }

  if (params.publicationDateTo) {
    searchParams.set('publicationDateTo', params.publicationDateTo)
  }

  if (params.iaRequest !== undefined) {
    searchParams.set('iaRequest', String(params.iaRequest))
  }

  if (params.iaStatus !== undefined) {
    searchParams.set('iaStatus', String(params.iaStatus))
  }

  if (params.withDescription !== undefined) {
    searchParams.set('withDescription', String(params.withDescription))
  }

  return apiClient<WorkListResponse>(
    `/admin-works/series/${seriesId}?${searchParams.toString()}`,
  )
}

export async function getWorksByPublisher(
  publisherId: number,
  params: Omit<GetWorksParams, 'publisherId'>,
): Promise<WorkListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.orderBy) {
    const mapped = ORDER_BY_MAP[params.orderBy] ?? params.orderBy
    searchParams.set('orderBy', mapped)
  }

  if (params.orderDir) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.workTypeId !== undefined) {
    searchParams.set('workTypeId', String(params.workTypeId))
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  if (params.languageId !== undefined) {
    searchParams.set('languageId', String(params.languageId))
  }

  if (params.contentStatus !== undefined) {
    searchParams.set('contentStatus', String(params.contentStatus))
  }

  if (params.publicationDateFrom) {
    searchParams.set('publicationDateFrom', params.publicationDateFrom)
  }

  if (params.publicationDateTo) {
    searchParams.set('publicationDateTo', params.publicationDateTo)
  }

  if (params.iaRequest !== undefined) {
    searchParams.set('iaRequest', String(params.iaRequest))
  }

  if (params.iaStatus !== undefined) {
    searchParams.set('iaStatus', String(params.iaStatus))
  }

  if (params.withDescription !== undefined) {
    searchParams.set('withDescription', String(params.withDescription))
  }

  return apiClient<WorkListResponse>(
    `/admin-works/publisher/${publisherId}?${searchParams.toString()}`,
  )
}

export async function getWorkById(workId: number): Promise<WorkDetailDto> {
  return apiClient<WorkDetailDto>(`/admin-works/${workId}`)
}

export async function getWorkTypes(params: {
  currentPage?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  orderBy?: string
  orderDir?: string
}): Promise<WorkTypeListResponse> {
  const searchParams = new URLSearchParams()

  searchParams.set('currentPage', String(params.currentPage ?? 1))
  searchParams.set('pageSize', String(params.pageSize ?? 12))

  if (params.orderBy) {
    const mapped = params.orderBy === 'name' ? 'Name' : params.orderBy
    const mappedDir = params.orderDir
      ? ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
      : params.orderDir
    searchParams.set('orderBy', mapped)
    if (mappedDir) {
      searchParams.set('orderDir', mappedDir)
    }
  }

  if (params.orderDir && !params.orderBy) {
    const mapped = ORDER_DIR_MAP[params.orderDir] ?? params.orderDir
    searchParams.set('orderDir', mapped)
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive))
  }

  return apiClient<WorkTypeListResponse>(
    `/admin-work-types?${searchParams.toString()}`,
  )
}

interface CreateWorkPayload {
  workTypeId: number
  title: string
  description?: string | null
  languageId?: number
  publicationDate?: string
  coverImageId?: number | null
  seriesId?: number | null
  franchiseId?: number | null
  publisherId?: number | null
  numberValue?: string | null
  previousNumberId?: number | null
  nextNumberId?: number | null
  personByRoles?: PersonByRoleForm[]
  tags?: { name: string }[]
  coverData?: string | null
  coverFileName?: string | null
}

export async function createWork(
  payload: CreateWorkPayload,
): Promise<WorkDetailDto> {
  return apiClient<WorkDetailDto>('/admin-works', {
    method: 'POST',
    body: JSON.stringify({
      workTypeId: payload.workTypeId,
      title: payload.title,
      description: payload.description ?? null,
      languageId: payload.languageId ?? null,
      publicationDate: payload.publicationDate
        ? new Date(payload.publicationDate).toISOString()
        : null,
      coverImageId: payload.coverImageId ?? null,
      seriesId: payload.seriesId ?? null,
      franchiseId: payload.franchiseId ?? null,
      publisherId: payload.publisherId ?? null,
      numberValue: payload.numberValue ?? null,
      previousNumberId: payload.previousNumberId ?? null,
      nextNumberId: payload.nextNumberId ?? null,
      personByRoles: payload.personByRoles ?? [],
      tags: payload.tags ?? [],
      coverData: payload.coverData ?? null,
      coverFileName: payload.coverFileName ?? null,
    }),
  })
}

export async function createWorkWithContent(
  payload: CreateWorkPayload & { contentFile?: File },
): Promise<WorkDetailDto> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-works/with-content`

  const formData = new FormData()
  formData.append('WorkTypeId', String(payload.workTypeId))
  formData.append('Title', payload.title)
  if (payload.languageId !== undefined) {
    formData.append('LanguageId', String(payload.languageId))
  }
  if (payload.publicationDate) {
    formData.append('PublicationDate', new Date(payload.publicationDate).toISOString())
  }
  if (payload.coverImageId) {
    formData.append('CoverImageId', String(payload.coverImageId))
  }
  if (payload.seriesId) {
    formData.append('SeriesId', String(payload.seriesId))
  }
  if (payload.franchiseId) {
    formData.append('FranchiseId', String(payload.franchiseId))
  }
  if (payload.publisherId) {
    formData.append('PublisherId', String(payload.publisherId))
  }
  if (payload.numberValue) {
    formData.append('NumberValue', payload.numberValue)
  }
  if (payload.previousNumberId) {
    formData.append('PreviousNumberId', String(payload.previousNumberId))
  }
  if (payload.nextNumberId) {
    formData.append('NextNumberId', String(payload.nextNumberId))
  }
  if (payload.personByRoles && payload.personByRoles.length > 0) {
    formData.append('PersonByRoles', JSON.stringify(payload.personByRoles))
  }
  if (payload.tags && payload.tags.length > 0) {
    formData.append('Tags', JSON.stringify(payload.tags))
  }
  if (payload.contentFile) {
    formData.append('Content', payload.contentFile)
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    throw await handleMultipartError(response)
  }

  return response.json()
}

interface UpdateWorkPayload {
  workTypeId: number
  title: string
  description?: string | null
  languageId: number
  publicationDate?: string
  coverImageId?: number | null
  seriesId?: number | null
  franchiseId?: number | null
  publisherId?: number | null
  numberValue?: string | null
  previousNumberId?: number | null
  nextNumberId?: number | null
  personByRoles?: PersonByRoleForm[]
  tags?: { name: string }[]
  coverData?: string | null
  coverFileName?: string | null
}

export async function updateWork(
  workId: number,
  payload: UpdateWorkPayload,
): Promise<WorkDetailDto> {
  return apiClient<WorkDetailDto>(`/admin-works/${workId}`, {
    method: 'PUT',
    body: JSON.stringify({
      workTypeId: payload.workTypeId,
      title: payload.title,
      description: payload.description ?? null,
      languageId: payload.languageId,
      publicationDate: payload.publicationDate
        ? new Date(payload.publicationDate).toISOString()
        : null,
      coverImageId: payload.coverImageId ?? null,
      seriesId: payload.seriesId ?? null,
      franchiseId: payload.franchiseId ?? null,
      publisherId: payload.publisherId ?? null,
      numberValue: payload.numberValue ?? null,
      previousNumberId: payload.previousNumberId ?? null,
      nextNumberId: payload.nextNumberId ?? null,
      personByRoles: payload.personByRoles ?? [],
      tags: payload.tags ?? [],
      coverData: payload.coverData ?? null,
      coverFileName: payload.coverFileName ?? null,
    }),
  })
}

export async function updateWorkWithContent(
  workId: number,
  payload: UpdateWorkPayload & { coverFile?: File },
): Promise<WorkDetailDto> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-works/${workId}/with-content`

  const formData = new FormData()
  formData.append('WorkTypeId', String(payload.workTypeId))
  formData.append('Title', payload.title)
  formData.append('Description', payload.description ?? '')
  if (payload.languageId !== undefined) {
    formData.append('LanguageId', String(payload.languageId))
  }
  if (payload.publicationDate) {
    formData.append('PublicationDate', new Date(payload.publicationDate).toISOString())
  }
  if (payload.coverImageId) {
    formData.append('CoverImageId', String(payload.coverImageId))
  }
  if (payload.seriesId) {
    formData.append('SeriesId', String(payload.seriesId))
  }
  if (payload.franchiseId) {
    formData.append('FranchiseId', String(payload.franchiseId))
  }
  if (payload.publisherId) {
    formData.append('PublisherId', String(payload.publisherId))
  }
  if (payload.numberValue) {
    formData.append('NumberValue', payload.numberValue)
  }
  if (payload.previousNumberId) {
    formData.append('PreviousNumberId', String(payload.previousNumberId))
  }
  if (payload.nextNumberId) {
    formData.append('NextNumberId', String(payload.nextNumberId))
  }
  if (payload.personByRoles && payload.personByRoles.length > 0) {
    formData.append('PersonByRoles', JSON.stringify(payload.personByRoles))
  }
  if (payload.tags && payload.tags.length > 0) {
    formData.append('Tags', JSON.stringify(payload.tags))
  }
  if (payload.coverFile) {
    formData.append('Cover', payload.coverFile)
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    throw await handleMultipartError(response)
  }

  return response.json()
}

export async function deactivateWork(workId: number): Promise<void> {
  return apiClient<void>(`/admin-works/${workId}/deactivate`, {
    method: 'PATCH',
  })
}

export async function activateWork(workId: number): Promise<void> {
  return apiClient<void>(`/admin-works/${workId}/activate`, {
    method: 'PATCH',
  })
}

export async function deleteWork(workId: number): Promise<void> {
  return apiClient<void>(`/admin-works/${workId}`, {
    method: 'DELETE',
  })
}

export async function getWorkImages(workId: number): Promise<WorkImagesResponse> {
  return apiClient<WorkImagesResponse>(`/admin-works/${workId}/images`)
}

export async function setWorkCover(workId: number, imageId: number): Promise<void> {
  return apiClient<void>(`/admin-works/${workId}/cover`, {
    method: 'PATCH',
    body: JSON.stringify({ imageId }),
  })
}

export async function analyzeWorkWithAi(
  workId: number,
  imageIds: number[],
): Promise<void> {
  await apiClient<null>(`/admin-works/${workId}/ai-analysis`, {
    method: 'POST',
    body: JSON.stringify({ imageIds }),
  })
}

export async function uploadWorkContent(
  workId: number,
  file: File,
): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  await apiClientBlob(`/admin-works/${workId}/content`, {
    method: 'POST',
    body: formData,
  })
}

export async function deleteWorkContent(workId: number): Promise<void> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-works/${workId}/content`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (!response.ok) {
    throw await handleMultipartError(response)
  }
}

export async function retryWorkContent(workId: number, file?: File | null): Promise<void> {
  const accessToken = getAccessToken()
  const url = `${API_BASE_URL}/admin-works/${workId}/content/retry`

  const body = file
    ? (() => {
        const formData = new FormData()
        formData.append('Content', file)
        return formData
      })()
    : undefined

  const response = await fetch(url, {
    method: 'POST',
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
          ...(body ? {} : { 'Content-Type': 'application/json' }),
        }
      : undefined,
    body,
  })

  if (!response.ok) {
    throw await handleMultipartError(response)
  }
}

export async function getWorkContentStatus(workId: number): Promise<ContentStatus> {
  return apiClient<ContentStatus>(`/admin-works/${workId}/content/status`)
}

export interface WorkImageItemForContent extends WorkImageItemDto {}

export async function getWorkContentImages(
  workId: number,
): Promise<WorkImagesResponse> {
  return getWorkImages(workId)
}

export interface EnsurePersonAndRolePayload {
  person: { name: string; id: number }
  role: { name: string; id: number }
}

export async function ensurePersonAndRole(
  personName: string,
  roleName: string,
): Promise<EnsurePersonAndRolePayload> {
  if (!personName.trim() || !roleName.trim()) {
    throw new Error('Los nombres de persona y rol son obligatorios.')
  }

  return apiClient<EnsurePersonAndRolePayload>(
    '/admin-works/person-and-rol',
    {
      method: 'POST',
      body: JSON.stringify({
        personName: personName.trim(),
        roleName: roleName.trim(),
      }),
    },
  )
}
