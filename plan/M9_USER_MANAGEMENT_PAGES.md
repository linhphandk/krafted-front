# M9 — User Management Pages

**Deliverable: Authenticated users can view users list, user profile, and admins can update/delete users**

**Depends on: M8**

---

## Key Concept: Data Pages Follow a Pattern

Every data management page follows the same pattern:
1. **Fetch data** on mount using the API client
2. **Show loading state** while fetching (Radix `Spinner`)
3. **Show error state** if fetch fails (Radix `Callout`)
4. **Show empty state** if no data (heading + "No items yet" message)
5. **Render data** in a table or detail view using Radix components

This milestone implements that pattern for the User domain.

---

## Task 1 — User list page with pagination (~200loc)

**File**: `src/pages/users/UserListPage.tsx`

A paginated table of all users. Uses Radix `Table`, `Button`, `Text`, `Badge`, `Flex`, and `Pagination` components.

Features:
- Fetches users from `GET /api/users` with page/per_page query params
- Shows loading spinner while fetching
- Shows error callout if fetch fails
- Displays users in a sortable table (email, display name, active status, created date)
- Pagination controls at the bottom
- "View" button on each row that navigates to `/users/:id`
- "Delete" button on each row (soft delete — sets `is_active` to false)
- "Add user" button at the top (navigates to register page or shows inline form)

```tsx
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import { Box, Flex, Heading, Table, Text, Badge, Button, Callout, Spinner, Pagination } from "@radix-ui/themes"
import { listUsers, deleteUser } from "@/api/users"
import type { User, PaginatedResponse } from "@/types"

export default function UserListPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PaginatedResponse<User> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const perPage = 20

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listUsers({ page, per_page: perPage })
      setData(result)
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Failed to load users")
      }
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to deactivate this user?")) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch {
      // Could show a toast here — for now, just refetch
    }
  }

  if (isLoading && !data) {
    return <Flex align="center" justify="center" style={{ minHeight: "50vh" }}><Spinner size="3" /></Flex>
  }

  if (error) {
    return (
      <Callout.Root color="red">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="5">Users</Heading>
        <Button onClick={() => navigate("/register")}>Add user</Button>
      </Flex>

      {data && data.items.length === 0 ? (
        <Text color="gray">No users found.</Text>
      ) : (
        <>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Display name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.items.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.display_name}</Table.Cell>
                  <Table.Cell>
                    <Badge color={user.is_active ? "green" : "red"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{new Date(user.created_at).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button size="1" variant="soft" onClick={() => navigate(`/users/${user.id}`)}>
                        View
                      </Button>
                      <Button size="1" variant="soft" color="red" onClick={() => handleDelete(user.id)}>
                        Deactivate
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {data && data.total > perPage && (
            <Flex justify="center" mt="4">
              <Pagination
                currentPage={page + 1}
                totalPages={Math.ceil(data.total / perPage)}
                onPageChange={(p) => setPage(p - 1)}
              />
            </Flex>
          )}
        </>
      )}
    </Flex>
  )
}
```

**Estimated lines**: ~100loc

---

## Task 2 — User profile/detail page (~180loc)

**File**: `src/pages/users/UserProfilePage.tsx`

Shows a single user's full profile with an edit form. Uses URL param `:id` to fetch the user.

Features:
- Fetches user by ID from `GET /api/users/:id`
- Displays user info in a card (email, display name, status, created date)
- Inline edit form for display name, email, and active status
- Save button calls `PATCH /api/users/:id`
- Cancel button reverts changes
- "Back to users" link

```tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Box, Card, Flex, Heading, Text, TextField, Button, Badge, Callout, Spinner, Switch } from "@radix-ui/themes"
import { getUser, updateUser } from "@/api/users"
import type { User, UpdateUserRequest } from "@/types"

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  useEffect(() => {
    if (!id) return
    getUser(id)
      .then(setUser)
      .catch(() => setError("Failed to load user"))
      .finally(() => setIsLoading(false))
  }, [id])

  function startEditing() {
    if (!user) return
    setEditDisplayName(user.display_name)
    setEditEmail(user.email)
    setEditIsActive(user.is_active)
    setIsEditing(true)
  }

  async function handleSave() {
    if (!id) return
    setIsSaving(true)
    setError(null)

    const updates: UpdateUserRequest = {}
    if (editDisplayName !== user!.display_name) updates.display_name = editDisplayName
    if (editEmail !== user!.email) updates.email = editEmail
    if (editIsActive !== user!.is_active) updates.is_active = editIsActive

    try {
      const updated = await updateUser(id, updates)
      setUser(updated)
      setIsEditing(false)
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Failed to update user")
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Flex align="center" justify="center"><Spinner size="3" /></Flex>
  if (!user) return <Callout.Root color="red"><Callout.Text>User not found</Callout.Text></Callout.Root>

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="5">User Profile</Heading>
        <Button variant="soft" onClick={() => navigate("/users")}>Back to users</Button>
      </Flex>

      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}

      <Card size="2">
        <Flex direction="column" gap="4" p="4">
          {isEditing ? (
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">Display name</Text>
                <TextField.Root value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Email</Text>
                <TextField.Root value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </Box>
              <Flex align="center" gap="2">
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                <Text size="2">Active</Text>
              </Flex>
              <Flex gap="2">
                <Button onClick={handleSave} loading={isSaving}>Save</Button>
                <Button variant="soft" onClick={() => setIsEditing(false)}>Cancel</Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Email</Text>
                <Text>{user.email}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Display name</Text>
                <Text>{user.display_name}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Status</Text>
                <Badge color={user.is_active ? "green" : "red"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Created</Text>
                <Text>{new Date(user.created_at).toLocaleDateString()}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">ID</Text>
                <Text size="1" color="gray">{user.id}</Text>
              </Flex>
              <Button onClick={startEditing}>Edit</Button>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}
```

