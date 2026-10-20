import { useCallback } from 'react'
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  PERSONAL_LISTS_MAX_PAGE_SIZE,
  addWorkToPersonalList,
  createPersonalList,
  deletePersonalList,
  getPersonalLists,
  removeWorkFromPersonalList,
  renamePersonalList,
} from '../api'
import type { PersonalListMembershipDto } from '../types/lists'
import { CATALOG_LISTS_KEY, PERSONAL_LISTS_KEY } from './query-keys'
import { useWorksListingCache } from './work-listing-cache'

/** Number of lists the selector shows at once. */
export const PERSONAL_LISTS_VISIBLE_STEP = 5

/** Key of the query with the personal lists of the user and the membership of a work. */
export function personalListsQueryKey(workId: number, search: string) {
  return [PERSONAL_LISTS_KEY, { search: search.trim(), workId }] as const
}

/** Key of the mutations that add or remove a work from a personal list. */
export function personalListMembershipKey(workId: number) {
  return ['personal-list-membership', workId] as const
}

/**
 * The personal lists of the authenticated user with the membership of a work.
 *
 * The endpoint returns the lists that contain the work first and the rest
 * after them, and the search does not change that order, so the order of the
 * response is kept as it comes.
 */
export function usePersonalLists(workId: number, search: string) {
  const trimmedSearch = search.trim()

  return useQuery({
    queryKey: personalListsQueryKey(workId, trimmedSearch),
    queryFn: () =>
      getPersonalLists({
        search: trimmedSearch || undefined,
        pageSize: PERSONAL_LISTS_MAX_PAGE_SIZE,
        workId,
      }),
    // The membership is the state of the user, so it is asked again on every
    // mount instead of waiting for the cache to go stale.
    staleTime: 0,
  })
}

/**
 * The operations over the personal lists of the user.
 *
 * The state of a work is shared by every listing that shows it, so a change
 * of membership updates the card of the work everywhere at once.
 */
export function usePersonalListActions(workId: number, search: string) {
  const queryClient = useQueryClient()
  const { updateWork, invalidateWorksListings } = useWorksListingCache()
  const queryKey = personalListsQueryKey(workId, search)

  /** The count of works of the lists changes with every membership change. */
  const refreshCatalogLists = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === CATALOG_LISTS_KEY,
    })
  }, [queryClient])

  /**
   * Records the membership of a work in a list and updates the state of the
   * work in the listings that show it.
   *
   * The work belongs to a personal list while it is in at least one of them:
   * removing it from one list does not make it gray when it is in another.
   */
  const setMembership = useCallback(
    (listId: number, containsWork: boolean) => {
      const lists = queryClient.getQueryData<PersonalListMembershipDto[]>(queryKey) ?? []
      const nextLists = lists.map((list) =>
        list.id === listId ? { ...list, containsWork } : list
      )

      queryClient.setQueryData(queryKey, nextLists)
      updateWork(workId, (work) => ({
        ...work,
        isInPersonalList: nextLists.some((list) => list.containsWork),
      }))
    },
    [queryClient, queryKey, updateWork, workId]
  )

  const addWork = useMutation({
    mutationKey: personalListMembershipKey(workId),
    mutationFn: (listId: number) => addWorkToPersonalList(listId, workId),
    onSuccess: (_data, listId) => {
      setMembership(listId, true)
      refreshCatalogLists()
    },
  })

  const removeWork = useMutation({
    mutationKey: personalListMembershipKey(workId),
    mutationFn: (listId: number) => removeWorkFromPersonalList(listId, workId),
    onSuccess: (_data, listId) => {
      setMembership(listId, false)
      refreshCatalogLists()
    },
  })

  const createList = useMutation({
    mutationFn: (name: string) => createPersonalList(name),
    onSuccess: () => {
      // The order of the lists is a rule of the endpoint, so the new list is
      // asked for again instead of being placed by the client.
      queryClient.invalidateQueries({ queryKey })
      refreshCatalogLists()
    },
  })

  const renameList = useMutation({
    mutationFn: ({ listId, name }: { listId: number; name: string }) =>
      renamePersonalList(listId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      refreshCatalogLists()
    },
  })

  const deleteList = useMutation({
    mutationFn: (listId: number) => deletePersonalList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      refreshCatalogLists()
      // The works of the deleted list may stop belonging to any list, and only
      // the backend knows which ones.
      invalidateWorksListings()
    },
  })

  // A work can be on screen more than once, so the pending state is counted
  // over every mutation of the work and not over this one only.
  const pendingMemberships = useIsMutating({
    mutationKey: personalListMembershipKey(workId),
  })

  return {
    addWork,
    removeWork,
    createList,
    renameList,
    deleteList,
    isMembershipPending: pendingMemberships > 0,
  }
}
