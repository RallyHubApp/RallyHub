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
  const crop=page.getByTestId('event-card-crop');
  await crop.scrollIntoViewIfNeeded();
  const box=await crop.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2,box.y+box.height*0.72,{steps:5});
  await page.mouse.up();
  const sliders=page.locator('input[type=range]');
  await sliders.nth(5).fill('1.5');

  await page.getByLabel('Publish on RallyHub public Events').check();
  await page.getByRole('button',{name:'Public card'}).click();
  await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  await expect(page.getByText('PREVIEW',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to editor'}).click();

  await page.getByRole('button',{name:'Publish selected audiences'}).click();
  await expect(page.getByText('Published to members + public Events ✓')).toBeVisible();
  expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  expect(payload.event_public_visible).toBe(true);
  expect(payload.event_member_visible).toBe(true);
  expect(payload.event_card_zoom).toBe(1.5);
  expect(payload.event_card_position_y).not.toBe(50);
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

test('event artwork: automatically import a verified original without manual uploader',async({page})=>{
 const model=await installBackend(page);
 const source='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/poster.webp';
 const stored='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/verified-poster.webp';
 await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:stored,sourceUrl:source,width:1510,height:1042,bytes:177208,sha256:'test-digest',reviewRequired:false}));
 await page.goto('/app/events');
 await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
 await page.getByLabel('Original poster URL').fill(source);
 await page.getByRole('button',{name:'Import original automatically'}).click();
 await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',stored);
 await expect(page.getByAltText('Event card crop preview')).toHaveAttribute('src',stored);
});

test('event page URL discovers matching poster before verified import',async({page})=>{
 await installBackend(page);
 const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
 await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
 await page.goto('/app/events');
 await page.getByLabel('Event name').fill('Munster Open 2027');
 await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
 await page.getByRole('button',{name:'Find event poster'}).click();
 await expect(page.getByLabel('Original poster URL')).toHaveValue(poster);
});

test('claimed directory event editor discovers and imports original artwork',async({page})=>{
 const model=await installBackend(page);
 const image='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
 await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club',county:'Clare'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
 await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:image,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
 await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:image,width:1254,height:900}));
 await page.goto('/directory/test-club/events');
 await page.getByLabel('Event name').fill('Munster Open 2027');
 await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
 await page.getByRole('button',{name:'Find event poster'}).click();
 await expect(page.getByLabel('Original poster URL')).toHaveValue(image);
 await page.getByRole('button',{name:'Import original automatically'}).click();
 await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',image);
});

test('authenticated directory live-verification control checks both functions without saving event',async({page})=>{
 const model=await installBackend(page);const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
 await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
 await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',score:150}}));
 await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:'https://base44.app/verified.webp',width:1254,height:900,sha256:'a'.repeat(64)}));
 await page.goto('/directory/test-club/events');await page.getByLabel('Event name').fill('Munster Open 2027');await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
 await page.getByRole('button',{name:'Run live poster verification'}).click();await expect(page.getByRole('status')).toContainText('PASS: Storage verified');
 expect(model.writes).toHaveLength(0);
});

test('directory event finder offers selectable event list and enables verification',async({page})=>{
 await installBackend(page);
 const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
 await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
 await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,events:[{name:'Munster Open 2027',eventUrl:'https://pickleballireland.ie/event/munster-open-2027/',imageUrl:poster},{name:'European Open 2026',eventUrl:'https://pickleballireland.ie/event/european-open-2026/',imageUrl:poster}]}));
 await page.goto('/directory/test-club/events');
 await page.getByRole('button',{name:'Find events on this website'}).click();
 await expect(page.getByLabel('Select discovered event')).toBeVisible();
 await page.getByLabel('Filter discovered events').fill('Munster');
 await page.getByLabel('Select discovered event').selectOption('https://pickleballireland.ie/event/munster-open-2027/');
 await expect(page.getByRole('button',{name:'Run live poster verification'})).toBeEnabled();
});
