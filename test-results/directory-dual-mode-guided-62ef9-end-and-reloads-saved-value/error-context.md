# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-dual-mode.spec.mjs >> guided save persists through existing backend and reloads saved value
- Location: e2e/directory-dual-mode.spec.mjs:42:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('directory-guided-progress')
Expected substring: "Step 2 of 5"
Received string:    "Step 3 of 5: Playing venuesComplete only what is useful. Optional fields can be skipped, and your progress is saved as you go.PreviousContinue"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('directory-guided-progress') with timeout 3000ms
  - waiting for getByTestId('directory-guided-progress')
    10 × locator resolved to <div class="space-y-3" data-dynamic-content="true" data-testid="directory-guided-progress" data-source-location="src/pages/DirectoryListingEdit.jsx:840:44">…</div>
       - unexpected value "Step 3 of 5: Playing venuesComplete only what is useful. Optional fields can be skipped, and your progress is saved as you go.PreviousContinue"

```

```yaml
- paragraph: "Step 3 of 5: Playing venues"
- paragraph: Complete only what is useful. Optional fields can be skipped, and your progress is saved as you go.
- button "Previous"
- button "Continue"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | const APP_ID='6a01dc00702b7dd2a2978c28';
  3   | test('directory guided and direct modes share editor without losing changes', async ({page}) => {
  4   |  const user={id:'e2e',email:'editor@example.test',full_name:'Editor',role:'admin',approval_status:'approved'};
  5   |  let saves=0;
  6   |  await page.route('**/api/apps/**',async route=>{
  7   |   const url=new URL(route.request().url()), path=url.pathname;
  8   |   const reply=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  9   |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  10  |   if(path.endsWith('/entities/User/me'))return reply(user);
  11  |   if(path.includes('/analytics/'))return reply({});
  12  |   const marker=`/api/apps/${APP_ID}/functions/`;
  13  |   if(path.includes(marker)){
  14  |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  15  |    if(name==='securityContext')return reply({success:true,context:null});
  16  |    if(name==='directoryClaim')return reply({success:true,hasAccess:true,status:'verified'});
  17  |    if(name==='directoryListingProfile'){
  18  |     if(body.action==='save'){saves++;return reply({success:true,profile:body.profile,id:'saved'})}
  19  |     return reply({success:true,profile:null,base:null});
  20  |    }
  21  |   }
  22  |   return reply({success:true});
  23  |  });
  24  |  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  25  |  await expect(page.getByTestId('directory-editor-mode')).toBeVisible();
  26  |  await page.getByRole('button',{name:'Guided setup'}).click();
  27  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5');
  28  |  await expect(page.locator('#basics')).toBeVisible();
  29  |  await expect(page.locator('#sessions')).toBeHidden();
  30  |  await page.getByRole('button',{name:'Continue',exact:true}).click();
  31  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
  32  |  await expect(page.locator('#contact')).toBeVisible();
  33  |  await page.getByRole('button',{name:'Previous'}).click();
  34  |  await expect(page.locator('#basics')).toBeVisible();
  35  |  await page.getByRole('button',{name:'Edit directly'}).click();
  36  |  await expect(page.locator('#sessions')).toBeVisible();
  37  |  await page.getByRole('button',{name:'Guided setup'}).click();
  38  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5');
  39  |  expect(saves).toBe(0);
  40  | });
  41  | 
  42  | test('guided save persists through existing backend and reloads saved value', async ({page}) => {
  43  |  const user={id:'editor-test',email:'editor@example.test',full_name:'Editor',role:'admin',approval_status:'approved'};
  44  |  let savedProfile=null, saveCalls=0;
  45  |  await page.route('**/api/apps/**',async route=>{
  46  |   const path=new URL(route.request().url()).pathname;
  47  |   const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  48  |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  49  |   if(path.endsWith('/entities/User/me'))return reply(user);
  50  |   if(path.includes('/analytics/'))return reply({});
  51  |   const marker=`/api/apps/${APP_ID}/functions/`;
  52  |   if(path.includes(marker)){
  53  |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  54  |    if(name==='securityContext')return reply({success:true,context:null});
  55  |    if(name==='directoryClaim')return reply({success:true,hasAccess:true,status:'verified'});
  56  |    if(name==='directoryListingProfile'){
  57  |     if(body.action==='save'){saveCalls++;savedProfile=body.profile;return reply({success:true,profile:savedProfile,id:'test-profile'})}
  58  |     if(body.action==='private_get')return reply({success:true,profile:savedProfile,base:null});
  59  |     return reply({success:true,profile:null,base:null});
  60  |    }
  61  |   }
  62  |   return reply({success:true});
  63  |  });
  64  |  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  65  |  await expect(page.getByTestId('directory-editor-mode')).toBeVisible();
  66  |  await page.getByRole('button',{name:'Guided setup'}).click();
  67  |  const nameField=page.locator('#basics input').first();
  68  |  await nameField.fill('Clare Pickleball Sandbox Persistence Test');
  69  |  await page.getByRole('button',{name:'Save & continue'}).click();
  70  |  await expect(page.getByText('Saved successfully.')).toBeVisible();
  71  |  expect(saveCalls).toBe(1);
  72  |  expect(savedProfile.name).toBe('Clare Pickleball Sandbox Persistence Test');
  73  |  await page.getByRole('button',{name:'Continue',exact:true}).click();
> 74  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
      |                                                              ^ Error: expect(locator).toContainText(expected) failed
  75  |  await page.reload();
  76  |  await expect(page.locator('#basics input').first()).toHaveValue('Clare Pickleball Sandbox Persistence Test');
  77  |  expect(saveCalls).toBe(1);
  78  | });
  79  | 
  80  | test('unverified directory visitor cannot access either editor path or send a save',async({page})=>{
  81  |  let saveCalls=0;
  82  |  await page.route('**/api/apps/**',async route=>{
  83  |   const path=new URL(route.request().url()).pathname;
  84  |   const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  85  |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  86  |   if(path.endsWith('/entities/User/me'))return reply({id:'unverified-e2e',email:'guest@example.test',full_name:'Guest',role:'user',approval_status:'approved'});
  87  |   if(path.includes('/analytics/'))return reply({});
  88  |   const marker=`/api/apps/${APP_ID}/functions/`;
  89  |   if(path.includes(marker)){
  90  |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  91  |    if(name==='securityContext')return reply({success:true,context:null});
  92  |    if(name==='directoryClaim')return reply({success:true,hasAccess:false,status:'unclaimed'});
  93  |    if(name==='directoryListingProfile'){
  94  |     if(body.action==='save'){saveCalls++;return reply({error:'Verified directory editor access required'},403)}
  95  |     if(body.action==='private_get')return reply({error:'Directory editor access required'},403);
  96  |     return reply({success:true,profile:null,base:null});
  97  |    }
  98  |   }
  99  |   return reply({success:true});
  100 |  });
  101 |  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  102 |  await expect(page.getByRole('heading',{name:'Verification required'})).toBeVisible();
  103 |  await expect(page.getByTestId('directory-editor-mode')).toHaveCount(0);
  104 |  expect(saveCalls).toBe(0);
  105 | });
  106 | 
```