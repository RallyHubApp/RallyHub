# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-dual-mode.spec.mjs >> guided save persists through existing backend and reloads saved value
- Location: e2e/directory-dual-mode.spec.mjs:42:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Save this step' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6] [cursor=pointer]:
          - /url: /
          - img "RallyHub — Play Connect Belong" [ref=e7]
        - navigation [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /
          - link "Directory" [ref=e10] [cursor=pointer]:
            - /url: /directory
          - link "Events" [ref=e11] [cursor=pointer]:
            - /url: /events
          - link "Club Guide" [ref=e12] [cursor=pointer]:
            - /url: /directory/help
          - link "About" [ref=e13] [cursor=pointer]:
            - /url: /about
        - generic [ref=e14]:
          - link "Search directory" [ref=e15] [cursor=pointer]:
            - /url: /directory
          - generic [ref=e19]:
            - paragraph [ref=e20]: Signed in
            - paragraph [ref=e21]: Editor
          - button "Sign out" [ref=e22] [cursor=pointer]
          - button "Directory Admin" [ref=e23] [cursor=pointer]
          - button "Open RallyHub" [ref=e24] [cursor=pointer]
          - button "Current appearance Auto. Change appearance." [ref=e25] [cursor=pointer]
    - main [ref=e26]:
      - generic [ref=e27]:
        - button "Back to public listing" [ref=e28] [cursor=pointer]
        - generic [ref=e31]: Unsaved changes
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e35]:
            - generic [ref=e36]:
              - paragraph [ref=e37]: Super Admin · Unclaimed listing
              - heading "Clare Pickleball Sandbox Persistence Test" [level=1] [ref=e38]
              - generic [ref=e39]:
                - generic [ref=e40]: County Clare
                - generic [ref=e41]: 3 venues
                - generic [ref=e42]: 7 weekly sessions
              - paragraph [ref=e43]: Keep the public listing accurate. The displayed club name can be corrected at any time; the underlying RallyHub URL stays fixed so existing links and ownership are not affected. County remains fixed.
            - generic [ref=e44]:
              - button "View public listing" [ref=e45] [cursor=pointer]
              - link [ref=e46] [cursor=pointer]:
                - /url: /app/communications?scope=platform&source=directory&sourceId=clare-pickleball&template=directory_claim&returnTo=%2Fdirectory%2Fclare-pickleball%2Fedit&label=Clare%20Pickleball%20Sandbox%20Persistence%20Test
                - button "Open in Communications" [ref=e47]
              - link [ref=e48] [cursor=pointer]:
                - /url: /directory/clare-pickleball/events
                - button "Manage events" [ref=e49]
              - button "Save changes" [ref=e50] [cursor=pointer]
          - navigation [ref=e51]:
            - link "Basics" [ref=e52] [cursor=pointer]:
              - /url: "#basics"
            - link "Contact" [ref=e53] [cursor=pointer]:
              - /url: "#contact"
            - link "Venues" [ref=e54] [cursor=pointer]:
              - /url: "#venues"
            - link "Sessions" [ref=e55] [cursor=pointer]:
              - /url: "#sessions"
            - link "Events" [ref=e56] [cursor=pointer]:
              - /url: /directory/clare-pickleball/events
            - button "Enhance listing" [ref=e59] [cursor=pointer]
            - link "Help" [ref=e60] [cursor=pointer]:
              - /url: /directory/help
        - generic [ref=e64]:
          - heading "How would you like to update your listing?" [level=2] [ref=e65]
          - paragraph [ref=e66]: Both options update the same listing. Switch at any time.
          - generic [ref=e67]:
            - button "Guided setup" [ref=e68] [cursor=pointer]
            - button "Edit directly" [ref=e69] [cursor=pointer]
          - generic [ref=e70]:
            - paragraph [ref=e71]: "Step 1 of 5: Club details"
            - generic "Setup progress" [ref=e72]
            - paragraph [ref=e78]: Complete only what is useful. Optional fields can be skipped, and your progress is saved as you go.
            - generic [ref=e79]:
              - button "Previous" [disabled]
              - button "Save & continue" [ref=e80] [cursor=pointer]
        - generic [ref=e82]:
          - generic [ref=e83]:
            - heading "Start with four things" [level=2] [ref=e88]
            - paragraph [ref=e89]: 1. Check the club description · 2. Check the public contact · 3. Check the main venue · 4. Check the regular sessions. That is enough for a useful listing. Everything else is optional.
            - paragraph [ref=e90]: Using Spond? Open Enhanced listing to connect Spond and automatically import your club’s events and regular sessions.
          - link [ref=e91] [cursor=pointer]:
            - /url: /directory/help
            - button "Open help guide" [ref=e92]
        - generic [ref=e93]:
          - heading "Public club information" [level=2] [ref=e97]
          - generic [ref=e98]:
            - generic [ref=e99]:
              - text: Club name
              - textbox "e.g. Dalkey Pickleball Club" [active] [ref=e100]: Clare Pickleball Sandbox Persistence Test
              - paragraph [ref=e101]: This changes the public heading only. The RallyHub listing link stays the same.
            - generic [ref=e102]:
              - text: Club description
              - textbox "Tell players what your club is about, where you play and who you welcome." [ref=e103]: A welcoming, members-only pickleball club with indoor sessions across County Clare.
              - paragraph [ref=e104]: This is the main introduction players see in search and on the public listing page.
            - generic [ref=e105]:
              - generic [ref=e106]:
                - paragraph [ref=e107]: Optional club details
                - paragraph [ref=e108]: Website, social links, joining information and attendance policy can all be added later. If your club uses Spond, you can also connect your Spond account here to bring your regular venues and session times into RallyHub instead of entering them manually.
              - button "Enhance listing" [ref=e109] [cursor=pointer]
            - generic [ref=e110]:
              - text: Club logo
              - generic [ref=e111]:
                - img "Club logo preview" [ref=e112]
                - generic [ref=e113]:
                  - generic [ref=e114]:
                    - generic [ref=e115] [cursor=pointer]: Replace logo
                    - button "Remove logo" [ref=e119] [cursor=pointer]
                  - paragraph [ref=e120]: JPG, PNG or WebP up to 5 MB. RallyHub automatically removes common transparent/white padding, centres the crest, then lets you resize and reposition it before upload.
                  - generic [ref=e121]:
                    - text: Or use a logo image URL (HTTPS)
                    - textbox "Logo image HTTPS URL" [ref=e122]:
                      - /placeholder: https://example.com/club-logo.png
                      - text: https://clarepickleball.ie/wp-content/uploads/2025/06/491439977_17843980809473841_8409446969161026129_n-removebg-preview.png
                    - paragraph [ref=e123]: Optional alternative to uploading an image. Paste a direct HTTPS image link, preview it above, then use Save changes to update this listing.
        - generic [ref=e124]:
          - generic [ref=e125]:
            - paragraph [ref=e126]: You have unsaved changes
            - paragraph [ref=e127]: Changes become public as soon as the save completes.
          - generic [ref=e128]:
            - button "View listing" [ref=e129] [cursor=pointer]
            - button "Save changes" [ref=e130] [cursor=pointer]
    - contentinfo "RallyHub footer" [ref=e132]:
      - generic [ref=e133]:
        - generic [ref=e134]:
          - link "RallyHub home" [ref=e135] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e136]
          - navigation "Footer navigation" [ref=e137]:
            - link "Directory" [ref=e138] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e139] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e140] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e141] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e142] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e143]: © 2026 RallyHub All rights reserved.
  - generic [ref=e145]:
    - generic [ref=e146]:
      - paragraph [ref=e147]: Help us improve RallyHub
      - paragraph [ref=e148]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e149]:
      - button "Necessary only" [ref=e150] [cursor=pointer]
      - button "Allow analytics" [ref=e151] [cursor=pointer]
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
> 69  |  await page.getByRole('button',{name:'Save this step'}).click();
      |                                                         ^ Error: locator.click: Test timeout of 45000ms exceeded.
  70  |  await expect(page.getByText('Saved successfully.')).toBeVisible();
  71  |  expect(saveCalls).toBe(1);
  72  |  expect(savedProfile.name).toBe('Clare Pickleball Sandbox Persistence Test');
  73  |  await page.getByRole('button',{name:'Continue',exact:true}).click();
  74  |  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
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