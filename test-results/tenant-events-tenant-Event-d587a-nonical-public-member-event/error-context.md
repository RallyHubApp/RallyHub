# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> tenant Events: create, upload/crop, preview and publish one canonical public/member event
- Location: e2e/tenant-events.spec.mjs:42:1

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByText('This is the snippet players see first')
Expected: hidden
Received: visible
Timeout:  3000ms

Call log:
  - Expect "toBeHidden" getByText('This is the snippet players see first') with timeout 3000ms
  - waiting for getByText('This is the snippet players see first')
    10 × locator resolved to <div data-dynamic-content="false" data-source-location="src/components/events/EventMediaEditor.jsx:54:18" class="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold text-white">This is the snippet players see first</div>
       - unexpected value "visible"

```

```yaml
- text: This is the snippet players see first
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID='6a01dc00702b7dd2a2978c28';
  4   | const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
  5   | const user={id:'tenant-events-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
  6   | const clubs=[{id:'club-clare',tenant_id:'tenant-clare',name:'Clare Pickleball',slug:'clare-pickleball',status:'active'},{id:'club-pbi',tenant_id:'tenant-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',status:'active'}];
  7   | const venues=[{id:'venue-doora',tenant_id:'tenant-clare',club_id:'club-clare',name:"St Joseph's Doora Barefield",status:'active'}];
  8   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  9   | 
  10  | async function installBackend(page){
  11  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','tenant-events-e2e-token'));
  12  |   const model={events:[],writes:[],functions:[]};
  13  |   await page.route('**/api/apps/**',async route=>{
  14  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  15  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  16  |     if(path.includes('/analytics/'))return json(route,{});
  17  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  18  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
  19  |     if(fi>=0){const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}model.functions.push({name,body});if(name==='securityContext')return json(route,{success:true,context:null});if(name==='eventEngagement'&&body.action==='club_shared')return json(route,{success:true,items:[]});if(name==='secureCreditAction')return json(route,{success:true,preview_url:onePixel,file_url:'https://files.example.test/poster.png'});return json(route,{success:true})}
  20  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
  21  |     if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  22  |       if(req.method()==='GET'){
  23  |         if(entity==='Club')return json(route,clubs);
  24  |         if(entity==='Venue')return json(route,venues);
  25  |         if(entity==='Tournament')return json(route,model.events);
  26  |         if(entity==='ClubChallengeEvent')return json(route,[]);
  27  |         return json(route,[]);
  28  |       }
  29  |       if(req.method()==='POST'){
  30  |         const created={id:`created-${model.events.length+1}`,...body};model.events.push(created);model.writes.push({method:'POST',entity,body:created});return json(route,created);
  31  |       }
  32  |       if(['PUT','PATCH'].includes(req.method())){const idx=model.events.findIndex(e=>e.id===recordId);const updated={...(idx>=0?model.events[idx]:{id:recordId}),...body};if(idx>=0)model.events[idx]=updated;model.writes.push({method:req.method(),entity,body:updated});return json(route,updated)}
  33  |       if(req.method()==='DELETE')return json(route,{});
  34  |     }
  35  |     return json(route,{});
  36  |   });
  37  |   return model;
  38  | }
  39  | 
  40  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  41  | 
  42  | test('tenant Events: create, upload/crop, preview and publish one canonical public/member event',async({page})=>{
  43  |   const model=await installBackend(page);
  44  |   await page.goto('/app/events');
  45  |   await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
  46  |   await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  47  |   await page.getByLabel('Event name').fill('Test RallyHub Open');
  48  |   await page.getByLabel('Event type').selectOption('tournament');
  49  |   await page.getByLabel('Starts').fill('2026-12-05');
  50  |   await page.getByLabel('Ends').fill('2026-12-06');
  51  |   await page.getByLabel('Start time').fill('09:30');
  52  |   await page.getByLabel('End time').fill('17:00');
  53  |   await page.getByLabel('Club venue').selectOption('venue-doora');
  54  |   await page.getByLabel('County / region').fill('Clare');
  55  |   await page.getByLabel('Short public summary').fill('A two-day pickleball event built through the shared RallyHub event editor.');
  56  |   await page.getByLabel('Registration URL').fill('https://register.example.test/open');
  57  |   await page.getByLabel('Registration opens').fill('2026-10-01T09:00');
  58  |   await page.getByLabel('Registration closes').fill('2026-12-01T23:00');
  59  |   await page.getByText('Intermediate',{exact:true}).click();
  60  |   await page.getByText('18+',{exact:true}).click();
  61  |   await page.getByText('Mixed Doubles',{exact:true}).click();
  62  | 
  63  |   const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=','base64');
  64  |   await page.locator('input[type=file]').setInputFiles({name:'event-poster.png',mimeType:'image/png',buffer:png});
  65  |   await expect(page.getByText('Uploaded',{exact:true})).toBeVisible();
  66  |   await expect(page.getByText('Event-card crop',{exact:true}).first()).toBeVisible();
  67  |   const sliders=page.locator('input[type=range]');
  68  |   await sliders.nth(5).fill('1.5');
  69  | 
  70  |   await page.getByLabel('Publish on RallyHub public Events').check();
  71  |   await page.getByRole('button',{name:'Public card'}).click();
  72  |   await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
> 73  |   await expect(page.getByText('This is the snippet players see first')).toBeHidden();
      |                                                                         ^ Error: expect(locator).toBeHidden() failed
  74  |   await page.getByRole('button',{name:'Back to editor'}).click();
  75  | 
  76  |   await page.getByRole('button',{name:'Publish selected audiences'}).click();
  77  |   await expect(page.getByText('Published ✓')).toBeVisible();
  78  |   expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  79  |   const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  80  |   expect(payload.event_public_visible).toBe(true);
  81  |   expect(payload.event_member_visible).toBe(true);
  82  |   expect(payload.event_card_zoom).toBe(1.5);
  83  |   expect(payload.event_slug).toBe('test-rallyhub-open');
  84  |   expect(payload.event_levels).toContain('Intermediate');
  85  |   expect(payload.event_age_groups).toContain('18+');
  86  |   expect(payload.event_disciplines).toContain('Mixed Doubles');
  87  |   expect(payload.event_publish_status).toBe('published');
  88  |   await noHorizontalOverflow(page);
  89  | });
  90  | 
  91  | test.describe('tenant Events mobile',()=>{
  92  |   test.use({viewport:{width:390,height:844}});
  93  |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  94  |     await installBackend(page);
  95  |     await page.goto('/app/events');
  96  |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  97  |     await page.getByLabel('Event name').fill('Mobile Event');
  98  |     await page.getByLabel('Starts').fill('2026-12-05');
  99  |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  100 |     await noHorizontalOverflow(page);
  101 |   });
  102 | });
  103 | 
```