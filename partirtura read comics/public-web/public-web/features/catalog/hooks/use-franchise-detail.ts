import { getFranchiseDetail } from '../api/catalog-repository'
import { useEntityDetail } from './use-entity-detail'
import type { FranchiseDetailDto } from '../types/works'

/**
 * Franchise detail for the `/franchises/:id` header. The id comes from the
 * route, so the cache entry is also the one the page uses to resolve the
 * franchise filter.
 */
export function useFranchiseDetail(id: number) {
  return useEntityDetail<FranchiseDetailDto>({
    key: ['catalog', 'franchise-detail', id],
    load: () => getFranchiseDetail(id),
    enabled: Number.isFinite(id),
  })
}
