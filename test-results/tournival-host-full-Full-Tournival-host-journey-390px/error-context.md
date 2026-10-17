# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-host-full.spec.mjs >> Full Tournival host journey 390px
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
  6  |  page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  7  |  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text())});
  8  |  await page.goto('/e2e/tournivalHostHarness.html');
  9  |  console.log('BODY:',(await page.locator('body').innerText()).slice(0,350));
> 10 |  await expect(page.getByText('Tournival Setup')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  11 |  await expect(page.getByText('2 rounds').count()).resolves.toBeGreaterThanOrEqual(1).catch(()=>{});
  12 |  await page.getByRole('button',{name:'Confirm seed order'}).click();
  13 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  14 |  await page.getByText('Generate Fixtures & Start').click();
  15 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  16 |  const allocate=page.getByRole('button',{name:'Allocate free courts'});
  17 |  for(let i=0;i<8;i++){
  18 |   if(await allocate.isEnabled())await allocate.click();
  19 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  20 |   await expect(active).toBeVisible();
  21 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  22 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  23 |   await active.getByText('Save score').click();
  24 |  }
  25 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
  26 |  await page.getByRole('button',{name:'Standings'}).click();
  27 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  28 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  29 |  expect(overflow).toBeLessThanOrEqual(1);
  30 | });
  31 | 
```