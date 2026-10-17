import {test,expect} from '@playwright/test';
for(const size of [{width:390,height:844},{width:1280,height:850}])
test(`Full Tournival host journey ${size.width}px`,async({page})=>{
 await page.setViewportSize(size);
 page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
 await page.goto('/e2e/tournivalHostHarness.html');
 await expect(page.getByText('Tournival Setup')).toBeVisible();
 // Select 2 qualification rounds from the real setup form.
 await page.getByRole('combobox').filter({hasText:'4 rounds'}).click();
 await page.getByRole('option',{name:'2 rounds'}).click();
 const revision=()=>page.getByTestId('server-revision').innerText().then(Number);
 const changed=async(before)=>await expect.poll(revision,{timeout:7500}).toBeGreaterThan(before);
 let prior=await revision();
 await page.getByRole('button',{name:'Confirm seed order',exact:true}).click();
 await changed(prior);
 await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
 prior=await revision();
 await page.getByText('Generate Fixtures & Start').click();
 await changed(prior);
 await page.getByRole('button',{name:'Scores',exact:true}).click();
 await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
 let commits=0;
 while(commits<8) {
  const allocate=page.getByRole('button',{name:'Allocate free courts'});
  if(await allocate.isEnabled()){
   prior=await revision();await allocate.click();await changed(prior);
  }
  const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  await expect(active).toBeVisible();
  await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  prior=await revision();
  await active.getByText('Save score').click();
  await changed(prior);
  commits++;
 }
 await page.getByRole('button',{name:'Scores',exact:true}).click();
 await expect(page.getByText(/Qualification complete/)).toBeVisible();
 await page.getByRole('button',{name:'Standings'}).click();
 await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
