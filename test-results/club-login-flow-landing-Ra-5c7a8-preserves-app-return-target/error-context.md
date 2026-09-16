# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-login-flow.spec.mjs >> landing RallyHub Club Login uses the local login flow and preserves /app return target
- Location: e2e/club-login-flow.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'RallyHub Club Login', exact: true })
Expected: visible
Error: strict mode violation: getByRole('button', { name: 'RallyHub Club Login', exact: true }) resolved to 2 elements:
    1) <button data-dynamic-content="true" data-source-location="src/pages/Landing.jsx:138:14" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 w-full text-base sm:text-lg px-5 py-6 rou…>…</button> aka getByRole('button', { name: 'RallyHub Club Login' }).first()
    2) <button data-dynamic-content="true" data-source-location="src/pages/Landing.jsx:305:12" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 text-lg px-8 py-6 rounded-xl">…</button> aka getByRole('button', { name: 'RallyHub Club Login' }).nth(1)

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'RallyHub Club Login', exact: true }) with timeout 3000ms
  - waiting for getByRole('button', { name: 'RallyHub Club Login', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e7]:
    - generic [ref=e8]: Club Directory Preview · 84 clubs currently listed · details are being verified
    - generic [ref=e9]:
      - img "RallyHub" [ref=e10]
      - heading "Welcome | RallyHub" [level=1] [ref=e11]
    - paragraph [ref=e12]: Find clubs and places to play. RallyHub also gives clubs the tools to organise members, competitions and events.
    - generic [ref=e13]:
      - link [ref=e14] [cursor=pointer]:
        - /url: /directory
        - button "Find a Club" [ref=e15]
      - link [ref=e16] [cursor=pointer]:
        - /url: /directory?manage=1
        - button "Manage Directory Listing" [ref=e17]
      - button "RallyHub Club Login" [ref=e18] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]:
        - paragraph [ref=e21]: Can't find your club?
        - paragraph [ref=e22]: Add it to the RallyHub Directory for review. This does not create a RallyHub Club account.
      - link [ref=e23] [cursor=pointer]:
        - /url: /directory/add
        - button "Add Your Club" [ref=e24]
    - paragraph [ref=e25]: Browse freely. Sign in only to manage a directory listing or use the full RallyHub Club platform.
  - generic [ref=e26]:
    - generic [ref=e27]:
      - heading "Discover, Organise & Grow Your Club" [level=2] [ref=e28]
      - paragraph [ref=e29]: Start with the public club directory, then use RallyHub's competition and club-management tools when your club is ready.
    - generic [ref=e30]:
      - generic [ref=e31]:
        - heading "Find Clubs & Places to Play" [level=3] [ref=e36]
        - paragraph [ref=e37]: Browse public club listings, venues and contact details without creating an account.
      - generic [ref=e38]:
        - heading "Competitions & Events" [level=3] [ref=e46]
        - paragraph [ref=e47]: Run King of the Court, interclub challenges, tournaments and other club events.
      - generic [ref=e48]:
        - heading "Club & Member Management" [level=3] [ref=e55]
        - paragraph [ref=e56]: Manage club people, venues, communications and day-to-day operations in one place.
      - generic [ref=e57]:
        - heading "Multi-Sport Platform" [level=3] [ref=e61]
        - paragraph [ref=e62]: Built for Pickleball first, with Padel, Tennis, Badminton and other racket sports supported.
  - generic [ref=e65]:
    - generic [ref=e66]:
      - heading "One Public Directory. Separate Club Tools." [level=2] [ref=e67]
      - paragraph [ref=e68]: Anyone can browse the directory. A verified club representative can manage their listing without becoming a RallyHub player or joining the full RallyHub Club platform.
      - generic [ref=e69]:
        - generic [ref=e70]: Public club directory with no login required
        - generic [ref=e75]: Verified directory access for club representatives
        - generic [ref=e80]: King of the Court and interclub competition tools
        - generic [ref=e85]: Event, tournament and venue management
        - generic [ref=e90]: Club and member administration
        - generic [ref=e95]: Mobile-friendly tools for courtside use
    - img "RallyHub" [ref=e102]
  - generic [ref=e104]:
    - generic [ref=e105]:
      - heading "RallyHub Directory FAQ" [level=2] [ref=e106]
      - paragraph [ref=e107]: Straight answers about finding, adding and managing club listings.
    - generic [ref=e108]:
      - article [ref=e109]:
        - heading "Do I need an account to use the RallyHub Club Directory?" [level=3] [ref=e110]
        - paragraph [ref=e111]: No. Anyone can browse public club listings, venues and contact information without creating a RallyHub account.
      - article [ref=e112]:
        - heading "How do I add a club that is missing from the directory?" [level=3] [ref=e113]
        - paragraph [ref=e114]: Choose Add Your Club, sign in so RallyHub can identify the submitter, and send the club details for review. Adding a directory listing does not create a RallyHub Club tenant.
      - article [ref=e115]:
        - heading "How can a club update its directory listing?" [level=3] [ref=e116]
        - paragraph [ref=e117]: Find the club, open its profile and choose Claim this listing. RallyHub verifies the representative before granting permission to edit that public listing.
      - article [ref=e118]:
        - heading "Does RallyHub cover the whole island of Ireland?" [level=3] [ref=e119]
        - paragraph [ref=e120]: Yes. The directory is designed around all 32 counties of Ireland and supports club listings throughout the island.
  - generic [ref=e122]:
    - heading "Looking for Somewhere to Play?" [level=2] [ref=e123]
    - paragraph [ref=e124]: Explore the RallyHub club directory without logging in. If you run a listed club, open its profile to request verified directory access.
    - generic [ref=e125]:
      - link [ref=e126] [cursor=pointer]:
        - /url: /directory
        - button "Find a Club" [ref=e127]
      - link [ref=e128] [cursor=pointer]:
        - /url: /directory?manage=1
        - button "Manage Directory Listing" [ref=e129]
      - link [ref=e130] [cursor=pointer]:
        - /url: /directory/add
        - button "Add Your Club" [ref=e131]
      - button "RallyHub Club Login" [ref=e132] [cursor=pointer]
  - generic [ref=e134]:
    - generic [ref=e135]:
      - link "Club Directory" [ref=e136] [cursor=pointer]:
        - /url: /directory
      - link "About" [ref=e137] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=e138] [cursor=pointer]:
        - /url: /contact
    - paragraph [ref=e139]: © 2026 RallyHub.ie. All rights reserved.
    - paragraph [ref=e140]: Built for the racket sports community
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('landing RallyHub Club Login uses the local login flow and preserves /app return target', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   const login = page.getByRole('button', { name: 'RallyHub Club Login', exact: true });
> 6  |   await expect(login).toBeVisible();
     |                       ^ Error: expect(locator).toBeVisible() failed
  7  |   await login.click();
  8  |   await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp$/);
  9  |   await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  10 | });
  11 | 
  12 | test('opening a protected app URL while signed out preserves the destination through login', async ({ page }) => {
  13 |   await page.goto('/app/admin?tab=directory');
  14 |   await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Fadmin%3Ftab%3Ddirectory$/);
  15 |   await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  16 | });
  17 | 
```