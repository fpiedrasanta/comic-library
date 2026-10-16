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
  return fetchApi(`/works/${workId}/pages`)
}

/** `GET /api/reading/lists/{listId}/work/{workId}`. */
export function getListReaderContext(listId: number, workId: number): Promise<ListReaderContextDto> {
  return fetchApi(`/reading/lists/${listId}/work/${workId}`)
}

/** `PUT /api/reading/lists/{listId}/current-work`. Persists only the current work of the list, never the page progress. */
export function setListCurrentWork(listId: number, workId: number): Promise<void> {
  const body: SetListCurrentWorkRequest = { workId }
  return fetchApi<void>(`/reading/lists/${listId}/current-work`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function updateReadingProgress(
  workId: number,
  currentPage: number
): Promise<UpdateReadingProgressResponse> {
  const body: UpdateReadingProgressRequest = { workId, currentPage }
  return fetchApi(`/works/${workId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}