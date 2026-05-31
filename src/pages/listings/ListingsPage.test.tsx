import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ListingsPage from "./ListingsPage"

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
    renderPage()
    expect(await screen.findByText("Browse listings")).toBeInTheDocument()
  })

  it("renders search input", async () => {
    renderPage()
    expect(await screen.findByPlaceholderText("Search listings...")).toBeInTheDocument()
  })

  it("renders filters button", async () => {
    renderPage()
    expect(await screen.findByRole("button", { name: "Filters" })).toBeInTheDocument()
  })
})
