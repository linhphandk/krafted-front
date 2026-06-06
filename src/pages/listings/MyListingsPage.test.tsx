import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getSellerListingsQueryKey } from "@/api/generated"
import MyListingsPage from "./MyListingsPage"

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <Theme>
        <MemoryRouter>
          <MyListingsPage />
        </MemoryRouter>
      </Theme>
    </QueryClientProvider>,
  )
}

describe("MyListingsPage", () => {
  it("shows loading spinner initially", () => {
    renderPage()
    expect(screen.getByLabelText("Loading")).toBeInTheDocument()
  })

  it("renders heading and filters when listings loaded", async () => {
    const listings = [
      {
        id: "1",
        title: "Vase",
        description: "Nice vase",
        price_cents: 1999,
        condition: "Handmade",
        category_id: "cat-1",
        category_name: "Pottery",
        quantity: 2,
        seller_id: "u-1",
        seller_name: "Me",
        status: "active",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ]
    const queryKey = getSellerListingsQueryKey({ page: 1, per_page: 12 })
    queryClient.setQueryData(queryKey, {
      items: listings,
      page: 1,
      per_page: 12,
      total: 1,
      total_pages: 1,
    })

    renderPage()
    expect(await screen.findByText("My listings")).toBeInTheDocument()
    expect(screen.getByText("Create listing")).toBeInTheDocument()
    expect(screen.getByText("All")).toBeInTheDocument()
    expect(screen.getByText("Draft")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("Paused")).toBeInTheDocument()
  })

  it("renders listing rows", async () => {
    const listings = [
      {
        id: "1",
        title: "Handmade Vase",
        description: "A beautiful vase",
        price_cents: 2999,
        condition: "Handmade",
        category_id: "cat-1",
        category_name: "Pottery",
        quantity: 3,
        seller_id: "u-1",
        seller_name: "Me",
        status: "active",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ]
    const queryKey = getSellerListingsQueryKey({ page: 1, per_page: 12 })
    queryClient.setQueryData(queryKey, {
      items: listings,
      page: 1,
      per_page: 12,
      total: 1,
      total_pages: 1,
    })

    renderPage()
    expect(await screen.findByText("Handmade Vase")).toBeInTheDocument()
    expect(screen.getByText("$29.99")).toBeInTheDocument()
    expect(screen.getByText("active")).toBeInTheDocument()
  })

  it("shows empty state when no listings", async () => {
    const queryKey = getSellerListingsQueryKey({ page: 1, per_page: 12 })
    queryClient.setQueryData(queryKey, {
      items: [],
      page: 1,
      per_page: 12,
      total: 0,
      total_pages: 0,
    })

    renderPage()
    expect(await screen.findByText("No listings yet")).toBeInTheDocument()
  })
})
