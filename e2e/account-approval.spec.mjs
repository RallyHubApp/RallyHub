import {test,expect} from '@playwright/test';
const app='6a01dc00702b7dd2a2978c28';
const admin={id:'admin',email:'admin@example.test',full_name:'Admin',role:'admin',approval_status:'approved',active_tenant_id:'t',active_club_id:'c',active_club_role:'club_admin',kotc_role:'super_admin'};
for(const mobile of [false,true])test('approval failure, retry, queue removal and request isolation '+(mobile?'mobile':'desktop'),async({page})=>{
 if(mobile)await page.setViewportSize({width:390,height:844});
 let attempts=0;const calls=[];
 await page.addInitScript(()=>localStorage.setItem('base44_access_token','approval-test'));
 await page.route('**/api/apps/**',async route=>{
 const req=route.request(),path=new URL(req.url()).pathname;
 const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 if(path.includes('/public-settings/'))return json({id:app,public_settings:{}});
 if(path.endsWith('/entities/User/me')||path.endsWith('/auth/me'))return json(admin);
 if(path.includes('/functions/')){
 const name=path.split('/functions/')[1].split('/')[0];let b={};try{b=req.postDataJSON()||{}}catch{}
 calls.push(name+':'+(b.action||''));
 if(name==='adminUserTools'&&b.action==='list_users')return json({users:[{id:'u',email:'alice@example.test',full_name:'Alice Test',approval_status:'pending'},{id:'v',email:'bob@example.test',full_name:'Bob Test',approval_status:'pending'}]});
 if(name==='membershipRecord'&&b.action==='admin_link_candidates')return json({rows:[{person_id:'p',full_name:'Alice Test',email:'alice@example.test',payment_status:'paid'},{person_id:'q',full_name:'Bob Test',email:'bob@example.test',payment_status:'paid'}]});
 if(name==='membershipRecord'&&b.action==='admin_connect_account'){attempts++;await new Promise(r=>setTimeout(r,350));return attempts===1?json({error:'Rate limit exceeded. Retry after 42s.'},429):json({success:true,person_id:'p',player_id:'pl',user_id:'u'});}
 if(name==='securityContext')return json({success:true,context:null});
 return json({success:true,rows:[],items:[]});
 }
 if(path.includes('/entities/'))return json([]);
 return json({});
 });
 await page.goto('/app/admin?tab=linking');
 await expect(page.getByRole('heading',{name:'RallyHub Accounts & Approvals'})).toBeVisible({timeout:15000});
 const buttons=page.getByRole('button',{name:'Approve & connect'});
 await expect(buttons).toHaveCount(2);
 await buttons.first().click();
 await expect(page.getByRole('button',{name:'Approve & connect'})).toBeDisabled();
 await expect(page.getByText(/Rate limit exceeded/).first()).toBeVisible();
 await expect(buttons).toHaveCount(2);
 await buttons.first().click();
 await expect(page.getByText(/Alice Test — RallyHub account approved/).first()).toBeVisible();
 await expect(buttons).toHaveCount(1);
 expect(attempts).toBe(2);
 for(const key of ['membershipRecord:admin_dashboard_counts','membershipApplication:admin_count','guestAccessJourney:admin_pending_count','adminUserTools:pending_approval_count','memberMessaging:unread_count'])expect(calls).not.toContain(key);
 expect(calls.filter(x=>x==='membershipRecord:admin_link_candidates')).toHaveLength(1);
 expect(calls.filter(x=>x==='adminUserTools:list_users')).toHaveLength(1);
});
