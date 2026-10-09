# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-events.spec.mjs >> public Events desktop: discover, filter, open detail, save, calendar and club share
- Location: e2e/public-events.spec.mjs:50:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'RallyHub home' })
Expected: visible
Error: strict mode violation: getByRole('link', { name: 'RallyHub home' }) resolved to 2 elements:
    1) <a href="/" aria-label="RallyHub home" data-dynamic-content="true" class="flex items-center gap-2.5" data-source-location="src/components/public/PublicSiteHeader.jsx:27:8">…</a> aka getByRole('banner').getByRole('link', { name: 'RallyHub home' })
    2) <a href="/" class="shrink-0" aria-label="RallyHub home" data-dynamic-content="true" data-source-location="src/components/public/PublicCopyrightFooter.jsx:19:10">…</a> aka getByRole('contentinfo', { name: 'RallyHub footer' }).getByRole('link', { name: 'RallyHub home' })

Call log:
  - Expect "toBeVisible" getByRole('link', { name: 'RallyHub home' }) with timeout 3000ms
  - waiting for getByRole('link', { name: 'RallyHub home' })

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
        - navigation "Main navigation" [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /
          - link "Directory" [ref=e13] [cursor=pointer]:
            - /url: /directory
          - link "Clubs" [ref=e14] [cursor=pointer]:
            - /url: /directory
          - link "Events" [ref=e15] [cursor=pointer]:
            - /url: /events
          - link "About" [ref=e16] [cursor=pointer]:
            - /url: /about
        - generic [ref=e17]:
          - link "Search" [ref=e18] [cursor=pointer]:
            - /url: /directory
          - link [ref=e22] [cursor=pointer]:
            - /url: /app
            - button "Open RallyHub" [ref=e23]
          - link [ref=e24] [cursor=pointer]:
            - /url: /directory/add
            - button "Get Started" [ref=e25]
    - main [ref=e26]:
      - generic [ref=e28]:
        - generic [ref=e30]:
          - paragraph [ref=e31]: RallyHub Events
          - heading "Find your next event" [level=1] [ref=e32]
          - paragraph [ref=e33]: Tournaments, interclubs, leagues, coaching and social events — built around the information players actually need.
          - generic [ref=e34]:
            - textbox "Search events by name, location, host or keyword…" [ref=e38]
            - button "Search" [ref=e39] [cursor=pointer]
        - img "Pickleball competition" [ref=e41]
      - generic [ref=e44]:
        - generic [ref=e45]:
          - button "All upcoming" [ref=e46] [cursor=pointer]
          - button "Open for booking" [ref=e47] [cursor=pointer]
          - button "Invitation only" [ref=e48] [cursor=pointer]
          - button "Opening soon" [ref=e49] [cursor=pointer]
          - button "Closing soon" [ref=e50] [cursor=pointer]
          - button "Registration closed" [ref=e51] [cursor=pointer]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - text: Event type
            - combobox "Event type" [ref=e54]:
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
          - generic [ref=e55]:
            - text: Month
            - combobox "Month" [ref=e56]:
              - option "All" [selected]
              - option "Oct 2026"
              - option "Nov 2026"
              - option "Dec 2026"
          - generic [ref=e57]:
            - text: County / region
            - combobox "County / region" [ref=e58]:
              - option "All" [selected]
              - option "Dublin"
              - option "Lisburn"
          - generic [ref=e59]:
            - text: Country
            - combobox "Country" [ref=e60]:
              - option "All" [selected]
              - option "Ireland"
              - option "Northern Ireland"
          - generic [ref=e61]:
            - text: Host
            - combobox "Host" [ref=e62]:
              - option "All" [selected]
              - option "Eyva's Invitational Series"
              - option "Pickleball Ireland"
          - generic [ref=e63]:
            - text: Playing level
            - combobox "Playing level" [ref=e64]:
              - option "All" [selected]
              - option "3.0-"
              - option "3.5-"
              - option "Competition"
          - generic [ref=e65]:
            - text: Age group
            - combobox "Age group" [ref=e66]:
              - option "All" [selected]
              - option "18+"
              - option "50+"
              - option "60+"
              - option "70+"
          - generic [ref=e67]:
            - text: Discipline
            - combobox "Discipline" [ref=e68]:
              - option "All" [selected]
              - option "Gender Doubles"
              - option "Mixed Doubles"
              - option "Singles"
          - generic [ref=e69]:
            - text: Indoor / Outdoor
            - combobox "Indoor / Outdoor" [ref=e70]:
              - option "All" [selected]
              - option "Indoor"
              - option "Outdoor"
              - option "Mixed"
      - generic [ref=e71]:
        - generic [ref=e73]:
          - link [ref=e74] [cursor=pointer]:
            - /url: /events/kukri-irish-nationals-2026
            - img "Kukri Irish Nationals 2026 artwork" [ref=e75]
            - generic [ref=e76]: Featured Event
          - generic [ref=e79]:
            - generic [ref=e80]:
              - generic [ref=e81]: Open for booking
              - generic [ref=e82]: VERIFIED ORGANISER
            - heading "Kukri Irish Nationals 2026" [level=2] [ref=e83]
            - paragraph [ref=e84]: 19 – 22 Nov 2026
            - paragraph [ref=e87]: Lagan Valley LeisurePlex, Lisburn
            - paragraph [ref=e91]: Closes in 33 days · 10 Nov 2026
            - paragraph [ref=e95]: Four days of national pickleball competition.
            - generic [ref=e96]:
              - generic [ref=e97]: Hosted by
              - generic [ref=e98]: Pickleball Ireland
            - generic [ref=e99]:
              - generic [ref=e100]: Tournament
              - generic [ref=e101]: Indoor
              - generic [ref=e102]: Competition
              - generic [ref=e103]: 18+
            - generic [ref=e104]:
              - link "View event" [ref=e105] [cursor=pointer]:
                - /url: /events/kukri-irish-nationals-2026
              - button "Register / Book" [ref=e106] [cursor=pointer]
        - generic [ref=e107]:
          - generic [ref=e108]:
            - heading "All Events (3)" [level=2] [ref=e109]:
              - text: All Events
              - generic [ref=e110]: (3)
            - paragraph [ref=e111]: One event record, kept up to date by the organiser and shared wherever players need it.
          - generic [ref=e112]:
            - link "My Events" [ref=e113] [cursor=pointer]:
              - /url: /events/my
            - combobox [ref=e117]:
              - option "Date (soonest first)" [selected]
              - option "Registration closing soon"
              - option "Recently added"
            - generic [ref=e118]:
              - button "List" [ref=e119] [cursor=pointer]
              - button "Map" [ref=e121] [cursor=pointer]
        - generic [ref=e125]:
          - article [ref=e126]:
            - link "Eyva's Invitational Series – Autumn Classic 2026 event artwork Invitation only" [ref=e127] [cursor=pointer]:
              - /url: /events/eyva-autumn-classic-2026
              - img "Eyva's Invitational Series – Autumn Classic 2026 event artwork" [ref=e128]
              - generic [ref=e129]: Invitation only
            - generic [ref=e130]:
              - link [ref=e131] [cursor=pointer]:
                - /url: /events/eyva-autumn-classic-2026
                - heading "Eyva's Invitational Series – Autumn Classic 2026" [level=2] [ref=e132]
              - generic [ref=e133]:
                - paragraph [ref=e134]:
                  - generic [ref=e137]: 17 Oct 2026 · 09:30
                - paragraph [ref=e138]:
                  - generic [ref=e142]: The Dome, Our Lady's School, Terenure, Dublin 6, Dublin
              - generic [ref=e143]:
                - generic [ref=e144]: Hosted by
                - generic [ref=e145]: Eyva's Invitational Series
                - generic [ref=e146]: VERIFIED
              - generic [ref=e147]:
                - generic [ref=e148]: Tournament
                - generic [ref=e149]: Indoor
                - generic [ref=e150]: 3.0-
              - generic [ref=e151]:
                - link "View event" [ref=e152] [cursor=pointer]:
                  - /url: /events/eyva-autumn-classic-2026
                - button "Request invitation" [ref=e153] [cursor=pointer]
          - article [ref=e154]:
            - link "Opening Soon Test event artwork Opens 1 Jan" [ref=e155] [cursor=pointer]:
              - /url: /events/opening-soon-test
              - img "Opening Soon Test event artwork" [ref=e156]
              - generic [ref=e157]: Opens 1 Jan
            - generic [ref=e158]:
              - link [ref=e159] [cursor=pointer]:
                - /url: /events/opening-soon-test
                - heading "Opening Soon Test" [level=2] [ref=e160]
              - generic [ref=e161]:
                - paragraph [ref=e162]:
                  - generic [ref=e165]: 1 Dec 2026 · 09:30
                - paragraph [ref=e166]:
                  - generic [ref=e170]: Lagan Valley LeisurePlex, Lisburn
                - paragraph [ref=e171]:
                  - generic [ref=e175]: Registration opens 1 Jan 2099
              - generic [ref=e176]:
                - generic [ref=e177]: Hosted by
                - generic [ref=e178]: Pickleball Ireland
                - generic [ref=e179]: VERIFIED
              - generic [ref=e180]:
                - generic [ref=e181]: Tournament
                - generic [ref=e182]: Indoor
                - generic [ref=e183]: Competition
              - generic [ref=e184]:
                - link "View event" [ref=e185] [cursor=pointer]:
                  - /url: /events/opening-soon-test
                - link "Remind me" [ref=e186] [cursor=pointer]:
                  - /url: /events/opening-soon-test
        - generic [ref=e187]:
          - generic [ref=e191]:
            - paragraph [ref=e192]: Adding or updating an event?
            - paragraph [ref=e193]: Use the RallyHub Events Quick Start Guide for the seven-step editor, artwork, registration and publishing.
          - link "View Quick Start Guide" [ref=e194] [cursor=pointer]:
            - /url: /events/quick-start
    - generic [ref=e197]:
      - img "Pickleball players enjoying time together on court" [ref=e199]
      - generic [ref=e201]:
        - generic [ref=e202]:
          - generic [ref=e208]: People
          - generic [ref=e209]: Build connections
        - generic [ref=e210]:
          - generic [ref=e214]: Places
          - generic [ref=e215]: Find your club
        - generic [ref=e216]:
          - generic [ref=e219]: Sessions
          - generic [ref=e220]: Play more
        - generic [ref=e221]:
          - generic [ref=e228]: Community
          - generic [ref=e229]: Belong together
    - contentinfo "RallyHub footer" [ref=e230]:
      - generic [ref=e231]:
        - generic [ref=e232]:
          - link "RallyHub home" [ref=e233] [cursor=pointer]:
            - /url: /
            - img "RallyHub · Play Connect Belong" [ref=e234]
          - navigation "Footer navigation" [ref=e235]:
            - link "Directory" [ref=e236] [cursor=pointer]:
              - /url: /directory
            - link "Events" [ref=e237] [cursor=pointer]:
              - /url: /events
            - link "Club Guide" [ref=e238] [cursor=pointer]:
              - /url: /directory/help
            - link "About" [ref=e239] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e240] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e241]: © 2026 RallyHub All rights reserved.
  - generic [ref=e243]:
    - generic [ref=e244]:
      - paragraph [ref=e245]: Help us improve RallyHub
      - paragraph [ref=e246]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e247]:
      - button "Necessary only" [ref=e248] [cursor=pointer]
      - button "Allow analytics" [ref=e249] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID='6a01dc00702b7dd2a2978c28';
  4   | const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
  5   | const user={id:'events-e2e-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball'};
  6   | const host={id:'club-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',logo_url:onePixel,primary_colour:'#075b31',secondary_colour:'#d0ef42'};
  7   | const event={
  8   |   id:'event-kukri',name:'Kukri Irish Nationals 2026',start_date:'2026-11-19',end_date:'2026-11-22',location:'Lagan Valley LeisurePlex',event_county:'Lisburn',event_country:'Northern Ireland',
  9   |   event_slug:'kukri-irish-nationals-2026',event_category:'tournament',event_start_time:'09:30',event_end_time:'18:00',event_image_url:onePixel,event_card_image_url:onePixel,event_card_position_x:50,event_card_position_y:44,event_card_zoom:1.2,
  10  |   event_public_summary:'Four days of national pickleball competition.',event_registration_mode:'external',event_registration_url:'https://register.example.test/kukri',event_registration_open_at:'2026-09-01T18:00:00.000Z',event_registration_close_at:'2026-11-10T23:00:00.000Z',event_fee_text:'€45 per event',event_levels:['Competition'],event_age_groups:['18+','50+','60+','70+'],event_disciplines:['Singles','Gender Doubles','Mixed Doubles'],event_indoor_outdoor:'indoor',event_featured_public:true,event_verified_organiser:true,event_publish_status:'published',event_public_visible:true,event_latitude:null,event_longitude:null,event_schedule:[{day:'Thu 19 Nov',time:'09:30–15:00',title:'70+ Gender Doubles'},{day:'Fri 20 Nov',time:'09:30–18:00',title:'60+ competition'}],event_eligibility:'Age-group competition.',event_player_info:'Minimum four matches.',event_fees_cancellation:'See organiser policy.',event_contact:'events@example.test',host
  11  | };
  12  | const second={...event,id:'event-clare',name:'Clare v Galway Interclub',event_slug:'clare-v-galway-interclub',start_date:'2026-10-04',end_date:'2026-10-04',location:"St Joseph's, Doora Barefield",event_county:'Clare',event_country:'Ireland',event_category:'interclub',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'none',event_registration_url:'',event_levels:['Social','Improver'],event_age_groups:['All ages'],event_disciplines:['Team'],event_public_summary:'Clare and Galway meet in a social interclub fixture.',host:{id:'club-clare',name:'Clare Pickleball',slug:'clare-pickleball',logo_url:onePixel}};
  13  | const opening={...event,id:'event-opening',name:'Opening Soon Test',event_slug:'opening-soon-test',start_date:'2026-12-01',end_date:'2026-12-01',event_featured_public:false,event_registration_open_at:'2099-01-01T00:00:00.000Z',event_registration_close_at:'2099-02-01T00:00:00.000Z'};
  14  | const eyva={...event,id:'event-eyva',name:"Eyva's Invitational Series – Autumn Classic 2026",event_slug:'eyva-autumn-classic-2026',start_date:'2026-10-17',end_date:'2026-10-17',location:"The Dome, Our Lady's School, Terenure, Dublin 6",event_county:'Dublin',event_country:'Ireland',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'contact',event_registration_url:'',event_contact:'eyvainvitationalseries@gmail.com',event_levels:['3.0-','3.5-'],event_age_groups:['18+'],event_disciplines:['Gender Doubles','Mixed Doubles'],event_tags:['DUPR Rated','Invitation only','Limited spaces'],event_public_summary:'Invitation-only DUPR-rated Autumn Classic.',host:{id:'club-eyva',name:"Eyva's Invitational Series",slug:'eyva-s-invitational-series'}};
  15  | const eyvaFull={...eyva,id:'event-eyva-full',event_slug:'eyva-full-test',event_status_override:'full',event_tags:['DUPR Rated','Invitation only','Event full'],event_contact_phone_hidden_until:'2026-10-17T23:00:00.000Z',event_contact_phone:undefined,event_public_summary:'This invitation-only event is now full.'};
  16  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  17  | 
  18  | async function installPublicBackend(page,{listFailures=0}={}){
  19  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','events-e2e-token'));
  20  |   const calls=[];
  21  |   let remainingListFailures=listFailures;
  22  |   await page.route('**/api/apps/**',async route=>{
  23  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  24  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  25  |     if(path.includes('/analytics/'))return json(route,{});
  26  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  27  |     if(path.includes('/entities/EventSavedItem'))return json(route,[]);
  28  |     const marker=`/api/apps/${APP_ID}/functions/`;
  29  |     const i=path.indexOf(marker);
  30  |     if(i>=0){
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
> 54  |   await expect(page.getByRole('link',{name:'RallyHub home'})).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
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
  131 |     await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
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