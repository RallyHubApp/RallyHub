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

Locator: getByText('Test Player 1')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Test Player 1') with timeout 3000ms
  - waiting for getByText('Test Player 1')

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
> 20 |   await expect(page.getByText('Test Player 1')).toBeVisible();
     |                                                 ^ Error: expect(locator).toBeVisible() failed
  21 |   await expect(page.getByText('Payment: paid')).toBeVisible();
  22 |   await expect(page.getByText('Check-in: Checked in')).toBeVisible();
  23 |   await page.getByRole('button',{name:'Fixtures'}).click();
  24 |   await expect(page.getByText('8–5')).toBeVisible();
  25 |   await expect(page.getByText(/Partner: Test Player 2/).first()).toBeVisible();
  26 |   await expect(page.getByText(/Opponents: Test Player 3 & Test Player 4/).first()).toBeVisible();
  27 |  });
  28 |  test(`Tournival spectator Live Hall redacted ${viewport.width}px`,async({page})=>{
  29 |   await page.setViewportSize(viewport);
  30 |   await page.goto('/e2e/tournivalPublicHarness.html?kind=hall');
  31 |   await expect(page.getByText('Tournival Sandbox Event — Live Hall')).toBeVisible();
  32 |   await expect(page.getByText('Court 1')).toBeVisible();
  33 |   const contents=await page.locator('body').innerText();
  34 |   expect(contents).not.toContain('sandbox@example.com');
  35 |   expect(contents).not.toContain('checkoutUrl');
  36 |   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  37 |   expect(overflow).toBeLessThanOrEqual(1);
  38 |  });
  39 | }
  40 | 
```