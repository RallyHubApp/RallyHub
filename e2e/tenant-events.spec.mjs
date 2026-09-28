import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
const user={id:'tenant-events-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const clubs=[{id:'club-clare',tenant_id:'tenant-clare',name:'Clare Pickleball',slug:'clare-pickleball',status:'active'},{id:'club-pbi',tenant_id:'tenant-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',status:'active'}];
const venues=[{id:'venue-doora',tenant_id:'tenant-clare',club_id:'club-clare',name:"St Joseph's Doora Barefield",status:'active'}];
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function installBackend(page){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','tenant-events-e2e-token'));
  const model={events:[],writes:[],functions:[]};
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
    if(path.includes('/analytics/'))return json(route,{});
    if(path.endsWith('/entities/User/me'))return json(route,user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
    if(fi>=0){const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}model.functions.push({name,body});if(name==='securityContext')return json(route,{success:true,context:null});if(name==='eventEngagement'&&body.action==='club_shared')return json(route,{success:true,items:[]});if(name==='secureCreditAction')return json(route,{success:true,preview_url:onePixel,file_url:'https://files.example.test/poster.png'});return json(route,{success:true})}
    const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
    if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
      if(req.method()==='GET'){
        if(entity==='Club')return json(route,clubs);
        if(entity==='Venue')return json(route,venues);
        if(entity==='Tournament')return json(route,model.events);
        if(entity==='ClubChallengeEvent')return json(route,[]);
        return json(route,[]);
      }
      if(req.method()==='POST'){
        const created={id:`created-${model.events.length+1}`,...body};model.events.push(created);model.writes.push({method:'POST',entity,body:created});return json(route,created);
      }
      if(['PUT','PATCH'].includes(req.method())){const idx=model.events.findIndex(e=>e.id===recordId);const updated={...(idx>=0?model.events[idx]:{id:recordId}),...body};if(idx>=0)model.events[idx]=updated;model.writes.push({method:req.method(),entity,body:updated});return json(route,updated)}
      if(req.method()==='DELETE')return json(route,{});
    }
    return json(route,{});
  });
  return model;
}

async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}

test('tenant Events: create, upload/crop, preview and publish one canonical public/member event',async({page})=>{
  const model=await installBackend(page);
  await page.goto('/app/events');
  await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
  await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  await page.getByLabel('Event name').fill('Test RallyHub Open');
  await page.getByLabel('Event type').selectOption('tournament');
  await page.getByLabel('Starts').fill('2026-12-05');
  await page.getByLabel('Ends').fill('2026-12-06');
  await page.getByLabel('Start time').fill('09:30');
  await page.getByLabel('End time').fill('17:00');
  await page.getByLabel('Club venue').selectOption('venue-doora');
  await page.getByLabel('County / region').fill('Clare');
  await page.getByLabel('Short public summary').fill('A two-day pickleball event built through the shared RallyHub event editor.');
  await page.getByLabel('Registration URL').fill('https://register.example.test/open');
  await page.getByLabel('Registration opens').fill('2026-10-01T09:00');
  await page.getByLabel('Registration closes').fill('2026-12-01T23:00');
  await page.getByText('Intermediate',{exact:true}).click();
  await page.getByText('18+',{exact:true}).click();
  await page.getByText('Mixed Doubles',{exact:true}).click();

  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=','base64');
  await page.locator('input[type=file]').setInputFiles({name:'event-poster.png',mimeType:'image/png',buffer:png});
  await expect(page.getByText('Uploaded',{exact:true})).toBeVisible();
  await expect(page.getByText('Event-card crop',{exact:true}).first()).toBeVisible();
  const sliders=page.locator('input[type=range]');
  await sliders.nth(5).fill('1.5');

  await page.getByLabel('Publish on RallyHub public Events').check();
  await page.getByRole('button',{name:'Public card'}).click();
  await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  await expect(page.getByText('PREVIEW',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to editor'}).click();

  await page.getByRole('button',{name:'Publish selected audiences'}).click();
  await expect(page.getByText('Published ✓')).toBeVisible();
  expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  expect(payload.event_public_visible).toBe(true);
  expect(payload.event_member_visible).toBe(true);
  expect(payload.event_card_zoom).toBe(1.5);
  expect(payload.event_slug).toBe('test-rallyhub-open');
  expect(payload.event_levels).toContain('Intermediate');
  expect(payload.event_age_groups).toContain('18+');
  expect(payload.event_disciplines).toContain('Mixed Doubles');
  expect(payload.event_publish_status).toBe('published');
  await noHorizontalOverflow(page);
});

test.describe('tenant Events mobile',()=>{
  test.use({viewport:{width:390,height:844}});
  test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
    await installBackend(page);
    await page.goto('/app/events');
    await expect(page.getByText('Create event',{exact:true})).toBeVisible();
    await page.getByLabel('Event name').fill('Mobile Event');
    await page.getByLabel('Starts').fill('2026-12-05');
    await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
    await noHorizontalOverflow(page);
  });
});
