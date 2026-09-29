# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interclub-team-manager.spec.mjs >> visiting team manager can repeatedly rank, grade and save an evolving Galway roster
- Location: e2e/interclub-team-manager.spec.mjs:11:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Galway Pickleball' })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Galway Pickleball' }) with timeout 3000ms
  - waiting for getByRole('heading', { name: 'Galway Pickleball' })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const TOKEN='cctm_0123456789abcdef0123456789abcdef';
  4  | const APP_ID=process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | function player(i){return {id:`galway-${i}`,displayName:`Galway Player ${String(i).padStart(2,'0')}`,gender:i%2?'Female':'Male',rank:i,playingCategory:'',rosterRole:'rotation',registered:true};}
  8  | 
  9  | test.use({viewport:{width:390,height:844}});
  10 | 
  11 | test('visiting team manager can repeatedly rank, grade and save an evolving Galway roster',async({page})=>{
  12 |   const model={players:Array.from({length:9},(_,i)=>player(i+1)),savedAt:null,saves:[]};
  13 |   page.on('console',msg=>console.log('BROWSER',msg.type(),msg.text()));
  14 |   page.on('request',req=>{if(req.url().includes('/api/'))console.log('REQUEST',req.method(),req.url());});
  15 |   await page.route('**/api/apps/**',async route=>{
  16 |     const req=route.request(),url=new URL(req.url());
  17 |     if(url.pathname.includes('/analytics/')) return json(route,{});
  18 |     const marker=`/api/apps/${APP_ID}/functions/interclubTeamManager`;
  19 |     if(url.pathname.includes(marker)){
  20 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  21 |       expect(body.token).toBe(TOKEN);
  22 |       if((body.action||'get')==='save'){
  23 |         model.saves.push(body);
  24 |         const byId=new Map(model.players.map(p=>[p.id,p]));
  25 |         model.players=body.orderedParticipantIds.map((id,index)=>{
  26 |           const edit=(body.players||[]).find(x=>x.id===id)||{};
  27 |           return {...byId.get(id),rank:index+1,playingCategory:edit.playingCategory||'',rosterRole:edit.rosterRole||'rotation'};
  28 |         });
  29 |         model.savedAt=new Date().toISOString();
  30 |         return json(route,{success:true,savedAt:model.savedAt,changed:model.players.length,teamName:'Galway Pickleball'});
  31 |       }
  32 |       return json(route,{success:true,event:{id:'event-e2e',eventName:'Clare Pickleball v Galway Pickleball',teamName:'Galway Pickleball',side:'club_b',clubAName:'Clare Pickleball',clubBName:'Galway Pickleball',clubALogo:'',clubBLogo:'',clubAPrimary:'#2563eb',clubBPrimary:'#7f1d1d',date:'2026-10-04',venue:'St. Joseph’s Doora Barefield',savedAt:model.savedAt},players:model.players});
  33 |     }
  34 |     return json(route,{});
  35 |   });
  36 | 
  37 |   await page.goto('/e2e/interclubTeamManagerHarness.html');
> 38 |   await expect(page.getByRole('heading',{name:'Galway Pickleball'})).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  39 |   await expect(page.getByText('9 on roster')).toBeVisible();
  40 |   await expect(page.getByText('9 registered')).toBeVisible();
  41 |   await expect(page.getByText('Needs saving')).toBeVisible();
  42 | 
  43 |   const move9=page.getByRole('button',{name:'Move Galway Player 09'});
  44 |   await move9.focus();await move9.press('Space');await move9.press('ArrowUp');await move9.press('Space');
  45 |   const categorySelect=page.getByRole('combobox').first();
  46 |   await categorySelect.click();await page.getByRole('option',{name:'Improver'}).click();
  47 |   await page.getByRole('button',{name:'Save Team'}).click();
  48 |   await expect(page.getByText(/Saved 9 players/)).toBeVisible();
  49 |   expect(model.saves).toHaveLength(1);
  50 |   expect(model.saves[0].orderedParticipantIds.at(-2)).toBe('galway-9');
  51 |   expect(model.saves[0].players.find(p=>p.id==='galway-1')?.playingCategory).toBe('improver');
  52 | 
  53 |   model.players.push(player(10));
  54 |   model.savedAt=null;
  55 |   await page.getByRole('button',{name:'Refresh roster'}).click();
  56 |   await expect(page.getByText('10 on roster')).toBeVisible();
  57 |   await expect(page.getByText('Needs saving')).toBeVisible();
  58 |   await expect(page.getByText('Galway Player 10')).toBeVisible();
  59 |   const save=page.getByRole('button',{name:'Save Team'});
  60 |   await expect(save).toBeEnabled();
  61 |   await save.click();
  62 |   await expect(page.getByText(/Saved 10 players/)).toBeVisible();
  63 |   expect(model.saves).toHaveLength(2);
  64 |   expect(model.saves[1].orderedParticipantIds).toHaveLength(10);
  65 | });
```