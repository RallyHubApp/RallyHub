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

Locator: getByText('Coaching email address').locator('..').locator('input')
Expected: "coach@example.test"
Error: strict mode violation: getByText('Coaching email address').locator('..').locator('input') resolved to 2 elements:
    1) <input class="mt-1" type="checkbox" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1249:574"/> aka getByRole('checkbox', { name: 'I confirm that my coaching email address is correct.' })
    2) <input type="email" value="coach@example.test" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1253:130" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text…/> aka locator('input[type="email"]')

Call log:
  - Expect "toHaveValue" getByText('Coaching email address').locator('..').locator('input') with timeout 3000ms
  - waiting for getByText('Coaching email address').locator('..').locator('input')

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
        - button "Menu" [ref=e8] [cursor=pointer]
    - main [ref=e10]:
      - button "Back to public listing" [ref=e12] [cursor=pointer]
      - generic [ref=e15]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - paragraph [ref=e20]: Primary Directory Owner
            - heading "Brian Moore — TEST PREVIEW" [level=1] [ref=e21]
            - generic [ref=e22]: Directory listing
            - paragraph [ref=e24]: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
          - generic [ref=e25]:
            - button "View public listing" [ref=e26] [cursor=pointer]
            - link [ref=e27] [cursor=pointer]:
              - /url: /app/communications?scope=platform&source=directory&sourceId=test-preview-coach&template=directory_claim&returnTo=%2Fdirectory%2Ftest-preview-coach%2Fedit&label=Brian%20Moore%20%E2%80%94%20TEST%20PREVIEW
              - button "Open in Communications" [ref=e28]
            - button "All saved" [disabled]
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e31]:
              - heading "Guided setup" [level=2] [ref=e32]
              - paragraph [ref=e33]: RallyHub shows what is already done and takes you straight to what needs attention.
            - button "Guided setup" [ref=e35] [cursor=pointer]
          - generic [ref=e36]:
            - generic [ref=e37]:
              - paragraph [ref=e38]: "Step 3 of 6: Confirm contact details"
              - button "Back to checklist" [ref=e39] [cursor=pointer]
            - list "Numbered setup steps" [ref=e40]:
              - listitem [ref=e41]:
                - generic [ref=e42]: "1."
                - text: About you
              - listitem [ref=e43]:
                - generic [ref=e44]: "2."
                - text: Your coaching photograph ✓
              - listitem [ref=e45]:
                - generic [ref=e46]: "3."
                - text: Confirm contact details ✓
              - listitem [ref=e47]:
                - generic [ref=e48]: "4."
                - text: Where you operate
              - listitem [ref=e49]:
                - generic [ref=e50]: "5."
                - text: Clinic or event (optional) ✓
              - listitem [ref=e51]:
                - generic [ref=e52]: "6."
                - text: Preview & publish
            - paragraph [ref=e53]: Check what RallyHub already found, change only what needs changing, then continue.
            - generic [ref=e54]:
              - button "Previous" [ref=e55] [cursor=pointer]
              - button "Continue" [ref=e56] [cursor=pointer]
        - generic [ref=e57]:
          - heading "Contact & social" [level=2] [ref=e62]
          - paragraph [ref=e63]: Your coaching email and mobile are held privately for contact and verification. Neither will be published by RallyHub on your coaching profile.
          - generic [ref=e64]:
            - heading "Confirm your private contact details" [level=3] [ref=e65]
            - paragraph [ref=e66]: These details are used by the protected Contact Coach system. They are not displayed on your public coaching profile. You can correct the pre-filled details below.
            - paragraph [ref=e67]: "Signed-in account: Marie V. C. Moore"
            - generic [ref=e68]:
              - checkbox "I confirm that my coaching email address is correct." [ref=e69]
              - generic [ref=e70]: I confirm that my coaching email address is correct.
            - generic [ref=e71]:
              - checkbox "I confirm that my coaching mobile number is correct." [ref=e72]
              - generic [ref=e73]: I confirm that my coaching mobile number is correct.
          - generic [ref=e74]:
            - generic [ref=e75]:
              - text: Coach name (private contact)
              - textbox "e.g. Chairperson, Club Contact, Debbie Brown" [ref=e76]: Marie V. C. Moore
              - paragraph [ref=e77]: This does not change the privately verified RallyHub account holder.
            - generic [ref=e78]:
              - text: Coaching email address
              - textbox [ref=e79]: coach@example.test
            - generic [ref=e80]:
              - text: Coaching mobile number
              - textbox "e.g. 087 123 4567" [ref=e81]: "0871234567"
            - generic [ref=e82]:
              - generic [ref=e83]: Website (optional)
              - textbox "Website" [ref=e84]:
                - /placeholder: https://…
            - generic [ref=e85]:
              - generic [ref=e86]: Facebook (optional)
              - textbox "Facebook" [ref=e87]:
                - /placeholder: https://facebook.com/…
            - generic [ref=e88]:
              - generic [ref=e89]: Instagram (optional)
              - textbox "Instagram" [ref=e90]:
                - /placeholder: https://instagram.com/…
            - generic [ref=e91]:
              - generic [ref=e92]: TikTok (optional)
              - textbox "TikTok" [ref=e93]:
                - /placeholder: https://www.tiktok.com/@yourname
        - generic [ref=e94]:
          - generic [ref=e95]:
            - paragraph [ref=e96]: All changes saved
            - paragraph [ref=e97]: Changes stay private until you publish.
          - generic [ref=e98]:
            - button "View listing" [ref=e99] [cursor=pointer]
            - button "All saved" [disabled]
    - contentinfo "RallyHub footer" [ref=e101]:
      - generic [ref=e102]:
        - generic [ref=e103]:
          - link "RallyHub home" [ref=e104] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e105]
          - navigation "Footer navigation" [ref=e106]:
            - link "Directory" [ref=e107] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e108] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e109] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e110] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e111] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e112]: © 2026 RallyHub All rights reserved.
  - generic [ref=e114]:
    - generic [ref=e115]:
      - paragraph [ref=e116]: Help us improve RallyHub
      - paragraph [ref=e117]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e118]:
      - button "Necessary only" [ref=e119] [cursor=pointer]
      - button "Allow analytics" [ref=e120] [cursor=pointer]
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
  49 |  await expect(page.getByText('Coach name (private contact)').locator('..').locator('input')).toHaveValue('Marie V. C. Moore');
> 50 |  await expect(page.getByText('Coaching email address').locator('..').locator('input')).toHaveValue('coach@example.test');
     |                                                                                        ^ Error: expect(locator).toHaveValue(expected) failed
  51 |  await expect(page.getByText('Coaching mobile number').locator('..').locator('input')).toHaveValue('0871234567');
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