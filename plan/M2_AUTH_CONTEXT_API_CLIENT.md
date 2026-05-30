# M2 — Auth Context & API Client

**Deliverable: Token storage, API client with interceptors, auth context provider all working together**

**Depends on: M1**

---

## Key Concept: The API Client Is the Foundation

Every API call goes through a single `client.ts` instance. It handles:
- Injecting the `Authorization: Bearer <token>` header on every request
- Detecting 401 responses and attempting a token refresh
- Queueing requests while a refresh is in progress so they don't fail
- Redirecting to `/login` when refresh fails (token is permanently expired)

The `AuthContext` wraps the `client` and provides login/logout/refresh to the rest of the app.

---

## Task 1 — Token utilities (~80loc)

**File**: `src/utils/token.ts`, `src/utils/index.ts`

Token management functions. We store both tokens in `localStorage` for now. The backend issue `httpOnly` cookies is a future hardening — for M2 we use client-side storage for simplicity.

Why `localStorage` and not `httpOnly cookies`? Because our backend (from krafted-back) returns tokens in the JSON response body, not as `Set-Cookie` headers. If we switch to cookie-based auth later, this module is the only place that changes.

```ts
const ACCESS_TOKEN_KEY = "krafted_access_token"
const REFRESH_TOKEN_KEY = "krafted_refresh_token"
const TOKEN_EXPIRY_KEY = "krafted_token_expiry"

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

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  // Consider token expired if it expires within 30 seconds
  return Date.now() >= expiry - 30_000
}

export function hasTokens(): boolean {
  return getAccessToken() !== null && getRefreshToken() !== null
}
```

`src/utils/index.ts`:
```ts
export * from "./token"
```

**Estimated lines**: ~60loc (token.ts) + ~5loc (index) = ~65loc

---

## Task 2 — API client with auth interceptors (~200loc)

**File**: `src/api/client.ts`

The API client is a wrapper around `fetch` that handles:
1. Base URL from an environment variable (`VITE_API_URL`, defaults to `http://localhost:3000`)
2. JSON content-type headers
3. Bearer token injection from local storage
4. 401 response interception — attempts token refresh, retries the original request
5. Request queuing during refresh (prevents multiple concurrent refreshes)

```ts
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

  // If auth is needed and token is expired, try to refresh first
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
    // Token might have just expired, try refreshing once
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

  // For 204 No Content, return empty object
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
```

`src/api/index.ts`:
```ts
export { apiClient } from "./client"
```

**Estimated lines**: ~100loc (client.ts) + ~5loc (index) = ~105loc

---

## Task 3 — Auth API functions (~80loc)

**File**: `src/api/auth.ts`

Thin wrappers around `apiClient` for all auth endpoints defined in krafted-back:

```ts
import { apiClient } from "./client"
import type { LoginRequest, LoginResponse, RegisterRequest, User, RefreshResponse, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from "@/types"

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: req,
    skipAuth: true,
  })
}

export async function register(req: RegisterRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: req,
    skipAuth: true,
  })
}

export async function getMe(): Promise<User> {
  return apiClient<User>("/api/auth/me")
}

export async function logout(accessToken: string): Promise<void> {
  await apiClient("/api/auth/logout", {
    method: "POST",
    body: { access_token: accessToken },
  })
}

export async function refreshToken(refresh_token: string): Promise<RefreshResponse> {
  return apiClient<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refresh_token },
    skipAuth: true,
  })
}

export async function forgotPassword(req: ForgotPasswordRequest): Promise<MessageResponse> {
  return apiClient<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: req,
    skipAuth: true,
  })
}

export async function resetPassword(req: ResetPasswordRequest): Promise<MessageResponse> {
  return apiClient<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: req,
    skipAuth: true,
  })
}
```

**Estimated lines**: ~60loc

---

## Task 4 — Users & Roles API functions (~60loc)

**File**: `src/api/users.ts`, `src/api/roles.ts`

`src/api/users.ts` (~40loc):
```ts
import { apiClient } from "./client"
import type { User, UpdateUserRequest, PaginatedResponse, ListQueryParams } from "@/types"

export async function listUsers(params?: ListQueryParams): Promise<PaginatedResponse<User>> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", params.page.toString())
  if (params?.per_page) query.set("per_page", params.per_page.toString())
  return apiClient<PaginatedResponse<User>>(`/api/users?${query.toString()}`)
}

export async function getUser(id: string): Promise<User> {
  return apiClient<User>(`/api/users/${id}`)
}

export async function updateUser(id: string, req: UpdateUserRequest): Promise<User> {
  return apiClient<User>(`/api/users/${id}`, {
    method: "PATCH",
    body: req,
  })
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient(`/api/users/${id}`, { method: "DELETE" })
}
```

`src/api/roles.ts` (~20loc):
```ts
import { apiClient } from "./client"
import type { Role, CreateRoleRequest, AssignRoleRequest } from "@/types"

export async function listRoles(): Promise<Role[]> {
  return apiClient<Role[]>("/api/roles")
}

export async function createRole(req: CreateRoleRequest): Promise<Role> {
  return apiClient<Role>("/api/roles", { method: "POST", body: req })
}

export async function assignRole(userId: string, req: AssignRoleRequest): Promise<void> {
  await apiClient(`/api/users/${userId}/roles`, { method: "POST", body: req })
}

export async function revokeRole(userId: string, roleId: string): Promise<void> {
  await apiClient(`/api/users/${userId}/roles/${roleId}`, { method: "DELETE" })
}
```

**Estimated lines**: ~60loc

---

## Task 5 — AuthContext + useAuth hook (~150loc)

