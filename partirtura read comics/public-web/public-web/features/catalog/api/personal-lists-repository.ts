import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { PersonalListMembershipDto, PersonalListSummaryDto } from '../types/lists'

/**
 * The personal lists of the authenticated user (US-0036).
 *
 * Every operation is under `/api/users/me/lists` and the owner always comes
 * from the token: no endpoint of this repository accepts a user identifier.
 * The system lists are not reachable from here.
 */

/** Maximum number of lists the selector endpoint returns. */
export const PERSONAL_LISTS_MAX_PAGE_SIZE = 50

export interface GetPersonalListsParams {
  /** Filters the lists by name. */
  search?: string
  /** The work whose membership is checked. */
  workId?: number
  pageSize?: number
}

/**
 * `GET /api/users/me/lists`.
 * The personal lists of the user with the membership of the given work.
 */
export function getPersonalLists(
  params: GetPersonalListsParams = {}
): Promise<PersonalListMembershipDto[]> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.workId !== undefined) searchParams.set('workId', String(params.workId))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))

  const query = searchParams.toString()
  return fetchApi<PersonalListMembershipDto[]>(`/users/me/lists${query ? `?${query}` : ''}`)
}

/**
 * `POST /api/users/me/lists`.
 * Creates a personal list. Only the name is sent: the backend defines the
 * owner, the visibility, the color and the cover.
 */
export function createPersonalList(name: string): Promise<PersonalListSummaryDto> {
  return fetchApi<PersonalListSummaryDto>('/users/me/lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

/**
 * `PUT /api/users/me/lists/{listId}`.
 * Renames a personal list. Only the name is modified.
 */
export function renamePersonalList(
  listId: number,
  name: string
): Promise<PersonalListSummaryDto> {
  return fetchApi<PersonalListSummaryDto>(`/users/me/lists/${listId}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

/**
 * `DELETE /api/users/me/lists/{listId}`.
 * Deletes a personal list and its works. The works of the catalog are not
 * deleted, only the relation with the list.
 */
export function deletePersonalList(listId: number): Promise<null> {
  return fetchApi<null>(`/users/me/lists/${listId}`, { method: 'DELETE' })
}

/**
 * `POST /api/users/me/lists/{listId}/works`.
 * Adds a work to a personal list, at the end of it.
 */
export function addWorkToPersonalList(
  listId: number,
  workId: number
): Promise<PersonalListSummaryDto> {
  return fetchApi<PersonalListSummaryDto>(`/users/me/lists/${listId}/works`, {
    method: 'POST',
    body: JSON.stringify({ workId }),
  })
}

/**
 * `DELETE /api/users/me/lists/{listId}/works/{workId}`.
 * Removes a work from a personal list. Only the relation is removed.
 */
export function removeWorkFromPersonalList(
  listId: number,
  workId: number
): Promise<null> {
  return fetchApi<null>(`/users/me/lists/${listId}/works/${workId}`, { method: 'DELETE' })
}
