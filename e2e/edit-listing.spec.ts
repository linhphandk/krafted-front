import { test, expect } from "@playwright/test"

test.describe("Edit Listing", () => {
  test("edits a listing title and price", async ({ page }) => {
    const email = `edit-test-${Date.now()}@example.com`
    const password = "password123"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Editor")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("Create Listing").click()
    await expect(page).toHaveURL(/\/listings\/new/)

    await page.getByPlaceholder("Handmade ceramic vase").fill("Original Title")
    await page.getByPlaceholder("Describe your item...").fill("Original description.")
    await page.getByPlaceholder("19.99").fill("20.00")

    await page.getByText("Select category").click()
    await page.getByRole("option", { name: "Knitting" }).click()
    await page.getByText("Select condition").click()
    await page.getByRole("option", { name: "Handmade" }).click()

    await page.getByRole("button", { name: "Create listing" }).click()
    await expect(page).not.toHaveURL(/\/listings\/new/)
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]/)

    await page.getByRole("button", { name: "Edit", exact: true }).click()
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]+\/edit/)

    await expect(page.getByRole("heading", { name: "Edit listing" })).toBeVisible()
    await expect(page.getByPlaceholder("Handmade ceramic vase")).toHaveValue("Original Title")

    await page.getByPlaceholder("Handmade ceramic vase").clear()
    await page.getByPlaceholder("Handmade ceramic vase").fill("Updated Title")

    await page.getByPlaceholder("19.99").clear()
    await page.getByPlaceholder("19.99").fill("35.00")

    // Re-select category, condition, status (reset doesn't populate Select values properly)
    await page.getByText("Select category").click()
    await page.getByRole("option", { name: "Knitting" }).click()
    await page.getByText("Select condition").click()
    await page.getByRole("option", { name: "Handmade" }).click()
    await page.getByText("Select status").click()
    await page.getByRole("option", { name: "Draft" }).click()

    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page).not.toHaveURL(/\/edit/)

    await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible()
    await expect(page.getByText("$35.00")).toBeVisible()
  })
})
