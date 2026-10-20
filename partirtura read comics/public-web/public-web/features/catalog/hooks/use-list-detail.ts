import { getCatalogListDetail } from '../api/lists-repository'
import { useEntityDetail } from './use-entity-detail'
import { listDetailQueryKey } from './query-keys'
import type { CatalogListDetailDto } from '../types/lists'

/**
 * List detail for the `/lists/:id` header and its works. The id comes
 * from the route, and a 404 is a legitimate answer (the id does not
 * resolve to an official active list), reported apart from a real error.
 */
export function useCatalogListDetail(id: number) {
  return useEntityDetail<CatalogListDetailDto>({
    key: listDetailQueryKey(id),
    load: () => getCatalogListDetail(id),
    enabled: Number.isFinite(id),
  })
}
