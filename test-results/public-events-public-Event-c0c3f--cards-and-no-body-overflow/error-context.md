# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-events.spec.mjs >> public Events mobile >> mobile layout has working menu, filter drawer, cards and no body overflow
- Location: e2e/public-events.spec.mjs:126:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'Events', exact: true })
Expected: visible
Error: strict mode violation: getByRole('link', { name: 'Events', exact: true }) resolved to 2 elements:
    1) <a href="/events" data-dynamic-content="true" data-collection-item-field="label" data-source-location="src/components/public/PublicSiteHeader.jsx:72:14" class="flex items-center justify-between rounded-lg px-3 py-3 font-semibold text-[#0c2257] hover:bg-[#f4faf7]">…</a> aka getByRole('banner').getByRole('link', { name: 'Events' })
    2) <a href="/events" data-dynamic-content="true" data-collection-item-field="label" data-source-location="src/components/public/PublicCopyrightFooter.jsx:23:45" class="rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white hover:underline">Events</a> aka getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Events' })

Call log:
  - Expect "toBeVisible" getByRole('link', { name: 'Events', exact: true }) with timeout 3000ms
  - waiting for getByRole('link', { name: 'Events', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "RallyHub home" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "RallyHub" [ref=e7]
          - generic [ref=e8]:
            - generic [ref=e9]: RallyHub
            - generic [ref=e10]: PLAY • CONNECT • BELONG
        - button "Menu" [expanded] [active] [ref=e11] [cursor=pointer]
      - generic [ref=e16]:
        - link "Home" [ref=e17] [cursor=pointer]:
          - /url: /
        - link "Directory" [ref=e20] [cursor=pointer]:
          - /url: /directory
        - link "Clubs" [ref=e23] [cursor=pointer]:
          - /url: /directory
        - link "Events" [ref=e26] [cursor=pointer]:
          - /url: /events
        - link "About" [ref=e29] [cursor=pointer]:
          - /url: /about
        - generic [ref=e32]:
          - link [ref=e33] [cursor=pointer]:
            - /url: /app
            - button "Open RallyHub" [ref=e34]
          - link [ref=e35] [cursor=pointer]:
            - /url: /directory/add
            - button "Get Started" [ref=e36]
    - main [ref=e37]:
      - generic [ref=e41]:
        - paragraph [ref=e42]: RallyHub Events
        - heading "Find your next event" [level=1] [ref=e43]
        - paragraph [ref=e44]: Tournaments, interclubs, leagues, coaching and social events — built around the information players actually need.
        - textbox "Search events by name, location, host or keyword…" [ref=e49]
      - generic [ref=e51]:
        - generic [ref=e52]:
          - button "All upcoming" [ref=e53] [cursor=pointer]
          - button "Open for booking" [ref=e54] [cursor=pointer]
          - button "Invitation only" [ref=e55] [cursor=pointer]
          - button "Opening soon" [ref=e56] [cursor=pointer]
          - button "Closing soon" [ref=e57] [cursor=pointer]
          - button "Registration closed" [ref=e58] [cursor=pointer]
        - group [ref=e59]:
          - generic "More filters" [ref=e60] [cursor=pointer]
          - option "All" [selected]
          - option "Tournament"
          - option "Interclub"
          - option "League"
          - option "Social"
          - option "Coaching / Clinic"
          - option "Camp"
          - option "Open Day"
          - option "Exhibition"
          - option "Other"
          - option "Any month" [selected]
          - option "October 2026"
          - option "November 2026"
          - option "December 2026"
          - option "Any county / region" [selected]
          - option "Dublin"
          - option "Lisburn"
          - option "Any country" [selected]
          - option "Ireland"
          - option "Northern Ireland"
          - option "Any host" [selected]
          - option "Eyva's Invitational Series"
          - option "Pickleball Ireland"
          - option "Any level" [selected]
          - option "3.0-"
          - option "3.5-"
          - option "Competition"
          - option "Any age group" [selected]
          - option "18+"
          - option "50+"
          - option "60+"
          - option "70+"
          - option "Any discipline" [selected]
          - option "Gender Doubles"
          - option "Mixed Doubles"
          - option "Singles"
          - option "Indoor / outdoor" [selected]
          - option "Indoor"
          - option "Outdoor"
          - option "Mixed"
      - generic [ref=e64]:
        - generic [ref=e66]:
          - link [ref=e67] [cursor=pointer]:
            - /url: /events/kukri-irish-nationals-2026
            - img "Kukri Irish Nationals 2026 artwork" [ref=e68]
            - generic [ref=e69]: Featured Event
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e74]: Open for booking
              - generic [ref=e75]: VERIFIED ORGANISER
            - heading "Kukri Irish Nationals 2026" [level=2] [ref=e76]
            - paragraph [ref=e77]: 19 – 22 Nov 2026
            - paragraph [ref=e80]: Lagan Valley LeisurePlex, Lisburn
            - paragraph [ref=e84]: Closes in 33 days · 10 Nov 2026
            - paragraph [ref=e88]: Four days of national pickleball competition.
            - generic [ref=e89]:
              - generic [ref=e90]: Hosted by
              - generic [ref=e91]: Pickleball Ireland
            - generic [ref=e92]:
              - generic [ref=e93]: Tournament
              - generic [ref=e94]: Indoor
              - generic [ref=e95]: Competition
              - generic [ref=e96]: 18+
            - generic [ref=e97]:
              - link "View event" [ref=e98] [cursor=pointer]:
                - /url: /events/kukri-irish-nationals-2026
              - button "Register / Book" [ref=e99] [cursor=pointer]
        - generic [ref=e100]:
          - generic [ref=e101]:
            - heading "All Events (3)" [level=2] [ref=e102]:
              - text: All Events
              - generic [ref=e103]: (3)
            - paragraph [ref=e104]: One event record, kept up to date by the organiser and shared wherever players need it.
          - generic [ref=e105]:
            - link "My Events" [ref=e106] [cursor=pointer]:
              - /url: /events/my
            - combobox [ref=e110]:
              - option "Date (soonest first)" [selected]
              - option "Registration closing soon"
              - option "Recently added"
            - generic [ref=e111]:
              - button "List" [ref=e112] [cursor=pointer]
              - button "Map" [ref=e114] [cursor=pointer]
        - generic [ref=e118]:
          - article [ref=e119]:
            - link "Eyva's Invitational Series – Autumn Classic 2026 event artwork Invitation only" [ref=e120] [cursor=pointer]:
              - /url: /events/eyva-autumn-classic-2026
              - img "Eyva's Invitational Series – Autumn Classic 2026 event artwork" [ref=e121]
              - generic [ref=e122]: Invitation only
            - generic [ref=e123]:
              - link [ref=e124] [cursor=pointer]:
                - /url: /events/eyva-autumn-classic-2026
                - heading "Eyva's Invitational Series – Autumn Classic 2026" [level=2] [ref=e125]
              - generic [ref=e126]:
                - paragraph [ref=e127]:
                  - generic [ref=e130]: 17 Oct 2026 · 09:30
                - paragraph [ref=e131]:
                  - generic [ref=e135]: The Dome, Our Lady's School, Terenure, Dublin 6, Dublin
              - generic [ref=e136]:
                - generic [ref=e137]: Hosted by
                - generic [ref=e138]: Eyva's Invitational Series
                - generic [ref=e139]: VERIFIED
              - generic [ref=e140]:
                - generic [ref=e141]: Tournament
                - generic [ref=e142]: Indoor
                - generic [ref=e143]: 3.0-
              - generic [ref=e144]:
                - link "View event" [ref=e145] [cursor=pointer]:
                  - /url: /events/eyva-autumn-classic-2026
                - button "Request invitation" [ref=e146] [cursor=pointer]
          - article [ref=e147]:
            - link "Opening Soon Test event artwork Opens 1 Jan" [ref=e148] [cursor=pointer]:
              - /url: /events/opening-soon-test
              - img "Opening Soon Test event artwork" [ref=e149]
              - generic [ref=e150]: Opens 1 Jan
            - generic [ref=e151]:
              - link [ref=e152] [cursor=pointer]:
                - /url: /events/opening-soon-test
                - heading "Opening Soon Test" [level=2] [ref=e153]
              - generic [ref=e154]:
                - paragraph [ref=e155]:
                  - generic [ref=e158]: 1 Dec 2026 · 09:30
                - paragraph [ref=e159]:
                  - generic [ref=e163]: Lagan Valley LeisurePlex, Lisburn
                - paragraph [ref=e164]:
                  - generic [ref=e168]: Registration opens 1 Jan 2099
              - generic [ref=e169]:
                - generic [ref=e170]: Hosted by
                - generic [ref=e171]: Pickleball Ireland
                - generic [ref=e172]: VERIFIED
              - generic [ref=e173]:
                - generic [ref=e174]: Tournament
                - generic [ref=e175]: Indoor
                - generic [ref=e176]: Competition
              - generic [ref=e177]:
                - link "View event" [ref=e178] [cursor=pointer]:
                  - /url: /events/opening-soon-test
                - link "Remind me" [ref=e179] [cursor=pointer]:
                  - /url: /events/opening-soon-test
        - generic [ref=e180]:
          - generic [ref=e184]:
            - paragraph [ref=e185]: Adding or updating an event?
            - paragraph [ref=e186]: Use the RallyHub Events Quick Start Guide for the seven-step editor, artwork, registration and publishing.
          - link "View Quick Start Guide" [ref=e187] [cursor=pointer]:
            - /url: /events/quick-start
    - generic [ref=e190]:
      - img "Pickleball players enjoying time together on court" [ref=e191]
      - generic [ref=e193]:
        - generic [ref=e194]:
          - generic [ref=e200]: People
          - generic [ref=e201]: Build connections
        - generic [ref=e202]:
          - generic [ref=e206]: Places
          - generic [ref=e207]: Find your club
        - generic [ref=e208]:
          - generic [ref=e211]: Sessions
          - generic [ref=e212]: Play more
        - generic [ref=e213]:
          - generic [ref=e220]: Community
          - generic [ref=e221]: Belong together
    - contentinfo "RallyHub footer" [ref=e222]:
      - generic [ref=e223]:
        - generic [ref=e224]:
          - link "RallyHub home" [ref=e225] [cursor=pointer]:
            - /url: /
            - img "RallyHub · Play Connect Belong" [ref=e226]
          - navigation "Footer navigation" [ref=e227]:
            - link "Directory" [ref=e228] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e229] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e230] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e231] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e232] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e233]: © 2026 RallyHub All rights reserved.
  - generic [ref=e235]:
    - generic [ref=e236]:
      - paragraph [ref=e237]: Help us improve RallyHub
      - paragraph [ref=e238]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e239]:
      - button "Necessary only" [ref=e240] [cursor=pointer]
      - button "Allow analytics" [ref=e241] [cursor=pointer]
