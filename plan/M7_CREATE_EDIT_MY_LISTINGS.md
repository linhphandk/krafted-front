# M7 — Create/Edit Listing + My Listings

**Deliverable: Seller can create, edit, publish/pause, delete listings; My Listings dashboard**

**Depends on: M6**

> **Prerequisite**: M7 needs a lightweight `RequireAuth` component (from M8 plan, Task 1). Create `src/components/RequireAuth/index.tsx` before starting M7 if it doesn't exist yet. The component simply checks `useAuth().isAuthenticated` and redirects to `/login` if not authenticated — see M8 plan for the full spec.

---

## Task 1 — Create `CreateListingPage`

**Files**: `src/pages/listings/CreateListingPage.tsx`

- Uses `react-hook-form` (already a dependency) with `CreateListingRequest` type
- Uses `useCreateListing` mutation
- Uses `useCategories` hook for category dropdown
- Form fields:
  - Title: `TextField.Root` (required, min 1 char)
  - Description: `TextArea` (required)
  - Price: `TextField.Root` type="number" (required, min 0.01) — convert dollars to cents on submit
  - Category: `Select.Root` populated from categories (required)
  - Condition: `Select.Root` with options "handmade", "new", "vintage", "refurbished" (required)
  - Quantity: `TextField.Root` type="number" (required, min 1, default 1)
  - Status toggle: Radix `Switch` — "Draft" (default) / "Active"
- Form validation with `react-hook-form` rules
- On submit:
  - Convert price from dollars to cents
  - If status toggle is "Active", set status="active", otherwise "draft"
  - Call `useCreateListing` mutation
  - On success: navigate to `/listings/:id` (the new listing)
  - On error: show `Callout` with error message
- Wrapped in `RequireAuth` — redirect to `/login` if not authenticated

**Estimated lines**: ~120loc

---

## Task 2 — Create `EditListingPage`

**Files**: `src/pages/listings/EditListingPage.tsx`

- Uses `useListing(id)` to pre-fill form
- Uses `useUpdateListing` mutation
- Same form layout as `CreateListingPage` but pre-filled
- On submit: call `useUpdateListing` mutation
- Only accessible by listing owner (check `seller_id === user.id`)
- If not owner, show `Forbidden` message or redirect

**Estimated lines**: ~130loc (similar to create but with pre-fill logic)

---

## Task 3 — Create `MyListingsPage`

**Files**: `src/pages/listings/MyListingsPage.tsx`

- Uses `useMyListings` hook
- Local state for `page` and optional `status` filter
- Status filter tabs: "All" / "Draft" / "Active" / "Paused" / "Closed" (Radix `Tabs`)
- Table layout using Radix `Table.Root`:
  - Columns: Title, Category, Condition, Price, Status Badge, Actions
  - Status badges: Draft=gray, Active=green, Paused=amber, Closed=red
  - Actions per row:
    - "Edit" link → `/listings/:id/edit`
    - If Draft: "Publish" button → `usePublishListing` mutation
    - If Active: "Pause" button → `usePauseListing` mutation
    - "Delete" button → confirm dialog → `useDeleteListing` mutation
- `Pagination` at bottom
- Shows `PageLoader` while loading, `PageEmpty` when no listings
- "Create New Listing" `Button` at top → `/listings/new`
- Wrapped in `RequireAuth`

**Estimated lines**: ~120loc

---

## Task 4 — Add routes to `App.tsx`

**Files**: `src/App.tsx`

Add protected routes (require auth):
```tsx
<Route path="/listings/new" element={<CreateListingPage />} />
<Route path="/listings/:id/edit" element={<EditListingPage />} />
<Route path="/my-listings" element={<MyListingsPage />} />
```

---

## Task 5 — Update sidebar navigation

**Files**: `src/components/Layout/index.tsx` (or equivalent layout component)

Add navigation links:
- "Browse" → `/listings` (always visible)
- "My Listings" → `/my-listings` (auth required)
- "Create Listing" → `/listings/new` (auth required)

Only show auth-required links when `useAuth().isAuthenticated` is true.

> **Note**: If the Layout component doesn't exist yet (it's part of M8), add navigation links directly in `App.tsx` for now, or create a minimal layout wrapper.

---

## Verification

1. `npm run typecheck` passes
2. `/listings/new` shows create listing form with category dropdown
3. Creating a listing (Draft) redirects to detail page
4. Creating a listing (Active) appears on browse page
5. `/my-listings` shows seller's listings with status badges
6. "Publish" button changes Draft to Active
7. "Pause" button changes Active to Paused
8. Paused listing not visible on browse page
9. "Edit" link navigates to edit form, pre-filled with data
10. "Delete" removes listing from My Listings
11. `/listings/new` redirects to `/login` if not authenticated
12. Cannot edit/delete another user's listing