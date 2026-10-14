import { getSeriesDetail } from '../api/catalog-repository'
import { useEntityDetail } from './use-entity-detail'
import type { SeriesDetailDto } from '../types/works'

/**
 * Series detail for the `/series/:id` header. The id comes from the route, so
 * the cache entry is also the one the page uses to resolve the series filter.
 */
export function useSeriesDetail(id: number) {
  return useEntityDetail<SeriesDetailDto>({
    key: ['catalog', 'series-detail', id],
    load: () => getSeriesDetail(id),
    enabled: Number.isFinite(id),
  })
}
