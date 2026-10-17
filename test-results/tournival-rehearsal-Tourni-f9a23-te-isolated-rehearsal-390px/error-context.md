# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-rehearsal.spec.mjs >> Tournival complete isolated rehearsal 390px
- Location: e2e/tournival-rehearsal.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/synthetic players checked in/)
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/synthetic players checked in/) with timeout 3000ms
  - waiting for getByText(/synthetic players checked in/)

```

```yaml
- heading "Isolated Tournival Rehearsal" [level=3]
- paragraph: All participants and results are synthetic. No live records, payments, communications, DUPR submissions or statistics.
- text: Players
- spinbutton "Rehearsal players": "16"
- text: Courts
- spinbutton "Rehearsal courts": "4"
- text: Rounds
- spinbutton "Rehearsal rounds": "2"
- button "Start / Reset Rehearsal"
- alert: Cannot read properties of undefined (reading 'phase')
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const viewport of [{width:390,height:844},{width:1280,height:800}])
  3  | test(`Tournival complete isolated rehearsal ${viewport.width}px`,async({page})=>{
  4  |  await page.setViewportSize(viewport);
  5  |  await page.goto('/e2e/tournivalRehearsalHarness.html');
  6  |  await page.getByLabel('Rehearsal rounds').fill('2');
  7  |  await page.getByLabel('Rehearsal courts').fill('4');
  8  |  await page.getByText('Start / Reset Rehearsal').click();
> 9  |  await expect(page.getByText(/synthetic players checked in/)).toBeVisible();
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  10 |  for(let n=0;n<80;n++){
  11 |    if(await page.getByText('Phase: complete',{exact:false}).count())break;
  12 |    const active=page.getByText('Save simulated score');
  13 |    if(await active.count()) {
  14 |      await active.first().click();
  15 |    } else {
  16 |      await page.getByText('Allocate / Advance Tournament').click();
  17 |    }
  18 |  }
  19 |  await expect(page.getByText(/Phase: complete/)).toBeVisible();
  20 |  await expect(page.getByText('Rehearsal final completed.')).toBeVisible();
  21 |  const scroll=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  22 |  expect(scroll).toBeLessThanOrEqual(1);
  23 | });
  24 | 
```