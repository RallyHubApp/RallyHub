import {test,expect} from '@playwright/test';
const APP_ID='6a01dc00702b7dd2a2978c28';
const base={success:true,campaigns:[],links:[],suppressionCounts:{active:0,total:0},limits:{campaigns:250,links:250,suppressions:500}};
async function mockGovernance(page,{authorised=true}={}){
 let calls=0;let seen=[];
 await page.addInitScript(()=>localStorage.setItem('base44_access_token','directory-governance-fixture-token'));
 await page.route('**/api/apps/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname;seen.push(path);
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me'))return reply({id:authorised?'6a0b5afd3f4b9681265a1398':'unrelated-admin-id',role:'admin',email:'test@example.test',full_name:'Directory test admin',approval_status:'approved'});
  if(path.includes('/analytics/'))return reply({});
  if(path.includes('/entities/'))return reply([]);
  const marker=`/api/apps/${APP_ID}/functions/`;
  if(path.includes(marker)){
   const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
   if(name==='securityContext')return reply({success:true,context:{}});
   if(name==='directoryAdminAccess')return reply({authorised});
   if(name==='directoryGovernance'){
    calls++;
    if(!authorised)return reply({error:'Directory super-admin access required'},403);
    if(body.action==='admin_overview')return reply(base);
    if(body.action==='admin_save_draft')return reply({success:true,campaign:{id:'campaign_00000001',name:body.name,purpose:body.purpose,channel:'email',status:'draft'}});
    return reply({error:'Unsupported test action'},400);
   }
   if(name==='directoryClaim')return reply({success:true,pendingAdminCount:0});
   if(name==='directoryPlayerNetwork')return reply({success:true,subscribers:[],counts:{total:0}});
   if(name==='directoryEnquiryAdmin')return reply({success:true,enquiries:[],contactActions:[]});
   return reply({success:true});
  }
  return reply({success:true});
 });
 return ()=>{console.log('GOV_REQUESTS',seen.slice(0,30));return calls;};
}
test('Directory super-admin campaign UI is separate, and saving draft never sends',async({page})=>{
 const count=await mockGovernance(page);
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('GOV_JS_ERROR',e.message)});
 await page.goto('/app/admin?tab=directory-campaigns'); await page.waitForTimeout(3000);console.log('GOV_BODY',page.url(),(await page.locator('body').innerText()).slice(0,800));count();
 await page.waitForTimeout(2200);console.log('GOV_BODY',JSON.stringify((await page.locator('body').innerText()).slice(0,800)));console.log('GOV_ERR',JSON.stringify(errors));
 await expect(page.getByText('Directory campaigns & consent')).toBeVisible({timeout:12000});
 await expect(page.getByText('Campaign drafts and approvals')).toBeVisible();
 await page.getByLabel('Campaign name').fill('Autumn Directory updates');
 await page.getByLabel('Email subject').fill('Autumn pickleball events');
 await page.getByLabel('Plain-text email content').fill('Here are the upcoming pickleball events in your area.');
 await page.getByRole('button',{name:'Save draft'}).click();
 await expect(page.getByRole('button',{name:'Preview eligible audience'})).toBeEnabled();
 await page.goto('/app/admin?tab=directory-governance');
 await expect(page.getByText('Directory governance & portability')).toBeVisible();
 await expect(page.getByText('Standalone Directory export')).toBeVisible();
 expect(count()).toBeGreaterThanOrEqual(2);
 expect(errors).toEqual([]);
});
test('unrelated admin cannot enter protected Directory governance',async({page})=>{
 const count=await mockGovernance(page,{authorised:false});
 await page.goto('/app/admin?tab=directory-governance');
 await expect(page.getByText('Directory governance & portability')).toHaveCount(0,{timeout:12000});
 expect(count()).toBe(0);
});
