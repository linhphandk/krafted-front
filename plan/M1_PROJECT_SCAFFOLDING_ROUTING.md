# M1 — Project Scaffolding & Routing

**Deliverable: Vite + React + TypeScript app boots, routes resolve, Radix UI theme renders**

**Depends on: Nothing (first milestone)**

---

## Principle: Backend Is the Authority

The frontend never manages auth directly. Every auth operation goes through our REST API (`/api/auth/*`). The frontend stores tokens, injects them into requests, and handles redirects — but never validates JWTs or talks to Authentik directly.

---

## Task 1 — Vite + React + TypeScript project setup (~50loc)

**Files**: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

The project is already scaffolded with Vite. Verify the following are in place:

`package.json` dependencies:
```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router": "^7",
    "@radix-ui/themes": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "vite": "^6",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "@types/node": "^22"
  }
}
```

`tsconfig.app.json` must have path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`vite.config.ts` must have the `@` alias and Tailwind + React plugins:
```ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

`src/main.tsx` — wraps the app in Radix Theme:
```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import "@radix-ui/themes/typography.css"
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="iris" radius="medium" scaling="100%">
      <App />
    </Theme>
  </StrictMode>,
)
```

`src/index.css`:
```css
@import "tailwindcss";
```

**Estimated lines**: ~30loc (config files combined, not counting package.json lockfile)

---

## Task 2 — Directory structure + barrel files (~30loc)

**Files**: All module directories with `index.ts` barrel exports

Create the full directory structure. Each directory gets an `index.ts` that re-exports its public API:

```
src/
  pages/
    auth/index.ts
    users/index.ts
    roles/index.ts
    DashboardPage.tsx
  components/
    Layout/index.tsx
    RequireAuth/index.tsx
    RequirePermission/index.tsx
  hooks/
    useAuth.ts
    index.ts
  api/
    client.ts
    auth.ts
    users.ts
    roles.ts
    index.ts
  context/
    AuthContext.tsx
    index.ts
  types/
    auth.ts
    user.ts
    role.ts
    api.ts
    index.ts
  utils/
    token.ts
    index.ts
  App.tsx
  main.tsx
```

Each `index.ts` re-exports only what other modules need. For now, create them as empty stubs with a comment `// Implemented in M<N>`. This ensures imports resolve and the project compiles.

**Estimated lines**: ~30loc (one-line barrel files)

---

## Task 3 — Type definitions (~80loc)

**Files**: `src/types/auth.ts`, `src/types/user.ts`, `src/types/role.ts`, `src/types/api.ts`, `src/types/index.ts`

These types mirror the backend API responses. They are the contract between frontend and backend.

`src/types/auth.ts` (~30loc):
```ts
export interface User {
  id: string
  email: string
  display_name: string
  is_active: boolean
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  display_name: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: "Bearer"
}

export interface LoginResponse extends AuthTokens {
  user: User
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}
```

`src/types/user.ts` (~20loc):
```ts
export interface User {
  id: string
  email: string
  display_name: string
  is_active: boolean
  created_at: string
}

export interface UpdateUserRequest {
  display_name?: string
  email?: string
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}

export interface ListQueryParams {
  page?: number
  per_page?: number
}
```

`src/types/role.ts` (~15loc):
```ts
export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface AssignRoleRequest {
  role_id: string
}
```

`src/types/api.ts` (~15loc):
```ts
export interface ApiError {
  error: string
}

export interface MessageResponse {
  message: string
}
```

`src/types/index.ts` — re-exports everything:
```ts
export * from "./auth"
export * from "./user"
export * from "./role"
export * from "./api"
```

Note: `User` appears in both `auth.ts` and `user.ts`. They represent the same shape. Keep one canonical definition — remove the duplicate from `auth.ts` and import `User` from `./user` in `auth.ts`.

**Estimated lines**: ~80loc

---

## Task 4 — React Router setup with route structure (~120loc)

**Files**: `src/App.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/CallbackPage.tsx`, `src/pages/users/UserListPage.tsx`, `src/pages/users/UserProfilePage.tsx`, `src/pages/roles/RoleListPage.tsx`, `src/pages/roles/RoleManagePage.tsx`, `src/pages/DashboardPage.tsx`

