# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nonclub-guided-setup.spec.mjs >> personalised guided overview shows what RallyHub already knows and continues to Sandra’s first unfinished item
- Location: e2e/nonclub-guided-setup.spec.mjs:102:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Sandra\'s Pickleball Passports', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Sandra\'s Pickleball Passports', { exact: true }) resolved to 2 elements:
    1) <h1 data-dynamic-content="true" class="text-3xl sm:text-4xl font-black mt-1 break-words" data-source-location="src/pages/DirectoryListingEdit.jsx:869:20">Sandra's Pickleball Passports</h1> aka getByRole('heading', { name: 'Sandra\'s Pickleball Passports' })
    2) <span data-dynamic-content="true" class="block text-sm font-bold" data-collection-item-field="name" data-source-location="src/pages/DirectoryListingEdit.jsx:1001:574">Sandra's Pickleball Passports</span> aka getByTestId('directory-identity-step').getByText('Sandra\'s Pickleball Passports')

Call log:
  - Expect "toBeVisible" getByText('Sandra\'s Pickleball Passports', { exact: true }) with timeout 3000ms
  - waiting for getByText('Sandra\'s Pickleball Passports', { exact: true })

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
          - link "Club Guide" [ref=e12] [cursor=pointer]:
            - /url: /directory/help
          - link "About" [ref=e13] [cursor=pointer]:
            - /url: /about
        - generic [ref=e14]:
          - link "Search directory" [ref=e15] [cursor=pointer]:
            - /url: /directory
          - generic [ref=e19]:
            - paragraph [ref=e20]: Signed in
            - paragraph [ref=e21]: Sandra
          - button "Sign out" [ref=e22] [cursor=pointer]
          - button "Current appearance Auto. Change appearance." [ref=e23] [cursor=pointer]
    - main [ref=e24]:
      - button "Back to public listing" [ref=e26] [cursor=pointer]
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e32]:
            - generic [ref=e33]:
              - paragraph [ref=e34]: Primary Directory Owner
              - heading "Sandra's Pickleball Passports" [level=1] [ref=e35]
              - generic [ref=e36]:
                - generic [ref=e37]: Pickleball holidays & experiences
                - generic [ref=e38]: Ireland & Portugal
              - paragraph [ref=e39]: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
            - generic [ref=e40]:
              - button "View public listing" [ref=e41] [cursor=pointer]
              - button "All saved" [disabled]
          - navigation [ref=e42]:
            - link "Basics" [ref=e43] [cursor=pointer]:
              - /url: "#basics"
            - link "Contact" [ref=e44] [cursor=pointer]:
              - /url: "#contact"
            - link "Access" [ref=e45] [cursor=pointer]:
              - /url: "#access"
            - button "Enhance listing" [ref=e46] [cursor=pointer]
            - link "Help" [ref=e47] [cursor=pointer]:
              - /url: /directory/help
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]:
              - heading "Guided setup" [level=2] [ref=e54]
              - paragraph [ref=e55]: RallyHub shows what is already done and takes you straight to what needs attention.
            - generic [ref=e56]:
              - button "Guided setup" [ref=e57] [cursor=pointer]
              - button "Edit directly" [ref=e58] [cursor=pointer]
          - generic [ref=e59]:
            - generic [ref=e60]:
              - paragraph [ref=e61]: "Step 1 of 6: Confirm public name"
              - button "Back to checklist" [ref=e62] [cursor=pointer]
            - generic "Setup progress" [ref=e63]
            - paragraph [ref=e70]: Check what RallyHub already found, change only what needs changing, then continue.
            - generic [ref=e71]:
              - button "Previous" [disabled]
              - button "Confirm & continue" [disabled]
        - generic [ref=e72]:
          - generic [ref=e73]:
            - heading "Which name should players see?" [level=2] [ref=e78]
            - paragraph [ref=e79]: We found more than one name connected with you. Your RallyHub account stays under your own name — this only chooses the public organiser or business name players will see.
          - radiogroup "Public organiser name" [ref=e80]:
            - generic [ref=e81] [cursor=pointer]:
              - radio "Smarter Travel Name used on your travel/social presence" [ref=e82]
              - generic [ref=e83]:
                - generic [ref=e84]: Smarter Travel
                - generic [ref=e85]: Name used on your travel/social presence
            - generic [ref=e86] [cursor=pointer]:
              - radio "Sandra's Pickleball Passports Name used on the Carvoeiro pickleball trip" [ref=e87]
              - generic [ref=e88]:
                - generic [ref=e89]: Sandra's Pickleball Passports
                - generic [ref=e90]: Name used on the Carvoeiro pickleball trip
            - generic [ref=e91] [cursor=pointer]:
              - radio "Use my own name Sandra" [ref=e92]
              - generic [ref=e93]:
                - generic [ref=e94]: Use my own name
                - generic [ref=e95]: Sandra
            - generic [ref=e96] [cursor=pointer]:
              - radio "Another business / brand Choose this if neither name above is the one you want on RallyHub." [ref=e97]
              - generic [ref=e98]:
                - generic [ref=e99]: Another business / brand
                - generic [ref=e100]: Choose this if neither name above is the one you want on RallyHub.
          - paragraph [ref=e101]: This choice controls the public organiser name on your listing and connected events. Any collaborating organisations remain linked separately to the event.
        - generic [ref=e102]:
          - generic [ref=e103]:
            - paragraph [ref=e104]: All changes saved
            - paragraph [ref=e105]: Changes stay private until you publish.
          - generic [ref=e106]:
            - button "View listing" [ref=e107] [cursor=pointer]
            - button "All saved" [disabled]
    - contentinfo "RallyHub footer" [ref=e109]:
      - generic [ref=e110]:
        - generic [ref=e111]:
          - link "RallyHub home" [ref=e112] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e113]
          - navigation "Footer navigation" [ref=e114]:
            - link "Directory" [ref=e115] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e116] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e117] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e118] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e119] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e120]: © 2026 RallyHub All rights reserved.
  - generic [ref=e122]:
    - generic [ref=e123]:
      - paragraph [ref=e124]: Help us improve RallyHub
      - paragraph [ref=e125]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e126]:
      - button "Necessary only" [ref=e127] [cursor=pointer]
      - button "Allow analytics" [ref=e128] [cursor=pointer]
