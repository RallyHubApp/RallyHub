# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-shell-mobile-regression.spec.mjs >> shared authenticated app shell mobile regression >> /app/finance stays phone-width with desktop sidebar closed
- Location: e2e/app-shell-mobile-regression.spec.mjs:55:5

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('header')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - link "RallyHub RallyHub SUPER ADMIN" [ref=e6] [cursor=pointer]:
          - /url: /app
          - img "RallyHub" [ref=e7]
          - generic [ref=e8]:
            - generic [ref=e9]: RallyHub
            - generic [ref=e10]: SUPER ADMIN
        - button [ref=e11] [cursor=pointer]
      - navigation [ref=e15]:
        - generic [ref=e16]: SUPER ADMIN
        - link "Dashboard" [ref=e17] [cursor=pointer]:
          - /url: /app
        - link "Admin Panel" [ref=e24] [cursor=pointer]:
          - /url: /app/admin
        - link "Directory Admin" [ref=e28] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Public Directory" [ref=e32] [cursor=pointer]:
          - /url: /directory
        - generic [ref=e37]: CLUB OPERATIONS
        - link "Member Messages" [ref=e38] [cursor=pointer]:
          - /url: /app/messages
        - link "Membership" [ref=e42] [cursor=pointer]:
          - /url: /app/membership
        - link "Finance Summary" [ref=e48] [cursor=pointer]:
          - /url: /app/finance
        - link "Waiting List" [ref=e56] [cursor=pointer]:
          - /url: /app/waiting-list
        - link "Players" [ref=e61] [cursor=pointer]:
          - /url: /app/players
        - link "Session Bookings" [ref=e68] [cursor=pointer]:
          - /url: /app/guest-bookings
        - link "Events" [ref=e73] [cursor=pointer]:
          - /url: /app/events
        - link "Tournaments" [ref=e77] [cursor=pointer]:
          - /url: /app/tournaments
        - link "Club Trials" [ref=e85] [cursor=pointer]:
          - /url: /app/trials
        - link "Club Leaderboard" [ref=e90] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Learn" [ref=e94] [cursor=pointer]:
          - /url: /app/learn/manage
        - link "Analytics" [ref=e98] [cursor=pointer]:
          - /url: /app/analytics
        - generic [ref=e102]: ACCOUNT
        - link "My Profile" [ref=e103] [cursor=pointer]:
          - /url: /app/my-profile
      - generic [ref=e111]:
        - paragraph [ref=e112]: RallyHub Admin
        - paragraph [ref=e113]: Super Admin
    - generic [ref=e114]:
      - banner [ref=e115]:
        - button [ref=e116] [cursor=pointer]
        - generic [ref=e118]:
          - button "Current appearance Auto. Change appearance." [ref=e119] [cursor=pointer]
          - button "RA" [ref=e120] [cursor=pointer]
      - main [ref=e122]:
        - generic [ref=e123]:
          - generic [ref=e124]:
            - generic [ref=e125]:
              - heading "Finance Summary" [level=1] [ref=e126]
              - paragraph [ref=e127]: See whether each session, event, venue and month is making money or costing the club money.
            - generic [ref=e128]: Finance Lite
          - generic [ref=e134]:
            - generic [ref=e135]:
              - heading "How to use this page" [level=2] [ref=e136]
              - paragraph [ref=e137]: Finance now uses the same proven Spond group-and-session scanner as the Directory. Link each repeating Spond session once, then use the date/month/venue filters for normal finance reporting.
            - generic [ref=e138]:
              - generic [ref=e139]:
                - paragraph [ref=e140]: 1 · Choose the Spond group
                - paragraph [ref=e141]: Load your Spond groups and choose the club group, e.g. Clare Pickleball Members.
              - generic [ref=e142]:
                - paragraph [ref=e143]: 2 · Scan & assign sessions
                - paragraph [ref=e144]: RallyHub lists repeating session patterns. Assign 7pm, 8pm, etc. to the matching Finance sessions and save once.
              - generic [ref=e145]:
                - paragraph [ref=e146]: 3 · Choose the report period
                - paragraph [ref=e147]: Set dates, months and venues. These choices control which detailed Spond occurrences are read.
              - generic [ref=e148]:
                - paragraph [ref=e149]: 4 · Read details & sync
                - paragraph [ref=e150]: RallyHub reads Going/Declined/comments, shows the € fee and hall cost, then you choose exactly which rows to write.
            - generic [ref=e151]:
              - generic [ref=e152]: Spond connection not confirmed
              - generic [ref=e153]: 0 Spond patterns linked to Finance
              - generic [ref=e154]: 0 venues with finance tracking enabled
            - paragraph [ref=e155]:
              - strong [ref=e156]: Spond assignment is one-time setup.
              - text: You only revisit it when a regular Spond session changes or a new one is added.
          - generic [ref=e157]:
            - generic [ref=e158]:
              - paragraph [ref=e159]: Income
              - paragraph [ref=e160]: €0.00
            - generic [ref=e161]:
              - paragraph [ref=e162]: Venue cost
              - paragraph [ref=e163]: €0.00
            - generic [ref=e164]:
              - paragraph [ref=e165]: Other costs
              - paragraph [ref=e166]: €0.00
            - generic [ref=e167]:
              - paragraph [ref=e168]: Overall result
              - paragraph [ref=e169]: +€0.00
              - paragraph [ref=e170]: Break-even
          - generic [ref=e171]:
            - generic [ref=e172]:
              - generic [ref=e173]:
                - text: From
                - textbox [ref=e174]
              - generic [ref=e175]:
                - text: To
                - textbox [ref=e176]: 2026-10-01
              - generic [ref=e177]:
                - text: Months
                - button "All months" [ref=e178] [cursor=pointer]
            - generic [ref=e180]:
              - generic [ref=e181]:
                - generic [ref=e182]: Venues to include
                - generic [ref=e183]: Choose one, several or all
              - generic [ref=e185] [cursor=pointer]:
                - checkbox "All venues" [ref=e186]
                - generic [ref=e187]: All venues
            - generic [ref=e188]:
              - paragraph [ref=e189]: "Spond connection: not confirmed"
              - paragraph [ref=e190]: Financial year starts January 1. Tracking begins when configured.
          - generic [ref=e191]:
            - generic [ref=e192]:
              - generic [ref=e193]:
                - heading "Session & event results" [level=2] [ref=e194]
                - paragraph [ref=e195]: Green means the activity covered its costs. Red means the club subsidised it.
              - generic [ref=e196]: 0 rows
            - table [ref=e199]:
              - rowgroup [ref=e200]:
                - row [ref=e201]:
                  - columnheader "Date" [ref=e202]
                  - columnheader "Venue" [ref=e203]
                  - columnheader "Session/event" [ref=e204]
                  - columnheader "Paid places" [ref=e205]
                  - columnheader "Income" [ref=e206]
                  - columnheader "Cost" [ref=e207]
                  - columnheader "Result" [ref=e208]
              - rowgroup [ref=e209]:
                - row [ref=e210]:
                  - cell [ref=e211]:
                    - text: No finance rows are showing for this selection yet. If you use Spond, first scan and assign the recurring sessions in
                    - strong [ref=e212]: Spond session setup
                    - text: ", then press"
                    - strong [ref=e213]: Read Spond finance details
                    - text: . RallyHub will show the detailed occurrences before anything is written to Finance.
          - generic [ref=e214]:
            - generic [ref=e215]:
              - heading "Club finance settings" [level=2] [ref=e216]
              - paragraph [ref=e217]: Tenant-specific reporting period. Each club can choose its own financial year and tracking start date.
            - generic [ref=e218]:
              - generic [ref=e219]:
                - text: Financial year starts
                - combobox [ref=e220] [cursor=pointer]:
                  - generic: January
              - generic [ref=e223]:
                - text: Day
                - spinbutton [ref=e224]: "1"
              - generic [ref=e225]:
                - text: Track from
                - textbox [ref=e226]
              - button "Save settings" [ref=e227] [cursor=pointer]
          - generic [ref=e228]:
            - generic [ref=e234]:
              - heading "Venue costs" [level=2] [ref=e235]
              - paragraph [ref=e236]: "Set each hall once: address + hourly hire rate. All session costs are calculated from it."
            - generic [ref=e237]:
              - generic [ref=e238]:
                - generic [ref=e241]:
                  - heading "Recurring sessions" [level=2] [ref=e242]
                  - paragraph [ref=e243]: These are saved once and reused. You do not need to enter them again before each sync.
                - button "Add / change session" [ref=e244] [cursor=pointer]
              - paragraph [ref=e245]: No recurring finance sessions have been configured yet.
          - generic [ref=e246]:
            - generic [ref=e250]:
              - heading "Record one-off event or adjustment" [level=2] [ref=e251]
              - paragraph [ref=e252]: For interclub days, special events, invoices or anything not covered by a recurring session.
            - generic [ref=e253]:
              - generic [ref=e254]:
                - text: Date
                - textbox [ref=e255]: 2026-10-01
              - generic [ref=e256]:
                - text: Venue
                - combobox [ref=e257] [cursor=pointer]:
                  - generic: Choose venue
              - generic [ref=e260]:
                - text: Event/session label
                - textbox "e.g. Clare v Galway" [ref=e261]
              - generic [ref=e262]:
                - text: Duration (minutes)
                - spinbutton [ref=e263]: "180"
              - generic [ref=e264]:
                - text: Paid places
                - spinbutton [ref=e265]
              - generic [ref=e266]:
                - text: Fee / person (€)
                - spinbutton [ref=e267]
              - generic [ref=e268]:
                - text: Other costs (€)
                - spinbutton [ref=e269]: "0"
            - button "Record event/session" [ref=e270] [cursor=pointer]
  - contentinfo "RallyHub copyright" [ref=e271]:
    - generic [ref=e272]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID='6a01dc00702b7dd2a2978c28';
  4  | const user={id:'mobile-shell-admin',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | async function installBackend(page){
  8  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','mobile-shell-e2e-token'));
  9  |   await page.route('**/api/apps/**',async route=>{
  10 |     const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
  11 |     if(path.includes('/analytics/')) return json(route,{});
  12 |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  13 |     if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
  14 |     const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
  15 |     if(fi>=0){
  16 |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
  17 |       if(name==='securityContext') return json(route,{success:true,context:null});
  18 |       if(name==='memberPortal') return json(route,{success:true,snapshot:{}});
  19 |       if(name==='adminUserTools') return json(route,{success:true,pendingCount:0,users:[]});
  20 |       if(name==='directoryClaim') return json(route,{success:true,pendingCount:0,claims:[]});
  21 |       if(name==='membershipRecord') return json(route,{success:true,records:[],items:[]});
  22 |       if(name==='waitingList') return json(route,{success:true,items:[],config:null});
  23 |       return json(route,{success:true,items:[],records:[],events:[],data:[]});
  24 |     }
  25 |     const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
  26 |     if(ei>=0) return json(route,[]);
  27 |     return json(route,{});
  28 |   });
  29 | }
  30 | 
  31 | async function assertMobileShell(page,path){
  32 |   await page.goto(path,{waitUntil:'domcontentloaded',timeout:8000}).catch(()=>{});
> 33 |   await page.locator('header').waitFor({state:'attached',timeout:10000});
     |                                ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  34 |   await page.locator('main').waitFor({state:'attached',timeout:10000});
  35 |   await page.waitForTimeout(250);
  36 |   const metrics=await page.evaluate(()=>{
  37 |     const aside=document.querySelector('aside');
  38 |     const main=document.querySelector('main');
  39 |     const header=document.querySelector('header');
  40 |     const ar=aside?.getBoundingClientRect(); const mr=main?.getBoundingClientRect(); const hr=header?.getBoundingClientRect();
  41 |     const offenders=[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className||'').slice(0,160),left:r.left,right:r.right,width:r.width}}).filter(x=>x.right>innerWidth+2||x.left<-2).slice(0,10);
  42 |     return {innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,aside:ar&&{left:ar.left,right:ar.right,width:ar.width},main:mr&&{left:mr.left,right:mr.right,width:mr.width},header:hr&&{left:hr.left,right:hr.right,width:hr.width},offenders};
  43 |   });
  44 |   expect(metrics.scrollWidth,`${path} horizontal overflow ${JSON.stringify(metrics.offenders)}`).toBeLessThanOrEqual(metrics.innerWidth+2);
  45 |   expect(metrics.bodyScrollWidth,`${path} body overflow`).toBeLessThanOrEqual(metrics.innerWidth+2);
  46 |   expect(metrics.main?.left,`${path} main shifted by desktop sidebar`).toBeGreaterThanOrEqual(-1);
  47 |   expect(metrics.main?.right,`${path} main wider than viewport`).toBeLessThanOrEqual(metrics.innerWidth+2);
  48 |   expect(metrics.header?.right,`${path} header wider than viewport`).toBeLessThanOrEqual(metrics.innerWidth+2);
  49 |   expect(metrics.aside?.right,`${path} closed sidebar should be off-canvas`).toBeLessThanOrEqual(1);
  50 | }
  51 | 
  52 | test.describe('shared authenticated app shell mobile regression',()=>{
  53 |   test.use({viewport:{width:390,height:844}});
  54 |   for(const path of ['/app','/app/admin','/app/membership','/app/finance','/app/events','/app/tournaments','/app/tournaments/mobile-regression','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage','/app/play','/app/venues','/app/learn','/app/shop','/app/messages','/app/my-profile']){
  55 |     test(`${path} stays phone-width with desktop sidebar closed`,async({page})=>{await installBackend(page);await assertMobileShell(page,path);});
  56 |   }
  57 | });
  58 | 
```