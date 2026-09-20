# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unified-account-directory-journey.spec.mjs >> directory claim journey stays on one RallyHub account flow
- Location: e2e/unified-account-directory-journey.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ }) with timeout 10000ms
  - waiting for getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })

```

```yaml
- banner:
  - link "RallyHub RallyHub":
    - /url: /
    - img "RallyHub"
    - text: RallyHub
  - navigation:
    - link "Club Directory":
      - /url: /directory
    - link "Manage listing":
      - /url: /directory?manage=1
      - img
      - text: Manage listing
    - link "Add club":
      - /url: /directory/add
      - img
      - text: Add club
    - link "Club Guide & Help":
      - /url: /directory/help
      - img
      - text: Club Guide & Help
  - button "Current appearance Dark. Change appearance.":
    - img
  - link "Log in to RallyHub":
    - /url: /login?returnTo=%2Fdirectory%2Fclare-pickleball%2Fclaim
    - button "Log in"
- main:
  - link "Back to Clare Pickleball":
    - /url: /directory/clare-pickleball
    - img
    - text: Back to Clare Pickleball
  - img
  - paragraph: Directory verification
  - heading "Claim Clare Pickleball" [level=1]
  - paragraph: Club representatives can request permission to maintain this public directory listing. Directory access is separate from RallyHub club membership and the RallyHub club-management app.
  - text: Checking your sign-in…
  - complementary:
    - img
    - heading "How verification works" [level=2]
    - paragraph:
      - strong: "1."
      - text: We use your signed-in account identity.
    - paragraph:
      - strong: "2."
      - text: RallyHub compares it privately with trusted contact information already associated with the listing.
    - paragraph:
      - strong: "3."
      - text: If we cannot verify you safely, a RallyHub administrator reviews the request.
    - img
    - heading "Directory access only" [level=2]
    - paragraph: Approval lets you manage this directory listing. It does not make you a RallyHub player, club member or club administrator.
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
> 15 |   await expect(page.getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })).toBeVisible({ timeout: 10000 });
     |                                                                                                                         ^ Error: expect(locator).toBeVisible() failed
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
  27 |   await expect(page.getByRole('heading', { name: 'Sign in or create your RallyHub account' })).toBeVisible();
  28 |   await expect(page.getByText('RallyHub uses one account.', { exact: false })).toBeVisible();
  29 |   await expect(page.getByText('Create your RallyHub account', { exact: true })).toBeVisible();
  30 |   await expect(page.getByText('One RallyHub account, separate permissions.', { exact: false })).toBeVisible();
  31 |   await expect(page.getByText('Create your Directory account', { exact: true })).toHaveCount(0);
  32 | });
  33 | 
  34 | test('directory help explains one account with separate permissions', async ({ page }) => {
  35 |   await page.goto('/directory/help');
  36 | 
  37 |   await page.getByRole('button', { name: /Does claiming my listing give me RallyHub Club access\?/ }).click();
  38 |   await expect(page.getByText('RallyHub uses one account, but permissions are separate.', { exact: false })).toBeVisible();
  39 | });
  40 | 
```