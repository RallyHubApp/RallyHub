import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'sandra-e2e',email:'sandra@example.test',full_name:'Sandra Example',role:'user',approval_status:'approved'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

const holidayBase={
  id:'sandras-pickleball-passports',slug:'sandras-pickleball-passports',name:"Sandra's Pickleball Passports",
  listingType:'holidays',listingCategoryLabel:'Pickleball holidays & experiences',serviceArea:'Ireland & Portugal',
  description:'Pickleball holidays and experiences for players who want travel, play and connection.',
  website:'https://fourpointtravelgroup.com',facebook:'',instagram:'https://instagram.com/sandra',
  contact:{name:'Sandra',email:'sandra@example.test',phone:'+353860488146',whatsapp:'https://wa.me/353860488146'},
  venues:[],sessions:[]
};

async function installBackend(page,{forAdd=false}={}){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','nonclub-guided-e2e'));
  const calls=[];
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    const reply=(body,status=200)=>json(route,body,status);
    if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
    if(path.includes('/analytics/'))return reply({});
    if(path.endsWith('/entities/User/me'))return reply(user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`;
    const idx=path.indexOf(fnMarker);
    if(idx>=0){
      const name=decodeURIComponent(path.slice(idx+fnMarker.length).split('/')[0]);
      let body={};try{body=req.postDataJSON()||{}}catch{}
      calls.push({name,body});
      if(name==='securityContext')return reply({success:true,context:null});
      if(name==='directoryCategory')return reply({success:true,categories:[
        {key:'club',label:'Club / place to play',pluralLabel:'Clubs & places to play',active:true,sortOrder:10,clubFirst:true,locationMode:'county',showListingForm:true},
        {key:'tournaments_events',label:'Tournament / event organiser',pluralLabel:'Tournaments & events',active:true,sortOrder:20,locationMode:'service_area',showListingForm:true},
        {key:'coaching',label:'Coach / coaching',pluralLabel:'Coaching',active:true,sortOrder:30,locationMode:'service_area',showListingForm:true},
        {key:'holidays',label:'Pickleball holiday',pluralLabel:'Pickleball holidays',active:true,sortOrder:40,locationMode:'service_area',showListingForm:true},
        {key:'equipment',label:'Equipment / supplier',pluralLabel:'Equipment & suppliers',active:true,sortOrder:50,locationMode:'none',showListingForm:true},
        {key:'other',label:'Other pickleball service',pluralLabel:'Other pickleball services',active:true,sortOrder:90,locationMode:'service_area',showListingForm:true},
      ]});
      if(name==='directoryClaim'){
        if(body.action==='new_status')return reply({success:true,request:null});
        if(body.action==='status')return reply({success:true,hasAccess:true,accessRole:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,verificationStatus:'verified'}});
        if(body.action==='submit_new')return reply({success:true,status:'approved',listingSlug:holidayBase.slug,setupDraft:true,request:{status:'approved',approved_listing_slug:holidayBase.slug}});
        if(body.action==='set_visibility')return reply({success:true,listingSlug:holidayBase.slug,visibility:'public'});
        return reply({success:true});
      }
      if(name==='directoryListingProfile'){
        if(body.action==='public_list')return reply({success:true,listings:[]});
        if(body.action==='private_get')return reply({success:true,listingSlug:holidayBase.slug,visibility:'preview_only',verificationStatus:'verified',profile:null,base:holidayBase});
        if(body.action==='save')return reply({success:true,profile:body.profile,id:'profile-1'});
        return reply({success:true,profile:null,base:null});
      }
      if(name==='directoryEvents'){
        if(body.action==='list')return reply({success:true,canManage:true,role:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,listingType:'holidays',serviceArea:'Ireland & Portugal',visibility:'preview_only',profile:{contact:holidayBase.contact,website:holidayBase.website,instagram:holidayBase.instagram,facebook:'',logoUrl:''}},host:{id:'host-sandra',name:holidayBase.name},tenant:{id:'tenant-sandra'},events:[],venues:[]});
        if(body.action==='save')return reply({success:true,event:{id:'event-sandra',...body.event},listingPublished:body.mode==='publish'});
        return reply({success:true});
      }
      if(name==='eventEngagement')return reply({success:true,items:[]});
      if(name==='secureCreditAction')return reply({success:true,file_url:'https://files.example.test/poster.webp'});
      return reply({success:true});
    }
    const entityMarker=`/api/apps/${APP_ID}/entities/`;
    if(path.includes(entityMarker))return reply([]);
    return reply({});
  });
  return calls;
}

test('non-club organiser chooses holiday setup, autosaves and continues straight into guided setup',async({page})=>{
  const calls=await installBackend(page,{forAdd:true});
  await page.goto('/directory/add');
  await expect(page.getByText('What are you setting up?')).toBeVisible();
  await page.locator('input[type=radio][value="holidays"]').check();
  await expect(page.getByText('Pickleball holiday / experience',{exact:true})).toBeVisible();
  await page.getByLabel('Club, business or listing name').fill("Sandra's Pickleball Passports");
  await page.getByLabel(/Area, destination or service coverage/).fill('Ireland & Portugal');
  await page.getByLabel('Website').fill('https://fourpointtravelgroup.com');
  await page.getByLabel('Instagram').fill('https://instagram.com/sandra');
  await page.getByLabel('Your role / connection').fill('Travel organiser');
  await expect(page.getByText('Your progress is automatically saved on this device while you complete the form.')).toBeVisible();
  await page.waitForTimeout(450);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallyhub-directory-add-draft-v2:sandra-e2e')||'null'));
  expect(saved?.listingType).toBe('holidays');
  expect(saved?.clubName).toBe("Sandra's Pickleball Passports");
  await page.getByRole('button',{name:'Save & continue'}).click();
  await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/edit\?created=1&guided=1/);
  const submit=calls.find(c=>c.name==='directoryClaim'&&c.body.action==='submit_new');
  expect(submit?.body.listingType).toBe('holidays');
  expect(submit?.body.claimantPhone).toBe('');
});

test('non-club guided editor has five simple steps and can publish its private setup draft',async({page})=>{
  const calls=await installBackend(page);
  await page.goto('/directory/sandras-pickleball-passports/edit?guided=1');
  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5: About you');
  await expect(page.locator('#basics')).toBeVisible();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5: Contact & social');
  await expect(page.getByLabel('Website (optional)')).toHaveValue('https://fourpointtravelgroup.com');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 3 of 5: Where you operate');
  await expect(page.getByLabel(/Area, destination or service coverage/)).toHaveValue('Ireland & Portugal');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 4 of 5: Your event');
  await expect(page.getByRole('button',{name:'Continue to your event'}).first()).toBeVisible();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 5 of 5: Review & finish');
  await expect(page.getByRole('button',{name:'Publish listing'})).toBeVisible();
  await page.getByRole('button',{name:'Publish listing'}).click();
  await expect.poll(()=>calls.some(c=>c.name==='directoryClaim'&&c.body.action==='set_visibility'&&c.body.visibility==='public')).toBeTruthy();
  await expect(page.getByRole('button',{name:'View public listing'})).toBeVisible();
});

test('guided holiday event reuses organiser details, stores collaborator on the one event and publishes listing with it',async({page})=>{
  const calls=await installBackend(page);
  await page.goto('/directory/sandras-pickleball-passports/events?guided=1');
  await expect(page.getByTestId('directory-event-guided-start')).toContainText('Your listing details are ready');
  await expect(page.getByTestId('directory-event-guided-start')).toContainText('When you publish the event, RallyHub will also make your organiser listing live.');
  await expect(page.getByLabel('Event type')).toHaveValue('holiday');
  await expect(page.getByLabel('Organiser email')).toHaveValue('sandra@example.test');
  await expect(page.getByLabel('Organiser mobile')).toHaveValue('+353860488146');
  await page.getByLabel('Event name').fill("Sandra's Pickleball Passports · Carvoeiro");
  await page.getByLabel('Starts').fill('2027-05-14');
  await page.getByLabel('Ends').fill('2027-05-18');
  await page.getByLabel('Venue / location').fill('Rocha Brava Racquet Club, Carvoeiro');
  await page.getByLabel('Country').fill('Portugal');
  await page.getByLabel('Registration method').selectOption('contact');
  await page.getByRole('button',{name:'Add collaborator'}).click();
  await page.getByLabel('Collaborator 1 name').fill('Pickleball Escapes');
  await page.getByLabel('Collaborator 1 role').fill('In collaboration with');
  await page.getByLabel('Collaborator 1 link').fill('https://rallyhub.ie/directory/pickleball-escapes');
  await page.getByRole('button',{name:'Publish to RallyHub Events'}).click();
  await expect(page.getByText('Event published + organiser listing live ✓')).toBeVisible();
  const save=calls.find(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish');
  expect(save).toBeTruthy();
  expect(save.body.event.event_collaborators).toEqual([{name:'Pickleball Escapes',role:'In collaboration with',url:'https://rallyhub.ie/directory/pickleball-escapes',listing_slug:'pickleball-escapes'}]);
  expect(calls.filter(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish')).toHaveLength(1);
});
