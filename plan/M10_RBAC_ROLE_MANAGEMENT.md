# M10 — RBAC & Role Management Pages

**Deliverable: Role-based access control enforced on the frontend, role management CRUD pages**

**Depends on: M9**

---

## Key Concept: Permissions Are frontend UX Hints, Not Security

The backend is the authority. Role checks in the frontend only control **what the user sees** — they hide buttons, pages, and actions that the user doesn't have permission for. But every API call still requires a valid token, and the backend enforces permissions independently.

Frontend RBAC is about **user experience**, not security. Never rely on frontend checks alone.

---

## Task 1 — Types for RBAC (~40loc)

**File**: `src/types/role.ts` (update)

Expand the role types to include the full RBAC model from krafted-back M7:

```ts
export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

export interface AssignRoleRequest {
  role_id: string
}

// Permission format: "resource:action"
// e.g., "users:read", "users:write", "users:delete", "roles:read", "roles:write"
export type Permission = string

// Predefined permission groups for the UI
export const PERMISSION_GROUPS: Record<string, { label: string; permissions: Permission[] }> = {
  users: {
    label: "Users",
    permissions: ["users:read", "users:write", "users:delete"],
  },
  roles: {
    label: "Roles",
    permissions: ["roles:read", "roles:write", "roles:delete"],
  },
}
```

Update `src/types/auth.ts` — add `permissions` to the `User` type. The `/api/auth/me` endpoint should return the user plus their permissions (this will be on the backend side):

```ts
// In auth.ts, update or add:
export interface UserWithPermissions extends User {
  permissions: string[]
}
```

The `useAuth` hook will return `UserWithPermissions` instead of `User` after this milestone. The backend `GET /api/auth/me` endpoint must be updated to include permissions.

**Estimated lines**: ~40loc

---

## Task 2 — Update AuthContext with permissions (~30loc)

**File**: `src/context/AuthContext.tsx` (update)

Update `useAuth` to return `permissions` array alongside `user`. The `/api/auth/me` response now includes `permissions: string[]`:

```tsx
// Change the User type to UserWithPermissions in AuthContext
import type { UserWithPermissions } from "@/types"

// In the AuthContextValue interface:
interface AuthContextValue {
  user: UserWithPermissions | null
  permissions: string[]
  hasPermission: (permission: string) => boolean
  // ... existing fields
}

// In the provider:
const hasPermission = useCallback((permission: string) => {
  return user?.permissions?.includes(permission) ?? false
}, [user])

// Add to context value:
permissions: user?.permissions ?? [],
hasPermission,
```

**Estimated lines**: ~15loc changes

---

## Task 3 — RequirePermission: real implementation (~60loc)

**File**: `src/components/RequirePermission/index.tsx` (update)

Replace the pass-through implementation from M8 with a real permission check:

```tsx
import { Flex, Heading, Text, Button } from "@radix-ui/themes"
import { useNavigate } from "react-router"
import { useAuth } from "@/context"

interface RequirePermissionProps {
  permission: string
  children: React.ReactNode
}

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { hasPermission } = useAuth()
  const navigate = useNavigate()

  if (!hasPermission(permission)) {
    return (
      <Flex direction="column" align="center" justify="center" gap="4" style={{ minHeight: "50vh" }}>
        <Heading size="5">Not authorized</Heading>
        <Text size="2" color="gray">
          You do not have the "{permission}" permission to view this page.
        </Text>
        <Button variant="soft" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      </Flex>
    )
  }

  return <>{children}</>
}
```

**Estimated lines**: ~30loc

---

## Task 4 — Wire RequirePermission into routes (~30loc)

**File**: `src/App.tsx` (update)

Wrap admin pages with `RequirePermission`:

```tsx
import RequirePermission from "./components/RequirePermission"

// In the protected routes section:
<Route element={<RequireAuth><Layout /></RequireAuth>}>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/users/:id" element={<UserProfilePage />} />
  <Route path="/users" element={
    <RequirePermission permission="users:read">
      <UserListPage />
    </RequirePermission>
  } />
  <Route path="/roles" element={
    <RequirePermission permission="roles:read">
      <RoleListPage />
    </RequirePermission>
  } />
  <Route path="/roles/:id" element={
    <RequirePermission permission="roles:read">
      <RoleManagePage />
    </RequirePermission>
  } />
</Route>
```

Also conditionally show/hide navigation links in Layout based on permissions:

```tsx
const { hasPermission } = useAuth()

// In sidebar:
<NavLink to="/dashboard">Dashboard</NavLink>
{hasPermission("users:read") && <NavLink to="/users">Users</NavLink>}
{hasPermission("roles:read") && <NavLink to="/roles">Roles</NavLink>}
```

**Estimated lines**: ~30loc

---

## Task 5 — Role list page (~150loc)

**File**: `src/pages/roles/RoleListPage.tsx`

Shows all roles with their permissions. Admin can create, edit, and delete roles.

