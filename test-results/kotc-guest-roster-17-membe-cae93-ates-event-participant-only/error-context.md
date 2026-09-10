# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-guest-roster.spec.mjs >> 17 members + 1 one-off guest creates event participant only
- Location: e2e/kotc-guest-roster.spec.mjs:8:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('18 players · 4 active courts · 2 bench')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('18 players · 4 active courts · 2 bench') with timeout 3000ms
  - waiting for getByText('18 players · 4 active courts · 2 bench')

```

```yaml
- main:
  - img
  - paragraph: King of the Court
  - heading "Set up tonight’s session" [level=2]
  - paragraph: Confirm the hall settings, decide the Round 1 draw and choose the bench. You can review the actual courts before anything starts.
  - text: 18 players 4 courts 2 bench
  - img
  - paragraph: 1 · Session settings
  - paragraph: The essentials for this hall and tonight’s scoring.
  - text: Venue courts
  - spinbutton: "4"
  - text: Hall / session duration
  - spinbutton: "90"
  - text: min Scoring
  - combobox: Timed rounds
  - text: Round duration
  - spinbutton: "8"
  - text: min
  - img
  - paragraph: 2 · Round 1 setup
  - paragraph: Choose how the starting order is built and how that order is distributed across courts.
  - text: Starting order
  - combobox: Roster order
  - paragraph: This sets the starting order only. RallyHub does not invent ratings.
  - text: Round 1 draw
  - combobox: Balanced Random
  - paragraph: Balanced Random spreads the starting order across courts while keeping some variety.
  - button "Review player order (18) Show"
  - img
  - paragraph: 3 · Choose Round 1 bench
  - paragraph: Choose exactly 2. You can still swap the proposed Round 1 courts before starting.
  - text: 0/2
  - button "Member 01"
  - button "Member 02"
  - button "Member 03"
  - button "Member 04"
  - button "Member 05"
  - button "Member 06"
  - button "Member 07"
  - button "Member 08"
  - button "Member 09"
  - button "Member 10"
  - button "Member 11"
  - button "Member 12"
  - button "Member 13"
  - button "Member 14"
  - button "Member 15"
  - button "Member 16"
  - button "Member 17"
  - button "Guest One"
  - complementary:
    - paragraph: Ready check
    - heading "Create Round 1" [level=3]
    - paragraph: RallyHub will generate the proposed courts next. You will review them before the timer starts.
    - text: Players
    - strong: "18"
    - text: Active courts
    - strong: "4"
    - text: Bench
    - strong: "2"
    - text: Scoring
    - strong: 8 min timed rounds
    - text: Starting order
    - strong: Roster order
    - text: Draw
    - strong: Balanced Random
    - paragraph: Choose 2 more bench players
    - button "Create Round 1" [disabled]:
      - img
      - text: Create Round 1
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  4  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  5  | 
  6  | test.use({viewport:{width:390,height:844}});
  7  | 
  8  | test('17 members + 1 one-off guest creates event participant only',async({page})=>{
  9  |   const model={session:null,participants:[],rounds:[],slots:[],matches:[],createBody:null,playerWrites:0};
  10 |   await page.route('**/api/apps/**',async route=>{
  11 |     const req=route.request();const url=new URL(req.url());const path=url.pathname;
  12 |     if(path.includes('/entities/Player')&&req.method()!=='GET'){model.playerWrites++;return json(route,{})}
  13 |     if(path.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
  14 |     const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
  15 |     if(idx>=0){
  16 |       const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{}}catch{}
  17 |       if(name==='getKotcV2State')return json(route,{session:model.session,participants:model.participants,rounds:model.rounds,slots:model.slots,matches:model.matches,fixedPairs:[],contactDirectory:{},currentAccessRole:'admin',isAdmin:true});
  18 |       if(name==='createKotcV2Session'){
  19 |         model.createBody=body;
  20 |         const order=body.playerOrder||[];const bench=new Set(body.round1BenchIds||[]);const active=order.filter(id=>!bench.has(id));
  21 |         model.session={id:'guest-session',name:'17 Members + 1 Guest',status:'ready',current_round_number:1,current_round_id:'round-1',revision:0,play_minutes:8,scoring_mode:'timed',venue_court_limit:4,available_court_limit:4};
  22 |         model.participants=order.map((id,i)=>id==='guest-e2e'?{id:'participant-guest',session_id:model.session.id,display_name:'Guest One',participant_type:'guest',source_type:'guest',status:'present',seed_rank:i+1}:{id:`participant-${id}`,session_id:model.session.id,player_id:id,display_name:id.replace('member-','Member '),participant_type:'member',source_type:'member',status:'present',seed_rank:i+1});
  23 |         const byRoster=Object.fromEntries(model.participants.map((p,i)=>[order[i],p.id]));
  24 |         model.rounds=[{id:'round-1',session_id:model.session.id,round_number:1,status:'proposed',proposal_revision:1,active_court_count:4,bench_count:2}];
  25 |         for(let court=1;court<=4;court++){
  26 |           const ids=active.slice((court-1)*4,court*4).map(id=>byRoster[id]);
  27 |           for(let i=0;i<4;i++)model.slots.push({id:`r1-c${court}-${i}`,session_id:model.session.id,round_id:'round-1',round_number:1,ladder_court_rank:court,team_side:i<2?'A':'B',slot_number:(i%2)+1,participant_id:ids[i]});
  28 |           model.matches.push({id:`match-${court}`,session_id:model.session.id,round_id:'round-1',round_number:1,ladder_court_rank:court,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:'scheduled',revision:0});
  29 |         }
  30 |         return json(route,{success:true,session:model.session});
  31 |       }
  32 |       return json(route,{success:true});
  33 |     }
  34 |     return json(route,[]);
  35 |   });
  36 | 
  37 |   await page.goto('/e2e/kotcGuestHarness.html');
> 38 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  39 |   await expect(page.getByRole('button',{name:'Guest One',exact:true})).toBeVisible();
  40 |   await page.getByRole('button',{name:'Member 16',exact:true}).click();
  41 |   await page.getByRole('button',{name:'Member 17',exact:true}).click();
  42 |   await page.getByTestId('kotc-create-session').click();
  43 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});
  44 | 
  45 |   expect(model.createBody.playerOrder).toContain('guest-e2e');
  46 |   const guest=model.participants.find(p=>p.participant_type==='guest');
  47 |   expect(guest).toBeTruthy();
  48 |   expect(guest.player_id).toBeUndefined();
  49 |   expect(model.playerWrites).toBe(0);
  50 | });
  51 | 
```