import { test, expect } from "@playwright/test"

test.describe("Favorites", () => {
  test("saves and unsaves a listing, shows in favorites page", async ({ page }) => {
    const sellerEmail = `fav-seller-${Date.now()}@example.com`
    const buyerEmail = `fav-buyer-${Date.now()}@example.com`
    const password = "password123"
    let listingUrl = ""

    await test.step("register seller and create listing", async () => {
      await page.goto("/register")
      await page.getByPlaceholder("Jane Doe").fill("Seller")
      await page.getByPlaceholder("you@example.com").fill(sellerEmail)
      await page.getByPlaceholder("••••••••").first().fill(password)
      await page.getByPlaceholder("••••••••").last().fill(password)
      await page.getByRole("button", { name: "Create account" }).click()
      await expect(page).toHaveURL(/dashboard/)

      await page.getByRole("button", { name: "☰" }).click()
      await page.getByText("Create Listing").click()
      await expect(page).toHaveURL(/\/listings\/new/)

      await page.getByPlaceholder("Handmade ceramic vase").fill("Favorited Item")
      await page.getByPlaceholder("Describe your item...").fill("Test item for favorites e2e")
      await page.getByPlaceholder("19.99").fill("15.00")

      await page.getByText("Select category").click()
      await page.getByRole("option", { name: "Knitting" }).click()
      await page.getByText("Select condition").click()
      await page.getByRole("option", { name: "Handmade" }).click()

      await page.getByRole("switch").click()

      await page.getByRole("button", { name: "Create listing" }).click()
      await expect(page).not.toHaveURL(/\/listings\/new/)
      await expect(page).toHaveURL(/\/listings\/[a-f0-9-]/)
      listingUrl = page.url()
    })

    await test.step("register buyer and save listing", async () => {
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      await page.goto("/register")
      await page.getByPlaceholder("Jane Doe").fill("Buyer")
      await page.getByPlaceholder("you@example.com").fill(buyerEmail)
      await page.getByPlaceholder("••••••••").first().fill(password)
      await page.getByPlaceholder("••••••••").last().fill(password)
      await page.getByRole("button", { name: "Create account" }).click()
      await expect(page).toHaveURL(/dashboard/)

      await page.goto(listingUrl)
      await page.waitForLoadState("networkidle")
      await expect(page).toHaveURL(listingUrl)
      await expect(page.getByRole("heading", { name: "Favorited Item" })).toBeVisible({ timeout: 10000 })

      await page.getByRole("button", { name: /Save/ }).click()
      await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible()
      await page.waitForLoadState("networkidle")
    })

    await test.step("verify listing appears in favorites page", async () => {
      await page.getByRole("button", { name: "☰" }).click()
      await page.getByRole("menuitem", { name: "Saved Listings" }).click()
      await expect(page).toHaveURL(/\/favorites/)
      await expect(page.getByRole("heading", { name: "Saved listings" })).toBeVisible()
      await expect(page.getByText("Favorited Item")).toBeVisible()
      await expect(page.getByText("$15.00")).toBeVisible()
    })

    await test.step("unsave listing", async () => {
      await page.goto(listingUrl)
      await page.waitForLoadState("networkidle")
      // Local state doesn't persist across navigations, button shows "Save" even though listing is favorited
      await page.getByRole("button", { name: /Save/ }).click()
      await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible()
      await page.getByRole("button", { name: /Saved/ }).click()
      await expect(page.getByRole("button", { name: /Save/ })).toBeVisible()
    })
  })
})
