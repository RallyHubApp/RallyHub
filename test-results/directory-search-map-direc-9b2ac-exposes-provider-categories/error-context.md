# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-search-map.spec.mjs >> directory defaults to all pickleball and exposes provider categories
- Location: e2e/directory-search-map.spec.mjs:11:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Sandra\'s Travel Treasures', { exact: true })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Sandra\'s Travel Treasures', { exact: true }) with timeout 3000ms
  - waiting for getByText('Sandra\'s Travel Treasures', { exact: true })

```

```yaml
- banner:
  - link "RallyHub — Play Connect Belong":
    - /url: /
    - img "RallyHub — Play Connect Belong"
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
    - /url: /login?returnTo=%2Fdirectory
    - button "Log in"
  - link "Get Started":
    - /url: /directory/add
    - button "Get Started"
  - button "Current appearance Auto. Change appearance.":
    - img
- img
- text: Pickleball clubs, coaches, events, holidays & suppliers
- heading "Find pickleball. Find your next thing. Get playing." [level=1]
- paragraph: Explore clubs and places to play, coaches, event organisers, pickleball holidays and equipment suppliers. Use one search across the whole RallyHub Directory, then narrow by the type of pickleball you are looking for.
- link "Add or update a club or listing":
  - /url: /directory/add
  - img
  - text: Add or update a club or listing
- link "Player updates":
  - /url: "#player-network"
  - img
  - text: Player updates
- img "Pickleball players on court with the RallyHub message Good People Great Games"
- strong: "82"
- text: club listings
- strong: "26"
- text: counties listed
- strong: "32"
- text: counties supported
- img
- paragraph: For players across Ireland
- heading "Never miss another tournament!" [level=2]
- paragraph: Never miss another tournament, event, coaching session or other worthwhile pickleball opportunity in Ireland. Get notified by RallyHub.
- button "Choose my updates"
- img
- heading "Can't find your club?" [level=3]
- paragraph: Send a ready-made message to your club organiser and help us complete the Directory.
- button "WhatsApp my club":
  - img
  - text: WhatsApp my club
- button "Email my club":
  - img
  - text: Email my club
- img
- heading "Know someone who plays pickleball?" [level=3]
- paragraph: Share RallyHub with a friend and help more players discover places to play around Ireland.
- button "Share with a player":
  - img
  - text: Share with a player
- button "Email a player":
  - img
  - text: Email a player
- button "Everything 82 listed":
  - img
  - text: Everything
  - paragraph: 82 listed
- button "Clubs & places to play 82 listed":
  - img
  - text: Clubs & places to play
  - paragraph: 82 listed
- button "Tournaments & events 0 listed":
  - img
  - text: Tournaments & events
  - paragraph: 0 listed
- button "Coaching 0 listed":
  - img
  - text: Coaching
  - paragraph: 0 listed
- button "Pickleball holidays & experiences 0 listed":
  - img
  - text: Pickleball holidays & experiences
  - paragraph: 0 listed
- button "Equipment & suppliers 0 listed":
  - img
  - text: Equipment & suppliers
  - paragraph: 0 listed
- combobox "What are you looking for?":
  - option "Everything" [selected]
  - option "Clubs & places to play"
  - option "Tournaments & events"
  - option "Coaching"
  - option "Pickleball holidays & experiences"
  - option "Equipment & suppliers"
- img
- textbox "Search RallyHub directory":
  - /placeholder: Search clubs, coaches, holidays, suppliers, towns or venues
  - text: Sandra's Travel Treasures
- link "Add a listing":
  - /url: /directory/add
- main:
  - paragraph: 0 listings found for “Sandra's Travel Treasures”
  - heading "Best matches" [level=2]
  - img
  - img
  - heading "No everything yet" [level=3]
  - paragraph: Be among the first to add this type of pickleball listing to RallyHub.
  - link "Add a listing":
    - /url: /directory/add
  - link "Invite the club by WhatsApp / email":
    - /url: "#player-network"
- contentinfo "RallyHub footer":
  - link "RallyHub home":
    - /url: /
    - img "RallyHub"
  - navigation "Footer navigation":
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
    - link "Contact":
      - /url: /contact
  - text: © 2026 RallyHub All rights reserved.
- paragraph: Help us improve RallyHub
- paragraph: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
- button "Necessary only"
- button "Allow analytics"
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
  16 |   const search=page.getByLabel('Search RallyHub directory');
  17 |   await search.fill("Sandra's Travel Treasures");
> 18 |   await expect(page.getByText("Sandra's Travel Treasures",{exact:true})).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  19 | });
  20 | 
  21 | test('directory category deep-link opens holiday providers directly', async ({ page }) => {
  22 |   await page.goto('/directory?category=holidays');
  23 |   await expect(page.getByLabel('What are you looking for?')).toHaveValue('holidays');
  24 |   await expect(page.getByRole('heading',{name:/Pickleball holidays/i})).toBeVisible();
  25 | });
  26 | 
  27 | test('directory has an interactive all-Ireland map view linked to club profiles', async ({ page }) => {
  28 |   await page.goto('/directory');
  29 |   await page.getByLabel('What are you looking for?').selectOption('club');
  30 |   await page.getByRole('button', { name: /map/i }).click();
  31 |   await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  32 |   await expect(page.getByText('Explore clubs on the map')).toBeVisible();
  33 |   await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
  34 | });
  35 | 
```