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

## Milestones

See `plan/` directory for detailed specs.

### Marketplace (current priority)

- [ ] [M4 — Listing Types + API Client + Hooks](plan/M4_LISTING_TYPES_API_HOOKS.md)
- [ ] [M5 — Browse & Search Listings](plan/M5_BROWSE_LISTINGS.md)
- [ ] [M6 — Listing Detail Page](plan/M6_LISTING_DETAIL.md)
- [ ] [M7 — Create/Edit Listing + My Listings](plan/M7_CREATE_EDIT_MY_LISTINGS.md)

### Auth Template (done or deferred)

- [x] [M1 — Project Scaffolding & Routing](plan/M1_PROJECT_SCAFFOLDING_ROUTING.md)
- [x] [M2 — Auth Context & API Client](plan/M2_AUTH_CONTEXT_API_CLIENT.md)
- [ ] [M3 — Auth Pages](plan/M3_AUTH_PAGES.md) *(partial — Login/Register done)*
- [ ] [M8 — Protected Routes & Current User](plan/M8_PROTECTED_ROUTES_CURRENT_USER.md)
- [ ] [M9 — User Management Pages](plan/M9_USER_MANAGEMENT_PAGES.md)
- [ ] [M10 — RBAC & Role Management](plan/M10_RBAC_ROLE_MANAGEMENT.md)
- [ ] [M11 — Dashboard, Polish & Testing](plan/M11_DASHBOARD_POLISH_TESTING.md)

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