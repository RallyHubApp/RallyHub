# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-directory-production.spec.mjs >> production public Directory critical journey
- Location: e2e/public-directory-production.spec.mjs:9:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Cannot read properties of undefined (reading '_leaflet_pos')",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "RallyHub RallyHub PLAY • CONNECT • BELONG" [ref=f1e6] [cursor=pointer]:
        - /url: /
        - img "RallyHub" [ref=f1e7]
        - generic [ref=f1e8]:
          - generic [ref=f1e9]: RallyHub
          - generic [ref=f1e10]: PLAY • CONNECT • BELONG
      - navigation [ref=f1e11]:
        - link "Home" [ref=f1e12] [cursor=pointer]:
          - /url: /
        - link "Directory" [ref=f1e13] [cursor=pointer]:
          - /url: /directory
        - link "Events" [ref=f1e14] [cursor=pointer]:
          - /url: /events
        - link "Club Guide" [ref=f1e15] [cursor=pointer]:
          - /url: /directory/help
        - link "About" [ref=f1e16] [cursor=pointer]:
          - /url: /about
      - generic [ref=f1e17]:
        - link "Search directory" [ref=f1e18] [cursor=pointer]:
          - /url: /directory
        - link [ref=f1e22] [cursor=pointer]:
          - /url: /login?returnTo=%2Fdirectory%2Fclare-pickleball
          - button "Log in" [ref=f1e23]
        - link [ref=f1e24] [cursor=pointer]:
          - /url: /directory/add
          - button "Get Started" [ref=f1e25]
        - button "Current appearance Dark. Change appearance." [ref=f1e26] [cursor=pointer]
  - main [ref=f1e27]:
    - generic [ref=f1e29]:
      - link "Back to directory" [ref=f1e30] [cursor=pointer]:
        - /url: /directory
      - generic [ref=f1e33]:
        - img "Clare Pickleball logo" [ref=f1e34]
        - generic [ref=f1e35]:
          - generic [ref=f1e36]:
            - generic [ref=f1e37]: Pickleball
            - generic [ref=f1e38]: Verified club listing
          - heading "Clare Pickleball" [level=1] [ref=f1e43]
          - paragraph [ref=f1e44]: A welcoming, members-only pickleball club with indoor sessions across County Clare.
          - generic [ref=f1e45]:
            - link "Website" [ref=f1e46] [cursor=pointer]:
              - /url: https://clarepickleball.ie/
            - link "Join waiting list" [ref=f1e52] [cursor=pointer]:
              - /url: https://forms.gle/gWYZHHLBeUwyU3u17
            - button "Share club" [ref=f1e59] [cursor=pointer]
    - generic [ref=f1e66]:
      - generic [ref=f1e67]:
        - generic [ref=f1e68]:
          - paragraph [ref=f1e69]: Guest policy
          - paragraph [ref=f1e70]: Experienced pickleball players from other clubs or visiting from abroad are most welcome. No beginner walk-in sessions.
          - paragraph [ref=f1e71]: Please contact the club before attending any session.
        - generic [ref=f1e72]:
          - heading "Weekly sessions" [level=2] [ref=f1e76]
          - generic [ref=f1e77]:
            - generic [ref=f1e78]:
              - heading "Monday" [level=3] [ref=f1e79]
              - generic [ref=f1e80]:
                - generic [ref=f1e81]:
                  - paragraph [ref=f1e82]: 19:00–20:30
                  - generic [ref=f1e83]:
                    - paragraph [ref=f1e84]: Social & Recreational
                    - paragraph [ref=f1e85]: St Joseph's Doora Barefield GAA Sports Hall
                    - generic [ref=f1e86]:
                      - generic [ref=f1e87]: €5.50
                      - generic [ref=f1e88]: Contact club
                      - generic [ref=f1e89]: Capacity 18
                      - generic [ref=f1e90]: "Host: Brian Moore"
                  - paragraph [ref=f1e92]: Contact club
                - generic [ref=f1e93]:
                  - paragraph [ref=f1e94]: 20:30–22:00
                  - generic [ref=f1e95]:
                    - paragraph [ref=f1e96]: Improver & Advanced
                    - paragraph [ref=f1e97]: St Joseph's Doora Barefield GAA Sports Hall
                    - generic [ref=f1e98]:
                      - generic [ref=f1e99]: €5.50
                      - generic [ref=f1e100]: Contact club
                      - generic [ref=f1e101]: Capacity 18
                      - generic [ref=f1e102]: "Host: Brian Moore"
                  - paragraph [ref=f1e104]: Contact club
            - generic [ref=f1e105]:
              - heading "Wednesday" [level=3] [ref=f1e106]
              - generic [ref=f1e107]:
                - generic [ref=f1e108]:
                  - paragraph [ref=f1e109]: 11:30–13:30
                  - generic [ref=f1e110]:
                    - paragraph [ref=f1e111]: Club Session
                    - paragraph [ref=f1e112]: Corofin GAA Sports Hall
                    - generic [ref=f1e113]:
                      - generic [ref=f1e114]: €5
                      - generic [ref=f1e115]: Cash
                      - generic [ref=f1e116]: Capacity 14
                      - generic [ref=f1e117]: "Host: Brian Moore"
                  - paragraph [ref=f1e119]: Contact club
                - generic [ref=f1e120]:
                  - paragraph [ref=f1e121]: 19:00–20:00
                  - generic [ref=f1e122]:
                    - paragraph [ref=f1e123]: Club Session
                    - paragraph [ref=f1e124]: Ennistymon Community Centre
                    - generic [ref=f1e125]:
                      - generic [ref=f1e126]: Contact club
                      - generic [ref=f1e127]: Capacity 14
                      - generic [ref=f1e128]: "Host: Brian Moore"
                  - paragraph [ref=f1e130]: Contact club
                - generic [ref=f1e131]:
                  - paragraph [ref=f1e132]: 20:00–21:00
                  - generic [ref=f1e133]:
                    - paragraph [ref=f1e134]: Club Session
                    - paragraph [ref=f1e135]: Ennistymon Community Centre
                    - generic [ref=f1e136]:
                      - generic [ref=f1e137]: Contact club
                      - generic [ref=f1e138]: Capacity 14
                  - paragraph [ref=f1e140]: Contact club
            - generic [ref=f1e141]:
              - heading "Thursday" [level=3] [ref=f1e142]
              - generic [ref=f1e143]:
                - generic [ref=f1e144]:
                  - paragraph [ref=f1e145]: 19:00–20:30
                  - generic [ref=f1e146]:
                    - paragraph [ref=f1e147]: Social & Recreational
                    - paragraph [ref=f1e148]: St Joseph's Doora Barefield GAA Sports Hall
                    - generic [ref=f1e149]:
                      - generic [ref=f1e150]: €5.50
                      - generic [ref=f1e151]: Capacity 18
                      - generic [ref=f1e152]: "Host: Brian Moore"
                  - paragraph [ref=f1e154]: Contact club
                - generic [ref=f1e155]:
                  - paragraph [ref=f1e156]: 20:30–22:00
                  - generic [ref=f1e157]:
                    - paragraph [ref=f1e158]: Improver & Advanced
                    - paragraph [ref=f1e159]: St Joseph's Doora Barefield GAA Sports Hall
                    - generic [ref=f1e160]:
                      - generic [ref=f1e161]: €5.50
                      - generic [ref=f1e162]: Capacity 18
                      - generic [ref=f1e163]: "Host: Brian Moore"
                  - paragraph [ref=f1e165]: Contact club
          - paragraph [ref=f1e166]: Times and availability can change. Contact the club before travelling.
        - generic [ref=f1e167]:
          - heading "Club venues" [level=2] [ref=f1e172]
          - generic [ref=f1e173]:
            - article [ref=f1e174]:
              - generic [ref=f1e175]:
                - generic [ref=f1e176]:
                  - heading "St Joseph's Doora Barefield GAA Sports Hall" [level=3] [ref=f1e177]
                  - paragraph [ref=f1e178]: Gurteen, Quin Road, Co. Clare · V95 PD36
                - generic [ref=f1e179]: INDOOR
              - generic [ref=f1e180]:
                - paragraph [ref=f1e181]: 4 courts · Contact club
                - link "Map" [ref=f1e183] [cursor=pointer]:
                  - /url: https://maps.google.com/?q=V95+PD36
            - article [ref=f1e188]:
              - generic [ref=f1e189]:
                - generic [ref=f1e190]:
                  - heading "Corofin GAA Sports Hall" [level=3] [ref=f1e191]
                  - paragraph [ref=f1e192]: Corofin, Co. Clare · V95 XD56
                - generic [ref=f1e193]: INDOOR
              - generic [ref=f1e194]:
                - paragraph [ref=f1e195]: 3 courts · Contact club
                - link "Map" [ref=f1e197] [cursor=pointer]:
                  - /url: https://maps.google.com/?q=V95+XD56
            - article [ref=f1e202]:
              - generic [ref=f1e203]:
                - generic [ref=f1e204]:
                  - heading "Ennistymon Community Centre" [level=3] [ref=f1e205]
                  - paragraph [ref=f1e206]: Parliament Street, Ennistymon, Co. Clare · V95 X8XC
                - generic [ref=f1e207]: INDOOR
              - generic [ref=f1e208]:
                - paragraph [ref=f1e209]: 3 courts · Contact club
                - link "Map" [ref=f1e211] [cursor=pointer]:
                  - /url: https://maps.app.goo.gl/xgPBCUfrBp35vu116
      - complementary [ref=f1e216]:
        - generic [ref=f1e217]:
          - paragraph [ref=f1e218]: Club contact
          - heading "Contact Brian Moore" [level=2] [ref=f1e219]
          - generic [ref=f1e220]:
            - link "087 810 0333" [ref=f1e221] [cursor=pointer]:
              - /url: tel:+353878100333
            - link "WhatsApp Brian Moore" [ref=f1e225] [cursor=pointer]:
              - /url: https://wa.me/353878100333
            - link "info@clarepickleball.ie" [ref=f1e229] [cursor=pointer]:
              - /url: mailto:info@clarepickleball.ie
        - generic [ref=f1e234]:
          - heading "Club details" [level=2] [ref=f1e235]
          - generic [ref=f1e236]:
            - generic [ref=f1e237]:
              - term [ref=f1e238]: County
              - definition [ref=f1e239]: Clare
            - generic [ref=f1e240]:
              - term [ref=f1e241]: Founded
              - definition [ref=f1e242]: May 2025
            - generic [ref=f1e243]:
              - term [ref=f1e244]: Affiliation
              - definition [ref=f1e245]: Pickleball Ireland
            - generic [ref=f1e246]:
              - term [ref=f1e247]: Membership
              - definition [ref=f1e248]: Full – waiting list open
            - generic [ref=f1e249]:
              - term [ref=f1e250]: Listing
              - definition [ref=f1e251]: Verified club representative
        - generic [ref=f1e252]:
          - heading "Club links" [level=2] [ref=f1e253]
          - generic [ref=f1e254]:
            - link "Facebook" [ref=f1e255] [cursor=pointer]:
              - /url: https://www.facebook.com/profile.php?id=61576112630693
            - link "Instagram" [ref=f1e258] [cursor=pointer]:
              - /url: https://www.instagram.com/clarepickleball
  - contentinfo "RallyHub copyright" [ref=f1e260]:
    - generic [ref=f1e261]: © 2026 RallyHub All rights reserved.
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
  26  |   await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Clare' });
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
> 50  |   expect(pageErrors).toEqual([]);
      |                      ^ Error: expect(received).toEqual(expected) // deep equality
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
  127 |     page.on('pageerror', error => pageErrors.push(error.message));
  128 |     page.on('response', response => {
  129 |       if (/directoryListingProfile/i.test(response.url())) functionStatuses.push(response.status());
  130 |     });
  131 | 
  132 |     const t0 = Date.now();
  133 |     try {
  134 |       const response = await page.goto('/directory', { waitUntil: 'domcontentloaded', timeout: 45_000 });
  135 |       if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() || 'no response'}`);
  136 |       await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 45_000 });
  137 |       await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible({ timeout: 45_000 });
  138 |       return { ok: true, ms: Date.now() - t0, functionStatuses, pageErrors, context };
  139 |     } catch (error) {
  140 |       return { ok: false, ms: Date.now() - t0, functionStatuses, pageErrors: [...pageErrors, error.message], context };
  141 |     }
  142 |   }));
  143 | 
  144 |   const results = visitors.map(({ context, ...result }) => result);
  145 |   await Promise.all(visitors.map(visitor => visitor.context.close()));
  146 | 
  147 |   const failures = results.filter(result => !result.ok);
  148 |   const statuses = results.flatMap(result => result.functionStatuses);
  149 |   const durations = results.map(result => result.ms).sort((a, b) => a - b);
  150 |   const percentile = fraction => durations[Math.min(durations.length - 1, Math.floor((durations.length - 1) * fraction))];
```