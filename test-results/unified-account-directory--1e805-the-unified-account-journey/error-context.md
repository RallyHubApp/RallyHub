# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unified-account-directory-journey.spec.mjs >> quick start guide matches the unified account journey
- Location: e2e/unified-account-directory-journey.spec.mjs:24:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Sign in or create your RallyHub account' })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Sign in or create your RallyHub account' }) with timeout 3000ms
  - waiting for getByRole('heading', { name: 'Sign in or create your RallyHub account' })

```

```yaml
- banner:
  - link "RallyHub RallyHub PLAY • CONNECT • BELONG":
    - /url: /
    - img "RallyHub"
    - text: RallyHub PLAY • CONNECT • BELONG
  - navigation:
    - link "Home":
      - /url: /
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
  - link "Search directory":
    - /url: /directory
    - img
  - link "Log in":
    - /url: /login?returnTo=%2Fdirectory%2Fquick-start
    - button "Log in"
  - link "Get Started":
    - /url: /directory/add
    - button "Get Started"
  - button "Current appearance Dark. Change appearance.":
    - img
- main:
  - link "Club Guide & Help":
    - /url: /directory/help
    - img
    - text: Club Guide & Help
  - paragraph: Approved RallyHub Directory Quick Start Guide
  - link "Open / print PDF":
    - /url: /downloads/RallyHub_Directory_Quick_Start_Guide.pdf
    - img
    - text: Open / print PDF
  - paragraph: Your browser cannot display the PDF inline.
  - link "Open the approved PDF":
    - /url: /downloads/RallyHub_Directory_Quick_Start_Guide.pdf
- contentinfo "RallyHub copyright": © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('directory claim journey stays on one RallyHub account flow', async ({ page }) => {
  4  |   await page.goto('/directory?manage=1');
  5  | 
  6  |   await expect(page.getByText('Manage an existing club listing', { exact: true })).toBeVisible();
  7  |   await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
  8  | 
  9  |   await page.goto('/directory/clare-pickleball');
  10 |   const claim = page.getByRole('link', { name: /Claim this listing/i }).first();
  11 |   await expect(claim).toBeVisible();
  12 |   await claim.click();
  13 | 
  14 |   await expect(page).toHaveURL(/\/directory\/clare-pickleball\/claim/);
  15 |   await expect(page.getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })).toBeVisible({ timeout: 10000 });
  16 | 
  17 |   await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  18 |   await expect(page).toHaveURL(/\/login\?mode=directory&returnTo=/);
  19 |   await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
  20 |   await expect(page.getByText('One RallyHub account is used everywhere.', { exact: false })).toBeVisible();
  21 |   await expect(page.getByText('Create directory account', { exact: true })).toHaveCount(0);
  22 | });
  23 | 
  24 | test('quick start guide matches the unified account journey', async ({ page }) => {
  25 |   await page.goto('/directory/quick-start');
  26 | 
> 27 |   await expect(page.getByRole('heading', { name: 'Sign in or create your RallyHub account' })).toBeVisible();
     |                                                                                                ^ Error: expect(locator).toBeVisible() failed
  28 |   await expect(page.getByText('RallyHub uses one account.', { exact: false })).toBeVisible();
  29 |   await expect(page.getByText('Create your RallyHub account', { exact: true })).toBeVisible();
  30 |   await expect(page.getByText('One RallyHub account, separate permissions.', { exact: false })).toBeVisible();
  31 |   await expect(page.getByText('Create your Directory account', { exact: true })).toHaveCount(0);
  32 | });
  33 | 
  34 | test('directory help explains one account with separate permissions', async ({ page }) => {
  35 |   await page.goto('/directory/help');
  36 | 
  37 |   await page.locator('summary').filter({ hasText: 'Does claiming my listing give me RallyHub Club access?' }).click();
  38 |   await expect(page.getByText('RallyHub uses one account, but permissions are separate.', { exact: false })).toBeVisible();
  39 | });
  40 | 
```