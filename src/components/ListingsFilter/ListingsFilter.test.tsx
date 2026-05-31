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

async function openDialog() {
  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "Filters" }))
}

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
  it("renders search input", () => {
    renderFilter()
    expect(screen.getByPlaceholderText("Search listings...")).toBeInTheDocument()
  })

  it("renders filters button", () => {
    renderFilter()
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument()
  })

  it("renders kind tabs inside dialog", async () => {
    renderFilter()
    await openDialog()
    expect(screen.getByRole("tab", { name: /^All/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^Crafts/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^Supplies/ })).toBeInTheDocument()
  })

  it("renders category select inside dialog", async () => {
    renderFilter()
    await openDialog()
    expect(screen.getByText("All categories")).toBeInTheDocument()
  })

  it("renders sort select inside dialog", async () => {
    renderFilter()
    await openDialog()
    expect(screen.getByText("Newest")).toBeInTheDocument()
  })

  it("renders clear filters button inside dialog", async () => {
    renderFilter()
    await openDialog()
    expect(screen.getByText("Clear filters")).toBeInTheDocument()
  })

  it("calls onFiltersChange when kind tab changes", async () => {
    const fn = vi.fn()
    const user = userEvent.setup()
    renderFilter({}, fn)
    await user.click(screen.getByRole("button", { name: "Filters" }))
    await user.click(screen.getByRole("tab", { name: /^Crafts/ }))
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ kind: "craft", page: 1 }))
  })
})
