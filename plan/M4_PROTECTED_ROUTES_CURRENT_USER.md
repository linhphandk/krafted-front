# M4 — Protected Routes, Current User & Logout

**Deliverable: Protected routes redirect to login when unauthenticated, Layout shows current user, logout works**

**Depends on: M3**

---

## Key Concept: Route Guards Replace Auth Checks

Every protected page shouldn't need to check `if (!user)` individually. The `RequireAuth` component wraps protected routes and redirects to `/login` when the user isn't authenticated. The `Layout` component reads `useAuth()` to show the current user's email and a logout button.

---

## Task 1 — RequireAuth component (~60loc)

**File**: `src/components/RequireAuth/index.tsx`

`RequireAuth` is a wrapper component that:
- Checks if the user is authenticated via `useAuth()`
- If `isLoading` is true, shows a loading spinner (Radix `Spinner` or a simple centered text)
- If `isAuthenticated` is false, redirects to `/login`
- If `isAuthenticated` is true, renders children

```tsx
import { Navigate, useLocation } from "react-router"
import { Flex, Spinner, Text } from "@radix-ui/themes"
import { useAuth } from "@/context"

interface RequireAuthProps {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spinner size="3" />
        <Text ml="2">Loading...</Text>
      </Flex>
    )
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

**Estimated lines**: ~30loc

---

## Task 2 — Update App.tsx to wrap protected routes (~40loc)

**File**: `src/App.tsx` (update)

Wrap the `Layout` route group with `RequireAuth`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AuthProvider } from "@/context"
import RequireAuth from "./components/RequireAuth"
import Layout from "./components/Layout"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
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
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/callback" element={<CallbackPage />} />

          {/* Protected routes */}
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
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

**Estimated lines**: ~35loc

---

## Task 3 — Update LoginPage to redirect back after login (~20loc)

**File**: `src/pages/auth/LoginPage.tsx` (update)

After successful login, redirect to the URL the user was trying to access before being sent to login (stored in `location.state.from` by `RequireAuth`):

```tsx
// Add at the top of the component:
const location = useLocation()
const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard"

// Change the redirect in handleSubmit:
navigate(from, { replace: true })
```

Import `useLocation` from `react-router` and `Location` type.

**Estimated lines**: ~5loc changes

---

## Task 4 — Layout with real user info + logout (~100loc)

**File**: `src/components/Layout/index.tsx` (update)

Replace the hardcoded email and disabled logout button with real auth data:

```tsx
import { Link, Outlet, useNavigate } from "react-router"
import { Box, Flex, Heading, Button, Text, Separator, DropdownMenu, Avatar } from "@radix-ui/themes"
import { useAuth } from "@/context"

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <Flex style={{ minHeight: "100vh" }}>
      <Box
        style={{
          width: 220,
          borderRight: "1px solid var(--gray-a5)",
          padding: "var(--space-4)",
        }}
      >
        <Heading size="4" mb="4">Krafted</Heading>
        <Separator size="4" mb="4" />
        <Flex direction="column" gap="2">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/roles">Roles</NavLink>
        </Flex>
      </Box>
      <Flex direction="column" style={{ flex: 1 }}>
        <Box
          p="3"
          style={{
            borderBottom: "1px solid var(--gray-a5)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" size="2">
                <Avatar size="1" radius="full" fallback={user?.display_name?.charAt(0) || "?"} />
                <Text size="2" ml="1">{user?.email}</Text>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onClick={() => navigate(`/users/${user?.id}`)}>
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onClick={handleLogout}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Box>
        <Box p="4" style={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Text size="2" style={{ display: "block", padding: "var(--space-2)", borderRadius: "var(--radius-2)" }}>
        {children}
      </Text>
    </Link>
  )
}
```

**Estimated lines**: ~80loc

---

## Task 5 — RequirePermission component (~80loc)

**File**: `src/components/RequirePermission/index.tsx`

For RBAC (M6), we need a component that checks if the current user has a specific permission. For now, create the component but implement it as a pass-through (all permissions granted) since RBAC isn't implemented yet.

```tsx
import { useAuth } from "@/context"
import { Flex, Heading, Text } from "@radix-ui/themes"

interface RequirePermissionProps {
  permission: string
  children: React.ReactNode
}

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { user } = useAuth()

  // TODO: In M6, check actual permissions from user roles
  // For now, all authenticated users have all permissions
  // When RBAC is implemented, replace this with:
  // const permissions = usePermissions()
  // if (!permissions.includes(permission)) {
  //   return <Forbidden />
  // }

  // Temporary: just check if user exists (is authenticated)
  if (!user) {
    return (
      <Flex direction="column" align="center" justify="center" gap="2" style={{ minHeight: "50vh" }}>
        <Heading size="4">Not authorized</Heading>
        <Text size="2" color="gray">You do not have permission to view this page.</Text>
      </Flex>
    )
  }

  return <>{children}</>
}
```

**Estimated lines**: ~30loc (will be expanded in M6)

---

## Task 6 — Dashboard page with user greeting (~50loc)

**File**: `src/pages/DashboardPage.tsx` (update)

Replace the placeholder with a real dashboard that shows the current user's name:

```tsx
import { Heading, Text, Card, Flex } from "@radix-ui/themes"
import { useAuth } from "@/context"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Welcome back, {user?.display_name}</Heading>
      <Card size="2">
        <Flex direction="column" gap="2" p="4">
          <Text size="2" weight="medium">Quick stats</Text>
          <Text size="2" color="gray">You are signed in as {user?.email}</Text>
        </Flex>
      </Card>
    </Flex>
  )
}
```

**Estimated lines**: ~20loc

---

## Task 7 — Callback page (placeholder) (~40loc)

**File**: `src/pages/auth/CallbackPage.tsx`

The callback page is for future OAuth2 redirect support. For now (since we use direct password auth via krafted-back), it just shows a message:

```tsx
import { Heading, Text, Flex } from "@radix-ui/themes"