```tsx
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import { Box, Flex, Heading, Table, Text, Badge, Button, Callout, Spinner, Dialog, TextField, Checkbox } from "@radix-ui/themes"
import { listRoles } from "@/api/roles"
import type { Role } from "@/types"
import { PERMISSION_GROUPS } from "@/types/role"

export default function RoleListPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listRoles()
      setRoles(result)
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Failed to load roles")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  if (isLoading) return <Flex align="center" justify="center"><Spinner size="3" /></Flex>

  if (error) {
    return <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="5">Roles</Heading>
      </Flex>

      {roles.length === 0 ? (
        <Text color="gray">No roles found.</Text>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Permissions</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {roles.map((role) => (
              <Table.Row key={role.id}>
                <Table.Cell>{role.name}</Table.Cell>
                <Table.Cell>{role.description}</Table.Cell>
                <Table.Cell>
                  <Flex gap="1" wrap="wrap">
                    {role.permissions.map((p) => (
                      <Badge key={p} size="1" variant="soft">{p}</Badge>
                    ))}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Button size="1" variant="soft" onClick={() => navigate(`/roles/${role.id}`)}>
                    View
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  )
}
```

**Estimated lines**: ~80loc

---

## Task 6 — Role manage/detail page (~200loc)

**File**: `src/pages/roles/RoleManagePage.tsx`

Shows a role with editable permissions using checkboxes grouped by resource. Allows editing role name, description, and permissions.

```tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Box, Card, Flex, Heading, Text, TextField, Button, Badge, Callout, Spinner, Checkbox, Separator } from "@radix-ui/themes"
import type { Role, UpdateRoleRequest } from "@/types"
import { PERMISSION_GROUPS } from "@/types/role"

export default function RoleManagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPermissions, setEditPermissions] = useState<string[]>([])

  useEffect(() => {
    // Fetch role by ID — add getRole to roles API if not present
    // For now, use listRoles and find the one matching id
    // In a real app, there would be a getRole(id) API call
    if (!id) return
    import("@/api/roles").then(({ listRoles }) => {
      listRoles()
        .then((roles) => {
          const found = roles.find((r) => r.id === id)
          if (found) {
            setRole(found)
            setEditName(found.name)
            setEditDescription(found.description)
            setEditPermissions(found.permissions)
          } else {
            setError("Role not found")
          }
        })
        .catch(() => setError("Failed to load role"))
        .finally(() => setIsLoading(false))
    })
  }, [id])

  function togglePermission(permission: string) {
    setEditPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  async function handleSave() {
    if (!id) return
    setIsSaving(true)
    setError(null)

    const updates: UpdateRoleRequest = {}
    if (editName !== role!.name) updates.name = editName
    if (editDescription !== role!.description) updates.description = editDescription
    if (JSON.stringify(editPermissions) !== JSON.stringify(role!.permissions)) {
      updates.permissions = editPermissions
    }

    try {
      // Update role via API (add updateRole to roles API)
      // const updated = await updateRole(id, updates)
      // setRole(updated)
      // setIsEditing(false)
      throw new Error("Not implemented — add updateRole to roles API")
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "error" in err) {
        setError((err as { error: string }).error)
      } else {
        setError("Failed to update role")
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <Flex align="center" justify="center"><Spinner size="3" /></Flex>
  if (!role) return <Callout.Root color="red"><Callout.Text>Role not found</Callout.Text></Callout.Root>

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="5">Role: {role.name}</Heading>
        <Button variant="soft" onClick={() => navigate("/roles")}>Back to roles</Button>
      </Flex>

      {error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}

      <Card size="2">
        <Flex direction="column" gap="4" p="4">
          {isEditing ? (
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">Name</Text>
                <TextField.Root value={editName} onChange={(e) => setEditName(e.target.value)} />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium">Description</Text>
                <TextField.Root value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </Box>

              <Separator size="4" my="2" />
              <Heading size="3">Permissions</Heading>

              {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
                <Flex direction="column" gap="2" key={key}>
                  <Text size="2" weight="medium">{group.label}</Text>
                  <Flex gap="3" wrap="wrap">
                    {group.permissions.map((permission) => (
                      <Text as="label" size="2" key={permission}>
                        <Flex align="center" gap="1">
                          <Checkbox
                            checked={editPermissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          {permission}
                        </Flex>
                      </Text>
                    ))}
                  </Flex>
                </Flex>
              ))}

              <Flex gap="2">
                <Button onClick={handleSave} loading={isSaving}>Save</Button>
                <Button variant="soft" onClick={() => setIsEditing(false)}>Cancel</Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Name</Text>
                <Text>{role.name}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Description</Text>
                <Text>{role.description}</Text>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">Permissions</Text>
                <Flex gap="1" wrap="wrap">
                  {role.permissions.map((p) => (
                    <Badge key={p} size="1" variant="soft">{p}</Badge>
                  ))}
                </Flex>
              </Flex>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}
```

**Estimated lines**: ~170loc

---

## Task 7 — Assign role to user from user profile page (~80loc)

**File**: `src/pages/users/UserProfilePage.tsx` (update)

Add a "Roles" section to the user profile page that shows assigned roles and allows assigning/revoke roles:

Add below the existing user info card:

