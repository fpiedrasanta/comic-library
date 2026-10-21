type SessionExpiredListener = () => void

let accessToken: string | null = null

const sessionExpiredListeners = new Set<SessionExpiredListener>()

export function storeAccessToken(token: string): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken(): void {
  accessToken = null
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)

  return () => {
    sessionExpiredListeners.delete(listener)
  }
}

export function notifySessionExpired(): void {
  const listeners = [...sessionExpiredListeners]
  sessionExpiredListeners.clear()

  listeners.forEach((listener) => listener())
}