**Estimated lines**: ~130loc

---

## Task 3 — Update Layout sidebar with active states (~30loc)

**File**: `src/components/Layout/index.tsx` (update)

Add active link highlighting using `useLocation` to detect the current route:

```tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router"
// ... existing imports

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Text
        size="2"
        style={{
          display: "block",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-2)",
          background: isActive ? "var(--iris-a3)" : "transparent",
          color: isActive ? "var(--iris-11)" : "inherit",
        }}
      >
        {children}
      </Text>
    </Link>
  )
}
```

**Estimated lines**: ~20loc added

---

## Task 4 — "My profile" link from Layout dropdown (~10loc)

**File**: `src/components/Layout/index.tsx` (update)

The dropdown already has a "Profile" link from M8. Wire it to navigate to the current user's profile:

```tsx
<DropdownMenu.Item onClick={() => navigate(`/users/${user?.id}`)}>
  Profile
</DropdownMenu.Item>
```

This already works since M8 added this line. Just verify it's correct.

**Estimated lines**: 0loc (verification only)

---

## Task 5 — User list and profile tests (~200loc)

**Files**: `src/__tests__/UserListPage.test.tsx`, `src/__tests__/UserProfilePage.test.tsx`

`src/__tests__/UserListPage.test.tsx` (~100loc):
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import UserListPage from "../pages/users/UserListPage"

const mockUsers = {
  items: [
    { id: "1", email: "alice@test.com", display_name: "Alice", is_active: true, created_at: "2025-01-01T00:00:00Z" },
    { id: "2", email: "bob@test.com", display_name: "Bob", is_active: false, created_at: "2025-01-02T00:00:00Z" },
  ],
  total: 2,
  page: 0,
  per_page: 20,
}

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: "bypass" })
  localStorage.clear()
  // Set a token so apiClient sends auth header
  localStorage.setItem("krafted_access_token", "test-token")
  localStorage.setItem("krafted_refresh_token", "test-refresh")
  localStorage.setItem("krafted_token_expiry", String(Date.now() + 3600000))
})
afterEach(() => { server.resetHandlers(); server.close() })

describe("UserListPage", () => {
  it("renders loading state then user list", async () => {
    server.use(
      http.get("http://localhost:3000/api/users", () => {
        return HttpResponse.json(mockUsers)
      }),
    )
    render(<UserListPage />)
    await waitFor(() => {
      expect(screen.getByText("alice@test.com")).toBeInTheDocument()
      expect(screen.getByText("bob@test.com")).toBeInTheDocument()
    })
  })

  it("shows active/inactive badges", async () => {
    server.use(
      http.get("http://localhost:3000/api/users", () => {
        return HttpResponse.json(mockUsers)
      }),
    )
    render(<UserListPage />)
    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument()
      expect(screen.getByText("Inactive")).toBeInTheDocument()
    })
  })

  it("shows error when API fails", async () => {
    server.use(
      http.get("http://localhost:3000/api/users", () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
      }),
    )
    render(<UserListPage />)
    await waitFor(() => {
      expect(screen.getByText(/unauthorized|failed/i)).toBeInTheDocument()
    })
  })
})
```

`src/__tests__/UserProfilePage.test.tsx` (~100loc):
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Routes, Route } from "react-router"
import UserProfilePage from "../pages/users/UserProfilePage"

const mockUser = {
  id: "1",
  email: "alice@test.com",
  display_name: "Alice",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
}

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: "bypass" })
  localStorage.clear()
  localStorage.setItem("krafted_access_token", "test-token")
  localStorage.setItem("krafted_refresh_token", "test-refresh")
  localStorage.setItem("krafted_token_expiry", String(Date.now() + 3600000))
})
afterEach(() => { server.resetHandlers(); server.close() })

describe("UserProfilePage", () => {
  it("renders user profile from API", async () => {
    server.use(
      http.get("http://localhost:3000/api/users/1", () => {
        return HttpResponse.json(mockUser)
      }),
    )
    render(
      <MemoryRouter initialEntries={["/users/1"]}>
        <Routes>
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText("alice@test.com")).toBeInTheDocument()
      expect(screen.getByText("Alice")).toBeInTheDocument()
    })
  })

  it("shows edit form when Edit is clicked", async () => {
    server.use(
      http.get("http://localhost:3000/api/users/1", () => {
        return HttpResponse.json(mockUser)
      }),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/users/1"]}>
        <Routes>
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument()
    })
    await user.click(screen.getByRole("button", { name: /edit/i }))
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
  })
})
```

**Estimated lines**: ~200loc

---

## Verification

After completing all tasks, you should be able to:

1. Navigate to `/users` — shows paginated table of users
2. Click pagination controls — page changes, data reloads
3. Click "View" on a user row — navigates to `/users/:id`
4. See user profile with email, display name, status, created date
5. Click "Edit" — form fields appear with current values
6. Edit display name and save — calls `PATCH /api/users/:id`, updates displayed data
7. Toggle "Active" switch and save — calls `PATCH /api/users/:id` with `is_active`
8. Click "Deactivate" in user list — confirmation dialog, then soft deletes user
9. Empty state shown when no users exist
10. Loading spinner shown while data is fetching
11. Error callout shown when API call fails
12. `npm test` — user list and profile tests pass