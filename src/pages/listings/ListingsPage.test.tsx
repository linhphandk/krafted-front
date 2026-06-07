import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getListListingsQueryKey, getListCategoriesQueryKey } from "@/api/generated"
import ListingsPage from "./ListingsPage"

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function seedData() {
  const listingsKey = getListListingsQueryKey({ page: 1, per_page: 12, status: "active" })
  queryClient.setQueryData(listingsKey, { items: [], page: 1, per_page: 12, total: 0, total_pages: 1 })
  const categoriesKey = getListCategoriesQueryKey()
  queryClient.setQueryData(categoriesKey, [])
}

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

beforeEach(() => {
  queryClient.clear()
})

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <Theme>
        <MemoryRouter>
          <ListingsPage />
        </MemoryRouter>
      </Theme>
    </QueryClientProvider>,
  )
}

function renderPageWithData() {
  seedData()
  return render(
    <QueryClientProvider client={queryClient}>
      <Theme>
        <MemoryRouter>
          <ListingsPage />
        </MemoryRouter>
      </Theme>
    </QueryClientProvider>,
  )
}

describe("ListingsPage", () => {
  it("shows loading spinner initially", () => {
    renderPage()
    expect(screen.getByLabelText("Loading")).toBeInTheDocument()
  })

  it("renders heading", async () => {
    renderPageWithData()
    expect(await screen.findByText("Browse listings")).toBeInTheDocument()
  })

  it("renders search input", async () => {
    renderPageWithData()
    expect(await screen.findByPlaceholderText("Search listings...")).toBeInTheDocument()
  })

  it("renders filters button", async () => {
    renderPageWithData()
    expect(await screen.findByRole("button", { name: "Filters" })).toBeInTheDocument()
  })
})
