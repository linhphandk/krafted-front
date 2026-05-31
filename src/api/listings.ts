import { useQuery } from "@tanstack/react-query"
import { customFetch } from "./custom-fetch"
import type { PaginatedResponseListingResponse, Category } from "./generated"

export interface ListListingsParams {
  page?: number
  per_page?: number
  status?: string
  category_id?: string
  kind?: string
  search?: string
  sort?: string
}

function buildListingsUrl(params: ListListingsParams): string {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.per_page) searchParams.set("per_page", String(params.per_page))
  if (params.status) searchParams.set("status", params.status)
  if (params.category_id) searchParams.set("category_id", params.category_id)
  if (params.kind) searchParams.set("kind", params.kind)
  if (params.search) searchParams.set("search", params.search)
  if (params.sort) searchParams.set("sort", params.sort)
  const qs = searchParams.toString()
  return qs ? `/api/listings?${qs}` : "/api/listings"
}

export function useListings(params: ListListingsParams) {
  return useQuery<PaginatedResponseListingResponse>({
    queryKey: ["listings", params],
    queryFn: () => customFetch<PaginatedResponseListingResponse>(buildListingsUrl(params)),
  })
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => customFetch<Category[]>("/api/categories"),
  })
}
