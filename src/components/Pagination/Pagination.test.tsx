import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@radix-ui/themes"
import Pagination from "./index"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

function renderPagination(page: number, totalPages: number, onPageChange = () => {}) {
  return render(
    <Theme>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </Theme>,
  )
}

describe("Pagination", () => {
  it("renders page X of Y", () => {
    renderPagination(2, 5)
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument()
  })

  it("disables Previous on first page", () => {
    renderPagination(1, 5)
    expect(screen.getByText("Previous")).toBeDisabled()
  })

  it("disables Next on last page", () => {
    renderPagination(5, 5)
    expect(screen.getByText("Next")).toBeDisabled()
  })

  it("calls onPageChange with prev page", async () => {
    const fn = vi.fn()
    const user = userEvent.setup()
    renderPagination(3, 5, fn)
    await user.click(screen.getByText("Previous"))
    expect(fn).toHaveBeenCalledWith(2)
  })

  it("calls onPageChange with next page", async () => {
    const fn = vi.fn()
    const user = userEvent.setup()
    renderPagination(3, 5, fn)
    await user.click(screen.getByText("Next"))
    expect(fn).toHaveBeenCalledWith(4)
  })
})