```tsx
<Card size="2" mt="4">
  <Flex direction="column" gap="3" p="4">
    <Flex justify="between" align="center">
      <Heading size="3">Roles</Heading>
      {/* Role assignment dropdown — only shown to users with roles:write permission */}
      {hasPermission("roles:write") && (
        <Dialog.Root>
          <Dialog.Trigger>
            <Button size="1">Assign role</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Assign role</Dialog.Title>
            <Flex direction="column" gap="3">
              {/* Fetch roles list, show in dropdown, call assignRole on select */}
              <Text size="2">Select a role to assign to this user.</Text>
              {/* RoleSelectDropdown component — implemented inline or extracted */}
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Flex>
    {userRoles.length === 0 ? (
      <Text color="gray" size="2">No roles assigned</Text>
    ) : (
      <Flex gap="2" wrap="wrap">
        {userRoles.map((role) => (
          <Badge key={role.id} size="2" variant="soft">
            {role.name}
            {hasPermission("roles:write") && (
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onClick={() => handleRevokeRole(role.id)}
              >
                ×
              </IconButton>
            )}
          </Badge>
        ))}
      </Flex>
    )}
  </Flex>
</Card>
```

This requires fetching user roles from the API. Add `getUserRoles(userId)` to the roles API module:

```ts
// src/api/roles.ts — add:
export async function getUserRoles(userId: string): Promise<Role[]> {
  return apiClient<Role[]>(`/api/users/${userId}/roles`)
}
```

**Estimated lines**: ~60loc added to UserProfilePage + ~5loc in roles API

---

## Task 8 — Role and permission tests (~150loc)

**Files**: `src/__tests__/RoleListPage.test.tsx`, `src/__tests__/RequirePermission.test.tsx` (update)

`src/__tests__/RoleListPage.test.tsx` (~100loc):
```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { renderWithProviders as render } from "../test/test-utils"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const mockRoles = [
  { id: "1", name: "admin", description: "Administrator", permissions: ["users:read", "users:write", "users:delete", "roles:read", "roles:write"], created_at: "2025-01-01" },
  { id: "2", name: "user", description: "Regular user", permissions: ["users:read"], created_at: "2025-01-02" },
]

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: "bypass" })
  localStorage.clear()
  localStorage.setItem("krafted_access_token", "test-token")
  localStorage.setItem("krafted_refresh_token", "test-refresh")
  localStorage.setItem("krafted_token_expiry", String(Date.now() + 3600000))
})
afterEach(() => { server.resetHandlers(); server.close() })

describe("RoleListPage", () => {
  it("renders roles with permissions as badges", async () => {
    server.use(
      http.get("http://localhost:3000/api/roles", () => {
        return HttpResponse.json(mockRoles)
      }),
    )
    render(<RoleListPage />)
    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument()
      expect(screen.getByText("user")).toBeInTheDocument()
      expect(screen.getByText("users:read")).toBeInTheDocument()
      expect(screen.getByText("users:write")).toBeInTheDocument()
    })
  })

  it("shows empty state when no roles", async () => {
    server.use(
      http.get("http://localhost:3000/api/roles", () => {
        return HttpResponse.json([])
      }),
    )
    render(<RoleListPage />)
    await waitFor(() => {
      expect(screen.getByText(/no roles/i)).toBeInTheDocument()
    })
  })

  it("shows error when API fails", async () => {
    server.use(
      http.get("http://localhost:3000/api/roles", () => {
        return HttpResponse.json({ error: "Forbidden" }, { status: 403 })
      }),
    )
    render(<RoleListPage />)
    await waitFor(() => {
      expect(screen.getByText(/forbidden|failed/i)).toBeInTheDocument()
    })
  })
})
```

Update `src/__tests__/RequirePermission.test.tsx` — add tests for permission-based sidebar hiding:
```tsx
// Add to existing test file:
it("hides navigation links when user lacks permission", () => {
  // Mock useAuth with no permissions
  vi.mock("@/context", () => ({
    useAuth: () => ({
      user: { id: "1", email: "test@example.com", display_name: "Test", is_active: true, created_at: "", permissions: [] },
      hasPermission: () => false,
      isAuthenticated: true,
      isLoading: false,
    }),
  }))
  render(<Layout />)
  expect(screen.queryByText("Users")).not.toBeInTheDocument()
  expect(screen.queryByText("Roles")).not.toBeInTheDocument()
})
```

**Estimated lines**: ~150loc

---

## Verification

After completing all tasks, you should be able to:

1. Navigate to `/roles` — only visible to users with `roles:read` permission
2. See list of roles with name, description, and permission badges
3. Click a role → navigate to `/roles/:id` — see role details
4. Edit role name, description, and individual permissions via checkboxes
5. Navigate to `/users/:id` — see assigned roles section
6. Assign a role to a user via the dropdown
7. Revoke a role from a user via the × button on the role badge
8. Navigation sidebar only shows links the user has permission for
9. Attempting to navigate to `/roles` without `roles:read` → "Not authorized" page
10. Attempting to navigate to `/users` without `users:read` → "Not authorized" page
11. `npm test` — role and permission tests pass