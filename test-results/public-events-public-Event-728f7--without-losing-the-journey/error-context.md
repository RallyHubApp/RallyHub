# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-events.spec.mjs >> public Events: transient 500s recover without losing the journey
- Location: e2e/public-events.spec.mjs:95:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Kukri Irish Nationals 2026').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Kukri Irish Nationals 2026').first() with timeout 10000ms
  - waiting for getByText('Kukri Irish Nationals 2026').first()

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
  - text: County / region
  - combobox "County / region":
    - option "All" [selected]
  - text: Country
  - combobox "Country":
    - option "All" [selected]
  - text: Host
  - combobox "Host":
    - option "All" [selected]
  - text: Playing level
  - combobox "Playing level":
    - option "All" [selected]
  - text: Age group
  - combobox "Age group":
    - option "All" [selected]
  - text: Discipline
  - combobox "Discipline":
    - option "All" [selected]
  - text: Indoor / Outdoor
  - combobox "Indoor / Outdoor":
    - option "All" [selected]
    - option "Indoor"
    - option "Outdoor"
    - option "Mixed"
  - heading "All Events (0)" [level=2]
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
  - paragraph: Request failed with status code 500
  - button "Try again"
- img "Pickleball players enjoying time together on court"
- img
- text: People Build connections
- img
- text: Places Find your club
- img
- text: Sessions Play more
- img
- text: Community Belong together
- contentinfo "RallyHub copyright": © 2026 RallyHub All rights reserved.
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
  15  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  16  | 
  17  | async function installPublicBackend(page,{listFailures=0}={}){
  18  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','events-e2e-token'));
  19  |   const calls=[];
  20  |   let remainingListFailures=listFailures;
  21  |   await page.route('**/api/apps/**',async route=>{
  22  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  23  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  24  |     if(path.includes('/analytics/'))return json(route,{});
  25  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  26  |     if(path.includes('/entities/EventSavedItem'))return json(route,[]);
  27  |     const marker=`/api/apps/${APP_ID}/functions/`;
  28  |     const i=path.indexOf(marker);
  29  |     if(i>=0){
  30  |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
  31  |       calls.push({name,body});
  32  |       if(name==='publicEvents'){
  33  |         if(body.action==='detail'){const found=[event,second,opening,eyva].find(e=>e.event_slug===body.slug);return found?json(route,{success:true,event:found}):json(route,{error:'Public event not found'},404)}
  34  |         if(remainingListFailures>0){remainingListFailures--;return json(route,{error:'Temporary events service error'},500)}
  35  |         return json(route,{success:true,events:[second,event,opening,eyva]});
  36  |       }
  37  |       if(name==='eventEngagement')return json(route,{success:true,saved:{id:'saved-1'},share:{id:'share-1'},items:[]});
  38  |       if(name==='securityContext')return json(route,{success:true,context:null});
  39  |       return json(route,{success:true});
  40  |     }
  41  |     return json(route,[]);
  42  |   });
  43  |   return calls;
  44  | }
  45  | 
  46  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  47  | 
  48  | test('public Events desktop: discover, filter, open detail, save, calendar and club share',async({page})=>{
  49  |   const calls=await installPublicBackend(page);
  50  |   await page.goto('/events');
  51  |   await expect(page.getByRole('heading',{name:/Find your next event/i})).toBeVisible();
  52  |   await expect(page.getByRole('link',{name:'RallyHub home'})).toBeVisible();
  53  |   await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  54  |   await expect(page.getByText('© 2026 RallyHub All rights reserved.')).toBeVisible();
  55  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  56  |   await expect(page.getByText('Open for booking').first()).toBeVisible();
  57  |   await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
  58  |   await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  59  |   await expect(page.getByText('Invitation only').first()).toBeVisible();
  60  |   await page.getByRole('button',{name:'Invitation only'}).click();
  61  |   await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  62  |   await expect(page.getByRole('button',{name:'Request invitation'})).toBeVisible();
  63  |   await expect(page.getByText('Kukri Irish Nationals 2026')).toHaveCount(0);
  64  |   await page.getByRole('button',{name:'All upcoming'}).click();
  65  |   await page.getByLabel('Country').selectOption({label:'Northern Ireland'});
  66  |   await page.getByLabel('Discipline').selectOption({label:'Singles'});
  67  |   await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  68  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  69  |   await page.getByLabel('Country').selectOption('all');
  70  |   await page.getByLabel('Discipline').selectOption('all');
  71  |   await page.getByRole('button',{name:'Opening soon'}).click();
  72  |   await expect(page.getByText('Opening Soon Test')).toBeVisible();
  73  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  74  |   await page.getByRole('button',{name:'All upcoming'}).click();
  75  |   await page.getByRole('link',{name:'View event'}).first().click();
  76  |   await expect(page).toHaveURL(/\/events\/kukri-irish-nationals-2026/);
  77  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  78  |   await expect(page.getByRole('link',{name:/View original poster/i})).toBeVisible();
  79  |   await expect(page.locator('.leaflet-container')).toHaveCount(0);
  80  |   await page.getByRole('button',{name:'Save event'}).click();
  81  |   await expect(page.getByRole('button',{name:'Saved'})).toBeVisible();
  82  |   expect(calls.some(c=>c.name==='eventEngagement'&&c.body.action==='save'&&c.body.eventId==='event-kukri')).toBe(true);
  83  |   await page.getByRole('button',{name:/Add to calendar/i}).click();
  84  |   await expect(page.getByRole('heading',{name:'Add to calendar'})).toBeVisible();
  85  |   await expect(page.getByRole('button',{name:/Apple \/ iCal/})).toBeVisible();
  86  |   await page.keyboard.press('Escape');
  87  |   await page.getByRole('button',{name:'Share'}).click();
  88  |   await expect(page.getByRole('heading',{name:'Share this event'})).toBeVisible();
  89  |   await expect(page.getByRole('button',{name:'WhatsApp'})).toBeVisible();
  90  |   await page.getByRole('button',{name:/Share to my club/i}).click();
  91  |   await expect.poll(()=>calls.filter(c=>c.name==='eventEngagement'&&c.body.action==='share_to_club').length).toBe(1);
  92  |   await noHorizontalOverflow(page);
  93  | });
  94  | 
  95  | test('public Events: transient 500s recover without losing the journey',async({page})=>{
  96  |   const calls=await installPublicBackend(page,{listFailures:2});
  97  |   await page.goto('/events');
> 98  |   await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible({timeout:10000});
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  99  |   expect(calls.filter(call=>call.name==='publicEvents'&&call.body.action==='list').length).toBeGreaterThanOrEqual(3);
  100 |   await expect(page.getByRole('button',{name:'Try again'})).toHaveCount(0);
  101 | });
  102 | 
  103 | test.describe('public Events mobile',()=>{
  104 |   test.use({viewport:{width:390,height:844}});
  105 |   test('mobile layout has working menu, filter drawer, cards and no body overflow',async({page})=>{
  106 |     await installPublicBackend(page);
  107 |     await page.goto('/events');
  108 |     await expect(page.getByRole('button',{name:'Menu'})).toBeVisible();
  109 |     await page.getByRole('button',{name:'Menu'}).click();
  110 |     await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  111 |     await page.getByRole('button',{name:'Menu'}).click();
  112 |     await expect(page.getByText('More filters')).toBeVisible();
  113 |     await page.getByText('More filters').click();
  114 |     await expect(page.locator('select').first()).toBeVisible();
  115 |     await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  116 |     await noHorizontalOverflow(page);
  117 |   });
  118 | });
  119 | 
```