import {test,expect} from '@playwright/test';
for(const viewport of [{width:390,height:844},{width:1280,height:800}])
test(`Tournival complete isolated rehearsal ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);
 await page.goto('/e2e/tournivalRehearsalHarness.html');
 await page.getByLabel('Rehearsal rounds').fill('2');
 await page.getByLabel('Rehearsal courts').fill('4');
 await page.getByText('Start / Reset Rehearsal').click();
 await expect(page.getByText(/synthetic players checked in/)).toBeVisible();
 for(let n=0;n<80;n++){
   if(await page.getByText('Phase: complete',{exact:false}).count())break;
   const active=page.getByText('Save simulated score');
   if(await active.count()) {
     await active.first().click();
   } else {
     await page.getByText('Allocate / Advance Tournament').click();
   }
 }
 await expect(page.getByText(/Phase: complete/)).toBeVisible();
 await expect(page.getByText('Rehearsal final completed.')).toBeVisible();
 const scroll=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(scroll).toBeLessThanOrEqual(1);
});
