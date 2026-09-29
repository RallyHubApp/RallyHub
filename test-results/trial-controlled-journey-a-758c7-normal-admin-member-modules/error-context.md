# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trial-controlled-journey.spec.mjs >> active trial gets a narrow onboarding portal and cannot browse normal admin/member modules
- Location: e2e/trial-controlled-journey.spec.mjs:119:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('30 days')
Expected: visible
Error: strict mode violation: getByText('30 days') resolved to 2 elements:
    1) <span data-dynamic-content="true" data-source-location="src/pages/TrialPortal.jsx:21:410" class="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary sm:inline">30 days remaining</span> aka getByText('days remaining')
    2) <p data-dynamic-content="true" class="mt-3 text-3xl font-black" data-source-location="src/pages/TrialPortal.jsx:21:1678">…</p> aka getByText('30 days', { exact: true })

Call log:
  - Expect "toBeVisible" getByText('30 days') with timeout 3000ms
  - waiting for getByText('30 days')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: RallyHub trial
          - paragraph [ref=e8]: Ashbourne Pickleball
        - generic [ref=e9]:
          - generic [ref=e10]: 30 days remaining
          - button "Refresh progress" [ref=e11] [cursor=pointer]
          - button "Sign out" [ref=e17] [cursor=pointer]
    - main [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e28]:
          - heading "Welcome to your King of the Court trial" [level=1] [ref=e29]
          - paragraph [ref=e30]: Start with the isolated demo. Then connect/import from Spond if enabled, create your real event, run it from the host view and publish the results. Demo data stays separate from real club statistics.
        - generic [ref=e31]:
          - paragraph [ref=e36]: Trial access
          - paragraph [ref=e37]: 30 days
          - paragraph [ref=e38]: Ends 29/10/2026, 12:30:00
          - generic [ref=e39]:
            - generic [ref=e40]: King of the Court
            - generic [ref=e41]: Spond Integration
      - generic [ref=e42]:
        - generic [ref=e44]:
          - heading "Your setup checklist" [level=2] [ref=e45]
          - paragraph [ref=e46]: Work through these in order. RallyHub will update progress as real activity appears.
        - generic [ref=e47]:
          - generic [ref=e53]:
            - paragraph [ref=e54]: Trial accepted & activated
            - paragraph [ref=e55]: Agreement accepted. Trial access is active until 29/10/2026.
          - generic [ref=e60]:
            - paragraph [ref=e61]: 1. Complete the guided KOTC demo
            - paragraph [ref=e62]: A 16-player, 4-court synthetic event lets you learn the host flow without sending emails or touching club statistics.
            - button "Create guided demo" [ref=e64] [cursor=pointer]
          - generic [ref=e69]:
            - paragraph [ref=e70]: 2. Connect / import from Spond
            - paragraph [ref=e71]: Spond is enabled for this trial. Open your real KOTC setup and use the existing Spond import flow; RallyHub keeps the import inside this club tenant.
          - generic [ref=e76]:
            - paragraph [ref=e77]: 3. Create your first real King of the Court
            - paragraph [ref=e78]: Create the event here, then add/import players, configure courts/rounds and start only when you are happy with the setup.
            - generic [ref=e80]:
              - textbox [ref=e81]: My First King of the Court
              - button "Create event" [ref=e82] [cursor=pointer]
          - generic [ref=e87]:
            - paragraph [ref=e88]: 4. Run and finish the real event
            - paragraph [ref=e89]: Use the dedicated host screen for round setup, start, scoring, replacements, leaderboard and finish. Player links and Live Event View are part of the KOTC entitlement.
          - generic [ref=e94]:
            - paragraph [ref=e95]: 5. Publish / send results
            - paragraph [ref=e96]: When the event is complete, review the podium/results, create the player link and use the existing results-send workflow.
      - generic [ref=e97]:
        - button "Host Quick Start" [ref=e99] [cursor=pointer]
        - button "Player Link Quick Start" [ref=e103] [cursor=pointer]
        - button "Results Quick Start" [ref=e107] [cursor=pointer]
      - generic [ref=e110]: Your trial is tenant-scoped and time-limited. Access is checked server-side; hiding menus is not the security boundary. A KOTC session created while the trial is active has a short event-specific grace window so a live event is not cut off at the exact expiry minute.
  - contentinfo "RallyHub copyright" [ref=e114]:
    - generic [ref=e115]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  23  |   const myState=()=>({success:true,hasTrial:true,journey:{...model.journey},application:{...model.application},entitlements:state==='expired'||state==='live-grace'?entitlements.map(e=>({...e,status:'expired',ends_at:past})):entitlements,trialTournaments:[...model.trialTournaments],daysRemaining:state==='active'?30:0});
  24  |   await page.route('**/api/apps/**',async route=>{
  25  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  26  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  27  |     if(path.includes('/analytics/'))return json(route,{});
  28  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  29  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
  30  |     if(fi>=0){
  31  |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
  32  |       model.calls.push({name,body});
  33  |       if(name==='securityContext')return json(route,{success:true,context:null});
  34  |       if(name==='trialJourney'){
  35  |         if(body.action==='public_meta')return json(route,{success:true,defaultTrialDays:30,capabilities:[{key:'tournament.king_of_the_court',name:'King of the Court',category:'tournament_type'},{key:'integration.spond',name:'Spond Integration',category:'integration'}]});
  36  |         if(body.action==='public_submit'){model.application={...model.application,status:'submitted',club_name:body.clubName,contact_name:body.contactName,contact_email:body.contactEmail};return json(route,{success:true,applicationId:'app-1',status:'submitted'});}
  37  |         if(body.action==='admin_list')return json(route,{success:true,applications:[{...model.application,status:model.application.status==='approved'?'submitted':model.application.status}],capabilities:[{key:'tournament.king_of_the_court',display_name:'King of the Court',trial_eligible:true},{key:'integration.spond',display_name:'Spond Integration',trial_eligible:true}],agreement:{id:'agreement-1',title:agreement.title,version:agreement.version,status:'active'}});
  38  |         if(body.action==='admin_approve'){model.application.status='approved';return json(route,{success:true,application:model.application,activationUrl:'https://rallyhub.ie/trial/activate?token=e2e-token',emailSent:true});}
  39  |         if(body.action==='activation_state')return json(route,{success:true,application:model.application,agreement});
  40  |         if(body.action==='accept_activate'){model.application.status='activated';return json(route,{success:true,journey:model.journey,application:model.application,redirect:'/app'});}
  41  |         if(body.action==='my_state')return json(route,myState());
  42  |         if(body.action==='create_demo_tournament'){
  43  |           if(model.journey.expired)return json(route,{error:'Your RallyHub trial is not active.'},403);
  44  |           model.journey.demo_tournament_id='demo-1';model.trialTournaments.push({id:'demo-1',name:'Guided KOTC Demo',status:'Draft',start_date:'2026-09-29',is_demo:true});
  45  |           return json(route,{success:true,tournament:{id:'demo-1',name:'Guided KOTC Demo',format:'King of the Court',status:'Draft',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne',description:'RALLYHUB_KOTC_SANDBOX_V1'}});
  46  |         }
  47  |         if(body.action==='create_live_tournament'){
  48  |           if(model.journey.expired)return json(route,{error:'Your RallyHub trial is not active.'},403);
  49  |           model.journey.first_live_tournament_id='live-1';model.trialTournaments.push({id:'live-1',name:body.name||'My First King of the Court',status:'Draft',start_date:'2026-09-29',is_demo:false});
  50  |           return json(route,{success:true,tournament:{id:'live-1',name:body.name||'My First King of the Court',format:'King of the Court',status:'Draft',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne'}});
  51  |         }
  52  |         if(body.action==='mark_progress'){model.journey[body.key]=new Date().toISOString();return json(route,{success:true,journey:model.journey});}
  53  |         return json(route,{success:true});
  54  |       }
  55  |       if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[],currentAccessRole:'session_host',isAdmin:false});
  56  |       return json(route,{success:true});
  57  |     }
  58  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
  59  |     if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity]=rest.split('/').map(decodeURIComponent);
  60  |       if(req.method()==='GET'){
  61  |         if(entity==='ClubUserAccess')return json(route,user.role==='admin'?[]:[{id:'club-access-1',tenant_id:'tenant-ashbourne',club_id:'club-ashbourne',user_id:'trial-user-1',permission_bundle:'member',status:'active',starts_at:now.toISOString(),ends_at:future}]);
  62  |         if(entity==='KotcSessionAccess')return json(route,[]);
  63  |         if(entity==='DirectoryListingAccess')return json(route,[]);
  64  |         if(entity==='Tournament')return json(route,model.trialTournaments.map(t=>({...t,format:'King of the Court',tenant_id:'tenant-ashbourne',host_club_id:'club-ashbourne',player_ids:[],kotc_guest_roster:[]})));
  65  |         if(entity==='Player')return json(route,[]);
  66  |         if(entity==='Club')return json(route,[{id:'club-ashbourne',tenant_id:'tenant-ashbourne',name:'Ashbourne Pickleball',status:'active'}]);
  67  |         return json(route,[]);
  68  |       }
  69  |       return json(route,{});
  70  |     }
  71  |     return json(route,{});
  72  |   });
  73  |   return model;
  74  | }
  75  | 
  76  | async function noOverflow(page){const n=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(n).toBeLessThanOrEqual(1);}
  77  | 
  78  | test('public controlled-trial application captures authority and KOTC + Spond intent',async({page})=>{
  79  |   const model=await install(page,{user:trialUser});
  80  |   await page.goto('/trial/apply');
  81  |   await expect(page.getByRole('heading',{name:'Apply for a RallyHub trial'})).toBeVisible();
  82  |   await page.getByLabel('Club name').fill('Ashbourne Pickleball');
  83  |   await page.getByLabel('Your name').fill('David Malloy');
  84  |   await page.getByLabel('Role in the club').fill('Club organiser');
  85  |   await page.getByLabel('Email').fill('david@example.test');
  86  |   await page.getByLabel('Approx. club membership').fill('75');
  87  |   await page.getByLabel('How do you plan to use the trial?').fill('Run King of the Court from Spond and share player results.');
  88  |   await page.getByText(/I confirm that I am authorised/).click();
  89  |   await page.getByRole('button',{name:'Submit trial application'}).click();
  90  |   await expect(page.getByRole('heading',{name:'Application received'})).toBeVisible();
  91  |   const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='public_submit');
  92  |   expect(call.body.authorityConfirmed).toBe(true);expect(call.body.requestedCapabilityKeys).toContain('tournament.king_of_the_court');expect(call.body.requestedCapabilityKeys).toContain('integration.spond');
  93  | });
  94  | 
  95  | test('Super Admin can approve the controlled KOTC + Spond scope and issue activation',async({page})=>{
  96  |   const model=await install(page,{user:adminUser});
  97  |   await page.goto('/app/trials');
  98  |   await expect(page.getByRole('heading',{name:'External club trials'})).toBeVisible();
  99  |   await expect(page.getByText('Ashbourne Pickleball')).toBeVisible();
  100 |   await page.getByRole('button',{name:'Approve KOTC + Spond'}).click();
  101 |   await expect(page.getByText(/https:\/\/rallyhub\.ie\/trial\/activate\?token=e2e-token/)).toBeVisible();
  102 |   const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='admin_approve');
  103 |   expect(call.body.selectedCapabilityKeys).toEqual(['tournament.king_of_the_court','integration.spond']);
  104 | });
  105 | 
  106 | test('approved club must explicitly accept all Trial & Evaluation Agreement confirmations before activation',async({page})=>{
  107 |   const model=await install(page,{user:trialUser});
  108 |   await page.goto('/trial/activate?token=e2e-token');
  109 |   await expect(page.getByRole('heading',{name:'Ashbourne Pickleball'})).toBeVisible();
  110 |   await expect(page.getByRole('heading',{name:'RallyHub Trial & Evaluation Agreement'})).toBeVisible();
  111 |   const activate=page.getByRole('button',{name:'Accept & Activate Trial'});await expect(activate).toBeDisabled();
  112 |   for(const text of ['I confirm that I am authorised','I have read and accept','must not be shared','RallyHub retains its intellectual property'])await page.getByText(new RegExp(text,'i')).click();
  113 |   await expect(activate).toBeEnabled();await activate.click();
  114 |   await expect(page).toHaveURL(/\/app$/);
  115 |   const call=model.calls.find(c=>c.name==='trialJourney'&&c.body.action==='accept_activate');
  116 |   expect(call.body.authorityConfirmed&&call.body.termsAccepted&&call.body.restrictedSharingConfirmed&&call.body.ipAcknowledged).toBe(true);
  117 | });
  118 | 
  119 | test('active trial gets a narrow onboarding portal and cannot browse normal admin/member modules',async({page})=>{
  120 |   await install(page,{user:trialUser});
  121 |   await page.goto('/app');
  122 |   await expect(page.getByRole('heading',{name:'Welcome to your King of the Court trial'})).toBeVisible();
> 123 |   await expect(page.getByText('30 days')).toBeVisible();
      |                                           ^ Error: expect(locator).toBeVisible() failed
  124 |   await expect(page.getByText('Complete the guided KOTC demo')).toBeVisible();
  125 |   await page.goto('/app/admin');
  126 |   await expect(page).toHaveURL(/\/app$/);
  127 |   await expect(page.getByRole('heading',{name:'Welcome to your King of the Court trial'})).toBeVisible();
  128 |   await noOverflow(page);
  129 | });
  130 | 
  131 | test('trial portal creates isolated demo first, then a real KOTC, and shows Spond/results guidance',async({page})=>{
  132 |   const model=await install(page,{user:trialUser});
  133 |   await page.goto('/app');
  134 |   await page.getByRole('button',{name:'Create guided demo'}).click();
  135 |   await expect(page).toHaveURL(/\/app\/tournaments\/demo-1$/);
  136 |   expect(model.calls.some(c=>c.name==='trialJourney'&&c.body.action==='create_demo_tournament')).toBe(true);
  137 |   await page.goto('/app');
  138 |   await page.getByDisplayValue('My First King of the Court').fill('Ashbourne Friday KOTC');
  139 |   await page.getByRole('button',{name:'Create event'}).click();
  140 |   await expect(page).toHaveURL(/\/app\/tournaments\/live-1$/);
  141 |   expect(model.calls.some(c=>c.name==='trialJourney'&&c.body.action==='create_live_tournament')).toBe(true);
  142 | });
  143 | 
  144 | test.describe('trial portal mobile',()=>{
  145 |   test.use({viewport:{width:390,height:844}});
  146 |   test('onboarding remains usable without horizontal scrolling',async({page})=>{await install(page,{user:trialUser});await page.goto('/app');await expect(page.getByText('Your setup checklist')).toBeVisible();await noOverflow(page);});
  147 | });
  148 | 
  149 | test('expired trial blocks new work and shows retained-history state with no automatic conversion',async({page})=>{
  150 |   const model=await install(page,{user:trialUser,state:'expired'});
  151 |   await page.goto('/app');
  152 |   await expect(page.getByRole('heading',{name:'Your RallyHub trial has ended'})).toBeVisible();
  153 |   await expect(page.getByText(/no automatic paid conversion/i)).toBeVisible();
  154 |   await expect(page.getByRole('button',{name:'Create guided demo'})).toHaveCount(0);
  155 |   await page.goto('/app/tournaments/live-1');
  156 |   await expect(page).toHaveURL(/\/app$/);
  157 |   expect(model.calls.some(c=>c.body?.action==='create_live_tournament')).toBe(false);
  158 | });
  159 | 
  160 | test('expiry does not cut off a KOTC already live before the entitlement boundary',async({page})=>{
  161 |   await install(page,{user:trialUser,state:'live-grace'});
  162 |   await page.goto('/app');
  163 |   await expect(page.getByRole('heading',{name:'Your RallyHub trial has ended'})).toBeVisible();
  164 |   await expect(page.getByRole('button',{name:'Finish live KOTC event'})).toBeVisible();
  165 |   await page.getByRole('button',{name:'Finish live KOTC event'}).click();
  166 |   await expect(page).toHaveURL(/\/app\/tournaments\/live-1$/);
  167 | });
  168 | 
```