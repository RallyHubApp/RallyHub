import { test, expect } from '@playwright/test';

const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
const now=new Date('2026-09-29T12:30:00Z');
const future=new Date(now.getTime()+30*86400000).toISOString();
const past=new Date(now.getTime()-60000).toISOString();

const trialUser={id:'trial-user-1',email:'david@example.test',full_name:'David Malloy',role:'user',approval_status:'approved',active_tenant_id:'tenant-ashbourne',active_club_id:'club-ashbourne',active_tenant_role:'owner',active_club_role:'member'};
const adminUser={id:'admin-1',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_role:'club_admin',kotc_role:'super_admin'};
const agreement={id:'agreement-1',title:'RallyHub Trial & Evaluation Agreement',version:'0.1-pilot',wording_hash:'hash-1',jurisdiction:'Ireland',body_text:'Trial purpose. Confidentiality. Intellectual property. No sharing with another club. Trial access is time-limited.'};
const application={id:'app-1',club_name:'Ashbourne Pickleball',contact_name:'David Malloy',contact_role:'Club organiser',contact_email:'david@example.test',approx_membership:75,uses_spond:true,intended_use:'Run King of the Court using Spond attendees and publish player results.',requested_capability_keys:['tournament.king_of_the_court','integration.spond'],selected_capability_keys:['tournament.king_of_the_court','integration.spond'],status:'approved',trial_days:30,activation_deadline:new Date(now.getTime()+14*86400000).toISOString(),tenant_id:'tenant-ashbourne',club_id:'club-ashbourne'};
const entitlements=[
 {capability_key:'tournament.king_of_the_court',status:'active',starts_at:now.toISOString(),ends_at:future,entitlement_type:'trial'},
 {capability_key:'integration.spond',status:'active',starts_at:now.toISOString(),ends_at:future,entitlement_type:'trial'},
];

