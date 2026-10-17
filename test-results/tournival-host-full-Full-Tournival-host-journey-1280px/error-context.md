# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-host-full.spec.mjs >> Full Tournival host journey 1280px
- Location: e2e/tournival-host-full.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Tournival Setup')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Tournival Setup') with timeout 3000ms
  - waiting for getByText('Tournival Setup')

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const size of [{width:390,height:844},{width:1280,height:850}])
  3  | test(`Full Tournival host journey ${size.width}px`,async({page})=>{
  4  |  await page.setViewportSize(size);
  5  |  page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
  6  |  await page.goto('/e2e/tournivalHostHarness.html');
> 7  |  await expect(page.getByText('Tournival Setup')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  8  |  await expect(page.getByText('2 rounds').count()).resolves.toBeGreaterThanOrEqual(1).catch(()=>{});
  9  |  await page.getByRole('button',{name:'Confirm seed order'}).click();
  10 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  11 |  await page.getByText('Generate Fixtures & Start').click();
  12 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  13 |  const allocate=page.getByRole('button',{name:'Allocate free courts'});
  14 |  for(let i=0;i<8;i++){
  15 |   if(await allocate.isEnabled())await allocate.click();
  16 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  17 |   await expect(active).toBeVisible();
  18 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  19 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  20 |   await active.getByText('Save score').click();
  21 |  }
  22 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
  23 |  await page.getByRole('button',{name:'Standings'}).click();
  24 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  25 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  26 |  expect(overflow).toBeLessThanOrEqual(1);
  27 | });
  28 | 
```