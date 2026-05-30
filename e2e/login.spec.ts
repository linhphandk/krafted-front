import { test, expect } from "@playwright/test"

test.describe("Login", () => {
  test("shows login form and submits", async ({ page }) => {
    const email = `login-test-${Date.now()}@example.com`
    const password = "password123"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Test User")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    await page.goto("/login")

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").fill(password)

    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/dashboard/)
  })

  test("shows error when email is empty", async ({ page }) => {
    await page.goto("/login")

    await page.getByPlaceholder("••••••••").fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Email is required")).toBeVisible()
  })

  test("shows error when password is empty", async ({ page }) => {
    await page.goto("/login")

    await page.getByPlaceholder("you@example.com").fill("test@example.com")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Password is required")).toBeVisible()
  })

  test("shows error when email is invalid", async ({ page }) => {
    await page.goto("/login")

    await page.getByPlaceholder("you@example.com").fill("not-an-email")

    await expect(page.getByText("Invalid email address")).toBeVisible()
  })

  test("shows server error when login fails", async ({ page }) => {
    await page.goto("/login")

    await page.getByPlaceholder("you@example.com").fill("nonexistent@example.com")
    await page.getByPlaceholder("••••••••").fill("wrongpassword")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText(/login failed|invalid credentials/i)).toBeVisible()
  })

  test("redirects to register link", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("link", { name: "Create one" }).click()

    await expect(page).toHaveURL(/register/)
  })
})
