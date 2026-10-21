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

Locator: getByText('Editing: Sandra\'s Pickleball Passports · Carvoeiro, Portugal')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Editing: Sandra\'s Pickleball Passports · Carvoeiro, Portugal') with timeout 3000ms
  - waiting for getByText('Editing: Sandra\'s Pickleball Passports · Carvoeiro, Portugal')

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
  - paragraph: Sandra
  - button "Sign out"
  - button "Current appearance Auto. Change appearance.":
    - img
- main:
  - link "Back to manage listing":
    - /url: /directory/sandras-pickleball-passports/edit
    - img
    - text: Back to manage listing
  - link "Events Quick Start Guide":
    - /url: /events/quick-start
    - img
    - text: Events Quick Start Guide
  - heading "Events · Sandra's Pickleball Passports" [level=1]
  - paragraph: Create and maintain public RallyHub events here. The editor is the same one clubs use inside RallyHub Club, so there is nothing new to relearn later.
  - text: Listing ✓ → Event → Preview → Live
  - link "Back to setup checklist":
    - /url: /directory/sandras-pickleball-passports/edit?guided=1
  - paragraph: Your listing details are ready. Add the event you want players to see.
  - paragraph: Your public organiser email, phone and website are reused below where available. When you publish the event, RallyHub will also make your organiser listing live.
  - paragraph: The same seven-step event editor everywhere
  - paragraph: Basics → Artwork → Registration → Who is it for? → Event information → Audience → Preview & publish.
  - link "Events Quick Start Guide":
    - /url: /events/quick-start
  - img
  - 'heading "Editing: Sandra''s Pickleball Passports · Carvoeiro, Portugal" [level=2]'
  - button "Close editor":
    - img
    - text: Close editor
  - paragraph: Edit the canonical event once; member and public views use the same record.
  - paragraph: 1 · Basics
  - paragraph: The information players need to identify the event quickly.
  - text: Event name
  - textbox "Event name": Sandra's Pickleball Passports · Carvoeiro, Portugal
  - text: Event type
  - combobox "Event type":
    - option "Tournament"
    - option "Interclub"
    - option "League"
    - option "Social"
    - option "Coaching / Clinic"
    - option "Pickleball holiday / experience" [selected]
    - option "Camp"
    - option "Open Day"
    - option "Exhibition"
    - option "Other"
  - text: Indoor / outdoor
  - combobox "Indoor / outdoor":
    - option "Not specified" [selected]
    - option "Indoor"
    - option "Outdoor"
    - option "Indoor / Outdoor"
  - text: Starts
  - textbox "Starts": 2027-05-14
  - text: Ends
  - textbox "Ends": 2027-05-18
  - text: Start time
  - textbox "Start time"
  - text: End time
  - textbox "End time"
  - text: Club venue
  - combobox "Club venue":
    - option "Manual / external venue" [selected]
  - text: Venue / location
  - textbox "Venue / location":
    - /placeholder: e.g. Lagan Valley LeisurePlex, Lisburn
    - text: Rocha Brava Racquet Club, Carvoeiro
  - text: County / region
  - textbox "County / region": Algarve
  - text: Country
  - textbox "Country": Portugal
  - text: Short public summary
  - textbox "Short public summary":
    - /placeholder: Two or three sentences for the public listing and event page.
    - text: Four nights in Carvoeiro with 18 hours of hosted pickleball and coaching, welcome drinks, a three-course group dinner and a fun tournament at Rocha Brava Racquet Club.
  - paragraph: 2 · Artwork
  - paragraph: Reuse the same poster for the full event page and a separately positioned card crop.
  - paragraph: Event poster / artwork
  - paragraph: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
  - paragraph: Verify poster from event webpage
  - paragraph: Find events on the organiser website, select one from the dropdown, and check whether it already exists in RallyHub. Poster verification does not create or duplicate events.
  - textbox "Event webpage URL":
    - /placeholder: https://pickleballireland.ie/events/
    - text: https://pickleballireland.ie/events/
  - button "Find event poster"
  - button "Find events on this website"
  - button "Run live poster verification"
  - text: Checks discovery, real upload and SHA-256 read-back without changing the event.
  - textbox "Original poster URL":
    - /placeholder: Paste an original poster image URL
  - button "Import original automatically" [disabled]
  - paragraph: Approved source domains only. RallyHub checks dimensions and verifies stored image bytes. Unverified images require manual review.
  - paragraph: Full artwork
  - text: Event detail page
  - img
  - text: Poster / artwork preview
  - paragraph: The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.
  - paragraph: Event-card crop
  - text: Public Events / member cards
  - img
  - text: Wide card preview
  - button "Upload poster":
    - img
    - text: Upload poster
  - paragraph: 3 · Registration
  - paragraph: RallyHub calculates normal registration status from the dates. Use a manual status only when something changes, such as an event filling up.
  - text: Event status
  - combobox "Event status “Event full” removes the normal registration action and clearly marks the public listing.":
    - option "Automatic from registration dates" [selected]
    - option "Save the date · registration not yet announced"
    - option "Event full"
    - option "Postponed"
    - option "Cancelled"
  - text: “Event full” removes the normal registration action and clearly marks the public listing. Registration method
  - combobox "Registration method":
    - option "External booking link"
    - option "RallyHub booking"
    - option "Contact organiser" [selected]
    - option "No registration required"
  - text: Registration opens
  - textbox "Registration opens"
  - text: Registration closes
  - textbox "Registration closes"
  - text: Entry fee / fee text
  - textbox "Entry fee / fee text":
    - /placeholder: e.g. €45 per event
    - text: £815 / €950 per person, based on two sharing a one-bedroom apartment.
  - text: Capacity
  - spinbutton "Capacity"
  - checkbox "Waitlist available when full"
  - text: Waitlist available when full
  - paragraph: 4 · Who is it for?
  - paragraph: Structured information powers the public filters rather than forcing players to read a long page.
  - paragraph: Playing levels
  - button "Beginner"
  - button "Recreational"
  - button "Social"
  - button "Improver"
  - button "Intermediate"
  - button "Advanced"
  - button "Competition"
  - button "Open"
  - button "3.0-"
  - button "3.5-"
  - button "4.0+"
  - paragraph: Age groups
  - button "All ages"
  - button "18+"
  - button "35+"
  - button "40+"
  - button "50+"
  - button "60+"
  - button "65+"
  - button "70+"
  - button "Junior"
  - paragraph: Disciplines
  - button "Singles"
  - button "Gender Doubles"
  - button "Mixed Doubles"
  - button "Open Doubles"
  - button "Team"
  - paragraph: 5 · Event information
  - paragraph: Optional detail stays collapsed on the public page until a player needs it.
  - text: General event description
  - textbox "General event description"
  - text: Eligibility & levels
  - textbox "Eligibility & levels": Designed for pickleball-loving women aged 60+.
  - text: Player information
  - textbox "Player information": Come alone or with a friend. Non-playing partners are welcome. Single supplements and additional nights are available on request. Flights and transfers are extra.
  - text: Fees & cancellation
  - textbox "Fees & cancellation"
  - paragraph: Collaboration / event partners (optional)
  - paragraph: Keep one canonical event even when two businesses or organisers are working together. The primary organiser stays the owner; partners are credited on the public event.
  - button "Add collaborator":
    - img
    - text: Add collaborator
  - textbox "Collaborator 1 name":
    - /placeholder: e.g. Pickleball Escapes
    - text: Pickleball Escapes
  - textbox "Collaborator 1 role":
    - /placeholder: e.g. In collaboration with
    - text: In collaboration with
  - textbox "Collaborator 1 link":
    - /placeholder: Website or RallyHub listing URL
  - button "Remove collaborator 1":
    - img
  - text: Organiser email
  - textbox "Organiser email":
    - /placeholder: organiser@example.com
    - text: smartertravel77@gmail.com
  - text: Organiser mobile
  - textbox "Organiser mobile":
    - /placeholder: e.g. 087 123 4567
    - text: "+353860488146"
  - text: Hide mobile publicly until
  - textbox "Hide mobile publicly until The mobile automatically appears after this time unless “keep private” is switched on."
  - text: The mobile automatically appears after this time unless “keep private” is switched on.
  - checkbox "Keep mobile private after that date"
  - text: Keep mobile private after that date
  - paragraph: Member-only information
  - paragraph: This field becomes available in the same position if your organisation later uses RallyHub Club. Nothing changes in the rest of the event editor.
  - paragraph: Day-by-day schedule
  - paragraph: Optional. Keep each day short and scannable.
  - button "Add day":
    - img
    - text: Add day
  - text: Official/source URL
  - textbox "Official/source URL": https://www.instagram.com/p/Dewzng0O6j2/
  - text: Map/directions URL
  - textbox "Map/directions URL"
  - text: Latitude
  - spinbutton "Latitude"
  - text: Longitude
  - spinbutton "Longitude"
  - paragraph: 6 · Audience & publishing
  - paragraph: Directory organisers publish the same canonical event to RallyHub public Events. If you later move into RallyHub Club, the member options appear here in the same place.
  - checkbox "Show to club members and in their Play calendar (available with RallyHub Club)" [disabled]
  - text: Show to club members and in their Play calendar (available with RallyHub Club)
  - checkbox "Publish on RallyHub public Events" [checked]
  - text: Publish on RallyHub public Events
  - checkbox "Feature on member home (available with RallyHub Club)" [disabled]
  - text: Feature on member home (available with RallyHub Club)
  - paragraph: 7 · Preview & publish
  - paragraph: Preview the same poster/crop and information before publishing.
  - button "Public card":
    - img
    - text: Public card
  - button "Public detail":
    - img
    - text: Public detail
  - button "Save draft":
    - img
    - text: Save draft
  - button "Publish to RallyHub Events":
    - img
    - text: Publish to RallyHub Events
  - complementary:
    - heading "Draft events" [level=2]
    - text: 1 Draft
    - paragraph: Sandra's Pickleball Passports · Carvoeiro, Portugal
    - paragraph: 2027-05-14 · Rocha Brava Racquet Club, Carvoeiro
    - button "Edit"
    - button "Delete Sandra's Pickleball Passports · Carvoeiro, Portugal":
      - img
    - heading "Published events" [level=2]
    - text: "0"
    - paragraph: No published events yet.
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
  119 |   await expect(page.getByTestId('directory-identity-step').getByText("Sandra's Pickleball Passports",{exact:true})).toBeVisible();
  120 |   await page.locator('input[name="identityChoice"][value="Smarter Travel"]').check();
  121 |   await page.getByRole('button',{name:'Confirm & continue'}).click();
  122 |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
> 123 |   await expect(page.getByText("Editing: Sandra's Pickleball Passports · Carvoeiro, Portugal")).toBeVisible();
      |                                                                                                ^ Error: expect(locator).toBeVisible() failed
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