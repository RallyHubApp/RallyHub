# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> tenant Events: create, upload/crop, preview and publish one canonical public/member event
- Location: e2e/tenant-events.spec.mjs:42:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Events', exact: true })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Events', exact: true }) with timeout 3000ms
  - waiting for getByRole('heading', { name: 'Events', exact: true })

```

```yaml
- complementary:
  - link "RallyHub RallyHub SUPER ADMIN":
    - /url: /app
    - img "RallyHub"
    - text: RallyHub SUPER ADMIN
  - navigation:
    - text: SUPER ADMIN
    - link "Dashboard":
      - /url: /app
      - img
      - text: Dashboard
    - link "Admin Panel":
      - /url: /app/admin
      - img
      - text: Admin Panel
    - link "Control Library":
      - /url: /app/admin?tab=control-library
      - img
      - text: Control Library
    - link "Directory Admin":
      - /url: /app/admin?tab=directory
      - img
      - text: Directory Admin
    - link "Communications":
      - /url: /app/communications
      - img
      - text: Communications
    - link "Public Directory":
      - /url: /directory
      - img
      - text: Public Directory
    - text: CLUB OPERATIONS
    - link "Member Messages":
      - /url: /app/messages
      - img
      - text: Member Messages
    - link "Membership":
      - /url: /app/membership
      - img
      - text: Membership
    - link "Finance Summary":
      - /url: /app/finance
      - img
      - text: Finance Summary
    - link "Waiting List":
      - /url: /app/waiting-list
      - img
      - text: Waiting List
    - link "Players":
      - /url: /app/players
      - img
      - text: Players
    - link "Session Bookings":
      - /url: /app/guest-bookings
      - img
      - text: Session Bookings
    - link "Events":
      - /url: /app/events
      - img
      - text: Events
      - img
    - link "Tournaments":
      - /url: /app/tournaments
      - img
      - text: Tournaments
    - link "Club Trials":
      - /url: /app/trials
      - img
      - text: Club Trials
    - link "Club Leaderboard":
      - /url: /app/leaderboard
      - img
      - text: Club Leaderboard
    - link "Learn":
      - /url: /app/learn/manage
      - img
      - text: Learn
    - link "Analytics":
      - /url: /app/analytics
      - img
      - text: Analytics
    - text: ACCOUNT
    - link "My Profile":
      - /url: /app/my-profile
      - img
      - text: My Profile
  - paragraph: Events Admin
  - paragraph: Super Admin
- banner:
  - button "Current appearance Auto. Change appearance.":
    - img
    - text: Auto
  - button "EA Events Admin admin":
    - text: EA
    - paragraph: Events Admin
    - paragraph: admin
