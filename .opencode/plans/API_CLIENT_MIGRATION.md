# API Client Migration: Remove `apiClient`, Auth-Enable `customFetch`

## Goal

Single HTTP client (`customFetch`) used by all generated hooks/fetchers. Delete `apiClient`.

## Current State

- `apiClient` (`src/api/client.ts`) — used only in `AuthContext.tsx` (4 calls: login, register, logout, me)
- `customFetch` (`src/api/custom-fetch.ts`) — used by all Orval-generated hooks (`useRegister`, `useLogin`, etc.)
- `customFetch` has **no auth headers, no 401 handling, no refresh logic**
- `customFetch` **doesn't throw on non-OK responses** — error bodies returned as data instead of thrown
- BASE_URL inconsistency: `apiClient` defaults to `http://localhost:3000`, `customFetch` defaults to `""`

## Changes (in order)

### 1. Regenerate API types

Run `npm run api:generate` (requires backend running) to refresh `api/openapi.json` and regenerate `src/api/generated.ts`. Picks up backend changes like `refresh_token` in `RegisterResponse`.

### 2. Create `src/api/auth-interceptor.ts`

Extract from `client.ts`:

- `isRefreshing` / `refreshPromise` singleton (prevents concurrent refresh races)
- `refreshAccessToken()` — calls `/auth/refresh` with stored refresh token, stores new tokens via `setTokens()`
- `ensureValidToken()` — if token expired, calls `refreshAccessToken()`; if no refresh token, returns `false`
- No redirect logic — just manages tokens. App-level code handles redirects.

### 3. Rewrite `src/api/custom-fetch.ts`

Full auth-aware implementation:

```
customFetch<T>(url, options?):
  1. If getAccessToken() exists -> ensureValidToken() -> set Authorization header
  2. If no token exists -> skip auth header (public endpoints work)
  3. If ensureValidToken() fails -> clearTokens(), proceed without auth
  4. fetch(url, options)
  5. If 401 + we had a token -> refreshAccessToken() -> retry once with new token
  6. If refresh fails on retry -> clearTokens(), throw error
  7. If !response.ok -> throw parsed { error } object
  8. Parse 204/205/304 as empty, else JSON
```

Design decisions:

- **No `skipAuth` flag** — `customFetch` can't accept custom options (Orval controls the signature). Presence of token determines auth injection. Public endpoints called without tokens -> no auth header -> just works.
- **No redirect in `customFetch`** — throws the error instead. AuthContext / React Query / RequireAuth handle the redirect. Better separation of concerns.
- **Error throwing fixed** — current `customFetch` silently returns error JSON as success data. New version throws on `!response.ok`, matching React Query's error handling contract.
- **BASE_URL defaults to `""`** — Vite proxy handles `/auth/*` and `/api/*` in dev. `VITE_API_URL` env var for production.

### 4. Delete `src/api/client.ts`

Remove `apiClient` entirely.

### 5. Update `src/api/index.ts`

Remove `apiClient` export.

### 6. Update `src/context/AuthContext.tsx`

Switch from `apiClient` to generated fetchers:

- `login()` -> `login({ email, password })` (imported from `@/api/generated`)
- `register()` -> `register({ email, password, name })` from generated
- `logout()` -> `logout({ refresh_token })` from generated
- `me()` -> `me()` from generated (returns `UserResponse`)
- Token storage in AuthContext: `setTokens()` after login, `setAccessToken()` after register (or `setTokens()` if codegen now includes `refresh_token`)
- `init()` effect: call `me()` — if throws -> `clearTokens()`

### 7. Update `src/pages/auth/RegisterPage.tsx`

Replace `useRegister()` hook + manual `setAccessToken()` with `useAuth().register()`. Same pattern as `LoginPage` using `useAuth().login()`. Centralizes token storage.

### 8. Tests

- `customFetch` — auth header injection, 401 retry, no-token passthrough, error throwing
- `auth-interceptor` — refresh singleton, concurrent request coalescing
- `AuthContext` — updated login/register/logout/init with generated fetchers

### 9. Run `typecheck` + `lint`

Verify everything compiles and passes linting.