import { test, expect } from "@playwright/test"

test.describe("Create Listing", () => {
  test("creates a listing and redirects to detail page", async ({ page }) => {
    const email = `create-listing-test-${Date.now()}@example.com`
    const password = "password123"

    // Register
    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Test User")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    // Navigate to create listing
    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("Create Listing").click()
    await expect(page).toHaveURL(/\/listings\/new/)

    // Fill form
    await page.getByPlaceholder("Handmade ceramic vase").fill("Test Listing Title")
    await page.getByPlaceholder("Describe your item...").fill("This is a test listing created by e2e test.")
    await page.getByPlaceholder("19.99").fill("29.99")

    // Select category
    await page.getByText("Select category").click()
    await page.getByRole("option", { name: "Knitting" }).click()

    // Select condition
    await page.getByText("Select condition").click()
    await page.getByRole("option", { name: "Handmade" }).click()

    // Submit
    await page.getByRole("button", { name: "Create listing" }).click()

    // Verify redirect to listing detail page
    await expect(page).toHaveURL(/\/listings\//)
  })
})
