# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-search-map.spec.mjs >> directory category deep-link opens holiday providers directly
- Location: e2e/directory-search-map.spec.mjs:21:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Pickleball holidays/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /Pickleball holidays/i }) resolved to 2 elements:
    1) <h2 data-dynamic-content="true" data-source-location="src/pages/PublicDirectory.jsx:476:22" class="mt-1 text-[26px] font-black tracking-[-.03em] text-[#07184c]">Pickleball holidays & experiences</h2> aka getByRole('heading', { name: 'Pickleball holidays & experiences', exact: true })
    2) <h3 data-dynamic-content="true" class="font-bold text-[#07184c]" data-source-location="src/pages/PublicDirectory.jsx:552:22">No pickleball holidays & experiences yet</h3> aka getByRole('heading', { name: 'No pickleball holidays &' })

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Pickleball holidays/i }) with timeout 3000ms
  - waiting for getByRole('heading', { name: /Pickleball holidays/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6] [cursor=pointer]:
          - /url: /
          - img "RallyHub — Play Connect Belong" [ref=e7]
        - navigation [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /
          - link "Directory" [ref=e10] [cursor=pointer]:
            - /url: /directory
          - link "Events" [ref=e11] [cursor=pointer]:
            - /url: /events
          - link "Club Guide" [ref=e12] [cursor=pointer]:
            - /url: /directory/help
          - link "About" [ref=e13] [cursor=pointer]:
            - /url: /about
        - generic [ref=e14]:
          - link "Search directory" [ref=e15] [cursor=pointer]:
            - /url: /directory
          - link [ref=e19] [cursor=pointer]:
            - /url: /login?returnTo=%2Fdirectory%3Fcategory%3Dholidays
            - button "Log in" [ref=e20]
          - link [ref=e21] [cursor=pointer]:
            - /url: /directory/add
            - button "Get Started" [ref=e22]
          - button "Current appearance Auto. Change appearance." [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]: Pickleball clubs, coaches, events, holidays & suppliers
        - heading "Find pickleball. Find your next thing. Get playing." [level=1] [ref=e32]:
          - text: Find pickleball.
          - generic [ref=e33]: Find your next thing.
          - generic [ref=e34]: Get playing.
        - paragraph [ref=e35]: Explore clubs and places to play, coaches, event organisers, pickleball holidays and equipment suppliers. Use one search across the whole RallyHub Directory, then narrow by the type of pickleball you are looking for.
        - generic [ref=e36]:
          - link "Add or update a club or listing" [ref=e37] [cursor=pointer]:
            - /url: /directory/add
          - link "Player updates" [ref=e42] [cursor=pointer]:
            - /url: "#player-network"
      - generic [ref=e49]:
        - img "Pickleball players on court with the RallyHub message Good People Great Games" [ref=e51]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - strong [ref=e54]: "82"
            - text: club listings
          - generic [ref=e55]:
            - strong [ref=e56]: "26"
            - text: counties listed
          - generic [ref=e57]:
            - strong [ref=e58]: "32"
            - text: counties supported
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e70]:
          - paragraph [ref=e71]: For players across Ireland
          - heading "Never miss another tournament!" [level=2] [ref=e72]
          - paragraph [ref=e73]: Never miss another tournament, event, coaching session or other worthwhile pickleball opportunity in Ireland. Get notified by RallyHub.
        - button "Choose my updates" [ref=e75] [cursor=pointer]
      - generic [ref=e76]:
        - heading "Can't find your club?" [level=3] [ref=e81]
        - paragraph [ref=e82]: Send a ready-made message to your club organiser and help us complete the Directory.
        - generic [ref=e83]:
          - button "WhatsApp my club" [ref=e84] [cursor=pointer]
          - button "Email my club" [ref=e87] [cursor=pointer]
      - generic [ref=e91]:
        - heading "Know someone who plays pickleball?" [level=3] [ref=e99]
        - paragraph [ref=e100]: Share RallyHub with a friend and help more players discover places to play around Ireland.
        - generic [ref=e101]:
          - button "Share with a player" [ref=e102] [cursor=pointer]
          - button "Email a player" [ref=e105] [cursor=pointer]
    - generic [ref=e110]:
      - generic [ref=e111]:
        - button "Everything 82 listed" [ref=e112] [cursor=pointer]:
          - generic [ref=e113]: Everything
          - paragraph [ref=e120]: 82 listed
        - button "Clubs & places to play 82 listed" [ref=e121] [cursor=pointer]:
          - generic [ref=e122]: Clubs & places to play
          - paragraph [ref=e128]: 82 listed
        - button "Tournaments & events 0 listed" [ref=e129] [cursor=pointer]:
          - generic [ref=e130]: Tournaments & events
          - paragraph [ref=e138]: 0 listed
        - button "Coaching 0 listed" [ref=e139] [cursor=pointer]:
          - generic [ref=e140]: Coaching
          - paragraph [ref=e145]: 0 listed
        - button "Pickleball holidays & experiences 0 listed" [ref=e146] [cursor=pointer]:
          - generic [ref=e147]: Pickleball holidays & experiences
          - paragraph [ref=e151]: 0 listed
        - button "Equipment & suppliers 0 listed" [ref=e152] [cursor=pointer]:
          - generic [ref=e153]: Equipment & suppliers
          - paragraph [ref=e158]: 0 listed
      - generic [ref=e159]:
        - combobox "What are you looking for?" [ref=e160]:
          - option "Everything"
          - option "Clubs & places to play"
          - option "Tournaments & events"
          - option "Coaching"
          - option "Pickleball holidays & experiences" [selected]
          - option "Equipment & suppliers"
        - textbox "Search RallyHub directory" [ref=e165]:
          - /placeholder: Search clubs, coaches, holidays, suppliers, towns or venues
        - link "Add a listing" [ref=e166] [cursor=pointer]:
          - /url: /directory/add
    - main [ref=e167]:
      - generic [ref=e170]:
        - generic [ref=e172]:
          - paragraph [ref=e173]: 0 listings found
          - heading "Pickleball holidays & experiences" [level=2] [ref=e174]
        - generic [ref=e176]:
          - heading "No pickleball holidays & experiences yet" [level=3] [ref=e180]
          - paragraph [ref=e181]: Be among the first to add this type of pickleball listing to RallyHub.
          - generic [ref=e182]:
            - link "Add a listing" [ref=e183] [cursor=pointer]:
              - /url: /directory/add
            - link "Invite the club by WhatsApp / email" [ref=e184] [cursor=pointer]:
              - /url: "#player-network"
    - contentinfo "RallyHub footer" [ref=e186]:
      - generic [ref=e187]:
        - generic [ref=e188]:
          - link "RallyHub home" [ref=e189] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e190]
          - navigation "Footer navigation" [ref=e191]:
            - link "Directory" [ref=e192] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e193] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e194] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e195] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e196] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e197]: © 2026 RallyHub All rights reserved.
  - generic [ref=e199]:
    - generic [ref=e200]:
      - paragraph [ref=e201]: Help us improve RallyHub
      - paragraph [ref=e202]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e203]:
      - button "Necessary only" [ref=e204] [cursor=pointer]
      - button "Allow analytics" [ref=e205] [cursor=pointer]
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
  18 |   await expect(page.getByText("Sandra's Travel Treasures",{exact:true})).toBeVisible();
  19 | });
  20 | 
  21 | test('directory category deep-link opens holiday providers directly', async ({ page }) => {
  22 |   await page.goto('/directory?category=holidays');
  23 |   await expect(page.getByLabel('What are you looking for?')).toHaveValue('holidays');
> 24 |   await expect(page.getByRole('heading',{name:/Pickleball holidays/i})).toBeVisible();
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
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