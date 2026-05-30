import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from "@/utils/token"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  skipAuth?: boolean
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
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

async function ensureValidToken(): Promise<boolean> {
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

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...rest } = options

  if (!skipAuth) {
    const tokenValid = await ensureValidToken()
    if (!tokenValid) {
      clearTokens()
      window.location.href = "/login"
      throw new Error("Authentication required")
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newToken = getAccessToken()!
      headers["Authorization"] = `Bearer ${newToken}`
      const retryResponse = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ error: "Request failed" }))
        throw error
      }
      return retryResponse.json()
    }
    clearTokens()
    window.location.href = "/login"
    throw new Error("Authentication required")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw error
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
