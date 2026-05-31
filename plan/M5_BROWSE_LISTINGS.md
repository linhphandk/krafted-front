# M5 — Browse & Search Listings Page

**Deliverable: Public listing browse page with filters, search, pagination, and listing cards**

**Depends on: M4**

---

## Task 1 — Create `ListingCard` component

**Files**: `src/components/ListingCard/index.tsx`

Props:
- `listing: Listing` (may have first image later — for now, show a placeholder)

Render:
- A Radix `Card` with:
  - Placeholder image area (gray box with "No image" text, 200px height)
  - Title (Heading size="3")
  - Price formatted as `$XX.XX` (convert cents to dollars)
  - Category badge (Radix `Badge` with kind color)
  - Condition badge
  - Links to `/listings/:id` via React Router `Link`

**Estimated lines**: ~30loc

---

## Task 2 — Create `ListingsFilter` component

**Files**: `src/components/ListingsFilter/index.tsx`

Props:
- `filters: ListListingsParams`
- `onFiltersChange: (filters: ListListingsParams) => void`
- `categories: Category[]`

Render:
- Kind selector using Radix `Tabs`: "All" / "Crafts" / "Supplies"
  - On change: call `onFiltersChange({ ...filters, kind: newKind })`
- Category dropdown using Radix `Select.Root`
  - Options populated from `categories` filtered by current `kind`
  - On change: call `onFiltersChange({ ...filters, category_id: id })`
  - "All categories" option (clears category_id)
- Search input using Radix `TextField.Root`
  - Debounced 300ms
  - On change: call `onFiltersChange({ ...filters, search: value })`
- Sort selector using Radix `Select.Root`: "Newest" / "Price: Low-High" / "Price: High-Low"
  - On change: call `onFiltersChange({ ...filters, sort: value })`
- "Clear filters" `Button` — resets all filters to defaults

**Estimated lines**: ~80loc

---

## Task 3 — Create `Pagination` component

**Files**: `src/components/Pagination/index.tsx`

Props:
- `page: number`
- `totalPages: number`
- `onPageChange: (page: number) => void`

Render:
- Previous `Button` (disabled when page === 1)
- "Page X of Y" `Text`
- Next `Button` (disabled when page === totalPages)

**Estimated lines**: ~20loc

---

## Task 4 — Create `ListingsPage`

**Files**: `src/pages/listings/ListingsPage.tsx`

- Uses `useListings` and `useCategories` hooks
- Local state for `filters: ListListingsParams` and `page: number`
- Layout: `ListingsFilter` on the left/top, listing grid below
- Grid: 3 columns on desktop (`grid grid-cols-3 gap-4`), 2 tablet, 1 mobile
- Maps `listings` to `ListingCard` components
- `Pagination` component at bottom
- Shows `PageLoader` while loading, `PageError` on error, `PageEmpty` when no results

**Estimated lines**: ~80loc

---

## Task 5 — Add `/listings` route to `App.tsx`

**Files**: `src/App.tsx`

Add:
```tsx
<Route path="/listings" element={<ListingsPage />} />
```

Make this a public route (no auth required).

---

## Verification

1. `npm run typecheck` passes
2. `/listings` renders with filter sidebar, empty listing grid
3. Changing kind filter re-fetches listings
4. Category dropdown populates based on kind
5. Search input triggers API query (after debounce)
6. Sort selector works
7. Pagination shows correct page numbers
8. `ListingCard` renders title, price, badges
9. Responsive: 3 → 2 → 1 columns