```

# Test source

```ts
  19  |   event_public_summary:'Four nights in Carvoeiro with 18 hours of hosted pickleball and coaching, welcome drinks, a three-course group dinner and a fun tournament at Rocha Brava Racquet Club.',
  20  |   event_registration_mode:'contact',event_registration_url:'',event_fee_text:'£815 / €950 per person, based on two sharing a one-bedroom apartment.',event_contact:'smartertravel77@gmail.com',event_contact_phone:'+353860488146',
  21  |   event_eligibility:'Designed for pickleball-loving women aged 60+.',event_player_info:'Come alone or with a friend. Non-playing partners are welcome. Single supplements and additional nights are available on request. Flights and transfers are extra.',
  22  |   event_source_url:'https://www.instagram.com/p/Dewzng0O6j2/',event_publish_status:'draft',event_public_visible:false,event_member_visible:false,
  23  |   event_collaborators:[{name:'Pickleball Escapes',role:'In collaboration with',url:'',listing_slug:''}],status:'Draft'
  24  | };
  25  | 
  26  | async function installBackend(page,{forAdd=false}={}){
  27  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','nonclub-guided-e2e'));
  28  |   const calls=[];
  29  |   await page.route('**/api/apps/**',async route=>{
  30  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  31  |     const reply=(body,status=200)=>json(route,body,status);
  32  |     if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  33  |     if(path.includes('/analytics/'))return reply({});
  34  |     if(path.endsWith('/entities/User/me'))return reply(user);
  35  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  36  |     const idx=path.indexOf(fnMarker);
  37  |     if(idx>=0){
  38  |       const name=decodeURIComponent(path.slice(idx+fnMarker.length).split('/')[0]);
  39  |       let body={};try{body=req.postDataJSON()||{}}catch{}
  40  |       calls.push({name,body});
  41  |       if(name==='securityContext')return reply({success:true,context:null});
  42  |       if(name==='directoryCategory')return reply({success:true,categories:[
  43  |         {key:'club',label:'Club / place to play',pluralLabel:'Clubs & places to play',active:true,sortOrder:10,clubFirst:true,locationMode:'county',showListingForm:true},
  44  |         {key:'tournaments_events',label:'Tournament / event organiser',pluralLabel:'Tournaments & events',active:true,sortOrder:20,locationMode:'service_area',showListingForm:true},
  45  |         {key:'coaching',label:'Coach / coaching',pluralLabel:'Coaching',active:true,sortOrder:30,locationMode:'service_area',showListingForm:true},
  46  |         {key:'holidays',label:'Pickleball holiday',pluralLabel:'Pickleball holidays',active:true,sortOrder:40,locationMode:'service_area',showListingForm:true},
  47  |         {key:'equipment',label:'Equipment / supplier',pluralLabel:'Equipment & suppliers',active:true,sortOrder:50,locationMode:'none',showListingForm:true},
  48  |         {key:'other',label:'Other pickleball service',pluralLabel:'Other pickleball services',active:true,sortOrder:90,locationMode:'service_area',showListingForm:true},
  49  |       ]});
  50  |       if(name==='directoryClaim'){
  51  |         if(body.action==='new_status')return reply({success:true,request:null});
  52  |         if(body.action==='status')return reply({success:true,hasAccess:true,accessRole:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,verificationStatus:'verified'}});
  53  |         if(body.action==='submit_new')return reply({success:true,status:'approved',listingSlug:holidayBase.slug,setupDraft:true,request:{status:'approved',approved_listing_slug:holidayBase.slug}});
  54  |         if(body.action==='set_visibility')return reply({success:true,listingSlug:holidayBase.slug,visibility:'public'});
  55  |         return reply({success:true});
  56  |       }
  57  |       if(name==='directoryListingProfile'){
  58  |         if(body.action==='public_list')return reply({success:true,listings:[]});
  59  |         if(body.action==='private_get')return reply({success:true,listingSlug:holidayBase.slug,visibility:'preview_only',verificationStatus:'verified',profile:null,base:holidayBase,setup:sandraSetup});
  60  |         if(body.action==='confirm_identity')return reply({success:true,listingSlug:holidayBase.slug,publicName:body.publicName,setup:{identity:{...sandraSetup.identity,requiresConfirmation:false,confirmed:true,selectedPublicName:body.publicName}}});
  61  |         if(body.action==='save')return reply({success:true,profile:body.profile,id:'profile-1'});
  62  |         return reply({success:true,profile:null,base:null});
  63  |       }
  64  |       if(name==='directoryEvents'){
  65  |         if(body.action==='list')return reply({success:true,canManage:true,role:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,listingType:'holidays',serviceArea:'Ireland & Portugal',visibility:'preview_only',profile:{contact:holidayBase.contact,website:holidayBase.website,instagram:holidayBase.instagram,facebook:'',logoUrl:''}},host:{id:'host-sandra',name:holidayBase.name},tenant:{id:'tenant-sandra'},events:[sandraEvent],venues:[]});
  66  |         if(body.action==='save')return reply({success:true,event:{id:'event-sandra',...body.event},listingPublished:body.mode==='publish'});
  67  |         return reply({success:true});
  68  |       }
  69  |       if(name==='eventEngagement')return reply({success:true,items:[]});
  70  |       if(name==='secureCreditAction')return reply({success:true,file_url:'https://files.example.test/poster.webp'});
  71  |       return reply({success:true});
  72  |     }
  73  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  74  |     if(path.includes(entityMarker))return reply([]);
  75  |     return reply({});
  76  |   });
  77  |   return calls;
  78  | }
  79  | 
  80  | test('non-club organiser chooses holiday setup, autosaves and continues straight into guided setup',async({page})=>{
  81  |   const calls=await installBackend(page,{forAdd:true});
  82  |   await page.goto('/directory/add');
  83  |   await expect(page.getByText('What are you setting up?')).toBeVisible();
  84  |   await page.locator('input[type=radio][value="holidays"]').check();
  85  |   await expect(page.getByText('Pickleball holiday / experience',{exact:true})).toBeVisible();
  86  |   await page.getByLabel('Club, business or listing name').fill("Sandra's Pickleball Passports");
  87  |   await page.getByLabel(/Area, destination or service coverage/).fill('Ireland & Portugal');
  88  |   await page.getByLabel('Instagram').fill('https://www.instagram.com/p/Dewzng0O6j2/');
  89  |   await page.getByLabel('Your role / connection').fill('Travel organiser');
  90  |   await expect(page.getByText('Your progress is automatically saved on this device while you complete the form.')).toBeVisible();
  91  |   await page.waitForTimeout(450);
  92  |   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallyhub-directory-add-draft-v2:sandra-e2e')||'null'));
  93  |   expect(saved?.listingType).toBe('holidays');
  94  |   expect(saved?.clubName).toBe("Sandra's Pickleball Passports");
  95  |   await page.getByRole('button',{name:'Save & continue'}).click();
  96  |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/edit\?created=1&guided=1/);
  97  |   const submit=calls.find(c=>c.name==='directoryClaim'&&c.body.action==='submit_new');
  98  |   expect(submit?.body.listingType).toBe('holidays');
  99  |   expect(submit?.body.claimantPhone).toBe('');
  100 | });
  101 | 
  102 | test('personalised guided overview shows what RallyHub already knows and continues to Sandra’s first unfinished item',async({page})=>{
  103 |   await installBackend(page);
  104 |   await page.goto('/directory/sandras-pickleball-passports/edit?guided=1');
  105 |   const overview=page.getByTestId('directory-guided-overview');
  106 |   await expect(overview).toBeVisible();
  107 |   await expect(overview.getByText('Sandra, we’ve already started this for you.')).toBeVisible();
  108 |   await expect(overview.getByText('3 of 6 ready')).toBeVisible();
  109 |   await expect(page.getByTestId('setup-step-identity')).toContainText('Needs check');
  110 |   await expect(page.getByTestId('setup-step-basics')).toContainText('Ready');
  111 |   await expect(page.getByTestId('setup-step-contact')).toContainText('Ready');
  112 |   await expect(page.getByTestId('setup-step-location')).toContainText('Ready');
  113 |   await expect(page.getByTestId('setup-step-events')).toContainText('Started');
  114 |   await expect(page.getByTestId('setup-step-events')).toContainText("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  115 |   await page.getByRole('button',{name:'Continue setup'}).click();
  116 |   await expect(page.getByTestId('directory-identity-step')).toBeVisible();
  117 |   await expect(page.getByText('Which name should players see?')).toBeVisible();
  118 |   await expect(page.getByText('Smarter Travel',{exact:true})).toBeVisible();
> 119 |   await expect(page.getByText("Sandra's Pickleball Passports",{exact:true})).toBeVisible();
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  120 |   await page.locator('input[name="identityChoice"][value="Smarter Travel"]').check();
  121 |   await page.getByRole('button',{name:'Confirm & continue'}).click();
  122 |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  123 |   await expect(page.getByText("Editing: Sandra's Pickleball Passports · Carvoeiro, Portugal")).toBeVisible();
  124 |   await expect(page.getByLabel('Starts')).toHaveValue('2027-05-14');
  125 |   await expect(page.getByLabel('Ends')).toHaveValue('2027-05-18');
  126 |   await expect(page.getByLabel('Venue / location')).toHaveValue('Rocha Brava Racquet Club, Carvoeiro');
  127 | });
  128 | 
  129 | test('Sandra email deep-link skips completed work, preserves the prefilled event and publishes one canonical collaboration',async({page})=>{
  130 |   const calls=await installBackend(page);
  131 |   await page.goto('/directory/sandras-pickleball-passports/edit?guided=1&continue=1');
  132 |   await expect(page.getByTestId('directory-identity-step')).toBeVisible();
  133 |   await page.locator('input[name="identityChoice"][value="Sandra\'s Pickleball Passports"]').check();
  134 |   await page.getByRole('button',{name:'Confirm & continue'}).click();
  135 |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  136 |   await expect(page.getByLabel('Event type')).toHaveValue('holiday');
  137 |   await expect(page.getByLabel('Event name')).toHaveValue("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  138 |   await expect(page.getByLabel('Organiser email')).toHaveValue('smartertravel77@gmail.com');
  139 |   await expect(page.getByLabel('Organiser mobile')).toHaveValue('+353860488146');
  140 |   await expect(page.getByLabel('Registration method')).toHaveValue('contact');
  141 |   await expect(page.getByLabel('Collaborator 1 name')).toHaveValue('Pickleball Escapes');
  142 |   await expect(page.getByLabel('Collaborator 1 role')).toHaveValue('In collaboration with');
  143 |   await expect(page.getByLabel('Entry fee / fee text')).toHaveValue('£815 / €950 per person, based on two sharing a one-bedroom apartment.');
  144 |   await page.getByLabel('Collaborator 1 link').fill('https://rallyhub.ie/directory/pickleball-escapes');
  145 |   await page.getByRole('button',{name:'Publish to RallyHub Events'}).click();
  146 |   await expect(page.getByText('Event published + organiser listing live ✓')).toBeVisible();
  147 |   const identityConfirm=calls.find(c=>c.name==='directoryListingProfile'&&c.body.action==='confirm_identity');
  148 |   expect(identityConfirm?.body.publicName).toBe("Sandra's Pickleball Passports");
  149 |   const save=calls.find(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish');
  150 |   expect(save).toBeTruthy();
  151 |   expect(save.body.event.event_collaborators).toEqual([{name:'Pickleball Escapes',role:'In collaboration with',url:'https://rallyhub.ie/directory/pickleball-escapes',listing_slug:'pickleball-escapes'}]);
  152 |   expect(calls.filter(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish')).toHaveLength(1);
  153 | });
  154 | 
```