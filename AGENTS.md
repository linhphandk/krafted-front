# AGENTS.md — Project Conventions

## Behavior

- Always use caveman mode (bone intensity). No filler, no hedging, fragments OK.
- Always open a pull request instead of committing directly to main.

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

- `src/api/client.ts` — Fetch wrapper with auto-refresh interceptor. ALL API calls go through `apiClient()`.
- `src/context/AuthContext.tsx` — Auth state. Use `useAuth()` hook, never access localStorage directly.
- `src/utils/token.ts` — Token storage. Use these functions, never raw `localStorage.getItem`.
- `src/components/Layout/` — App shell with sidebar. All protected routes render inside `<Outlet />`.
- `src/components/RequireAuth/` — Auth guard. Redirects to `/login` if unauthenticated.
- `src/components/RequirePermission/` — RBAC guard. Shows forbidden page if user lacks permission.
- `src/components/ErrorBoundary/` — Catches rendering errors.
- `src/components/PageState/` — Reusable `PageLoader`, `PageError`, `PageEmpty` components.

## Import Convention

- Use `@/` alias: `import { useAuth } from "@/context"` not `import { useAuth } from "../../context"`
- Barrel exports via `index.ts` in each module directory
- Types imported from `@/types`

## File Naming

- Pages: `PascalCasePage.tsx` (e.g., `LoginPage.tsx`, `UserListPage.tsx`)
- Components: `PascalCase/index.tsx` (e.g., `Layout/index.tsx`, `RequireAuth/index.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- API modules: `camelCase.ts` (e.g., `auth.ts`, `users.ts`)
- Types: `camelCase.ts` (e.g., `auth.ts`, `user.ts`, `role.ts`)
- Test files: `PascalCase.test.tsx` co-located or `__tests__/PascalCase.test.tsx`

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
- `POST /api/roles` — `{name, description, permissions}`
- `PATCH /api/roles/:id`
- `DELETE /api/roles/:id`
- `POST /api/users/:id/roles` — `{role_id}`
- `DELETE /api/users/:id/roles/:roleId`

All error responses: `{ error: string }`

## Do NOT

- Do not install shadcn, MUI, Chakra, or any component library besides Radix Themes
- Do not read or search `node_modules`
- Do not add comments unless explicitly asked
- Do not use `any` type — prefer unknown or proper types
- Do not access `localStorage` directly outside `src/utils/token.ts`
- Do not make raw `fetch` calls outside `src/api/client.ts`