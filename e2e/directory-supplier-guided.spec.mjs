import {test,expect} from '@playwright/test';
const ID='6a01dc00702b7dd2a2978c28';
test('supplier guided journey: seeded details, logo stage, private contact confirmations, navigation and saved coverage',async({page})=>{
 const user={id:'supplier-test',full_name:'Test Supplier Owner',email:'owner@sample.test',role:'admin',approval_status:'approved'};
 const base={slug:'test-supplier',listingType:'equipment',name:'Celtic Pickleball',description:'Pickleball paddles, balls, bags and accessories for players in Ireland.',logoUrl:'https://images.example.test/logo.png',website:'https://example.test',shopUrl:'https://example.test/shop',productCategories:['Paddles','Balls'],facebook:'https://facebook.com/testshop',instagram:'https://instagram.com/testshop',contact:{}};
 const privateContact={name:'Supplier Owner',email:'supplier@example.test',phone:'0851234567'};
 let profile=null, savedContact=null, saveCount=0,completeCount=0,logoUploads=0;
 await page.route('https://images.example.test/logo.png',route=>route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')}));
 await page.route('**/api/apps/**',route=>{
  const path=new URL(route.request().url()).pathname;
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path.includes('/public-settings/'))return reply({id:ID,public_settings:{}});
  if(path.endsWith('/entities/User/me'))return reply(user);
  if(path.includes('/analytics/'))return reply({});
  const marker=`/api/apps/${ID}/functions/`;
  if(path.includes(marker)){
   const name=path.split(marker)[1].split('/')[0];
   let b={};try{b=route.request().postDataJSON()||{}}catch{}
   if(name==='securityContext')return reply({success:true,context:null});
   if(name==='directoryClaim')return reply({success:true,hasAccess:true,listing:{verificationStatus:'verified'},accessRole:'owner'});
   if(name==='directoryEvents')return reply({success:true,events:[]});
   if(name==='secureCreditAction'){logoUploads++;return reply({success:true,file_url:`https://images.example.test/new-logo-${logoUploads}.webp`});}
   if(name==='directoryListingProfile'){
    if(b.action==='private_get')return reply({success:true,profile:profile||base,base,visibility:'public',setup:{},privateContact});
    if(b.action==='save_supplier_private_contact'){savedContact=b;return reply({success:true,privateContact:b.contact})}
    if(b.action==='save'){saveCount++;profile={...b.profile,contact:{}};return reply({success:true,profile})}
    if(b.action==='complete_guided_setup'){completeCount++;return reply({success:true,emailStatus:'awaiting_template_approval'})}
   }
  }
  return reply({success:true});
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/directory/test-supplier/edit?guided=1&access_token=e2e');
 await expect(page.getByTestId('directory-guided-overview')).toBeVisible({timeout:18000});
 await expect(page.getByTestId('setup-step-photograph')).toContainText('business logo');
 await page.getByTestId('setup-step-basics').click();
 await expect(page.getByText('Products supplied (one category per line)')).toBeVisible();
 await expect(page.locator('#basics').getByText('Business / listing name').locator('..').locator('input')).toHaveValue('Celtic Pickleball');
 await expect(page.locator('#basics').getByText('Shop / product catalogue link')).toBeVisible();
 await page.locator('#basics').getByText('Shop / product catalogue link').locator('..').locator('input').fill('https://example.test/catalogue');
 await page.getByRole('button',{name:'Back to checklist'}).click();
 await page.getByTestId('setup-step-photograph').click();
 await expect(page.getByRole('heading',{name:'Your business logo'})).toBeVisible();
 await expect(page.getByText('Replace logo')).toBeVisible();
 await expect(page.getByText('Adjust current logo')).toBeVisible();
 await expect(page.getByText('Or use a logo image URL')).toHaveCount(0);
 await page.getByRole('button',{name:'Adjust current logo'}).click();
 await expect(page.getByLabel('Logo size')).toBeVisible();
 await expect(page.getByLabel('Logo horizontal position')).toBeVisible();
 await page.getByLabel('Logo size').fill('1.2');
 await page.getByTestId('directory-logo-apply').click();
 await expect.poll(()=>logoUploads,{timeout:14000}).toBeGreaterThan(0);
 await expect.poll(()=>profile?.logoUrl,{timeout:14000}).toBe('https://images.example.test/new-logo-1.webp');
 await page.getByRole('button',{name:'Back to checklist'}).click();
 await page.getByTestId('setup-step-contact').click();
 await expect(page.getByText('Your protected supplier contact')).toBeVisible();
 await expect(page.getByText('protected Contact Supplier')).toBeVisible();
 await expect(page.getByText('Use this mobile for WhatsApp')).toHaveCount(0);
 await expect(page.locator('#contact input[type=email]')).toHaveValue(privateContact.email);
 await expect(page.locator('#contact input[placeholder="e.g. 087 123 4567"]')).toHaveValue(privateContact.phone);
 await page.getByLabel('I confirm that this supplier email address is correct.').check();
 await page.getByLabel('I confirm that this supplier mobile / telephone number is correct.').check();
 await page.getByRole('button',{name:/Save & continue|Continue/}).last().click();
 await expect.poll(()=>Boolean(savedContact)).toBe(true);
 expect(savedContact.confirmEmail).toBe(true);
 expect(savedContact.confirmMobile).toBe(true);
 await expect.poll(()=>saveCount).toBeGreaterThan(0);
 expect(profile.contact.email).toBeFalsy();
 await page.reload();
 await expect(page.getByTestId('directory-guided-overview')).toBeVisible({timeout:13000});
 await page.getByTestId('setup-step-basics').click();
 await expect(page.getByText('Shop / product catalogue link').locator('..').locator('input')).toHaveValue('https://example.test/catalogue');
 expect(errors).toEqual([]);
});
