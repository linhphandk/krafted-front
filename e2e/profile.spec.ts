import { test, expect } from "@playwright/test"

test.describe("Profile", () => {
  test("edits display name", async ({ page }) => {
    const email = `profile-test-${Date.now()}@example.com`
    const password = "password123"
    const newName = "Updated Name"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Original Name")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    // Open user dropdown (top right, has email)
    await page.getByRole("button", { name: email }).click()
    await page.getByText("Profile", { exact: true }).click()
    await expect(page).toHaveURL(/\/profile/)

    await page.getByPlaceholder("Your name").clear()
    await page.getByPlaceholder("Your name").fill(newName)
    await page.getByRole("button", { name: "Save" }).click()

    await expect(page.getByText("Profile updated successfully.")).toBeVisible()

    await page.reload()

    await expect(page.getByPlaceholder("Your name")).toHaveValue(newName)
  })
})
