# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nonclub-guided-setup.spec.mjs >> non-club guided editor has five simple steps and can publish its private setup draft
- Location: e2e/nonclub-guided-setup.spec.mjs:92:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'View public listing' })
Expected: visible
Error: strict mode violation: getByRole('button', { name: 'View public listing' }) resolved to 3 elements:
    1) <button type="button" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:796:20" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px…>…</button> aka getByRole('button', { name: 'View public listing' }).first()
    2) <button type="button" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:847:20" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">View public listing</button> aka getByTestId('directory-guided-progress').getByRole('button', { name: 'View public listing' })
    3) <button type="button" data-dynamic-content="true" data-source-location="src/pages/DirectoryListingEdit.jsx:1006:338" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">…</button> aka locator('#review').getByRole('button', { name: 'View public listing' })

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'View public listing' }) with timeout 3000ms
  - waiting for getByRole('button', { name: 'View public listing' })

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
            - paragraph [ref=e21]: Sandra Example
          - button "Sign out" [ref=e22] [cursor=pointer]
          - button "Current appearance Auto. Change appearance." [ref=e23] [cursor=pointer]
    - main [ref=e24]:
      - generic [ref=e25]:
        - button "Back to public listing" [ref=e26] [cursor=pointer]
        - generic [ref=e29]: Saved
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e37]:
            - generic [ref=e38]:
              - paragraph [ref=e39]: Primary Directory Owner
              - heading "Sandra's Pickleball Passports" [level=1] [ref=e40]
              - generic [ref=e41]:
                - generic [ref=e42]: Pickleball holidays & experiences
                - generic [ref=e43]: Ireland & Portugal
              - paragraph [ref=e44]: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
            - generic [ref=e45]:
              - button "View public listing" [ref=e46] [cursor=pointer]
              - button "Saved ✓" [disabled]
          - navigation [ref=e47]:
            - link "Basics" [ref=e48] [cursor=pointer]:
              - /url: "#basics"
            - link "Contact" [ref=e49] [cursor=pointer]:
              - /url: "#contact"
            - link "Access" [ref=e50] [cursor=pointer]:
              - /url: "#access"
            - button "Enhance listing" [ref=e51] [cursor=pointer]
            - link "Help" [ref=e52] [cursor=pointer]:
              - /url: /directory/help
          - generic [ref=e56]:
            - generic [ref=e57]:
              - strong [ref=e61]: Saved successfully.
              - text: Changes are live in the public directory.
            - button "View updated listing" [ref=e62] [cursor=pointer]
        - generic [ref=e63]:
          - heading "How would you like to update your listing?" [level=2] [ref=e64]
          - paragraph [ref=e65]: Both options update the same listing. Switch at any time.
          - generic [ref=e66]:
            - button "Guided setup" [ref=e67] [cursor=pointer]
            - button "Edit directly" [ref=e68] [cursor=pointer]
          - generic [ref=e69]:
            - paragraph [ref=e70]: "Step 5 of 5: Review & finish"
            - generic "Setup progress" [ref=e71]
            - paragraph [ref=e77]: Complete only what is useful. Optional fields can be skipped, and your progress is saved as you go.
            - generic [ref=e78]:
              - button "Previous" [ref=e79] [cursor=pointer]
              - button "View public listing" [ref=e80] [cursor=pointer]
        - generic [ref=e82]:
          - generic [ref=e83]:
            - heading "Keep the essentials accurate" [level=2] [ref=e88]
            - paragraph [ref=e89]: Check the listing name, description, public contact, area or coverage, website and social links. Keep it concise and useful for players.
          - link [ref=e90] [cursor=pointer]:
            - /url: /directory/help
            - button "Open help guide" [ref=e91]
        - generic [ref=e92]:
          - generic [ref=e100]:
            - heading "People with access" [level=2] [ref=e101]
            - paragraph [ref=e102]: The Primary Owner remains responsible for this listing. Directory Editors can update public club information but cannot transfer ownership or add/remove other editors.
          - paragraph [ref=e107]:
            - strong [ref=e108]: "Security:"
            - text: delegated access uses a single-use 72-hour invitation tied to the chosen email address or mobile number. A forwarded link cannot be accepted by somebody whose verified details do not match the invitation. Primary Owner access cannot be removed from this screen.
        - generic [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - heading "RallyHub Club" [level=2] [ref=e116]
              - paragraph [ref=e117]: RallyHub Club is still under development. These features are shown so you can see what is planned, but they are not available for general use yet.
            - button "Join waiting list" [ref=e118] [cursor=pointer]
          - generic [ref=e119]: RallyHub Club tools are not available from a Directory account. If you would like a demo or further information when they become available, join the waiting list.
        - generic [ref=e125]:
          - generic [ref=e126]:
            - heading "Help shape RallyHub" [level=2] [ref=e130]
            - paragraph [ref=e131]: Found something confusing? Have an idea or feature you’d like to see? Send it directly to the RallyHub team.
          - button "Send feedback" [ref=e132] [cursor=pointer]
        - generic [ref=e133]:
          - heading "Review & finish" [level=2] [ref=e138]
          - paragraph [ref=e139]: Your listing is live. You can view it, continue to your event, or come back later to add optional information.
          - generic [ref=e140]:
            - button "View public listing" [ref=e141] [cursor=pointer]
            - link [ref=e142] [cursor=pointer]:
              - /url: /directory/sandras-pickleball-passports/events?guided=1
              - button "Continue to event" [ref=e143]
        - generic [ref=e144]:
          - generic [ref=e145]:
            - paragraph [ref=e146]: Saved successfully
            - paragraph [ref=e150]: Your public Directory listing has been updated.
          - generic [ref=e151]:
            - button "View listing" [ref=e152] [cursor=pointer]
            - button "Saved ✓" [disabled]
    - contentinfo "RallyHub footer" [ref=e154]:
      - generic [ref=e155]:
        - generic [ref=e156]:
          - link "RallyHub home" [ref=e157] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e158]
          - navigation "Footer navigation" [ref=e159]:
            - link "Directory" [ref=e160] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e161] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e162] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e163] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e164] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e165]: © 2026 RallyHub All rights reserved.
  - generic [ref=e167]:
    - generic [ref=e168]:
      - paragraph [ref=e169]: Help us improve RallyHub
      - paragraph [ref=e170]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e171]:
      - button "Necessary only" [ref=e172] [cursor=pointer]
      - button "Allow analytics" [ref=e173] [cursor=pointer]
