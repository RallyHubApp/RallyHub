import { chromium } from '@playwright/test';
const APP_ID='6a01dc00702b7dd2a2978c28';
const BASE='http://127.0.0.1:4173';
const routes=['/app','/app/admin','/app/membership','/app/events','/app/tournaments','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage'];
const user={id:'mobile-shell-admin',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const browser=await chromium.launch({headless:true});
const results=[];
for(const path of routes){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('base44_access_token','mobile-shell-e2e-token'));
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url()),p=u.pathname;
  if(!p.startsWith('/api/')) return route.continue();
  const ok=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  if(p.includes('/public-settings/')) return ok({id:APP_ID,public_settings:{}});
  if(/\/(entities\/User\/me|users\/me|auth\/me)$/.test(p)) return ok(user);
  if(p.includes('/functions/securityContext')) return ok({success:true,context:null});
  if(p.includes('/functions/memberPortal')) return ok({success:true,snapshot:{}});
  if(p.includes('/functions/adminUserTools')) return ok({success:true,pendingCount:0,users:[]});
  if(p.includes('/functions/directoryClaim')) return ok({success:true,pendingCount:0,claims:[]});
  if(p.includes('/functions/membershipRecord')) return ok({success:true,records:[],items:[],counts:{}});
  if(p.includes('/functions/waitingList')) return ok({success:true,rows:[],items:[],counts:{},config:{targetSportName:'Pickleball'}});
  if(p.includes('/functions/')) return ok({success:true,items:[],records:[],rows:[],events:[],data:[]});
  if(p.includes('/entities/')) return ok([]);
  return ok({});
 });
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:8000}).catch(()=>{});
  await page.locator('header').waitFor({state:'visible',timeout:10000});
  await page.locator('main').waitFor({state:'visible',timeout:10000});
  const metrics=await page.evaluate(()=>{const r=s=>document.querySelector(s)?.getBoundingClientRect();const a=r('aside'),h=r('header'),m=r('main');return{innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,asideRight:a?.right,headerRight:h?.right,mainRight:m?.right}});
  let menuOk=true;
  if(path==='/app/admin'){
   await page.locator('header button').first().click();
   await page.waitForTimeout(120);
   const ar=await page.locator('aside').evaluate(el=>el.getBoundingClientRect().right);
   menuOk=ar>200&&(await page.getByText('Admin Panel',{exact:true}).count())>0;
  }
  const ok=metrics.doc<=392&&metrics.body<=392&&(metrics.headerRight??999)<=392&&(metrics.mainRight??999)<=392&&(metrics.asideRight??999)<=1&&menuOk&&errors.length===0;
  results.push({path,ok,menuOk,metrics,errors});
 }catch(e){results.push({path,ok:false,error:e.message,errors});}
 await context.close();
}
console.log(JSON.stringify(results,null,2));
await browser.close();
if(results.some(r=>!r.ok)) process.exit(2);