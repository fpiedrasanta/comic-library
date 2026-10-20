import { useCallback, useState } from 'react'
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
import { useRemoteData } from './use-remote-data'
import { useWorksListingCache } from './work-listing-cache'

/** Number of lists the selector shows at once. */
export const PERSONAL_LISTS_VISIBLE_STEP = 5

export interface PersonalLists {
  /** The personal lists of the user, with the membership of the work. */
  lists: PersonalListMembershipDto[]
  isLoading: boolean
  /** The error of the query. */
  error: Error | null
  /** An operation is in flight. */
  isPending: boolean
  /** The error of the last operation. */
  actionError: Error | null
  /** Asks the backend again. */
  reload: () => void
  /** Adds the work to a list. Resolves `false` when the operation failed. */
  addWork: (listId: number) => Promise<boolean>
  /** Removes the work from a list. Resolves `false` when the operation failed. */
  removeWork: (listId: number) => Promise<boolean>
  /** Creates a list with the given name. */
  createList: (name: string) => Promise<boolean>
  /** Renames a list. */
  renameList: (listId: number, name: string) => Promise<boolean>
  /** Deletes a list. */
  deleteList: (listId: number) => Promise<boolean>
}

/**
 * The personal lists of the user and the administration of the membership of a
 * work.
 *
 * The lists are asked for every time the selector opens and every time the
 * search changes, with no cache in between: what the selector shows is the
 * last answer of the backend. The membership of the work is also written to
 * the state of the listings that show works, so the button of the card follows
 * the operation.
 */
export function usePersonalLists(workId: number, search: string): PersonalLists {
  const trimmedSearch = search.trim()

  const {
    data,
    isLoading,
    error,
    reload,
    setData,
  } = useRemoteData<PersonalListMembershipDto[]>(
    () =>
      getPersonalLists({
        search: trimmedSearch || undefined,
        pageSize: PERSONAL_LISTS_MAX_PAGE_SIZE,
        workId,
      }),
    [workId, trimmedSearch]
  )

  const [isPending, setIsPending] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)
  const { updateWork, invalidateWorksListings } = useWorksListingCache()

  const lists = data ?? []

  /**
   * Records the membership of the work in a list and updates the state of the
   * work in the listings that show it.
   *
   * The work belongs to a personal list while it is in at least one of them:
   * removing it from one list does not make it gray when it is in another.
   */
  const setMembership = useCallback(
    (listId: number, containsWork: boolean) => {
      const nextLists = lists.map((list) =>
        list.id === listId ? { ...list, containsWork } : list
      )

      setData(nextLists)
      updateWork(workId, (work) => ({
        ...work,
        isInPersonalList: nextLists.some((list) => list.containsWork),
      }))
    },
    [lists, setData, updateWork, workId]
  )

  const run = useCallback(
    async (operation: () => Promise<unknown>): Promise<boolean> => {
      setIsPending(true)
      setActionError(null)

      try {
        await operation()
        return true
      } catch (reason) {
        setActionError(reason instanceof Error ? reason : new Error(String(reason)))
        return false
      } finally {
        setIsPending(false)
      }
    },
    []
  )

  const addWork = useCallback(
    async (listId: number) => {
      const succeeded = await run(() => addWorkToPersonalList(listId, workId))
      if (!succeeded) return false

      setMembership(listId, true)
      return true
    },
    [run, setMembership, workId]
  )

  const removeWork = useCallback(
    async (listId: number) => {
      const succeeded = await run(() => removeWorkFromPersonalList(listId, workId))
      if (!succeeded) return false

      setMembership(listId, false)
      return true
    },
    [run, setMembership, workId]
  )

  const createList = useCallback(
    async (name: string) => {
      const succeeded = await run(() => createPersonalList(name))
      if (!succeeded) return false

      // The order of the lists is a rule of the endpoint, so the new list is
      // asked for again instead of being placed by the client.
      reload()
      return true
    },
    [run, reload]
  )

  const renameList = useCallback(
    async (listId: number, name: string) => {
      const succeeded = await run(() => renamePersonalList(listId, name))
      if (!succeeded) return false

      reload()
      return true
    },
    [run, reload]
  )

  const deleteList = useCallback(
    async (listId: number) => {
      const succeeded = await run(() => deletePersonalList(listId))
      if (!succeeded) return false

      reload()
      // The works of the deleted list may stop belonging to any list, and only
      // the backend knows which ones.
      invalidateWorksListings()
      return true
    },
    [run, reload, invalidateWorksListings]
  )

  return {
    lists,
    isLoading,
    error,
    isPending,
    actionError,
    reload,
    addWork,
    removeWork,
    createList,
    renameList,
    deleteList,
  }
}
