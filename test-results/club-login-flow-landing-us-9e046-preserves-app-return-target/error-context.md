# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-login-flow.spec.mjs >> landing uses the single RallyHub login and preserves /app return target
- Location: e2e/club-login-flow.spec.mjs:3:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login\?returnTo=%2Fapp$/
Received string:  "http://127.0.0.1:5173/login?returnTo=%2F"
Timeout: 3000ms

Call log:
  - Expect "toHaveURL" with timeout 3000ms
    8 × locator resolved to <html lang="en" data-theme="light" data-appearance="auto">…</html>
      - unexpected value "http://127.0.0.1:5173/login?returnTo=%2F"

```

```yaml
- heading "Sign in to RallyHub" [level=1]
- paragraph: One account for RallyHub
- button "Continue with Google"
- text: or Email
- textbox "Email":
  - /placeholder: you@example.com
- text: Password
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password":
  - /placeholder: ••••••••
- button "Show password"
- button "Log in"
- paragraph:
  - text: New to RallyHub?
  - link "Create an account":
    - /url: /register
- paragraph: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('landing uses the single RallyHub login and preserves /app return target', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   const login = page.getByRole('button', { name: 'Log in', exact: true }).first();
  6  |   await expect(login).toBeVisible();
  7  |   await login.click();
> 8  |   await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp$/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  9  |   await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
  10 | });
  11 | 
  12 | test('opening a protected app URL while signed out preserves the destination through login', async ({ page }) => {
  13 |   await page.goto('/app/admin?tab=directory');
  14 |   await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Fadmin%3Ftab%3Ddirectory$/);
  15 |   await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
  16 | });
  17 | 
```