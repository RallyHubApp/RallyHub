import { chromium } from '@playwright/test';
const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'mobile-shell-admin',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
await page.addInitScript(()=>localStorage.setItem('base44_access_token','mobile-shell-e2e-token'));
await page.route('**/*',async route=>{
 const req=route.request(); const u=new URL(req.url()); const p=u.pathname;
 if(!p.startsWith('/api/')) return route.continue();
 const fulfill=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 if(p.includes('/public-settings/')) return fulfill({id:APP_ID,public_settings:{}});
 if(p.endsWith('/entities/User/me')||p.endsWith('/users/me')||p.endsWith('/auth/me')) return fulfill(user);
 if(p.includes('/functions/')){
   const name=decodeURIComponent(p.split('/functions/')[1].split('/')[0]);
   if(name==='securityContext') return fulfill({success:true,context:null});
   if(name==='memberPortal') return fulfill({success:true,snapshot:{}});
   if(name==='adminUserTools') return fulfill({success:true,pendingCount:0,users:[]});
   if(name==='directoryClaim') return fulfill({success:true,pendingCount:0,claims:[]});
   if(name==='membershipRecord') return fulfill({success:true,records:[],items:[],counts:{}});
   return fulfill({success:true,items:[],records:[],rows:[],events:[],data:[]});
 }
 if(p.includes('/entities/')) return fulfill([]);
 return fulfill({});
});
const routes=['/app','/app/admin','/app/membership','/app/events','/app/tournaments','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage'];
const out=[];
for(const path of routes){
 const errors=[]; const cb=e=>errors.push(e.message); page.on('pageerror',cb);
 try{
  await page.goto('http://127.0.0.1:5173'+path,{waitUntil:'commit',timeout:5000}).catch(()=>{});
  await page.locator('header').waitFor({state:'visible',timeout:10000});
  const m=await page.evaluate(()=>{const q=s=>document.querySelector(s)?.getBoundingClientRect(); const a=q('aside'),h=q('header'),mn=q('main'); return {innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,aside:a&&{left:a.left,right:a.right,width:a.width},header:h&&{left:h.left,right:h.right,width:h.width},main:mn&&{left:mn.left,right:mn.right,width:mn.width}}});
  let menuOk=true;
  if(path==='/app/admin'){
    const menu=page.locator('header button').first();
    await menu.click();
    await page.waitForTimeout(150);
    const openRight=await page.locator('aside').evaluate(el=>el.getBoundingClientRect().right);
    const hasAdminPanel=await page.getByText('Admin Panel',{exact:true}).count();
    menuOk=openRight>200&&hasAdminPanel>0;
    await page.locator('aside button').first().click().catch(()=>{});
  }
  out.push({path,ok:m.doc<=392&&m.body<=392&&m.header?.right<=392&&m.main?.right<=392&&m.aside?.right<=1&&errors.length===0&&menuOk,menuOk,metrics:m,errors});
 }catch(e){out.push({path,ok:false,error:e.message,errors});}
 page.off('pageerror',cb);
}
console.log(JSON.stringify(out,null,2));
await browser.close();
if(out.some(x=>!x.ok)) process.exit(2);