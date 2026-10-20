import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPersonalList,
  removeWorkFromPersonalList,
  reorderPersonalListWorks,
  type PersonalListWorkPosition,
} from '../api'
import { CATALOG_LISTS_KEY, PERSONAL_LISTS_KEY, listDetailQueryKey } from './query-keys'
import { useWorksListingCache } from './work-listing-cache'
import type { CatalogListDetailDto } from '../types/lists'

/**
 * Whether a list is a personal list of the authenticated user.
 *
 * The personal lists are the ones the user administers, so the detail of a
 * list can only be edited when it belongs to the user. The endpoint of the
 * personal lists answers 404 for a list of the system, which is the same
 * answer as a list of another user.
 */
export function useIsPersonalList(listId: number) {
  const query = useQuery({
    queryKey: [PERSONAL_LISTS_KEY, 'ownership', listId],
    queryFn: () => getPersonalList(listId),
    enabled: Number.isFinite(listId) && listId > 0,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  return {
    isPersonal: query.isSuccess,
    isChecking: query.isPending,
  }
}

/**
 * The operations over the works of a personal list: the new order and the
 * removal of a work.
 *
 * Both operations only change the relation between the work and the list: the
 * work keeps its progress, its ratings, its comments and its favorites.
 */
export function usePersonalListWorks(listId: number) {
  const queryClient = useQueryClient()
  const { invalidateWorksListings } = useWorksListingCache()

  const reorder = useMutation({
    mutationFn: (works: PersonalListWorkPosition[]) => reorderPersonalListWorks(listId, works),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listDetailQueryKey(listId) })
    },
  })

  const removeWork = useMutation({
    mutationFn: (workId: number) => removeWorkFromPersonalList(listId, workId),
    onSuccess: (_data, workId) => {
      // The work leaves the list as soon as the backend confirms it, and the
      // count of works follows.
      queryClient.setQueryData<CatalogListDetailDto>(listDetailQueryKey(listId), (detail) => {
        if (!detail) return detail
        return {
          ...detail,
          works: detail.works.filter((item) => item.work.id !== workId),
          workCount: Math.max(0, detail.workCount - 1),
        }
      })
      queryClient.invalidateQueries({ queryKey: listDetailQueryKey(listId) })
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === CATALOG_LISTS_KEY,
      })
      // The work may stop belonging to any personal list, and only the backend
      // knows the works that were in the list.
      invalidateWorksListings()
    },
  })

  return { reorder, removeWork }
}
