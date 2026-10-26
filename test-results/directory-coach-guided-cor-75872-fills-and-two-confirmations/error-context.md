# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-coach-guided-corrections.spec.mjs >> coach guided journey has independent photo editing, private contact prefills and two confirmations
- Location: e2e/directory-coach-guided-corrections.spec.mjs:3:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Coach name (private contact)')
Expected: "Marie V. C. Moore"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Coach name (private contact)') with timeout 3000ms
  - waiting for getByLabel('Coach name (private contact)')

```

```yaml
- banner:
  - link "RallyHub — Play Connect Belong":
    - /url: /
    - img "RallyHub — Play Connect Belong"
  - button "Menu":
    - img
- main:
  - button "Back to public listing":
    - img
    - text: Back to public listing
  - paragraph: Primary Directory Owner
  - heading "Brian Moore — TEST PREVIEW" [level=1]
  - text: Directory listing
  - paragraph: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
  - button "View public listing":
    - img
    - text: View public listing
  - link "Open in Communications":
    - /url: /app/communications?scope=platform&source=directory&sourceId=test-preview-coach&template=directory_claim&returnTo=%2Fdirectory%2Ftest-preview-coach%2Fedit&label=Brian%20Moore%20%E2%80%94%20TEST%20PREVIEW
    - button "Open in Communications"
  - button "All saved" [disabled]:
    - img
    - text: All saved
  - heading "Guided setup" [level=2]
  - paragraph: RallyHub shows what is already done and takes you straight to what needs attention.
  - button "Guided setup"
  - paragraph: "Step 3 of 6: Confirm contact details"
  - button "Back to checklist"
  - list "Numbered setup steps":
    - listitem: 1. About you
    - listitem: 2. Your coaching photograph ✓
    - listitem: 3. Confirm contact details ✓
    - listitem: 4. Where you operate
    - listitem: 5. Clinic or event (optional) ✓
    - listitem: 6. Preview & publish
  - paragraph: Check what RallyHub already found, change only what needs changing, then continue.
  - button "Previous"
  - button "Continue"
  - img
  - heading "Contact & social" [level=2]
  - paragraph: Your coaching email and mobile are held privately for contact and verification. Neither will be published by RallyHub on your coaching profile.
  - heading "Confirm your private contact details" [level=3]
  - paragraph: These details are used by the protected Contact Coach system. They are not displayed on your public coaching profile. You can correct the pre-filled details below.
  - paragraph: "Signed-in account: Marie V. C. Moore"
  - checkbox "I confirm that my coaching email address is correct."
  - text: I confirm that my coaching email address is correct.
  - checkbox "I confirm that my coaching mobile number is correct."
  - text: I confirm that my coaching mobile number is correct. Coach name (private contact)
  - textbox "e.g. Chairperson, Club Contact, Debbie Brown": Marie V. C. Moore
  - paragraph: This does not change the privately verified RallyHub account holder.
  - text: Coaching email address
  - textbox: coach@example.test
  - text: Coaching mobile number
  - textbox "e.g. 087 123 4567": "0871234567"
  - text: Website (optional)
  - textbox "Website":
    - /placeholder: https://…
  - text: Facebook (optional)
  - textbox "Facebook":
    - /placeholder: https://facebook.com/…
  - text: Instagram (optional)
  - textbox "Instagram":
    - /placeholder: https://instagram.com/…
  - text: TikTok (optional)
  - textbox "TikTok":
    - /placeholder: https://www.tiktok.com/@yourname
  - paragraph: All changes saved
  - paragraph: Changes stay private until you publish.
  - button "View listing":
    - img
    - text: View listing
  - button "All saved" [disabled]:
    - img
    - text: All saved
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
  1  | import {test,expect} from '@playwright/test';
  2  | const ID='6a01dc00702b7dd2a2978c28';
  3  | test('coach guided journey has independent photo editing, private contact prefills and two confirmations',async({page})=>{
  4  |  await page.setViewportSize({width:390,height:844});
  5  |  const user={id:'testcoach-user',full_name:'Marie V. C. Moore',email:'account@example.test',role:'admin',approval_status:'approved'};
  6  |  const profile={listingType:'coach',name:'Brian Moore — TEST PREVIEW',description:'Experienced coach',photoUrl:'https://images.example.test/saved-coach.png',contact:{}};
  7  |  const base={slug:'test-preview-coach',...profile,county:'Clare'};
  8  |  const privateContact={email:'coach@example.test',phone:'0871234567'};
  9  |  const privateSaves=[];
  10 |  await page.route('https://images.example.test/saved-coach.png',route=>route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')}));
  11 |  await page.route('**/api/apps/**',async route=>{
  12 |   const path=new URL(route.request().url()).pathname;
  13 |   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  14 |   if(path.includes('/public-settings/'))return reply({id:ID,public_settings:{}});
  15 |   if(path.endsWith('/entities/User/me'))return reply(user);
  16 |   if(path.includes('/analytics/'))return reply({});
  17 |   const marker=`/api/apps/${ID}/functions/`;
  18 |   if(path.includes(marker)){
  19 |    const name=path.split(marker)[1].split('/')[0];let b={};try{b=route.request().postDataJSON()||{}}catch{}
  20 |    if(name==='securityContext')return reply({success:true,context:null});
  21 |    if(name==='directoryClaim')return reply({success:true,hasAccess:true,listing:{verificationStatus:'verified'},accessRole:'owner'});
  22 |    if(name==='directoryEvents')return reply({success:true,events:[]});
  23 |    if(name==='directoryListingProfile'){
  24 |     if(b.action==='private_get')return reply({success:true,profile,base,visibility:'preview_only',setup:{},privateContact});
  25 |     if(b.action==='save_coach_private_contact'){privateSaves.push(b);return reply({success:true,privateContact:b.contact})}
  26 |     if(b.action==='save')return reply({success:true,profile:b.profile});
  27 |     return reply({success:true,profile,base});
  28 |    }
  29 |   }
  30 |   return reply({success:true});
  31 |  });
  32 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  33 |  await page.goto('/directory/test-preview-coach/edit?guided=1&access_token=e2e');
  34 |  await expect(page.getByTestId('directory-editor-mode')).toBeVisible({timeout:12000});
  35 |  await expect(page.locator('nav').getByText('Enhance listing')).toHaveCount(0);
  36 |  await expect(page.getByTestId('setup-step-photograph')).toBeVisible();
  37 |  await page.getByTestId('setup-step-photograph').click();
  38 |  await expect(page.getByTestId('directory-coach-photograph-step')).toBeVisible();
  39 |  await expect(page.getByTestId('edit-saved-coach-photo')).toBeVisible();
  40 |  await expect(page.getByText(/Or use a photograph image URL/)).toHaveCount(0);
  41 |  await page.getByTestId('edit-saved-coach-photo').click();
  42 |  await expect(page.getByLabel('Photograph size')).toBeVisible();
  43 |  await expect(page.getByLabel('Photograph horizontal position')).toBeVisible();
  44 |  await expect(page.getByLabel('Photograph vertical position')).toBeVisible();
  45 |  await page.getByRole('button',{name:'Back to checklist'}).click();
  46 |  await page.getByTestId('setup-step-contact').click();
  47 |  await expect(page.locator('#contact')).toBeVisible();
  48 |  await expect(page.getByText('Use this mobile for WhatsApp')).toHaveCount(0);
> 49 |  await expect(page.getByLabel('Coach name (private contact)')).toHaveValue('Marie V. C. Moore');
     |                                                                ^ Error: expect(locator).toHaveValue(expected) failed
  50 |  await expect(page.getByLabel('Coaching email address')).toHaveValue('coach@example.test');
  51 |  await expect(page.getByLabel('Coaching mobile number')).toHaveValue('0871234567');
  52 |  await page.getByLabel('I confirm that my coaching email address is correct.').check();
  53 |  await page.getByLabel('I confirm that my coaching mobile number is correct.').check();
  54 |  await page.getByRole('button',{name:'Continue',exact:true}).click();
  55 |  await expect.poll(()=>privateSaves.length).toBe(1);
  56 |  expect(privateSaves[0].contact.email).toBe('coach@example.test');
  57 |  expect(privateSaves[0].contact.name).toBe('Marie V. C. Moore');
  58 |  expect(privateSaves[0].confirmEmail).toBe(true);
  59 |  expect(privateSaves[0].confirmMobile).toBe(true);
  60 |  expect(errors).toEqual([]);
  61 | });
  62 | 
```