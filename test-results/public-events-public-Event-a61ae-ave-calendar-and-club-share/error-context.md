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

Locator: getByText('Clare v Galway Interclub')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Clare v Galway Interclub') with timeout 3000ms
  - waiting for getByText('Clare v Galway Interclub')

```

```yaml
- banner:
  - link "RallyHub home":
    - /url: /
    - img "RallyHub"
    - text: RallyHub PLAY • CONNECT • BELONG
  - navigation "Main navigation":
    - link "Home":
      - /url: /
    - link "Directory":
      - /url: /directory
    - link "Clubs":
      - /url: /directory
    - link "Events":
      - /url: /events
    - link "About":
      - /url: /about
  - link "Search":
    - /url: /directory
    - img
  - link "Open RallyHub":
    - /url: /app
    - button "Open RallyHub"
  - link "Get Started":
    - /url: /directory/add
    - button "Get Started"
- main:
  - paragraph: RallyHub Events
  - heading "Find your next event" [level=1]
  - paragraph: Tournaments, interclubs, leagues, coaching and social events — built around the information players actually need.
  - img
  - textbox "Search events by name, location, host or keyword…"
  - button "Search"
  - img "Pickleball competition"
  - button "All upcoming"
  - button "Open for booking"
  - button "Invitation only"
  - button "Opening soon"
  - button "Closing soon"
  - button "Registration closed"
  - text: Event type
  - combobox "Event type":
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
  - text: Month
  - combobox "Month":
    - option "All" [selected]
    - option "Oct 2026"
    - option "Nov 2026"
    - option "Dec 2026"
  - text: County / region
  - combobox "County / region":
    - option "All" [selected]
    - option "Dublin"
    - option "Lisburn"
  - text: Country
  - combobox "Country":
    - option "All" [selected]
    - option "Ireland"
    - option "Northern Ireland"
  - text: Host
  - combobox "Host":
    - option "All" [selected]
    - option "Eyva's Invitational Series"
    - option "Pickleball Ireland"
  - text: Playing level
  - combobox "Playing level":
    - option "All" [selected]
    - option "3.0-"
    - option "3.5-"
    - option "Competition"
  - text: Age group
  - combobox "Age group":
    - option "All" [selected]
    - option "18+"
    - option "50+"
    - option "60+"
    - option "70+"
  - text: Discipline
  - combobox "Discipline":
    - option "All" [selected]
    - option "Gender Doubles"
    - option "Mixed Doubles"
    - option "Singles"
  - text: Indoor / Outdoor
  - combobox "Indoor / Outdoor":
    - option "All" [selected]
    - option "Indoor"
    - option "Outdoor"
    - option "Mixed"
  - link "Kukri Irish Nationals 2026 artwork Featured Event":
    - /url: /events/kukri-irish-nationals-2026
    - img "Kukri Irish Nationals 2026 artwork"
    - img
    - text: Featured Event
  - text: Open for booking VERIFIED ORGANISER
  - heading "Kukri Irish Nationals 2026" [level=2]
  - paragraph:
    - img
    - text: 19 – 22 Nov 2026
  - paragraph:
    - img
    - text: Lagan Valley LeisurePlex, Lisburn
  - paragraph:
    - img
    - text: Closes in 33 days · 10 Nov 2026
  - paragraph: Four days of national pickleball competition.
  - text: Hosted by Pickleball Ireland Tournament Indoor Competition 18+
  - link "View event":
    - /url: /events/kukri-irish-nationals-2026
  - button "Register / Book"
  - heading "All Events (3)" [level=2]
  - paragraph: One event record, kept up to date by the organiser and shared wherever players need it.
  - link "My Events":
    - /url: /events/my
    - img
    - text: My Events
  - combobox:
    - option "Date (soonest first)" [selected]
    - option "Registration closing soon"
    - option "Recently added"
  - button "List":
    - img
    - text: List
  - button "Map":
    - img
    - text: Map
  - article:
    - link "Eyva's Invitational Series – Autumn Classic 2026 event artwork Invitation only":
      - /url: /events/eyva-autumn-classic-2026
      - img "Eyva's Invitational Series – Autumn Classic 2026 event artwork"
      - text: Invitation only
    - link "Eyva's Invitational Series – Autumn Classic 2026":
      - /url: /events/eyva-autumn-classic-2026
      - heading "Eyva's Invitational Series – Autumn Classic 2026" [level=2]
    - paragraph:
      - img
      - text: 17 Oct 2026 · 09:30
    - paragraph:
      - img
      - text: The Dome, Our Lady's School, Terenure, Dublin 6, Dublin
    - text: Hosted by Eyva's Invitational Series VERIFIED Tournament Indoor 3.0-
    - link "View event":
      - /url: /events/eyva-autumn-classic-2026
    - button "Request invitation"
  - article:
    - link "Opening Soon Test event artwork Opens 1 Jan":
      - /url: /events/opening-soon-test
      - img "Opening Soon Test event artwork"
      - text: Opens 1 Jan
    - link "Opening Soon Test":
      - /url: /events/opening-soon-test
      - heading "Opening Soon Test" [level=2]
    - paragraph:
      - img
      - text: 1 Dec 2026 · 09:30
    - paragraph:
      - img
      - text: Lagan Valley LeisurePlex, Lisburn
    - paragraph:
      - img
      - text: Registration opens 1 Jan 2099
    - text: Hosted by Pickleball Ireland VERIFIED Tournament Indoor Competition
    - link "View event":
      - /url: /events/opening-soon-test
    - link "Remind me":
      - /url: /events/opening-soon-test
  - img
  - paragraph: Adding or updating an event?
  - paragraph: Use the RallyHub Events Quick Start Guide for the seven-step editor, artwork, registration and publishing.
  - link "View Quick Start Guide":
    - /url: /events/quick-start
- img "Pickleball players enjoying time together on court"
- img
- text: People Build connections
- img
- text: Places Find your club
- img
- text: Sessions Play more
- img
- text: Community Belong together
- contentinfo "RallyHub footer":
  - link "RallyHub home":
    - /url: /
    - img "RallyHub · Play Connect Belong"
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
  54  |   await expect(page.getByRole('banner').getByRole('link',{name:'RallyHub home'})).toBeVisible();
  55  |   await expect(page.getByRole('banner').getByRole('link',{name:'Events',exact:true})).toBeVisible();
  56  |   await expect(page.getByText('© 2026 RallyHub All rights reserved.')).toBeVisible();
  57  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  58  |   await expect(page.getByText('Open for booking').first()).toBeVisible();
  59  |   await expect(page.getByText(/Closes in \d+ days/).first()).toBeVisible();
> 60  |   await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
      |                                                            ^ Error: expect(locator).toBeVisible() failed
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
  131 |     await expect(page.getByRole('banner').getByRole('link',{name:'Events',exact:true})).toBeVisible();
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