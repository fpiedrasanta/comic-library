let accessToken: string | null = null

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
