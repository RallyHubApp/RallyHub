import {test,expect} from '@playwright/test';

test('completed KOTC tournament opens host review/editor, not public live display',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('BROWSER_CONSOLE',m.type(),m.text());});
  await page.route('**/api/apps/public/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'test',public_settings:{}})}));
  await page.goto('/e2e/kotcCompletedRouteHarness.html');
  await page.waitForTimeout(1200);
  console.log('ROUTE_URL',page.url());
  console.log('PAGE_ERRORS',errors);
  console.log('BODY_TEXT',await page.locator('body').innerText());
  await expect(page.getByRole('heading',{name:'830 Session'}).first()).toBeVisible();
  await expect(page.getByText('Session complete')).toBeVisible();
  await expect(page.getByText('Review & Correct Results')).toBeVisible();
  await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  expect(errors).toEqual([]);
});