**File**: `src/context/AuthContext.tsx`, `src/context/index.ts`

The `AuthContext` is the central auth state holder. It provides:
- `user` — the currently logged-in user (or `null`)
- `isAuthenticated` — boolean
- `isLoading` — whether auth state is being determined (on mount)
- `login(email, password)` — calls the API, stores tokens, sets user
- `logout()` — clears tokens, redirects to `/login`
- `register(email, password, displayName)` — calls the API, stores tokens, sets user

```tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import * as authApi from "@/api/auth"
import { setTokens, clearTokens, hasTokens, getAccessToken } from "@/utils/token"
import type { User } from "@/types"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, if tokens exist, try to fetch the current user
  useEffect(() => {
    if (hasTokens()) {
      authApi.getMe()
        .then(setUser)
        .catch(() => {
          clearTokens()
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setTokens(response.access_token, response.refresh_token, response.expires_in)
    setUser(response.user)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const response = await authApi.register({ email, password, display_name: displayName })
    setTokens(response.access_token, response.refresh_token, response.expires_in)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    const token = getAccessToken()
    if (token) {
      try { await authApi.logout(token) } catch { /* ignore */ }
    }
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
```

`src/context/index.ts`:
```ts
export { AuthProvider, useAuth } from "./AuthContext"
```

**Estimated lines**: ~85loc (AuthContext.tsx) + ~5loc (index) = ~90loc

---

## Task 6 — Wire AuthProvider into App.tsx (~30loc)

**File**: `src/App.tsx` (update)

Wrap the app with `AuthProvider` so all components can access auth state:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AuthProvider } from "@/context"
import Layout from "./components/Layout"
import LoginPage from "./pages/auth/LoginPage"
import CallbackPage from "./pages/auth/CallbackPage"
import DashboardPage from "./pages/DashboardPage"
import UserListPage from "./pages/users/UserListPage"
import UserProfilePage from "./pages/users/UserProfilePage"
import RoleListPage from "./pages/roles/RoleListPage"
import RoleManagePage from "./pages/roles/RoleManagePage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
            <Route path="/roles" element={<RoleListPage />} />
            <Route path="/roles/:id" element={<RoleManagePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

**Estimated lines**: ~30loc

---

## Task 7 — Token utility and API client tests (~150loc)

**Files**: `src/__tests__/token.test.ts`, `src/__tests__/client.test.ts`

`src/__tests__/token.test.ts` (~60loc):
```ts
import { describe, it, expect, beforeEach } from "vitest"
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
  hasTokens,
} from "@/utils/token"

describe("token utilities", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("setTokens stores tokens and expiry", () => {
    setTokens("access123", "refresh456", 3600)
    expect(getAccessToken()).toBe("access123")
    expect(getRefreshToken()).toBe("refresh456")
  })

  it("clearTokens removes all tokens", () => {
    setTokens("access", "refresh", 3600)
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it("hasTokens returns true when tokens exist", () => {
    expect(hasTokens()).toBe(false)
    setTokens("a", "r", 3600)
    expect(hasTokens()).toBe(true)
  })

  it("isTokenExpired returns false for fresh tokens", () => {
    setTokens("a", "r", 3600)
    expect(isTokenExpired()).toBe(false)
  })

  it("isTokenExpired returns true when no tokens", () => {
    expect(isTokenExpired()).toBe(true)
  })
})
```

`src/__tests__/client.test.ts` (~90loc) — uses `msw` to mock API responses:
```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { apiClient } from "@/api/client"
import { setTokens, clearTokens } from "@/utils/token"

const server = setupServer()

beforeEach(() => {
  localStorage.clear()
  server.listen({ onUnhandledRequest: "bypass" })
})

afterEach(() => {
  server.resetHandlers()
  server.close()
})

describe("apiClient", () => {
  it("makes unauthenticated requests with skipAuth", async () => {
    server.use(
      http.get("http://localhost:3000/api/test", () => {
        return HttpResponse.json({ ok: true })
      }),
    )
    const result = await apiClient<{ ok: boolean }>("/api/test", { skipAuth: true })
    expect(result.ok).toBe(true)
  })

  it("injects Authorization header when tokens exist", async () => {
    setTokens("test-access-token", "test-refresh-token", 3600)
    let authHeader: string | null = null
    server.use(
      http.get("http://localhost:3000/api/test", ({ request }) => {
        authHeader = request.headers.get("Authorization")
        return HttpResponse.json({ ok: true })
      }),
    )
    await apiClient("/api/test")
    expect(authHeader).toBe("Bearer test-access-token")
  })

  it("throws error with message on non-2xx response", async () => {
    server.use(
      http.post("http://localhost:3000/api/auth/login", () => {
        return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }),
    )
    await expect(
      apiClient("/api/auth/login", { method: "POST", body: {}, skipAuth: true }),
    ).rejects.toEqual({ error: "Invalid credentials" })
  })
})
```

**Estimated lines**: ~60loc + ~90loc = ~150loc

---

## Verification

After completing all tasks, you should be able to:

1. `npm run build` — compiles without errors
2. `npm run typecheck` — no type errors
3. `npm test` — all tests pass (token utils + API client)
4. In a browser, `localStorage` has no tokens → app shows login page
5. Manually call `login("test@example.com", "password")` via console — tokens stored, state updated
6. `useAuth()` returns `{ user, isAuthenticated, isLoading, login, register, logout }`
7. After login, `getAccessToken()` returns a non-null token
8. API calls via `apiClient` include the `Authorization: Bearer <token>` header
9. When token expires, `apiClient` automatically refreshes and retries