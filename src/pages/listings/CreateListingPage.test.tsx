import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import CreateListingPage from "./CreateListingPage"

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
          <CreateListingPage />
        </MemoryRouter>
      </Theme>
    </QueryClientProvider>,
  )
}

describe("CreateListingPage", () => {
  it("renders heading", () => {
    renderPage()
    expect(screen.getByRole("heading", { name: "Create listing" })).toBeInTheDocument()
  })

  it("renders all form fields", () => {
    renderPage()
    expect(screen.getByPlaceholderText("Handmade ceramic vase")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Describe your item...")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("19.99")).toBeInTheDocument()
    expect(screen.getByText("Select category")).toBeInTheDocument()
    expect(screen.getByText("Select condition")).toBeInTheDocument()
  })

  it("renders draft/active toggle", () => {
    renderPage()
    expect(screen.getByText("Draft")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("renders submit and cancel buttons", () => {
    renderPage()
    expect(screen.getByRole("button", { name: "Create listing" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
  })

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole("button", { name: "Create listing" }))

    expect(await screen.findByText("Title is required")).toBeInTheDocument()
    expect(await screen.findByText("Description is required")).toBeInTheDocument()
    expect(await screen.findByText("Price is required")).toBeInTheDocument()
    expect(await screen.findByText("Category is required")).toBeInTheDocument()
    expect(await screen.findByText("Condition is required")).toBeInTheDocument()
  })
})
