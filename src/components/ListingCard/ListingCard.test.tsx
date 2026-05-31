import { describe, it, expect, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import ListingCard from "./index"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const listing = {
  id: "1",
  title: "Test Item",
  price_cents: 1999,
  condition: "Handmade",
  category_name: "Pottery",
}

function renderCard() {
  return render(
    <Theme>
      <MemoryRouter>
        <ListingCard listing={listing} />
      </MemoryRouter>
    </Theme>,
  )
}

describe("ListingCard", () => {
  it("renders title", () => {
    renderCard()
    expect(screen.getByText("Test Item")).toBeInTheDocument()
  })

  it("renders price formatted", () => {
    renderCard()
    expect(screen.getByText("$19.99")).toBeInTheDocument()
  })

  it("renders condition badge", () => {
    renderCard()
    expect(screen.getByText("Handmade")).toBeInTheDocument()
  })

  it("renders category badge", () => {
    renderCard()
    expect(screen.getByText("Pottery")).toBeInTheDocument()
  })

  it("links to listing detail", () => {
    renderCard()
    expect(screen.getByRole("link")).toHaveAttribute("href", "/listings/1")
  })

  it("shows placeholder image text", () => {
    renderCard()
    expect(screen.getByText("No image")).toBeInTheDocument()
  })
})
