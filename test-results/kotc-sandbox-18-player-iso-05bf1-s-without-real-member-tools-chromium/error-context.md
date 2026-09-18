# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-sandbox.spec.mjs >> 18-player isolated sandbox creates, starts, fills and advances without real-member tools
- Location: e2e/kotc-sandbox.spec.mjs:68:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('kotc-round-editor')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('kotc-round-editor') with timeout 3000ms
  - waiting for getByTestId('kotc-round-editor')

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
  - checkbox "Counts toward club leaderboard Turn this on only for an official club competition. Test mode is always excluded." [disabled]
  - text: Counts toward club leaderboard Turn this on only for an official club competition. Test mode is always excluded.
  - img
  - paragraph: 2 · Round 1 setup
  - paragraph: Choose how the starting order is built and how that order is distributed across courts.
  - text: Starting order
  - combobox: Roster order
  - paragraph: Dummy guests use roster order or a manual test order only.
  - text: Round 1 draw
  - combobox: Balanced Random
  - paragraph: Balanced Random spreads the starting order across courts while keeping some variety.
  - button "Review player order (18) Show"
  - img
  - paragraph: 3 · Choose Round 1 bench
  - paragraph: Choose exactly 2. You can still swap the proposed Round 1 courts before starting.
  - text: 2/2
  - button "Test Player 01"
  - button "Test Player 02"
  - button "Test Player 03"
  - button "Test Player 04"
  - button "Test Player 05"
  - button "Test Player 06"
  - button "Test Player 07"
  - button "Test Player 08"
  - button "Test Player 09"
  - button "Test Player 10"
  - button "Test Player 11"
  - button "Test Player 12"
  - button "Test Player 13"
  - button "Test Player 14"
  - button "Test Player 15"
  - button "Test Player 16"
  - button "Test Player 17 ✓" [pressed]
  - button "Test Player 18 ✓" [pressed]
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
    - img
    - paragraph: Ready to create the draw
    - paragraph: Nothing starts until you review Round 1 and press Start Round 1.
    - button "Create Round 1":
      - img
      - text: Create Round 1
  - button "Scroll up":
    - img
  - button "Scroll down" [disabled]:
    - img
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | 
  4  | const APP_ID='6a01dc00702b7dd2a2978c28';
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | function makeModel(){
  8  |   const participants=Array.from({length:18},(_,i)=>({id:`participant-${i+1}`,display_name:`Test Player ${String(i+1).padStart(2,'0')}`,participant_type:'guest',source_type:'guest',status:'present',seed_rank:i+1,rounds_played:0,fairness_benches:0,consecutive_rounds_played:0,consecutive_court1_rounds:0,court1_rounds:0}));
  9  |   const model={session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[],calls:[]};
  10 |   const makeRound=(n)=>{
  11 |     const round={id:`round-${n}`,session_id:'sandbox-session',round_number:n,status:'proposed',proposal_revision:1,active_court_count:4,bench_count:2};
  12 |     const active=participants.slice((n-1)%2,16+(n-1)%2).map(p=>p.id).slice(0,16);
  13 |     const slots=[];const matches=[];
  14 |     for(let court=1;court<=4;court++){
  15 |       const four=active.slice((court-1)*4,court*4);
  16 |       const defs=[['A',1,four[0]],['A',2,four[1]],['B',1,four[2]],['B',2,four[3]]];
  17 |       for(const [side,slot,pid] of defs)slots.push({id:`r${n}-c${court}-${side}-${slot}`,session_id:'sandbox-session',round_id:round.id,round_number:n,ladder_court_rank:court,team_side:side,slot_number:slot,participant_id:pid,assignment_type:n===1?'initial_seed':'sporting_movement',assignment_revision:1});
  18 |       matches.push({id:`match-r${n}-c${court}`,session_id:'sandbox-session',round_id:round.id,round_number:n,ladder_court_rank:court,team_a_participant_ids:four.slice(0,2),team_b_participant_ids:four.slice(2),status:'scheduled',revision:0,correction_count:0});
  19 |     }
  20 |     return {round,slots,matches};
  21 |   };
  22 |   model.create=()=>{const {round,slots,matches}=makeRound(1);model.session={id:'sandbox-session',tournament_id:'sandbox-tournament',tenant_id:'tenant-test',club_id:'club-test',name:'KOTC Test Sandbox',status:'ready',current_round_number:1,current_round_id:round.id,revision:0,play_minutes:8,scoring_mode:'timed',demo_mode:true,exclude_from_aggregates:true};model.participants=participants;model.rounds=[round];model.slots=slots;model.matches=matches;};
  23 |   model.start=()=>{model.session={...model.session,status:'in_progress',revision:model.session.revision+1,actual_first_round_start:new Date().toISOString()};model.rounds=model.rounds.map(r=>r.id===model.session.current_round_id?{...r,status:'started',started_at:new Date().toISOString()}:r);return model.rounds.find(r=>r.id===model.session.current_round_id);};
  24 |   model.fill=()=>{const round=model.rounds.find(r=>r.id===model.session.current_round_id);model.matches=model.matches.map(m=>m.round_id!==round.id||m.status==='completed'?m:{...m,status:'completed',team_a_score:(round.round_number+m.ladder_court_rank)%2===0?11:7,team_b_score:(round.round_number+m.ladder_court_rank)%2===0?7:11,winner_side:(round.round_number+m.ladder_court_rank)%2===0?'A':'B',revision:m.revision+1,completed_at:new Date().toISOString()});return model.matches.filter(m=>m.round_id===round.id);};
  25 |   model.prepare=()=>{const current=model.rounds.find(r=>r.id===model.session.current_round_id);model.rounds=model.rounds.map(r=>r.id===current.id?{...r,status:'completed',completed_at:new Date().toISOString()}:r);const {round,slots,matches}=makeRound(current.round_number+1);model.rounds.push(round);model.slots.push(...slots);model.matches.push(...matches);model.session={...model.session,current_round_number:round.round_number,current_round_id:round.id,revision:model.session.revision+1};return {round,slots,matches};};
  26 |   model.state=()=>({session:model.session,participants:model.participants,rounds:model.rounds,slots:model.slots,matches:model.matches,fixedPairs:model.fixedPairs,currentAccessRole:'admin',isAdmin:true});
  27 |   return model;
  28 | }
  29 | 
  30 | async function mock(page,model){
  31 |   await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  32 |   await page.route(`**/api/apps/${APP_ID}/entities/KotcPlayerAggregate**`,route=>json(route,[]));
  33 |   await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
  34 |     const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';
  35 |     let body={};try{body=route.request().postDataJSON()||{};}catch{}model.calls.push({name,body});
  36 |     if(name==='getKotcV2State')return json(route,model.state());
  37 |     if(name==='createKotcV2Session'){model.create();return json(route,{success:true});}
  38 |     if(name==='startKotcRound'){const round=model.start();return json(route,{success:true,session:model.session,round,slots:model.slots.filter(s=>s.round_id===round.id),matches:model.matches.filter(m=>m.round_id===round.id)});}
  39 |     if(name==='manageKotcTestSandbox'&&body.action==='fill_current_round_scores'){const matches=model.fill();return json(route,{success:true,roundNumber:model.session.current_round_number,filled:matches.length,matches});}
  40 |     if(name==='prepareKotcNextRound'){const x=model.prepare();return json(route,{success:true,session:model.session,round:x.round,slots:x.slots,matches:x.matches,participants:model.participants});}
  41 |     if(name==='manageKotcSessionAccess')return json(route,{success:true,grants:[]});
  42 |     if(name==='kotcResultsShare')return json(route,{success:true,token:'sandbox-live-token'});
  43 |     if(name==='manageKotcScorerLinks')return json(route,{success:true,token:'sandbox-scorer-token'});
  44 |     if(name==='kotcTimer')return json(route,{success:true});
  45 |     return json(route,{success:true});
  46 |   });
  47 | }
  48 | 
  49 | test('sandbox safety guards are hard-coded server-side',async()=>{
  50 |   const manage=fs.readFileSync('base44/functions/manageKotcTestSandbox/entry.ts','utf8');
  51 |   const create=fs.readFileSync('base44/functions/createKotcV2Session/entry.ts','utf8');
  52 |   const share=fs.readFileSync('base44/functions/kotcResultsShare/entry.ts','utf8');
  53 |   const aggregate=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
  54 |   expect(manage).toContain("Array.from({length:18}");
  55 |   expect(manage).toContain("session.demo_mode!==true||session.exclude_from_aggregates!==true");
  56 |   expect(manage).toContain("participants.some((p:any)=>!!p.player_id||p.participant_type!=='guest')");
  57 |   expect(create).toContain("member Player records are forbidden");
  58 |   expect(create).toContain("const testMode=sandboxTournament||");
  59 |   expect(share).toContain("RALLYHUB_KOTC_SANDBOX_V1");
  60 |   expect(share).toContain("Email Players is disabled for the KOTC Test Sandbox.");
  61 |   expect(share).toContain("personaliseEditableBody");
  62 |   expect(share).toContain("body.subject??sample.subject");
  63 |   expect(share).toContain("body.messageBody??sample.body");
  64 |   expect(share).toContain("personaliseEditableBody(editableBody,p.display_name");
  65 |   expect(aggregate).toContain("s.exclude_from_aggregates!==true");
  66 | });
  67 | 
  68 | test('18-player isolated sandbox creates, starts, fills and advances without real-member tools',async({page})=>{
  69 |   const model=makeModel();const errors=[];page.on('pageerror',e=>errors.push(e.message));await mock(page,model);
  70 |   await page.goto('/e2e/kotcSandboxHarness.html');
  71 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  72 |   await expect(page.getByText('18 players').first()).toBeVisible();
  73 |   await expect(page.getByText('Previous KOTC performance')).toHaveCount(0);
  74 |   await expect(page.getByText('Genuine DUPR')).toHaveCount(0);
  75 |   await page.getByRole('button',{name:'Test Player 17'}).click();
  76 |   await page.getByRole('button',{name:'Test Player 18'}).click();
  77 |   await page.getByTestId('kotc-create-session').click();
> 78 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  79 |   expect(model.session.demo_mode).toBe(true);expect(model.session.exclude_from_aggregates).toBe(true);
  80 |   expect(model.participants).toHaveLength(18);expect(model.participants.every(p=>p.participant_type==='guest'&&!p.player_id)).toBe(true);
  81 |   await page.getByTestId('kotc-start-round').click();
  82 |   await expect(page.getByText(/Round 1 live/i)).toBeVisible();
  83 |   await expect(page.getByTestId('kotc-fill-save-sandbox-round')).toBeVisible();
  84 |   await page.getByTestId('kotc-fill-save-sandbox-round').click();
  85 |   await expect(page.getByText('✓ All scores saved for Round 1')).toBeVisible();
  86 |   expect(model.matches.filter(m=>m.round_number===1).every(m=>m.status==='completed')).toBe(true);
  87 |   await page.getByTestId('kotc-prepare-next-round').click();
  88 |   await expect(page.getByText('Round 2 ready')).toBeVisible();
  89 |   expect(model.session.current_round_number).toBe(2);
  90 |   await page.getByTestId('kotc-quick-links').click();
  91 |   await page.getByText('Session Links & Access').click();
  92 |   await expect(page.getByRole('button',{name:'Copy Live Link'})).toBeVisible();
  93 |   await expect(page.getByRole('button',{name:'Copy Player Scoring Link'})).toBeVisible();
  94 |   await expect(page.getByRole('button',{name:'Copy Host Link'})).toBeVisible();
  95 |   await expect(page.getByRole('button',{name:'Grant Host Access'})).toBeVisible();
  96 |   expect(errors).toEqual([]);
  97 | });
  98 | 
```