import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountdownTimerOptions {
  initialSeconds: number
  storageKey?: string
  onExpire?: () => void
}

interface UseCountdownTimerResult {
  timeLeft: number
  isExpired: boolean
  reset: (newSeconds: number) => void
}

export function useCountdownTimer({
  initialSeconds,
  storageKey,
  onExpire,
}: UseCountdownTimerOptions): UseCountdownTimerResult {
  const getInitialTime = (): number => {
    if (storageKey) {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        const expiresAt = Number(stored)
        const remaining = Math.floor((expiresAt - Date.now()) / 1000)
        if (remaining > 0) {
          return remaining
        }
        sessionStorage.removeItem(storageKey)
      }
    }
    return initialSeconds
  }

  const [timeLeft, setTimeLeft] = useState(() => getInitialTime())
  const [isExpired, setIsExpired] = useState(() => getInitialTime() <= 0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) {
      clearTimer()
      if (storageKey) {
        sessionStorage.removeItem(storageKey)
      }
      setIsExpired(true)
      onExpire?.()
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          if (storageKey) {
            sessionStorage.removeItem(storageKey)
          }
          setIsExpired(true)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [timeLeft, storageKey, onExpire, clearTimer])

  const reset = useCallback(
    (newSeconds: number) => {
      clearTimer()
      setIsExpired(false)

      if (storageKey) {
        const expiresAt = Date.now() + newSeconds * 1000
        sessionStorage.setItem(storageKey, String(expiresAt))
      }

      setTimeLeft(newSeconds)
    },
    [storageKey, clearTimer],
  )

  return { timeLeft, isExpired, reset }
}
