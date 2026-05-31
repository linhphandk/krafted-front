# M6 — Listing Detail Page

**Deliverable: Public listing detail page showing all listing information**

**Depends on: M5 (needs ListingCard to link here)**

---

## Task 1 — Create `ListingDetailPage`

**Files**: `src/pages/listings/ListingDetailPage.tsx`

- Uses `useListing(id)` hook with `id` from `useParams()`
- Layout:
  - Back link: `<Link to="/listings">Back to listings</Link>`
  - Title: `Heading` size="8"
  - Price: `Text` size="6" — format `$XX.XX` from cents
  - Category: `Badge` with kind-based color
  - Condition: `Badge` — "Handmade" (purple), "New" (green), "Vintage" (orange), "Refurbished" (blue)
  - Description: `Text` size="3" with whitespace preserved
  - Quantity: `Text` — "X available"
  - Seller: `Text` — "Listed by {seller_name}" (seller_id shown for now; name will come from user API later)
  - No image gallery (deferred)
- Shows `PageLoader` while loading, `PageError` on error, `PageEmpty` if not found
- Uses Radix `Card` for layout sections

**Estimated lines**: ~60loc

---

## Task 2 — Add `/listings/:id` route to `App.tsx`

**Files**: `src/App.tsx`

Add:
```tsx
<Route path="/listings/:id" element={<ListingDetailPage />} />
```

Public route (no auth required).

---

## Verification

1. `npm run typecheck` passes
2. Click `ListingCard` on browse page → navigates to `/listings/:id`
3. Detail page shows title, price, category, condition, description, quantity, seller
4. Shows error state for non-existent listing
5. Shows loading state while fetching