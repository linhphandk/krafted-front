# krafted-front — Implementation Plan

## Stack
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Radix UI Themes
- **Routing**: React Router v7
- **State Management**: React Context + hooks
- **API Client (auth)**: Orval-generated from OpenAPI spec (`src/api/generated.ts`)
- **API Client (listings)**: Manual functions using `customFetch` (`src/api/listings.ts`, `src/api/categories.ts`)
- **Data Fetching**: React Query (TanStack Query)

## Architecture

```
src/
  api/
    generated.ts          # Orval-generated auth endpoints
    custom-fetch.ts        # Fetch wrapper with auth interceptors + refresh
    auth-interceptor.ts    # Token refresh logic
    listings.ts            # Manual listing API functions (M4)
    categories.ts          # Manual category API functions (M4)
    index.ts
  context/
    AuthContext.tsx
    index.ts
  pages/
    auth/
      LoginPage.tsx         # Done
      RegisterPage.tsx       # Done
      ForgotPasswordPage.tsx   # (M3 completion)
      ResetPasswordPage.tsx    # (M3 completion)
    listings/               # (M5-M7)
      ListingsPage.tsx
      ListingDetailPage.tsx
      CreateListingPage.tsx
      EditListingPage.tsx
      MyListingsPage.tsx
    DashboardPage.tsx       # (M8)
    NotFoundPage.tsx         # (M11)
  components/
    FormField/
    RequireAuth/            # (M7 — lightweight version for protected routes)
    ListingCard/            # (M5)
    ListingsFilter/         # (M5)
    Pagination/             # (M5)
    Layout/                  # (M8)
    ErrorBoundary/           # (M11)
    PageState/               # (M11)
  hooks/
    useListings.ts           # (M4) React Query hooks
  types/
    listing.ts               # (M4)
    index.ts
  utils/
    token.ts
    index.ts
  App.tsx
  main.tsx
```

---

## Current Sprint: Marketplace Features (M4–M7)

Marketplace features are the current priority, built before completing the auth template (M8–M11). M4–M6 can be developed with mock data since the backend listing API isn't live yet. M7 requires a lightweight `RequireAuth` component (extracted from M8 plan).

### [M4 — Listing Types + API Client + Hooks](plan/M4_LISTING_TYPES_API_HOOKS.md)
- [ ] Listing and category TypeScript types
- [ ] Listing and category API functions (manual, using `customFetch`)
- [ ] React Query hooks for listings and categories

### [M5 — Browse & Search Listings](plan/M5_BROWSE_LISTINGS.md)
- [ ] ListingCard component
- [ ] ListingsFilter component (kind, category, search, sort)
- [ ] Pagination component
- [ ] ListingsPage (public route)
- [ ] `/listings` route added

### [M6 — Listing Detail Page](plan/M6_LISTING_DETAIL.md)
- [ ] ListingDetailPage (public route)
- [ ] `/listings/:id` route added

### [M7 — Create/Edit Listing + My Listings](plan/M7_CREATE_EDIT_MY_LISTINGS.md)
- [ ] Lightweight RequireAuth component (extracted from M8)
- [ ] CreateListingPage
- [ ] EditListingPage
- [ ] MyListingsPage
- [ ] Sidebar navigation update with marketplace links
- [ ] `/listings/new`, `/listings/:id/edit`, `/my-listings` protected routes

---

## Auth Template (M1–M3 done, M8–M11 deferred)

### [M1 — Project Scaffolding & Routing](plan/M1_PROJECT_SCAFFOLDING_ROUTING.md)
- [x] Vite + React + TypeScript + Radix UI setup
- [x] Directory structure with barrel exports
- [x] Type definitions mirroring backend API
- [x] React Router with all routes
- [x] Layout component with sidebar

### [M2 — Auth Context & API Client](plan/M2_AUTH_CONTEXT_API_CLIENT.md)
- [x] Token utilities (localStorage-based)
- [x] API client with auth interceptors + auto-refresh (orval-generated)
- [x] Auth API functions (login, register, logout, me, refresh)
- [x] AuthContext + useAuth hook
- [x] AuthProvider wired into App

### [M3 — Auth Pages](plan/M3_AUTH_PAGES.md)
- [x] Login page with validation + error handling
- [x] Register page with validation
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Auth routes fully wired in App.tsx

### [M8 — Protected Routes & Current User](plan/M8_PROTECTED_ROUTES_CURRENT_USER.md)
- [ ] RequireAuth component (redirect to `/login`)
- [ ] Protected routes wrapped in App.tsx
- [ ] Layout with real user info + logout
- [ ] RequirePermission component (placeholder for RBAC)
- [ ] Dashboard with user greeting
- [ ] Callback page (placeholder)

### [M9 — User Management Pages](plan/M9_USER_MANAGEMENT_PAGES.md)
- [ ] User list page with pagination
- [ ] User profile page with inline edit
- [ ] Active/inactive status badges
- [ ] Delete (deactivate) user action

### [M10 — RBAC & Role Management](plan/M10_RBAC_ROLE_MANAGEMENT.md)
- [ ] Permission types and groups
- [ ] AuthContext updated with permissions
- [ ] RequirePermission enforced on routes + sidebar
- [ ] Role list page
- [ ] Role manage page with permission checkboxes
- [ ] Assign/revoke roles from user profile

### [M11 — Dashboard, Polish & Testing](plan/M11_DASHBOARD_POLISH_TESTING.md)
- [ ] Dashboard with stats cards (users, roles count)
- [ ] Global error boundary
- [ ] 404 page
- [ ] Consistent loading/error/empty states
- [ ] Playwright E2E test scaffolding
- [ ] Vitest + React Testing Library component and integration tests
- [ ] Environment configuration (.env.example)
- [ ] Final route structure cleanup

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth flow | Direct API (no OAuth2 redirect) | Backend proxies auth, SPA just calls /api/auth/* |
| Token storage | localStorage | Simplicity; backend returns tokens in JSON body |
| API client (auth) | Orval-generated from OpenAPI spec | Auth endpoints are stable; auto-gen reduces boilerplate |
| API client (listings) | Manual functions using `customFetch` | Backend listing endpoints not yet in OpenAPI spec; manual functions allow frontend to develop independently with mocks |
| State management | React Context + hooks | Simple, no extra deps |
| Data fetching | TanStack React Query | Caching, invalidation, loading states out of the box |
| Routing | React Router v7 | Standard SPA routing |
| UI library | Radix UI Themes | Accessible, customizable, AI-friendly (copy-paste) |
| RBAC enforcement | Frontend hides UI, backend enforces | UX only — never trust frontend perm checks |
| Testing | Vitest + React Testing Library + msw | Fast, jsdom, component and integration tests |
| Formatting | Prettier | Consistent code style |
| Linting | ESLint + eslint-config-prettier | Catch errors, not formatting |

## Dependency Order

```
M1 (done) → M2 (done) → M3 (partial)
                            ↓
M4 → M5 → M6 → M7 (current sprint: marketplace features)
                  ↑
                  requires lightweight RequireAuth (from M8)

M8 → M9 → M10 → M11 (deferred: auth template completion)
```