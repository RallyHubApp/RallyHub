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

Locator:  locator('#contact input[type=email]')
Expected: "supplier@example.test"
Received: ""
Timeout:  3000ms

Call log:
  - Expect "toHaveValue" locator('#contact input[type=email]') with timeout 3000ms
  - waiting for locator('#contact input[type=email]')
    10 × locator resolved to <input value="" type="email" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1346:187" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"/>
       - unexpected value ""

```

```yaml
- textbox
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
  22 |    if(name==='directoryListingProfile'){console.log('MOCK PROFILE ACTION',JSON.stringify(b).slice(0,230));
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
> 51 |  await expect(page.locator('#contact input[type=email]')).toHaveValue(privateContact.email);
     |                                                           ^ Error: expect(locator).toHaveValue(expected) failed
  52 |  await expect(page.locator('#contact input[placeholder="e.g. 087 123 4567"]')).toHaveValue(privateContact.phone);
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