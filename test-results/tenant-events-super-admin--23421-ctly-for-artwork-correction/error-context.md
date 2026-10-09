# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-events.spec.mjs >> super admin event deep link opens existing event directly for artwork correction
- Location: e2e/tenant-events.spec.mjs:192:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Editing: Munster Open 2027')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Editing: Munster Open 2027') with timeout 3000ms
  - waiting for getByText('Editing: Munster Open 2027')

```

# Test source

```ts
  96  |   expect(payload.event_publish_status).toBe('published');
  97  |   await noHorizontalOverflow(page);
  98  | });
  99  | 
  100 | test.describe('tenant Events mobile',()=>{
  101 |   test.use({viewport:{width:390,height:844}});
  102 |   test('editor remains usable on phone without horizontal body scrolling',async({page})=>{
  103 |     await installBackend(page);
  104 |     await page.goto('/app/events');
  105 |     await expect(page.getByText('Create event',{exact:true})).toBeVisible();
  106 |     await page.getByLabel('Event name').fill('Mobile Event');
  107 |     await page.getByLabel('Starts').fill('2026-12-05');
  108 |     await expect(page.getByRole('button',{name:'Save draft'})).toBeVisible();
  109 |     await noHorizontalOverflow(page);
  110 |   });
  111 | });
  112 | 
  113 | test('event artwork: automatically import a verified original without manual uploader',async({page})=>{
  114 |  const model=await installBackend(page);
  115 |  const source='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/poster.webp';
  116 |  const stored='https://base44.app/api/apps/'+APP_ID+'/files/mp/public/verified-poster.webp';
  117 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:stored,sourceUrl:source,width:1510,height:1042,bytes:177208,sha256:'test-digest',reviewRequired:false}));
  118 |  await page.goto('/app/events');
  119 |  await expect(page.getByRole('heading',{name:'Events',exact:true})).toBeVisible();
  120 |  await page.getByLabel('Original poster URL').fill(source);
  121 |  await page.getByRole('button',{name:'Import original automatically'}).click();
  122 |  await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',stored);
  123 |  await expect(page.getByAltText('Event card crop preview')).toHaveAttribute('src',stored);
  124 | });
  125 | 
  126 | test('event page URL discovers matching poster before verified import',async({page})=>{
  127 |  await installBackend(page);
  128 |  const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  129 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
  130 |  await page.goto('/app/events');
  131 |  await page.getByLabel('Event name').fill('Munster Open 2027');
  132 |  await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  133 |  await page.getByRole('button',{name:'Find event poster'}).click();
  134 |  await expect(page.getByLabel('Original poster URL')).toHaveValue(poster);
  135 | });
  136 | 
  137 | test('claimed directory event editor discovers and imports original artwork',async({page})=>{
  138 |  const model=await installBackend(page);
  139 |  const image='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  140 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club',county:'Clare'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  141 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:image,eventName:'Munster Open 2027',origin:'event-jsonld',score:150}}));
  142 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:image,width:1254,height:900}));
  143 |  await page.goto('/directory/test-club/events');
  144 |  await page.getByLabel('Event name').fill('Munster Open 2027');
  145 |  await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  146 |  await page.getByRole('button',{name:'Find event poster'}).click();
  147 |  await expect(page.getByLabel('Original poster URL')).toHaveValue(image);
  148 |  await page.getByRole('button',{name:'Import original automatically'}).click();
  149 |  await expect(page.getByAltText('Event poster preview')).toHaveAttribute('src',image);
  150 | });
  151 | 
  152 | test('authenticated directory live-verification control checks both functions without saving event',async({page})=>{
  153 |  const model=await installBackend(page);const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  154 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  155 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,reviewRequired:false,selected:{imageUrl:poster,eventName:'Munster Open 2027',score:150}}));
  156 |  await page.route('**/api/apps/**/functions/eventPosterIngest',route=>json(route,{success:true,originalUrl:'https://base44.app/verified.webp',width:1254,height:900,sha256:'a'.repeat(64)}));
  157 |  await page.goto('/directory/test-club/events');await page.getByLabel('Event name').fill('Munster Open 2027');await page.getByLabel('Event webpage URL').fill('https://pickleballireland.ie/events/');
  158 |  await page.getByRole('button',{name:'Run live poster verification'}).click();await expect(page.getByRole('status')).toContainText('PASS: Storage verified');
  159 |  expect(model.writes).toHaveLength(0);
  160 | });
  161 | 
  162 | test('directory event finder offers selectable event list and enables verification',async({page})=>{
  163 |  await installBackend(page);
  164 |  const poster='https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp';
  165 |  await page.route('**/api/apps/**/functions/directoryEvents',route=>json(route,{success:true,canManage:true,role:'owner',listing:{slug:'test-club',name:'Test Club'},host:{id:'club-clare',name:'Test Club'},tenant:{id:'tenant-clare'},events:[],venues:[]}));
  166 |  await page.route('**/api/apps/**/functions/eventPosterDiscover',route=>json(route,{success:true,events:[{name:'Munster Open 2027',eventUrl:'https://pickleballireland.ie/event/munster-open-2027/',imageUrl:poster},{name:'European Open 2026',eventUrl:'https://pickleballireland.ie/event/european-open-2026/',imageUrl:poster}]}));
  167 |  await page.goto('/directory/test-club/events');
  168 |  await page.getByRole('button',{name:'Find events on this website'}).click();
  169 |  await expect(page.getByLabel('Select discovered event')).toBeVisible();
  170 |  await page.getByLabel('Filter discovered events').fill('Munster');
  171 |  await page.getByLabel('Select discovered event').selectOption('https://pickleballireland.ie/event/munster-open-2027/');
  172 |  await expect(page.getByRole('button',{name:'Run live poster verification'})).toBeEnabled();
  173 | });
  174 | 
  175 | test('super admin discovery approval queue shows pending event and routes approval to backend',async({page})=>{
  176 |  await installBackend(page);
  177 |  const decisions=[];
  178 |  const candidate={id:'proposal-1',name:'Verified Invitational 2027',start_date:'2027-04-12',location:'Galway',organiser:'Example Club',source_url:'https://example.org/event',status:'pending',duplicateEventId:null};
  179 |  await page.route(`**/api/apps/${APP_ID}/functions/eventDiscoveryApproval`,async route=>{
  180 |   const body=route.request().postDataJSON()||{};
  181 |   if(body.action==='list')return json(route,{success:true,candidates:[candidate]});
  182 |   if(body.action==='decide'){decisions.push(body);return json(route,{success:true,publishedEventId:'published-1'});}
  183 |   return json(route,{error:'Unexpected action'},400);
  184 |  });
  185 |  await page.goto('/app/events');
  186 |  await expect(page.getByTestId('event-discovery-queue')).toBeVisible();
  187 |  await expect(page.getByText('Verified Invitational 2027')).toBeVisible();
  188 |  await page.getByTestId('event-discovery-queue').getByRole('button',{name:'Hold'}).click();
  189 |  await expect.poll(()=>decisions.some(x=>x.action==='decide'&&x.decision==='held'&&x.id==='proposal-1')).toBeTruthy();
  190 | });
  191 | 
  192 | test('super admin event deep link opens existing event directly for artwork correction',async({page})=>{
  193 |  const model=await installBackend(page);
  194 |  model.events.push({id:'munster-event',name:'Munster Open 2027',tenant_id:'tenant-pbi',host_club_id:'club-pbi',start_date:'2027-02-13',end_date:'2027-02-14',event_public_visible:true,event_publish_status:'published',event_image_url:'https://example.org/munster.png',event_image_zoom:1.4,event_category:'tournament',event_registration_mode:'none'});
  195 |  await page.goto('/app/events?edit=munster-event&host=club-pbi');
> 196 |  await expect(page.getByText('Editing: Munster Open 2027')).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  197 |  await expect(page.getByLabel('Event name')).toHaveValue('Munster Open 2027');
  198 |  await expect(page.locator('select').filter({has:page.locator('option[value="club-pbi"]')})).toHaveValue('club-pbi');
  199 | });
  200 | 
```