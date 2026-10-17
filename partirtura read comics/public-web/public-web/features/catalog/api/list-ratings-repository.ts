import { fetchApi } from '@/infrastructure/api/client/api-client'

export interface ListRatingVoteRequest {
  stars: number
  review: string | null
}

export interface ListRatingVoteResponse {
  stars: number
  review: string | null
  createdAt: string
  updatedAt: string | null
}

/** `POST /api/catalog/lists/{listId}/ratings` (create). */
export async function voteListRating(listId: number, body: ListRatingVoteRequest): Promise<ListRatingVoteResponse> {
  return fetchApi(`/catalog/lists/${listId}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** `PUT /api/catalog/lists/{listId}/ratings` (update / upsert). */
export async function updateListRating(listId: number, body: ListRatingVoteRequest): Promise<ListRatingVoteResponse> {
  return fetchApi(`/catalog/lists/${listId}/ratings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
