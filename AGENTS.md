# AGENTS.md — Project Conventions

## Behavior

- Always use caveman mode (bone intensity). No filler, no hedging, fragments OK.
- Always open a pull request instead of committing directly to main.
- Always check what needs to be done and give a summary before starting work. Never start coding immediately.

## Stack

- React 19 + TypeScript (~6.x) + Vite 8
- @radix-ui/themes (UI library) — NOT shadcn, NOT MUI, NOT Chakra
- React Router v7 (routing)
- Tailwind CSS v4 (utility classes alongside Radix)
- Vitest + React Testing Library (testing)
- Prettier (formatting) + ESLint (linting)

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm test` | Vitest run |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage |

**Run `npm run typecheck` and `npm run lint` after completing tasks.**

## Architecture

- `src/api/generated.ts` — Orval-generated auth endpoints. Do not edit manually. Regenerate with `orval`.
- `src/api/custom-fetch.ts` — Fetch wrapper used by orval-generated code. Handles auth headers + token refresh.
- `src/api/auth-interceptor.ts` — Token refresh logic (ensure valid token, refresh when expired).
- `src/api/listings.ts` — Manual listing API functions (not orval-generated). Uses `customFetch`.
- `src/api/categories.ts` — Manual category API functions (not orval-generated). Uses `customFetch`.
- `src/context/AuthContext.tsx` — Auth state. Use `useAuth()` hook, never access localStorage directly.
- `src/utils/token.ts` — Token storage. Use these functions, never raw `localStorage.getItem`.
- `src/hooks/useListings.ts` — React Query hooks for listings and categories.
- `src/types/listing.ts` — Listing, Category, and related types.
- `src/components/RequireAuth/` — Auth guard. Redirects to `/login` if unauthenticated.
- `src/components/RequirePermission/` — RBAC guard. Shows forbidden page if user lacks permission. (Not yet implemented)
- `src/components/Layout/` — App shell with sidebar. All protected routes render inside `<Outlet />`. (Not yet implemented)
- `src/components/ErrorBoundary/` — Catches rendering errors. (Not yet implemented)
- `src/components/PageState/` — Reusable `PageLoader`, `PageError`, `PageEmpty` components. (Not yet implemented)
- `src/components/ListingCard/` — Listing card for browse page.
- `src/components/ListingsFilter/` — Filter bar for browse page.
- `src/components/Pagination/` — Pagination component.

## Import Convention

- Use `@/` alias: `import { useAuth } from "@/context"` not `import { useAuth } from "../../context"`
- Barrel exports via `index.ts` in each module directory
- Types imported from `@/types`

## File Naming

- Pages: `PascalCasePage.tsx` (e.g., `LoginPage.tsx`, `UserListPage.tsx`)
- Components: `PascalCase/index.tsx` (e.g., `Layout/index.tsx`, `RequireAuth/index.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- API modules: `camelCase.ts` (e.g., `listings.ts`, `categories.ts`)
- Types: `camelCase.ts` (e.g., `listing.ts`, `user.ts`, `role.ts`)
- Test files: `PascalCase.test.tsx` co-located or `__tests__/PascalCase.test.tsx`

## Component Style

- Use `const ComponentName = () => { ... }` + `export default ComponentName`
- Never use `export default function ComponentName()`

## Styling

- Use Radix UI components (`<Button>`, `<Card>`, `<TextField.Root>`, etc.) as primary building blocks
- Use Tailwind utility classes for layout spacing (`flex`, `gap-4`, `p-4`, etc.)
- Use CSS variables from Radix theme (`var(--gray-a5)`, `var(--iris-11)`, etc.) for colors
- Do NOT add shadcn components. Radix Themes is the UI library.
- Theme config: accentColor="iris", radius="medium", scaling="100%"

## Testing

- Vitest with jsdom environment
- Test setup: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`)
- Custom render: `src/test/test-utils.tsx` (wraps in Theme + BrowserRouter)
- Use `renderWithProviders` from test-utils, not raw `render`
- Use `@testing-library/user-event` for interactions, NOT `fireEvent`
- Use `msw` for API mocking in integration tests
- All new features MUST include tests

## API Contract

Base URL: `VITE_API_URL` env var (defaults to `http://localhost:3000`)

Auth endpoints (public):
- `POST /api/auth/register` — `{email, password, display_name}`
- `POST /api/auth/login` — `{email, password}`
- `POST /api/auth/refresh` — `{refresh_token}`
- `POST /api/auth/logout` — `{access_token}`
- `POST /api/auth/forgot-password` — `{email}`
- `POST /api/auth/reset-password` — `{token, new_password}`

Auth endpoints (protected):
- `GET /api/auth/me` — returns `UserWithPermissions`

User endpoints (protected):
- `GET /api/users?page=&per_page=` — paginated list
- `GET /api/users/:id`
- `PATCH /api/users/:id` — `{display_name?, email?, is_active?}`
- `DELETE /api/users/:id` — soft delete

Role endpoints (protected, requires roles:read/write):
- `GET /api/roles`
- `GET /api/roles/:id`
- `POST /api/roles` — `{name, description, permissions}`
- `PATCH /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/users/:id/roles` — user's assigned roles
- `POST /api/users/:id/roles` — `{role_id}`
- `DELETE /api/users/:id/roles/:roleId`

All error responses: `{ error: string }`

Listing endpoints (public):
- `GET /api/listings?page=&per_page=&status=&category_id=&kind=&search=&sort=` — paginated listings (active only for public)
- `GET /api/listings/:id` — single listing
- `GET /api/categories` — all categories
- `GET /api/categories?kind=craft|supply` — categories filtered by kind

Listing endpoints (protected):
- `POST /api/listings` — create listing `{title, description, price_cents, category_id, condition, quantity, status?}`
- `PATCH /api/listings/:id` — update listing (partial)
- `DELETE /api/listings/:id` — delete listing
- `POST /api/listings/:id/publish` — set status to "active"
- `POST /api/listings/:id/pause` — set status to "paused"
- `GET /api/listings/mine?page=&per_page=&status=` — current user's listings (optional status filter)

## Do NOT

- Do not install shadcn, MUI, Chakra, or any component library besides Radix Themes
- Do not read or search `node_modules`
- Do not add comments unless explicitly asked
- Do not use `any` type — prefer unknown or proper types
- Do not access `localStorage` directly outside `src/utils/token.ts`
- Do not make raw `fetch` calls outside `src/api/custom-fetch.ts`

## Refresh Token Strategy (Source: Auth0)
- **Store refresh tokens in localStorage or browser memory** — safe when rotation is enabled on the backend
- **Use Authorization Code Flow with PKCE** for SPAs — never use Implicit Flow
- **When access token expires**: call `POST /api/auth/refresh` with the stored refresh token
- **On refresh response**: save the NEW access token AND the NEW refresh token (rotation)
- **On "Access Denied" from refresh**: clear all tokens, redirect to `/login` (token family was invalidated)
- **Handle race conditions**: if refresh fails with 401/403, assume compromise and force re-authentication
- **Balance UX and security**: short access token expiry (minutes) + longer refresh token window (days)