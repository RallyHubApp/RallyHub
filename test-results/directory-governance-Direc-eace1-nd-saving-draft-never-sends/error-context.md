# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-governance.spec.mjs >> Directory super-admin campaign UI is separate, and saving draft never sends
- Location: e2e/directory-governance.spec.mjs:35:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Directory governance & portability')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Directory governance & portability') with timeout 3000ms
  - waiting for getByText('Directory governance & portability')

```

```yaml
- text: RH
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const APP_ID='6a01dc00702b7dd2a2978c28';
  3  | const base={success:true,campaigns:[],links:[],suppressionCounts:{active:0,total:0},limits:{campaigns:250,links:250,suppressions:500}};
  4  | async function mockGovernance(page,{authorised=true}={}){
  5  |  let calls=0;const observed=[];
  6  |  await page.addInitScript(()=>localStorage.setItem('base44_access_token','directory-governance-fixture-token'));
  7  |  await page.route('**/api/apps/**',async route=>{
  8  |   const url=new URL(route.request().url()),path=url.pathname;observed.push(path);
  9  |   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  10 |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  11 |   if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me'))return reply({id:authorised?'6a0b5afd3f4b9681265a1398':'unrelated-admin-id',role:'admin',email:'test@example.test',full_name:'Directory test admin',approval_status:'approved'});
  12 |   if(path.includes('/analytics/'))return reply({});
  13 |   if(path.includes('/entities/'))return reply([]);
  14 |   const marker=`/api/apps/${APP_ID}/functions/`;
  15 |   if(path.includes(marker)){
  16 |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  17 |    if(name==='securityContext')return reply({success:true,context:{}});
  18 |    if(name==='directoryAdminAccess')return reply({authorised});
  19 |    if(name==='directoryGovernance'){
  20 |     calls++;
  21 |     if(!authorised)return reply({error:'Directory super-admin access required'},403);
  22 |     if(body.action==='admin_overview')return reply(base);
  23 |     if(body.action==='admin_save_draft')return reply({success:true,campaign:{id:'campaign_00000001',name:body.name,purpose:body.purpose,channel:'email',status:'draft'}});
  24 |     return reply({error:'Unsupported test action'},400);
  25 |    }
  26 |    if(name==='directoryClaim')return reply({success:true,pendingAdminCount:0});
  27 |    if(name==='directoryPlayerNetwork')return reply({success:true,subscribers:[],counts:{total:0}});
  28 |    if(name==='directoryEnquiryAdmin')return reply({success:true,enquiries:[],contactActions:[]});
  29 |    return reply({success:true});
  30 |   }
  31 |   return reply({success:true});
  32 |  });
  33 |  return ()=>({governanceCalls:calls,requests:[...observed]});
  34 | }
  35 | test('Directory super-admin campaign UI is separate, and saving draft never sends',async({page})=>{
  36 |  const count=await mockGovernance(page);
  37 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  38 |  await page.goto('/app/admin?tab=directory-campaigns');
  39 |  await expect(page.getByText('Directory campaigns & consent')).toBeVisible({timeout:12000});
  40 |  await expect(page.getByText('Campaign drafts and approvals')).toBeVisible();
  41 |  await page.getByLabel('Campaign name').fill('Autumn Directory updates');
  42 |  await page.getByLabel('Email subject').fill('Autumn pickleball events');
  43 |  await page.getByLabel('Plain-text email content').fill('Here are the upcoming pickleball events in your area.');
  44 |  await page.getByRole('button',{name:'Save draft'}).click();
  45 |  await expect(page.getByRole('button',{name:'Preview eligible audience'})).toBeEnabled();
  46 |  await page.goto('/app/admin?tab=directory-governance');
> 47 |  await expect(page.getByText('Directory governance & portability')).toBeVisible();
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  48 |  await expect(page.getByText('Standalone Directory export')).toBeVisible();
  49 |  expect(count().governanceCalls).toBeGreaterThanOrEqual(2);
  50 |  expect(count().requests.some(path=>path.includes('/functions/membershipRecord')||path.includes('/entities/ClubRelationship')||path.endsWith('/entities/Player'))).toBe(false);
  51 |  expect(errors).toEqual([]);
  52 | });
  53 | test('unrelated admin cannot enter protected Directory governance',async({page})=>{
  54 |  const count=await mockGovernance(page,{authorised:false});
  55 |  await page.goto('/app/admin?tab=directory-governance');
  56 |  await expect(page.getByText('Directory governance & portability')).toHaveCount(0,{timeout:12000});
  57 |  expect(count().governanceCalls).toBe(0);
  58 | });
  59 | 
```