import { fetchApi } from '@/infrastructure/api/client/api-client'
import type {
  ReaderWorkPagesDto,
  UpdateReadingProgressRequest,
  UpdateReadingProgressResponse,
} from '../types/reader'

export function getWorkPages(workId: number): Promise<ReaderWorkPagesDto> {
  return fetchApi(`/works/${workId}/pages`)
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