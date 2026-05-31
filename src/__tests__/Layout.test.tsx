import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { Theme } from "@radix-ui/themes"
import Layout from "../components/Layout"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const mockUser = { id: "1", email: "test@example.com", name: "Test User" }
const mockLogout = vi.fn()

vi.mock("@/context", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const { useAuth } = await import("@/context")

function renderLayout() {
  return render(
    <Theme>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Theme>,
  )
}

describe("Layout", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
    })
  })

  it("renders brand name and menu button in header", () => {
    renderLayout()
    expect(screen.getByText("Krafted")).toBeInTheDocument()
    expect(screen.getByText("☰")).toBeInTheDocument()
  })

  it("shows nav items when menu is clicked", async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByText("☰"))

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Browse Listings")).toBeInTheDocument()
    expect(screen.getByText("My Listings")).toBeInTheDocument()
    expect(screen.getByText("Create Listing")).toBeInTheDocument()
  })

  it("renders user email in header", () => {
    renderLayout()
    expect(screen.getByText("test@example.com")).toBeInTheDocument()
  })

  it("renders outlet content", () => {
    renderLayout()
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument()
  })

  it("opens user dropdown and calls logout on sign out", async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByText("test@example.com"))
    await user.click(screen.getByText("Sign out"))

    expect(mockLogout).toHaveBeenCalled()
  })
})
