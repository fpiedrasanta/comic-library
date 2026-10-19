import { getReadingHistory } from '../api'
import type { ReadingHistoryState } from '../types/works'
import { READING_HISTORY_KEY } from './query-keys'
import { useWorksPagination } from './use-works-pagination'
import { WORKS_PAGE_SIZE } from './use-works'

/**
 * Reading history of the authenticated user (`GET /api/users/me/reading-history`),
 * paginated exactly like the catalog.
 *
 * `staleTime: 0` because the history mirrors live reading state: continuing a work
 * in the Reader must show up here without waiting for the catalog cache to expire.
 */
const HISTORY_STALE_TIME = 0

export function useReadingHistory(state: ReadingHistoryState, pageSize: number = WORKS_PAGE_SIZE) {
  return useWorksPagination({
    queryKey: [READING_HISTORY_KEY, state, pageSize],
    fetchPage: (page) => getReadingHistory({ currentPage: page, pageSize, state }),
    staleTime: HISTORY_STALE_TIME,
  })
}

