import {test,expect} from '@playwright/test';
for(const size of [{width:390,height:844},{width:1280,height:850}])
test(`Full Tournival host journey ${size.width}px`,async({page})=>{
 await page.setViewportSize(size);
 page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
 page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
 page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text())});
 await page.goto('/e2e/tournivalHostHarness.html');
 console.log('BODY:',(await page.locator('body').innerText()).slice(0,350));
 await expect(page.getByText('Tournival Setup')).toBeVisible();
 await page.getByRole('button',{name:'Confirm seed order',exact:true}).click();
 await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
 await page.getByText('Generate Fixtures & Start').click();
 await page.getByRole('button',{name:'Scores',exact:true}).click();
 await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
 const allocate=page.getByRole('button',{name:'Allocate free courts'});
 for(let i=0;i<8;i++){
  if(await allocate.isEnabled())await allocate.click();
  const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  await expect(active).toBeVisible();
  await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  await active.getByText('Save score').click();
 }
 await expect(page.getByText(/Qualification complete/)).toBeVisible();
 await page.getByRole('button',{name:'Standings'}).click();
 await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
