# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-governance.spec.mjs >> Directory super-admin campaign UI is separate, and saving draft never sends
- Location: e2e/directory-governance.spec.mjs:33:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Directory campaigns & consent')
Expected: visible
Timeout: 12000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Directory campaigns & consent') with timeout 12000ms
  - waiting for getByText('Directory campaigns & consent')

```

```yaml
- heading "Sign in to RallyHub" [level=1]
- paragraph: One account for RallyHub
- button "Continue with Google"
- text: or Email
- textbox "Email":
  - /placeholder: you@example.com
- text: Password
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password":
  - /placeholder: ••••••••
- button "Show password"
- button "Log in"
- paragraph:
  - text: New to RallyHub?
  - link "Create an account":
    - /url: /register?returnTo=%2Fapp%2Fadmin%3Ftab%3Ddirectory-campaigns
- paragraph: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const APP_ID='6a01dc00702b7dd2a2978c28';
  3  | const base={success:true,campaigns:[],links:[],suppressionCounts:{active:0,total:0},limits:{campaigns:250,links:250,suppressions:500}};
  4  | async function mockGovernance(page,{authorised=true}={}){
  5  |  let calls=0;
  6  |  await page.route('**/api/apps/**',async route=>{
  7  |   const url=new URL(route.request().url()),path=url.pathname;
  8  |   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  9  |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  10 |   if(path.endsWith('/entities/User/me'))return reply({id:authorised?'6a0b5afd3f4b9681265a1398':'unrelated-admin-id',role:'admin',email:'test@example.test',full_name:'Directory test admin',approval_status:'approved'});
  11 |   if(path.includes('/analytics/'))return reply({});
  12 |   const marker=`/api/apps/${APP_ID}/functions/`;
  13 |   if(path.includes(marker)){
  14 |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  15 |    if(name==='securityContext')return reply({success:true,context:{}});
  16 |    if(name==='directoryAdminAccess')return reply({authorised});
  17 |    if(name==='directoryGovernance'){
  18 |     calls++;
  19 |     if(!authorised)return reply({error:'Directory super-admin access required'},403);
  20 |     if(body.action==='admin_overview')return reply(base);
  21 |     if(body.action==='admin_save_draft')return reply({success:true,campaign:{id:'campaign_00000001',name:body.name,purpose:body.purpose,channel:'email',status:'draft'}});
  22 |     return reply({error:'Unsupported test action'},400);
  23 |    }
  24 |    if(name==='directoryClaim')return reply({success:true,pendingAdminCount:0});
  25 |    if(name==='directoryPlayerNetwork')return reply({success:true,subscribers:[],counts:{total:0}});
  26 |    if(name==='directoryEnquiryAdmin')return reply({success:true,enquiries:[],contactActions:[]});
  27 |    return reply({success:true});
  28 |   }
  29 |   return reply({success:true});
  30 |  });
  31 |  return ()=>calls;
  32 | }
  33 | test('Directory super-admin campaign UI is separate, and saving draft never sends',async({page})=>{
  34 |  const count=await mockGovernance(page);
  35 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  36 |  await page.goto('/app/admin?tab=directory-campaigns');
> 37 |  await expect(page.getByText('Directory campaigns & consent')).toBeVisible({timeout:12000});
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  38 |  await expect(page.getByText('Campaign drafts and approvals')).toBeVisible();
  39 |  await page.getByLabel('Campaign name').fill('Autumn Directory updates');
  40 |  await page.getByLabel('Email subject').fill('Autumn pickleball events');
  41 |  await page.getByLabel('Plain-text email content').fill('Here are the upcoming pickleball events in your area.');
  42 |  await page.getByRole('button',{name:'Save draft'}).click();
  43 |  await expect(page.getByRole('button',{name:'Preview eligible audience'})).toBeEnabled();
  44 |  await page.goto('/app/admin?tab=directory-governance');
  45 |  await expect(page.getByText('Directory governance & portability')).toBeVisible();
  46 |  await expect(page.getByText('Standalone Directory export')).toBeVisible();
  47 |  expect(count()).toBeGreaterThanOrEqual(2);
  48 |  expect(errors).toEqual([]);
  49 | });
  50 | test('unrelated admin cannot enter protected Directory governance',async({page})=>{
  51 |  const count=await mockGovernance(page,{authorised:false});
  52 |  await page.goto('/app/admin?tab=directory-governance');
  53 |  await expect(page.getByText('Directory governance & portability')).toHaveCount(0,{timeout:12000});
  54 |  expect(count()).toBe(0);
  55 | });
  56 | 
```