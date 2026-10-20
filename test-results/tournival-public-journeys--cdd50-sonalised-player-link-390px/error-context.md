# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-public-journeys.spec.mjs >> Tournival personalised player link 390px
- Location: e2e/tournival-public-journeys.spec.mjs:17:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Check-in: Checked in')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Check-in: Checked in') with timeout 3000ms
  - waiting for getByText('Check-in: Checked in')

```

```yaml
- banner:
  - img "RallyHub"
  - text: RallyHub Tournival
  - paragraph: My Tournament
  - heading "Tournival Sandbox Event" [level=1]
  - paragraph: Simulation Hall · 2026-10-22
- navigation "Tournival player navigation":
  - button "My Event"
  - button "Venue"
- main:
  - text: PLAYER VIEW · PERSONAL LINK Read-only tournament updates
  - heading "Tournival Sandbox Event" [level=1]
  - paragraph:
    - img
    - text: Thursday 22 October 2026
  - paragraph:
    - img
    - text: Time to be confirmed
  - paragraph: Test Player 1
  - paragraph: "Registration: confirmed"
  - paragraph: "Payment: paid"
  - heading "Event information & contact" [level=2]:
    - img
    - text: Event information & contact
  - paragraph: Organised by the tournament organiser.
  - paragraph: Your tournament details will appear here when the organiser publishes the next stage. Keep this link for updates.
  - paragraph: Personal link — do not share. Updates are read-only and do not affect scores.
  - button "Refresh my information"
- contentinfo:
  - text: Powered by
  - link "RallyHub":
    - /url: https://rallyhub.ie/
  - text: · One personal link throughout the event
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const viewport of [{width:390,height:844},{width:1280,height:800}]) {
  3  |  test(`Tournival public registration consent and checkout preview ${viewport.width}px`,async({page})=>{
  4  |   await page.setViewportSize(viewport);
  5  |   await page.goto('/e2e/tournivalPublicHarness.html?kind=register');
  6  |   await expect(page.getByText('Tournival Sandbox Event')).toBeVisible();
  7  |   await page.getByRole('textbox',{name:'Full name'}).fill('Sandbox Attendee');
  8  |   await page.getByRole('textbox',{name:'Email'}).fill('sandbox@example.com');
  9  |   await page.getByRole('button',{name:'Register for Tournival'}).click({force:true});
  10 |   await expect(page.getByText('Registration received')).toHaveCount(0);
  11 |   await page.getByRole('checkbox',{name:/I consent to my details/}).check();
  12 |   await page.getByRole('button',{name:'Register for Tournival'}).click();
  13 |   await expect(page.getByText('Registration received')).toBeVisible();
  14 |   await expect(page.getByText('Proceed to secure payment')).toBeVisible();
  15 |   await expect(page.getByText(/Payment is confirmed only when the provider verifies it/)).toBeVisible();
  16 |  });
  17 |  test(`Tournival personalised player link ${viewport.width}px`,async({page})=>{
  18 |   await page.setViewportSize(viewport);
  19 |   await page.goto('/e2e/tournivalPublicHarness.html?kind=player');
  20 |   await expect(page.getByText('Test Player 1')).toBeVisible();
  21 |   await expect(page.getByText('Payment: paid')).toBeVisible();
> 22 |   await expect(page.getByText('Check-in: Checked in')).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  23 |   await expect(page.getByText('8–5')).toBeVisible();
  24 |   await expect(page.getByText(/Partner: Test Player 2/).first()).toBeVisible();
  25 |   await expect(page.getByText(/Opponents: Test Player 3 & Test Player 4/).first()).toBeVisible();
  26 |  });
  27 |  test(`Tournival spectator Live Hall redacted ${viewport.width}px`,async({page})=>{
  28 |   await page.setViewportSize(viewport);
  29 |   await page.goto('/e2e/tournivalPublicHarness.html?kind=hall');
  30 |   await expect(page.getByText('Tournival Sandbox Event — Live Hall')).toBeVisible();
  31 |   await expect(page.getByText('Court 1')).toBeVisible();
  32 |   const contents=await page.locator('body').innerText();
  33 |   expect(contents).not.toContain('sandbox@example.com');
  34 |   expect(contents).not.toContain('checkoutUrl');
  35 |   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  36 |   expect(overflow).toBeLessThanOrEqual(1);
  37 |  });
  38 | }
  39 | 
```