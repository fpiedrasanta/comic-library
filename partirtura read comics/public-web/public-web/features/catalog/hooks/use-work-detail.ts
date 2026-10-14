import { getWorkDetail } from '../api/works-repository'
import { useEntityDetail } from './use-entity-detail'
import type { CatalogWorkDetailDto } from '../types/work-detail'

/**
 * Work detail for the `/works/:id` page.
 * The id comes from the route, and a 404 is a legitimate answer,
 * reported apart from a real error.
 */
export function useWorkDetail(id: number) {
  return useEntityDetail<CatalogWorkDetailDto>({
    key: ['catalog', 'work-detail', id],
    load: () => getWorkDetail(id),
    enabled: Number.isFinite(id),
  })
}