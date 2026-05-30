# M3 — Auth Pages (Login, Register, Forgot Password)

**Deliverable: Fully functional login, register, and password reset pages connected to the API**

**Depends on: M2**

---

## Key Concept: Forms Are the Front Door

Auth pages are the first thing users see. They must be:
- **Fast** — no loading flicker on initial render
- **Clear** — error messages shown inline, no alerts
- **Accessible** — proper labels, focus management, keyboard nav
- **Secure** — no password in URL, no sensitive data in logs

All auth pages use Radix UI form elements (`TextField.Root`, `Button`, `Callout`) for consistent styling and accessibility.

---

## Task 1 — Login page (~150loc)

**File**: `src/pages/auth/LoginPage.tsx`

The login page:
- Shows email + password fields
- Validates input client-side before making the API call
- Shows a Radix `Callout` on error (wrong credentials, network error)
- Redirects to `/dashboard` on success
- Links to forgot-password and register pages

```tsx
import { useState, type FormEvent } from "react"
import { useNavigate, Link } from "react-router"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { useAuth } from "@/context"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      // API returns { error: "message" } format
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Sign in</Heading>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">Email</Text>
                <TextField.Root
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">Password</Text>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Box>

              <Button type="submit" loading={isLoading} size="3">
                Sign in
              </Button>
            </Flex>
          </form>

          <Flex justify="between" align="center">
            <Link to="/forgot-password">
              <Text size="2" color="iris">Forgot password?</Text>
            </Link>
            <Link to="/register">
              <Text size="2" color="iris">Create account</Text>
            </Link>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
```

**Estimated lines**: ~85loc

---

## Task 2 — Register page (~130loc)

**File**: `src/pages/auth/RegisterPage.tsx`

Same structure as login but with an extra `display_name` field:

- Fields: display_name, email, password, confirm password
- Client-side validation: email format, password length >= 8, passwords match
- Calls `register()` from `useAuth()`
- Redirects to `/dashboard` on success
- Links to login page

```tsx
import { useState, type FormEvent } from "react"
import { useNavigate, Link } from "react-router"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { useAuth } from "@/context"

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!displayName || !email || !password) {
      setError("All fields are required")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await register(email, password, displayName)
      navigate("/dashboard")
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Registration failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Create account</Heading>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">Display name</Text>
                <TextField.Root
                  placeholder="Jane Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Email</Text>
                <TextField.Root
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Password</Text>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Confirm password</Text>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>
              <Button type="submit" loading={isLoading} size="3">
                Create account
              </Button>
            </Flex>
          </form>

          <Text size="2" align="center">
            Already have an account? <Link to="/login"><Text color="iris">Sign in</Text></Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}
```

**Estimated lines**: ~110loc

---

## Task 3 — Forgot password page (~100loc)

**File**: `src/pages/auth/ForgotPasswordPage.tsx`

Simple page that:
- Takes an email
- Calls `forgotPassword()` API
- Always shows "If the email exists, a reset link has been sent" (prevents enumeration)
- Links back to login

```tsx
import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { forgotPassword } from "@/api/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Email is required")
      return
    }

    setIsLoading(true)
    try {
      await forgotPassword({ email })
      setSent(true)
    } catch {
      // Still show success message to prevent email enumeration
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Card size="2" style={{ width: 400 }}>
          <Flex direction="column" gap="3" p="4">
            <Heading size="5" align="center">Check your email</Heading>
            <Text size="2" align="center">
              If the email exists, a reset link has been sent.
            </Text>
            <Link to="/login">
              <Text size="2" color="iris">Back to sign in</Text>
            </Link>
          </Flex>
        </Card>
      </Box>
    )
  }

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Reset password</Heading>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">Email</Text>
                <TextField.Root
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Box>
              <Button type="submit" loading={isLoading} size="3">
                Send reset link
              </Button>
            </Flex>
          </form>

          <Link to="/login">
            <Text size="2" color="iris">Back to sign in</Text>
          </Link>
        </Flex>
      </Card>
    </Box>
  )
}
```

**Estimated lines**: ~80loc

---

## Task 4 — Reset password page (~100loc)

**File**: `src/pages/auth/ResetPasswordPage.tsx`

This page is accessed via the link in the password reset email. The URL format is `/reset-password?token=abc123`.

