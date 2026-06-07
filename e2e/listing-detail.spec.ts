import { test, expect } from "@playwright/test"

test.describe("Listing Detail", () => {
  test("views a listing as non-owner and saves it", async ({ page }) => {
    const sellerEmail = `detail-seller-${Date.now()}@example.com`
    const buyerEmail = `detail-buyer-${Date.now()}@example.com`
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

      await page.getByPlaceholder("Handmade ceramic vase").fill("Detail Test Item")
      await page.getByPlaceholder("Describe your item...").fill("A great item for testing detail view.")
      await page.getByPlaceholder("19.99").fill("25.00")

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

    await test.step("register buyer and view listing", async () => {
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
      await expect(page.getByRole("heading", { name: "Detail Test Item" })).toBeVisible()
      await expect(page.getByText("$25.00")).toBeVisible()
      await expect(page.getByText("A great item for testing detail view.")).toBeVisible()
      await expect(page.getByText("Handmade")).toBeVisible()
      await expect(page.getByText("Knitting & Crochet")).toBeVisible()
      await expect(page.getByRole("button", { name: /Save/ })).toBeVisible()

      // Non-owner should not see Edit button
      await expect(page.getByRole("button", { name: "Edit", exact: true })).not.toBeVisible()
    })
  })

  test("owner sees edit button but no save button", async ({ page }) => {
    const email = `detail-owner-${Date.now()}@example.com`
    const password = "password123"

    await page.goto("/register")
    await page.getByPlaceholder("Jane Doe").fill("Owner")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByPlaceholder("••••••••").first().fill(password)
    await page.getByPlaceholder("••••••••").last().fill(password)
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.getByRole("button", { name: "☰" }).click()
    await page.getByText("Create Listing").click()
    await expect(page).toHaveURL(/\/listings\/new/)

    await page.getByPlaceholder("Handmade ceramic vase").fill("Owner Test Item")
    await page.getByPlaceholder("Describe your item...").fill("Owner listing.")
    await page.getByPlaceholder("19.99").fill("10.00")

    await page.getByText("Select category").click()
    await page.getByRole("option", { name: "Knitting" }).click()
    await page.getByText("Select condition").click()
    await page.getByRole("option", { name: "New" }).click()

    await page.getByRole("button", { name: "Create listing" }).click()
    await expect(page).not.toHaveURL(/\/listings\/new/)
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]/)

    // Owner should see Edit button but no Save button
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: /Save/ })).not.toBeVisible()
  })
})
