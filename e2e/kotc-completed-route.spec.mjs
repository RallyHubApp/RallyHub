import {test} from '@playwright/test';
test('diagnose completed KOTC route',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/api/'))console.log('REQ',r.method(),r.url(),r.postData()||'');});
  page.on('response',r=>{if(r.url().includes('/api/'))console.log('RES',r.status(),r.url());});
  await page.route('**/api/apps/public/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'test',public_settings:{}})}));
  await page.goto('/e2e/kotcCompletedRouteHarness.html');await page.waitForTimeout(1500);
  console.log('ERRORS',errors);console.log('BODY',await page.locator('body').innerText());
});
