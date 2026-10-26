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

Locator: locator('#basics').getByRole('textbox', { name: 'Business / listing name' })
Expected: "Celtic Pickleball"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" locator('#basics').getByRole('textbox', { name: 'Business / listing name' }) with timeout 3000ms
  - waiting for locator('#basics').getByRole('textbox', { name: 'Business / listing name' })

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
    - link "About":
      - /url: /about
  - link "Search directory":
    - /url: /directory
    - img
  - paragraph: Signed in
  - paragraph: Test Supplier Owner
  - button "Sign out"
  - button "Directory Admin"
  - button "Open RallyHub"
  - button "Current appearance Auto. Change appearance.":
    - img
- main:
  - button "Back to public listing":
    - img
    - text: Back to public listing
  - paragraph: Primary Directory Owner
  - heading "Celtic Pickleball" [level=1]
  - text: Directory listing
  - paragraph: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
  - button "View public listing":
    - img
    - text: View public listing
  - link "Open in Communications":
    - /url: /app/communications?scope=platform&source=directory&sourceId=test-supplier&template=directory_claim&returnTo=%2Fdirectory%2Ftest-supplier%2Fedit&label=Celtic%20Pickleball
    - button "Open in Communications"
  - button "All saved" [disabled]:
    - img
    - text: All saved
  - heading "Guided setup" [level=2]
  - paragraph: RallyHub shows what is already done and takes you straight to what needs attention.
  - button "Guided setup"
  - paragraph: "Step 1 of 5: About you"
  - button "Back to checklist"
  - list "Numbered setup steps":
    - listitem:
      - button "1. About you ✓"
    - listitem:
      - button "2. Your business logo ✓"
    - listitem:
      - button "3. Confirm supplier contact ✓"
    - listitem:
      - button "4. Where you operate"
    - listitem:
      - button "5. Preview & publish ✓"
  - paragraph: Check what RallyHub already found, change only what needs changing, then continue.
  - button "Previous" [disabled]
  - button "Continue"
  - img
  - heading "Your supplier profile" [level=2]
  - text: Business / listing name
  - textbox "Public listing name": Celtic Pickleball
  - paragraph: This changes the public heading only. The RallyHub listing link stays the same.
  - text: Business description
  - textbox "Tell players clearly what you provide and why it may be useful.": Pickleball paddles, balls, bags and accessories for players in Ireland.
  - paragraph: This is the main introduction players see in search and on the public listing page.
  - text: Products supplied (one category per line)
  - textbox "Paddles, balls, nets, clothing…": Paddles Balls
  - text: Shop / product catalogue link (optional)
  - textbox "https://…": https://example.test/shop
  - paragraph: All changes saved
  - paragraph: Changes become public as soon as the save completes.
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
> 37 |  await expect(page.locator('#basics').getByRole('textbox',{name:'Business / listing name'})).toHaveValue('Celtic Pickleball');
     |                                                                                              ^ Error: expect(locator).toHaveValue(expected) failed
  38 |  await expect(page.locator('#basics').getByText('Shop / product catalogue link')).toBeVisible();
  39 |  await page.locator('#basics').getByText('Shop / product catalogue link').locator('..').locator('input').fill('https://example.test/catalogue');
  40 |  await page.getByRole('button',{name:'Back to checklist'}).click();
  41 |  await page.getByTestId('setup-step-photograph').click();
  42 |  await expect(page.getByRole('heading',{name:'Your business logo'})).toBeVisible();
  43 |  await expect(page.getByText('Upload logo')).toBeVisible();
  44 |  await expect(page.getByText('Adjust current logo')).toBeVisible();
  45 |  await expect(page.getByText('Or use a logo image URL')).toHaveCount(0);
  46 |  await page.getByRole('button',{name:'Back to checklist'}).click();
  47 |  await page.getByTestId('setup-step-contact').click();
  48 |  await expect(page.getByText('Your protected supplier contact')).toBeVisible();
  49 |  await expect(page.getByText('protected Contact Supplier')).toBeVisible();
  50 |  await expect(page.getByText('Use this mobile for WhatsApp')).toHaveCount(0);
  51 |  await expect(page.getByText('Supplier email address').locator('..').locator('input')).toHaveValue(privateContact.email);
  52 |  await expect(page.getByText('Supplier mobile / telephone').locator('..').locator('input')).toHaveValue(privateContact.phone);
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