export default function CallbackPage() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }} direction="column" gap="2">
      <Heading size="5">Processing login...</Heading>
      <Text size="2" color="gray">If you are not redirected, please try logging in again.</Text>
    </Flex>
  )
}
```

This will be expanded if/when OAuth2 PKCE redirect flow is added (e.g., for social login providers).

**Estimated lines**: ~12loc

---

## Task 8 — RequireAuth and RequirePermission tests (~120loc)

**Files**: `src/__tests__/RequireAuth.test.tsx`, `src/__tests__/RequirePermission.test.tsx`

`src/__tests__/RequireAuth.test.tsx` (~70loc):
```tsx
import { describe, it, expect, vi } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import RequireAuth from "../components/RequireAuth"

// Mock useAuth to control auth state
vi.mock("@/context", () => ({
  useAuth: () => ({
    user: { id: "1", email: "test@example.com", display_name: "Test", is_active: true, created_at: "", permissions: [] },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe("RequireAuth", () => {
  it("renders children when authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><div>Protected Content</div></RequireAuth>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })
})
```

`src/__tests__/RequirePermission.test.tsx` (~50loc):
```tsx
import { describe, it, expect, vi } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import RequirePermission from "../components/RequirePermission"

describe("RequirePermission", () => {
  it("renders children when user has permission", () => {
    vi.mock("@/context", () => ({
      useAuth: () => ({
        user: { id: "1", email: "test@example.com", display_name: "Test", is_active: true, created_at: "", permissions: ["users:read"] },
        hasPermission: (p: string) => p === "users:read",
        isAuthenticated: true,
        isLoading: false,
      }),
      AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }))

    render(<RequirePermission permission="users:read"><div>Admin Panel</div></RequirePermission>)
    expect(screen.getByText("Admin Panel")).toBeInTheDocument()
  })

  it("shows forbidden message when user lacks permission", () => {
    vi.mock("@/context", () => ({
      useAuth: () => ({
        user: { id: "1", email: "test@example.com", display_name: "Test", is_active: true, created_at: "", permissions: [] },
        hasPermission: () => false,
        isAuthenticated: true,
        isLoading: false,
      }),
      AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }))

    render(<RequirePermission permission="users:read"><div>Admin Panel</div></RequirePermission>)
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~120loc

---

## Verification

After completing all tasks, you should be able to:

1. Navigate to `/dashboard` without being logged in → redirected to `/login`
2. After URL is `/login?from=/dashboard` (optional: storing attempted URL in state)
3. Login successfully → redirected back to `/dashboard`
4. See the user's email and avatar initial in the top-right dropdown
5. Click "Sign out" → tokens cleared, redirected to `/login`
6. After logout, navigate to `/users` → redirected to `/login`
7. Type a protected URL directly in the address bar → redirected to `/login`, then back after login
8. Refresh the page while logged in → session persists (tokens in localStorage used to fetch `/me`)
9. `npm test` — RequireAuth and RequirePermission tests pass