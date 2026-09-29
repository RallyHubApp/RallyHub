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
  13 |   await page.route('**/api/apps/**',async route=>{
  14 |     const req=route.request(),url=new URL(req.url());
  15 |     if(url.pathname.includes('/analytics/')) return json(route,{});
  16 |     const marker=`/api/apps/${APP_ID}/functions/interclubTeamManager`;
  17 |     if(url.pathname.includes(marker)){
  18 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  19 |       expect(body.token).toBe(TOKEN);
  20 |       if((body.action||'get')==='save'){
  21 |         model.saves.push(body);
  22 |         const byId=new Map(model.players.map(p=>[p.id,p]));
  23 |         model.players=body.orderedParticipantIds.map((id,index)=>{
  24 |           const edit=(body.players||[]).find(x=>x.id===id)||{};
  25 |           return {...byId.get(id),rank:index+1,playingCategory:edit.playingCategory||'',rosterRole:edit.rosterRole||'rotation'};
  26 |         });
  27 |         model.savedAt=new Date().toISOString();
  28 |         return json(route,{success:true,savedAt:model.savedAt,changed:model.players.length,teamName:'Galway Pickleball'});
  29 |       }
  30 |       return json(route,{success:true,event:{id:'event-e2e',eventName:'Clare Pickleball v Galway Pickleball',teamName:'Galway Pickleball',side:'club_b',clubAName:'Clare Pickleball',clubBName:'Galway Pickleball',clubALogo:'',clubBLogo:'',clubAPrimary:'#2563eb',clubBPrimary:'#7f1d1d',date:'2026-10-04',venue:'St. Joseph’s Doora Barefield',savedAt:model.savedAt},players:model.players});
  31 |     }
  32 |     return json(route,{});
  33 |   });
  34 | 
  35 |   await page.goto('/e2e/interclubTeamManagerHarness.html');
> 36 |   await expect(page.getByRole('heading',{name:'Galway Pickleball'})).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  37 |   await expect(page.getByText('9 on roster')).toBeVisible();
  38 |   await expect(page.getByText('9 registered')).toBeVisible();
  39 |   await expect(page.getByText('Needs saving')).toBeVisible();
  40 | 
  41 |   const move9=page.getByRole('button',{name:'Move Galway Player 09'});
  42 |   await move9.focus();await move9.press('Space');await move9.press('ArrowUp');await move9.press('Space');
  43 |   const categorySelect=page.getByRole('combobox').first();
  44 |   await categorySelect.click();await page.getByRole('option',{name:'Improver'}).click();
  45 |   await page.getByRole('button',{name:'Save Team'}).click();
  46 |   await expect(page.getByText(/Saved 9 players/)).toBeVisible();
  47 |   expect(model.saves).toHaveLength(1);
  48 |   expect(model.saves[0].orderedParticipantIds.at(-2)).toBe('galway-9');
  49 |   expect(model.saves[0].players.find(p=>p.id==='galway-1')?.playingCategory).toBe('improver');
  50 | 
  51 |   model.players.push(player(10));
  52 |   model.savedAt=null;
  53 |   await page.getByRole('button',{name:'Refresh roster'}).click();
  54 |   await expect(page.getByText('10 on roster')).toBeVisible();
  55 |   await expect(page.getByText('Needs saving')).toBeVisible();
  56 |   await expect(page.getByText('Galway Player 10')).toBeVisible();
  57 |   const save=page.getByRole('button',{name:'Save Team'});
  58 |   await expect(save).toBeEnabled();
  59 |   await save.click();
  60 |   await expect(page.getByText(/Saved 10 players/)).toBeVisible();
  61 |   expect(model.saves).toHaveLength(2);
  62 |   expect(model.saves[1].orderedParticipantIds).toHaveLength(10);
  63 | });
```