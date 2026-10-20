# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-sandbox.spec.mjs >> 18-player isolated sandbox creates, starts, fills and advances without real-member tools
- Location: e2e/kotc-sandbox.spec.mjs:68:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByText('Session Links & Access')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 2 — ROUND READY
        - paragraph [ref=e8]: 4 courts · 2 bench
      - generic [ref=e9]:
        - button "Roster" [ref=e10] [cursor=pointer]
        - button "Leaderboard" [ref=e11] [cursor=pointer]
        - button "Links" [active] [ref=e12] [cursor=pointer]
        - button "Menu" [ref=e13] [cursor=pointer]
    - generic [ref=e14]:
      - paragraph [ref=e15]: What happens next
      - paragraph [ref=e16]: Round 2 ready
      - paragraph [ref=e17]: "Next: check the 4 court assignments and bench, then Start Round 2."
    - generic [ref=e18]:
      - paragraph [ref=e19]: ROUND 2 HAS NOT STARTED
      - paragraph [ref=e20]: Call the court assignments below, make any host changes, then press START ROUND. The timer is not running and score entry is hidden until you start.
    - generic [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Bench This Round
        - generic [ref=e24]:
          - button "Test Player 01" [ref=e25] [cursor=pointer]
          - button "Test Player 18" [ref=e26] [cursor=pointer]
        - paragraph [ref=e27]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e28]:
        - generic [ref=e29]:
          - heading "Host Round Editor" [level=4] [ref=e30]
          - paragraph [ref=e31]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Court 1
              - button "Move whole Court 1" [ref=e39]: Move court
            - generic [ref=e47]:
              - generic [ref=e48]:
                - paragraph [ref=e49]: Team A
                - button "Lock pair" [ref=e50] [cursor=pointer]
              - generic [ref=e51]:
                - button "Test Player 02" [ref=e52] [cursor=pointer]
                - button "Test Player 03" [ref=e61] [cursor=pointer]
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Team B
                - button "Lock pair" [ref=e73] [cursor=pointer]
              - generic [ref=e74]:
                - button "Test Player 04" [ref=e75] [cursor=pointer]
                - button "Test Player 05" [ref=e84] [cursor=pointer]
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e95]: Court 2
              - button "Move whole Court 2" [ref=e97]: Move court
            - generic [ref=e105]:
              - generic [ref=e106]:
                - paragraph [ref=e107]: Team A
                - button "Lock pair" [ref=e108] [cursor=pointer]
              - generic [ref=e109]:
                - button "Test Player 06" [ref=e110] [cursor=pointer]
                - button "Test Player 07" [ref=e119] [cursor=pointer]
            - generic [ref=e128]:
              - generic [ref=e129]:
                - paragraph [ref=e130]: Team B
                - button "Lock pair" [ref=e131] [cursor=pointer]
              - generic [ref=e132]:
                - button "Test Player 08" [ref=e133] [cursor=pointer]
                - button "Test Player 09" [ref=e142] [cursor=pointer]
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]: Court 3
              - button "Move whole Court 3" [ref=e155]: Move court
            - generic [ref=e163]:
              - generic [ref=e164]:
                - paragraph [ref=e165]: Team A
                - button "Lock pair" [ref=e166] [cursor=pointer]
              - generic [ref=e167]:
                - button "Test Player 10" [ref=e168] [cursor=pointer]
                - button "Test Player 11" [ref=e177] [cursor=pointer]
            - generic [ref=e186]:
              - generic [ref=e187]:
                - paragraph [ref=e188]: Team B
                - button "Lock pair" [ref=e189] [cursor=pointer]
              - generic [ref=e190]:
                - button "Test Player 12" [ref=e191] [cursor=pointer]
                - button "Test Player 13" [ref=e200] [cursor=pointer]
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]: Court 4
              - button "Move whole Court 4" [ref=e213]: Move court
            - generic [ref=e221]:
              - generic [ref=e222]:
                - paragraph [ref=e223]: Team A
                - button "Lock pair" [ref=e224] [cursor=pointer]
              - generic [ref=e225]:
                - button "Test Player 14" [ref=e226] [cursor=pointer]
                - button "Test Player 15" [ref=e235] [cursor=pointer]
            - generic [ref=e244]:
              - generic [ref=e245]:
                - paragraph [ref=e246]: Team B
                - button "Lock pair" [ref=e247] [cursor=pointer]
              - generic [ref=e248]:
                - button "Test Player 16" [ref=e249] [cursor=pointer]
                - button "Test Player 17" [ref=e258] [cursor=pointer]
        - generic [ref=e267]:
          - generic [ref=e268]:
            - paragraph [ref=e269]: Round setup is saved
            - paragraph [ref=e270]: You can leave this screen and return without losing the court layout.
          - button "Saved ✓" [disabled]
      - generic [ref=e271]:
        - generic [ref=e272]:
          - paragraph [ref=e273]: Pre-Round Check
          - paragraph [ref=e274]: Confirm the round time and hall sound before players begin.
        - generic [ref=e275]:
          - generic [ref=e276]:
            - generic [ref=e281]:
              - paragraph [ref=e282]: Round timer
              - paragraph [ref=e283]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e284]: 08:00
          - generic [ref=e285]:
            - button "− 1 min" [ref=e286] [cursor=pointer]
            - button "+ 1 min" [ref=e287] [cursor=pointer]
        - generic [ref=e289]:
          - generic [ref=e290]:
            - paragraph [ref=e291]: Audio & announcements check
            - paragraph [ref=e292]: "Current KOTC announcement: “5, 4, 3, 2, 1. Hand in your scores.” No other automatic round warnings."
          - button "Test Full Announcement" [ref=e293] [cursor=pointer]
        - button "START ROUND 2" [ref=e294] [cursor=pointer]
      - button "Restore Original Draw (undo unsaved edits)" [ref=e295] [cursor=pointer]
    - generic [ref=e296]:
      - generic [ref=e297]:
        - generic [ref=e298]:
          - paragraph [ref=e299]: Session tools
          - paragraph [ref=e300]: Use these only when something changes during play.
        - generic [ref=e301]:
          - button "Round History" [ref=e302] [cursor=pointer]
          - button "Roster" [ref=e303] [cursor=pointer]
          - button "Timer" [ref=e304] [cursor=pointer]
          - button "Contacts" [ref=e305] [cursor=pointer]
      - generic [ref=e306]:
        - generic [ref=e307]:
          - paragraph [ref=e308]: Sharing & access
          - paragraph [ref=e309]: Live view, player scoring and delegated host access all stay session-specific.
        - button [ref=e311] [cursor=pointer]:
          - generic [ref=e316]:
            - paragraph [ref=e317]: Player Link, Broadcasts & Access
            - paragraph [ref=e318]: One KOTC Player Link evolves from sign-up through live rounds, scoring and final results.
      - generic [ref=e321]:
        - generic [ref=e322]:
          - paragraph [ref=e323]: Session control
          - paragraph [ref=e324]: Pause if play stops. Finish only when tonight’s session is over.
        - generic [ref=e325]:
          - button "Pause Session" [ref=e326] [cursor=pointer]
          - button "Finish Session" [ref=e327] [cursor=pointer]
        - group [ref=e328]:
          - generic "Emergency / cancel session" [ref=e329] [cursor=pointer]
  - generic [ref=e330]:
    - button "Scroll up" [ref=e331] [cursor=pointer]
    - button "Scroll down" [disabled]
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
  64 |   expect(share).toContain("emailBodies(editableBody,p.display_name");
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
  78 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
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
> 91 |   await page.getByText('Session Links & Access').click();
     |                                                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  92 |   await expect(page.getByRole('button',{name:'Copy Live Link'})).toBeVisible();
  93 |   await expect(page.getByRole('button',{name:'Copy Player Scoring Link'})).toBeVisible();
  94 |   await expect(page.getByRole('button',{name:'Copy Host Link'})).toBeVisible();
  95 |   await expect(page.getByRole('button',{name:'Grant Host Access'})).toBeVisible();
  96 |   expect(errors).toEqual([]);
  97 | });
  98 | 
```