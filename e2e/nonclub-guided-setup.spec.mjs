import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'sandra-e2e',email:'smartertravel77@gmail.com',full_name:'Sandra',role:'user',approval_status:'approved'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

const holidayBase={
  id:'sandras-pickleball-passports',slug:'sandras-pickleball-passports',name:"Sandra's Pickleball Passports",
  listingType:'holidays',listingCategoryLabel:'Pickleball holidays & experiences',serviceArea:'Ireland & Portugal',
  description:'Pickleball holidays and experiences for players who want travel, play and connection.',
  website:'',facebook:'',instagram:'https://www.instagram.com/p/Dewzng0O6j2/',
  contact:{name:'Sandra',email:'smartertravel77@gmail.com',phone:'+353860488146',whatsapp:'https://wa.me/353860488146'},
  venues:[],sessions:[]
};
const sandraSetup={identity:{requiresConfirmation:true,confirmed:false,personName:'Sandra',allowOwnName:true,allowCustom:true,candidates:[{name:'Smarter Travel',source:'Name used on your travel/social presence'},{name:"Sandra's Pickleball Passports",source:'Name used on the Carvoeiro pickleball trip'}]}};
const sandraEvent={
  id:'event-sandra',name:"Sandra's Pickleball Passports · Carvoeiro, Portugal",event_slug:'sandras-pickleball-passports-carvoeiro-2027',
  start_date:'2027-05-14',end_date:'2027-05-18',location:'Rocha Brava Racquet Club, Carvoeiro',event_country:'Portugal',event_county:'Algarve',event_category:'holiday',
  event_public_summary:'Four nights in Carvoeiro with 18 hours of hosted pickleball and coaching, welcome drinks, a three-course group dinner and a fun tournament at Rocha Brava Racquet Club.',
  event_registration_mode:'contact',event_registration_url:'',event_fee_text:'£815 / €950 per person, based on two sharing a one-bedroom apartment.',event_contact:'smartertravel77@gmail.com',event_contact_phone:'+353860488146',
  event_eligibility:'Designed for pickleball-loving women aged 60+.',event_player_info:'Come alone or with a friend. Non-playing partners are welcome. Single supplements and additional nights are available on request. Flights and transfers are extra.',
  event_source_url:'https://www.instagram.com/p/Dewzng0O6j2/',event_publish_status:'draft',event_public_visible:false,event_member_visible:false,
  event_collaborators:[{name:'Pickleball Escapes',role:'In collaboration with',url:'',listing_slug:''}],status:'Draft'
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
        if(body.action==='private_get')return reply({success:true,listingSlug:holidayBase.slug,visibility:'preview_only',verificationStatus:'verified',profile:null,base:holidayBase,setup:sandraSetup});
        if(body.action==='confirm_identity')return reply({success:true,listingSlug:holidayBase.slug,publicName:body.publicName,setup:{identity:{...sandraSetup.identity,requiresConfirmation:false,confirmed:true,selectedPublicName:body.publicName}}});
        if(body.action==='save')return reply({success:true,profile:body.profile,id:'profile-1'});
        return reply({success:true,profile:null,base:null});
      }
      if(name==='directoryEvents'){
        if(body.action==='list')return reply({success:true,canManage:true,role:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,listingType:'holidays',serviceArea:'Ireland & Portugal',visibility:'preview_only',profile:{contact:holidayBase.contact,website:holidayBase.website,instagram:holidayBase.instagram,facebook:'',logoUrl:''}},host:{id:'host-sandra',name:holidayBase.name},tenant:{id:'tenant-sandra'},events:[sandraEvent],venues:[]});
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
  await page.getByLabel('Instagram').fill('https://www.instagram.com/p/Dewzng0O6j2/');
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

