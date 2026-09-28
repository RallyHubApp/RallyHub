# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> tenant Events: create, upload/crop, preview and publish one canonical public/member event
- Location: e2e/tenant-events.spec.mjs:42:1

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not 50
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "RallyHub RallyHub" [ref=e6] [cursor=pointer]:
        - /url: /app
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]: RallyHub
      - navigation [ref=e9]:
        - link "Dashboard" [ref=e10] [cursor=pointer]:
          - /url: /app
        - link "Member Messages" [ref=e16] [cursor=pointer]:
          - /url: /app/messages
        - link "Membership" [ref=e19] [cursor=pointer]:
          - /url: /app/membership
        - link "Waiting List" [ref=e24] [cursor=pointer]:
          - /url: /app/waiting-list
        - link "Events" [ref=e28] [cursor=pointer]:
          - /url: /app/events
        - link "Players" [ref=e33] [cursor=pointer]:
          - /url: /app/players
        - link "Tournaments" [ref=e39] [cursor=pointer]:
          - /url: /app/tournaments
        - link "Club Leaderboard" [ref=e46] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Analytics" [ref=e49] [cursor=pointer]:
          - /url: /app/analytics
      - generic [ref=e52]:
        - link "Switch to Directory" [ref=e53] [cursor=pointer]:
          - /url: /directory
        - link "Directory Admin" [ref=e57] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Session Bookings" [ref=e60] [cursor=pointer]:
          - /url: /app/guest-bookings
        - link "My Profile" [ref=e64] [cursor=pointer]:
          - /url: /app/my-profile
        - link "Admin Panel" [ref=e69] [cursor=pointer]:
          - /url: /app/admin
      - generic [ref=e73]:
        - paragraph [ref=e74]: Events Admin
        - paragraph [ref=e75]: Super Admin
    - generic [ref=e76]:
      - banner [ref=e77]:
        - generic [ref=e78]:
          - button "Current appearance Auto. Change appearance." [ref=e79] [cursor=pointer]:
            - generic [ref=e80]: Auto
          - button "EA Events Admin admin" [ref=e81] [cursor=pointer]:
            - generic [ref=e82]: EA
            - generic [ref=e83]:
              - paragraph [ref=e84]: Events Admin
              - paragraph [ref=e85]: admin
      - main [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e89]:
            - heading "Events" [level=1] [ref=e90]
            - paragraph [ref=e91]: Create once. Use the same event for members, RallyHub public Events and club sharing.
          - generic [ref=e92]:
            - generic [ref=e93]:
              - paragraph [ref=e94]: The same seven-step event editor everywhere
              - paragraph [ref=e95]: Basics → Artwork → Registration → Who is it for? → Event information → Audience → Preview & publish.
            - link "Events Quick Start Guide" [ref=e96] [cursor=pointer]:
              - /url: /events/quick-start
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - generic [ref=e100]:
                  - 'heading "Editing: Test RallyHub Open" [level=2] [ref=e103]'
                  - button "Close editor" [ref=e104] [cursor=pointer]
                - paragraph [ref=e105]: Edit the canonical event once; member and public views use the same record.
              - generic [ref=e107]:
                - text: Host / organisation
                - combobox "Host / organisation Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself." [ref=e108]:
                  - option "Choose host / organisation"
                  - option "Clare Pickleball" [selected]
                  - option "Pickleball Ireland"
                - generic [ref=e109]: Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.
              - generic [ref=e110]:
                - generic [ref=e111]:
                  - paragraph [ref=e112]: 1 · Basics
                  - paragraph [ref=e113]: The information players need to identify the event quickly.
                - generic [ref=e114]:
                  - generic [ref=e115]:
                    - text: Event name
                    - textbox "Event name" [ref=e116]: Test RallyHub Open
                  - generic [ref=e117]:
                    - text: Event type
                    - combobox "Event type" [ref=e118]:
                      - option "Tournament" [selected]
                      - option "Interclub"
                      - option "League"
                      - option "Social"
                      - option "Coaching / Clinic"
                      - option "Camp"
                      - option "Open Day"
                      - option "Exhibition"
                      - option "Other"
                  - generic [ref=e119]:
                    - text: Indoor / outdoor
                    - combobox "Indoor / outdoor" [ref=e120]:
                      - option "Not specified" [selected]
                      - option "Indoor"
                      - option "Outdoor"
                      - option "Indoor / Outdoor"
                  - generic [ref=e121]:
                    - text: Starts
                    - textbox "Starts" [ref=e122]: 2026-12-05
                  - generic [ref=e123]:
                    - text: Ends
                    - textbox "Ends" [ref=e124]: 2026-12-06
                  - generic [ref=e125]:
                    - text: Start time
                    - textbox "Start time" [ref=e126]: 09:30
                  - generic [ref=e127]:
                    - text: End time
                    - textbox "End time" [ref=e128]: 17:00
                  - generic [ref=e129]:
                    - text: Club venue
                    - combobox "Club venue" [ref=e130]:
                      - option "Manual / external venue"
                      - option "St Joseph's Doora Barefield" [selected]
                  - generic [ref=e131]:
                    - text: Venue / location
                    - textbox "Venue / location" [ref=e132]:
                      - /placeholder: e.g. Lagan Valley LeisurePlex, Lisburn
                      - text: St Joseph's Doora Barefield
                  - generic [ref=e133]:
                    - text: County / region
                    - textbox "County / region" [ref=e134]: Clare
                  - generic [ref=e135]:
                    - text: Country
                    - textbox "Country" [ref=e136]: Ireland
                  - generic [ref=e137]:
                    - text: Short public summary
                    - textbox "Short public summary" [ref=e138]:
                      - /placeholder: Two or three sentences for the public listing and event page.
                      - text: A two-day pickleball event built through the shared RallyHub event editor.
              - generic [ref=e139]:
                - generic [ref=e140]:
                  - paragraph [ref=e141]: 2 · Artwork
                  - paragraph [ref=e142]: Reuse the same poster for the full event page and a separately positioned card crop.
                - generic [ref=e143]:
                  - generic [ref=e144]:
                    - paragraph [ref=e145]: Event poster / artwork
                    - paragraph [ref=e146]: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
                  - generic [ref=e147]:
                    - generic [ref=e148]:
                      - generic [ref=e149]:
                        - paragraph [ref=e150]: Full artwork
                        - generic [ref=e151]: Event detail page
                      - img "Event poster preview" [ref=e153]
                      - paragraph [ref=e154]: The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.
                    - generic [ref=e155]:
                      - generic [ref=e156]:
                        - paragraph [ref=e157]: Event-card crop
                        - generic [ref=e158]: Public Events / member cards
                      - generic [ref=e159]:
                        - img "Event card crop preview"
                        - generic: Drag the poster to choose the part shown on cards
                      - paragraph [ref=e160]:
                        - strong [ref=e161]: Drag directly on the crop
                        - text: to choose the part of the poster players see first, then use Zoom for fine adjustment. The original poster remains untouched.
                  - generic [ref=e162]:
                    - button "Replace poster" [ref=e163] [cursor=pointer]
                    - button "Reset crops" [ref=e167] [cursor=pointer]
                    - button "Remove" [ref=e171] [cursor=pointer]
                    - generic [ref=e175]: Uploaded
                  - generic [ref=e179]:
                    - generic [ref=e180]:
                      - paragraph [ref=e181]: Full poster positioning
                      - generic [ref=e182]:
                        - generic [ref=e183]:
                          - text: Left / right
                          - slider "Left / right" [ref=e184]: "50"
                        - generic [ref=e185]:
                          - text: Up / down
                          - slider "Up / down" [ref=e186]: "50"
                        - generic [ref=e187]:
                          - text: Zoom
                          - slider "Zoom" [ref=e188]: "1"
                    - generic [ref=e189]:
                      - paragraph [ref=e190]: Event-card crop
                      - generic [ref=e191]:
                        - generic [ref=e192]:
                          - text: Left / right
                          - slider "Left / right" [ref=e193]: "50"
                        - generic [ref=e194]:
                          - text: Up / down
                          - slider "Up / down" [ref=e195]: "50"
                        - generic [ref=e196]:
                          - text: Zoom
                          - slider "Zoom" [ref=e197]: "1.5"
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - paragraph [ref=e200]: 3 · Registration
                  - paragraph [ref=e201]: RallyHub calculates normal registration status from the dates. Use a manual status only when something changes, such as an event filling up.
                - generic [ref=e202]:
                  - generic [ref=e203]:
                    - text: Event status
                    - combobox "Event status “Event full” removes the normal registration action and clearly marks the public listing." [ref=e204]:
                      - option "Automatic from registration dates" [selected]
                      - option "Event full"
                      - option "Postponed"
                      - option "Cancelled"
                    - generic [ref=e205]: “Event full” removes the normal registration action and clearly marks the public listing.
                  - generic [ref=e206]:
                    - text: Registration method
                    - combobox "Registration method" [ref=e207]:
                      - option "External booking link" [selected]
                      - option "RallyHub booking"
                      - option "Contact organiser"
                      - option "No registration required"
                  - generic [ref=e208]:
                    - text: Registration URL
                    - textbox "Registration URL" [ref=e209]:
                      - /placeholder: https://…
                      - text: https://register.example.test/open
                  - generic [ref=e210]:
                    - text: Registration opens
                    - textbox "Registration opens" [ref=e211]: 2026-10-01T09:00
                  - generic [ref=e212]:
                    - text: Registration closes
                    - textbox "Registration closes" [ref=e213]: 2026-12-01T23:00
                  - generic [ref=e214]:
                    - text: Entry fee / fee text
                    - textbox "Entry fee / fee text" [ref=e215]:
                      - /placeholder: e.g. €45 per event
                  - generic [ref=e216]:
                    - text: Capacity
                    - spinbutton "Capacity" [ref=e217]
                  - generic [ref=e218]:
                    - checkbox "Waitlist available when full" [ref=e219]
                    - text: Waitlist available when full
                - generic [ref=e220]:
                  - strong [ref=e221]: "Calculated registration state:"
                  - text: Opens in 3 days
              - generic [ref=e222]:
                - generic [ref=e223]:
                  - paragraph [ref=e224]: 4 · Who is it for?
                  - paragraph [ref=e225]: Structured information powers the public filters rather than forcing players to read a long page.
                - generic [ref=e226]:
                  - paragraph [ref=e227]: Playing levels
                  - generic [ref=e228]:
                    - button "Beginner" [ref=e229] [cursor=pointer]
                    - button "Recreational" [ref=e230] [cursor=pointer]
                    - button "Social" [ref=e231] [cursor=pointer]
                    - button "Improver" [ref=e232] [cursor=pointer]
                    - button "Intermediate" [ref=e233] [cursor=pointer]
                    - button "Advanced" [ref=e234] [cursor=pointer]
                    - button "Competition" [ref=e235] [cursor=pointer]
                    - button "Open" [ref=e236] [cursor=pointer]
                    - button "3.0-" [ref=e237] [cursor=pointer]
                    - button "3.5-" [ref=e238] [cursor=pointer]
                    - button "4.0+" [ref=e239] [cursor=pointer]
                - generic [ref=e240]:
                  - paragraph [ref=e241]: Age groups
                  - generic [ref=e242]:
                    - button "All ages" [ref=e243] [cursor=pointer]
                    - button "18+" [ref=e244] [cursor=pointer]
                    - button "35+" [ref=e245] [cursor=pointer]
                    - button "40+" [ref=e246] [cursor=pointer]
                    - button "50+" [ref=e247] [cursor=pointer]
                    - button "60+" [ref=e248] [cursor=pointer]
                    - button "65+" [ref=e249] [cursor=pointer]
                    - button "70+" [ref=e250] [cursor=pointer]
                    - button "Junior" [ref=e251] [cursor=pointer]
                - generic [ref=e252]:
                  - paragraph [ref=e253]: Disciplines
                  - generic [ref=e254]:
                    - button "Singles" [ref=e255] [cursor=pointer]
                    - button "Gender Doubles" [ref=e256] [cursor=pointer]
                    - button "Mixed Doubles" [ref=e257] [cursor=pointer]
                    - button "Open Doubles" [ref=e258] [cursor=pointer]
                    - button "Team" [ref=e259] [cursor=pointer]
              - generic [ref=e260]:
                - generic [ref=e261]:
                  - paragraph [ref=e262]: 5 · Event information
                  - paragraph [ref=e263]: Optional detail stays collapsed on the public page until a player needs it.
                - generic [ref=e264]:
                  - text: General event description
                  - textbox "General event description" [ref=e265]
                - generic [ref=e266]:
                  - text: Eligibility & levels
                  - textbox "Eligibility & levels" [ref=e267]
                - generic [ref=e268]:
                  - text: Player information
                  - textbox "Player information" [ref=e269]
                - generic [ref=e270]:
                  - text: Fees & cancellation
                  - textbox "Fees & cancellation" [ref=e271]
                - generic [ref=e272]:
                  - generic [ref=e273]:
                    - text: Organiser email
                    - textbox "Organiser email" [ref=e274]:
                      - /placeholder: organiser@example.com
                  - generic [ref=e275]:
                    - text: Organiser mobile
                    - textbox "Organiser mobile" [ref=e276]:
                      - /placeholder: e.g. 087 123 4567
                  - generic [ref=e277]:
                    - text: Hide mobile publicly until
                    - textbox "Hide mobile publicly until The mobile automatically appears after this time unless “keep private” is switched on." [ref=e278]
                    - generic [ref=e279]: The mobile automatically appears after this time unless “keep private” is switched on.
                  - generic [ref=e280]:
                    - checkbox "Keep mobile private after that date" [ref=e281]
                    - text: Keep mobile private after that date
                - generic [ref=e282]:
                  - text: Member-only information
                  - textbox "Member-only information" [ref=e283]:
                    - /placeholder: Information that must not appear publicly.
                - generic [ref=e285]:
                  - generic [ref=e286]:
                    - paragraph [ref=e287]: Day-by-day schedule
                    - paragraph [ref=e288]: Optional. Keep each day short and scannable.
                  - button "Add day" [ref=e289] [cursor=pointer]
                - generic [ref=e290]:
                  - generic [ref=e291]:
                    - text: Official/source URL
                    - textbox "Official/source URL" [ref=e292]
                  - generic [ref=e293]:
                    - text: Map/directions URL
                    - textbox "Map/directions URL" [ref=e294]
                  - generic [ref=e295]:
                    - text: Latitude
                    - spinbutton "Latitude" [ref=e296]
                  - generic [ref=e297]:
                    - text: Longitude
                    - spinbutton "Longitude" [ref=e298]
              - generic [ref=e299]:
                - generic [ref=e300]:
                  - paragraph [ref=e301]: 6 · Audience & publishing
                  - paragraph [ref=e302]: One canonical event can appear to members, publicly, or both.
                - generic [ref=e303]:
                  - checkbox "Show to club members and in their Play calendar" [checked] [ref=e304]
                  - text: Show to club members and in their Play calendar
                - generic [ref=e305]:
                  - checkbox "Publish on RallyHub public Events" [checked] [ref=e306]
                  - text: Publish on RallyHub public Events
                - generic [ref=e307]:
                  - checkbox "Feature on member home for an important club fixture/event" [ref=e308]
                  - text: Feature on member home
                  - generic [ref=e309]: for an important club fixture/event
                - generic [ref=e310]:
                  - checkbox "Feature on RallyHub public Events" [ref=e311]
                  - text: Feature on RallyHub public Events
                - generic [ref=e312]:
                  - checkbox "Verified organiser badge" [ref=e313]
                  - text: Verified organiser badge
              - generic [ref=e314]:
                - generic [ref=e315]:
                  - paragraph [ref=e316]: 7 · Preview & publish
                  - paragraph [ref=e317]: Preview the same poster/crop and information before publishing.
                - generic [ref=e318]:
                  - button "Public card" [ref=e319] [cursor=pointer]
                  - button "Public detail" [ref=e320] [cursor=pointer]
                  - button "Member view" [ref=e321] [cursor=pointer]
                - generic [ref=e322]:
                  - button "Save draft" [ref=e323] [cursor=pointer]
                  - button "Save & update selected audiences" [ref=e324] [cursor=pointer]
                - generic [ref=e325]:
                  - text: Published to members + public Events ✓
                  - link "View public event" [ref=e326] [cursor=pointer]:
                    - /url: /events/test-rallyhub-open
                - paragraph [ref=e327]: Publishing to members updates the event in their RallyHub member calendar. It does not send a separate broadcast message unless you choose to message members separately.
            - complementary [ref=e328]:
              - generic [ref=e329]:
                - generic [ref=e330]:
                  - heading "Draft events" [level=2] [ref=e331]
                  - generic [ref=e332]: "0"
                - paragraph [ref=e334]: No draft events.
              - generic [ref=e335]:
                - generic [ref=e336]:
                  - heading "Published events" [level=2] [ref=e337]
                  - generic [ref=e338]: "1"
                - generic [ref=e341]:
                  - generic [ref=e342]:
                    - generic [ref=e343]:
                      - generic [ref=e344]: MEMBERS
                      - generic [ref=e345]: PUBLIC
                    - paragraph [ref=e346]: Test RallyHub Open
                    - paragraph [ref=e347]: 2026-12-05 · St Joseph's Doora Barefield
                  - button "Edit" [ref=e348] [cursor=pointer]
  - contentinfo "RallyHub copyright" [ref=e349]:
    - generic [ref=e350]: © 2026 RallyHub All rights reserved.
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
  67  |   const crop=page.getByTestId('event-card-crop');
  68  |   const box=await crop.boundingBox();
  69  |   expect(box).toBeTruthy();
  70  |   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  71  |   await page.mouse.down();
  72  |   await page.mouse.move(box.x+box.width/2,box.y+box.height*0.72,{steps:5});
  73  |   await page.mouse.up();
  74  |   const sliders=page.locator('input[type=range]');
  75  |   await sliders.nth(5).fill('1.5');
  76  | 
  77  |   await page.getByLabel('Publish on RallyHub public Events').check();
  78  |   await page.getByRole('button',{name:'Public card'}).click();
  79  |   await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  80  |   await expect(page.getByText('PREVIEW',{exact:true})).toBeVisible();
  81  |   await page.getByRole('button',{name:'Back to editor'}).click();
  82  | 
  83  |   await page.getByRole('button',{name:'Publish selected audiences'}).click();
  84  |   await expect(page.getByText('Published to members + public Events ✓')).toBeVisible();
  85  |   expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  86  |   const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  87  |   expect(payload.event_public_visible).toBe(true);
  88  |   expect(payload.event_member_visible).toBe(true);
  89  |   expect(payload.event_card_zoom).toBe(1.5);
> 90  |   expect(payload.event_card_position_y).not.toBe(50);
      |                                             ^ Error: expect(received).not.toBe(expected) // Object.is equality
  91  |   expect(payload.event_slug).toBe('test-rallyhub-open');
  92  |   expect(payload.event_levels).toContain('Intermediate');
  93  |   expect(payload.event_age_groups).toContain('18+');
  94  |   expect(payload.event_disciplines).toContain('Mixed Doubles');
  95  |   expect(payload.event_publish_status).toBe('published');
  96  |   await noHorizontalOverflow(page);
  97  | });
  98  | 
  99  | test.describe('tenant Events mobile',()=>{
  100 |   test.use({viewport:{width:390,height:844}});
  101 |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  102 |     await installBackend(page);
  103 |     await page.goto('/app/events');
  104 |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  105 |     await page.getByLabel('Event name').fill('Mobile Event');
  106 |     await page.getByLabel('Starts').fill('2026-12-05');
  107 |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  108 |     await noHorizontalOverflow(page);
  109 |   });
  110 | });
  111 | 
```