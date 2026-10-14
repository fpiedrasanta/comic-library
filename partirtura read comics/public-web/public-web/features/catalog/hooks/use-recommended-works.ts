import { useQuery } from '@tanstack/react-query'
import { getRecommendedWorks } from '../api'
import type { RecommendedSortField } from '../types/works'

/**
 * Recommended works of the index (`GET /api/works/recommended`).
 *
 * `staleTime: 0` because the set changes as soon as the user starts reading a work:
 * the very next visit to the index must not offer a work that is no longer eligible.
 */
const RECOMMENDED_STALE_TIME = 0

export function useRecommendedWorks(sortBy: RecommendedSortField) {
  return useQuery({
    queryKey: ['recommended-works', sortBy],
    queryFn: () => getRecommendedWorks({ sortBy }),
    staleTime: RECOMMENDED_STALE_TIME,
  })
}
