import { fetchApi } from '@/infrastructure/api/client/api-client'

/**
 * `POST /api/favorites/{workId}`.
 * Adds the work to the favorites of the authenticated user.
 *
 * The user is never sent: the backend takes it from the JWT.
 */
export function addFavorite(workId: number): Promise<null> {
  return fetchApi<null>(`/favorites/${workId}`, { method: 'POST' })
}

/**
 * `DELETE /api/favorites/{workId}`.
 * Removes the work from the favorites of the authenticated user.
 */
export function removeFavorite(workId: number): Promise<null> {
  return fetchApi<null>(`/favorites/${workId}`, { method: 'DELETE' })
}
