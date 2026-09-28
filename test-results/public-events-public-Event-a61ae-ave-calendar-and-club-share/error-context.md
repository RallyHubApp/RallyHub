# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-events.spec.mjs >> public Events desktop: discover, filter, open detail, save, calendar and club share
- Location: e2e/public-events.spec.mjs:45:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText('Clare v Galway Interclub')
Expected: 0
Received: 1
Timeout:  3000ms

Call log:
  - Expect "toHaveCount" getByText('Clare v Galway Interclub') with timeout 3000ms
  - waiting for getByText('Clare v Galway Interclub')
    10 × locator resolved to 1 element
       - unexpected value "1"

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
          - button "Opening soon" [ref=e48] [cursor=pointer]
          - button "Closing soon" [ref=e49] [cursor=pointer]
          - button "Registration closed" [ref=e50] [cursor=pointer]
        - generic [ref=e51]:
          - generic [ref=e52]:
            - text: Event type
            - combobox "Event type" [ref=e53]:
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
          - generic [ref=e54]:
            - text: Month
            - combobox "Month" [ref=e55]:
              - option "All" [selected]
              - option "Oct 2026"
              - option "Nov 2026"
              - option "Dec 2026"
          - generic [ref=e56]:
            - text: County / region
            - combobox "County / region" [ref=e57]:
              - option "All" [selected]
              - option "Clare"
              - option "Lisburn"
          - generic [ref=e58]:
            - text: Country
            - combobox "Country" [ref=e59]:
              - option "All"
              - option "Northern Ireland" [selected]
          - generic [ref=e60]:
            - text: Host
            - combobox "Host" [ref=e61]:
              - option "All" [selected]
              - option "Clare Pickleball"
              - option "Pickleball Ireland"
          - generic [ref=e62]:
            - text: Playing level
            - combobox "Playing level" [ref=e63]:
              - option "All" [selected]
              - option "Competition"
          - generic [ref=e64]:
            - text: Age group
            - combobox "Age group" [ref=e65]:
              - option "All" [selected]
              - option "18+"
              - option "50+"
              - option "60+"
              - option "70+"
          - generic [ref=e66]:
            - text: Discipline
            - combobox "Discipline" [ref=e67]:
              - option "All"
              - option "Gender Doubles"
              - option "Mixed Doubles"
              - option "Singles" [selected]
          - generic [ref=e68]:
            - text: Indoor / Outdoor
            - combobox "Indoor / Outdoor" [ref=e69]:
              - option "All" [selected]
              - option "Indoor"
              - option "Outdoor"
              - option "Mixed"
      - generic [ref=e70]:
        - generic [ref=e72]:
          - link [ref=e73] [cursor=pointer]:
            - /url: /events/kukri-irish-nationals-2026
            - img "Kukri Irish Nationals 2026 artwork" [ref=e74]
            - generic [ref=e75]: Featured Event
          - generic [ref=e78]:
            - generic [ref=e79]:
              - generic [ref=e80]: Open for booking
              - generic [ref=e81]: VERIFIED ORGANISER
            - heading "Kukri Irish Nationals 2026" [level=2] [ref=e82]
            - paragraph [ref=e83]: 19 – 22 Nov 2026
            - paragraph [ref=e86]: Lagan Valley LeisurePlex, Lisburn
            - paragraph [ref=e90]: Four days of national pickleball competition.
            - generic [ref=e91]:
              - generic [ref=e92]: Hosted by
              - generic [ref=e93]: Pickleball Ireland
            - generic [ref=e94]:
              - generic [ref=e95]: Tournament
              - generic [ref=e96]: Indoor
              - generic [ref=e97]: Competition
              - generic [ref=e98]: 18+
            - generic [ref=e99]:
              - link "View event" [ref=e100] [cursor=pointer]:
                - /url: /events/kukri-irish-nationals-2026
              - button "Register / Book" [ref=e101] [cursor=pointer]
        - generic [ref=e102]:
          - generic [ref=e103]:
            - heading "All Events (3)" [level=2] [ref=e104]:
              - text: All Events
              - generic [ref=e105]: (3)
            - paragraph [ref=e106]: One event record, kept up to date by the organiser and shared wherever players need it.
          - generic [ref=e107]:
            - link "My Events" [ref=e108] [cursor=pointer]:
              - /url: /events/my
            - combobox [ref=e112]:
              - option "Date (soonest first)" [selected]
              - option "Registration closing soon"
              - option "Recently added"
            - generic [ref=e113]:
              - button "List" [ref=e114] [cursor=pointer]
              - button "Map" [ref=e116] [cursor=pointer]
        - generic [ref=e120]:
          - article [ref=e121]:
            - link "Clare v Galway Interclub event artwork No booking required" [ref=e122] [cursor=pointer]:
              - /url: /events/clare-v-galway-interclub
              - img "Clare v Galway Interclub event artwork" [ref=e123]
              - generic [ref=e124]: No booking required
            - generic [ref=e125]:
              - link [ref=e126] [cursor=pointer]:
                - /url: /events/clare-v-galway-interclub
                - heading "Clare v Galway Interclub" [level=2] [ref=e127]
              - generic [ref=e128]:
                - paragraph [ref=e129]:
                  - generic [ref=e132]: 4 Oct 2026 · 09:30
                - paragraph [ref=e133]:
                  - generic [ref=e137]: St Joseph's, Doora Barefield, Clare
              - generic [ref=e138]:
                - generic [ref=e139]: Hosted by
                - generic [ref=e140]: Clare Pickleball
                - generic [ref=e141]: VERIFIED
              - generic [ref=e142]:
                - generic [ref=e143]: Interclub
                - generic [ref=e144]: Indoor
                - generic [ref=e145]: Competition
              - generic [ref=e146]:
                - link "View event" [ref=e147] [cursor=pointer]:
                  - /url: /events/clare-v-galway-interclub
                - link "Details" [ref=e148] [cursor=pointer]:
                  - /url: /events/clare-v-galway-interclub
          - article [ref=e149]:
            - link "Opening Soon Test event artwork Opens 1 Jan" [ref=e150] [cursor=pointer]:
              - /url: /events/opening-soon-test
              - img "Opening Soon Test event artwork" [ref=e151]
              - generic [ref=e152]: Opens 1 Jan
            - generic [ref=e153]:
              - link [ref=e154] [cursor=pointer]:
                - /url: /events/opening-soon-test
                - heading "Opening Soon Test" [level=2] [ref=e155]
              - generic [ref=e156]:
                - paragraph [ref=e157]:
                  - generic [ref=e160]: 1 Dec 2026 · 09:30
                - paragraph [ref=e161]:
                  - generic [ref=e165]: Lagan Valley LeisurePlex, Lisburn
              - generic [ref=e166]:
                - generic [ref=e167]: Hosted by
                - generic [ref=e168]: Pickleball Ireland
                - generic [ref=e169]: VERIFIED
              - generic [ref=e170]:
                - generic [ref=e171]: Tournament
                - generic [ref=e172]: Indoor
                - generic [ref=e173]: Competition
              - generic [ref=e174]:
                - link "View event" [ref=e175] [cursor=pointer]:
                  - /url: /events/opening-soon-test
                - link "Remind me" [ref=e176] [cursor=pointer]:
                  - /url: /events/opening-soon-test
    - generic [ref=e179]:
      - img "Pickleball players enjoying time together on court" [ref=e181]
      - generic [ref=e183]:
        - generic [ref=e184]:
          - generic [ref=e190]: People
          - generic [ref=e191]: Build connections
        - generic [ref=e192]:
          - generic [ref=e196]: Places
          - generic [ref=e197]: Find your club
        - generic [ref=e198]:
          - generic [ref=e201]: Sessions
          - generic [ref=e202]: Play more
        - generic [ref=e203]:
          - generic [ref=e210]: Community
          - generic [ref=e211]: Belong together
    - contentinfo "RallyHub copyright" [ref=e212]:
      - generic [ref=e213]: © 2026 RallyHub All rights reserved.
  - generic [ref=e215]:
    - generic [ref=e216]:
      - paragraph [ref=e217]: Help us improve RallyHub
      - paragraph [ref=e218]: We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.
    - generic [ref=e219]:
      - button "Necessary only" [ref=e220] [cursor=pointer]
      - button "Allow analytics" [ref=e221] [cursor=pointer]
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
  10  |   event_public_summary:'Four days of national pickleball competition.',event_registration_mode:'external',event_registration_url:'https://register.example.test/kukri',event_registration_open_at:'2026-09-01T18:00:00.000Z',event_registration_close_at:'2026-11-10T23:00:00.000Z',event_fee_text:'€45 per event',event_levels:['Competition'],event_age_groups:['18+','50+','60+','70+'],event_disciplines:['Singles','Gender Doubles','Mixed Doubles'],event_indoor_outdoor:'indoor',event_featured_public:true,event_verified_organiser:true,event_publish_status:'published',event_public_visible:true,event_schedule:[{day:'Thu 19 Nov',time:'09:30–15:00',title:'70+ Gender Doubles'},{day:'Fri 20 Nov',time:'09:30–18:00',title:'60+ competition'}],event_eligibility:'Age-group competition.',event_player_info:'Minimum four matches.',event_fees_cancellation:'See organiser policy.',event_contact:'events@example.test',host
  11  | };
  12  | const second={...event,id:'event-clare',name:'Clare v Galway Interclub',event_slug:'clare-v-galway-interclub',start_date:'2026-10-04',end_date:'2026-10-04',location:"St Joseph's, Doora Barefield",event_county:'Clare',event_category:'interclub',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'none',event_registration_url:'',event_public_summary:'Clare and Galway meet in a social interclub fixture.',host:{id:'club-clare',name:'Clare Pickleball',slug:'clare-pickleball',logo_url:onePixel}};
  13  | const opening={...event,id:'event-opening',name:'Opening Soon Test',event_slug:'opening-soon-test',start_date:'2026-12-01',end_date:'2026-12-01',event_featured_public:false,event_registration_open_at:'2099-01-01T00:00:00.000Z',event_registration_close_at:'2099-02-01T00:00:00.000Z'};
  14  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  15  | 
  16  | async function installPublicBackend(page){
  17  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','events-e2e-token'));
  18  |   const calls=[];
  19  |   await page.route('**/api/apps/**',async route=>{
  20  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  21  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  22  |     if(path.includes('/analytics/'))return json(route,{});
  23  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  24  |     if(path.includes('/entities/EventSavedItem'))return json(route,[]);
  25  |     const marker=`/api/apps/${APP_ID}/functions/`;
  26  |     const i=path.indexOf(marker);
  27  |     if(i>=0){
  28  |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
  29  |       calls.push({name,body});
  30  |       if(name==='publicEvents'){
  31  |         if(body.action==='detail'){const found=[event,second,opening].find(e=>e.event_slug===body.slug);return found?json(route,{success:true,event:found}):json(route,{error:'Public event not found'},404)}
  32  |         return json(route,{success:true,events:[second,event,opening]});
  33  |       }
  34  |       if(name==='eventEngagement')return json(route,{success:true,saved:{id:'saved-1'},share:{id:'share-1'},items:[]});
  35  |       if(name==='securityContext')return json(route,{success:true,context:null});
  36  |       return json(route,{success:true});
  37  |     }
  38  |     return json(route,[]);
  39  |   });
  40  |   return calls;
  41  | }
  42  | 
  43  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  44  | 
  45  | test('public Events desktop: discover, filter, open detail, save, calendar and club share',async({page})=>{
  46  |   const calls=await installPublicBackend(page);
  47  |   await page.goto('/events');
  48  |   await expect(page.getByRole('heading',{name:/Find your next event/i})).toBeVisible();
  49  |   await expect(page.getByRole('link',{name:'RallyHub home'})).toBeVisible();
  50  |   await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  51  |   await expect(page.getByText('© 2026 RallyHub All rights reserved.')).toBeVisible();
  52  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  53  |   await expect(page.getByText('Open for booking').first()).toBeVisible();
  54  |   await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
  55  |   await page.getByLabel('Country').selectOption({label:'Northern Ireland'});
  56  |   await page.getByLabel('Discipline').selectOption({label:'Singles'});
  57  |   await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
> 58  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
      |                                                            ^ Error: expect(locator).toHaveCount(expected) failed
  59  |   await page.getByLabel('Country').selectOption('all');
  60  |   await page.getByLabel('Discipline').selectOption('all');
  61  |   await page.getByRole('button',{name:'Opening soon'}).click();
  62  |   await expect(page.getByText('Opening Soon Test')).toBeVisible();
  63  |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  64  |   await page.getByRole('button',{name:'All upcoming'}).click();
  65  |   await page.getByRole('link',{name:'View event'}).first().click();
  66  |   await expect(page).toHaveURL(/\/events\/kukri-irish-nationals-2026/);
  67  |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  68  |   await expect(page.getByRole('link',{name:/View original poster/i})).toBeVisible();
  69  |   await page.getByRole('button',{name:'Save event'}).click();
  70  |   await expect(page.getByRole('button',{name:'Saved'})).toBeVisible();
  71  |   expect(calls.some(c=>c.name==='eventEngagement'&&c.body.action==='save'&&c.body.eventId==='event-kukri')).toBe(true);
  72  |   await page.getByRole('button',{name:/Add to calendar/i}).click();
  73  |   await expect(page.getByRole('heading',{name:'Add to calendar'})).toBeVisible();
  74  |   await expect(page.getByRole('button',{name:/Apple \/ iCal/})).toBeVisible();
  75  |   await page.keyboard.press('Escape');
  76  |   await page.getByRole('button',{name:'Share'}).click();
  77  |   await expect(page.getByRole('heading',{name:'Share this event'})).toBeVisible();
  78  |   await expect(page.getByRole('button',{name:'WhatsApp'})).toBeVisible();
  79  |   await page.getByRole('button',{name:/Share to my club/i}).click();
  80  |   await expect.poll(()=>calls.filter(c=>c.name==='eventEngagement'&&c.body.action==='share_to_club').length).toBe(1);
  81  |   await noHorizontalOverflow(page);
  82  | });
  83  | 
  84  | test.describe('public Events mobile',()=>{
  85  |   test.use({viewport:{width:390,height:844}});
  86  |   test('mobile layout has working menu, filter drawer, cards and no body overflow',async({page})=>{
  87  |     await installPublicBackend(page);
  88  |     await page.goto('/events');
  89  |     await expect(page.getByRole('button',{name:'Menu'})).toBeVisible();
  90  |     await page.getByRole('button',{name:'Menu'}).click();
  91  |     await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  92  |     await page.getByRole('button',{name:'Menu'}).click();
  93  |     await expect(page.getByText('More filters')).toBeVisible();
  94  |     await page.getByText('More filters').click();
  95  |     await expect(page.locator('select').first()).toBeVisible();
  96  |     await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  97  |     await noHorizontalOverflow(page);
  98  |   });
  99  | });
  100 | 
```