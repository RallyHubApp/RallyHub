import {test,expect} from '@playwright/test';
for(const width of [390,1280]){
 test(`Tournival integrated live scoring ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/e2e/tournivalLiveHarness.html');
  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  await page.getByText('Allocate free courts').click();
  for(let i=0;i<8;i++){
    const card=page.locator('article').filter({has:page.getByText('Save score')}).first();
    await expect(card).toBeVisible();
    await card.getByRole('spinbutton',{name:/A score/}).fill('8');
    await card.getByRole('spinbutton',{name:/B score/}).fill('4');
    await card.getByText('Save score').click();
  }
  await expect(page.getByText('Qualification complete. Review standings, then create the mandatory knockout and final.')).toBeVisible();
  await expect(page.getByText('8/8 qualification matches confirmed')).toBeVisible();
  await expect(page.getByText('Tournival Operational Print Pack')).toBeVisible();
  await expect(page.getByText('Harness — Live Hall')).toBeVisible();
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(1);
 });
}
