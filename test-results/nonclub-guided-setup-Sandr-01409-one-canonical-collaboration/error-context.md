# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nonclub-guided-setup.spec.mjs >> Sandra email deep-link skips completed work, preserves the prefilled event and publishes one canonical collaboration
- Location: e2e/nonclub-guided-setup.spec.mjs:120:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Publish to RallyHub Events' })

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
      - generic [ref=e25]:
        - link "Back to manage listing" [ref=e26] [cursor=pointer]:
          - /url: /directory/sandras-pickleball-passports/edit
        - link "Events Quick Start Guide" [ref=e29] [cursor=pointer]:
          - /url: /events/quick-start
      - generic [ref=e32]:
        - generic [ref=e34]:
          - heading "Events · Sandra's Pickleball Passports" [level=1] [ref=e35]
          - paragraph [ref=e36]: Create and maintain public RallyHub events here. The editor is the same one clubs use inside RallyHub Club, so there is nothing new to relearn later.
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]:
              - generic [ref=e40]: Listing ✓
              - generic [ref=e41]: →
              - generic [ref=e42]: Event
              - generic [ref=e43]: →
              - generic [ref=e44]: Preview
              - generic [ref=e45]: →
              - generic [ref=e46]: Live
            - link "Back to setup checklist" [ref=e47] [cursor=pointer]:
              - /url: /directory/sandras-pickleball-passports/edit?guided=1
          - generic [ref=e48]:
            - paragraph [ref=e49]: Your listing details are ready. Add the event you want players to see.
            - paragraph [ref=e50]: Your public organiser email, phone and website are reused below where available. When you publish the event, RallyHub will also make your organiser listing live.
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e53]: The same seven-step event editor everywhere
            - paragraph [ref=e54]: Basics → Artwork → Registration → Who is it for? → Event information → Audience → Preview & publish.
          - link "Events Quick Start Guide" [ref=e55] [cursor=pointer]:
            - /url: /events/quick-start
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]:
                - 'heading "Editing: Sandra''s Pickleball Passports · Carvoeiro, Portugal" [level=2] [ref=e62]'
                - button "Close editor" [ref=e63] [cursor=pointer]
              - paragraph [ref=e64]: Edit the canonical event once; member and public views use the same record.
            - generic [ref=e65]:
              - generic [ref=e66]:
                - paragraph [ref=e67]: 1 · Basics
                - paragraph [ref=e68]: The information players need to identify the event quickly.
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - text: Event name
                  - textbox "Event name" [ref=e71]: Sandra's Pickleball Passports · Carvoeiro, Portugal
                - generic [ref=e72]:
                  - text: Event type
                  - combobox "Event type" [ref=e73]:
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
                - generic [ref=e74]:
                  - text: Indoor / outdoor
                  - combobox "Indoor / outdoor" [ref=e75]:
                    - option "Not specified" [selected]
                    - option "Indoor"
                    - option "Outdoor"
                    - option "Indoor / Outdoor"
                - generic [ref=e76]:
                  - text: Starts
                  - textbox "Starts" [ref=e77]: 2027-05-14
                - generic [ref=e78]:
                  - text: Ends
                  - textbox "Ends" [ref=e79]: 2027-05-18
                - generic [ref=e80]:
                  - text: Start time
                  - textbox "Start time" [ref=e81]
                - generic [ref=e82]:
                  - text: End time
                  - textbox "End time" [ref=e83]
                - generic [ref=e84]:
                  - text: Club venue
                  - combobox "Club venue" [ref=e85]:
                    - option "Manual / external venue" [selected]
                - generic [ref=e86]:
                  - text: Venue / location
                  - textbox "Venue / location" [ref=e87]:
                    - /placeholder: e.g. Lagan Valley LeisurePlex, Lisburn
                    - text: Rocha Brava Racquet Club, Carvoeiro
                - generic [ref=e88]:
                  - text: County / region
                  - textbox "County / region" [ref=e89]: Algarve
                - generic [ref=e90]:
                  - text: Country
                  - textbox "Country" [ref=e91]: Portugal
                - generic [ref=e92]:
                  - text: Short public summary
                  - textbox "Short public summary" [ref=e93]:
                    - /placeholder: Two or three sentences for the public listing and event page.
                    - text: Four nights in Carvoeiro with 18 hours of hosted pickleball and coaching, welcome drinks, a three-course group dinner and a fun tournament at Rocha Brava Racquet Club.
            - generic [ref=e94]:
              - generic [ref=e95]:
                - paragraph [ref=e96]: 2 · Artwork
                - paragraph [ref=e97]: Reuse the same poster for the full event page and a separately positioned card crop.
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - paragraph [ref=e100]: Event poster / artwork
                  - paragraph [ref=e101]: Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.
                - generic [ref=e102]:
                  - paragraph [ref=e103]: Verify poster from event webpage
                  - paragraph [ref=e104]: Find events on the organiser website, select one from the dropdown, and check whether it already exists in RallyHub. Poster verification does not create or duplicate events.
                  - generic [ref=e105]:
                    - textbox "Event webpage URL" [ref=e106]:
                      - /placeholder: https://pickleballireland.ie/events/
                      - text: https://pickleballireland.ie/events/
                    - button "Find event poster" [ref=e107] [cursor=pointer]
                  - button "Find events on this website" [ref=e109] [cursor=pointer]
                  - generic [ref=e110]:
                    - button "Run live poster verification" [ref=e111] [cursor=pointer]
                    - generic [ref=e112]: Checks discovery, real upload and SHA-256 read-back without changing the event.
                - generic [ref=e113]:
                  - textbox "Original poster URL" [ref=e114]:
                    - /placeholder: Paste an original poster image URL
                  - button "Import original automatically" [disabled] [ref=e115]
                - paragraph [ref=e116]: Approved source domains only. RallyHub checks dimensions and verifies stored image bytes. Unverified images require manual review.
                - generic [ref=e117]:
                  - generic [ref=e118]:
                    - generic [ref=e119]:
                      - paragraph [ref=e120]: Full artwork
                      - generic [ref=e121]: Event detail page
                    - generic [ref=e122]: Poster / artwork preview
                    - paragraph [ref=e130]: The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.
                  - generic [ref=e131]:
                    - generic [ref=e132]:
                      - paragraph [ref=e133]: Event-card crop
                      - generic [ref=e134]: Public Events / member cards
                    - generic [ref=e135]: Wide card preview
                - button "Upload poster" [ref=e144] [cursor=pointer]
            - generic [ref=e148]:
              - generic [ref=e149]:
                - paragraph [ref=e150]: 3 · Registration
                - paragraph [ref=e151]: RallyHub calculates normal registration status from the dates. Use a manual status only when something changes, such as an event filling up.
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - text: Event status
                  - combobox "Event status “Event full” removes the normal registration action and clearly marks the public listing." [ref=e154]:
                    - option "Automatic from registration dates" [selected]
                    - option "Save the date · registration not yet announced"
                    - option "Event full"
                    - option "Postponed"
                    - option "Cancelled"
                  - generic [ref=e155]: “Event full” removes the normal registration action and clearly marks the public listing.
                - generic [ref=e156]:
                  - text: Registration method
                  - combobox "Registration method" [ref=e157]:
                    - option "External booking link"
                    - option "RallyHub booking"
                    - option "Contact organiser" [selected]
                    - option "No registration required"
                - generic [ref=e158]:
                  - text: Registration opens
                  - textbox "Registration opens" [ref=e159]
                - generic [ref=e160]:
                  - text: Registration closes
                  - textbox "Registration closes" [ref=e161]
                - generic [ref=e162]:
                  - text: Entry fee / fee text
                  - textbox "Entry fee / fee text" [ref=e163]:
                    - /placeholder: e.g. €45 per event
                    - text: £815 / €950 per person, based on two sharing a one-bedroom apartment.
                - generic [ref=e164]:
                  - text: Capacity
                  - spinbutton "Capacity" [ref=e165]
                - generic [ref=e166]:
                  - checkbox "Waitlist available when full" [ref=e167]
                  - text: Waitlist available when full
            - generic [ref=e168]:
              - generic [ref=e169]:
                - paragraph [ref=e170]: 4 · Who is it for?
                - paragraph [ref=e171]: Structured information powers the public filters rather than forcing players to read a long page.
              - generic [ref=e172]:
                - paragraph [ref=e173]: Playing levels
                - generic [ref=e174]:
                  - button "Beginner" [ref=e175] [cursor=pointer]
                  - button "Recreational" [ref=e176] [cursor=pointer]
                  - button "Social" [ref=e177] [cursor=pointer]
                  - button "Improver" [ref=e178] [cursor=pointer]
                  - button "Intermediate" [ref=e179] [cursor=pointer]
                  - button "Advanced" [ref=e180] [cursor=pointer]
                  - button "Competition" [ref=e181] [cursor=pointer]
                  - button "Open" [ref=e182] [cursor=pointer]
                  - button "3.0-" [ref=e183] [cursor=pointer]
                  - button "3.5-" [ref=e184] [cursor=pointer]
                  - button "4.0+" [ref=e185] [cursor=pointer]
              - generic [ref=e186]:
                - paragraph [ref=e187]: Age groups
                - generic [ref=e188]:
                  - button "All ages" [ref=e189] [cursor=pointer]
                  - button "18+" [ref=e190] [cursor=pointer]
                  - button "35+" [ref=e191] [cursor=pointer]
                  - button "40+" [ref=e192] [cursor=pointer]
                  - button "50+" [ref=e193] [cursor=pointer]
                  - button "60+" [ref=e194] [cursor=pointer]
                  - button "65+" [ref=e195] [cursor=pointer]
                  - button "70+" [ref=e196] [cursor=pointer]
                  - button "Junior" [ref=e197] [cursor=pointer]
              - generic [ref=e198]:
                - paragraph [ref=e199]: Disciplines
                - generic [ref=e200]:
                  - button "Singles" [ref=e201] [cursor=pointer]
                  - button "Gender Doubles" [ref=e202] [cursor=pointer]
                  - button "Mixed Doubles" [ref=e203] [cursor=pointer]
                  - button "Open Doubles" [ref=e204] [cursor=pointer]
                  - button "Team" [ref=e205] [cursor=pointer]
            - generic [ref=e206]:
              - generic [ref=e207]:
                - paragraph [ref=e208]: 5 · Event information
                - paragraph [ref=e209]: Optional detail stays collapsed on the public page until a player needs it.
              - generic [ref=e210]:
                - text: General event description
                - textbox "General event description" [ref=e211]
              - generic [ref=e212]:
                - text: Eligibility & levels
                - textbox "Eligibility & levels" [ref=e213]: Designed for pickleball-loving women aged 60+.
              - generic [ref=e214]:
                - text: Player information
                - textbox "Player information" [ref=e215]: Come alone or with a friend. Non-playing partners are welcome. Single supplements and additional nights are available on request. Flights and transfers are extra.
              - generic [ref=e216]:
                - text: Fees & cancellation
                - textbox "Fees & cancellation" [ref=e217]
              - generic [ref=e218]:
                - generic [ref=e219]:
                  - generic [ref=e220]:
                    - paragraph [ref=e221]: Collaboration / event partners (optional)
                    - paragraph [ref=e222]: Keep one canonical event even when two businesses or organisers are working together. The primary organiser stays the owner; partners are credited on the public event.
                  - button "Add collaborator" [ref=e223] [cursor=pointer]
                - generic [ref=e225]:
                  - textbox "Collaborator 1 name" [ref=e226]:
                    - /placeholder: e.g. Pickleball Escapes
                    - text: Pickleball Escapes
                  - textbox "Collaborator 1 role" [ref=e227]:
                    - /placeholder: e.g. In collaboration with
                    - text: In collaboration with
                  - textbox "Collaborator 1 link" [active] [ref=e228]:
                    - /placeholder: Website or RallyHub listing URL
                    - text: https://rallyhub.ie/directory/pickleball-escapes
                  - button "Remove collaborator 1" [ref=e229] [cursor=pointer]
              - generic [ref=e230]:
                - generic [ref=e231]:
                  - text: Organiser email
                  - textbox "Organiser email" [ref=e232]:
                    - /placeholder: organiser@example.com
                    - text: smartertravel77@gmail.com
                - generic [ref=e233]:
                  - text: Organiser mobile
                  - textbox "Organiser mobile" [ref=e234]:
                    - /placeholder: e.g. 087 123 4567
                    - text: "+353860488146"
                - generic [ref=e235]:
                  - text: Hide mobile publicly until
                  - textbox "Hide mobile publicly until The mobile automatically appears after this time unless “keep private” is switched on." [ref=e236]
                  - generic [ref=e237]: The mobile automatically appears after this time unless “keep private” is switched on.
                - generic [ref=e238]:
                  - checkbox "Keep mobile private after that date" [ref=e239]
                  - text: Keep mobile private after that date
              - generic [ref=e240]:
                - paragraph [ref=e241]: Member-only information
                - paragraph [ref=e242]: This field becomes available in the same position if your organisation later uses RallyHub Club. Nothing changes in the rest of the event editor.
              - generic [ref=e244]:
                - generic [ref=e245]:
                  - paragraph [ref=e246]: Day-by-day schedule
                  - paragraph [ref=e247]: Optional. Keep each day short and scannable.
                - button "Add day" [ref=e248] [cursor=pointer]
              - generic [ref=e249]:
                - generic [ref=e250]:
                  - text: Official/source URL
                  - textbox "Official/source URL" [ref=e251]: https://www.instagram.com/p/Dewzng0O6j2/
                - generic [ref=e252]:
                  - text: Map/directions URL
                  - textbox "Map/directions URL" [ref=e253]
                - generic [ref=e254]:
                  - text: Latitude
                  - spinbutton "Latitude" [ref=e255]
                - generic [ref=e256]:
                  - text: Longitude
                  - spinbutton "Longitude" [ref=e257]
            - generic [ref=e258]:
              - generic [ref=e259]:
                - paragraph [ref=e260]: 6 · Audience & publishing
                - paragraph [ref=e261]: Directory organisers publish the same canonical event to RallyHub public Events. If you later move into RallyHub Club, the member options appear here in the same place.
              - generic [ref=e262]:
                - checkbox "Show to club members and in their Play calendar (available with RallyHub Club)" [disabled] [ref=e263]
                - text: Show to club members and in their Play calendar
                - generic [ref=e264]: (available with RallyHub Club)
              - generic [ref=e265]:
                - checkbox "Publish on RallyHub public Events" [ref=e266]
                - text: Publish on RallyHub public Events
              - generic [ref=e267]:
                - checkbox "Feature on member home (available with RallyHub Club)" [disabled] [ref=e268]
                - text: Feature on member home
                - generic [ref=e269]: (available with RallyHub Club)
            - generic [ref=e270]:
              - generic [ref=e271]:
                - paragraph [ref=e272]: 7 · Preview & publish
                - paragraph [ref=e273]: Preview the same poster/crop and information before publishing.
              - generic [ref=e274]:
                - button "Public card" [ref=e275] [cursor=pointer]
                - button "Public detail" [ref=e276] [cursor=pointer]
              - generic [ref=e277]:
                - button "Save draft" [ref=e278] [cursor=pointer]
                - button "Save & update public event" [disabled]
          - complementary [ref=e279]:
            - generic [ref=e280]:
              - generic [ref=e281]:
                - heading "Draft events" [level=2] [ref=e282]
                - generic [ref=e283]: "1"
              - generic [ref=e286]:
                - generic [ref=e287]:
                  - generic [ref=e288]: Draft
                  - paragraph [ref=e289]: Sandra's Pickleball Passports · Carvoeiro, Portugal
                  - paragraph [ref=e290]: 2027-05-14 · Rocha Brava Racquet Club, Carvoeiro
                - generic [ref=e291]:
                  - button "Edit" [ref=e292] [cursor=pointer]
                  - button "Delete Sandra's Pickleball Passports · Carvoeiro, Portugal" [ref=e293] [cursor=pointer]
            - generic [ref=e294]:
              - generic [ref=e295]:
                - heading "Published events" [level=2] [ref=e296]
                - generic [ref=e297]: "0"
              - paragraph [ref=e299]: No published events yet.
    - contentinfo "RallyHub footer" [ref=e301]:
      - generic [ref=e302]:
        - generic [ref=e303]:
          - link "RallyHub home" [ref=e304] [cursor=pointer]:
            - /url: /
            - img "RallyHub" [ref=e305]
          - navigation "Footer navigation" [ref=e306]:
            - link "Directory" [ref=e307] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e308] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e309] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e310] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e311] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e312]: © 2026 RallyHub All rights reserved.
  - generic [ref=e314]:
    - generic [ref=e315]:
      - paragraph [ref=e316]: Help us improve RallyHub
      - paragraph [ref=e317]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e318]:
      - button "Necessary only" [ref=e319] [cursor=pointer]
      - button "Allow analytics" [ref=e320] [cursor=pointer]
