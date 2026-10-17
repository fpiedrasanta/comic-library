import { fetchApi } from '@/infrastructure/api/client/api-client'
import type {
  ReaderWorkPagesDto,
  UpdateReadingProgressRequest,
  UpdateReadingProgressResponse,
} from '../types/reader'
import type {
  ListReaderContextDto,
  SetListCurrentWorkRequest,
} from '../types/list-reader-context'

export function getWorkPages(workId: number): Promise<ReaderWorkPagesDto> {
  console.log('[API] GET /works/{workId}/pages', { workId })
  return fetchApi(`/works/${workId}/pages`).then((data) => {
    console.log('[API] GET /works/{workId}/pages response', { workId, data })
    return data as ReaderWorkPagesDto
  })
}

/** `GET /api/reading/lists/{listId}/work/{workId}`. */
export function getListReaderContext(listId: number, workId: number): Promise<ListReaderContextDto> {
  console.log('[API] GET /reading/lists/{listId}/work/{workId}', { listId, workId })
  return fetchApi(`/reading/lists/${listId}/work/${workId}`).then((data) => {
    console.log('[API] GET /reading/lists/{listId}/work/{workId} response', { listId, workId, data })
    return data as ListReaderContextDto
  })
}

/** `PUT /api/reading/lists/{listId}/current-work`. Persists only the current work of the list, never the page progress. */
export function setListCurrentWork(listId: number, workId: number): Promise<void> {
  const body: SetListCurrentWorkRequest = { workId }
  console.log('[API] PUT /reading/lists/{listId}/current-work', { listId, body })
  return fetchApi<void>(`/reading/lists/${listId}/current-work`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(() => {
    console.log('[API] PUT /reading/lists/{listId}/current-work response OK', { listId, workId })
  })
}

export function updateReadingProgress(
  workId: number,
  currentPage: number
): Promise<UpdateReadingProgressResponse> {
  const body: UpdateReadingProgressRequest = { workId, currentPage }
  console.log('[API] PUT /works/{workId}/progress', { workId, body })
  return fetchApi(`/works/${workId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((data) => {
    console.log('[API] PUT /works/{workId}/progress response', { workId, body, data })
    return data as UpdateReadingProgressResponse
  })
}