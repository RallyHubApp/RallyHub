# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-directory-production.spec.mjs >> production public Directory critical journey
- Location: e2e/public-directory-production.spec.mjs:9:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('combobox', { name: 'Filter by county' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "RallyHub RallyHub PLAY • CONNECT • BELONG" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]:
          - generic [ref=e9]: RallyHub
          - generic [ref=e10]: PLAY • CONNECT • BELONG
      - navigation [ref=e11]:
        - link "Home" [ref=e12] [cursor=pointer]:
          - /url: /
        - link "Directory" [ref=e13] [cursor=pointer]:
          - /url: /directory
        - link "Events" [ref=e14] [cursor=pointer]:
          - /url: /events
        - link "Club Guide" [ref=e15] [cursor=pointer]:
          - /url: /directory/help
        - link "About" [ref=e16] [cursor=pointer]:
          - /url: /about
      - generic [ref=e17]:
        - link "Search directory" [ref=e18] [cursor=pointer]:
          - /url: /directory
        - link [ref=e22] [cursor=pointer]:
          - /url: /login?returnTo=%2Fdirectory
          - button "Log in" [ref=e23]
        - link [ref=e24] [cursor=pointer]:
          - /url: /directory/add
          - button "Get Started" [ref=e25]
        - button "Current appearance Dark. Change appearance." [ref=e26] [cursor=pointer]
  - generic [ref=e28]:
    - generic [ref=e30]:
      - generic [ref=e31]: All-Ireland club directory · all 32 counties supported
      - heading "Find a club. Find a session. Get playing." [level=1] [ref=e35]:
        - text: Find a club.
        - generic [ref=e36]: Find a session.
        - generic [ref=e37]: Get playing.
      - paragraph [ref=e38]: Search public sports clubs across the whole island of Ireland by county, location, day and venue. The Directory stays simple to browse, while clubs can keep their public information accurate and up to date.
      - generic [ref=e39]:
        - link "Manage a listing" [ref=e40] [cursor=pointer]:
          - /url: /directory?manage=1
        - link "Add a missing club" [ref=e45] [cursor=pointer]:
          - /url: /directory/add
    - generic [ref=e49]:
      - img "Pickleball players on court with the RallyHub message Good People Great Games" [ref=e51]
      - generic [ref=e52]:
        - generic [ref=e53]:
          - strong [ref=e54]: "85"
          - text: club listings
        - generic [ref=e55]:
          - strong [ref=e56]: "26"
          - text: counties listed
        - generic [ref=e57]:
          - strong [ref=e58]: "32"
          - text: counties supported
  - generic [ref=e60]:
    - generic [ref=e61]:
      - textbox "Search club directory" [active] [ref=e66]:
        - /placeholder: Club, town, venue or Eircode
        - text: Clare Pickleball
      - combobox [ref=e67]:
        - option "All counties" [selected]
        - option "Antrim"
        - option "Armagh"
        - option "Carlow"
        - option "Cavan"
        - option "Clare"
        - option "Cork"
        - option "Derry"
        - option "Donegal"
        - option "Down"
        - option "Dublin"
        - option "Fermanagh"
        - option "Galway"
        - option "Kerry"
        - option "Kildare"
        - option "Kilkenny"
        - option "Laois"
        - option "Leitrim"
        - option "Limerick"
        - option "Longford"
        - option "Louth"
        - option "Mayo"
        - option "Meath"
        - option "Monaghan"
        - option "Offaly"
        - option "Roscommon"
        - option "Sligo"
        - option "Tipperary"
        - option "Tyrone"
        - option "Waterford"
        - option "Westmeath"
        - option "Wexford"
        - option "Wicklow"
      - combobox [ref=e68]:
        - option "Any day" [selected]
        - option "Monday"
        - option "Tuesday"
        - option "Wednesday"
        - option "Thursday"
        - option "Friday"
        - option "Saturday"
        - option "Sunday"
      - generic [ref=e69]:
        - button "clubs" [ref=e70] [cursor=pointer]
        - button "sessions" [ref=e71] [cursor=pointer]
        - button "map" [ref=e72] [cursor=pointer]
    - generic [ref=e73]:
      - generic [ref=e74]: Browse by county
      - link "Antrim · 4" [ref=e75] [cursor=pointer]:
        - /url: /pickleball-clubs/antrim
      - link "Armagh · 2" [ref=e76] [cursor=pointer]:
        - /url: /pickleball-clubs/armagh
      - link "Carlow · 1" [ref=e77] [cursor=pointer]:
        - /url: /pickleball-clubs/carlow
      - link "Cavan · 5" [ref=e78] [cursor=pointer]:
        - /url: /pickleball-clubs/cavan
      - link "Clare · 1" [ref=e79] [cursor=pointer]:
        - /url: /pickleball-clubs/clare
      - link "Cork · 10" [ref=e80] [cursor=pointer]:
        - /url: /pickleball-clubs/cork
      - link "Derry" [ref=e81] [cursor=pointer]:
        - /url: /pickleball-clubs/derry
      - link "Donegal · 1" [ref=e82] [cursor=pointer]:
        - /url: /pickleball-clubs/donegal
      - link "Down · 1" [ref=e83] [cursor=pointer]:
        - /url: /pickleball-clubs/down
      - link "Dublin · 15" [ref=e84] [cursor=pointer]:
        - /url: /pickleball-clubs/dublin
      - link "Fermanagh" [ref=e85] [cursor=pointer]:
        - /url: /pickleball-clubs/fermanagh
      - link "Galway · 6" [ref=e86] [cursor=pointer]:
        - /url: /pickleball-clubs/galway
      - link "Kerry · 4" [ref=e87] [cursor=pointer]:
        - /url: /pickleball-clubs/kerry
      - link "Kildare · 4" [ref=e88] [cursor=pointer]:
        - /url: /pickleball-clubs/kildare
      - link "Kilkenny · 1" [ref=e89] [cursor=pointer]:
        - /url: /pickleball-clubs/kilkenny
      - link "Laois · 1" [ref=e90] [cursor=pointer]:
        - /url: /pickleball-clubs/laois
      - link "Leitrim" [ref=e91] [cursor=pointer]:
        - /url: /pickleball-clubs/leitrim
      - link "Limerick · 1" [ref=e92] [cursor=pointer]:
        - /url: /pickleball-clubs/limerick
      - link "Longford · 1" [ref=e93] [cursor=pointer]:
        - /url: /pickleball-clubs/longford
      - link "Louth · 2" [ref=e94] [cursor=pointer]:
        - /url: /pickleball-clubs/louth
      - link "Mayo · 7" [ref=e95] [cursor=pointer]:
        - /url: /pickleball-clubs/mayo
      - link "Meath · 3" [ref=e96] [cursor=pointer]:
        - /url: /pickleball-clubs/meath
      - link "Monaghan · 1" [ref=e97] [cursor=pointer]:
        - /url: /pickleball-clubs/monaghan
      - link "Offaly · 1" [ref=e98] [cursor=pointer]:
        - /url: /pickleball-clubs/offaly
      - link "Roscommon" [ref=e99] [cursor=pointer]:
        - /url: /pickleball-clubs/roscommon
      - link "Sligo · 2" [ref=e100] [cursor=pointer]:
        - /url: /pickleball-clubs/sligo
      - link "Tipperary" [ref=e101] [cursor=pointer]:
        - /url: /pickleball-clubs/tipperary
      - link "Tyrone" [ref=e102] [cursor=pointer]:
        - /url: /pickleball-clubs/tyrone
      - link "Waterford · 1" [ref=e103] [cursor=pointer]:
        - /url: /pickleball-clubs/waterford
      - link "Westmeath · 3" [ref=e104] [cursor=pointer]:
        - /url: /pickleball-clubs/westmeath
      - link "Wexford · 2" [ref=e105] [cursor=pointer]:
        - /url: /pickleball-clubs/wexford
      - link "Wicklow · 5" [ref=e106] [cursor=pointer]:
        - /url: /pickleball-clubs/wicklow
  - main [ref=e107]:
    - generic [ref=e109]:
      - generic [ref=e110]:
        - generic [ref=e112]:
          - paragraph [ref=e113]: 2 clubs found for “Clare Pickleball”
          - heading "Best matches" [level=2] [ref=e114]
        - generic [ref=e116]:
          - article [ref=e117]:
            - generic [ref=e118]:
              - img "Clare Pickleball logo" [ref=e119]
              - generic [ref=e120]:
                - generic [ref=e121]:
                  - generic [ref=e122]:
                    - paragraph [ref=e123]: Pickleball · County Clare
                    - heading "Clare Pickleball" [level=3] [ref=e124]
                  - generic [ref=e125]: Verified club listing
                - paragraph [ref=e129]: A welcoming, members-only pickleball club with indoor sessions across County Clare.
                - generic [ref=e130]:
                  - generic [ref=e131]: 3 venues
                  - generic [ref=e136]: 7 weekly sessions
                  - generic [ref=e139]: Clare
            - generic [ref=e143]:
              - generic [ref=e144]:
                - generic [ref=e145]: Doora Barefield
                - generic [ref=e146]: Corofin
                - generic [ref=e147]: Ennistymon
              - generic [ref=e148]:
                - button "Share Clare Pickleball" [ref=e149] [cursor=pointer]: Share
                - link "View club" [ref=e156] [cursor=pointer]:
                  - /url: /directory/clare-pickleball
          - article [ref=e159]:
            - generic [ref=e160]:
              - img "VAMOS Pickleball logo" [ref=e161]
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - paragraph [ref=e165]: Pickleball · County Galway
                    - heading "VAMOS Pickleball" [level=3] [ref=e166]
                  - generic [ref=e167]: Verified club listing
                - paragraph [ref=e171]: VAMOS Pickleball is listed in the RallyHub Club Directory for County Galway.
                - generic [ref=e172]:
                  - generic [ref=e173]: 3 venues
                  - generic [ref=e178]: 5 weekly sessions
                  - generic [ref=e181]: Galway
            - generic [ref=e185]:
              - generic [ref=e186]:
                - generic [ref=e187]: Coláiste Bhaile Chláir - Claregalway College
                - generic [ref=e188]: Spond venue
                - generic [ref=e189]: Ballybane Community Resource Centre
              - generic [ref=e190]:
                - button "Share VAMOS Pickleball" [ref=e191] [cursor=pointer]: Share
                - link "View club" [ref=e198] [cursor=pointer]:
                  - /url: /directory/vamos-pickleball
      - complementary [ref=e201]:
        - generic [ref=e202]:
          - generic [ref=e203]:
            - heading "Explore clubs on the map" [level=2] [ref=e204]
            - paragraph [ref=e205]: Mapped venues update with the same filters.
          - generic [ref=e206]:
            - generic:
              - generic:
                - button "Marker" [ref=e207] [cursor=pointer]
                - button "Marker" [ref=e208] [cursor=pointer]
                - button "Marker" [ref=e209] [cursor=pointer]
                - button "Marker" [ref=e210] [cursor=pointer]
                - button "Marker" [ref=e211] [cursor=pointer]
            - generic:
              - generic [ref=e212]:
                - button "Zoom in" [ref=e213] [cursor=pointer]: +
                - button "Zoom out" [ref=e214] [cursor=pointer]: −
              - generic [ref=e215]:
                - link "Leaflet" [ref=e216] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| © OpenStreetMap contributors"
  - contentinfo [ref=e221]:
    - generic [ref=e223]:
      - generic [ref=e224]:
        - generic [ref=e225]: RallyHub
        - generic [ref=e226]: PLAY • CONNECT • BELONG
      - generic [ref=e227]:
        - link "Directory" [ref=e228] [cursor=pointer]:
          - /url: /directory
        - link "Events" [ref=e229] [cursor=pointer]:
          - /url: /events
        - link "Club Guide" [ref=e230] [cursor=pointer]:
          - /url: /directory/help
        - link "About" [ref=e231] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=e232] [cursor=pointer]:
          - /url: /contact
    - generic [ref=e233]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const PROD = 'https://rallyhub.ie';
  4   | const enabled = process.env.RALLYHUB_PRODUCTION_TEST === 'YES';
  5   | test.skip(!enabled, 'Set RALLYHUB_PRODUCTION_TEST=YES to run controlled tests against live RallyHub.');
  6   | 
  7   | test.use({ baseURL: PROD });
  8   | 
  9   | test('production public Directory critical journey', async ({ page }) => {
  10  |   const pageErrors = [];
  11  |   const functionStatuses = [];
  12  |   page.on('pageerror', error => pageErrors.push(error.message));
  13  |   page.on('response', response => {
  14  |     if (/directoryListingProfile/i.test(response.url())) functionStatuses.push(response.status());
  15  |   });
  16  | 
  17  |   const response = await page.goto('/directory', { waitUntil: 'domcontentloaded' });
  18  |   expect(response?.status()).toBeLessThan(400);
  19  |   await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 30_000 });
  20  |   await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible({ timeout: 30_000 });
  21  | 
  22  |   const search = page.getByRole('textbox', { name: 'Search club directory' });
  23  |   await search.fill('Clare Pickleball');
  24  |   const clareCard = page.locator('article').filter({ hasText: 'Clare Pickleball' }).first();
  25  |   await expect(clareCard).toBeVisible();
