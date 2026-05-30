# M7 — Dashboard, Polish & Testing

**Deliverable: Functional dashboard page, error handling improvements, loading states, E2E test scaffolding**

**Depends on: M6**

---

## Key Concept: Polish Makes It Real

A working feature is not done until it feels good to use. This milestone adds:
- A real dashboard with meaningful data
- Consistent error handling and loading states across all pages
- E2E test scaffolding with Playwright
- Small UX improvements throughout

---

## Task 1 — Dashboard page with statistics (~120loc)

**File**: `src/pages/DashboardPage.tsx` (update)

Replace the simple "Welcome back" with a real dashboard showing:
- User's name and last login (from auth context)
- Quick stats: total users count, active users, roles count
- Quick links to Users and Roles pages

```tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Heading, Text, Card, Flex, Grid, Badge, Spinner, Callout } from "@radix-ui/themes"
import { useAuth } from "@/context"
import { listUsers } from "@/api/users"
import { listRoles } from "@/api/roles"
import type { PaginatedResponse, User } from "@/types"
import type { Role } from "@/types/role"

export default function DashboardPage() {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [userCount, setUserCount] = useState<number | null>(null)
  const [roleCount, setRoleCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        if (hasPermission("users:read")) {
          const users = await listUsers({ page: 0, per_page: 1 })
          setUserCount(users.total)
        }
        if (hasPermission("roles:read")) {
          const roles = await listRoles()
          setRoleCount(roles.length)
        }
      } catch {
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [hasPermission])

  return (
    <Flex direction="column" gap="5">
      <Heading size="6">Welcome back, {user?.display_name}</Heading>
      <Text size="2" color="gray">Signed in as {user?.email}</Text>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <Grid columns="3" gap="4">
        {hasPermission("users:read") && (
          <Card
            size="2"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/users")}
          >
            <Flex direction="column" gap="1" p="4">
              <Text size="2" color="gray">Total users</Text>
              {isLoading ? (
                <Spinner size="2" />
              ) : (
                <Heading size="7">{userCount ?? "—"}</Heading>
              )}
            </Flex>
          </Card>
        )}

        {hasPermission("roles:read") && (
          <Card
            size="2"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/roles")}
          >
            <Flex direction="column" gap="1" p="4">
              <Text size="2" color="gray">Roles</Text>
              {isLoading ? (
                <Spinner size="2" />
              ) : (
                <Heading size="7">{roleCount ?? "—"}</Heading>
              )}
            </Flex>
          </Card>
        )}

        <Card size="2">
          <Flex direction="column" gap="1" p="4">
            <Text size="2" color="gray">Your permissions</Text>
            <Flex gap="1" wrap="wrap" mt="1">
              {user?.permissions?.map((p) => (
                <Badge key={p} size="1" variant="soft" color="iris">{p}</Badge>
              ))}
              {(!user?.permissions || user.permissions.length === 0) && (
                <Text size="1" color="gray">No special permissions</Text>
              )}
            </Flex>
          </Flex>
        </Card>
      </Grid>
    </Flex>
  )
}
```

**Estimated lines**: ~90loc

---

## Task 2 — Global error boundary (~60loc)

**File**: `src/components/ErrorBoundary/index.tsx`

A React error boundary that catches rendering errors and shows a friendly message instead of a white screen:

```tsx
import { Component, type ReactNode, type ErrorInfo } from "react"
import { Box, Flex, Heading, Text, Button } from "@radix-ui/themes"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          style={{ minHeight: "100vh" }}
        >
          <Heading size="5">Something went wrong</Heading>
          <Text size="2" color="gray">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Button onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Flex>
      )
    }
    return this.props.children
  }
}
```

Wire it in `App.tsx`:
```tsx
import ErrorBoundary from "./components/ErrorBoundary"

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </ErrorBoundary>
  )
}
```

**Estimated lines**: ~45loc (ErrorBoundary) + ~5loc (App.tsx) = ~50loc

---

## Task 3 — 404 page (~30loc)

**File**: `src/pages/NotFoundPage.tsx`

```tsx
import { Flex, Heading, Text, Button } from "@radix-ui/themes"
import { useNavigate } from "react-router"

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Flex direction="column" align="center" justify="center" gap="4" style={{ minHeight: "100vh" }}>
      <Heading size="8">404</Heading>
      <Text size="3" color="gray">Page not found</Text>
      <Button variant="soft" onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
    </Flex>
  )
}
```

