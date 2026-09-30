import { chromium } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const BASE='http://127.0.0.1:5187';
const routes=['/app','/app/admin','/app/membership','/app/events','/app/tournaments','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage'];
const user={id:'mobile-shell-admin',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
await page.addInitScript(()=>localStorage.setItem('base44_access_token','mobile-shell-e2e-token'));
await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()); const path=url.pathname;
  if(path.includes('/analytics/')) return json(route,{});
  if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
  const marker=`/api/apps/${APP_ID}/functions/`; const i=path.indexOf(marker);
  if(i>=0){
    const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);
    if(name==='securityContext') return json(route,{success:true,context:null});
    if(name==='memberPortal') return json(route,{success:true,snapshot:{}});
    if(name==='adminUserTools') return json(route,{success:true,pendingCount:0,users:[]});
    if(name==='directoryClaim') return json(route,{success:true,pendingCount:0,claims:[]});
    if(name==='membershipRecord') return json(route,{success:true,records:[],items:[],counts:{}});
    if(name==='waitingList') return json(route,{success:true,rows:[],items:[],counts:{},config:{targetSportName:'Pickleball'}});
    return json(route,{success:true,items:[],records:[],events:[],data:[],rows:[]});
  }
  if(path.includes(`/api/apps/${APP_ID}/entities/`)) return json(route,[]);
  return json(route,{});
});

const results=[];
for(const path of routes){
  const errors=[];
  const onError=e=>errors.push(e.message);
  page.on('pageerror',onError);
  try{
    await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:12000});
    await page.locator('header').waitFor({state:'attached',timeout:8000});
    await page.locator('main').waitFor({state:'attached',timeout:8000});
    await page.waitForTimeout(150);
    const metrics=await page.evaluate(()=>{
      const main=document.querySelector('main')?.getBoundingClientRect();
      const header=document.querySelector('header')?.getBoundingClientRect();
      const aside=document.querySelector('aside')?.getBoundingClientRect();
      return {innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,mainRight:main?.right,headerRight:header?.right,asideRight:aside?.right};
    });
    const menu=page.locator('header button').first();
    const menuVisible=await menu.isVisible().catch(()=>false);
    results.push({path,ok:metrics.doc<=392&&metrics.body<=392&&(metrics.mainRight??999)<=392&&(metrics.headerRight??999)<=392&&(metrics.asideRight??999)<=1&&errors.length===0,menuVisible,metrics,errors});
  }catch(e){results.push({path,ok:false,error:e.message,errors});}
  page.off('pageerror',onError);
}
console.log(JSON.stringify(results,null,2));
await browser.close();
if(results.some(r=>!r.ok)) process.exit(2);
