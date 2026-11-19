import {test,expect} from '@playwright/test';
const appId=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const initial=[{id:'grant1',user_id:'u1',name:'Host One',email:'one@example.test'},{id:'grant2',user_id:'u2',name:'Host Two',email:'two@example.test'},{id:'grant3',user_id:'u3',name:'Host Three',email:'three@example.test'}];
const fourth={id:'grant4',user_id:'u4',name:'Host Four',email:'four@example.test'};
async function mock(page,hosts){
 await page.route(`**/api/apps/${appId}/functions/manageKotcEventHost`,async route=>{
  const b=route.request().postDataJSON()||{};
  let data;
  if(b.action==='state')data={hosts};
  else if(b.action==='search_hosts')data={people:[{id:'p4',name:fourth.name,email:fourth.email,isMember:true}]};
  else if(b.action==='grant'){hosts.push(fourth);data={success:true};}
  else data={error:'Unexpected action'};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
}
test('appointed hosts: names and emails persist on refresh; appointment updates list',async({page})=>{
 const hosts=initial.map(x=>({...x}));await mock(page,hosts);
 await page.goto('/e2e/kotcHostAccessHarness.html');
 const list=page.getByTestId('kotc-appointed-host-list');
 await expect(list).toContainText('Appointed hosts (3)');
 for(const h of initial){await expect(list.getByText(h.name,{exact:true})).toBeVisible();await expect(list.getByText(h.email,{exact:true})).toBeVisible();}
 await page.reload();await expect(list).toContainText('Appointed hosts (3)');
 for(const h of initial)await expect(list.getByText(h.name,{exact:true})).toBeVisible();
 await page.locator('#kotc-event-host-search').fill('Host Four');
 await expect(page.getByRole('checkbox',{name:'Select Host Four as host'})).toBeVisible();
 await page.getByRole('checkbox',{name:'Select Host Four as host'}).check();
 await page.getByRole('button',{name:'Appoint 1 Host'}).click();
 await expect(list).toContainText('Appointed hosts (4)');
 await expect(list.getByText(fourth.name,{exact:true})).toBeVisible();
 await expect(list.getByText(fourth.email,{exact:true})).toBeVisible();
});

test('host appointment failure explains missing account persistently',async({page})=>{
 await page.route(`**/api/apps/${appId}/functions/manageKotcEventHost`,async route=>{
  const b=route.request().postDataJSON()||{};
  const data=b.action==='state'?{hosts:[]}:b.action==='search_hosts'?{people:[{id:'p4',name:'Darragh Broderick',email:'darragh@example.test'}]}:{error:'Host must have an existing RallyHub account'};
  await route.fulfill({status:b.action==='grant'?404:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('/e2e/kotcHostAccessHarness.html');
 await page.locator('#kotc-event-host-search').fill('Darragh');
 await page.getByRole('checkbox',{name:'Select Darragh Broderick as host'}).check();
 await page.getByRole('button',{name:'Appoint 1 Host'}).click();
 const alert=page.getByTestId('kotc-host-appointment-errors');
 await expect(alert).toContainText('Darragh Broderick');
 await expect(alert).toContainText('existing RallyHub account');
 await expect(alert).toContainText('sign in to RallyHub');
});
