const ACCESS_TOKEN_KEY = "krafted_access_token"
const REFRESH_TOKEN_KEY = "krafted_refresh_token"
const TOKEN_EXPIRY_KEY = "krafted_token_expiry"
const USER_ID_KEY = "krafted_user_id"

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getTokenExpiry(): number | null {
  const val = localStorage.getItem(TOKEN_EXPIRY_KEY)
  return val ? parseInt(val, 10) : null
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  const expiry = Date.now() + expiresIn * 1000
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
}

export function setAccessToken(accessToken: string, expiresIn: number): void {
  const expiry = Date.now() + expiresIn * 1000
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id)
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  localStorage.removeItem(USER_ID_KEY)
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() >= expiry - 30_000
}

export function hasTokens(): boolean {
  return getAccessToken() !== null && getRefreshToken() !== null
}