```

# Test source

```ts
  11  |   website:'https://fourpointtravelgroup.com',facebook:'',instagram:'https://instagram.com/sandra',
  12  |   contact:{name:'Sandra',email:'sandra@example.test',phone:'+353860488146',whatsapp:'https://wa.me/353860488146'},
  13  |   venues:[],sessions:[]
  14  | };
  15  | 
  16  | async function installBackend(page,{forAdd=false}={}){
  17  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','nonclub-guided-e2e'));
  18  |   const calls=[];
  19  |   await page.route('**/api/apps/**',async route=>{
  20  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  21  |     const reply=(body,status=200)=>json(route,body,status);
  22  |     if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  23  |     if(path.includes('/analytics/'))return reply({});
  24  |     if(path.endsWith('/entities/User/me'))return reply(user);
  25  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  26  |     const idx=path.indexOf(fnMarker);
  27  |     if(idx>=0){
  28  |       const name=decodeURIComponent(path.slice(idx+fnMarker.length).split('/')[0]);
  29  |       let body={};try{body=req.postDataJSON()||{}}catch{}
  30  |       calls.push({name,body});
  31  |       if(name==='securityContext')return reply({success:true,context:null});
  32  |       if(name==='directoryCategory')return reply({success:true,categories:[
  33  |         {key:'club',label:'Club / place to play',pluralLabel:'Clubs & places to play',active:true,sortOrder:10,clubFirst:true,locationMode:'county',showListingForm:true},
  34  |         {key:'tournaments_events',label:'Tournament / event organiser',pluralLabel:'Tournaments & events',active:true,sortOrder:20,locationMode:'service_area',showListingForm:true},
  35  |         {key:'coaching',label:'Coach / coaching',pluralLabel:'Coaching',active:true,sortOrder:30,locationMode:'service_area',showListingForm:true},
  36  |         {key:'holidays',label:'Pickleball holiday',pluralLabel:'Pickleball holidays',active:true,sortOrder:40,locationMode:'service_area',showListingForm:true},
  37  |         {key:'equipment',label:'Equipment / supplier',pluralLabel:'Equipment & suppliers',active:true,sortOrder:50,locationMode:'none',showListingForm:true},
  38  |         {key:'other',label:'Other pickleball service',pluralLabel:'Other pickleball services',active:true,sortOrder:90,locationMode:'service_area',showListingForm:true},
  39  |       ]});
  40  |       if(name==='directoryClaim'){
  41  |         if(body.action==='new_status')return reply({success:true,request:null});
  42  |         if(body.action==='status')return reply({success:true,hasAccess:true,accessRole:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,verificationStatus:'verified'}});
  43  |         if(body.action==='submit_new')return reply({success:true,status:'approved',listingSlug:holidayBase.slug,setupDraft:true,request:{status:'approved',approved_listing_slug:holidayBase.slug}});
  44  |         if(body.action==='set_visibility')return reply({success:true,listingSlug:holidayBase.slug,visibility:'public'});
  45  |         return reply({success:true});
  46  |       }
  47  |       if(name==='directoryListingProfile'){
  48  |         if(body.action==='public_list')return reply({success:true,listings:[]});
  49  |         if(body.action==='private_get')return reply({success:true,listingSlug:holidayBase.slug,visibility:'preview_only',verificationStatus:'verified',profile:null,base:holidayBase});
  50  |         if(body.action==='save')return reply({success:true,profile:body.profile,id:'profile-1'});
  51  |         return reply({success:true,profile:null,base:null});
  52  |       }
  53  |       if(name==='directoryEvents'){
  54  |         if(body.action==='list')return reply({success:true,canManage:true,role:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,listingType:'holidays',serviceArea:'Ireland & Portugal',visibility:'preview_only',profile:{contact:holidayBase.contact,website:holidayBase.website,instagram:holidayBase.instagram,facebook:'',logoUrl:''}},host:{id:'host-sandra',name:holidayBase.name},tenant:{id:'tenant-sandra'},events:[],venues:[]});
  55  |         if(body.action==='save')return reply({success:true,event:{id:'event-sandra',...body.event},listingPublished:body.mode==='publish'});
  56  |         return reply({success:true});
  57  |       }
  58  |       if(name==='eventEngagement')return reply({success:true,items:[]});
  59  |       if(name==='secureCreditAction')return reply({success:true,file_url:'https://files.example.test/poster.webp'});
  60  |       return reply({success:true});
  61  |     }
  62  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  63  |     if(path.includes(entityMarker))return reply([]);
  64  |     return reply({});
  65  |   });
  66  |   return calls;
  67  | }
  68  | 
  69  | test('non-club organiser chooses holiday setup, autosaves and continues straight into guided setup',async({page})=>{
  70  |   const calls=await installBackend(page,{forAdd:true});
  71  |   await page.goto('/directory/add');
  72  |   await expect(page.getByText('What are you setting up?')).toBeVisible();
  73  |   await page.locator('input[type=radio][value="holidays"]').check();
  74  |   await expect(page.getByText('Pickleball holiday / experience',{exact:true})).toBeVisible();
  75  |   await page.getByLabel('Club, business or listing name').fill("Sandra's Pickleball Passports");
  76  |   await page.getByLabel(/Area, destination or service coverage/).fill('Ireland & Portugal');
  77  |   await page.getByLabel('Website').fill('https://fourpointtravelgroup.com');
  78  |   await page.getByLabel('Instagram').fill('https://instagram.com/sandra');
  79  |   await page.getByLabel('Your role / connection').fill('Travel organiser');
  80  |   await expect(page.getByText('Your progress is automatically saved on this device while you complete the form.')).toBeVisible();
  81  |   await page.waitForTimeout(450);
  82  |   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallyhub-directory-add-draft-v2:sandra-e2e')||'null'));
  83  |   expect(saved?.listingType).toBe('holidays');
  84  |   expect(saved?.clubName).toBe("Sandra's Pickleball Passports");
  85  |   await page.getByRole('button',{name:'Save & continue'}).click();
  86  |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/edit\?created=1&guided=1/);
  87  |   const submit=calls.find(c=>c.name==='directoryClaim'&&c.body.action==='submit_new');
  88  |   expect(submit?.body.listingType).toBe('holidays');
  89  |   expect(submit?.body.claimantPhone).toBe('');
  90  | });
  91  | 
  92  | test('non-club guided editor has five simple steps and can publish its private setup draft',async({page})=>{
  93  |   const calls=await installBackend(page);
  94  |   await page.goto('/directory/sandras-pickleball-passports/edit?guided=1');
  95  |   await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5: About you');
  96  |   await expect(page.locator('#basics')).toBeVisible();
  97  |   await page.getByRole('button',{name:'Continue',exact:true}).click();
  98  |   await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5: Contact & social');
  99  |   await expect(page.getByLabel('Website')).toHaveValue('https://fourpointtravelgroup.com');
  100 |   await page.getByRole('button',{name:'Continue',exact:true}).click();
  101 |   await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 3 of 5: Where you operate');
  102 |   await expect(page.getByLabel(/Area, destination or service coverage/)).toHaveValue('Ireland & Portugal');
  103 |   await page.getByRole('button',{name:'Continue',exact:true}).click();
  104 |   await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 4 of 5: Your event');
  105 |   await expect(page.getByRole('button',{name:'Continue to your event'}).first()).toBeVisible();
  106 |   await page.getByRole('button',{name:'Continue',exact:true}).click();
  107 |   await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 5 of 5: Review & finish');
  108 |   await expect(page.getByRole('button',{name:'Publish listing'})).toBeVisible();
  109 |   await page.getByRole('button',{name:'Publish listing'}).click();
  110 |   await expect.poll(()=>calls.some(c=>c.name==='directoryClaim'&&c.body.action==='set_visibility'&&c.body.visibility==='public')).toBeTruthy();
> 111 |   await expect(page.getByRole('button',{name:'View public listing'})).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  112 | });
  113 | 
  114 | test('guided holiday event reuses organiser details, stores collaborator on the one event and publishes listing with it',async({page})=>{
  115 |   const calls=await installBackend(page);
  116 |   await page.goto('/directory/sandras-pickleball-passports/events?guided=1');
  117 |   await expect(page.getByTestId('directory-event-guided-start')).toContainText('Your listing details are ready');
  118 |   await expect(page.getByTestId('directory-event-guided-start')).toContainText('When you publish the event, RallyHub will also make your organiser listing live.');
  119 |   await expect(page.getByLabel('Event type')).toHaveValue('holiday');
  120 |   await expect(page.getByLabel('Organiser email')).toHaveValue('sandra@example.test');
  121 |   await expect(page.getByLabel('Organiser mobile')).toHaveValue('+353860488146');
  122 |   await page.getByLabel('Event name').fill("Sandra's Pickleball Passports · Carvoeiro");
  123 |   await page.getByLabel('Starts').fill('2027-05-14');
  124 |   await page.getByLabel('Ends').fill('2027-05-18');
  125 |   await page.getByLabel('Venue / location').fill('Rocha Brava Racquet Club, Carvoeiro');
  126 |   await page.getByLabel('Country').fill('Portugal');
  127 |   await page.getByLabel('Registration method').selectOption('contact');
  128 |   await page.getByRole('button',{name:'Add collaborator'}).click();
  129 |   await page.getByLabel('Collaborator 1 name').fill('Pickleball Escapes');
  130 |   await page.getByLabel('Collaborator 1 role').fill('In collaboration with');
  131 |   await page.getByLabel('Collaborator 1 link').fill('https://rallyhub.ie/directory/pickleball-escapes');
  132 |   await page.getByRole('button',{name:'Publish to RallyHub Events'}).click();
  133 |   await expect(page.getByText('Event published + organiser listing live ✓')).toBeVisible();
  134 |   const save=calls.find(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish');
  135 |   expect(save).toBeTruthy();
  136 |   expect(save.body.event.event_collaborators).toEqual([{name:'Pickleball Escapes',role:'In collaboration with',url:'https://rallyhub.ie/directory/pickleball-escapes',listing_slug:'pickleball-escapes'}]);
  137 |   expect(calls.filter(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish')).toHaveLength(1);
  138 | });
  139 | 
```