# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nonclub-guided-setup.spec.mjs >> non-club guided editor has five simple steps and can publish its private setup draft
- Location: e2e/nonclub-guided-setup.spec.mjs:92:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Website (optional)')
Expected: "https://fourpointtravelgroup.com"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Website (optional)') with timeout 3000ms
  - waiting for getByLabel('Website (optional)')

```

```yaml
- banner:
  - link "RallyHub — Play Connect Belong":
    - /url: /
    - img "RallyHub — Play Connect Belong"
  - navigation:
    - link "Home":
      - /url: /
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
  - link "Search directory":
    - /url: /directory
    - img
  - paragraph: Signed in
  - paragraph: Sandra Example
  - button "Sign out"
  - button "Current appearance Auto. Change appearance.":
    - img
- main:
  - button "Back to public listing":
    - img
    - text: Back to public listing
  - paragraph: Primary Directory Owner
  - heading "Sandra's Pickleball Passports" [level=1]
  - text: Pickleball holidays & experiences Ireland & Portugal
  - paragraph: Keep the public listing accurate. The displayed name, description, contact details, service area and links can be updated at any time; the underlying RallyHub URL stays fixed.
  - button "View public listing":
    - img
    - text: View public listing
  - button "All saved" [disabled]:
    - img
    - text: All saved
  - navigation:
    - link "Basics":
      - /url: "#basics"
    - link "Contact":
      - /url: "#contact"
    - link "Access":
      - /url: "#access"
    - button "Enhance listing"
    - link "Help":
      - /url: /directory/help
      - img
      - text: Help
  - heading "How would you like to update your listing?" [level=2]
  - paragraph: Both options update the same listing. Switch at any time.
  - button "Guided setup"
  - button "Edit directly"
  - paragraph: "Step 2 of 5: Contact & social"
  - paragraph: Complete only what is useful. Optional fields can be skipped, and your progress is saved as you go.
  - button "Previous"
  - button "Continue"
  - img
  - heading "Keep the essentials accurate" [level=2]
  - paragraph: Check the listing name, description, public contact, area or coverage, website and social links. Keep it concise and useful for players.
  - link "Open help guide":
    - /url: /directory/help
    - button "Open help guide":
      - img
      - text: Open help guide
  - img
  - heading "People with access" [level=2]
  - paragraph: The Primary Owner remains responsible for this listing. Directory Editors can update public club information but cannot transfer ownership or add/remove other editors.
  - img
  - paragraph:
    - strong: "Security:"
    - text: delegated access uses a single-use 72-hour invitation tied to the chosen email address or mobile number. A forwarded link cannot be accepted by somebody whose verified details do not match the invitation. Primary Owner access cannot be removed from this screen.
  - img
  - heading "RallyHub Club" [level=2]
  - paragraph: RallyHub Club is still under development. These features are shown so you can see what is planned, but they are not available for general use yet.
  - button "Join waiting list"
  - img
  - text: RallyHub Club tools are not available from a Directory account. If you would like a demo or further information when they become available, join the waiting list.
  - img
  - heading "Help shape RallyHub" [level=2]
  - paragraph: Found something confusing? Have an idea or feature you’d like to see? Send it directly to the RallyHub team.
  - button "Send feedback":
    - img
    - text: Send feedback
  - img
  - heading "Contact & social" [level=2]
  - paragraph: These details are separate from the private verified owner/editor identity held by RallyHub. Add only the public contact and social links you want players to use.
  - text: Public contact label / name
  - textbox "e.g. Chairperson, Club Contact, Debbie Brown": Sandra
  - paragraph: This does not change the privately verified RallyHub account holder.
  - text: Contact email
  - textbox: sandra@example.test
  - text: Contact phone
  - textbox "e.g. 087 123 4567": "+353860488146"
  - text: WhatsApp
  - checkbox "Use this mobile for WhatsApp RallyHub will create the WhatsApp link automatically from the contact number." [checked]
  - strong: Use this mobile for WhatsApp
  - text: RallyHub will create the WhatsApp link automatically from the contact number.
  - textbox "Generated WhatsApp link": https://wa.me/353860488146
  - text: Website (optional)
  - textbox "https://…": https://fourpointtravelgroup.com
  - text: Facebook (optional)
  - textbox "https://facebook.com/…"
  - text: Instagram (optional)
  - textbox "https://instagram.com/…": https://instagram.com/sandra
  - paragraph: All changes saved
  - paragraph: Changes become public as soon as the save completes.
  - button "View listing":
    - img
    - text: View listing
  - button "All saved" [disabled]:
    - img
    - text: All saved
- contentinfo "RallyHub footer":
  - link "RallyHub home":
    - /url: /
    - img "RallyHub"
  - navigation "Footer navigation":
    - link "Directory":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "Club Guide":
      - /url: /directory/help
    - link "About":
      - /url: /about
    - link "Contact":
      - /url: /contact
  - text: © 2026 RallyHub All rights reserved.
- paragraph: Help us improve RallyHub
- paragraph: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
- button "Necessary only"
- button "Allow analytics"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID='6a01dc00702b7dd2a2978c28';
  4   | const user={id:'sandra-e2e',email:'sandra@example.test',full_name:'Sandra Example',role:'user',approval_status:'approved'};
  5   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6   | 
  7   | const holidayBase={
  8   |   id:'sandras-pickleball-passports',slug:'sandras-pickleball-passports',name:"Sandra's Pickleball Passports",
  9   |   listingType:'holidays',listingCategoryLabel:'Pickleball holidays & experiences',serviceArea:'Ireland & Portugal',
  10  |   description:'Pickleball holidays and experiences for players who want travel, play and connection.',
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
> 99  |   await expect(page.getByLabel('Website (optional)')).toHaveValue('https://fourpointtravelgroup.com');
      |                                                       ^ Error: expect(locator).toHaveValue(expected) failed
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
  111 |   await expect(page.getByRole('button',{name:'View public listing'})).toBeVisible();
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