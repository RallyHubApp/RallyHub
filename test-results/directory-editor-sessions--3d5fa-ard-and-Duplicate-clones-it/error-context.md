# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-editor-sessions.spec.mjs >> directory editor: Add session is visible, adds a card, and Duplicate clones it
- Location: e2e/directory-editor-sessions.spec.mjs:30:1

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: getByTestId('directory-session-card').nth(7)
Expected pattern: /ring-primary/
Received string:  "rounded-xl border bg-background/30 p-4 sm:p-5 space-y-4 transition-all border-border"
Timeout: 3000ms

Call log:
  - Expect "toHaveClass" getByTestId('directory-session-card').nth(7) with timeout 3000ms
  - waiting for getByTestId('directory-session-card').nth(7)
    10 × locator resolved to <div data-dynamic-content="true" id="session-card-db-thu-advanced" data-testid="directory-session-card" data-source-location="src/pages/DirectoryListingEdit.jsx:823:18" class="rounded-xl border bg-background/30 p-4 sm:p-5 space-y-4 transition-all border-border">…</div>
       - unexpected value "rounded-xl border bg-background/30 p-4 sm:p-5 space-y-4 transition-all border-border"

```

```yaml
- paragraph: Thursday · 20:30 · Improver & Advanced
- paragraph: Weekly session 8
- button "Duplicate":
  - img
  - text: Duplicate
- button "Remove":
  - img
  - text: Remove
- text: Day
- combobox:
  - option "Monday"
  - option "Tuesday"
  - option "Wednesday"
  - option "Thursday" [selected]
  - option "Friday"
  - option "Saturday"
  - option "Sunday"
- text: Venue
- combobox:
  - option "Doora Barefield" [selected]
  - option "Corofin"
  - option "Ennistymon"
- text: Meet time (optional)
- textbox
- text: Start
- textbox: 20:30
- text: End (optional)
- textbox: 22:00
- text: Session / level
- textbox "e.g. Social, Improver, Match Play": Improver & Advanced
- text: Price (€)
- spinbutton: "5.5"
- text: Payment
- combobox:
  - option "Not specified" [selected]
  - option "Cash"
  - option "Online"
  - option "Pay at venue"
  - option "Included in membership"
  - option "Contact club"
- text: Capacity
- spinbutton
- text: Host / organiser (optional)
- textbox
- checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page."
- strong: Show a public booking / join link
- text: Use this only if anyone viewing the directory is allowed to open the booking page.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID='6a01dc00702b7dd2a2978c28';
  4  | const user={id:'directory-editor-e2e',email:'editor@example.test',full_name:'Directory Editor',role:'admin',approval_status:'approved'};
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | async function installDirectoryBackend(page){
  8  |   await page.route('**/api/apps/**',async route=>{
  9  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  10 |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  11 |     if(path.endsWith('/entities/User/me')) return json(route,user);
  12 |     if(path.includes('/analytics/')) return json(route,{});
  13 |     const marker=`/api/apps/${APP_ID}/functions/`;
  14 |     const i=path.indexOf(marker);
  15 |     if(i>=0){
  16 |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);
  17 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  18 |       if(name==='securityContext') return json(route,{success:true,context:null});
  19 |       if(name==='directoryListingProfile'){
  20 |         if(body.action==='public_get') return json(route,{success:true,listingSlug:'clare-pickleball',verificationStatus:'verified',profile:null,base:null});
  21 |         if(body.action==='save') return json(route,{success:true,profile:body.profile,updatedAt:new Date().toISOString(),id:'profile-e2e'});
  22 |       }
  23 |       if(name==='directoryClaim'&&body.action==='status') return json(route,{success:true,hasAccess:true,status:'verified'});
  24 |       return json(route,{success:true});
  25 |     }
  26 |     return json(route,{});
  27 |   });
  28 | }
  29 | 
  30 | test('directory editor: Add session is visible, adds a card, and Duplicate clones it',async({page})=>{
  31 |   await installDirectoryBackend(page);
  32 |   const errors=[];page.on('pageerror',e=>errors.push(e.message));
  33 |   await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  34 |   await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  35 |   await page.getByRole('heading',{name:'Weekly sessions'}).scrollIntoViewIfNeeded();
  36 | 
  37 |   const cards=page.getByTestId('directory-session-card');
  38 |   await expect(cards).toHaveCount(7);
  39 |   await expect(page.getByText('Wednesday · 11:30 · Club Session')).toBeVisible();
  40 | 
  41 |   await page.getByTestId('directory-add-session').click();
  42 |   await expect(cards).toHaveCount(8);
  43 |   await expect(page.getByTestId('directory-session-notice')).toContainText('New blank session added');
  44 | 
  45 |   const newCard=cards.nth(7);
  46 |   await expect(newCard).toBeVisible();
> 47 |   await expect(newCard).toHaveClass(/ring-primary/);
     |                         ^ Error: expect(locator).toHaveClass(expected) failed
  48 | 
  49 |   const beforeCloneCount=await cards.count();
  50 |   await cards.first().getByTestId('directory-clone-session').click();
  51 |   await expect(cards).toHaveCount(beforeCloneCount+1);
  52 |   await expect(page.getByTestId('directory-session-notice')).toContainText('Session duplicated');
  53 | 
  54 |   const original=cards.nth(0);
  55 |   const duplicate=cards.nth(1);
  56 |   const originalSelects=original.locator('select');
  57 |   const duplicateSelects=duplicate.locator('select');
  58 |   expect(await originalSelects.nth(0).inputValue()).toBe(await duplicateSelects.nth(0).inputValue());
  59 |   expect(await originalSelects.nth(1).inputValue()).toBe(await duplicateSelects.nth(1).inputValue());
  60 |   const originalTimes=original.locator('input[type="time"]');
  61 |   const duplicateTimes=duplicate.locator('input[type="time"]');
  62 |   expect(await originalTimes.nth(1).inputValue()).toBe(await duplicateTimes.nth(1).inputValue());
  63 |   expect(await originalTimes.nth(2).inputValue()).toBe(await duplicateTimes.nth(2).inputValue());
  64 |   expect(errors).toEqual([]);
  65 | });
  66 | 
  67 | test('Clare public listing shows Corofin Wednesday session with €5 cash',async({page})=>{
  68 |   await installDirectoryBackend(page);
  69 |   await page.goto('/directory/clare-pickleball');
  70 |   await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  71 |   const session=page.getByText('11:30–13:30').locator('..').locator('..');
  72 |   await expect(session).toContainText('Corofin GAA Sports Hall');
  73 |   await expect(session).toContainText('€5');
  74 |   await expect(session).toContainText('Cash');
  75 | });
  76 | 
```