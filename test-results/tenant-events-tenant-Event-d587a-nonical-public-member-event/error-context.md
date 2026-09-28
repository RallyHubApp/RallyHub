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

Locator: getByText('Published ✓')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Published ✓') with timeout 3000ms
  - waiting for getByText('Published ✓')

```

```yaml
- complementary:
  - link "RallyHub RallyHub":
    - /url: /app
    - img "RallyHub"
    - text: RallyHub
  - navigation:
    - link "Dashboard":
      - /url: /app
      - img
      - text: Dashboard
    - link "Member Messages":
      - /url: /app/messages
      - img
      - text: Member Messages
    - link "Membership":
      - /url: /app/membership
      - img
      - text: Membership
    - link "Waiting List":
      - /url: /app/waiting-list
      - img
      - text: Waiting List
    - link "Events":
      - /url: /app/events
      - img
      - text: Events
      - img
    - link "Players":
      - /url: /app/players
      - img
      - text: Players
    - link "Tournaments":
      - /url: /app/tournaments
      - img
      - text: Tournaments
    - link "Club Leaderboard":
      - /url: /app/leaderboard
      - img
      - text: Club Leaderboard
    - link "Analytics":
      - /url: /app/analytics
      - img
      - text: Analytics
  - link "Switch to Directory":
    - /url: /directory
    - img
    - text: Switch to Directory
  - link "Directory Admin":
    - /url: /app/admin?tab=directory
    - img
    - text: Directory Admin
  - link "Session Bookings":
    - /url: /app/guest-bookings
    - img
    - text: Session Bookings
  - link "My Profile":
    - /url: /app/my-profile
    - img
    - text: My Profile
  - link "Admin Panel":
    - /url: /app/admin
    - img
    - text: Admin Panel
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
  - 'heading "Editing: Test RallyHub Open" [level=2]'
  - button "Close editor":
    - img
    - text: Close editor
  - paragraph: Edit the canonical event once; member and public views use the same record.
  - text: Host / organisation
  - combobox "Host / organisation Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.":
    - option "Choose host / organisation"
    - option "Clare Pickleball" [selected]
    - option "Pickleball Ireland"
  - text: Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.
  - paragraph: 1 · Basics
  - paragraph: The information players need to identify the event quickly.
  - text: Event name
  - textbox "Event name": Test RallyHub Open
  - text: Event type
  - combobox "Event type":
    - option "Tournament" [selected]
    - option "Interclub"
    - option "League"
    - option "Social"
    - option "Coaching / Clinic"
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
  - textbox "Starts": 2026-12-05
  - text: Ends
  - textbox "Ends": 2026-12-06
  - text: Start time
  - textbox "Start time": 09:30
  - text: End time
  - textbox "End time": 17:00
  - text: Club venue
  - combobox "Club venue":
    - option "Manual / external venue"
    - option "St Joseph's Doora Barefield" [selected]
  - text: Venue / location
  - textbox "Venue / location":
    - /placeholder: e.g. Lagan Valley LeisurePlex, Lisburn
    - text: St Joseph's Doora Barefield
  - text: County / region
  - textbox "County / region": Clare
  - text: Country
  - textbox "Country": Ireland
  - text: Short public summary
  - textbox "Short public summary":
    - /placeholder: Two or three sentences for the public listing and event page.
    - text: A two-day pickleball event built through the shared RallyHub event editor.
  - paragraph: 2 · Artwork
  - paragraph: Reuse the same poster for the full event page and a separately positioned card crop.
  - paragraph: Event poster / artwork
  - paragraph: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
  - paragraph: Full artwork
  - text: Event detail page
  - img "Event poster preview"
  - paragraph: The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.
  - paragraph: Event-card crop
  - text: Public Events / member cards
  - img "Event card crop preview"
  - text: This is the snippet players see first
  - paragraph: Move and zoom this crop independently. The original poster remains untouched.
  - button "Replace poster":
    - img
    - text: Replace poster
  - button "Reset crops":
    - img
    - text: Reset crops
  - button "Remove":
    - img
    - text: Remove
  - img
  - text: Uploaded
  - paragraph: Full poster positioning
  - text: Left / right
  - slider "Left / right": "50"
  - text: Up / down
  - slider "Up / down": "50"
  - text: Zoom
  - slider "Zoom": "1"
  - paragraph: Event-card crop
  - text: Left / right
  - slider "Left / right": "50"
  - text: Up / down
  - slider "Up / down": "50"
  - text: Zoom
  - slider "Zoom": "1.5"
  - paragraph: 3 · Registration
  - paragraph: RallyHub calculates Open, Opening soon, Closing soon and Closed from these dates.
  - text: Registration method
  - combobox "Registration method":
    - option "External booking link" [selected]
    - option "RallyHub booking"
    - option "Contact organiser"
    - option "No registration required"
  - text: Registration URL
  - textbox "Registration URL":
    - /placeholder: https://…
    - text: https://register.example.test/open
  - text: Registration opens
  - textbox "Registration opens": 2026-10-01T09:00
  - text: Registration closes
  - textbox "Registration closes": 2026-12-01T23:00
  - text: Entry fee / fee text
  - textbox "Entry fee / fee text":
    - /placeholder: e.g. €45 per event
  - text: Capacity
  - spinbutton "Capacity"
  - checkbox "Waitlist available when full"
  - text: Waitlist available when full
  - strong: "Calculated registration state:"
  - text: Opens in 3 days
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
  - text: Contact organiser
  - textbox "Contact organiser":
    - /placeholder: Email, phone or instructions
  - text: Member-only information
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
  - checkbox "Publish on RallyHub public Events" [checked]
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
  - button "Save & update selected audiences":
    - img
    - text: Save & update selected audiences
  - text: Published to members + public Events ✓
  - link "View public event":
    - /url: /events/test-rallyhub-open
  - paragraph: Publishing to members updates the event in their RallyHub member calendar. It does not send a separate broadcast message unless you choose to message members separately.
  - complementary:
    - heading "Draft events" [level=2]
    - text: "0"
    - paragraph: No draft events.
    - heading "Published events" [level=2]
    - text: 1 MEMBERS PUBLIC
    - paragraph: Test RallyHub Open
    - paragraph: 2026-12-05 · St Joseph's Doora Barefield
    - button "Edit"
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
  45  |   await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
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
  67  |   const sliders=page.locator('input[type=range]');
  68  |   await sliders.nth(5).fill('1.5');
  69  | 
  70  |   await page.getByLabel('Publish on RallyHub public Events').check();
  71  |   await page.getByRole('button',{name:'Public card'}).click();
  72  |   await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  73  |   await expect(page.getByText('PREVIEW',{exact:true})).toBeVisible();
  74  |   await page.getByRole('button',{name:'Back to editor'}).click();
  75  | 
  76  |   await page.getByRole('button',{name:'Publish selected audiences'}).click();
