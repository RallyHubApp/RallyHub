# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unified-account-directory-journey.spec.mjs >> directory help explains one account with separate permissions
- Location: e2e/unified-account-directory-journey.spec.mjs:34:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('RallyHub uses one account, but permissions are separate.')
Expected: visible
Received: hidden
Timeout:  3000ms

Call log:
  - Expect "toBeVisible" getByText('RallyHub uses one account, but permissions are separate.') with timeout 3000ms
  - waiting for getByText('RallyHub uses one account, but permissions are separate.')
    10 × locator resolved to <p data-arr-index="2" data-arr-field="a" data-dynamic-content="true" data-arr-variable-name="faqs" data-source-location="src/pages/DirectoryHelp.jsx:123:18" class="mt-3 pr-8 text-sm leading-6 text-muted-foreground">No. RallyHub uses one account, but permissions ar…</p>
       - unexpected value "hidden"

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
    - /url: /login?returnTo=%2Fdirectory%2Fhelp
    - button "Log in"
- main:
  - link "Back to Club Directory":
    - /url: /directory
    - img
    - text: Back to Club Directory
  - img
  - paragraph: Club guide & help
  - heading "Everything you need for the RallyHub Directory" [level=1]
  - paragraph: Start with the story behind the Directory, follow the two-page Quick Start Guide, or jump straight to the frequently asked questions.
  - link "1. Why the Directory exists Brian's story, why the Directory is free, what clubs gain and what RallyHub is - and is not - offering right now. Read the explainer →":
    - /url: /directory/story
    - img
    - heading "1. Why the Directory exists" [level=2]
    - paragraph: Brian's story, why the Directory is free, what clubs gain and what RallyHub is - and is not - offering right now.
    - text: Read the explainer →
  - link "2. Quick Start Guide A phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing. View / download 2-page PDF →":
    - /url: /directory/quick-start
    - img
    - heading "2. Quick Start Guide" [level=2]
    - paragraph: A phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing.
    - text: View / download 2-page PDF →
  - link "3. Frequently asked questions Security, ownership, Spond, cost, Directory-only access, sessions and common sign-in questions. Browse the FAQs ↓":
    - /url: "#faqs"
    - img
    - heading "3. Frequently asked questions" [level=2]
    - paragraph: Security, ownership, Spond, cost, Directory-only access, sessions and common sign-in questions.
    - text: Browse the FAQs ↓
  - img
  - heading "Claim safely" [level=2]
  - paragraph: Use the invitation or request access. Directory access is verified separately from RallyHub Club.
  - img
  - heading "Check basics" [level=2]
  - paragraph: Confirm the description, public contact and main venue.
  - img
  - heading "Check sessions" [level=2]
  - paragraph: Add or duplicate regular sessions. RallyHub sorts them into weekly order.
  - img
  - heading "Enhance later" [level=2]
  - paragraph: Logo, social links, prices, extra venues and Spond are optional enhancements.
  - heading "Frequently asked questions" [level=2]
  - group: Why did RallyHub create the Directory? +
  - group: Is there a charge to be listed? +
  - group: Does claiming my listing give me RallyHub Club access? +
  - group: Can somebody from another club claim my listing? +
  - group: What happens when I receive a RallyHub claim invitation? +
  - group: Can more than one person manage a club listing? +
  - group: Do I have to complete every field? +
  - group: How are sessions ordered? +
  - group: How do I place a venue on the map? +
  - group: Why does my logo look different in the editor and public listing? +
  - group: What happens to the “unclaimed” wording after I claim the club? +
  - group: What is Spond connection for? +
  - heading "Still unsure?" [level=2]
  - paragraph: Start with the explainer or Quick Start Guide above. You can leave optional information blank and come back to improve the listing later.
  - link "Manage a listing":
    - /url: /directory?manage=1
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
  15 |   await expect(page.getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })).toBeVisible();
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
> 37 |   await expect(page.getByText('RallyHub uses one account, but permissions are separate.', { exact: false })).toBeVisible();
     |                                                                                                              ^ Error: expect(locator).toBeVisible() failed
  38 | });
  39 | 
```