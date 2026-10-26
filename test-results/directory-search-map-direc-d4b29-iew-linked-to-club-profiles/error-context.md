# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-search-map.spec.mjs >> directory has an interactive all-Ireland map view linked to club profiles
- Location: e2e/directory-search-map.spec.mjs:25:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /map/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - heading "404" [level=1] [ref=e6]
    - generic [ref=e8]:
      - heading "Page Not Found" [level=2] [ref=e9]
      - paragraph [ref=e10]:
        - text: The page
        - generic [ref=e11]: "\"directory/clubs\""
        - text: doesn't exist.
    - link "Go to Dashboard" [ref=e13] [cursor=pointer]:
      - /url: /
  - generic [ref=e15]:
    - generic [ref=e16]:
      - paragraph [ref=e17]: Help us improve RallyHub
      - paragraph [ref=e18]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e19]:
      - button "Necessary only" [ref=e20] [cursor=pointer]
      - button "Allow analytics" [ref=e21] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('directory search tolerates missing spaces and ranks Dublin 15', async ({ page }) => {
  4  |   await page.goto('/directory');
  5  |   const search = page.getByLabel('Search RallyHub directory');
  6  |   await search.fill('dublin15');
  7  |   await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  8  |   await expect(page.getByText(/listings? found for “dublin15”/i)).toBeVisible();
  9  | });
  10 | 
  11 | test('directory defaults to all pickleball and exposes provider categories', async ({ page }) => {
  12 |   await page.goto('/directory');
  13 |   await expect(page.getByLabel('What are you looking for?')).toHaveValue('all');
  14 |   await expect(page.getByTestId('directory-category-choices')).toContainText('Pickleball holidays');
  15 |   await expect(page.getByTestId('directory-category-choices')).toContainText('Equipment & suppliers');
  16 |   await expect(page.getByLabel('Search RallyHub directory')).toBeVisible();
  17 | });
  18 | 
  19 | test('directory category deep-link opens holiday providers directly', async ({ page }) => {
  20 |   await page.goto('/directory?category=holidays');
  21 |   await expect(page.getByLabel('What are you looking for?')).toHaveValue('holidays');
  22 |   await expect(page.getByRole('heading',{name:'Pickleball holidays & experiences',exact:true})).toBeVisible();
  23 | });
  24 | 
  25 | test('directory has an interactive all-Ireland map view linked to club profiles', async ({ page }) => {
  26 |   await page.goto('/directory');
  27 |   await page.getByLabel('What are you looking for?').selectOption('club');
> 28 |   await page.getByRole('button', { name: /map/i }).click();
     |                                                    ^ Error: locator.click: Test timeout of 45000ms exceeded.
  29 |   await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  30 |   await expect(page.getByText('Explore clubs on the map')).toBeVisible();
  31 |   await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
  32 | });
  33 | 
```