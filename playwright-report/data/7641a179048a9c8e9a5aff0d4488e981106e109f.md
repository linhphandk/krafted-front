# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login >> shows server error when login fails
- Location: e2e/login.spec.ts:60:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/login failed|invalid credentials/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/login failed|invalid credentials/i)

```

```yaml
- heading "Sign in" [level=1]
- paragraph: Failed to fetch
- text: Email
- textbox "you@example.com": nonexistent@example.com
- text: Password
- textbox "••••••••": wrongpassword
- button "Sign in"
- text: Don't have an account?
- link "Create one":
  - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Login", () => {
  4  |   test("shows login form and submits", async ({ page }) => {
  5  |     const email = `login-test-${Date.now()}@example.com`
  6  |     const password = "password123"
  7  | 
  8  |     await page.goto("/register")
  9  |     await page.getByPlaceholder("Jane Doe").fill("Test User")
  10 |     await page.getByPlaceholder("you@example.com").fill(email)
  11 |     await page.getByPlaceholder("••••••••").first().fill(password)
  12 |     await page.getByPlaceholder("••••••••").last().fill(password)
  13 |     await page.getByRole("button", { name: "Create account" }).click()
  14 |     await expect(page).toHaveURL(/dashboard/)
  15 | 
  16 |     await page.context().clearCookies()
  17 |     await page.evaluate(() => localStorage.clear())
  18 | 
  19 |     await page.goto("/login")
  20 | 
  21 |     await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  22 |     await expect(page.getByPlaceholder("you@example.com")).toBeVisible()
  23 |     await expect(page.getByPlaceholder("••••••••")).toBeVisible()
  24 |     await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
  25 | 
  26 |     await page.getByPlaceholder("you@example.com").fill(email)
  27 |     await page.getByPlaceholder("••••••••").fill(password)
  28 | 
  29 |     await page.getByRole("button", { name: "Sign in" }).click()
  30 | 
  31 |     await expect(page).toHaveURL(/dashboard/)
  32 |   })
  33 | 
  34 |   test("shows error when email is empty", async ({ page }) => {
  35 |     await page.goto("/login")
  36 | 
  37 |     await page.getByPlaceholder("••••••••").fill("password123")
  38 |     await page.getByRole("button", { name: "Sign in" }).click()
  39 | 
  40 |     await expect(page.getByText("Email is required")).toBeVisible()
  41 |   })
  42 | 
  43 |   test("shows error when password is empty", async ({ page }) => {
  44 |     await page.goto("/login")
  45 | 
  46 |     await page.getByPlaceholder("you@example.com").fill("test@example.com")
  47 |     await page.getByRole("button", { name: "Sign in" }).click()
  48 | 
  49 |     await expect(page.getByText("Password is required")).toBeVisible()
  50 |   })
  51 | 
  52 |   test("shows error when email is invalid", async ({ page }) => {
  53 |     await page.goto("/login")
  54 | 
  55 |     await page.getByPlaceholder("you@example.com").fill("not-an-email")
  56 | 
  57 |     await expect(page.getByText("Invalid email address")).toBeVisible()
  58 |   })
  59 | 
  60 |   test("shows server error when login fails", async ({ page }) => {
  61 |     await page.goto("/login")
  62 | 
  63 |     await page.getByPlaceholder("you@example.com").fill("nonexistent@example.com")
  64 |     await page.getByPlaceholder("••••••••").fill("wrongpassword")
  65 |     await page.getByRole("button", { name: "Sign in" }).click()
  66 | 
> 67 |     await expect(page.getByText(/login failed|invalid credentials/i)).toBeVisible()
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  68 |   })
  69 | 
  70 |   test("redirects to register link", async ({ page }) => {
  71 |     await page.goto("/login")
  72 | 
  73 |     await page.getByRole("link", { name: "Create one" }).click()
  74 | 
  75 |     await expect(page).toHaveURL(/register/)
  76 |   })
  77 | })
  78 | 
```