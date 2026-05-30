import { test, expect } from "@playwright/test"

test.describe("Login", () => {
  test("shows login form and submits", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
    await expect(page.getByPlaceholder("••••••••")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()

    await page.getByPlaceholder("you@example.com").fill("test@example.com")
    await page.getByPlaceholder("••••••••").fill("password123")

    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
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

  test("redirects to register link", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("link", { name: "Create one" }).click()

    await expect(page).toHaveURL(/register/)
  })
})