> 77  |   await expect(page.getByText('Published ✓')).toBeVisible();
      |                                               ^ Error: expect(locator).toBeVisible() failed
  78  |   expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  79  |   const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  80  |   expect(payload.event_public_visible).toBe(true);
  81  |   expect(payload.event_member_visible).toBe(true);
  82  |   expect(payload.event_card_zoom).toBe(1.5);
  83  |   expect(payload.event_slug).toBe('test-rallyhub-open');
  84  |   expect(payload.event_levels).toContain('Intermediate');
  85  |   expect(payload.event_age_groups).toContain('18+');
  86  |   expect(payload.event_disciplines).toContain('Mixed Doubles');
  87  |   expect(payload.event_publish_status).toBe('published');
  88  |   await noHorizontalOverflow(page);
  89  | });
  90  | 
  91  | test.describe('tenant Events mobile',()=>{
  92  |   test.use({viewport:{width:390,height:844}});
  93  |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  94  |     await installBackend(page);
  95  |     await page.goto('/app/events');
  96  |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  97  |     await page.getByLabel('Event name').fill('Mobile Event');
  98  |     await page.getByLabel('Starts').fill('2026-12-05');
  99  |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  100 |     await noHorizontalOverflow(page);
  101 |   });
  102 | });
  103 | 
```