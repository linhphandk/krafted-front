import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@radix-ui/themes"
import ListingsFilter from "./index"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const categories = [
  { id: "1", name: "Ceramics", kind: "craft", slug: "ceramics", created_at: "" },
  { id: "2", name: "Yarn", kind: "supply", slug: "yarn", created_at: "" },
]

function renderFilter(filters = {}, onFiltersChange = vi.fn()) {
  return render(
    <Theme>
      <ListingsFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        categories={categories}
      />
    </Theme>,
  )
}

describe("ListingsFilter", () => {
  it("renders kind tabs", () => {
    renderFilter()
    expect(screen.getByRole("tab", { name: /^All/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^Crafts/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^Supplies/ })).toBeInTheDocument()
  })

  it("renders search input", () => {
    renderFilter()
    expect(screen.getByPlaceholderText("Search listings...")).toBeInTheDocument()
  })

  it("renders category select", () => {
    renderFilter()
    expect(screen.getByText("All categories")).toBeInTheDocument()
  })

  it("renders sort select", () => {
    renderFilter()
    expect(screen.getByText("Newest")).toBeInTheDocument()
  })

  it("renders clear filters button", () => {
    renderFilter()
    expect(screen.getByText("Clear filters")).toBeInTheDocument()
  })

  it("calls onFiltersChange when kind tab changes", async () => {
    const fn = vi.fn()
    const user = userEvent.setup()
    renderFilter({}, fn)
    await user.click(screen.getByRole("tab", { name: /^Crafts/ }))
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ kind: "craft", page: 1 }))
  })
})