```

# Test source

```ts
  31  |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
  32  |       calls.push({name,body});
  33  |       if(name==='publicEvents'){
  34  |         if(body.action==='detail'){const found=[event,second,opening,eyva,eyvaFull].find(e=>e.event_slug===body.slug);return found?json(route,{success:true,event:found}):json(route,{error:'Public event not found'},404)}
  35  |         if(remainingListFailures>0){remainingListFailures--;return json(route,{error:'Temporary events service error'},500)}
  36  |         return json(route,{success:true,events:[second,event,opening,eyva]});
  37  |       }
  38  |       if(name==='eventEngagement')return json(route,{success:true,saved:{id:'saved-1'},share:{id:'share-1'},items:[]});
  39  |       if(name==='eventInterest')return json(route,{success:true});
  40  |       if(name==='securityContext')return json(route,{success:true,context:null});
  41  |       return json(route,{success:true});
  42  |     }
  43  |     return json(route,[]);
  44  |   });
  45  |   return calls;
  46  | }
  47  | 
  48  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  49  | 
  50  | test('public Events desktop: discover, filter, open detail, save, calendar and club share',async({page})=>{
  51  |   const calls=await installPublicBackend(page);
  52  |   await page.goto('/events');
  53  |   await expect(page.getByRole('heading',{name:/Find your next event/i})).toBeVisible();
  54  |   await expect(page.getByRole('link',{name:'RallyHub home'})).toBeVisible();
  55  |   await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  56  |   await expect(page.getByText('© 2026 RallyHub All rights reserved.')).toBeVisible();
  57  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  58  |   await expect(page.getByText('Open for booking').first()).toBeVisible();
  59  |   await expect(page.getByText(/Closes in \d+ days/).first()).toBeVisible();
  60  |   await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
  61  |   await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  62  |   await expect(page.getByText('Invitation only').first()).toBeVisible();
  63  |   await page.getByRole('button',{name:'Invitation only'}).click();
  64  |   await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  65  |   await expect(page.getByRole('button',{name:'Request invitation'})).toBeVisible();
  66  |   await expect(page.getByText('Kukri Irish Nationals 2026')).toHaveCount(0);
  67  |   await page.getByRole('button',{name:'All upcoming'}).click();
  68  |   await page.getByLabel('Country').selectOption({label:'Northern Ireland'});
  69  |   await page.getByLabel('Discipline').selectOption({label:'Singles'});
  70  |   await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  71  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  72  |   await page.getByLabel('Country').selectOption('all');
  73  |   await page.getByLabel('Discipline').selectOption('all');
  74  |   await page.getByRole('button',{name:'Opening soon'}).click();
  75  |   await expect(page.getByText('Opening Soon Test')).toBeVisible();
  76  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  77  |   await page.getByRole('button',{name:'All upcoming'}).click();
  78  |   await page.getByRole('link',{name:'View event'}).first().click();
  79  |   await expect(page).toHaveURL(/\/events\/kukri-irish-nationals-2026/);
  80  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  81  |   await expect(page.getByRole('link',{name:/View original poster/i})).toBeVisible();
  82  |   await expect(page.locator('.leaflet-container')).toHaveCount(0);
  83  |   await page.getByRole('button',{name:'Save event'}).click();
  84  |   await expect(page.getByRole('button',{name:'Saved'})).toBeVisible();
  85  |   expect(calls.some(c=>c.name==='eventEngagement'&&c.body.action==='save'&&c.body.eventId==='event-kukri')).toBe(true);
  86  |   await page.getByRole('button',{name:/Add to calendar/i}).click();
  87  |   await expect(page.getByRole('heading',{name:'Add to calendar'})).toBeVisible();
  88  |   await expect(page.getByRole('button',{name:/Apple \/ iCal/})).toBeVisible();
  89  |   await page.keyboard.press('Escape');
  90  |   await page.getByRole('button',{name:'Share'}).click();
  91  |   await expect(page.getByRole('heading',{name:'Share this event'})).toBeVisible();
  92  |   await expect(page.getByRole('button',{name:'WhatsApp'})).toBeVisible();
  93  |   await page.getByRole('button',{name:/Share to my club/i}).click();
  94  |   await expect.poll(()=>calls.filter(c=>c.name==='eventEngagement'&&c.body.action==='share_to_club').length).toBe(1);
  95  |   await noHorizontalOverflow(page);
  96  | });
  97  | 
  98  | test('full invitation-only event replaces registration with a tracked future-invitation email flow',async({page})=>{
  99  |   const calls=await installPublicBackend(page);
  100 |   await page.goto('/events/eyva-full-test');
  101 |   await expect(page.getByText('EVENT FULL').first()).toBeVisible();
  102 |   await expect(page.getByText('This event is full.').first()).toBeVisible();
  103 |   await expect(page.getByText(/mobile number is being kept private/i)).toBeVisible();
  104 |   await expect(page.getByRole('button',{name:'Register / Book'})).toHaveCount(0);
  105 |   await page.getByRole('button',{name:'Request a future invitation'}).click();
  106 |   await expect(page.getByRole('heading',{name:'Request a future invitation'})).toBeVisible();
  107 |   await page.getByLabel('Email address').fill('player@example.test');
  108 |   await page.getByRole('button',{name:'Send request'}).click();
  109 |   await expect(page.getByText(/organiser has received your future-invitation request/i)).toBeVisible();
  110 |   expect(calls.some(c=>c.name==='eventInterest'&&c.body.action==='future_invitation'&&c.body.eventId==='event-eyva-full'&&c.body.email==='player@example.test')).toBe(true);
  111 | });
  112 | 
  113 | test('public Events: transient 500s give a clear retry and recover without losing the journey',async({page})=>{
  114 |   const calls=await installPublicBackend(page,{listFailures:2});
  115 |   await page.goto('/events');
  116 |   const retry=page.getByRole('button',{name:'Try again'});
  117 |   await expect(retry).toBeVisible({timeout:10000});
  118 |   await retry.click();
  119 |   await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible({timeout:5000});
  120 |   expect(calls.filter(call=>call.name==='publicEvents'&&call.body.action==='list').length).toBeGreaterThanOrEqual(3);
  121 |   await expect(retry).toHaveCount(0);
  122 | });
  123 | 
  124 | test.describe('public Events mobile',()=>{
  125 |   test.use({viewport:{width:390,height:844}});
  126 |   test('mobile layout has working menu, filter drawer, cards and no body overflow',async({page})=>{
  127 |     await installPublicBackend(page);
  128 |     await page.goto('/events');
  129 |     await expect(page.getByRole('button',{name:'Menu'})).toBeVisible();
  130 |     await page.getByRole('button',{name:'Menu'}).click();
> 131 |     await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  132 |     await page.getByRole('button',{name:'Menu'}).click();
  133 |     await expect(page.getByText('More filters')).toBeVisible();
  134 |     await page.getByText('More filters').click();
  135 |     await expect(page.locator('select').first()).toBeVisible();
  136 |     await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  137 |     await noHorizontalOverflow(page);
  138 |   });
  139 | });
  140 | 
```