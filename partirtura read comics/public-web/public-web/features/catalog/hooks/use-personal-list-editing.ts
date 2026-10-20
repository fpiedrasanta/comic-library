import { useCallback, useState } from 'react'
import {
  getPersonalList,
  removeWorkFromPersonalList,
  reorderPersonalListWorks,
  type PersonalListWorkPosition,
} from '../api'
import { useRemoteData } from './use-remote-data'
import { useWorksListingCache } from './work-listing-cache'

/**
 * Whether a list is a personal list of the authenticated user.
 *
 * The personal lists are the ones the user administers, so the detail of a
 * list can only be edited when it belongs to the user. The endpoint of the
 * personal lists answers 404 for a list of the system, which is the same
 * answer as a list of another user.
 */
export function useIsPersonalList(listId: number) {
  const { data } = useRemoteData(() => getPersonalList(listId), [listId])

  return { isPersonal: data != null }
}

export interface PersonalListWorks {
  /** Persists the new order of the works that changed their place. */
  reorder: (works: PersonalListWorkPosition[]) => Promise<boolean>
  /** Removes a work from the list. */
  removeWork: (workId: number) => Promise<boolean>
  /** An operation is in flight. */
  isPending: boolean
  /** The error of the last operation. */
  error: Error | null
}

/**
 * The operations over the works of a personal list: the new order and the
 * removal of a work.
 *
 * Both operations only change the relation between the work and the list: the
 * work keeps its progress, its ratings, its comments and its favorites.
 */
export function usePersonalListWorks(
  listId: number,
  /** Asks the detail of the list again, after a change. */
  onChanged: () => void
): PersonalListWorks {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { invalidateWorksListings } = useWorksListingCache()

  const run = useCallback(
    async (operation: () => Promise<unknown>): Promise<boolean> => {
      setIsPending(true)
      setError(null)

      try {
        await operation()
        onChanged()
        return true
      } catch (reason) {
        setError(reason instanceof Error ? reason : new Error(String(reason)))
        return false
      } finally {
        setIsPending(false)
      }
    },
    [onChanged]
  )

  const reorder = useCallback(
    async (works: PersonalListWorkPosition[]) => run(() => reorderPersonalListWorks(listId, works)),
    [run, listId]
  )

  const removeWork = useCallback(
    async (workId: number) => {
      const succeeded = await run(() => removeWorkFromPersonalList(listId, workId))
      if (!succeeded) return false

      // The work may stop belonging to any personal list, and only the backend
      // knows the works that were in the list.
      invalidateWorksListings()
      return true
    },
    [run, listId, invalidateWorksListings]
  )

  return { reorder, removeWork, isPending, error }
}
