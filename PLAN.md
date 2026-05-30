# krafted-front — Auth Template Plan

## Stack
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Radix UI Themes
- **Routing**: React Router v7
- **State Management**: React Context + hooks
- **API Client**: Fetch with interceptors (no extra dependency)

## Architecture

```
src/
  pages/
    auth/
      LoginPage.tsx
      RegisterPage.tsx
      ForgotPasswordPage.tsx
      ResetPasswordPage.tsx
      CallbackPage.tsx
    users/
      UserListPage.tsx
      UserProfilePage.tsx
    roles/
      RoleListPage.tsx
      RoleManagePage.tsx
    DashboardPage.tsx
    NotFoundPage.tsx
  components/
    RequireAuth.tsx
    RequirePermission.tsx
    Layout.tsx
    ErrorBoundary.tsx
    PageState.tsx
  hooks/
    useAuth.ts
  api/
    client.ts            # Fetch wrapper with auth interceptors + refresh
    auth.ts              # login, register, logout, me, refresh, forgot/reset password
    users.ts             # list, get, update, delete
    roles.ts             # list, create, assign, revoke
  context/
    AuthContext.tsx
  types/
    auth.ts
    user.ts
    role.ts
    api.ts
  utils/
    token.ts
  App.tsx
  main.tsx
```

---

## Milestones

### [M1 — Project Scaffolding & Routing](plan/M1_PROJECT_SCAFFOLDING_ROUTING.md)
- [x] Vite + React + TypeScript + Radix UI setup
- [x] Directory structure with barrel exports
- [x] Type definitions mirroring backend API
- [x] React Router with all routes
- [x] Layout component with sidebar

### [M2 — Auth Context & API Client](plan/M2_AUTH_CONTEXT_API_CLIENT.md)
- [x] Token utilities (localStorage-based)
- [x] API client with auth interceptors + auto-refresh
- [x] Auth API functions (login, register, logout, me, refresh, forgot/reset)
- [x] User & Role API functions
- [x] AuthContext + useAuth hook
- [x] AuthProvider wired into App

### [M3 — Auth Pages](plan/M3_AUTH_PAGES.md)
- [x] Login page with validation + error handling
- [x] Register page with validation
- [x] Forgot password page
- [x] Reset password page
- [x] Auth routes wired in App.tsx

### [M4 — Protected Routes & Current User](plan/M4_PROTECTED_ROUTES_CURRENT_USER.md)
- [x] RequireAuth component (redirect to /login)
- [x] Protected routes wrapped in App.tsx
- [x] Layout with real user info + logout
- [x] RequirePermission component (placeholder for RBAC)
- [x] Dashboard with user greeting
- [x] Callback page (placeholder)

### [M5 — User Management Pages](plan/M5_USER_MANAGEMENT_PAGES.md)
- [x] User list page with pagination
- [x] User profile page with inline edit
- [x] Active/inactive status badges
- [x] Delete (deactivate) user action

### [M6 — RBAC & Role Management](plan/M6_RBAC_ROLE_MANAGEMENT.md)
- [x] Permission types and groups
- [x] AuthContext updated with permissions
- [x] RequirePermission enforced on routes + sidebar
- [x] Role list page
- [x] Role manage page with permission checkboxes
- [x] Assign/revoke roles from user profile

### [M7 — Dashboard, Polish & Testing](plan/M7_DASHBOARD_POLISH_TESTING.md)
- [x] Dashboard with stats cards (users, roles count)
- [x] Global error boundary
- [x] 404 page
- [x] Consistent loading/error/empty states
- [x] Playwright E2E test scaffolding
- [x] Vitest + React Testing Library component and integration tests
- [x] Environment configuration (.env.example)
- [x] Final route structure cleanup

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth flow | Direct API (no OAuth2 redirect) | Backend proxies Authentik, SPA just calls /api/auth/* |
| Token storage | localStorage | Simplicity; backend returns tokens in JSON body |
| API client | Fetch wrapper with interceptors | No extra dependency, full control |
| State management | React Context + hooks | Simple, no extra deps |
| Routing | React Router v7 | Standard SPA routing |
| UI library | Radix UI Themes | Accessible, customizable, AI-friendly (copy-paste) |
| RBAC enforcement | Frontend hides UI, backend enforces | UX only — never trust frontend perm checks |
| Testing | Vitest + React Testing Library + msw | Fast, jsdom, component and integration tests |
| Formatting | Prettier | Consistent code style |
| Linting | ESLint + eslint-config-prettier | Catch errors, not formatting |