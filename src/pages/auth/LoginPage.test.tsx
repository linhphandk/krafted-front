import { describe, it, expect, vi, beforeEach } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@/test/test-utils"
import LoginPage from "./LoginPage"

vi.mock("@/context", () => ({
  useAuth: vi.fn(),
}))

const mockLogin = vi.fn()

import { useAuth } from "@/context"

function setup() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
  })
  return render(<LoginPage />)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockLogin.mockResolvedValue(undefined)
})

describe("LoginPage", () => {
  it("renders sign in heading", () => {
    setup()
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders email and password fields", () => {
    setup()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  it("renders sign in button", () => {
    setup()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders link to register page", () => {
    setup()
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute("href", "/register")
  })

  it("shows validation error when submitting empty form", async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole("button", { name: /sign in/i }))
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it("calls login with form data on valid submit", async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText(/you@example.com/i), "test@example.com")
    await user.type(screen.getByPlaceholderText(/••••••••/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))
    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")
  })

  it("shows server error when login fails", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"))
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText(/you@example.com/i), "test@example.com")
    await user.type(screen.getByPlaceholderText(/••••••••/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /sign in/i }))
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })
})