```

# Test source

```ts
  33  |     if(path.endsWith('/entities/User/me'))return reply(user);
  34  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  35  |     const idx=path.indexOf(fnMarker);
  36  |     if(idx>=0){
  37  |       const name=decodeURIComponent(path.slice(idx+fnMarker.length).split('/')[0]);
  38  |       let body={};try{body=req.postDataJSON()||{}}catch{}
  39  |       calls.push({name,body});
  40  |       if(name==='securityContext')return reply({success:true,context:null});
  41  |       if(name==='directoryCategory')return reply({success:true,categories:[
  42  |         {key:'club',label:'Club / place to play',pluralLabel:'Clubs & places to play',active:true,sortOrder:10,clubFirst:true,locationMode:'county',showListingForm:true},
  43  |         {key:'tournaments_events',label:'Tournament / event organiser',pluralLabel:'Tournaments & events',active:true,sortOrder:20,locationMode:'service_area',showListingForm:true},
  44  |         {key:'coaching',label:'Coach / coaching',pluralLabel:'Coaching',active:true,sortOrder:30,locationMode:'service_area',showListingForm:true},
  45  |         {key:'holidays',label:'Pickleball holiday',pluralLabel:'Pickleball holidays',active:true,sortOrder:40,locationMode:'service_area',showListingForm:true},
  46  |         {key:'equipment',label:'Equipment / supplier',pluralLabel:'Equipment & suppliers',active:true,sortOrder:50,locationMode:'none',showListingForm:true},
  47  |         {key:'other',label:'Other pickleball service',pluralLabel:'Other pickleball services',active:true,sortOrder:90,locationMode:'service_area',showListingForm:true},
  48  |       ]});
  49  |       if(name==='directoryClaim'){
  50  |         if(body.action==='new_status')return reply({success:true,request:null});
  51  |         if(body.action==='status')return reply({success:true,hasAccess:true,accessRole:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,verificationStatus:'verified'}});
  52  |         if(body.action==='submit_new')return reply({success:true,status:'approved',listingSlug:holidayBase.slug,setupDraft:true,request:{status:'approved',approved_listing_slug:holidayBase.slug}});
  53  |         if(body.action==='set_visibility')return reply({success:true,listingSlug:holidayBase.slug,visibility:'public'});
  54  |         return reply({success:true});
  55  |       }
  56  |       if(name==='directoryListingProfile'){
  57  |         if(body.action==='public_list')return reply({success:true,listings:[]});
  58  |         if(body.action==='private_get')return reply({success:true,listingSlug:holidayBase.slug,visibility:'preview_only',verificationStatus:'verified',profile:null,base:holidayBase});
  59  |         if(body.action==='save')return reply({success:true,profile:body.profile,id:'profile-1'});
  60  |         return reply({success:true,profile:null,base:null});
  61  |       }
  62  |       if(name==='directoryEvents'){
  63  |         if(body.action==='list')return reply({success:true,canManage:true,role:'owner',listing:{slug:holidayBase.slug,name:holidayBase.name,listingType:'holidays',serviceArea:'Ireland & Portugal',visibility:'preview_only',profile:{contact:holidayBase.contact,website:holidayBase.website,instagram:holidayBase.instagram,facebook:'',logoUrl:''}},host:{id:'host-sandra',name:holidayBase.name},tenant:{id:'tenant-sandra'},events:[sandraEvent],venues:[]});
  64  |         if(body.action==='save')return reply({success:true,event:{id:'event-sandra',...body.event},listingPublished:body.mode==='publish'});
  65  |         return reply({success:true});
  66  |       }
  67  |       if(name==='eventEngagement')return reply({success:true,items:[]});
  68  |       if(name==='secureCreditAction')return reply({success:true,file_url:'https://files.example.test/poster.webp'});
  69  |       return reply({success:true});
  70  |     }
  71  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  72  |     if(path.includes(entityMarker))return reply([]);
  73  |     return reply({});
  74  |   });
  75  |   return calls;
  76  | }
  77  | 
  78  | test('non-club organiser chooses holiday setup, autosaves and continues straight into guided setup',async({page})=>{
  79  |   const calls=await installBackend(page,{forAdd:true});
  80  |   await page.goto('/directory/add');
  81  |   await expect(page.getByText('What are you setting up?')).toBeVisible();
  82  |   await page.locator('input[type=radio][value="holidays"]').check();
  83  |   await expect(page.getByText('Pickleball holiday / experience',{exact:true})).toBeVisible();
  84  |   await page.getByLabel('Club, business or listing name').fill("Sandra's Pickleball Passports");
  85  |   await page.getByLabel(/Area, destination or service coverage/).fill('Ireland & Portugal');
  86  |   await page.getByLabel('Instagram').fill('https://www.instagram.com/p/Dewzng0O6j2/');
  87  |   await page.getByLabel('Your role / connection').fill('Travel organiser');
  88  |   await expect(page.getByText('Your progress is automatically saved on this device while you complete the form.')).toBeVisible();
  89  |   await page.waitForTimeout(450);
  90  |   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rallyhub-directory-add-draft-v2:sandra-e2e')||'null'));
  91  |   expect(saved?.listingType).toBe('holidays');
  92  |   expect(saved?.clubName).toBe("Sandra's Pickleball Passports");
  93  |   await page.getByRole('button',{name:'Save & continue'}).click();
  94  |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/edit\?created=1&guided=1/);
  95  |   const submit=calls.find(c=>c.name==='directoryClaim'&&c.body.action==='submit_new');
  96  |   expect(submit?.body.listingType).toBe('holidays');
  97  |   expect(submit?.body.claimantPhone).toBe('');
  98  | });
  99  | 
  100 | test('personalised guided overview shows what RallyHub already knows and continues to Sandra’s first unfinished item',async({page})=>{
  101 |   await installBackend(page);
  102 |   await page.goto('/directory/sandras-pickleball-passports/edit?guided=1');
  103 |   const overview=page.getByTestId('directory-guided-overview');
  104 |   await expect(overview).toBeVisible();
  105 |   await expect(overview.getByText('Sandra, we’ve already started this for you.')).toBeVisible();
  106 |   await expect(overview.getByText('3 of 5 ready')).toBeVisible();
  107 |   await expect(page.getByTestId('setup-step-basics')).toContainText('Ready');
  108 |   await expect(page.getByTestId('setup-step-contact')).toContainText('Ready');
  109 |   await expect(page.getByTestId('setup-step-location')).toContainText('Ready');
  110 |   await expect(page.getByTestId('setup-step-events')).toContainText('Started');
  111 |   await expect(page.getByTestId('setup-step-events')).toContainText("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  112 |   await page.getByRole('button',{name:'Continue setup'}).click();
  113 |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  114 |   await expect(page.getByText("Editing: Sandra's Pickleball Passports · Carvoeiro, Portugal")).toBeVisible();
  115 |   await expect(page.getByLabel('Starts')).toHaveValue('2027-05-14');
  116 |   await expect(page.getByLabel('Ends')).toHaveValue('2027-05-18');
  117 |   await expect(page.getByLabel('Venue / location')).toHaveValue('Rocha Brava Racquet Club, Carvoeiro');
  118 | });
  119 | 
  120 | test('Sandra email deep-link skips completed work, preserves the prefilled event and publishes one canonical collaboration',async({page})=>{
  121 |   const calls=await installBackend(page);
  122 |   await page.goto('/directory/sandras-pickleball-passports/edit?guided=1&continue=1');
  123 |   await expect(page).toHaveURL(/\/directory\/sandras-pickleball-passports\/events\?guided=1&edit=event-sandra/);
  124 |   await expect(page.getByLabel('Event type')).toHaveValue('holiday');
  125 |   await expect(page.getByLabel('Event name')).toHaveValue("Sandra's Pickleball Passports · Carvoeiro, Portugal");
  126 |   await expect(page.getByLabel('Organiser email')).toHaveValue('smartertravel77@gmail.com');
  127 |   await expect(page.getByLabel('Organiser mobile')).toHaveValue('+353860488146');
  128 |   await expect(page.getByLabel('Registration method')).toHaveValue('contact');
  129 |   await expect(page.getByLabel('Collaborator 1 name')).toHaveValue('Pickleball Escapes');
  130 |   await expect(page.getByLabel('Collaborator 1 role')).toHaveValue('In collaboration with');
  131 |   await expect(page.getByLabel('Entry fee / fee text')).toHaveValue('£815 / €950 per person, based on two sharing a one-bedroom apartment.');
  132 |   await page.getByLabel('Collaborator 1 link').fill('https://rallyhub.ie/directory/pickleball-escapes');
> 133 |   await page.getByRole('button',{name:'Publish to RallyHub Events'}).click();
      |                                                                      ^ Error: locator.click: Test timeout of 45000ms exceeded.
  134 |   await expect(page.getByText('Event published + organiser listing live ✓')).toBeVisible();
  135 |   const save=calls.find(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish');
  136 |   expect(save).toBeTruthy();
  137 |   expect(save.body.event.event_collaborators).toEqual([{name:'Pickleball Escapes',role:'In collaboration with',url:'https://rallyhub.ie/directory/pickleball-escapes',listing_slug:'pickleball-escapes'}]);
  138 |   expect(calls.filter(c=>c.name==='directoryEvents'&&c.body.action==='save'&&c.body.mode==='publish')).toHaveLength(1);
  139 | });
  140 | 
```