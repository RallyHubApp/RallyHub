# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: finance-summary-journey.spec.mjs >> Finance sync zero-match state explains that Spond worked instead of silently showing zero
- Location: e2e/finance-summary-journey.spec.mjs:114:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Finance Summary' })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Finance Summary' }) with timeout 3000ms
  - waiting for getByRole('heading', { name: 'Finance Summary' })

```

```yaml
- complementary:
  - link "RallyHub RallyHub SUPER ADMIN":
    - /url: /app
    - img "RallyHub"
    - text: RallyHub SUPER ADMIN
  - navigation:
    - text: SUPER ADMIN
    - link "Dashboard":
      - /url: /app
      - img
      - text: Dashboard
    - link "Admin Panel":
      - /url: /app/admin
      - img
      - text: Admin Panel
    - link "Directory Admin":
      - /url: /app/admin?tab=directory
      - img
      - text: Directory Admin
    - link "Public Directory":
      - /url: /directory
      - img
      - text: Public Directory
    - text: CLUB OPERATIONS
    - link "Member Messages":
      - /url: /app/messages
      - img
      - text: Member Messages
    - link "Membership":
      - /url: /app/membership
      - img
      - text: Membership
    - link "Finance Summary":
      - /url: /app/finance
      - img
      - text: Finance Summary
      - img
    - link "Waiting List":
      - /url: /app/waiting-list
      - img
      - text: Waiting List
    - link "Players":
      - /url: /app/players
      - img
      - text: Players
    - link "Session Bookings":
      - /url: /app/guest-bookings
      - img
      - text: Session Bookings
    - link "Events":
      - /url: /app/events
      - img
      - text: Events
    - link "Tournaments":
      - /url: /app/tournaments
      - img
      - text: Tournaments
    - link "Club Trials":
      - /url: /app/trials
      - img
      - text: Club Trials
    - link "Club Leaderboard":
      - /url: /app/leaderboard
      - img
      - text: Club Leaderboard
    - link "Learn":
      - /url: /app/learn/manage
      - img
      - text: Learn
    - link "Analytics":
      - /url: /app/analytics
      - img
      - text: Analytics
    - text: ACCOUNT
    - link "My Profile":
      - /url: /app/my-profile
      - img
      - text: My Profile
  - paragraph: RallyHub Admin
  - paragraph: Super Admin
- banner:
  - button "Current appearance Auto. Change appearance.":
    - img
    - text: Auto
  - button "RA RallyHub Admin admin":
    - text: RA
    - paragraph: RallyHub Admin
    - paragraph: admin
