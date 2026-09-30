# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interclub-team-manager.spec.mjs >> visiting team manager can repeatedly rank, grade and save an evolving Galway roster
- Location: e2e/interclub-team-manager.spec.mjs:11:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Saved 10 players/)
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/Saved 10 players/) with timeout 3000ms
  - waiting for getByText(/Saved 10 players/)

```

```yaml
- button "Current appearance Auto. Change appearance.":
  - img
- banner:
  - img "RallyHub"
  - text: RallyHub RallyHub Interclub
  - paragraph: Team Manager
  - text: Clare Pickleball Galway Pickleball
  - heading "Galway Pickleball" [level=1]
  - paragraph: Clare Pickleball v Galway Pickleball
  - text: Sun 4 Oct 2026 St. Joseph’s Doora Barefield
- heading "Current team" [level=2]
- paragraph: Drag players into the correct ranking, set Social or Improver, choose Rotation or Reserve, then save. You can reopen this link and edit again when more players register or the team changes.
- button "Refresh roster" [disabled]:
  - img
  - text: Refresh roster
- text: 10 on roster 10 registered 10 rotation 0 reserve Needs saving Saving current team…
- button "Move Galway Player 02":
  - img
- text: "1"
- paragraph: Galway Player 02
- text: Male Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 01":
  - img
- text: "2"
- paragraph: Galway Player 01
- text: Female Registered ✓
- combobox: Improver
- combobox: Rotation
- button "Move Galway Player 03":
  - img
- text: "3"
- paragraph: Galway Player 03
- text: Female Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 04":
  - img
- text: "4"
- paragraph: Galway Player 04
- text: Male Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 05":
  - img
- text: "5"
- paragraph: Galway Player 05
- text: Female Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 06":
  - img
- text: "6"
- paragraph: Galway Player 06
- text: Male Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 07":
  - img
- text: "7"
- paragraph: Galway Player 07
- text: Female Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 08":
  - img
- text: "8"
- paragraph: Galway Player 08
- text: Male Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 09":
  - img
- text: "9"
- paragraph: Galway Player 09
- text: Female Registered ✓
- combobox: Level not set
- combobox: Rotation
- button "Move Galway Player 10":
  - img
- text: "10"
- paragraph: Galway Player 10
- text: Male Registered ✓
- combobox: Level not set
- combobox: Rotation
- text: Review the team and save the current configuration.
- button "Saving…" [disabled]:
  - img
  - text: Saving…
- paragraph: This link only manages this team for this Interclub event. It does not give access to the host club or other RallyHub areas.
- region "Notifications alt+T"
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
  36 |   await expect(page.getByRole('heading',{name:'Galway Pickleball'})).toBeVisible();
  37 |   await expect(page.getByText('9 on roster')).toBeVisible();
  38 |   await expect(page.getByText('9 registered')).toBeVisible();
  39 |   await expect(page.getByText('Needs saving')).toBeVisible();
  40 | 
  41 |   const categorySelect=page.getByRole('combobox').first();
  42 |   await categorySelect.click();await page.getByRole('option',{name:'Improver'}).click();
  43 |   const move2=page.getByTestId('team-manager-drag-galway-2');
  44 |   await move2.focus();await move2.press('Space');await move2.press('ArrowUp');await move2.press('Space');
  45 |   await page.getByRole('button',{name:'Save Team'}).click();
  46 |   await expect(page.getByText(/Saved 9 players/)).toBeVisible();
  47 |   expect(model.saves).toHaveLength(1);
  48 |   expect(model.saves[0].expectedSavedAt).toBeNull();
  49 |   expect(model.saves[0].orderedParticipantIds.slice(0,2)).toEqual(['galway-2','galway-1']);
  50 |   expect(model.saves[0].players.find(p=>p.id==='galway-1')?.playingCategory).toBe('improver');
  51 | 
  52 |   model.players.push(player(10));
  53 |   model.savedAt=null;
  54 |   await page.getByRole('button',{name:'Refresh roster'}).click();
  55 |   await expect(page.getByText('10 on roster')).toBeVisible();
  56 |   await expect(page.getByText('Needs saving')).toBeVisible();
  57 |   await expect(page.getByText('Galway Player 10')).toBeVisible();
  58 |   const save=page.getByRole('button',{name:'Save Team'});
  59 |   await expect(save).toBeEnabled();
  60 |   await save.click();
> 61 |   await expect(page.getByText(/Saved 10 players/)).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  62 |   expect(model.saves).toHaveLength(2);
  63 |   expect(model.saves[1].orderedParticipantIds).toHaveLength(10);
  64 | });
```