test('personalised guided overview shows what RallyHub already knows and continues to Sandra’s first unfinished item',async({page})=>{
  await installBackend(page);
  await page.goto('/directory/sandras-pickleball-passports/edit?guided=1');
  const overview=page.getByTestId('directory-guided-overview');
  await expect(overview).toBeVisible();
  await expect(overview.getByText('Sandra, we’ve already started this for you.')).toBeVisible();
  await expect(overview.getByText('3 of 6 ready')).toBeVisible();
  await expect(page.getByTestId('setup-step-identity')).toContainText('Needs check');
  await expect(page.getByTestId('setup-step-basics')).toContainText('Ready');
  await expect(page.getByTestId('setup-step-contact')).toContainText('Ready');
  await expect(page.getByTestId('setup-step-location')).toContainText('Ready');
  await expect(page.getByTestId('setup-step-events')).toContainText('Started');
  await expect(page.getByTestId('setup-step-events')).toContainText("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  await page.getByRole('button',{name:'Continue setup'}).click();
  await expect(page.getByTestId('directory-identity-step')).toBeVisible();
  await expect(page.getByText('Which name should players see?')).toBeVisible();
  await expect(page.getByText('Smarter Travel',{exact:true})).toBeVisible();
  await expect(page.getByTestId('directory-identity-step').getByText("Sandra's Pickleball Passports",{exact:true})).toBeVisible();
  await page.locator('input[name="identityChoice"][value="Smarter Travel"]').check();
  await page.getByRole('button',{name:'Confirm & continue'}).click();
  await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  await expect(page.getByText("Editing: Sandra's Pickleball Passports · Carvoeiro, Portugal")).toBeVisible();
  await expect(page.getByLabel('Starts')).toHaveValue('2027-05-14');
  await expect(page.getByLabel('Ends')).toHaveValue('2027-05-18');
  await expect(page.getByLabel('Venue / location')).toHaveValue('Rocha Brava Racquet Club, Carvoeiro');
});

test('Sandra email deep-link skips completed work, preserves the prefilled event and publishes one canonical collaboration',async({page})=>{
  const calls=await installBackend(page);
  await page.goto('/directory/sandras-pickleball-passports/edit?guided=1&continue=1');
  await expect(page.getByTestId('directory-identity-step')).toBeVisible();
  await page.locator('input[name="identityChoice"][value="Sandra\'s Pickleball Passports"]').check();
  await page.getByRole('button',{name:'Confirm & continue'}).click();
  await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  await expect(page.getByLabel('Event type')).toHaveValue('holiday');
  await expect(page.getByLabel('Event name')).toHaveValue("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  await expect(page.getByLabel('Organiser email')).toHaveValue('smartertravel77@gmail.com');
  await expect(page.getByLabel('Organiser mobile')).toHaveValue('+353860488146');
  await expect(page.getByLabel('Registration method')).toHaveValue('contact');
  await expect(page.getByLabel('Collaborator 1 name')).toHaveValue('Pickleball Escapes');
  await expect(page.getByLabel('Collaborator 1 role')).toHaveValue('In collaboration with');
  await expect(page.getByLabel('Entry fee / fee text')).toHaveValue('£815 / €950 per person, based on two sharing a one-bedroom apartment.');
  await page.getByLabel('Collaborator 1 link').fill('https://rallyhub.ie/directory/pickleball-escapes');
  await page.getByRole('button',{name:'Publish to RallyHub Events'}).click();
  await expect(page.getByText('Event published + organiser listing live ✓')).toBeVisible();
  const identityConfirm=calls.find(c=>c.name==='directoryListingProfile'&&c.body.action==='confirm_identity');
  expect(identityConfirm?.body.publicName).toBe("Sandra's Pickleball Passports");
  const save=calls.find(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish');
  expect(save).toBeTruthy();
  expect(save.body.event.event_collaborators).toEqual([{name:'Pickleball Escapes',role:'In collaboration with',url:'https://rallyhub.ie/directory/pickleball-escapes',listing_slug:'pickleball-escapes'}]);
  expect(calls.filter(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish')).toHaveLength(1);
});
