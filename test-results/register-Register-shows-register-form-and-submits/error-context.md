# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: register.spec.ts >> Register >> shows register form and submits
- Location: e2e/register.spec.ts:4:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /dashboard/
Received string:  "http://localhost:5173/register"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5173/register"

```

```yaml
- heading "Create account" [level=1]
- paragraph: Failed to fetch
- text: Display name
- textbox "Jane Doe": Test User
- text: Email
- textbox "you@example.com": test-1780217479981@example.com
- text: Password
- textbox "••••••••": password123
- text: Confirm password
- textbox "••••••••": password123
- button "Create account"
- text: Already have an account?
- link "Sign in":
  - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Register", () => {
  4  |   test("shows register form and submits", async ({ page }) => {
  5  |     await page.goto("/register")
  6  | 
  7  |     await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible()
  8  |     await expect(page.getByPlaceholder("Jane Doe")).toBeVisible()
  9  |     await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
  10 |     await expect(page.getByPlaceholder("••••••••").first()).toBeVisible()
  11 |     await expect(page.getByPlaceholder("••••••••").last()).toBeVisible()
  12 | 
  13 |     await page.getByPlaceholder("Jane Doe").fill("Test User")
  14 |     await page.getByPlaceholder("you@example.com").fill(`test-${Date.now()}@example.com`)
  15 |     await page.getByPlaceholder("••••••••").first().fill("password123")
  16 |     await page.getByPlaceholder("••••••••").last().fill("password123")
  17 | 
  18 |     await page.getByRole("button", { name: "Create account" }).click()
  19 | 
> 20 |     await expect(page).toHaveURL(/dashboard/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  21 |   })
  22 | 
  23 |   test("shows error when passwords do not match", async ({ page }) => {
  24 |     await page.goto("/register")
  25 | 
  26 |     await page.getByPlaceholder("••••••••").first().fill("password123")
  27 |     await page.getByPlaceholder("••••••••").last().fill("different")
  28 | 
  29 |     await expect(page.getByText("Passwords do not match")).toBeVisible()
  30 |   })
  31 | 
  32 |   test("shows error when email is invalid", async ({ page }) => {
  33 |     await page.goto("/register")
  34 | 
  35 |     await page.getByPlaceholder("you@example.com").fill("not-an-email")
  36 | 
  37 |     await expect(page.getByText("Invalid email address")).toBeVisible()
  38 |   })
  39 | 
  40 |   test("redirects to login link", async ({ page }) => {
  41 |     await page.goto("/register")
  42 | 
  43 |     await page.getByRole("link", { name: "Sign in" }).click()
  44 | 
  45 |     await expect(page).toHaveURL(/login/)
  46 |   })
  47 | })
  48 | 
```