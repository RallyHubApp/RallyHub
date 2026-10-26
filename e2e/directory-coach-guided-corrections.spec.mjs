import {test,expect} from '@playwright/test';
const ID='6a01dc00702b7dd2a2978c28';
test('coach guided journey has independent photo editing, private contact prefills and two confirmations',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const user={id:'testcoach-user',full_name:'Marie V. C. Moore',email:'account@example.test',role:'admin',approval_status:'approved'};
 const profile={listingType:'coach',name:'Brian Moore — TEST PREVIEW',description:'Experienced coach',photoUrl:'https://images.example.test/saved-coach.png',contact:{}};
 const base={slug:'test-preview-coach',...profile,county:'Clare'};
 let privateContact={email:'coach@example.test',phone:'0871234567'};
 const privateSaves=[];let savedProfile=null;let imageUploads=0;
 await page.route('https://images.example.test/saved-coach.png',route=>route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64')}));
 await page.route('**/api/apps/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path.includes('/public-settings/'))return reply({id:ID,public_settings:{}});
  if(path.endsWith('/entities/User/me'))return reply(user);
  if(path.includes('/analytics/'))return reply({});
  const marker=`/api/apps/${ID}/functions/`;
  if(path.includes(marker)){
   const name=path.split(marker)[1].split('/')[0];let b={};try{b=route.request().postDataJSON()||{}}catch{}
   if(name==='securityContext')return reply({success:true,context:null});
   if(name==='directoryClaim')return reply({success:true,hasAccess:true,listing:{verificationStatus:'verified'},accessRole:'owner'});
   if(name==='directoryEvents')return reply({success:true,events:[]});
   if(name==='secureCreditAction'){imageUploads++;return reply({success:true,file_url:`https://images.example.test/edited-${imageUploads}.webp`});}
   if(name==='directoryListingProfile'){
    if(b.action==='private_get')return reply({success:true,profile:savedProfile||profile,base,visibility:'preview_only',setup:{},privateContact});
    if(b.action==='save_coach_private_contact'){privateSaves.push(b);privateContact=b.contact;return reply({success:true,privateContact:b.contact})}
    if(b.action==='save'){savedProfile={...b.profile,contact:{name:null,email:null,phone:null,whatsapp:null}};return reply({success:true,profile:savedProfile});}
    return reply({success:true,profile,base});
   }
  }
  return reply({success:true});
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/directory/test-preview-coach/edit?guided=1&access_token=e2e');
 await expect(page.getByTestId('directory-editor-mode')).toBeVisible({timeout:12000});
 await expect(page.locator('nav').getByText('Enhance listing')).toHaveCount(0);
 await expect(page.getByTestId('setup-step-photograph')).toBeVisible();
 await page.getByTestId('setup-step-photograph').click();
 await expect(page.getByTestId('directory-coach-photograph-step')).toBeVisible();
 await expect(page.getByTestId('edit-saved-coach-photo')).toBeVisible();
 await expect(page.getByText(/Or use a photograph image URL/)).toHaveCount(0);
 await page.getByTestId('edit-saved-coach-photo').click();
 await expect(page.getByLabel('Photograph size')).toBeVisible();
 await expect(page.getByLabel('Photograph horizontal position')).toBeVisible();
 await expect(page.getByLabel('Photograph vertical position')).toBeVisible();
 await page.getByLabel('Photograph size').fill('1.2');
 await page.getByLabel('Photograph horizontal position').fill('20');
 await page.getByTestId('directory-logo-apply').click();
 await expect.poll(()=>imageUploads).toBe(1);
 await expect.poll(()=>savedProfile?.photoCrop?.zoom,{timeout:11000}).toBe(1.2);
 expect(savedProfile.photoSourceUrl).toBe('https://images.example.test/saved-coach.png');
 expect(savedProfile.photoCrop.offsetX).toBe(20);
 expect(savedProfile.photoUrl).toBe('https://images.example.test/edited-1.webp');
 // Reload as the coach and confirm that the original source and adjustment controls survive.
 await page.reload();
 await expect(page.getByTestId('setup-step-photograph')).toBeVisible({timeout:10000});
 await page.getByTestId('setup-step-photograph').click();
 await page.getByTestId('edit-saved-coach-photo').click();
 await expect(page.getByLabel('Photograph size')).toHaveValue('1.2');
 await expect(page.getByLabel('Photograph horizontal position')).toHaveValue('20');
 await page.getByRole('button',{name:'Back to checklist'}).click();
 await page.getByTestId('setup-step-contact').click();
 await expect(page.locator('#contact')).toBeVisible();
 await expect(page.getByText('Use this mobile for WhatsApp')).toHaveCount(0);
 await expect(page.getByText('Coach name (private contact)').locator('..').locator('input')).toHaveValue('Marie V. C. Moore');
 await expect(page.getByText('Coaching email address',{exact:true}).locator('..').locator('input')).toHaveValue('coach@example.test');
 await expect(page.getByText('Coaching mobile number',{exact:true}).locator('..').locator('input')).toHaveValue('0871234567');
 await page.getByText('Coaching email address',{exact:true}).locator('..').locator('input').fill('updatedcoach@example.test');
 await page.getByLabel('I confirm that my coaching email address is correct.').check();
 await page.getByLabel('I confirm that my coaching mobile number is correct.').check();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect.poll(()=>privateSaves.length).toBe(1);
 expect(privateSaves[0].contact.email).toBe('updatedcoach@example.test');
 expect(privateSaves[0].contact.name).toBe('Marie V. C. Moore');
 expect(privateSaves[0].confirmEmail).toBe(true);
 expect(privateSaves[0].confirmMobile).toBe(true);
 await page.getByRole('button',{name:'Previous'}).click();
 await expect(page.getByText('Coaching email address',{exact:true}).locator('..').locator('input')).toHaveValue('updatedcoach@example.test');
 expect(savedProfile?.contact?.email).toBe(null); // public profile still contains no private coach email
 expect(errors).toEqual([]);
});