`src/App.tsx` — defines the route tree:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { Theme } from "@radix-ui/themes"
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
    </BrowserRouter>
  )
}
```

Layout uses React Router's `<Outlet />` pattern — `Layout` renders a sidebar + topbar and `<Outlet />` where child routes render.

Each page is a minimal placeholder for now — just enough to verify routing works:

```tsx
import { Heading } from "@radix-ui/themes"

export default function DashboardPage() {
  return <Heading size="5">Dashboard</Heading>
}
```

Create similar placeholders for every page listed above.

**Estimated lines**: ~40loc (App.tsx) + ~60loc (7 placeholder pages × ~8loc) + ~20loc (Layout) = ~120loc

---

## Task 5 — Layout component with Radix UI (~100loc)

**Files**: `src/components/Layout/index.tsx`

The `Layout` component is the authenticated shell. It wraps all protected routes and provides:
- A left sidebar with navigation links (Dashboard, Users, Roles)
- A top bar with the current user's email and a logout button
- A `<Outlet />` for child route content

```tsx
import { Link, Outlet, useNavigate } from "react-router"
import { Box, Flex, Heading, Button, Text, Separator } from "@radix-ui/themes"

export default function Layout() {
  return (
    <Flex style={{ minHeight: "100vh" }}>
      <Box
        style={{
          width: 220,
          borderRight: "1px solid var(--gray-a5)",
          padding: "var(--space-4)",
          background: "var(--color-background)",
        }}
      >
        <Heading size="4" mb="4">Krafted</Heading>
        <Flex direction="column" gap="2">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/users">Users</Link>
          <Link to="/roles">Roles</Link>
        </Flex>
      </Box>
      <Flex direction="column" style={{ flex: 1 }}>
        <Box
          p="3"
          style={{
            borderBottom: "1px solid var(--gray-a5)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Text size="2" mr="3">user@example.com</Text>
          <Button size="1" variant="ghost">Logout</Button>
        </Box>
        <Box p="4" style={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
```

This is a hardcoded layout for now — the logout button and user email will be wired to real auth state in M2/M3.

**Estimated lines**: ~40loc (Layout) + ~60loc (styling tweaks) = ~100loc

---

## Task 6 — Vitest + React Testing Library setup (~60loc)

**Files**: `vitest.config.ts`, `src/test/setup.ts`, `src/test/test-utils.tsx`, `package.json` (scripts)

This task is **already completed** in the project scaffold. The files exist at:
- `vitest.config.ts` — Vitest configuration with jsdom environment and `@/` alias
- `src/test/setup.ts` — Imports `@testing-library/jest-dom/vitest`
- `src/test/test-utils.tsx` — `renderWithProviders` wrapping in Theme + BrowserRouter

Installed dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `msw`

Package scripts:
- `npm test` — `vitest run`
- `npm run test:watch` — `vitest`
- `npm run test:coverage` — `vitest run --coverage`

**No code to write — just verify `npm test` passes.**

**Estimated lines**: 0loc (already scaffolded)

---

## Task 7 — Route resolution tests (~40loc)

**File**: `src/__tests__/App.test.tsx`

Test that routes render the correct components:

```tsx
import { describe, it, expect } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import LoginPage from "../pages/auth/LoginPage"
import DashboardPage from "../pages/DashboardPage"

describe("App routing", () => {
  it("renders login page at /login", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders dashboard page", () => {
    render(<DashboardPage />)
    expect(screen.getByRole("heading")).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~25loc

---

## Verification

After completing all tasks, you should be able to:

1. Run `npm run dev` — app boots at `http://localhost:5173`
2. Navigate to `/` — redirects to `/dashboard`
3. Navigate to `/login` — shows Login placeholder
4. Navigate to `/users` — shows Users placeholder (layout with sidebar)
5. Navigate to `/roles` — shows Roles placeholder (layout with sidebar)
6. All routes render with Radix Theme applied (iris accent color)
7. Run `npm run build` — compiles without errors
8. Run `npm run typecheck` — no type errors
9. Run `npm test` — vitest runs, route tests pass
10. Run `npm run test:watch` — vitest runs in watch mode