- main:
  - heading "Finance Summary" [level=1]
  - paragraph: See whether each session, event, venue and month is making money or costing the club money.
  - img
  - text: Finance Lite
  - heading "How to use this page" [level=2]
  - paragraph: "You should not have to rebuild your regular sessions each time. Once venue rates and recurring sessions are set, normal use is just: choose the period, choose the venues, then sync the income source."
  - paragraph: 1 · Choose the period
  - paragraph: Set From and To below. Your club tracking start is already remembered.
  - paragraph: 2 · Tick venues
  - paragraph: Select one, several, or all venues. Only the ticked venues appear in the totals and results.
  - paragraph: 3 · Sync Spond
  - paragraph: If Spond is connected, press Sync Spond. RallyHub reads the sessions; it does not change anything in Spond.
  - paragraph: 4 · Read the result
  - paragraph: Green = surplus. Red = club subsidy. The tables break it down by venue, month, day and session.
  - text: Spond connection not confirmed 0 recurring finance sessions configured 0 venues with finance tracking enabled
  - paragraph:
    - strong: Recurring session setup is not a weekly task.
    - text: Use it only when a new regular session starts or an existing schedule changes.
  - paragraph: Income
  - paragraph: €0.00
  - paragraph: Venue cost
  - paragraph: €0.00
  - paragraph: Other costs
  - paragraph: €0.00
  - paragraph: Overall result
  - paragraph: +€0.00
  - paragraph: Break-even
  - text: From
  - textbox
  - text: To
  - textbox: 2026-09-30
  - text: Month
  - combobox: All months
  - text: Venues to include Choose one, several or all
  - checkbox "All venues"
  - text: All venues
  - paragraph: "Spond connection: not confirmed"
  - paragraph: Financial year starts January 1. Tracking begins when configured.
  - heading "Session & event results" [level=2]
  - paragraph: Green means the activity covered its costs. Red means the club subsidised it.
  - text: 0 rows
  - table:
    - rowgroup:
      - row "Date Venue Session/event Paid places Income Cost Result":
        - columnheader "Date"
        - columnheader "Venue"
        - columnheader "Session/event"
        - columnheader "Paid places"
        - columnheader "Income"
        - columnheader "Cost"
        - columnheader "Result"
    - rowgroup:
      - row "Loading finance summary…":
        - cell "Loading finance summary…"
  - heading "Club finance settings" [level=2]
  - paragraph: Tenant-specific reporting period. Each club can choose its own financial year and tracking start date.
  - text: Financial year starts
  - combobox: January
  - text: Day
  - spinbutton: "1"
  - text: Track from
  - textbox
  - button "Save settings":
    - img
    - text: Save settings
  - img
  - heading "Venue costs" [level=2]
  - paragraph: "Set each hall once: address + hourly hire rate. All session costs are calculated from it."
  - img
  - heading "Recurring sessions" [level=2]
  - paragraph: These are saved once and reused. You do not need to enter them again before each sync.
  - button "Add / change session"
  - paragraph: No recurring finance sessions have been configured yet.
  - img
  - heading "Record one-off event or adjustment" [level=2]
  - paragraph: For interclub days, special events, invoices or anything not covered by a recurring session.
  - text: Date
  - textbox: 2026-09-30
  - text: Venue
  - combobox: Choose venue
  - text: Event/session label
  - textbox "e.g. Clare v Galway"
  - text: Duration (minutes)
  - spinbutton: "180"
  - text: Paid places
  - spinbutton
  - text: Fee / person (€)
  - spinbutton
  - text: Other costs (€)
  - spinbutton: "0"
  - button "Record event/session":
    - img
    - text: Record event/session
