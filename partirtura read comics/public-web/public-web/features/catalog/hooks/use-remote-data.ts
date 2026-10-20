import { useCallback, useEffect, useState } from 'react'

export interface RemoteData<T> {
  /** The last answer of the backend, or `null` while there is none. */
  data: T | null
  isLoading: boolean
  error: Error | null
  /** Asks the backend again. */
  reload: () => void
  /** Replaces the value in the state, without asking the backend again. */
  setData: (value: T | null) => void
}

/**
 * Loads a value from the API when the screen opens and whenever its
 * dependencies change.
 *
 * The value is not cached: what the screen shows is always the last answer of
 * the backend. A change made from another screen —adding a work to a list
 * from the catalog, for example— is never hidden behind a state that is still
 * "fresh", so there is no way to be looking at something that already changed.
 */
export function useRemoteData<T>(
  load: () => Promise<T>,
  dependencies: readonly unknown[]
): RemoteData<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    load().then(
      (result) => {
        if (cancelled) return
        setData(result)
        setIsLoading(false)
      },
      (reason) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason : new Error(String(reason)))
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [...dependencies, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { data, isLoading, error, reload, setData }
}
