# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> super admin discovery approval queue shows pending event and routes approval to backend
- Location: e2e/tenant-events.spec.mjs:175:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: false

Call Log:
- Timeout 3000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "RallyHub RallyHub SUPER ADMIN" [ref=e6] [cursor=pointer]:
        - /url: /app
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]:
          - generic [ref=e9]: RallyHub
          - generic [ref=e10]: SUPER ADMIN
      - navigation [ref=e11]:
        - generic [ref=e12]: SUPER ADMIN
        - link "Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /app
        - link "Admin Panel" [ref=e20] [cursor=pointer]:
          - /url: /app/admin
        - link "Control Library" [ref=e24] [cursor=pointer]:
          - /url: /app/admin?tab=control-library
        - link "Directory Admin" [ref=e28] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Communications" [ref=e32] [cursor=pointer]:
          - /url: /app/communications
        - link "Public Directory" [ref=e36] [cursor=pointer]:
          - /url: /directory
        - generic [ref=e41]: CLUB OPERATIONS
        - link "Member Messages" [ref=e42] [cursor=pointer]:
          - /url: /app/messages
        - link "Membership" [ref=e46] [cursor=pointer]:
          - /url: /app/membership
        - link "Finance Summary" [ref=e52] [cursor=pointer]:
          - /url: /app/finance
        - link "Waiting List" [ref=e58] [cursor=pointer]:
          - /url: /app/waiting-list
        - link "Players" [ref=e63] [cursor=pointer]:
          - /url: /app/players
        - link "Session Bookings" [ref=e70] [cursor=pointer]:
          - /url: /app/guest-bookings
        - link "Events" [ref=e75] [cursor=pointer]:
          - /url: /app/events
        - link "Tournaments" [ref=e81] [cursor=pointer]:
          - /url: /app/tournaments
        - link "Club Trials" [ref=e89] [cursor=pointer]:
          - /url: /app/trials
        - link "Club Leaderboard" [ref=e94] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Learn" [ref=e98] [cursor=pointer]:
          - /url: /app/learn/manage
        - link "Analytics" [ref=e102] [cursor=pointer]:
          - /url: /app/analytics
        - generic [ref=e106]: ACCOUNT
        - link "My Profile" [ref=e107] [cursor=pointer]:
          - /url: /app/my-profile
      - generic [ref=e115]:
        - paragraph [ref=e116]: Events Admin
        - paragraph [ref=e117]: Super Admin
    - generic [ref=e118]:
      - banner [ref=e119]:
        - generic [ref=e120]:
          - button "Current appearance Auto. Change appearance." [ref=e121] [cursor=pointer]:
            - generic [ref=e122]: Auto
          - button "EA Events Admin admin" [ref=e123] [cursor=pointer]:
            - generic [ref=e124]: EA
            - generic [ref=e125]:
              - paragraph [ref=e126]: Events Admin
              - paragraph [ref=e127]: admin
      - main [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e131]:
            - heading "Events" [level=1] [ref=e132]
            - paragraph [ref=e133]: Create once. Use the same event for members, RallyHub public Events and club sharing.
          - generic [ref=e134]:
            - generic [ref=e135]:
              - heading "Event Discovery · Super Admin approvals" [level=2] [ref=e136]
              - paragraph [ref=e137]: Discovered events remain private until approved. Select the host organisation above before publishing. Duplicates cannot be approved.
            - generic [ref=e138]:
              - generic [ref=e139]:
                - text: Verified Invitational 2027
                - generic [ref=e140]: (pending)
              - generic [ref=e141]: 2027-04-12 · Galway · Example Club
              - link "View original source" [ref=e142] [cursor=pointer]:
                - /url: https://example.org/event
              - generic [ref=e143]:
                - button "Approve & publish" [ref=e144] [cursor=pointer]
                - button "Hold" [ref=e145] [cursor=pointer]
                - button "Reject" [ref=e146] [cursor=pointer]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - paragraph [ref=e149]: The same seven-step event editor everywhere
              - paragraph [ref=e150]: Basics → Artwork → Registration → Who is it for? → Event information → Audience → Preview & publish.
            - link "Events Quick Start Guide" [ref=e151] [cursor=pointer]:
              - /url: /events/quick-start
          - generic [ref=e152]:
            - generic [ref=e153]:
              - paragraph [ref=e154]: Test automatic event poster discovery
              - paragraph [ref=e155]: Go directly to Step 2 · Artwork to check a poster from an organiser's event webpage.
            - button "Open poster verification ↓" [ref=e156] [cursor=pointer]
          - generic [ref=e157]:
            - generic [ref=e158]:
              - heading "Create event" [level=2] [ref=e163]
              - generic [ref=e165]:
                - text: Host / organisation
                - combobox "Host / organisation Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself." [ref=e166]:
                  - option "Choose host / organisation"
                  - option "Clare Pickleball" [selected]
                  - option "Pickleball Ireland"
                - generic [ref=e167]: Use a RallyHub club or internal organisation placeholder. Nothing here creates a public Directory listing by itself.
              - generic [ref=e168]:
                - generic [ref=e169]:
                  - paragraph [ref=e170]: 1 · Basics
                  - paragraph [ref=e171]: The information players need to identify the event quickly.
                - generic [ref=e172]:
                  - generic [ref=e173]:
                    - text: Event name
                    - textbox "Event name" [ref=e174]
                  - generic [ref=e175]:
                    - text: Event type
                    - combobox "Event type" [ref=e176]:
                      - option "Tournament"
                      - option "Interclub"
                      - option "League"
                      - option "Social"
                      - option "Coaching / Clinic"
                      - option "Camp"
                      - option "Open Day"
                      - option "Exhibition"
                      - option "Other" [selected]
                  - generic [ref=e177]:
                    - text: Indoor / outdoor
                    - combobox "Indoor / outdoor" [ref=e178]:
                      - option "Not specified" [selected]
                      - option "Indoor"
                      - option "Outdoor"
                      - option "Indoor / Outdoor"
                  - generic [ref=e179]:
                    - text: Starts
                    - textbox "Starts" [ref=e180]
                  - generic [ref=e181]:
                    - text: Ends
                    - textbox "Ends" [ref=e182]
                  - generic [ref=e183]:
                    - text: Start time
                    - textbox "Start time" [ref=e184]
                  - generic [ref=e185]:
                    - text: End time
                    - textbox "End time" [ref=e186]
                  - generic [ref=e187]:
                    - text: Club venue
                    - combobox "Club venue" [ref=e188]:
                      - option "Manual / external venue" [selected]
                      - option "St Joseph's Doora Barefield"
                  - generic [ref=e189]:
                    - text: Venue / location
                    - textbox "Venue / location" [ref=e190]:
                      - /placeholder: e.g. Lagan Valley LeisurePlex, Lisburn
                  - generic [ref=e191]:
                    - text: County / region
                    - textbox "County / region" [ref=e192]
                  - generic [ref=e193]:
                    - text: Country
                    - textbox "Country" [ref=e194]: Ireland
                  - generic [ref=e195]:
                    - text: Short public summary
                    - textbox "Short public summary" [ref=e196]:
                      - /placeholder: Two or three sentences for the public listing and event page.
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - paragraph [ref=e199]: 2 · Artwork
                  - paragraph [ref=e200]: Reuse the same poster for the full event page and a separately positioned card crop.
                - generic [ref=e201]:
                  - generic [ref=e202]:
                    - paragraph [ref=e203]: Event poster / artwork
                    - paragraph [ref=e204]: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
                  - generic [ref=e205]:
                    - paragraph [ref=e206]: Verify poster from event webpage
                    - paragraph [ref=e207]: Find events on the organiser website, select one from the dropdown, and check whether it already exists in RallyHub. Poster verification does not create or duplicate events.
                    - generic [ref=e208]:
                      - textbox "Event webpage URL" [ref=e209]:
                        - /placeholder: https://pickleballireland.ie/events/
                        - text: https://pickleballireland.ie/events/
                      - button "Find event poster" [disabled] [ref=e210]
                    - button "Find events on this website" [ref=e212] [cursor=pointer]
                    - generic [ref=e213]:
                      - button "Run live poster verification" [disabled] [ref=e214]
                      - generic [ref=e215]: Checks discovery, real upload and SHA-256 read-back without changing the event.
                  - generic [ref=e216]:
                    - textbox "Original poster URL" [ref=e217]:
                      - /placeholder: Paste an original poster image URL
                    - button "Import original automatically" [disabled] [ref=e218]
                  - paragraph [ref=e219]: Approved source domains only. RallyHub checks dimensions and verifies stored image bytes. Unverified images require manual review.
                  - generic [ref=e220]:
                    - generic [ref=e221]:
                      - generic [ref=e222]:
                        - paragraph [ref=e223]: Full artwork
                        - generic [ref=e224]: Event detail page
                      - generic [ref=e225]: Poster / artwork preview
                      - paragraph [ref=e233]: The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.
                    - generic [ref=e234]:
                      - generic [ref=e235]:
                        - paragraph [ref=e236]: Event-card crop
                        - generic [ref=e237]: Public Events / member cards
                      - generic [ref=e238]: Wide card preview
                  - button "Upload poster" [ref=e247] [cursor=pointer]
              - generic [ref=e251]:
                - generic [ref=e252]:
                  - paragraph [ref=e253]: 3 · Registration
                  - paragraph [ref=e254]: RallyHub calculates normal registration status from the dates. Use a manual status only when something changes, such as an event filling up.
                - generic [ref=e255]:
                  - generic [ref=e256]:
                    - text: Event status
                    - combobox "Event status “Event full” removes the normal registration action and clearly marks the public listing." [ref=e257]:
                      - option "Automatic from registration dates" [selected]
                      - option "Event full"
                      - option "Postponed"
                      - option "Cancelled"
                    - generic [ref=e258]: “Event full” removes the normal registration action and clearly marks the public listing.
                  - generic [ref=e259]:
                    - text: Registration method
                    - combobox "Registration method" [ref=e260]:
                      - option "External booking link" [selected]
                      - option "RallyHub booking"
                      - option "Contact organiser"
                      - option "No registration required"
                  - generic [ref=e261]:
                    - text: Registration URL
                    - textbox "Registration URL" [ref=e262]:
                      - /placeholder: https://…
                  - generic [ref=e263]:
                    - text: Registration opens
                    - textbox "Registration opens" [ref=e264]
                  - generic [ref=e265]:
                    - text: Registration closes
                    - textbox "Registration closes" [ref=e266]
                  - generic [ref=e267]:
                    - text: Entry fee / fee text
                    - textbox "Entry fee / fee text" [ref=e268]:
                      - /placeholder: e.g. €45 per event
                  - generic [ref=e269]:
                    - text: Capacity
                    - spinbutton "Capacity" [ref=e270]
                  - generic [ref=e271]:
                    - checkbox "Waitlist available when full" [ref=e272]
                    - text: Waitlist available when full
              - generic [ref=e273]:
                - generic [ref=e274]:
                  - paragraph [ref=e275]: 4 · Who is it for?
                  - paragraph [ref=e276]: Structured information powers the public filters rather than forcing players to read a long page.
                - generic [ref=e277]:
                  - paragraph [ref=e278]: Playing levels
                  - generic [ref=e279]:
                    - button "Beginner" [ref=e280] [cursor=pointer]
                    - button "Recreational" [ref=e281] [cursor=pointer]
                    - button "Social" [ref=e282] [cursor=pointer]
                    - button "Improver" [ref=e283] [cursor=pointer]
                    - button "Intermediate" [ref=e284] [cursor=pointer]
                    - button "Advanced" [ref=e285] [cursor=pointer]
                    - button "Competition" [ref=e286] [cursor=pointer]
                    - button "Open" [ref=e287] [cursor=pointer]
                    - button "3.0-" [ref=e288] [cursor=pointer]
                    - button "3.5-" [ref=e289] [cursor=pointer]
                    - button "4.0+" [ref=e290] [cursor=pointer]
                - generic [ref=e291]:
                  - paragraph [ref=e292]: Age groups
                  - generic [ref=e293]:
                    - button "All ages" [ref=e294] [cursor=pointer]
                    - button "18+" [ref=e295] [cursor=pointer]
                    - button "35+" [ref=e296] [cursor=pointer]
                    - button "40+" [ref=e297] [cursor=pointer]
                    - button "50+" [ref=e298] [cursor=pointer]
                    - button "60+" [ref=e299] [cursor=pointer]
                    - button "65+" [ref=e300] [cursor=pointer]
                    - button "70+" [ref=e301] [cursor=pointer]
                    - button "Junior" [ref=e302] [cursor=pointer]
                - generic [ref=e303]:
                  - paragraph [ref=e304]: Disciplines
                  - generic [ref=e305]:
                    - button "Singles" [ref=e306] [cursor=pointer]
                    - button "Gender Doubles" [ref=e307] [cursor=pointer]
                    - button "Mixed Doubles" [ref=e308] [cursor=pointer]
                    - button "Open Doubles" [ref=e309] [cursor=pointer]
                    - button "Team" [ref=e310] [cursor=pointer]
              - generic [ref=e311]:
                - generic [ref=e312]:
                  - paragraph [ref=e313]: 5 · Event information
                  - paragraph [ref=e314]: Optional detail stays collapsed on the public page until a player needs it.
                - generic [ref=e315]:
                  - text: General event description
                  - textbox "General event description" [ref=e316]
                - generic [ref=e317]:
                  - text: Eligibility & levels
                  - textbox "Eligibility & levels" [ref=e318]
                - generic [ref=e319]:
                  - text: Player information
                  - textbox "Player information" [ref=e320]
                - generic [ref=e321]:
                  - text: Fees & cancellation
                  - textbox "Fees & cancellation" [ref=e322]
                - generic [ref=e323]:
                  - generic [ref=e324]:
                    - text: Organiser email
                    - textbox "Organiser email" [ref=e325]:
                      - /placeholder: organiser@example.com
                  - generic [ref=e326]:
                    - text: Organiser mobile
                    - textbox "Organiser mobile" [ref=e327]:
                      - /placeholder: e.g. 087 123 4567
                  - generic [ref=e328]:
                    - text: Hide mobile publicly until
                    - textbox "Hide mobile publicly until The mobile automatically appears after this time unless “keep private” is switched on." [ref=e329]
                    - generic [ref=e330]: The mobile automatically appears after this time unless “keep private” is switched on.
                  - generic [ref=e331]:
                    - checkbox "Keep mobile private after that date" [ref=e332]
                    - text: Keep mobile private after that date
                - generic [ref=e333]:
                  - text: Member-only information
                  - textbox "Member-only information" [ref=e334]:
                    - /placeholder: Information that must not appear publicly.
                - generic [ref=e336]:
                  - generic [ref=e337]:
                    - paragraph [ref=e338]: Day-by-day schedule
                    - paragraph [ref=e339]: Optional. Keep each day short and scannable.
                  - button "Add day" [ref=e340] [cursor=pointer]
                - generic [ref=e341]:
                  - generic [ref=e342]:
                    - text: Official/source URL
                    - textbox "Official/source URL" [ref=e343]
                  - generic [ref=e344]:
                    - text: Map/directions URL
                    - textbox "Map/directions URL" [ref=e345]
                  - generic [ref=e346]:
                    - text: Latitude
                    - spinbutton "Latitude" [ref=e347]
                  - generic [ref=e348]:
                    - text: Longitude
                    - spinbutton "Longitude" [ref=e349]
              - generic [ref=e350]:
                - generic [ref=e351]:
                  - paragraph [ref=e352]: 6 · Audience & publishing
                  - paragraph [ref=e353]: One canonical event can appear to members, publicly, or both.
                - generic [ref=e354]:
                  - checkbox "Show to club members and in their Play calendar" [checked] [ref=e355]
                  - text: Show to club members and in their Play calendar
                - generic [ref=e356]:
                  - checkbox "Publish on RallyHub public Events" [ref=e357]
                  - text: Publish on RallyHub public Events
                - generic [ref=e358]:
                  - checkbox "Feature on member home for an important club fixture/event" [ref=e359]
                  - text: Feature on member home
                  - generic [ref=e360]: for an important club fixture/event
                - generic [ref=e361]:
                  - checkbox "Feature on RallyHub public Events" [ref=e362]
                  - text: Feature on RallyHub public Events
                - generic [ref=e363]:
                  - checkbox "Verified organiser badge" [ref=e364]
                  - text: Verified organiser badge
              - generic [ref=e365]:
                - generic [ref=e366]:
                  - paragraph [ref=e367]: 7 · Preview & publish
                  - paragraph [ref=e368]: Preview the same poster/crop and information before publishing.
                - generic [ref=e369]:
                  - button "Public card" [ref=e370] [cursor=pointer]
                  - button "Public detail" [ref=e371] [cursor=pointer]
                  - button "Member view" [ref=e372] [cursor=pointer]
                - generic [ref=e373]:
                  - button "Save draft" [ref=e374] [cursor=pointer]
                  - button "Publish selected audiences" [ref=e375] [cursor=pointer]
                - paragraph [ref=e376]: Publishing to members updates the event in their RallyHub member calendar. It does not send a separate broadcast message unless you choose to message members separately.
            - complementary [ref=e377]:
              - generic [ref=e378]:
                - generic [ref=e379]:
                  - heading "Draft events" [level=2] [ref=e380]
                  - generic [ref=e381]: "0"
                - paragraph [ref=e383]: No draft events.
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - heading "Published events" [level=2] [ref=e386]
                  - generic [ref=e387]: "0"
                - paragraph [ref=e389]: No published events yet.
  - contentinfo "RallyHub copyright" [ref=e390]:
    - generic [ref=e391]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
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
  137 | test('claimed directory event editor discovers and imports original artwork',async({page})=>{
  138 |  const model=await installBackend(page);
  139 |  const image='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  140 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club',county:'Clare'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  141 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:image,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
  142 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:image,width:1254,height:900}));
  143 |  await page.goto('/directory/test-club/events');
  144 |  await page.getByLabel('Event name').fill('Munster Open 2027');
  145 |  await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  146 |  await page.getByRole('button',{name:'Find event poster'}).click();
  147 |  await expect(page.getByLabel('Original poster URL')).toHaveValue(image);
  148 |  await page.getByRole('button',{name:'Import original automatically'}).click();
  149 |  await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',image);
  150 | });
  151 | 
  152 | test('authenticated directory live-verification control checks both functions without saving event',async({page})=>{
  153 |  const model=await installBackend(page);const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  154 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  155 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',score:150}}));
  156 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:'https://base44.app/verified.webp',width:1254,height:900,sha256:'a'.repeat(64)}));
  157 |  await page.goto('/directory/test-club/events');await page.getByLabel('Event name').fill('Munster Open 2027');await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  158 |  await page.getByRole('button',{name:'Run live poster verification'}).click();await expect(page.getByRole('status')).toContainText('PASS: Storage verified');
  159 |  expect(model.writes).toHaveLength(0);
  160 | });
  161 | 
  162 | test('directory event finder offers selectable event list and enables verification',async({page})=>{
  163 |  await installBackend(page);
  164 |  const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  165 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  166 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,events:[{name:'Munster Open 2027',eventUrl:'https://pickleballireland.ie/event/munster-open-2027/',imageUrl:poster},{name:'European Open 2026',eventUrl:'https://pickleballireland.ie/event/european-open-2026/',imageUrl:poster}]}));
  167 |  await page.goto('/directory/test-club/events');
  168 |  await page.getByRole('button',{name:'Find events on this website'}).click();
  169 |  await expect(page.getByLabel('Select discovered event')).toBeVisible();
  170 |  await page.getByLabel('Filter discovered events').fill('Munster');
  171 |  await page.getByLabel('Select discovered event').selectOption('https://pickleballireland.ie/event/munster-open-2027/');
  172 |  await expect(page.getByRole('button',{name:'Run live poster verification'})).toBeEnabled();
  173 | });
  174 | 
  175 | test('super admin discovery approval queue shows pending event and routes approval to backend',async({page})=>{
  176 |  const model=await installBackend(page);
  177 |  const candidate={id:'proposal-1',name:'Verified Invitational 2027',start_date:'2027-04-12',location:'Galway',organiser:'Example Club',source_url:'https://example.org/event',status:'pending',duplicateEventId:null};
  178 |  await page.route(`**/api/apps/${APP_ID}/functions/eventDiscoveryApproval`,async route=>{
  179 |   const body=route.request().postDataJSON()||{};
  180 |   if(body.action==='list')return json(route,{success:true,candidates:[candidate]});
  181 |   if(body.action==='decide')return json(route,{success:true,publishedEventId:'published-1'});
  182 |   return json(route,{error:'Unexpected action'},400);
  183 |  });
  184 |  await page.goto('/app/events');
  185 |  await expect(page.getByTestId('event-discovery-queue')).toBeVisible();
  186 |  await expect(page.getByText('Verified Invitational 2027')).toBeVisible();
  187 |  await page.getByTestId('event-discovery-queue').getByRole('button',{name:'Hold'}).click();
> 188 |  await expect.poll(()=>model.functions.some(x=>x.name==='eventDiscoveryApproval'&&x.body.action==='decide'&&x.body.decision==='held'&&x.body.id==='proposal-1')).toBeTruthy();
      |                                                                                                                                                                  ^ Error: expect(received).toBeTruthy()
  189 | });
  190 | 
```