Add catch-all route to `App.tsx`:
```tsx
<Route path="*" element={<NotFoundPage />} />
```

**Estimated lines**: ~15loc (NotFound) + ~5loc (route) = ~20loc

---

## Task 4 — Consistent loading and error pattern (~40loc)

**File**: `src/components/PageState/index.tsx`

Extract the common loading/error/empty patterns into reusable components:

```tsx
import { Flex, Spinner, Callout, Text, Heading } from "@radix-ui/themes"

export function PageLoader() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
      <Spinner size="3" />
    </Flex>
  )
}

export function PageError({ message }: { message: string }) {
  return (
    <Callout.Root color="red">
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  )
}

export function PageEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <Flex direction="column" align="center" justify="center" gap="2" style={{ minHeight: "30vh" }}>
      <Heading size="4">{title}</Heading>
      {description && <Text size="2" color="gray">{description}</Text>}
    </Flex>
  )
}
```

Replace all inline `<Flex align="center" justify="center"><Spinner /></Flex>` patterns across page components with `<PageLoader />`, etc.

**Estimated lines**: ~25loc

---

## Task 5 — Vitest component and integration tests (~70loc)

**Note**: Playwright E2E tests were originally planned here but replaced with Vitest — see Task 8 and Task 9 for the actual test implementations.

**Files**: Keep test infrastructure from M1 (`vitest.config.ts`, `src/test/setup.ts`, `src/test/test-utils.tsx`)

No additional test infrastructure setup needed — it's already in place from M1.

**Estimated lines**: 0loc (infrastructure already exists)

---

## Task 6 — Environment configuration (~20loc)

**File**: `.env.example`, `src/env.d.ts`

`.env.example`:
```
VITE_API_URL=http://localhost:3000
```

`src/env.d.ts` (update to include custom env vars):
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

This ensures TypeScript knows about `import.meta.env.VITE_API_URL` and documents the required environment variables.

**Estimated lines**: ~10loc

---

## Task 7 — Final route structure and cleanup (~20loc)

**File**: `src/App.tsx` (final version)

The complete route tree, integrating all components:

```tsx
<ErrorBoundary>
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/callback" element={<CallbackPage />} />

        {/* Protected */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<RequirePermission permission="users:read"><UserListPage /></RequirePermission>} />
          <Route path="/users/:id" element={<UserProfilePage />} />
          <Route path="/roles" element={<RequirePermission permission="roles:read"><RoleListPage /></RequirePermission>} />
          <Route path="/roles/:id" element={<RequirePermission permission="roles:read"><RoleManagePage /></RequirePermission>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
</ErrorBoundary>
```

**Estimated lines**: ~25loc

---

## Final Architecture

```
src/
  pages/
    auth/
      LoginPage.tsx          ~85loc
      RegisterPage.tsx       ~110loc
      ForgotPasswordPage.tsx ~80loc
      ResetPasswordPage.tsx   ~80loc
      CallbackPage.tsx        ~12loc
      index.ts               ~5loc
    users/
      UserListPage.tsx        ~100loc
      UserProfilePage.tsx     ~190loc (with roles section)
      index.ts
    roles/
      RoleListPage.tsx         ~80loc
      RoleManagePage.tsx       ~170loc
      index.ts
    DashboardPage.tsx          ~90loc
    NotFoundPage.tsx           ~15loc
  components/
    Layout/index.tsx            ~80loc
    RequireAuth/index.tsx       ~30loc
    RequirePermission/index.tsx ~30loc
    ErrorBoundary/index.tsx     ~45loc
    PageState/index.tsx          ~25loc
  hooks/
    useAuth.ts (re-exported from context)
    index.ts
  api/
    client.ts                    ~100loc
    auth.ts                      ~60loc
    users.ts                     ~40loc
    roles.ts                     ~25loc
    index.ts                     ~5loc
  context/
    AuthContext.tsx               ~90loc
    index.ts                      ~5loc
  types/
    auth.ts                       ~30loc
    user.ts                       ~20loc
    role.ts                       ~40loc
    api.ts                        ~15loc
    index.ts                      ~5loc
  utils/
    token.ts                      ~60loc
    index.ts                      ~5loc
  test/
    setup.ts                      ~2loc
    test-utils.tsx               ~25loc
  __tests__/
    setup.test.ts                 ~5loc
    App.test.tsx                 ~30loc
    LoginPage.test.tsx          ~100loc
    RegisterPage.test.tsx        ~80loc
    token.test.ts                ~60loc
    client.test.ts               ~90loc
    RequireAuth.test.tsx         ~70loc
    RequirePermission.test.tsx   ~50loc
    UserListPage.test.tsx       ~100loc
    UserProfilePage.test.tsx    ~100loc
    RoleListPage.test.tsx       ~100loc
    PageState.test.tsx           ~40loc
    ErrorBoundary.test.tsx       ~60loc
  App.tsx                          ~35loc
  main.tsx                         ~15loc
  index.css                        ~5loc
```

