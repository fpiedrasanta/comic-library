import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export interface RemoteData<T> {
  /** The last answer of the backend, or `null` while there is none. */
  data: T | null
  /** There is no data yet: the screen shows its loading state. */
  isLoading: boolean
  /** A request is in flight, with or without data on screen. */
  isRefreshing: boolean
  error: Error | null
  /** Asks the backend again. */
  reload: () => void
  /** Replaces the value in the state, without asking the backend again. */
  setData: Dispatch<SetStateAction<T | null>>
}

/**
 * Loads a value from the API when the screen opens and whenever its
 * dependencies change.
 *
 * The value is not cached: what the screen shows is always the last answer of
 * the backend. A change made from another screen —adding a work to a list
 * from the catalog, for example— is never hidden behind a state that is still
 * "fresh", so there is no way to be looking at something that already changed.
 *
 * Asking again does not empty the screen: the data stays on it and is
 * replaced when the new answer arrives, so the screen never goes back to its
 * loading state for a change the user just made.
 */
export function useRemoteData<T>(
  load: () => Promise<T>,
  dependencies: readonly unknown[]
): RemoteData<T> {
  const [data, setData] = useState<T | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsRefreshing(true)
    setError(null)

    load().then(
      (result) => {
        if (cancelled) return
        setData(result)
        setIsRefreshing(false)
      },
      (reason) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason : new Error(String(reason)))
        setIsRefreshing(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [...dependencies, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return {
    data,
    isLoading: isRefreshing && data === null,
    isRefreshing,
    error,
    reload,
    setData,
  }
}
