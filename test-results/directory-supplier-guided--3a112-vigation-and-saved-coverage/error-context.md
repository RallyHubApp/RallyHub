# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-supplier-guided.spec.mjs >> supplier guided journey: seeded details, logo stage, private contact confirmations, navigation and saved coverage
- Location: e2e/directory-supplier-guided.spec.mjs:3:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByText('Supplier email address', { exact: true }).locator('..').locator('input')
Expected: "supplier@example.test"
Error: strict mode violation: getByText('Supplier email address', { exact: true }).locator('..').locator('input') resolved to 2 elements:
    1) <input value="" type="email" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1346:187" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"/> aka locator('input[type="email"]')
    2) <input class="mt-1" type="checkbox" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1347:133"/> aka getByRole('checkbox', { name: 'I confirm that this supplier email address is correct.' })

Call log:
  - Expect "toHaveValue" getByText('Supplier email address', { exact: true }).locator('..').locator('input') with timeout 3000ms
  - waiting for getByText('Supplier email address', { exact: true }).locator('..').locator('input')

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
          - link "About" [ref=e12] [cursor=pointer]:
            - /url: /about
        - generic [ref=e13]:
          - link "Search directory" [ref=e14] [cursor=pointer]:
            - /url: /directory
          - generic [ref=e18]:
            - paragraph [ref=e19]: Signed in
            - paragraph [ref=e20]: Test Supplier Owner
          - button "Sign out" [ref=e21] [cursor=pointer]
          - button "Directory Admin" [ref=e22] [cursor=pointer]
          - button "Open RallyHub" [ref=e23] [cursor=pointer]
          - button "Current appearance Auto. Change appearance." [ref=e24] [cursor=pointer]
    - main [ref=e25]:
      - generic [ref=e26]:
        - button "Back to public listing" [ref=e27] [cursor=pointer]
        - generic [ref=e30]: Saved
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - paragraph [ref=e40]: Primary Directory Owner
              - heading "Celtic Pickleball" [level=1] [ref=e41]
              - generic [ref=e42]: Directory listing
              - paragraph [ref=e44]: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
            - generic [ref=e45]:
              - button "View public listing" [ref=e46] [cursor=pointer]
              - link [ref=e47] [cursor=pointer]:
                - /url: /app/communications?scope=platform&source=directory&sourceId=test-supplier&template=directory_claim&returnTo=%2Fdirectory%2Ftest-supplier%2Fedit&label=Celtic%20Pickleball
                - button "Open in Communications" [ref=e48]
              - button "Saved ✓" [disabled]
          - generic [ref=e49]:
            - generic [ref=e50]:
              - strong [ref=e54]: Saved successfully.
              - text: Changes are live in the public directory.
            - button "View updated listing" [ref=e55] [cursor=pointer]
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]:
              - heading "Guided setup" [level=2] [ref=e59]
              - paragraph [ref=e60]: RallyHub shows what is already done and takes you straight to what needs attention.
            - button "Guided setup" [ref=e62] [cursor=pointer]
          - generic [ref=e63]:
            - generic [ref=e64]:
              - paragraph [ref=e65]: "Step 3 of 5: Confirm supplier contact"
              - button "Back to checklist" [ref=e66] [cursor=pointer]
            - list "Numbered setup steps" [ref=e67]:
              - listitem [ref=e68]:
                - button "1. About you ✓" [ref=e69] [cursor=pointer]:
                  - generic [ref=e70]: "1."
                  - text: About you ✓
              - listitem [ref=e71]:
                - button "2. Your business logo ✓" [ref=e72] [cursor=pointer]:
                  - generic [ref=e73]: "2."
                  - text: Your business logo ✓
              - listitem [ref=e74]:
                - button "3. Confirm supplier contact ✓" [ref=e75] [cursor=pointer]:
                  - generic [ref=e76]: "3."
                  - text: Confirm supplier contact ✓
              - listitem [ref=e77]:
                - button "4. Where you operate" [ref=e78] [cursor=pointer]:
                  - generic [ref=e79]: "4."
                  - text: Where you operate
              - listitem [ref=e80]:
                - button "5. Preview & publish ✓" [ref=e81] [cursor=pointer]:
                  - generic [ref=e82]: "5."
                  - text: Preview & publish ✓
            - paragraph [ref=e83]: Check what RallyHub already found, change only what needs changing, then continue.
            - paragraph [ref=e84]: Saved automatically ✓
            - generic [ref=e85]:
              - button "Previous" [ref=e86] [cursor=pointer]
              - button "Continue" [ref=e87] [cursor=pointer]
        - generic [ref=e88]:
          - heading "Your protected supplier contact" [level=2] [ref=e93]
          - generic [ref=e94]:
            - paragraph [ref=e95]: Your contact details are protected. Neither your email address nor your mobile number will be published on your supplier profile. Enquiries use our protected Contact Supplier form. Once forwarding is configured and verified, enquiries can be forwarded to your confirmed contact email address.
            - paragraph [ref=e96]: The Directory is completely free to use, and there's no obligation to use any of RallyHub's other services.
            - paragraph [ref=e97]: Check your pre-filled details below, correct anything necessary, and confirm your email and mobile separately.
          - generic [ref=e98]:
            - generic [ref=e99]:
              - text: Supplier contact name
              - textbox "e.g. Chairperson, Club Contact" [ref=e100]
              - paragraph [ref=e101]: Pre-filled from the existing Directory contact record where available.
            - generic [ref=e102]:
              - text: Supplier email address
              - textbox [ref=e103]
              - generic [ref=e104] [cursor=pointer]:
                - checkbox "I confirm that this supplier email address is correct." [ref=e105]
                - generic [ref=e106]: I confirm that this supplier email address is correct.
            - generic [ref=e107]:
              - text: Supplier mobile / telephone
              - textbox "e.g. 087 123 4567" [ref=e108]
              - generic [ref=e109] [cursor=pointer]:
                - checkbox "I confirm that this supplier mobile / telephone number is correct." [ref=e110]
                - generic [ref=e111]: I confirm that this supplier mobile / telephone number is correct.
            - generic [ref=e112]:
              - generic [ref=e113]: Website (optional)
              - textbox "Website" [ref=e114]:
                - /placeholder: https://…
                - text: https://example.test
            - generic [ref=e115]:
              - generic [ref=e116]: Facebook (optional)
              - textbox "Facebook" [ref=e117]:
                - /placeholder: https://facebook.com/…
                - text: https://facebook.com/testshop
            - generic [ref=e118]:
              - generic [ref=e119]: Instagram (optional)
              - textbox "Instagram" [ref=e120]:
                - /placeholder: https://instagram.com/…
                - text: https://instagram.com/testshop
            - generic [ref=e121]:
              - generic [ref=e122]: TikTok (optional)
              - textbox "TikTok" [ref=e123]:
                - /placeholder: https://www.tiktok.com/@yourname
        - generic [ref=e124]:
          - generic [ref=e125]:
            - paragraph [ref=e126]: Saved successfully
            - paragraph [ref=e130]: Your public Directory listing has been updated.
          - generic [ref=e131]:
            - button "View listing" [ref=e132] [cursor=pointer]
            - button "Saved ✓" [disabled]
    - contentinfo "RallyHub footer" [ref=e134]:
      - generic [ref=e135]:
        - generic [ref=e136]:
          - link "RallyHub home" [ref=e137] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e138]
          - navigation "Footer navigation" [ref=e139]:
            - link "Directory" [ref=e140] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e141] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e142] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e143] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e144] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e145]: © 2026 RallyHub All rights reserved.
  - generic [ref=e147]:
    - generic [ref=e148]:
      - paragraph [ref=e149]: Help us improve RallyHub
      - paragraph [ref=e150]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e151]:
      - button "Necessary only" [ref=e152] [cursor=pointer]
      - button "Allow analytics" [ref=e153] [cursor=pointer]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const ID='6a01dc00702b7dd2a2978c28';
  3  | test('supplier guided journey: seeded details, logo stage, private contact confirmations, navigation and saved coverage',async({page})=>{
  4  |  const user={id:'supplier-test',full_name:'Test Supplier Owner',email:'owner@sample.test',role:'admin',approval_status:'approved'};
  5  |  const base={slug:'test-supplier',listingType:'equipment',name:'Celtic Pickleball',description:'Pickleball paddles, balls, bags and accessories for players in Ireland.',logoUrl:'https://images.example.test/logo.png',website:'https://example.test',shopUrl:'https://example.test/shop',productCategories:['Paddles','Balls'],facebook:'https://facebook.com/testshop',instagram:'https://instagram.com/testshop',contact:{}};
  6  |  const privateContact={name:'Supplier Owner',email:'supplier@example.test',phone:'0851234567'};
  7  |  let profile=null, savedContact=null, saveCount=0,completeCount=0;
  8  |  await page.route('https://images.example.test/logo.png',route=>route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')}));
  9  |  await page.route('**/api/apps/**',route=>{
  10 |   const path=new URL(route.request().url()).pathname;
  11 |   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  12 |   if(path.includes('/public-settings/'))return reply({id:ID,public_settings:{}});
  13 |   if(path.endsWith('/entities/User/me'))return reply(user);
  14 |   if(path.includes('/analytics/'))return reply({});
  15 |   const marker=`/api/apps/${ID}/functions/`;
  16 |   if(path.includes(marker)){
  17 |    const name=path.split(marker)[1].split('/')[0];
  18 |    let b={};try{b=route.request().postDataJSON()||{}}catch{}
  19 |    if(name==='securityContext')return reply({success:true,context:null});
  20 |    if(name==='directoryClaim')return reply({success:true,hasAccess:true,listing:{verificationStatus:'verified'},accessRole:'owner'});
  21 |    if(name==='directoryEvents')return reply({success:true,events:[]});
  22 |    if(name==='directoryListingProfile'){
  23 |     if(b.action==='private_get')return reply({success:true,profile:profile||base,base,visibility:'public',setup:{},privateContact});
  24 |     if(b.action==='save_supplier_private_contact'){savedContact=b;return reply({success:true,privateContact:b.contact})}
  25 |     if(b.action==='save'){saveCount++;profile={...b.profile,contact:{}};return reply({success:true,profile})}
  26 |     if(b.action==='complete_guided_setup'){completeCount++;return reply({success:true,emailStatus:'awaiting_template_approval'})}
  27 |    }
  28 |   }
  29 |   return reply({success:true});
  30 |  });
  31 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  32 |  await page.goto('/directory/test-supplier/edit?guided=1&access_token=e2e');
  33 |  await expect(page.getByTestId('directory-guided-overview')).toBeVisible({timeout:18000});
  34 |  await expect(page.getByTestId('setup-step-photograph')).toContainText('business logo');
  35 |  await page.getByTestId('setup-step-basics').click();
  36 |  await expect(page.getByText('Products supplied (one category per line)')).toBeVisible();
  37 |  await expect(page.locator('#basics').getByText('Business / listing name').locator('..').locator('input')).toHaveValue('Celtic Pickleball');
  38 |  await expect(page.locator('#basics').getByText('Shop / product catalogue link')).toBeVisible();
  39 |  await page.locator('#basics').getByText('Shop / product catalogue link').locator('..').locator('input').fill('https://example.test/catalogue');
  40 |  await page.getByRole('button',{name:'Back to checklist'}).click();
  41 |  await page.getByTestId('setup-step-photograph').click();
  42 |  await expect(page.getByRole('heading',{name:'Your business logo'})).toBeVisible();
  43 |  await expect(page.getByText('Replace logo')).toBeVisible();
  44 |  await expect(page.getByText('Adjust current logo')).toBeVisible();
  45 |  await expect(page.getByText('Or use a logo image URL')).toHaveCount(0);
  46 |  await page.getByRole('button',{name:'Back to checklist'}).click();
  47 |  await page.getByTestId('setup-step-contact').click();
  48 |  await expect(page.getByText('Your protected supplier contact')).toBeVisible();
  49 |  await expect(page.getByText('protected Contact Supplier')).toBeVisible();
  50 |  await expect(page.getByText('Use this mobile for WhatsApp')).toHaveCount(0);
> 51 |  await expect(page.getByText('Supplier email address',{exact:true}).locator('..').locator('input')).toHaveValue(privateContact.email);
     |                                                                                                     ^ Error: expect(locator).toHaveValue(expected) failed
  52 |  await expect(page.getByText('Supplier mobile / telephone',{exact:true}).locator('..').locator('input')).toHaveValue(privateContact.phone);
  53 |  await page.getByLabel('I confirm that this supplier email address is correct.').check();
  54 |  await page.getByLabel('I confirm that this supplier mobile / telephone number is correct.').check();
  55 |  await page.getByRole('button',{name:/Save & continue|Continue/}).last().click();
  56 |  await expect.poll(()=>Boolean(savedContact)).toBe(true);
  57 |  expect(savedContact.confirmEmail).toBe(true);
  58 |  expect(savedContact.confirmMobile).toBe(true);
  59 |  await expect.poll(()=>saveCount).toBeGreaterThan(0);
  60 |  expect(profile.contact.email).toBeFalsy();
  61 |  await page.reload();
  62 |  await expect(page.getByTestId('directory-guided-overview')).toBeVisible({timeout:13000});
  63 |  await page.getByTestId('setup-step-basics').click();
  64 |  await expect(page.getByText('Shop / product catalogue link').locator('..').locator('input')).toHaveValue('https://example.test/catalogue');
  65 |  expect(errors).toEqual([]);
  66 | });
  67 | 
```