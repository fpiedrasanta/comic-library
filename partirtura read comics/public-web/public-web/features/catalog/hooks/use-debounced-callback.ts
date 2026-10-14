import { useCallback, useEffect, useRef } from 'react'

export interface DebouncedCallback<TArgs extends unknown[]> {
  schedule: (...args: TArgs) => void
  cancel: () => void
}

/**
 * Defers a callback until the caller has been idle for `delayMs`. Every new
 * call cancels the pending one, so a burst of keystrokes results in a single
 * invocation with the last arguments.
 *
 * `cancel` matters for anything that supersedes the pending call, such as
 * clearing the input before the debounce fires: without it the stale value
 * would be committed afterwards and desync the input from the committed state.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): DebouncedCallback<TArgs> {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => cancel, [cancel])

  const schedule = useCallback(
    (...args: TArgs) => {
      cancel()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        callbackRef.current(...args)
      }, delayMs)
    },
    [cancel, delayMs],
  )

  return { schedule, cancel }
}
