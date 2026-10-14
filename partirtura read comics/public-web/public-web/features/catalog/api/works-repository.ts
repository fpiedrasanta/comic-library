import { fetchApi } from '@/infrastructure/api/client/api-client'
import type { CatalogWorkDetailDto } from '../types/work-detail'

/** `GET /api/works/{id}`. A missing or inactive work is a 404. */
export function getWorkDetail(id: number): Promise<CatalogWorkDetailDto> {
  return fetchApi(`/works/${id}`)
}