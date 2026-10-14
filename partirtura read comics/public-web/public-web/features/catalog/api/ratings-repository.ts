import { fetchApi } from '@/infrastructure/api/client/api-client'

export interface MyRatingDto {
  stars: number | null
  review: string | null
  createdAt: string
  updatedAt: string | null
}

export interface WorkRatingVoteRequest {
  stars: number | null
  review: string | null
}

export interface WorkRatingVoteResponse {
  id: number
  workId: number
  stars: number | null
  review: string | null
  createdAt: string
  updatedAt: string | null
}

export interface WorkRatingListItemDto {
  id: number
  userId: number
  userName: string
  urlAvatar: string | null
  stars: number | null
  review: string | null
  createdAt: string
}

export interface GetWorkRatingsRequest {
  currentPage?: number
  pageSize?: number
  orderBy?: 'Stars' | 'CreatedAt'
  orderDir?: 'ASC' | 'DESC'
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

export async function getMyRating(workId: number): Promise<MyRatingDto | null> {
  try {
    const response = await fetchApi<{ stars: number | null; review: string | null; createdAt: string; updatedAt: string | null }>(`/works/${workId}/ratings/my`)
    return response
  } catch {
    return null
  }
}

export async function voteWork(workId: number, body: WorkRatingVoteRequest): Promise<WorkRatingVoteResponse> {
  return fetchApi(`/works/${workId}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function updateWorkRating(workId: number, body: WorkRatingVoteRequest): Promise<WorkRatingVoteResponse> {
  return fetchApi(`/works/${workId}/ratings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getWorkRatings(workId: number, params: GetWorkRatingsRequest): Promise<ListResponse<WorkRatingListItemDto>> {
  const searchParams = new URLSearchParams()
  if (params.currentPage) searchParams.set('currentPage', params.currentPage.toString())
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)
  if (params.orderDir) searchParams.set('orderDir', params.orderDir)
  
  const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return fetchApi(`/works/${workId}/ratings${query}`)
}