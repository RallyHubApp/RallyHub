# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-dual-mode.spec.mjs >> guided save persists through existing backend and reloads saved value
- Location: e2e/directory-dual-mode.spec.mjs:45:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('directory-editor-mode')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('directory-editor-mode') with timeout 3000ms
  - waiting for getByTestId('directory-editor-mode')

```

```yaml
- banner:
  - link "RallyHub — Play Connect Belong":
    - /url: /
    - img "RallyHub — Play Connect Belong"
  - navigation:
    - link "Home":
      - /url: /
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
  - link "Search directory":
    - /url: /directory
    - img
  - paragraph: Signed in
  - paragraph: Editor
  - button "Sign out"
  - button "Directory Admin"
  - button "Open RallyHub"
  - button "Current appearance Auto. Change appearance.":
    - img
- main:
  - button "Back to public listing":
    - img
    - text: Back to public listing
  - text: Loading directory editor…
- contentinfo "RallyHub footer":
  - link "RallyHub home":
    - /url: /
    - img "RallyHub"
  - navigation "Footer navigation":
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
    - link "Contact":
      - /url: /contact
  - text: © 2026 RallyHub All rights reserved.
- paragraph: Help us improve RallyHub
- paragraph: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
- button "Necessary only"
- button "Allow analytics"
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
  27  |  await expect(page.getByTestId('directory-guided-overview')).toBeVisible();
  28  |  await expect(page.getByText(/we’ve already started this for you/i)).toBeVisible();
  29  |  await page.getByTestId('setup-step-basics').click();
  30  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5');
  31  |  await expect(page.locator('#basics')).toBeVisible();
  32  |  await expect(page.locator('#sessions')).toBeHidden();
  33  |  await page.getByRole('button',{name:'Continue',exact:true}).click();
  34  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
  35  |  await expect(page.locator('#contact')).toBeVisible();
  36  |  await page.getByRole('button',{name:'Previous'}).click();
  37  |  await expect(page.locator('#basics')).toBeVisible();
  38  |  await page.getByRole('button',{name:'Edit directly'}).click();
  39  |  await expect(page.locator('#sessions')).toBeVisible();
  40  |  await page.getByRole('button',{name:'Guided setup'}).click();
  41  |  await expect(page.getByTestId('directory-guided-overview')).toBeVisible();
  42  |  expect(saves).toBe(0);
  43  | });
  44  | 
  45  | test('guided save persists through existing backend and reloads saved value', async ({page}) => {
  46  |  const user={id:'editor-test',email:'editor@example.test',full_name:'Editor',role:'admin',approval_status:'approved'};
  47  |  let savedProfile=null, saveCalls=0;
  48  |  await page.route('**/api/apps/**',async route=>{
  49  |   const path=new URL(route.request().url()).pathname;
  50  |   const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  51  |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  52  |   if(path.endsWith('/entities/User/me'))return reply(user);
  53  |   if(path.includes('/analytics/'))return reply({});
  54  |   const marker=`/api/apps/${APP_ID}/functions/`;
  55  |   if(path.includes(marker)){
  56  |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  57  |    if(name==='securityContext')return reply({success:true,context:null});
  58  |    if(name==='directoryClaim')return reply({success:true,hasAccess:true,status:'verified'});
  59  |    if(name==='directoryListingProfile'){
  60  |     if(body.action==='save'){saveCalls++;savedProfile=body.profile;return reply({success:true,profile:savedProfile,id:'test-profile'})}
  61  |     if(body.action==='private_get')return reply({success:true,profile:savedProfile,base:null});
  62  |     return reply({success:true,profile:null,base:null});
  63  |    }
  64  |   }
  65  |   return reply({success:true});
  66  |  });
  67  |  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
> 68  |  await expect(page.getByTestId('directory-editor-mode')).toBeVisible();
      |                                                          ^ Error: expect(locator).toBeVisible() failed
  69  |  await page.getByRole('button',{name:'Guided setup'}).click();
  70  |  await expect(page.getByTestId('directory-guided-overview')).toBeVisible();
  71  |  await page.getByTestId('setup-step-basics').click();
  72  |  const nameField=page.locator('#basics input').first();
  73  |  await nameField.fill('Clare Pickleball Sandbox Persistence Test');
  74  |  await page.getByRole('button',{name:'Save & continue'}).click();
  75  |  await expect(page.getByText('Saved successfully.')).toBeVisible();
  76  |  expect(saveCalls).toBe(1);
  77  |  expect(savedProfile.name).toBe('Clare Pickleball Sandbox Persistence Test');
  78  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
  79  |  await page.reload();
  80  |  await expect(page.locator('#basics input').first()).toHaveValue('Clare Pickleball Sandbox Persistence Test');
  81  |  expect(saveCalls).toBe(1);
  82  | });
  83  | 
  84  | test('unverified directory visitor cannot access either editor path or send a save',async({page})=>{
  85  |  let saveCalls=0;
  86  |  await page.route('**/api/apps/**',async route=>{
  87  |   const path=new URL(route.request().url()).pathname;
  88  |   const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  89  |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  90  |   if(path.endsWith('/entities/User/me'))return reply({id:'unverified-e2e',email:'guest@example.test',full_name:'Guest',role:'user',approval_status:'approved'});
  91  |   if(path.includes('/analytics/'))return reply({});
  92  |   const marker=`/api/apps/${APP_ID}/functions/`;
  93  |   if(path.includes(marker)){
  94  |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  95  |    if(name==='securityContext')return reply({success:true,context:null});
  96  |    if(name==='directoryClaim')return reply({success:true,hasAccess:false,status:'unclaimed'});
  97  |    if(name==='directoryListingProfile'){
  98  |     if(body.action==='save'){saveCalls++;return reply({error:'Verified directory editor access required'},403)}
  99  |     if(body.action==='private_get')return reply({error:'Directory editor access required'},403);
  100 |     return reply({success:true,profile:null,base:null});
  101 |    }
  102 |   }
  103 |   return reply({success:true});
  104 |  });
  105 |  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  106 |  await expect(page.getByRole('heading',{name:'Verification required'})).toBeVisible();
  107 |  await expect(page.getByTestId('directory-editor-mode')).toHaveCount(0);
  108 |  expect(saveCalls).toBe(0);
  109 | });
  110 | 
```