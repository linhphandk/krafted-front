# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-listing.spec.ts >> Create Listing >> creates a listing and redirects to detail page
- Location: e2e/create-listing.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('Select category')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "☰" [active] [ref=e7]
      - heading "Krafted" [level=1] [ref=e8]
    - button "T create-listing-test-1780221611183@example.com" [ref=e9]:
      - generic [ref=e11]: T
      - generic [ref=e12]: create-listing-test-1780221611183@example.com
  - generic [ref=e16]:
    - heading "Create listing" [level=1] [ref=e17]
    - generic [ref=e19]:
      - generic [ref=e20]:
        - text: Title
        - textbox "Handmade ceramic vase" [ref=e22]: Test Listing Title
      - generic [ref=e23]:
        - text: Description
        - textbox "Describe your item..." [ref=e25]: This is a test listing created by e2e test.
      - generic [ref=e26]:
        - generic [ref=e28]:
          - text: Price ($)
          - spinbutton [ref=e30]: "29.99"
        - generic [ref=e32]:
          - text: Quantity
          - spinbutton [ref=e34]: "1"
      - generic [ref=e35]:
        - generic [ref=e37]:
          - text: Category
          - combobox [ref=e38]:
            - generic [ref=e39]: Select category
            - img [ref=e40]
          - combobox [ref=e42]
        - generic [ref=e44]:
          - text: Condition
          - combobox [ref=e45]:
            - generic [ref=e46]: Select condition
            - img [ref=e47]
          - combobox [ref=e49]
      - generic [ref=e50]:
        - generic [ref=e51]: Draft
        - switch [ref=e52]
        - checkbox
        - generic [ref=e54]: Active
      - generic [ref=e55]:
        - button "Cancel" [ref=e56]
        - button "Create listing" [ref=e57]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Create Listing", () => {
  4  |   test("creates a listing and redirects to detail page", async ({ page }) => {
  5  |     const email = `create-listing-test-${Date.now()}@example.com`
  6  |     const password = "password123"
  7  | 
  8  |     // Register
  9  |     await page.goto("/register")
  10 |     await page.getByPlaceholder("Jane Doe").fill("Test User")
  11 |     await page.getByPlaceholder("you@example.com").fill(email)
  12 |     await page.getByPlaceholder("••••••••").first().fill(password)
  13 |     await page.getByPlaceholder("••••••••").last().fill(password)
  14 |     await page.getByRole("button", { name: "Create account" }).click()
  15 |     await expect(page).toHaveURL(/dashboard/)
  16 | 
  17 |     // Navigate to create listing
  18 |     await page.getByRole("button", { name: "☰" }).click()
  19 |     await page.getByText("Create Listing").click()
  20 |     await expect(page).toHaveURL(/\/listings\/new/)
  21 | 
  22 |     // Fill form
  23 |     await page.getByPlaceholder("Handmade ceramic vase").fill("Test Listing Title")
  24 |     await page.getByPlaceholder("Describe your item...").fill("This is a test listing created by e2e test.")
  25 |     await page.getByPlaceholder("19.99").fill("29.99")
> 26 |     await page.getByPlaceholder("Select category").click()
     |                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  27 |     await page.getByRole("option", { name: "Knitting" }).click()
  28 |     await page.getByPlaceholder("Select condition").click()
  29 |     await page.getByRole("option", { name: "Handmade" }).click()
  30 | 
  31 |     // Submit
  32 |     await page.getByRole("button", { name: "Create listing" }).click()
  33 | 
  34 |     // Verify redirect to listing detail page
  35 |     await expect(page).toHaveURL(/\/listings\//)
  36 |   })
  37 | })
  38 | 
```