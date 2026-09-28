# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-events.spec.mjs >> public Events desktop: discover, filter, open detail, save, calendar and club share
- Location: e2e/public-events.spec.mjs:44:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Saved' })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Saved' }) with timeout 3000ms
  - waiting for getByRole('button', { name: 'Saved' })

```

```yaml
- heading "Sign in to RallyHub" [level=1]
- paragraph: One account for RallyHub
- button "Continue with Google"
- text: or Email
- textbox "Email":
  - /placeholder: you@example.com
- text: Password
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password":
  - /placeholder: ••••••••
- button "Show password"
- button "Log in"
- paragraph:
  - text: New to RallyHub?
  - link "Create an account":
    - /url: /register?returnTo=%2Fevents%2Fkukri-irish-nationals-2026
- paragraph: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID='6a01dc00702b7dd2a2978c28';
  4  | const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
  5  | const user={id:'events-e2e-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball'};
  6  | const host={id:'club-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',logo_url:onePixel,primary_colour:'#075b31',secondary_colour:'#d0ef42'};
  7  | const event={
  8  |   id:'event-kukri',name:'Kukri Irish Nationals 2026',start_date:'2026-11-19',end_date:'2026-11-22',location:'Lagan Valley LeisurePlex',event_county:'Lisburn',event_country:'Northern Ireland',
  9  |   event_slug:'kukri-irish-nationals-2026',event_category:'tournament',event_start_time:'09:30',event_end_time:'18:00',event_image_url:onePixel,event_card_image_url:onePixel,event_card_position_x:50,event_card_position_y:44,event_card_zoom:1.2,
  10 |   event_public_summary:'Four days of national pickleball competition.',event_registration_mode:'external',event_registration_url:'https://register.example.test/kukri',event_registration_open_at:'2026-09-01T18:00:00.000Z',event_registration_close_at:'2026-11-10T23:00:00.000Z',event_fee_text:'€45 per event',event_levels:['Competition'],event_age_groups:['18+','50+','60+','70+'],event_disciplines:['Singles','Gender Doubles','Mixed Doubles'],event_indoor_outdoor:'indoor',event_featured_public:true,event_verified_organiser:true,event_publish_status:'published',event_public_visible:true,event_schedule:[{day:'Thu 19 Nov',time:'09:30–15:00',title:'70+ Gender Doubles'},{day:'Fri 20 Nov',time:'09:30–18:00',title:'60+ competition'}],event_eligibility:'Age-group competition.',event_player_info:'Minimum four matches.',event_fees_cancellation:'See organiser policy.',event_contact:'events@example.test',host
  11 | };
  12 | const second={...event,id:'event-clare',name:'Clare v Galway Interclub',event_slug:'clare-v-galway-interclub',start_date:'2026-10-04',end_date:'2026-10-04',location:"St Joseph's, Doora Barefield",event_county:'Clare',event_category:'interclub',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'none',event_registration_url:'',event_public_summary:'Clare and Galway meet in a social interclub fixture.',host:{id:'club-clare',name:'Clare Pickleball',slug:'clare-pickleball',logo_url:onePixel}};
  13 | const opening={...event,id:'event-opening',name:'Opening Soon Test',event_slug:'opening-soon-test',start_date:'2026-12-01',end_date:'2026-12-01',event_featured_public:false,event_registration_open_at:'2099-01-01T00:00:00.000Z',event_registration_close_at:'2099-02-01T00:00:00.000Z'};
  14 | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  15 | 
  16 | async function installPublicBackend(page){
  17 |   const calls=[];
  18 |   await page.route('**/api/apps/**',async route=>{
  19 |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  20 |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  21 |     if(path.includes('/analytics/'))return json(route,{});
  22 |     if(path.endsWith('/entities/User/me'))return json(route,user);
  23 |     if(path.includes('/entities/EventSavedItem'))return json(route,[]);
  24 |     const marker=`/api/apps/${APP_ID}/functions/`;
  25 |     const i=path.indexOf(marker);
  26 |     if(i>=0){
  27 |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
  28 |       calls.push({name,body});
  29 |       if(name==='publicEvents'){
  30 |         if(body.action==='detail'){const found=[event,second,opening].find(e=>e.event_slug===body.slug);return found?json(route,{success:true,event:found}):json(route,{error:'Public event not found'},404)}
  31 |         return json(route,{success:true,events:[second,event,opening]});
  32 |       }
  33 |       if(name==='eventEngagement')return json(route,{success:true,saved:{id:'saved-1'},share:{id:'share-1'},items:[]});
  34 |       if(name==='securityContext')return json(route,{success:true,context:null});
  35 |       return json(route,{success:true});
  36 |     }
  37 |     return json(route,[]);
  38 |   });
  39 |   return calls;
  40 | }
  41 | 
  42 | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  43 | 
  44 | test('public Events desktop: discover, filter, open detail, save, calendar and club share',async({page})=>{
  45 |   const calls=await installPublicBackend(page);
  46 |   await page.goto('/events');
  47 |   await expect(page.getByRole('heading',{name:/Find your next event/i})).toBeVisible();
  48 |   await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  49 |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  50 |   await expect(page.getByText('Open for booking').first()).toBeVisible();
  51 |   await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
  52 |   await page.getByRole('button',{name:'Opening soon'}).click();
  53 |   await expect(page.getByText('Opening Soon Test')).toBeVisible();
  54 |   await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  55 |   await page.getByRole('button',{name:'All upcoming'}).click();
  56 |   await page.getByRole('link',{name:'View event'}).first().click();
  57 |   await expect(page).toHaveURL(/\/events\/kukri-irish-nationals-2026/);
  58 |   await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  59 |   await expect(page.getByRole('link',{name:/View original poster/i})).toBeVisible();
  60 |   await page.getByRole('button',{name:'Save event'}).click();
> 61 |   await expect(page.getByRole('button',{name:'Saved'})).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  62 |   expect(calls.some(c=>c.name==='eventEngagement'&&c.body.action==='save'&&c.body.eventId==='event-kukri')).toBe(true);
  63 |   await page.getByRole('button',{name:/Add to calendar/i}).click();
  64 |   await expect(page.getByRole('heading',{name:'Add to calendar'})).toBeVisible();
  65 |   await expect(page.getByRole('button',{name:/Apple \/ iCal/})).toBeVisible();
  66 |   await page.keyboard.press('Escape');
  67 |   await page.getByRole('button',{name:'Share'}).click();
  68 |   await expect(page.getByRole('heading',{name:'Share this event'})).toBeVisible();
  69 |   await expect(page.getByRole('button',{name:'WhatsApp'})).toBeVisible();
  70 |   await page.getByRole('button',{name:/Share to my club/i}).click();
  71 |   await expect.poll(()=>calls.filter(c=>c.name==='eventEngagement'&&c.body.action==='share_to_club').length).toBe(1);
  72 |   await noHorizontalOverflow(page);
  73 | });
  74 | 
  75 | test.describe('public Events mobile',()=>{
  76 |   test.use({viewport:{width:390,height:844}});
  77 |   test('mobile layout has working menu, filter drawer, cards and no body overflow',async({page})=>{
  78 |     await installPublicBackend(page);
  79 |     await page.goto('/events');
  80 |     await expect(page.getByRole('button',{name:'Menu'})).toBeVisible();
  81 |     await page.getByRole('button',{name:'Menu'}).click();
  82 |     await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  83 |     await page.getByRole('button',{name:'Menu'}).click();
  84 |     await expect(page.getByText('More filters')).toBeVisible();
  85 |     await page.getByText('More filters').click();
  86 |     await expect(page.locator('select').first()).toBeVisible();
  87 |     await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  88 |     await noHorizontalOverflow(page);
  89 |   });
  90 | });
  91 | 
```