# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-shell-mobile-regression.spec.mjs >> shared authenticated app shell mobile regression >> /app/tournaments stays phone-width with desktop sidebar closed
- Location: e2e/app-shell-mobile-regression.spec.mjs:55:5

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('header')

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
  13 |     if(path.endsWith('/entities/User/me')) return json(route,user);
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
  54 |   for(const path of ['/app','/app/admin','/app/membership','/app/events','/app/tournaments','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage']){
  55 |     test(`${path} stays phone-width with desktop sidebar closed`,async({page})=>{await installBackend(page);await assertMobileShell(page,path);});
  56 |   }
  57 | });
  58 | 
```