# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-completed-route.spec.mjs >> completed KOTC tournament opens host review/editor, not public live display
- Location: e2e/kotc-completed-route.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: '830 Session' }).first()
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: '830 Session' }).first() with timeout 3000ms
  - waiting for getByRole('heading', { name: '830 Session' }).first()

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | 
  3  | test('completed KOTC tournament opens host review/editor, not public live display',async({page})=>{
  4  |   const errors=[];
  5  |   page.on('pageerror',e=>errors.push(e.message));
  6  |   page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('BROWSER_CONSOLE',m.type(),m.text());});
  7  |   await page.route('**/api/apps/public/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'test',public_settings:{}})}));
  8  |   await page.goto('/e2e/kotcCompletedRouteHarness.html');
  9  |   await page.waitForTimeout(1200);
  10 |   console.log('ROUTE_URL',page.url());
  11 |   console.log('PAGE_ERRORS',errors);
  12 |   console.log('BODY_TEXT',await page.locator('body').innerText());
> 13 |   await expect(page.getByRole('heading',{name:'830 Session'}).first()).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  14 |   await expect(page.getByText('Session complete')).toBeVisible();
  15 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  16 |   await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  17 |   await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  18 |   await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  19 |   await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  20 |   expect(errors).toEqual([]);
  21 | });
  22 | 
```