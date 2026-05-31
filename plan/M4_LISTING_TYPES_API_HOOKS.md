# M4 — Listing Types + API Client + Hooks

**Deliverable: TypeScript types for listings/categories, API functions, React Query hooks**

**Depends on: M2 (API client and auth context working)**

> **Note:** This milestone uses **manual API functions** (not orval-generated) because the backend listing endpoints are not yet in the OpenAPI spec. The auth endpoints remain orval-generated. The listing API functions in `src/api/listings.ts` and `src/api/categories.ts` use the `customFetch` function from `src/api/custom-fetch.ts`, following the same pattern as the orval-generated code.

---

## Task 1 — Create listing types

**Files**: `src/types/listing.ts`

```ts
export type ListingStatus = "draft" | "active" | "paused" | "closed"
export type ListingCondition = "handmade" | "new" | "vintage" | "refurbished"
export type CategoryKind = "craft" | "supply"
export type ListingSort = "newest" | "price_asc" | "price_desc"

export interface Listing {
  id: string
  seller_id: string
  title: string
  description: string
  price_cents: number
  category_id: string
  category_name?: string
  status: ListingStatus
  condition: ListingCondition
  quantity: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  kind: CategoryKind
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CreateListingRequest {
  title: string
  description: string
  price_cents: number
  category_id: string
  condition: ListingCondition
  quantity: number
  status?: ListingStatus
}

export interface UpdateListingRequest {
  title?: string
  description?: string
  price_cents?: number
  category_id?: string
  status?: ListingStatus
  condition?: ListingCondition
  quantity?: number
}

export interface ListListingsParams {
  status?: ListingStatus
  category_id?: string
  kind?: CategoryKind
  search?: string
  sort?: ListingSort
  page?: number
  per_page?: number
}
```

Update `src/types/index.ts` to re-export: `export * from "./listing"`

**Estimated lines**: ~60loc

---

## Task 2 — Create listing API functions

**Files**: `src/api/listings.ts`

```ts
import { customFetch } from "./custom-fetch"
import type { Listing, CreateListingRequest, UpdateListingRequest, ListListingsParams, PaginatedResponse } from "@/types/listing"

export async function fetchListings(params?: ListListingsParams): Promise<PaginatedResponse<Listing>> {
  const query = new URLSearchParams()
  if (params?.status) query.set("status", params.status)
  if (params?.category_id) query.set("category_id", params.category_id)
  if (params?.kind) query.set("kind", params.kind)
  if (params?.search) query.set("search", params.search)
  if (params?.sort) query.set("sort", params.sort)
  if (params?.page) query.set("page", params.page.toString())
  if (params?.per_page) query.set("per_page", params.per_page.toString())
  return customFetch<PaginatedResponse<Listing>>(`/api/listings?${query.toString()}`)
}

export async function fetchListing(id: string): Promise<Listing> {
  return customFetch<Listing>(`/api/listings/${id}`)
}

export async function createListing(data: CreateListingRequest): Promise<Listing> {
  return customFetch<Listing>("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}

export async function updateListing(id: string, data: UpdateListingRequest): Promise<Listing> {
  return customFetch<Listing>(`/api/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}

export async function deleteListing(id: string): Promise<void> {
  await customFetch(`/api/listings/${id}`, { method: "DELETE" })
}

export async function publishListing(id: string): Promise<Listing> {
  return customFetch<Listing>(`/api/listings/${id}/publish`, { method: "POST" })
}

export async function pauseListing(id: string): Promise<Listing> {
  return customFetch<Listing>(`/api/listings/${id}/pause`, { method: "POST" })
}

export async function fetchMyListings(page?: number, perPage?: number, status?: ListingStatus): Promise<PaginatedResponse<Listing>> {
  const query = new URLSearchParams()
  if (page) query.set("page", page.toString())
  if (perPage) query.set("per_page", perPage.toString())
  if (status) query.set("status", status)
  return customFetch<PaginatedResponse<Listing>>(`/api/listings/mine?${query.toString()}`)
}
```

**Note**: Uses `customFetch` (the same fetch wrapper that orval uses) instead of a separate `apiClient`. This ensures auth interceptors and token refresh work consistently.

**Estimated lines**: ~45loc

---

## Task 3 — Create category API functions

**Files**: `src/api/categories.ts`

```ts
import { customFetch } from "./custom-fetch"
import type { Category, CategoryKind } from "@/types/listing"

export async function fetchCategories(): Promise<Category[]> {
  return customFetch<Category[]>("/api/categories")
}

export async function fetchCategoriesByKind(kind: CategoryKind): Promise<Category[]> {
  return customFetch<Category[]>(`/api/categories?kind=${kind}`)
}
```

**Estimated lines**: ~15loc

---

## Task 4 — Create React Query hooks

**Files**: `src/hooks/useListings.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as listingApi from "@/api/listings"
import * as categoryApi from "@/api/categories"
import type { ListListingsParams, CreateListingRequest, UpdateListingRequest, CategoryKind } from "@/types/listing"

export function useListings(params?: ListListingsParams) {
  return useQuery({
    queryKey: ["listings", params],
    queryFn: () => listingApi.fetchListings(params),
  })
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingApi.fetchListing(id),
  })
}

export function useMyListings(page?: number, perPage?: number) {
  return useQuery({
    queryKey: ["myListings", page, perPage],
    queryFn: () => listingApi.fetchMyListings(page, perPage),
  })
}

export function useCategories(kind?: CategoryKind) {
  return useQuery({
    queryKey: ["categories", kind],
    queryFn: () => kind ? categoryApi.fetchCategoriesByKind(kind) : categoryApi.fetchCategories(),
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateListingRequest) => listingApi.createListing(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["listings"] }); queryClient.invalidateQueries({ queryKey: ["myListings"] }) },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingRequest }) => listingApi.updateListing(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["listings"] }); queryClient.invalidateQueries({ queryKey: ["myListings"] }) },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => listingApi.deleteListing(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["listings"] }); queryClient.invalidateQueries({ queryKey: ["myListings"] }) },
  })
}

export function usePublishListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => listingApi.publishListing(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["listings"] }); queryClient.invalidateQueries({ queryKey: ["myListings"] }) },
  })
}

export function usePauseListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => listingApi.pauseListing(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["listings"] }); queryClient.invalidateQueries({ queryKey: ["myListings"] }) },
  })
}
```

Add `CategoryKind` to the import from `@/types/listing`.

**Estimated lines**: ~75loc

---

## Verification

1. `npm run typecheck` passes
2. `npm run build` passes
3. All types, API functions, and hooks are exported from their respective modules
4. `useListings({ kind: "craft" })` calls `/api/listings?kind=craft`
5. Hook invalidation keys match query keys
6. API functions use `customFetch` (same as orval-generated code) for consistent auth handling