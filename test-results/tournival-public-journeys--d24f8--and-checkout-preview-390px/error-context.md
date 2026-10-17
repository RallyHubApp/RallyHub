# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-public-journeys.spec.mjs >> Tournival public registration consent and checkout preview 390px
- Location: e2e/tournival-public-journeys.spec.mjs:3:2

# Error details

```
Error: locator.check: Error: strict mode violation: getByRole('checkbox') resolved to 2 elements:
    1) <input required="" type="checkbox" data-dynamic-content="true" data-source-location="src/pages/PublicTournivalRegistration.jsx:61:45"/> aka getByRole('checkbox', { name: 'I consent to my details being' })
    2) <input type="checkbox" data-dynamic-content="true" data-source-location="src/pages/PublicTournivalRegistration.jsx:63:45"/> aka getByRole('checkbox', { name: 'Optional: I consent to' })

Call log:
  - waiting for getByRole('checkbox')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]:
          - generic [ref=e9]: RallyHub
          - generic [ref=e10]: Tournival
      - paragraph [ref=e11]: Tournament Registration
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Tournival Sandbox Event" [level=1] [ref=e14]
        - paragraph [ref=e15]: 2026-10-22 · Simulation Hall
        - paragraph [ref=e16]: "Registration: 12/16 places · Waiting list 2"
        - paragraph [ref=e17]: "Fee: €5.00"
      - generic [ref=e18]:
        - generic [ref=e19]:
          - text: Full name
          - textbox "Full name" [ref=e20]: Sandbox Attendee
        - generic [ref=e21]:
          - text: Email
          - textbox "Email" [ref=e22]: sandbox@example.com
        - generic [ref=e23]:
          - text: Mobile
          - textbox "Mobile" [ref=e24]
        - generic [ref=e25]:
          - checkbox "I consent to my details being used for this tournament and agree to follow the published competition rules and organiser safety instructions." [ref=e26]
          - generic [ref=e27]: I consent to my details being used for this tournament and agree to follow the published competition rules and organiser safety instructions.
        - generic [ref=e28]:
          - 'checkbox "Optional: I consent to eligible tournament results being prepared for DUPR reporting. A DUPR account is not required to participate, and reporting is subject to organiser and DUPR rules." [ref=e29]'
          - generic [ref=e30]: "Optional: I consent to eligible tournament results being prepared for DUPR reporting. A DUPR account is not required to participate, and reporting is subject to organiser and DUPR rules."
        - button "Register for Tournival" [disabled]
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
> 11 |   await page.getByRole('checkbox').check();
     |                                    ^ Error: locator.check: Error: strict mode violation: getByRole('checkbox') resolved to 2 elements:
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
  22 |   await expect(page.getByText('Check-in: Checked in')).toBeVisible();
  23 |   await expect(page.getByText('8–5')).toBeVisible();
  24 |  });
  25 |  test(`Tournival spectator Live Hall redacted ${viewport.width}px`,async({page})=>{
  26 |   await page.setViewportSize(viewport);
  27 |   await page.goto('/e2e/tournivalPublicHarness.html?kind=hall');
  28 |   await expect(page.getByText('Tournival Sandbox Event — Live Hall')).toBeVisible();
  29 |   await expect(page.getByText('Court 1')).toBeVisible();
  30 |   const contents=await page.locator('body').innerText();
  31 |   expect(contents).not.toContain('sandbox@example.com');
  32 |   expect(contents).not.toContain('checkoutUrl');
  33 |   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  34 |   expect(overflow).toBeLessThanOrEqual(1);
  35 |  });
  36 | }
  37 | 
```