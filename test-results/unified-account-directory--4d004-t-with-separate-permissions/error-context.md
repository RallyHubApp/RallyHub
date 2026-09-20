# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unified-account-directory-journey.spec.mjs >> directory help explains one account with separate permissions
- Location: e2e/unified-account-directory-journey.spec.mjs:34:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Does claiming my listing give me RallyHub Club access\?/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "RallyHub RallyHub" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]: RallyHub
      - navigation [ref=e9]:
        - link "Club Directory" [ref=e10] [cursor=pointer]:
          - /url: /directory
        - link "Manage listing" [ref=e11] [cursor=pointer]:
          - /url: /directory?manage=1
        - link "Add club" [ref=e16] [cursor=pointer]:
          - /url: /directory/add
        - link "Club Guide & Help" [ref=e19] [cursor=pointer]:
          - /url: /directory/help
      - generic [ref=e23]:
        - button "Current appearance Dark. Change appearance." [ref=e24] [cursor=pointer]
        - link "Log in to RallyHub" [ref=e25] [cursor=pointer]:
          - /url: /login?returnTo=%2Fdirectory%2Fhelp
          - button "Log in" [ref=e26]
  - main [ref=e27]:
    - link "Back to Club Directory" [ref=e28] [cursor=pointer]:
      - /url: /directory
    - generic [ref=e31]:
      - generic [ref=e37]:
        - paragraph [ref=e38]: Club guide & help
        - heading "Everything you need for the RallyHub Directory" [level=1] [ref=e39]
        - paragraph [ref=e40]: Start with the story behind the Directory, follow the two-page Quick Start Guide, or jump straight to the frequently asked questions.
      - generic [ref=e41]:
        - link "1. Why the Directory exists Brian's story, why the Directory is free, what clubs gain and what RallyHub is - and is not - offering right now. Read the explainer →" [ref=e42] [cursor=pointer]:
          - /url: /directory/story
          - heading "1. Why the Directory exists" [level=2] [ref=e45]
          - paragraph [ref=e46]: Brian's story, why the Directory is free, what clubs gain and what RallyHub is - and is not - offering right now.
          - generic [ref=e47]: Read the explainer →
        - link "2. Quick Start Guide A phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing. View / download 2-page PDF →" [ref=e48] [cursor=pointer]:
          - /url: /directory/quick-start
          - heading "2. Quick Start Guide" [level=2] [ref=e52]
          - paragraph [ref=e53]: A phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing.
          - generic [ref=e54]: View / download 2-page PDF →
        - link "3. Frequently asked questions Security, ownership, Spond, cost, Directory-only access, sessions and common sign-in questions. Browse the FAQs ↓" [ref=e55] [cursor=pointer]:
          - /url: "#faqs"
          - heading "3. Frequently asked questions" [level=2] [ref=e58]
          - paragraph [ref=e59]: Security, ownership, Spond, cost, Directory-only access, sessions and common sign-in questions.
          - generic [ref=e60]: Browse the FAQs ↓
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "Claim safely" [level=2] [ref=e66]
          - paragraph [ref=e67]: Use the invitation or request access. Directory access is verified separately from RallyHub Club.
        - generic [ref=e68]:
          - heading "Check basics" [level=2] [ref=e72]
          - paragraph [ref=e73]: Confirm the description, public contact and main venue.
        - generic [ref=e74]:
          - heading "Check sessions" [level=2] [ref=e77]
          - paragraph [ref=e78]: Add or duplicate regular sessions. RallyHub sorts them into weekly order.
        - generic [ref=e79]:
          - heading "Enhance later" [level=2] [ref=e83]
          - paragraph [ref=e84]: Logo, social links, prices, extra venues and Spond are optional enhancements.
    - generic [ref=e85]:
      - heading "Frequently asked questions" [level=2] [ref=e86]
      - generic [ref=e87]:
        - group [ref=e88]:
          - generic "Why did RallyHub create the Directory? +" [ref=e89] [cursor=pointer]:
            - generic [ref=e90]: Why did RallyHub create the Directory?
            - generic [ref=e91]: +
        - group [ref=e92]:
          - generic "Is there a charge to be listed? +" [ref=e93] [cursor=pointer]:
            - generic [ref=e94]: Is there a charge to be listed?
            - generic [ref=e95]: +
        - group [ref=e96]:
          - generic "Does claiming my listing give me RallyHub Club access? +" [ref=e97] [cursor=pointer]:
            - generic [ref=e98]: Does claiming my listing give me RallyHub Club access?
            - generic [ref=e99]: +
        - group [ref=e100]:
          - generic "Can somebody from another club claim my listing? +" [ref=e101] [cursor=pointer]:
            - generic [ref=e102]: Can somebody from another club claim my listing?
            - generic [ref=e103]: +
        - group [ref=e104]:
          - generic "What happens when I receive a RallyHub claim invitation? +" [ref=e105] [cursor=pointer]:
            - generic [ref=e106]: What happens when I receive a RallyHub claim invitation?
            - generic [ref=e107]: +
        - group [ref=e108]:
          - generic "Can more than one person manage a club listing? +" [ref=e109] [cursor=pointer]:
            - generic [ref=e110]: Can more than one person manage a club listing?
            - generic [ref=e111]: +
        - group [ref=e112]:
          - generic "Do I have to complete every field? +" [ref=e113] [cursor=pointer]:
            - generic [ref=e114]: Do I have to complete every field?
            - generic [ref=e115]: +
        - group [ref=e116]:
          - generic "How are sessions ordered? +" [ref=e117] [cursor=pointer]:
            - generic [ref=e118]: How are sessions ordered?
            - generic [ref=e119]: +
        - group [ref=e120]:
          - generic "How do I place a venue on the map? +" [ref=e121] [cursor=pointer]:
            - generic [ref=e122]: How do I place a venue on the map?
            - generic [ref=e123]: +
        - group [ref=e124]:
          - generic "Why does my logo look different in the editor and public listing? +" [ref=e125] [cursor=pointer]:
            - generic [ref=e126]: Why does my logo look different in the editor and public listing?
            - generic [ref=e127]: +
        - group [ref=e128]:
          - generic "What happens to the “unclaimed” wording after I claim the club? +" [ref=e129] [cursor=pointer]:
            - generic [ref=e130]: What happens to the “unclaimed” wording after I claim the club?
            - generic [ref=e131]: +
        - group [ref=e132]:
          - generic "What is Spond connection for? +" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: What is Spond connection for?
            - generic [ref=e135]: +
    - generic [ref=e136]:
      - generic [ref=e137]:
        - heading "Still unsure?" [level=2] [ref=e138]
        - paragraph [ref=e139]: Start with the explainer or Quick Start Guide above. You can leave optional information blank and come back to improve the listing later.
      - link "Manage a listing" [ref=e140] [cursor=pointer]:
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
> 37 |   await page.getByRole('button', { name: /Does claiming my listing give me RallyHub Club access\?/ }).click();
     |                                                                                                       ^ Error: locator.click: Test timeout of 45000ms exceeded.
  38 |   await expect(page.getByText('RallyHub uses one account, but permissions are separate.', { exact: false })).toBeVisible();
  39 | });
  40 | 
```