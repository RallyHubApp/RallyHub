import {test,expect} from '@playwright/test';
import fixtures from './coachReviewFixtures.json' with {type:'json'};
for(const mobile of [false,true])test('coach review '+(mobile?'mobile':'desktop'),async({page})=>{
 if(mobile)await page.setViewportSize({width:390,height:844});
 let rows=structuredClone(fixtures),published=[];
 await page.route('**/api/apps/**',async route=>{
 const path=new URL(route.request().url()).pathname;let body={};try{body=route.request().postDataJSON()||{}}catch{}
 const reply=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 if(path.includes('/entities/DirectoryListingRecord/'))return reply(rows.find(r=>r.id===path.split('/').pop()));
 if(path.endsWith('/entities/DirectoryListingRecord'))return reply(rows);
 if(path.endsWith('/entities/DirectoryListingProfile'))return reply([]);
 if(path.endsWith('/functions/directoryClaim')&&body.action==='set_visibility'){
 published.push(body.listingSlug);rows=rows.map(r=>r.slug===body.listingSlug?{...r,visibility:body.visibility}:r);return reply({success:true});
 }
 if(path.endsWith('/functions/directoryListingProfile')){
 const r=rows.find(r=>r.slug===body.listingSlug);
 return reply({success:true,base:r?JSON.parse(r.base_json):null,profile:null});
 }
 if(path.endsWith('/entities/User/me'))return reply({id:'test-admin',role:'admin',approval_status:'approved'});
 return reply({success:true,public_settings:{}});
 });
 await page.goto('/e2e/coachReviewHarness.html?access_token=e2e');
 await expect(page.getByTestId('coach-row')).toHaveCount(14);
 await expect(page.getByText('Heather Campbell Kelly')).toHaveCount(0);
 await expect(page.getByText('Mark Topping')).toHaveCount(0);
 await page.getByLabel('Select All coaches').check();await expect(page.getByRole('button',{name:'Approve & Make Public (14)',exact:true})).toBeEnabled();
 await page.getByLabel('Select Ava Battles',{exact:true}).uncheck();
 await page.getByRole('button',{name:'Approve & Make Public (13)',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Make 13 coaches public?'})).toBeVisible();
 expect(published).toHaveLength(0);await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByLabel('Select All coaches').check();await page.getByLabel('Select All coaches').uncheck();
 await page.getByLabel('Select Ava Battles',{exact:true}).check();
 await page.getByRole('button',{name:'Approve & Make Public (1)',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Make 1 coach public?'})).toBeVisible();
 await page.getByRole('button',{name:'Confirm: Approve & Make Public',exact:true}).click();
 await expect(page.getByText('Ava Battles: Published successfully')).toBeVisible();
 expect(published).toEqual(['ava-battles']);expect(rows.filter(r=>r.visibility==='preview_only')).toHaveLength(13);
 await page.getByTestId('coach-row').first().getByRole('button',{name:'Preview',exact:true}).click();
 await expect(page.getByTestId('coach-profile')).toBeVisible();
 for(let i=0;i<14;i++){
  const frame=page.getByTestId('coach-profile');
  await expect(frame).toBeVisible({timeout:15000});
  await expect(frame.getByRole('heading',{name:fixtures[i].name,exact:true})).toBeVisible();
  const html=await frame.innerHTML();expect(html).not.toMatch(/mailto:|tel:|cassiemooney@hotmail|francie@cascadia/);
  if(i<13)await page.getByRole('button',{name:'Next',exact:true}).click();
 }
 for(let i=0;i<13;i++)await page.getByRole('button',{name:'Previous',exact:true}).click();
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await expect(page.getByRole('heading',{name:/2 of 14/})).toBeVisible();
 await page.getByRole('button',{name:'Previous',exact:true}).click();
 await expect(page.getByRole('heading',{name:/1 of 14/})).toBeVisible();
});
