import {test,expect} from '@playwright/test';
for(const viewport of [{width:390,height:844},{width:1280,height:800}])
for(const rounds of [2,4,6]) {
 test(`Tournival browser simulation ${viewport.width}px / ${rounds} rounds`,async({page})=>{
   await page.setViewportSize(viewport);
   await page.goto('/e2e/tournivalHarness.html');
   await page.locator('#rounds').selectOption(String(rounds));
   await page.locator('#simulate').click();
   await expect(page.locator('#result')).toContainText('PASS:');
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
   expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+1);
 });
}
