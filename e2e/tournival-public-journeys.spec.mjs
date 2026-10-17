import {test,expect} from '@playwright/test';
for(const viewport of [{width:390,height:844},{width:1280,height:800}]) {
 test(`Tournival public registration consent and checkout preview ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/e2e/tournivalPublicHarness.html?kind=register');
  await expect(page.getByText('Tournival Sandbox Event')).toBeVisible();
  await page.getByRole('textbox',{name:'Full name'}).fill('Sandbox Attendee');
  await page.getByRole('textbox',{name:'Email'}).fill('sandbox@example.com');
  await page.getByRole('button',{name:'Register for Tournival'}).click({force:true});
  await expect(page.getByText('Registration received')).toHaveCount(0);
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Register for Tournival'}).click();
  await expect(page.getByText('Registration received')).toBeVisible();
  await expect(page.getByText('Proceed to secure payment')).toBeVisible();
  await expect(page.getByText(/Payment is confirmed only when the provider verifies it/)).toBeVisible();
 });
 test(`Tournival personalised player link ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/e2e/tournivalPublicHarness.html?kind=player');
  await expect(page.getByText('Test Player 1')).toBeVisible();
  await expect(page.getByText('Payment: paid')).toBeVisible();
  await expect(page.getByText('Check-in: Checked in')).toBeVisible();
  await expect(page.getByText('8–5')).toBeVisible();
 });
 test(`Tournival spectator Live Hall redacted ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/e2e/tournivalPublicHarness.html?kind=hall');
  await expect(page.getByText('Tournival Sandbox Event — Live Hall')).toBeVisible();
  await expect(page.getByText('Court 1')).toBeVisible();
  const contents=await page.locator('body').innerText();
  expect(contents).not.toContain('sandbox@example.com');
  expect(contents).not.toContain('checkoutUrl');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
 });
}
