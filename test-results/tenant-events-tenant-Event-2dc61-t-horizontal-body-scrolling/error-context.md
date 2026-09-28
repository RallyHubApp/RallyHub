# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> tenant Events mobile >> editor remains usable on phone without horizontal body scrolling
- Location: e2e/tenant-events.spec.mjs:92:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Create event', { exact: true })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Create event', { exact: true }) with timeout 3000ms
  - waiting for getByText('Create event', { exact: true })

```

```yaml
- heading "Sign in to RallyHub" [level=1]
- paragraph: One account for RallyHub
- button "Continue with Google"
- text: or Email
- textbox "Email":
  - /placeholder: you@example.com
- text: Password
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password":
  - /placeholder: ••••••••
- button "Show password"
- button "Log in"
- paragraph:
  - text: New to RallyHub?
  - link "Create an account":
    - /url: /register?returnTo=%2Fapp%2Fevents
- paragraph: © 2026 RallyHub All rights reserved.
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
  11  |   const model={events:[],writes:[],functions:[]};
  12  |   await page.route('**/api/apps/**',async route=>{
  13  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  14  |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  15  |     if(path.includes('/analytics/'))return json(route,{});
  16  |     if(path.endsWith('/entities/User/me'))return json(route,user);
  17  |     const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
  18  |     if(fi>=0){const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}model.functions.push({name,body});if(name==='securityContext')return json(route,{success:true,context:null});if(name==='eventEngagement'&&body.action==='club_shared')return json(route,{success:true,items:[]});if(name==='secureCreditAction')return json(route,{success:true,preview_url:onePixel,file_url:'https://files.example.test/poster.png'});return json(route,{success:true})}
  19  |     const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
  20  |     if(ei>=0){const rest=path.slice(ei+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  21  |       if(req.method()==='GET'){
  22  |         if(entity==='Club')return json(route,clubs);
  23  |         if(entity==='Venue')return json(route,venues);
  24  |         if(entity==='Tournament')return json(route,model.events);
  25  |         if(entity==='ClubChallengeEvent')return json(route,[]);
  26  |         return json(route,[]);
  27  |       }
  28  |       if(req.method()==='POST'){
  29  |         const created={id:`created-${model.events.length+1}`,...body};model.events.push(created);model.writes.push({method:'POST',entity,body:created});return json(route,created);
  30  |       }
  31  |       if(['PUT','PATCH'].includes(req.method())){const idx=model.events.findIndex(e=>e.id===recordId);const updated={...(idx>=0?model.events[idx]:{id:recordId}),...body};if(idx>=0)model.events[idx]=updated;model.writes.push({method:req.method(),entity,body:updated});return json(route,updated)}
  32  |       if(req.method()==='DELETE')return json(route,{});
  33  |     }
  34  |     return json(route,{});
  35  |   });
  36  |   return model;
  37  | }
  38  | 
  39  | async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}
  40  | 
  41  | test('tenant Events: create, upload/crop, preview and publish one canonical public/member event',async({page})=>{
  42  |   const model=await installBackend(page);
  43  |   await page.goto('/app/events');
  44  |   await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
  45  |   await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  46  |   await page.getByLabel('Event name').fill('Test RallyHub Open');
  47  |   await page.getByLabel('Event type').selectOption('tournament');
  48  |   await page.getByLabel('Starts').fill('2026-12-05');
  49  |   await page.getByLabel('Ends').fill('2026-12-06');
  50  |   await page.getByLabel('Start time').fill('09:30');
  51  |   await page.getByLabel('End time').fill('17:00');
  52  |   await page.getByLabel('Club venue').selectOption('venue-doora');
  53  |   await page.getByLabel('County / region').fill('Clare');
  54  |   await page.getByLabel('Short public summary').fill('A two-day pickleball event built through the shared RallyHub event editor.');
  55  |   await page.getByLabel('Registration URL').fill('https://register.example.test/open');
  56  |   await page.getByLabel('Registration opens').fill('2026-10-01T09:00');
  57  |   await page.getByLabel('Registration closes').fill('2026-12-01T23:00');
  58  |   await page.getByText('Intermediate',{exact:true}).click();
  59  |   await page.getByText('18+',{exact:true}).click();
  60  |   await page.getByText('Mixed Doubles',{exact:true}).click();
  61  | 
  62  |   const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=','base64');
  63  |   await page.locator('input[type=file]').setInputFiles({name:'event-poster.png',mimeType:'image/png',buffer:png});
  64  |   await expect(page.getByText('Uploaded',{exact:true})).toBeVisible();
  65  |   await expect(page.getByText('Event-card crop',{exact:true}).first()).toBeVisible();
  66  |   const sliders=page.locator('input[type=range]');
  67  |   await sliders.nth(5).fill('1.5');
  68  | 
  69  |   await page.getByLabel('Publish on RallyHub public Events').check();
  70  |   await page.getByRole('button',{name:'Public card'}).click();
  71  |   await expect(page.getByText('Test RallyHub Open').last()).toBeVisible();
  72  |   await expect(page.getByText('This is the snippet players see first')).toBeHidden();
  73  |   await page.getByRole('button',{name:'Back to editor'}).click();
  74  | 
  75  |   await page.getByRole('button',{name:'Publish selected audiences'}).click();
  76  |   await expect(page.getByText('Published ✓')).toBeVisible();
  77  |   expect(model.writes.filter(w=>w.entity==='Tournament'&&w.method==='POST')).toHaveLength(1);
  78  |   const payload=model.writes.find(w=>w.entity==='Tournament')?.body;
  79  |   expect(payload.event_public_visible).toBe(true);
  80  |   expect(payload.event_member_visible).toBe(true);
  81  |   expect(payload.event_card_zoom).toBe(1.5);
  82  |   expect(payload.event_slug).toBe('test-rallyhub-open');
  83  |   expect(payload.event_levels).toContain('Intermediate');
  84  |   expect(payload.event_age_groups).toContain('18+');
  85  |   expect(payload.event_disciplines).toContain('Mixed Doubles');
  86  |   expect(payload.event_publish_status).toBe('published');
  87  |   await noHorizontalOverflow(page);
  88  | });
  89  | 
  90  | test.describe('tenant Events mobile',()=>{
  91  |   test.use({viewport:{width:390,height:844}});
  92  |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  93  |     await installBackend(page);
  94  |     await page.goto('/app/events');
> 95  |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  96  |     await page.getByLabel('Event name').fill('Mobile Event');
  97  |     await page.getByLabel('Starts').fill('2026-12-05');
  98  |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  99  |     await noHorizontalOverflow(page);
  100 |   });
  101 | });
  102 | 
```