- main:
  - heading "Events" [level=1]
  - paragraph: Create once. Use the same event for members, RallyHub public Events and club sharing.
  - paragraph: The same seven-step event editor everywhere
  - paragraph: Basics → Artwork → Registration → Who is it for? → Event information → Audience → Preview & publish.
  - link "Events Quick Start Guide":
    - /url: /events/quick-start
  - img
  - heading "Create event" [level=2]
  - text: Host / organisation
  - combobox "Host / organisation Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.":
    - option "Choose host / organisation" [selected]
  - text: Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.
  - paragraph: 1 · Basics
  - paragraph: The information players need to identify the event quickly.
  - text: Event name
  - textbox "Event name"
  - text: Event type
  - combobox "Event type":
    - option "Tournament"
    - option "Interclub"
    - option "League"
    - option "Social"
    - option "Coaching / Clinic"
    - option "Camp"
    - option "Open Day"
    - option "Exhibition"
    - option "Other" [selected]
  - text: Indoor / outdoor
  - combobox "Indoor / outdoor":
    - option "Not specified" [selected]
    - option "Indoor"
    - option "Outdoor"
    - option "Indoor / Outdoor"
  - text: Starts
  - textbox "Starts"
  - text: Ends
  - textbox "Ends"
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
  - text: County / region
  - textbox "County / region"
  - text: Country
  - textbox "Country": Ireland
  - text: Short public summary
  - textbox "Short public summary":
    - /placeholder: Two or three sentences for the public listing and event page.
  - paragraph: 2 · Artwork
  - paragraph: Reuse the same poster for the full event page and a separately positioned card crop.
  - paragraph: Event poster / artwork
  - paragraph: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
  - textbox "Event webpage URL":
    - /placeholder: Paste event webpage URL to find its poster
  - button "Find event poster" [disabled]
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
    - option "Event full"
    - option "Postponed"
    - option "Cancelled"
  - text: “Event full” removes the normal registration action and clearly marks the public listing. Registration method
  - combobox "Registration method":
    - option "External booking link" [selected]
    - option "RallyHub booking"
    - option "Contact organiser"
    - option "No registration required"
  - text: Registration URL
  - textbox "Registration URL":
    - /placeholder: https://…
  - text: Registration opens
  - textbox "Registration opens"
  - text: Registration closes
  - textbox "Registration closes"
  - text: Entry fee / fee text
  - textbox "Entry fee / fee text":
    - /placeholder: e.g. €45 per event
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
  - textbox "Eligibility & levels"
  - text: Player information
  - textbox "Player information"
  - text: Fees & cancellation
  - textbox "Fees & cancellation"
  - text: Organiser email
  - textbox "Organiser email":
    - /placeholder: organiser@example.com
  - text: Organiser mobile
  - textbox "Organiser mobile":
    - /placeholder: e.g. 087 123 4567
  - text: Hide mobile publicly until
  - textbox "Hide mobile publicly until The mobile automatically appears after this time unless “keep private” is switched on."
  - text: The mobile automatically appears after this time unless “keep private” is switched on.
  - checkbox "Keep mobile private after that date"
  - text: Keep mobile private after that date Member-only information
  - textbox "Member-only information":
    - /placeholder: Information that must not appear publicly.
  - paragraph: Day-by-day schedule
  - paragraph: Optional. Keep each day short and scannable.
  - button "Add day":
    - img
    - text: Add day
  - text: Official/source URL
  - textbox "Official/source URL"
  - text: Map/directions URL
  - textbox "Map/directions URL"
  - text: Latitude
  - spinbutton "Latitude"
  - text: Longitude
  - spinbutton "Longitude"
  - paragraph: 6 · Audience & publishing
  - paragraph: One canonical event can appear to members, publicly, or both.
  - checkbox "Show to club members and in their Play calendar" [checked]
  - text: Show to club members and in their Play calendar
  - checkbox "Publish on RallyHub public Events"
  - text: Publish on RallyHub public Events
  - checkbox "Feature on member home for an important club fixture/event"
  - text: Feature on member home for an important club fixture/event
  - checkbox "Feature on RallyHub public Events"
  - text: Feature on RallyHub public Events
  - checkbox "Verified organiser badge"
  - text: Verified organiser badge
  - paragraph: 7 · Preview & publish
  - paragraph: Preview the same poster/crop and information before publishing.
  - button "Public card":
    - img
    - text: Public card
  - button "Public detail":
    - img
    - text: Public detail
  - button "Member view":
    - img
    - text: Member view
  - button "Save draft":
    - img
    - text: Save draft
  - button "Publish selected audiences":
    - img
    - text: Publish selected audiences
  - paragraph: Publishing to members updates the event in their RallyHub member calendar. It does not send a separate broadcast message unless you choose to message members separately.
  - complementary:
    - heading "Draft events" [level=2]
    - text: "0"
    - paragraph: No draft events.
    - heading "Published events" [level=2]
    - text: "0"
    - paragraph: No published events yet.
