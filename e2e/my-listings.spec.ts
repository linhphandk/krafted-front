import { test, expect } from "@playwright/test"

test.describe("My Listings", () => {
  test("shows created listing and publish action", async ({ page }) => {
    const email = `mylistings-test-${Date.now()}@example.com`
    const password = "password123"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Lister")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("Create Listing").click()
    await expect(page).toHaveURL(/\/listings\/new/)

    await page.getByPlaceholder("Handmade ceramic vase").fill("Draft Item")
    await page.getByPlaceholder("Describe your item...").fill("Draft listing.")
    await page.getByPlaceholder("19.99").fill("12.00")

    await page.getByText("Select category").click()
    await page.getByRole("option", { name: "Knitting" }).click()
    await page.getByText("Select condition").click()
    await page.getByRole("option", { name: "Handmade" }).click()

    await page.getByRole("button", { name: "Create listing" }).click()
    await expect(page).not.toHaveURL(/\/listings\/new/)
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]/)

    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("My Listings").click()
    await expect(page).toHaveURL(/\/listings\/mine/)

    await expect(page.getByRole("heading", { name: "My listings" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Draft Item" })).toBeVisible()
    await expect(page.getByRole("table").getByText("Draft", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Publish" }).click()
    await expect(page.getByRole("table").getByText("Active", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible()
  })

  test("shows empty state when no listings", async ({ page }) => {
    const email = `mylistings-empty-${Date.now()}@example.com`
    const password = "password123"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Empty")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("My Listings").click()
    await expect(page).toHaveURL(/\/listings\/mine/)

    await expect(page.getByText("No listings yet")).toBeVisible()
  })
})
