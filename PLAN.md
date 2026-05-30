# krafted-front — Auth Template Plan

## Stack
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript

## Architecture

```
src/
  pages/
    auth/
      LoginPage.tsx
      CallbackPage.tsx
    users/
      UserListPage.tsx
      UserProfilePage.tsx
    roles/
      RoleListPage.tsx
      RoleManagePage.tsx
    DashboardPage.tsx
  components/
    RequireAuth.tsx
    RequirePermission.tsx
    Layout.tsx
  hooks/
    useAuth.ts
  api/
    auth.ts
    users.ts
    roles.ts
    client.ts          # Axios/fetch instance with interceptors
  context/
    AuthContext.tsx
  types/
    auth.ts
    user.ts
    role.ts
  utils/
    token.ts
 App.tsx
 main.tsx
```

---

## Milestones

### M6 — React Frontend

#### Auth Flow
- [ ] Login page → redirect to Authentik
- [ ] Callback handler → exchange code, store tokens
- [ ] Token storage strategy (httpOnly cookie preferred)
- [ ] Auto-refresh before expiry

#### Auth State
- [ ] Auth context provider (`AuthContext.tsx`)
- [ ] `useAuth` hook for consuming auth state
- [ ] `RequireAuth` component — wraps routes requiring authentication
- [ ] `RequirePermission` component — wraps routes requiring specific permissions

#### Pages
- [ ] Login / Logout
- [ ] Callback (OAuth2 redirect handler)
- [ ] Dashboard (authenticated)
- [ ] User profile
- [ ] Admin: User list
- [ ] Admin: Role management

#### API Client
- [ ] Base HTTP client with token injection
- [ ] Automatic token refresh interceptor
- [ ] Auth API calls: `login()`, `logout()`, `refresh()`, `me()`
- [ ] User API calls: `listUsers()`, `getUser()`, `updateUser()`, `deleteUser()`
- [ ] Role API calls: `listRoles()`, `createRole()`, `assignRole()`, `revokeRole()`

#### M8 (Frontend portion)
- [ ] E2E tests: full auth flow (Playwright)
- [ ] Component tests for `RequireAuth` / `RequirePermission`

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth flow | OAuth2 Auth Code + PKCE | Most secure for SPA |
| Token storage | httpOnly cookie (backend-set) | XSS protection |
| State management | React Context + hooks | Simple, no extra deps |
| Routing | React Router | Standard SPA routing |
| API client | Fetch with interceptors | No extra dependency |