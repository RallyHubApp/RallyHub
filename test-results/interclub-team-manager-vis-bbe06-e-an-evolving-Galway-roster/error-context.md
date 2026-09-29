# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interclub-team-manager.spec.mjs >> visiting team manager can repeatedly rank, grade and save an evolving Galway roster
- Location: e2e/interclub-team-manager.spec.mjs:11:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Array [
-   "galway-2",
    "galway-1",
+   "galway-2",
  ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - button "Current appearance Auto. Change appearance." [ref=e4] [cursor=pointer]
    - generic [ref=e5]:
      - banner [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]:
            - img "RallyHub" [ref=e9]
            - generic [ref=e10]:
              - generic [ref=e11]: RallyHub
              - generic [ref=e12]: RallyHub Interclub
          - paragraph [ref=e13]: Team Manager
          - generic [ref=e14]:
            - generic [ref=e15]: Clare Pickleball
            - generic [ref=e17]: Galway Pickleball
        - heading "Galway Pickleball" [level=1] [ref=e19]
        - paragraph [ref=e20]: Clare Pickleball v Galway Pickleball
        - generic [ref=e21]:
          - generic [ref=e22]: Sun 4 Oct 2026
          - generic [ref=e23]: St. Joseph’s Doora Barefield
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - heading "Current team" [level=2] [ref=e27]
            - paragraph [ref=e28]: Drag players into the correct ranking, set Social or Improver, choose Rotation or Reserve, then save. You can reopen this link and edit again when more players register or the team changes.
          - button "Refresh roster" [ref=e29] [cursor=pointer]
        - generic [ref=e30]:
          - generic [ref=e31]: 9 on roster
          - generic [ref=e32]: 9 registered
          - generic [ref=e33]: 9 rotation
          - generic [ref=e34]: 0 reserve
          - generic [ref=e35]: Saved 29 Sept, 15:46
      - generic [ref=e36]: Saved 9 players. You can come back and edit this team again whenever the roster changes.
      - generic [ref=e37]:
        - generic [ref=e39]:
          - button "Move Galway Player 01" [ref=e40] [cursor=pointer]
          - generic [ref=e48]: "1"
          - generic [ref=e49]:
            - paragraph [ref=e50]: Galway Player 01
            - generic [ref=e51]:
              - generic [ref=e52]: Female
              - generic [ref=e53]: Registered ✓
          - combobox [ref=e55] [cursor=pointer]:
            - generic: Improver
          - combobox [ref=e59] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e63]:
          - button "Move Galway Player 02" [ref=e64] [cursor=pointer]
          - generic [ref=e72]: "2"
          - generic [ref=e73]:
            - paragraph [ref=e74]: Galway Player 02
            - generic [ref=e75]:
              - generic [ref=e76]: Male
              - generic [ref=e77]: Registered ✓
          - combobox [ref=e79] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e83] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e87]:
          - button "Move Galway Player 03" [ref=e88] [cursor=pointer]
          - generic [ref=e96]: "3"
          - generic [ref=e97]:
            - paragraph [ref=e98]: Galway Player 03
            - generic [ref=e99]:
              - generic [ref=e100]: Female
              - generic [ref=e101]: Registered ✓
          - combobox [ref=e103] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e107] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e111]:
          - button "Move Galway Player 04" [ref=e112] [cursor=pointer]
          - generic [ref=e120]: "4"
          - generic [ref=e121]:
            - paragraph [ref=e122]: Galway Player 04
            - generic [ref=e123]:
              - generic [ref=e124]: Male
              - generic [ref=e125]: Registered ✓
          - combobox [ref=e127] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e131] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e135]:
          - button "Move Galway Player 05" [ref=e136] [cursor=pointer]
          - generic [ref=e144]: "5"
          - generic [ref=e145]:
            - paragraph [ref=e146]: Galway Player 05
            - generic [ref=e147]:
              - generic [ref=e148]: Female
              - generic [ref=e149]: Registered ✓
          - combobox [ref=e151] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e155] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e159]:
          - button "Move Galway Player 06" [ref=e160] [cursor=pointer]
          - generic [ref=e168]: "6"
          - generic [ref=e169]:
            - paragraph [ref=e170]: Galway Player 06
            - generic [ref=e171]:
              - generic [ref=e172]: Male
              - generic [ref=e173]: Registered ✓
          - combobox [ref=e175] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e179] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e183]:
          - button "Move Galway Player 07" [ref=e184] [cursor=pointer]
          - generic [ref=e192]: "7"
          - generic [ref=e193]:
            - paragraph [ref=e194]: Galway Player 07
            - generic [ref=e195]:
              - generic [ref=e196]: Female
              - generic [ref=e197]: Registered ✓
          - combobox [ref=e199] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e203] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e207]:
          - button "Move Galway Player 08" [ref=e208] [cursor=pointer]
          - generic [ref=e216]: "8"
          - generic [ref=e217]:
            - paragraph [ref=e218]: Galway Player 08
            - generic [ref=e219]:
              - generic [ref=e220]: Male
              - generic [ref=e221]: Registered ✓
          - combobox [ref=e223] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e227] [cursor=pointer]:
            - generic: Rotation
        - generic [ref=e231]:
          - button "Move Galway Player 09" [ref=e232] [cursor=pointer]
          - generic [ref=e240]: "9"
          - generic [ref=e241]:
            - paragraph [ref=e242]: Galway Player 09
            - generic [ref=e243]:
              - generic [ref=e244]: Female
              - generic [ref=e245]: Registered ✓
          - combobox [ref=e247] [cursor=pointer]:
            - generic: Level not set
          - combobox [ref=e251] [cursor=pointer]:
            - generic: Rotation
      - generic [ref=e254]:
        - generic [ref=e255]: Current team saved
        - button "Save Team" [disabled]
      - paragraph [ref=e260]: This link only manages this team for this Interclub event. It does not give access to the host club or other RallyHub areas.
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
  43 |   const move2=page.getByRole('button',{name:'Move Galway Player 02'});
  44 |   await move2.focus();await move2.press('Space');await move2.press('ArrowUp');await move2.press('Space');
  45 |   await page.getByRole('button',{name:'Save Team'}).click();
  46 |   await expect(page.getByText(/Saved 9 players/)).toBeVisible();
  47 |   expect(model.saves).toHaveLength(1);
> 48 |   expect(model.saves[0].orderedParticipantIds.slice(0,2)).toEqual(['galway-2','galway-1']);
     |                                                           ^ Error: expect(received).toEqual(expected) // deep equality
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