- contentinfo "RallyHub copyright": © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID='6a01dc00702b7dd2a2978c28';
  4   | const tenantId='6a9b7790bc4a8d299938bda9';
  5   | const clubId='6a9b779684daba85b3ffdeb5';
  6   | const user={id:'finance-admin-e2e',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_tenant_id:tenantId,active_club_id:clubId,active_club_role:'club_admin',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
  7   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  8   | 
  9   | const venues=[
  10  |   {id:'doora',tenant_id:tenantId,club_id:clubId,name:'St Joseph’s, Doora Barefield',address:'Gurteen, Quin Road, Co. Clare',hourly_hire_rate:30,finance_tracking_enabled:true,status:'active'},
  11  |   {id:'enn',tenant_id:tenantId,club_id:clubId,name:'Ennistymon',address:'Parliament Street, Ennistymon',hourly_hire_rate:45,finance_tracking_enabled:true,status:'active'},
  12  |   {id:'corofin',tenant_id:tenantId,club_id:clubId,name:'Corofin',address:'Corofin GAA Sports Hall',finance_tracking_enabled:false,status:'active'},
  13  |   {id:'clarecastle',tenant_id:tenantId,club_id:clubId,name:'Clarecastle',finance_tracking_enabled:false,status:'active'},
  14  |   {id:'shannon',tenant_id:tenantId,club_id:clubId,name:'Shannon',finance_tracking_enabled:false,status:'active'},
  15  | ];
  16  | const rules=[
  17  |   {id:'d1',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  18  |   {id:'d2',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  19  |   {id:'d3',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  20  |   {id:'d4',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  21  |   {id:'e1',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'19:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,active:true},
  22  |   {id:'e2',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'20:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,active:true},
  23  | ];
  24  | const settings=[{id:'settings',tenant_id:tenantId,club_id:clubId,currency:'EUR',financial_year_start_month:9,financial_year_start_day:1,tracking_start_date:'2026-09-01'}];
  25  | const bindings=[{id:'binding1',tenant_id:tenantId,club_id:clubId,listing_slug:'clare-pickleball',directory_session_key:'ennistymon-1',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_event_id:'4FA65CB24B154F4AADCDC1EE376BEBF2',active:true}];
  26  | const connections=[{id:'connection1',listing_slug:'clare-pickleball',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_group_name:'Clare Pickleball Members',status:'active',last_synced_at:'2026-09-28T12:15:46.487Z'}];
  27  | const dates=['2026-09-09','2026-09-16','2026-09-23','2026-09-30'];
  28  | const syncedEntries=dates.flatMap((date,index)=>[
  29  |   {id:`e19-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'19:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'7:00–8:00 pm',source_type:'spond_session',paid_places:10+index,going_count:10+index,declined_paid_count:index===2?1:0,fee_per_person:5.5,income_amount:(10+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  30  |   {id:`e20-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'20:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'8:00–9:00 pm',source_type:'spond_session',paid_places:8+index,going_count:8+index,declined_paid_count:0,fee_per_person:5.5,income_amount:(8+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  31  | ]);
  32  | 
  33  | async function installFinanceBackend(page,{zeroMatch=false}={}){
  34  |   let synced=false;
  35  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','finance-e2e-token'));
  36  |   await page.route('**/api/apps/**',async route=>{
  37  |     const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
  38  |     if(path.includes('/analytics/')) return json(route,{});
  39  |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  40  |     if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
  41  |     const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
  42  |     if(fi>=0){
  43  |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
  44  |       let body={};try{body=req.postDataJSON()||{};}catch{}
  45  |       if(name==='securityContext') return json(route,{success:true,context:null});
  46  |       if(name==='spondIntegrationWorking'&&body.action==='directory_finance_sync'){
  47  |         synced=true;
  48  |         if(zeroMatch) return json(route,{success:true,fromDate:body.fromDate,toDate:body.toDate,created:0,updated:0,skipped:11,fetchedCount:11,matchedCount:0,diagnostics:{exactMatches:0,scheduleMatches:0,unmatchedRule:8,missingFee:3,outsideEffectiveRange:0},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name},synced:[]});
  49  |         return json(route,{success:true,fromDate:body.fromDate,toDate:body.toDate,created:8,updated:0,skipped:3,fetchedCount:11,matchedCount:8,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:1,missingFee:2,outsideEffectiveRange:0},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name},synced:syncedEntries});
  50  |       }
  51  |       return json(route,{success:true,items:[],records:[],events:[],data:[]});
  52  |     }
  53  |     const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
  54  |     if(ei>=0){
  55  |       const entity=decodeURIComponent(path.slice(ei+entityMarker.length).split('/')[0]);
  56  |       if(entity==='ClubFinanceSettings') return json(route,settings);
  57  |       if(entity==='Venue') return json(route,venues);
  58  |       if(entity==='ClubFinanceVenueRule') return json(route,rules);
  59  |       if(entity==='ClubFinanceEntry') return json(route,synced && !zeroMatch ? syncedEntries : []);
  60  |       if(entity==='SpondSessionBinding') return json(route,bindings);
  61  |       if(entity==='DirectorySpondConnection') return json(route,connections);
  62  |       return json(route,[]);
  63  |     }
  64  |     return json(route,{});
  65  |   });
  66  | }
  67  | 
  68  | async function openFinance(page){
  69  |   await page.goto('/app/finance',{waitUntil:'domcontentloaded'});
> 70  |   await expect(page.getByRole('heading',{name:'Finance Summary'})).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  71  |   await expect(page.getByText('How to use this page')).toBeVisible();
  72  |   await expect(page.getByTestId('finance-spond-status')).toContainText('Spond connected · Clare Pickleball Members');
  73  |   await expect(page.getByText('6 recurring finance sessions configured')).toBeVisible();
  74  |   await expect(page.getByText('2 venues with finance tracking enabled')).toBeVisible();
  75  | }
  76  | 
  77  | test('Finance admin journey: guidance, multi-venue selection, Spond sync diagnostics and results',async({page})=>{
  78  |   await installFinanceBackend(page);
  79  |   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  80  |   await openFinance(page);
  81  | 
  82  |   await expect(page.getByTestId('finance-venue-all').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');
  83  |   await page.getByTestId('finance-venue-all').click();
  84  |   await expect(page.getByTestId('finance-venue-all').locator('[role="checkbox"]')).toHaveAttribute('data-state','unchecked');
  85  |   await page.getByTestId('finance-venue-enn').click();
  86  |   await page.getByTestId('finance-venue-doora').click();
  87  |   await expect(page.getByTestId('finance-venue-enn').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');
  88  |   await expect(page.getByTestId('finance-venue-doora').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');
  89  |   await expect(page.getByText('No finance rows are showing for this selection yet.')).toBeVisible();
  90  | 
  91  |   await page.getByRole('button',{name:'Sync Spond'}).click();
  92  |   await expect(page.getByTestId('finance-sync-message')).toContainText('Spond connected. Found 11 events · matched 8 · added 8');
  93  |   await expect(page.getByText('Spond events found').locator('..')).toContainText('11');
  94  |   await expect(page.getByText('Matched to finance').locator('..')).toContainText('8');
  95  |   await expect(page.getByText('Skipped explanation:')).toContainText('2 matched a session but has no player fee set');
  96  |   await expect(page.getByText('2026-09-30 · 19:00')).toBeVisible();
  97  |   await expect(page.getByText('7:00–8:00 pm').first()).toBeVisible();
  98  |   await expect(page.getByText('8 paid then declined')).toHaveCount(0);
  99  |   await expect(page.getByText('1 paid then declined')).toBeVisible();
  100 | 
  101 |   await page.getByTestId('finance-venue-enn').click();
  102 |   await expect(page.getByText('No finance rows are showing for this selection yet.')).toBeVisible();
  103 |   await page.getByTestId('finance-venue-all').click();
  104 |   await expect(page.getByText('2026-09-30 · 19:00')).toBeVisible();
  105 | 
  106 |   await expect(page.getByTestId('finance-recurring-section')).toContainText('You do not need to enter them again before each sync');
  107 |   await expect(page.getByRole('button',{name:'Add / change session'})).toBeVisible();
  108 |   await expect(page.getByText('Add a new recurring session')).toHaveCount(0);
  109 |   await page.getByRole('button',{name:'Add / change session'}).click();
  110 |   await expect(page.getByText('Add a new recurring session')).toBeVisible();
  111 |   expect(errors).toEqual([]);
  112 | });
  113 | 
  114 | test('Finance sync zero-match state explains that Spond worked instead of silently showing zero',async({page})=>{
  115 |   await installFinanceBackend(page,{zeroMatch:true});
  116 |   await openFinance(page);
  117 |   await page.getByRole('button',{name:'Sync Spond'}).click();
  118 |   await expect(page.getByTestId('finance-sync-message')).toContainText('Spond connected and returned 11 events, but none could be turned into finance rows');
  119 |   await expect(page.getByText('Skipped explanation:')).toContainText('8 had no matching configured session');
  120 |   await expect(page.getByText('Skipped explanation:')).toContainText('3 matched a session but has no player fee set');
  121 | });
  122 | 
  123 | test.describe('Finance mobile journey',()=>{
  124 |   test.use({viewport:{width:390,height:844}});
  125 |   test('Finance page is usable on phone without horizontal page overflow',async({page})=>{
  126 |     await installFinanceBackend(page);
  127 |     await openFinance(page);
  128 |     const before=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  129 |     expect(before.scrollWidth).toBeLessThanOrEqual(before.innerWidth+2);
  130 |     expect(before.bodyWidth).toBeLessThanOrEqual(before.innerWidth+2);
  131 |     await page.getByRole('button',{name:'Sync Spond'}).scrollIntoViewIfNeeded();
  132 |     await page.getByRole('button',{name:'Sync Spond'}).click();
  133 |     await expect(page.getByTestId('finance-sync-message')).toContainText('matched 8');
  134 |     const after=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  135 |     expect(after.scrollWidth).toBeLessThanOrEqual(after.innerWidth+2);
  136 |     expect(after.bodyWidth).toBeLessThanOrEqual(after.innerWidth+2);
  137 |   });
  138 | });
  139 | 
```