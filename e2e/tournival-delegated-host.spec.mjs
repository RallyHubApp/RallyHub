import {test,expect} from '@playwright/test';
for(const viewport of [{width:390,height:844},{width:1280,height:850}]) {
 test(`Tournival delegated host bearer-link UI ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/e2e/tournivalPublicHarness.html?kind=host');
  await expect(page.getByText(/Limited host link/)).toBeVisible();
  await expect(page.getByText(/Revision 1/)).toBeVisible();
  await page.getByRole('button',{name:'Allocate free courts'}).click();
  await expect(page.getByText(/Revision 2/)).toBeVisible();
  const card=page.locator('article').filter({has:page.getByText('Save score')}).first();
  await card.getByRole('spinbutton',{name:/A score/}).fill('11');
  await card.getByRole('spinbutton',{name:/B score/}).fill('7');
  await card.getByText('Save score').click();
  await expect(page.getByText(/Revision 3/)).toBeVisible();
  await page.getByRole('button',{name:'Hall View'}).click();
  await expect(page.getByText(/Tournival Sandbox Event — Live Hall/)).toBeVisible();
  expect(await page.getByText('Payment checkout').count()).toBe(0);
  expect(await page.getByRole('button',{name:'DU PR'}).count()).toBe(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
 });
}
