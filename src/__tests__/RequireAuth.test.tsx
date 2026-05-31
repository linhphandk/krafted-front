import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { Theme } from "@radix-ui/themes"
import RequireAuth from "../components/RequireAuth"

const mockUser = { id: "1", email: "test@example.com", name: "Test" }

vi.mock("@/context", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const { useAuth } = await import("@/context")

function renderWithRouter(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

describe("RequireAuth", () => {
  it("renders children when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRouter(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><div>Protected Content</div></RequireAuth>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("redirects to login when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRouter(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><div>Protected Content</div></RequireAuth>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("Login Page")).toBeInTheDocument()
  })

  it("shows loading spinner while loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRouter(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><div>Protected Content</div></RequireAuth>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
