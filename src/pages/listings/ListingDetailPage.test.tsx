import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getGetListingQueryOptions } from "@/api/generated"
import { AuthProvider } from "@/context/AuthContext"
import ListingDetailPage from "./ListingDetailPage"

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

function renderPage(listingId = "test-id") {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Theme>
          <MemoryRouter initialEntries={[`/listings/${listingId}`]}>
            <Routes>
              <Route path="/listings/:id" element={<ListingDetailPage />} />
            </Routes>
          </MemoryRouter>
        </Theme>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe("ListingDetailPage", () => {
  it("shows loading spinner initially", () => {
    renderPage()
    expect(screen.getByLabelText("Loading")).toBeInTheDocument()
  })

  it("shows error state when listing not found", async () => {
    renderPage("nonexistent")
    expect(await screen.findByText(/Failed to load listing/)).toBeInTheDocument()
    expect(screen.getByText(/Back to listings/)).toBeInTheDocument()
  })

  it("renders listing details", async () => {
    const listing = {
      id: "1",
      title: "Test Listing",
      description: "A beautiful handmade item",
      price_cents: 2999,
      condition: "Handmade",
      category_name: "Pottery",
      category_id: "cat-1",
      quantity: 3,
      seller_id: "seller-1",
      seller_name: "CraftyJane",
      status: "active",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    }

    const options = getGetListingQueryOptions("1")
    queryClient.setQueryData(options.queryKey, listing)

    renderPage("1")
    expect(await screen.findByText(/Test Listing/)).toBeInTheDocument()
    expect(screen.getByText("A beautiful handmade item")).toBeInTheDocument()
    expect(screen.getByText("$29.99")).toBeInTheDocument()
    expect(screen.getByText("Handmade")).toBeInTheDocument()
    expect(screen.getByText("Pottery")).toBeInTheDocument()
    expect(screen.getByText(/3 available/)).toBeInTheDocument()
    expect(screen.getByText(/CraftyJane/)).toBeInTheDocument()
  })

  it("renders back link", async () => {
    const listing = {
      id: "1",
      title: "Test",
      description: "desc",
      price_cents: 1000,
      condition: "New",
      category_name: null,
      category_id: "cat-1",
      quantity: 1,
      seller_id: "s-1",
      seller_name: "SellerName",
      status: "active",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    }

    const options = getGetListingQueryOptions("1")
    queryClient.setQueryData(options.queryKey, listing)

    renderPage("1")
    expect(await screen.findByText(/Back to listings/)).toBeInTheDocument()
    expect(screen.getByText(/Back to listings/).closest("a")).toHaveAttribute("href", "/listings")
  })
})
