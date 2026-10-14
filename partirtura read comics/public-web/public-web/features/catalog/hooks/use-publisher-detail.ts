import { getPublisherDetail } from '../api/catalog-repository'
import { useEntityDetail } from './use-entity-detail'
import type { PublisherDetailDto } from '../types/works'

/**
 * Publisher detail for the `/publishers/:id` header. The id comes from the
 * route, so the cache entry is also the one the page uses to resolve the
 * publisher filter.
 */
export function usePublisherDetail(id: number) {
  return useEntityDetail<PublisherDetailDto>({
    key: ['catalog', 'publisher-detail', id],
    load: () => getPublisherDetail(id),
    enabled: Number.isFinite(id),
  })
}
