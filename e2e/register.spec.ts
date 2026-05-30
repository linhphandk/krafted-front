import { test, expect } from "@playwright/test"

test.describe("Register", () => {
  test("shows register form and submits", async ({ page }) => {
    await page.goto("/register")

    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible()
    await expect(page.getByPlaceholder("Jane Doe")).toBeVisible()
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••").first()).toBeVisible()
    await expect(page.getByPlaceholder("••••••••").last()).toBeVisible()

    await page.getByPlaceholder("Jane Doe").fill("Test User")
    await page.getByPlaceholder("you@example.com").fill(`test-${Date.now()}@example.com`)
    await page.getByPlaceholder("••••••••").first().fill("password123")
    await page.getByPlaceholder("••••••••").last().fill("password123")

    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page).toHaveURL(/login/)
  })

  test("shows error when passwords do not match", async ({ page }) => {
    await page.goto("/register")

    await page.getByPlaceholder("••••••••").first().fill("password123")
    await page.getByPlaceholder("••••••••").last().fill("different")

    await expect(page.getByText("Passwords do not match")).toBeVisible()
  })

  test("shows error when email is invalid", async ({ page }) => {
    await page.goto("/register")

    await page.getByPlaceholder("you@example.com").fill("not-an-email")

    await expect(page.getByText("Invalid email address")).toBeVisible()
  })

  test("redirects to login link", async ({ page }) => {
    await page.goto("/register")

    await page.getByRole("link", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/login/)
  })
})
