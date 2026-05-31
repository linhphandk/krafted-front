import { getRefreshToken, setTokens, clearTokens, isTokenExpired } from "@/utils/token"

const BASE_URL = import.meta.env.VITE_API_URL || ""

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const data = await response.json()
    setTokens(data.access_token, data.refresh_token, data.expires_in)
    return true
  } catch {
    clearTokens()
    return false
  }
}

export async function ensureValidToken(): Promise<boolean> {
  if (!isTokenExpired()) return true

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}