**Total estimated LOC**: ~1,800loc across all files

---

## Complete Route Map

```
Public (no auth):
  GET  /login              → LoginPage
  GET  /register           → RegisterPage
  GET  /forgot-password    → ForgotPasswordPage
  GET  /reset-password     → ResetPasswordPage
  GET  /callback           → CallbackPage (placeholder for OAuth2)

Protected (auth required):
  GET  /                   → Redirect to /dashboard
  GET  /dashboard          → DashboardPage
  GET  /users              → UserListPage        (requires users:read)
  GET  /users/:id          → UserProfilePage     (any authenticated user)
  GET  /roles              → RoleListPage          (requires roles:read)
  GET  /roles/:id          → RoleManagePage        (requires roles:read)

  GET  *                   → NotFoundPage
```

---

## Task 8 — Component tests for PageState and ErrorBoundary (~100loc)

**Files**: `src/__tests__/PageState.test.tsx`, `src/__tests__/ErrorBoundary.test.tsx`

`src/__tests__/PageState.test.tsx` (~40loc):
```tsx
import { describe, it, expect } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import { PageLoader, PageError, PageEmpty } from "../components/PageState"

describe("PageState components", () => {
  it("PageLoader renders spinner", () => {
    render(<PageLoader />)
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("PageError renders error message", () => {
    render(<PageError message="Something went wrong" />)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("PageEmpty renders title and description", () => {
    render(<PageEmpty title="No users" description="Create one to get started" />)
    expect(screen.getByText("No users")).toBeInTheDocument()
    expect(screen.getByText("Create one to get started")).toBeInTheDocument()
  })
})
```

`src/__tests__/ErrorBoundary.test.tsx` (~60loc):
```tsx
import { describe, it, expect } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorBoundary from "../components/ErrorBoundary"

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error")
  return <div>No error</div>
}

describe("ErrorBoundary", () => {
  // Suppress console.error output from React error boundary
  const originalError = console.error
  beforeEach(() => { console.error = (...args: unknown[]) => {} })
  afterEach(() => { console.error = originalError })

  it("renders children when no error", () => {
    render(<ErrorBoundary><ThrowError shouldThrow={false} /></ErrorBoundary>)
    expect(screen.getByText("No error")).toBeInTheDocument()
  })

  it("renders fallback UI when child throws", () => {
    render(<ErrorBoundary><ThrowError shouldThrow={true} /></ErrorBoundary>)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("shows reload button on error", () => {
    render(<ErrorBoundary><ThrowError shouldThrow={true} /></ErrorBoundary>)
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~100loc

---

## Task 9 — Integration smoke test (~80loc)

**File**: `src/__tests__/App.test.tsx` (update)

Full app rendering test that verifies the route structure and public pages work:

```tsx
import { describe, it, expect } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import App from "../App"

describe("App integration", () => {
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

  it("renders 404 for unknown routes", () => {
    render(
      <MemoryRouter initialEntries={["/nonexistent"]}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("404")).toBeInTheDocument()
  })

  it("renders not found page with dashboard link", () => {
    render(
      <MemoryRouter initialEntries={["/nonexistent"]}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~30loc

---

## Verification

After completing all tasks:

1. `npm run build` — compiles without errors
2. `npm run typecheck` — no type errors
3. `npm run lint` — no errors (warnings ok)
4. `npm run format:check` — all files formatted
5. Navigate through all routes — correct pages render
6. Dashboard shows user stats (users count, roles count, permissions)
7. 404 page renders for unknown routes
8. Error boundary catches and displays rendering errors
9. Loading spinners show consistently across all data pages
10. Error callouts show consistently across all data pages
11. `npm test` — all tests pass (setup, token, client, pages, components, integration)
12. Back button works — all navigation is push-state, no full reloads