- contentinfo "RallyHub copyright": © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID='6a01dc00702b7dd2a2978c28';
  4   | const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
  5   | const user={id:'tenant-events-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
  6   | const clubs=[{id:'club-clare',tenant_id:'tenant-clare',name:'Clare Pickleball',slug:'clare-pickleball',status:'active'},{id:'club-pbi',tenant_id:'tenant-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',status:'active'}];
  7   | const venues=[{id:'venue-doora',tenant_id:'tenant-clare',club_id:'club-clare',name:"St Joseph's Doora Barefield",status:'active'}];
  8   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  9   | 
  10  | async function installBackend(page){
  11  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','tenant-events-e2e-token'));
  12  |   const model={events:[],writes:[],functions:[]};
  13  |   await page.route('**/api/apps/**',async route=>{
  14  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  15  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  16  |     if(path.includes('/analytics/'))return json(route,{});
  17  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  18  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
  19  |     if(fi>=0){const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}model.functions.push({name,body});if(name==='securityContext')return json(route,{success:true,context:null});if(name==='eventEngagement'&&body.action==='club_shared')return json(route,{success:true,items:[]});if(name==='secureCreditAction')return json(route,{success:true,preview_url:onePixel,file_url:'https://files.example.test/poster.png'});return json(route,{success:true})}
  20  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
  21  |     if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  22  |       if(req.method()==='GET'){
  23  |         if(entity==='Club')return json(route,clubs);
  24  |         if(entity==='Venue')return json(route,venues);
  25  |         if(entity==='Tournament')return json(route,model.events);
  26  |         if(entity==='ClubChallengeEvent')return json(route,[]);
  27  |         return json(route,[]);
  28  |       }
  29  |       if(req.method()==='POST'){
  30  |         const created={id:`created-${model.events.length+1}`,...body};model.events.push(created);model.writes.push({method:'POST',entity,body:created});return json(route,created);
  31  |       }
  32  |       if(['PUT','PATCH'].includes(req.method())){const idx=model.events.findIndex(e=>e.id===recordId);const updated={...(idx>=0?model.events[idx]:{id:recordId}),...body};if(idx>=0)model.events[idx]=updated;model.writes.push({method:req.method(),entity,body:updated});return json(route,updated)}
  33  |       if(req.method()==='DELETE')return json(route,{});
  34  |     }
  35  |     return json(route,{});
  36  |   });
  37  |   return model;
  38  | }
  39  | 
  40  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  41  | 
  42  | test('tenant Events: create, upload/crop, preview and publish one canonical public/member event',async({page})=>{
  43  |   const model=await installBackend(page);
  44  |   await page.goto('/app/events');
> 45  |   await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  46  |   await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  47  |   await page.getByLabel('Event name').fill('Test RallyHub Open');
  48  |   await page.getByLabel('Event type').selectOption('tournament');
  49  |   await page.getByLabel('Starts').fill('2026-12-05');
  50  |   await page.getByLabel('Ends').fill('2026-12-06');
  51  |   await page.getByLabel('Start time').fill('09:30');
  52  |   await page.getByLabel('End time').fill('17:00');
  53  |   await page.getByLabel('Club venue').selectOption('venue-doora');
  54  |   await page.getByLabel('County / region').fill('Clare');
  55  |   await page.getByLabel('Short public summary').fill('A two-day pickleball event built through the shared RallyHub event editor.');
  56  |   await page.getByLabel('Registration URL').fill('https://register.example.test/open');
  57  |   await page.getByLabel('Registration opens').fill('2026-10-01T09:00');
  58  |   await page.getByLabel('Registration closes').fill('2026-12-01T23:00');
  59  |   await page.getByText('Intermediate',{exact:true}).click();
  60  |   await page.getByText('18+',{exact:true}).click();
  61  |   await page.getByText('Mixed Doubles',{exact:true}).click();
  62  | 
  63  |   const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=','base64');
  64  |   await page.locator('input[type=file]').setInputFiles({name:'event-poster.png',mimeType:'image/png',buffer:png});
  65  |   await expect(page.getByText('Uploaded',{exact:true})).toBeVisible();
  66  |   await expect(page.getByText('Event-card crop',{exact:true}).first()).toBeVisible();
  67  |   const crop=page.getByTestId('event-card-crop');
  68  |   await crop.scrollIntoViewIfNeeded();
  69  |   const box=await crop.boundingBox();
  70  |   expect(box).toBeTruthy();
  71  |   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  72  |   await page.mouse.down();
  73  |   await page.mouse.move(box.x+box.width/2,box.y+box.height*0.72,{steps:5});
  74  |   await page.mouse.up();
  75  |   const sliders=page.locator('input[type=range]');
  76  |   await sliders.nth(5).fill('1.5');
  77  | 
  78  |   await page.getByLabel('Publish on RallyHub public Events').check();
  79  |   await page.getByRole('button',{name:'Public card'}).click();
  80  |   await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  81  |   await expect(page.getByText('PREVIEW',{exact:true})).toBeVisible();
  82  |   await page.getByRole('button',{name:'Back to editor'}).click();
  83  | 
  84  |   await page.getByRole('button',{name:'Publish selected audiences'}).click();
  85  |   await expect(page.getByText('Published to members + public Events ✓')).toBeVisible();
  86  |   expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  87  |   const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  88  |   expect(payload.event_public_visible).toBe(true);
  89  |   expect(payload.event_member_visible).toBe(true);
  90  |   expect(payload.event_card_zoom).toBe(1.5);
  91  |   expect(payload.event_card_position_y).not.toBe(50);
  92  |   expect(payload.event_slug).toBe('test-rallyhub-open');
  93  |   expect(payload.event_levels).toContain('Intermediate');
  94  |   expect(payload.event_age_groups).toContain('18+');
  95  |   expect(payload.event_disciplines).toContain('Mixed Doubles');
  96  |   expect(payload.event_publish_status).toBe('published');
  97  |   await noHorizontalOverflow(page);
  98  | });
  99  | 
  100 | test.describe('tenant Events mobile',()=>{
  101 |   test.use({viewport:{width:390,height:844}});
  102 |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  103 |     await installBackend(page);
  104 |     await page.goto('/app/events');
  105 |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  106 |     await page.getByLabel('Event name').fill('Mobile Event');
  107 |     await page.getByLabel('Starts').fill('2026-12-05');
  108 |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  109 |     await noHorizontalOverflow(page);
  110 |   });
  111 | });
  112 | 
  113 | test('event artwork: automatically import a verified original without manual uploader',async({page})=>{
  114 |  const model=await installBackend(page);
  115 |  const source='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/poster.webp';
  116 |  const stored='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/verified-poster.webp';
  117 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:stored,sourceUrl:source,width:1510,height:1042,bytes:177208,sha256:'test-digest',reviewRequired:false}));
  118 |  await page.goto('/app/events');
  119 |  await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
  120 |  await page.getByLabel('Original poster URL').fill(source);
  121 |  await page.getByRole('button',{name:'Import original automatically'}).click();
  122 |  await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',stored);
  123 |  await expect(page.getByAltText('Event card crop preview')).toHaveAttribute('src',stored);
  124 | });
  125 | 
  126 | test('event page URL discovers matching poster before verified import',async({page})=>{
  127 |  await installBackend(page);
  128 |  const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  129 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
  130 |  await page.goto('/app/events');
  131 |  await page.getByLabel('Event name').fill('Munster Open 2027');
  132 |  await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  133 |  await page.getByRole('button',{name:'Find event poster'}).click();
  134 |  await expect(page.getByLabel('Original poster URL')).toHaveValue(poster);
  135 | });
  136 | 
```