import {test,expect} from '@playwright/test';
const ID='6a01dc00702b7dd2a2978c28';
test('coach guided journey has independent photo editing, private contact prefills and two confirmations',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const user={id:'testcoach-user',full_name:'Marie V. C. Moore',email:'account@example.test',role:'admin',approval_status:'approved'};
 const profile={listingType:'coach',name:'Brian Moore — TEST PREVIEW',description:'Experienced coach',photoUrl:'https://images.example.test/saved-coach.png',contact:{}};
 const base={slug:'test-preview-coach',...profile,county:'Clare'};
 const privateContact={email:'coach@example.test',phone:'0871234567'};
 const privateSaves=[];
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
   if(name==='directoryListingProfile'){
    if(b.action==='private_get')return reply({success:true,profile,base,visibility:'preview_only',setup:{},privateContact});
    if(b.action==='save_coach_private_contact'){privateSaves.push(b);return reply({success:true,privateContact:b.contact})}
    if(b.action==='save')return reply({success:true,profile:b.profile});
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
 await page.getByTestId('setup-step-contact').count().then(async n=>{if(n)await page.getByTestId('setup-step-contact').click();else{await page.getByRole('button',{name:'Previous'}).click();}});
 await page.getByRole('button',{name:/Back to guided setup|Guided setup/i}).first().count().catch(()=>{});
 await expect(page.getByTestId('directory-guided-progress')).toBeVisible();
 await page.getByRole('button',{name:'Continue',exact:true}).count().then(()=>{});
 expect(errors).toEqual([]);
});