> 26  |   await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Clare' });
      |                                                                  ^ Error: locator.selectOption: Test timeout of 45000ms exceeded.
  27  |   await expect(clareCard).toBeVisible();
  28  | 
  29  |   await search.fill('definitely-no-such-rallyhub-club');
  30  |   await expect(page.getByRole('heading', { name: 'No matching clubs yet' })).toBeVisible();
  31  |   await search.fill('');
  32  |   await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'All counties' });
  33  | 
  34  |   await page.getByRole('button', { name: /map/i }).click();
  35  |   await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  36  |   await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 20_000 });
  37  | 
  38  |   await page.getByRole('button', { name: /clubs/i }).click();
  39  |   await search.fill('Clare Pickleball');
  40  |   await clareCard.getByRole('link', { name: /View club/i }).click();
  41  |   await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  42  |   await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  43  |   await page.reload();
  44  |   await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  45  |   await page.goBack();
  46  |   await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  47  |   await page.goForward();
  48  |   await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  49  | 
  50  |   expect(pageErrors).toEqual([]);
  51  |   expect(functionStatuses.some(status => status >= 500 || status === 429)).toBeFalsy();
  52  | });
  53  | 
  54  | test('production public route and SEO smoke', async ({ page }) => {
  55  |   const routes = [
  56  |     '/',
  57  |     '/about',
  58  |     '/contact',
  59  |     '/events',
  60  |     '/directory',
  61  |     '/directory/help',
  62  |     '/directory/quick-start',
  63  |     '/directory/story',
  64  |     '/directory/add',
  65  |     '/pickleball-clubs/clare',
  66  |     '/directory/clare-pickleball',
  67  |     '/directory/clare-pickleball/claim',
  68  |     '/robots.txt',
  69  |     '/directory-sitemap.xml',
  70  |   ];
  71  | 
  72  |   for (const route of routes) {
  73  |     const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  74  |     expect(response?.status(), route).toBeLessThan(400);
  75  |     if (!route.endsWith('.txt') && !route.endsWith('.xml')) {
  76  |       await expect(page.locator('body'), route).not.toContainText('Page Not Found');
  77  |       await expect(page.locator('body'), route).not.toContainText('Application error');
  78  |     }
  79  |   }
  80  | 
  81  |   await page.goto('/directory');
  82  |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory');
  83  |   await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /club listings/i);
  84  | });
  85  | 
  86  | test('production mobile Directory menu and layout', async ({ browser }) => {
  87  |   const context = await browser.newContext({
  88  |     baseURL: PROD,
  89  |     viewport: { width: 390, height: 844 },
  90  |     hasTouch: true,
  91  |     isMobile: true,
  92  |   });
  93  |   const page = await context.newPage();
  94  |   await page.goto('/directory', { waitUntil: 'domcontentloaded' });
  95  |   await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 30_000 });
  96  | 
  97  |   const dimensions = await page.evaluate(() => ({
  98  |     viewport: window.innerWidth,
  99  |     scrollWidth: document.documentElement.scrollWidth,
  100 |   }));
  101 |   expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 2);
  102 | 
  103 |   await page.getByRole('button', { name: 'Menu' }).click();
  104 |   const header = page.getByRole('banner');
  105 |   for (const label of ['Home', 'Directory', 'Events', 'Club Guide', 'About']) {
  106 |     await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
  107 |   }
  108 | 
  109 |   await context.close();
  110 | });
  111 | 
  112 | test('25 concurrent clean production visitors', async ({ browser }) => {
  113 |   test.setTimeout(150_000);
  114 |   const visitorCount = 25;
  115 |   const started = Date.now();
  116 | 
  117 |   const visitors = await Promise.all(Array.from({ length: visitorCount }, async (_, index) => {
  118 |     const context = await browser.newContext({
  119 |       baseURL: PROD,
  120 |       viewport: { width: index % 2 ? 390 : 1366, height: index % 2 ? 844 : 768 },
  121 |       hasTouch: index % 2 === 1,
  122 |       isMobile: index % 2 === 1,
  123 |     });
  124 |     const page = await context.newPage();
  125 |     const functionStatuses = [];
  126 |     const pageErrors = [];
```