async function install(page,{user=trialUser,state='active'}={}){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','trial-e2e-token'));
  const model={calls:[],application:{...application},journey:{trial_application_id:'app-1',tenant_id:'tenant-ashbourne',club_id:'club-ashbourne',user_id:'trial-user-1',status:'active',activated_at:now.toISOString(),expires_at:future,demo_tournament_id:null,demo_completed_at:null,spond_connected_at:null,first_live_tournament_id:null,first_live_event_completed_at:null,results_published_at:null,liveEventGraceActive:false},trialTournaments:[],mode:state};
  if(state==='expired'){model.application.status='expired';model.application.expires_at=past;model.journey.status='expired';model.journey.expired=true;model.journey.expires_at=past;}
  if(state==='live-grace'){model.application.status='expired';model.application.expires_at=past;model.journey.status='expired';model.journey.expired=true;model.journey.expires_at=past;model.journey.first_live_tournament_id='live-1';model.journey.liveEventGraceActive=true;model.journey.liveSession={id:'session-live-1',status:'in_progress'};model.trialTournaments=[{id:'live-1',name:'Ashbourne Friday KOTC',status:'In Progress',start_date:'2026-09-29',is_demo:false}];}
  const myState=()=>({success:true,hasTrial:true,journey:{...model.journey},application:{...model.application},entitlements:state==='expired'||state==='live-grace'?entitlements.map(e=>({...e,status:'expired',ends_at:past})):entitlements,trialTournaments:[...model.trialTournaments],daysRemaining:state==='active'?30:0});
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
    if(path.includes('/analytics/'))return json(route,{});
    if(path.endsWith('/entities/User/me'))return json(route,user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
    if(fi>=0){
      const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
      model.calls.push({name,body});
      if(name==='securityContext')return json(route,{success:true,context:null});
      if(name==='trialJourney'){
        if(body.action==='public_meta')return json(route,{success:true,defaultTrialDays:30,capabilities:[{key:'tournament.king_of_the_court',name:'King of the Court',category:'tournament_type'},{key:'integration.spond',name:'Spond Integration',category:'integration'}]});
        if(body.action==='public_submit'){model.application={...model.application,status:'submitted',club_name:body.clubName,contact_name:body.contactName,contact_email:body.contactEmail};return json(route,{success:true,applicationId:'app-1',status:'submitted'});}
        if(body.action==='admin_list')return json(route,{success:true,applications:[{...model.application,status:model.application.status==='approved'?'submitted':model.application.status}],capabilities:[{key:'tournament.king_of_the_court',display_name:'King of the Court',trial_eligible:true},{key:'integration.spond',display_name:'Spond Integration',trial_eligible:true}],agreement:{id:'agreement-1',title:agreement.title,version:agreement.version,status:'active'}});
        if(body.action==='admin_approve'){model.application.status='approved';return json(route,{success:true,application:model.application,activationUrl:'https://rallyhub.ie/trial/activate?token=e2e-token',emailSent:true});}
        if(body.action==='activation_state')return json(route,{success:true,application:model.application,agreement});
        if(body.action==='accept_activate'){model.application.status='activated';return json(route,{success:true,journey:model.journey,application:model.application,redirect:'/app'});}
        if(body.action==='my_state')return json(route,myState());
        if(body.action==='create_demo_tournament'){
          if(model.journey.expired)return json(route,{error:'Your RallyHub trial is not active.'},403);
          model.journey.demo_tournament_id='demo-1';model.trialTournaments.push({id:'demo-1',name:'Guided KOTC Demo',status:'Draft',start_date:'2026-09-29',is_demo:true});
          return json(route,{success:true,tournament:{id:'demo-1',name:'Guided KOTC Demo',format:'King of the Court',status:'Draft',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne',description:'RALLYHUB_KOTC_SANDBOX_V1'}});
        }
        if(body.action==='create_live_tournament'){
          if(model.journey.expired)return json(route,{error:'Your RallyHub trial is not active.'},403);
          model.journey.first_live_tournament_id='live-1';model.trialTournaments.push({id:'live-1',name:body.name||'My First King of the Court',status:'Draft',start_date:'2026-09-29',is_demo:false});
          return json(route,{success:true,tournament:{id:'live-1',name:body.name||'My First King of the Court',format:'King of the Court',status:'Draft',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne'}});
        }
        if(body.action==='mark_progress'){model.journey[body.key]=new Date().toISOString();return json(route,{success:true,journey:model.journey});}
        return json(route,{success:true});
      }
      if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[],currentAccessRole:'session_host',isAdmin:false});
      return json(route,{success:true});
    }
    const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
    if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity]=rest.split('/').map(decodeURIComponent);
      if(req.method()==='GET'){
        if(entity==='ClubUserAccess')return json(route,user.role==='admin'?[]:[{id:'club-access-1',tenant_id:'tenant-ashbourne',club_id:'club-ashbourne',user_id:'trial-user-1',permission_bundle:'member',status:'active',starts_at:now.toISOString(),ends_at:future}]);
        if(entity==='KotcSessionAccess')return json(route,[]);
        if(entity==='DirectoryListingAccess')return json(route,[]);
        if(entity==='Tournament')return json(route,model.trialTournaments.map(t=>({...t,format:'King of the Court',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne',player_ids:[],kotc_guest_roster:[]})));
        if(entity==='Player')return json(route,[]);
        if(entity==='Club')return json(route,[{id:'club-ashbourne',tenant_id:'tenant-ashbourne',name:'Ashbourne Pickleball',status:'active'}]);
        return json(route,[]);
      }
      return json(route,{});
    }
    return json(route,{});
  });
  return model;
}

async function noOverflow(page){const n=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(n).toBeLessThanOrEqual(1);}

test('public controlled-trial application captures authority and KOTC + Spond intent',async({page})=>{
  const model=await install(page,{user:trialUser});
  await page.goto('/trial/apply');
  await expect(page.getByRole('heading',{name:'Apply for a RallyHub trial'})).toBeVisible();
  await page.getByLabel('Club name').fill('Ashbourne Pickleball');
  await page.getByLabel('Your name').fill('David Malloy');
  await page.getByLabel('Role in the club').fill('Club organiser');
  await page.getByLabel('Email').fill('david@example.test');
  await page.getByLabel('Approx. club membership').fill('75');
  await page.getByLabel('How do you plan to use the trial?').fill('Run King of the Court from Spond and share player results.');
  await page.getByText(/I confirm that I am authorised/).click();
  await page.getByRole('button',{name:'Submit trial application'}).click();
  await expect(page.getByRole('heading',{name:'Application received'})).toBeVisible();
  const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='public_submit');
  expect(call.body.authorityConfirmed).toBe(true);expect(call.body.requestedCapabilityKeys).toContain('tournament.king_of_the_court');expect(call.body.requestedCapabilityKeys).toContain('integration.spond');
});

test('Super Admin can approve the controlled KOTC + Spond scope and issue activation',async({page})=>{
  const model=await install(page,{user:adminUser});
  await page.goto('/app/trials');
  await expect(page.getByRole('heading',{name:'External club trials'})).toBeVisible();
  await expect(page.getByText('Ashbourne Pickleball')).toBeVisible();
  await page.getByRole('button',{name:'Approve KOTC + Spond'}).click();
  await expect(page.getByText(/https:\/\/rallyhub\.ie\/trial\/activate\?token=e2e-token/)).toBeVisible();
  const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='admin_approve');
  expect(call.body.selectedCapabilityKeys).toEqual(['tournament.king_of_the_court','integration.spond']);
});

test('approved club must explicitly accept all Trial & Evaluation Agreement confirmations before activation',async({page})=>{
  const model=await install(page,{user:trialUser});
  await page.goto('/trial/activate?token=e2e-token');
  await expect(page.getByRole('heading',{name:'Ashbourne Pickleball'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'RallyHub Trial & Evaluation Agreement'})).toBeVisible();
  const activate=page.getByRole('button',{name:'Accept & Activate Trial'});await expect(activate).toBeDisabled();
  for(const text of ['I confirm that I am authorised','I have read and accept','must not be shared','RallyHub retains its intellectual property'])await page.getByText(new RegExp(text,'i')).click();
  await expect(activate).toBeEnabled();await activate.click();
  await expect(page).toHaveURL(/\/app$/);
  const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='accept_activate');
  expect(call.body.authorityConfirmed&&call.body.termsAccepted&&call.body.restrictedSharingConfirmed&&call.body.ipAcknowledged).toBe(true);
});

test('active trial gets a narrow onboarding portal and cannot browse normal admin/member modules',async({page})=>{
  await install(page,{user:trialUser});
  await page.goto('/app');
  await expect(page.getByRole('heading',{name:'Welcome to your King of the Court trial'})).toBeVisible();
  await expect(page.getByText('30 days')).toBeVisible();
  await expect(page.getByText('Complete the guided KOTC demo')).toBeVisible();
  await page.goto('/app/admin');
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading',{name:'Welcome to your King of the Court trial'})).toBeVisible();
  await noOverflow(page);
});

test('trial portal creates isolated demo first, then a real KOTC, and shows Spond/results guidance',async({page})=>{
  const model=await install(page,{user:trialUser});
  await page.goto('/app');
  await page.getByRole('button',{name:'Create guided demo'}).click();
  await expect(page).toHaveURL(/\/app\/tournaments\/demo-1$/);
  expect(model.calls.some(c=>c.name==='trialJourney'&&c.body.action==='create_demo_tournament')).toBe(true);
  await page.goto('/app');
  await page.getByDisplayValue('My First King of the Court').fill('Ashbourne Friday KOTC');
  await page.getByRole('button',{name:'Create event'}).click();
  await expect(page).toHaveURL(/\/app\/tournaments\/live-1$/);
  expect(model.calls.some(c=>c.name==='trialJourney'&&c.body.action==='create_live_tournament')).toBe(true);
});

test.describe('trial portal mobile',()=>{
  test.use({viewport:{width:390,height:844}});
  test('onboarding remains usable without horizontal scrolling',async({page})=>{await install(page,{user:trialUser});await page.goto('/app');await expect(page.getByText('Your setup checklist')).toBeVisible();await noOverflow(page);});
});

test('expired trial blocks new work and shows retained-history state with no automatic conversion',async({page})=>{
  const model=await install(page,{user:trialUser,state:'expired'});
  await page.goto('/app');
  await expect(page.getByRole('heading',{name:'Your RallyHub trial has ended'})).toBeVisible();
  await expect(page.getByText(/no automatic paid conversion/i)).toBeVisible();
  await expect(page.getByRole('button',{name:'Create guided demo'})).toHaveCount(0);
  await page.goto('/app/tournaments/live-1');
  await expect(page).toHaveURL(/\/app$/);
  expect(model.calls.some(c=>c.body?.action==='create_live_tournament')).toBe(false);
});

test('expiry does not cut off a KOTC already live before the entitlement boundary',async({page})=>{
  await install(page,{user:trialUser,state:'live-grace'});
  await page.goto('/app');
  await expect(page.getByRole('heading',{name:'Your RallyHub trial has ended'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Finish live KOTC event'})).toBeVisible();
  await page.getByRole('button',{name:'Finish live KOTC event'}).click();
  await expect(page).toHaveURL(/\/app\/tournaments\/live-1$/);
});
