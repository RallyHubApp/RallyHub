import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'mobile-shell-admin',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function installBackend(page){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','mobile-shell-e2e-token'));
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
    if(path.includes('/analytics/')) return json(route,{});
    if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
    if(path.endsWith('/entities/User/me')) return json(route,user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
    if(fi>=0){
      const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
      if(name==='securityContext') return json(route,{success:true,context:null});
      if(name==='memberPortal') return json(route,{success:true,snapshot:{}});
      if(name==='adminUserTools') return json(route,{success:true,pendingCount:0,users:[]});
      if(name==='directoryClaim') return json(route,{success:true,pendingCount:0,claims:[]});
      if(name==='membershipRecord') return json(route,{success:true,records:[],items:[]});
      if(name==='waitingList') return json(route,{success:true,items:[],config:null});
      return json(route,{success:true,items:[],records:[],events:[],data:[]});
    }
    const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
    if(ei>=0) return json(route,[]);
    return json(route,{});
  });
}

async function assertMobileShell(page,path){
  await page.goto(path);
  await page.waitForTimeout(250);
  const metrics=await page.evaluate(()=>{
    const aside=document.querySelector('aside');
    const main=document.querySelector('main');
    const header=document.querySelector('header');
    const ar=aside?.getBoundingClientRect(); const mr=main?.getBoundingClientRect(); const hr=header?.getBoundingClientRect();
    const offenders=[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className||'').slice(0,160),left:r.left,right:r.right,width:r.width}}).filter(x=>x.right>innerWidth+2||x.left<-2).slice(0,10);
    return {innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,aside:ar&&{left:ar.left,right:ar.right,width:ar.width},main:mr&&{left:mr.left,right:mr.right,width:mr.width},header:hr&&{left:hr.left,right:hr.right,width:hr.width},offenders};
  });
  expect(metrics.scrollWidth,`${path} horizontal overflow ${JSON.stringify(metrics.offenders)}`).toBeLessThanOrEqual(metrics.innerWidth+2);
  expect(metrics.bodyScrollWidth,`${path} body overflow`).toBeLessThanOrEqual(metrics.innerWidth+2);
  expect(metrics.main?.left,`${path} main shifted by desktop sidebar`).toBeGreaterThanOrEqual(-1);
  expect(metrics.main?.right,`${path} main wider than viewport`).toBeLessThanOrEqual(metrics.innerWidth+2);
  expect(metrics.header?.right,`${path} header wider than viewport`).toBeLessThanOrEqual(metrics.innerWidth+2);
  expect(metrics.aside?.right,`${path} closed sidebar should be off-canvas`).toBeLessThanOrEqual(1);
}

test.describe('shared authenticated app shell mobile regression',()=>{
  test.use({viewport:{width:390,height:844}});
  for(const path of ['/app','/app/admin','/app/membership','/app/events','/app/tournaments','/app/players','/app/waiting-list','/app/guest-bookings','/app/learn/manage']){
    test(`${path} stays phone-width with desktop sidebar closed`,async({page})=>{await installBackend(page);await assertMobileShell(page,path);});
  }
});