- Reads `token` from URL search params
- Takes `new_password` and `confirm_password`
- Validates passwords match and are >= 8 characters
- Calls `resetPassword()` API
- Shows success message and link back to login

```tsx
import { useState, type FormEvent } from "react"
import { useSearchParams, Link } from "react-router"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { resetPassword } from "@/api/auth"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Invalid reset link. Please request a new one.")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await resetPassword({ token, new_password: newPassword })
      setSuccess(true)
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Password reset failed. The link may have expired.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Card size="2" style={{ width: 400 }}>
          <Flex direction="column" gap="3" p="4">
            <Heading size="5" align="center">Password reset</Heading>
            <Text size="2" align="center">Your password has been reset successfully.</Text>
            <Link to="/login"><Text color="iris">Sign in</Text></Link>
          </Flex>
        </Card>
      </Box>
    )
  }

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Set new password</Heading>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">New password</Text>
                <TextField.Root
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Confirm password</Text>
                <TextField.Root
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>
              <Button type="submit" loading={isLoading} size="3">
                Reset password
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}
```

**Estimated lines**: ~80loc

---

## Task 5 — Update routes in App.tsx (~30loc)

**File**: `src/App.tsx` (update)

Add the new auth routes. These are all public (no auth guard):

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AuthProvider } from "@/context"
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}
```

**Estimated lines**: ~30loc (updated App.tsx)

---

## Task 6 — Auth pages barrel exports (~10loc)

**Files**: `src/pages/auth/index.ts`

```ts
export { default as LoginPage } from "./LoginPage"
export { default as RegisterPage } from "./RegisterPage"
export { default as ForgotPasswordPage } from "./ForgotPasswordPage"
export { default as ResetPasswordPage } from "./ResetPasswordPage"
export { default as CallbackPage } from "./CallbackPage"
```

**Estimated lines**: ~5loc

---

## Task 7 — Auth page component tests (~200loc)

**Files**: `src/__tests__/LoginPage.test.tsx`, `src/__tests__/RegisterPage.test.tsx`

`src/__tests__/LoginPage.test.tsx` (~120loc):
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import LoginPage from "../pages/auth/LoginPage"

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: "bypass" })
  localStorage.clear()
})
afterEach(() => {
  server.resetHandlers()
  server.close()
})

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("shows validation error when fields are empty", async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.click(screen.getByRole("button", { name: /sign in/i }))
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })

  it("shows error on invalid credentials", async () => {
    server.use(
      http.post("http://localhost:3000/api/auth/login", () => {
        return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }),
    )
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), "wrong@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument()
    })
  })

  it("has links to register and forgot password", () => {
    render(<LoginPage />)
    expect(screen.getByText(/create account/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })
})
```

`src/__tests__/RegisterPage.test.tsx` (~80loc):
```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import RegisterPage from "../pages/auth/RegisterPage"

describe("RegisterPage", () => {
  beforeEach(() => { localStorage.clear() })

  it("renders all registration fields", () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/display name/i), "Test User")
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByPlaceholderText(/••••••••/i), "password123")
    // Type mismatched confirm password — need to find the second password field
    const passwordFields = screen.getAllByPlaceholderText(/••••••••/i)
    await user.type(passwordFields[1], "different456")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(screen.getByText(/do not match/i)).toBeInTheDocument()
  })

  it("shows error when password is too short", async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/display name/i), "Test User")
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    const passwordFields = screen.getAllByPlaceholderText(/••••••••/i)
    await user.type(passwordFields[0], "short")
    await user.type(passwordFields[1], "short")
    await user.click(screen.getByRole("button", { name: /create account/i }))
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~120loc + ~80loc = ~200loc

---

## Verification

After completing all tasks, you should be able to:

1. Navigate to `/login` — shows login form with email, password, submit button
2. Fill in credentials, submit — calls `POST /api/auth/login`, stores tokens, redirects to `/dashboard`
3. Navigate to `/register` — shows registration form with display_name, email, password, confirm password
4. Submit registration — calls `POST /api/auth/register`, stores tokens, redirects to `/dashboard`
5. Navigate to `/forgot-password` — shows email input, submit sends reset request
6. Navigate to `/reset-password?token=abc` — shows new password form
7. Error states show red `Callout` with error message
8. Loading states show `Button` with `loading` prop
9. All forms have proper labels, `autoComplete` attributes, and keyboard navigation
10. `npm test` — all auth page tests pass