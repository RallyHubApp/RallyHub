# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-two-scorers-sync.spec.mjs >> same-millisecond host/helper first digits leave exactly one court owner
- Location: e2e/kotc-host-two-scorers-sync.spec.mjs:203:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Collaborative Score E2E')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Collaborative Score E2E') with timeout 3000ms
  - waiting for getByText('Collaborative Score E2E')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 0/4 scores saved
      - generic [ref=e9]:
        - button "Roster" [ref=e10] [cursor=pointer]
        - button "Links" [ref=e11] [cursor=pointer]
        - button "Menu" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - paragraph [ref=e14]: What happens next
      - paragraph [ref=e15]: Round 1 live · 0/4 scores saved
      - paragraph [ref=e16]: "Next: collect Court 1, Court 2, Court 3, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - paragraph [ref=e20]: Play Time
          - paragraph [ref=e21]: 8 min round timer
        - generic [ref=e22]:
          - button "Test speaker and spoken announcement" [ref=e23] [cursor=pointer]
          - button "Float and move timer" [ref=e24] [cursor=pointer]
          - button "Full screen timer" [ref=e25] [cursor=pointer]
      - generic [ref=e26]: 06:55
      - paragraph [ref=e30]: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
      - generic [ref=e31]:
        - button "Pause Timer" [ref=e32] [cursor=pointer]
        - button "Reset" [ref=e33] [cursor=pointer]
      - paragraph [ref=e34]: Tap the speaker once before play to enable sound. The timer itself starts automatically when the sporting round starts.
    - paragraph [ref=e35]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "Undo Start / Back to Round Setup" [ref=e36] [cursor=pointer]
    - generic [ref=e37]:
      - paragraph [ref=e38]: Bench This Round
      - paragraph [ref=e39]: Player 17 · Player 18
    - generic [ref=e41]:
      - generic [ref=e42]:
        - paragraph [ref=e43]: Player Scores
        - paragraph [ref=e44]: 0/4 saved
        - paragraph [ref=e45]: When the courts give the thumbs-up, refresh once to pull in their latest scores.
      - button "Refresh Player Scores" [ref=e47] [cursor=pointer]
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: Court 1
          - generic [ref=e55]: LIVE
        - generic [ref=e56]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Team A
            - paragraph [ref=e59]: Player 01 & Player 02
          - textbox [ref=e60]
        - generic [ref=e61]:
          - generic [ref=e62]:
            - paragraph [ref=e63]: Team B
            - paragraph [ref=e64]: Player 03 & Player 04
          - textbox [ref=e65]
        - generic [ref=e66]: Start typing in either score box to claim this court as host.
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]: Court 2
          - generic [ref=e71]: LIVE
        - generic [ref=e72]:
          - generic [ref=e73]:
            - paragraph [ref=e74]: Team A
            - paragraph [ref=e75]: Player 05 & Player 06
          - textbox [ref=e76]
        - generic [ref=e77]:
          - generic [ref=e78]:
            - paragraph [ref=e79]: Team B
            - paragraph [ref=e80]: Player 07 & Player 08
          - textbox [ref=e81]
        - generic [ref=e82]: Start typing in either score box to claim this court as host.
      - generic [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]: Court 3
          - generic [ref=e87]: LIVE
        - generic [ref=e88]:
          - generic [ref=e89]:
            - paragraph [ref=e90]: Team A
            - paragraph [ref=e91]: Player 09 & Player 10
          - textbox [ref=e92]
        - generic [ref=e93]:
          - generic [ref=e94]:
            - paragraph [ref=e95]: Team B
            - paragraph [ref=e96]: Player 11 & Player 12
          - textbox [ref=e97]
        - generic [ref=e98]: Start typing in either score box to claim this court as host.
      - generic [ref=e99]:
        - generic [ref=e100]:
          - generic [ref=e101]: Court 4
          - generic [ref=e103]: LIVE
        - generic [ref=e104]:
          - generic [ref=e105]:
            - paragraph [ref=e106]: Team A
            - paragraph [ref=e107]: Player 13 & Player 14
          - textbox [ref=e108]
        - generic [ref=e109]:
          - generic [ref=e110]:
            - paragraph [ref=e111]: Team B
            - paragraph [ref=e112]: Player 15 & Player 16
          - textbox [ref=e113]
        - generic [ref=e114]: Start typing in either score box to claim this court as host.
    - generic [ref=e115]:
      - generic [ref=e116]:
        - paragraph [ref=e117]: Round 1 · 0/4 scores showing on this device
        - paragraph [ref=e118]: If players used the court scoring link, press the button below. RallyHub will check the latest saved court scores before advancing.
      - button "Check Scores & Prepare Next Round" [ref=e120] [cursor=pointer]
  - generic [ref=e121]:
    - button "Scroll up" [disabled]
    - button "Scroll down" [ref=e122] [cursor=pointer]
```

# Test source

```ts
  7   | function createModel(){
  8   |   const participants=Array.from({length:18},(_,i)=>({id:`participant-${String(i+1).padStart(2,'0')}`,player_id:`player-${String(i+1).padStart(2,'0')}`,display_name:`Player ${String(i+1).padStart(2,'0')}`,status:'present',seed_rank:i+1}));
  9   |   const slots=[];const matches=[];
  10  |   for(let c=1;c<=4;c++){
  11  |     const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);
  12  |     slots.push(
  13  |       {id:`slot-${c}-a1`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'A',slot_number:1,participant_id:ids[0]},
  14  |       {id:`slot-${c}-a2`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'A',slot_number:2,participant_id:ids[1]},
  15  |       {id:`slot-${c}-b1`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'B',slot_number:1,participant_id:ids[2]},
  16  |       {id:`slot-${c}-b2`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'B',slot_number:2,participant_id:ids[3]},
  17  |     );
  18  |     matches.push({id:`match-${c}`,session_id:'session-live',round_id:'round-1',round_number:1,ladder_court_rank:c,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:'scheduled',revision:0,team_a_score:null,team_b_score:null,scoring_lock_owner:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null});
  19  |   }
  20  |   const model={
  21  |     calls:[],participants,slots,matches,rateLimits:{},
  22  |     round:{id:'round-1',session_id:'session-live',round_number:1,status:'started',proposal_revision:1,active_court_count:4,bench_count:2},
  23  |     session:{id:'session-live',tournament_id:'e2e-kotc-tournament',name:'Collaborative Score E2E',status:'in_progress',current_round_number:1,current_round_id:'round-1',revision:2,play_minutes:8,scoring_mode:'timed',score_target:11,win_by_two:false,timer_state_json:JSON.stringify({roundId:'round-1',roundNumber:1,durationSeconds:480,remainingSeconds:420,running:true,deadlineAt:new Date(Date.now()+420000).toISOString(),lastAction:'start'})},
  24  |   };
  25  |   model.setRateLimit=(source,name,action,count=1)=>{model.rateLimits[`${source}:${name}:${action}`]=count;};
  26  |   const active=m=>!!(m.scoring_lock_owner&&m.scoring_lock_expires_at&&Date.parse(m.scoring_lock_expires_at)>now());
  27  |   const names=Object.fromEntries(participants.map(p=>[p.id,p.display_name]));
  28  |   const currentMatches=()=>model.matches.filter(m=>String(m.round_id)===String(model.session.current_round_id));
  29  |   const liveScorePayload=()=>({liveScoresOnly:true,session:{id:model.session.id,status:model.session.status,current_round_id:model.session.current_round_id,current_round_number:model.session.current_round_number,revision:model.session.revision,timer_state_json:model.session.timer_state_json},matches:currentMatches().map(m=>({id:m.id,status:m.status,team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,serving_side_at_horn:m.serving_side_at_horn,result_method:m.result_method,revision:m.revision,correction_count:0,completed_at:m.completed_at,command_id:m.command_id,scoring_lock_active:active(m),scoring_lock_kind:active(m)?(String(m.scoring_lock_owner).startsWith('host:')?'host':'player'):'none',scoring_lock_expires_at:active(m)?m.scoring_lock_expires_at:null}))});
  30  |   const correctionOpen=(m,clientId)=>m.status==='completed'&&m.scorer_correction_owner_client_id===clientId&&m.completed_at&&Date.now()-Date.parse(m.completed_at)<=90000;
  31  |   const scorerState=clientId=>({success:true,session:{name:model.session.name,status:model.session.status,current_round_number:model.session.current_round_number,scoring_mode:'timed',score_target:11,win_by_two:false},round:{id:model.round.id,round_number:model.round.round_number,status:model.round.status},bench:['Player 17','Player 18'],timer:{running:true,remainingSeconds:420,deadlineAt:new Date(Date.now()+420000).toISOString()},matches:currentMatches().map(m=>({id:m.id,court:m.ladder_court_rank,status:m.status,revision:m.revision,team_a:m.team_a_participant_ids.map(id=>names[id]),team_b:m.team_b_participant_ids.map(id=>names[id]),team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,lock_status:active(m)?(m.scoring_lock_owner===clientId?'mine':'other'):'free',lock_seconds:active(m)?Math.ceil((Date.parse(m.scoring_lock_expires_at)-now())/1000):0,can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((Date.parse(m.completed_at)+90000-Date.now())/1000)):0}))});
  32  |   model.handle=async(source,name,body)=>{
  33  |     model.calls.push({source,name,body:{...body},at:Date.now()});
  34  |     const actionKey=String(body.action||body.commandType||(body.liveScoresOnly?'liveScoresOnly':'state'));const rateKey=`${source}:${name}:${actionKey}`;
  35  |     if(Number(model.rateLimits[rateKey]||0)>0){model.rateLimits[rateKey]-=1;return {status:429,body:{error:'Rate limit exceeded'}};}
  36  |     if(name==='getKotcV2State'){
  37  |       if(body.liveScoresOnly)return liveScorePayload();
  38  |       return {session:model.session,participants:model.participants,rounds:[model.round],slots:model.slots,matches:model.matches,fixedPairs:[],scorerLinkActive:true,contactDirectory:{},currentAccessRole:'admin',isAdmin:true};
  39  |     }
  40  |     if(name==='kotcTimer')return {success:true,state:JSON.parse(model.session.timer_state_json)};
  41  |     if(name==='kotcScorer'){
  42  |       const action=body.action||'state',clientId=body.clientId||'';
  43  |       if(action==='state')return scorerState(clientId);
  44  |       const m=currentMatches().find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Current-round match not found'}};
  45  |       if(action==='claim'){
  46  |         if(m.status==='completed'&&!correctionOpen(m,clientId))return {status:423,body:{error:`Court ${m.ladder_court_rank} is already saved. The scorer correction window has closed; the host can still correct this result.`,saved:true,read_only:true}};
  47  |         const mine=model.matches.find(x=>x.id!==m.id&&x.scoring_lock_owner===clientId&&active(x));if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.ladder_court_rank}. Save or cancel that court first.`,locked:true}};
  48  |         if(active(m)&&m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is being scored on another device.`,locked:true}};
  49  |         await new Promise(r=>setTimeout(r,10));m.scoring_lock_owner=clientId;m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();await new Promise(r=>setTimeout(r,35));
  50  |         if(m.scoring_lock_owner!==clientId||!active(m))return {status:423,body:{error:`Court ${m.ladder_court_rank} was claimed by another scorer.`,locked:true}};
  51  |         return {success:true,claimed:true,lease_seconds:90,expires_at:m.scoring_lock_expires_at};
  52  |       }
  53  |       if(action==='heartbeat'){
  54  |         if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:'Your scoring lock is no longer active.'}};
  55  |         m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();return {success:true};
  56  |       }
  57  |       if(action==='release'){
  58  |         if(m.scoring_lock_owner===clientId){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
  59  |       }
  60  |       if(action==='save'||action==='correct'){
  61  |         if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is not locked to this scorer.`}};
  62  |         if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.'}};
  63  |         const correcting=action==='correct';if(correcting&&!correctionOpen(m,clientId))return {status:423,body:{error:'The 90-second scorer correction window has closed. Ask the host to correct this result.'}};
  64  |         m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;if(!correcting)m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=clientId;
  65  |         return {success:true,message:correcting?'Updated score saved':'Score saved',match:{...m,can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((Date.parse(m.completed_at)+90000-Date.now())/1000)):0,lock_status:'free'}};
  66  |       }
  67  |     }
  68  |     if(name==='kotcCommand'&&body.commandType==='host_claim_score'){
  69  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  70  |       const correction=body.forCorrection===true;
  71  |       if(m.status==='completed'&&!correction)return {status:409,body:{error:`Court ${m.ladder_court_rank} has already been saved. Refresh player scores to load the result before making any correction.`,saved:true,refresh_required:true}};
  72  |       if(m.status!=='completed'&&correction)return {status:409,body:{error:`Court ${m.ladder_court_rank} has not been saved yet.`}};
  73  |       if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:correction?`Court ${m.ladder_court_rank} is already being corrected on another device.`:`Court ${m.ladder_court_rank} is already being entered by a player. Wait for them to save or cancel, then refresh player scores.`,locked:true}};
  74  |       await new Promise(r=>setTimeout(r,10));m.scoring_lock_owner='host:host-e2e';m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();await new Promise(r=>setTimeout(r,35));
  75  |       if(m.scoring_lock_owner!=='host:host-e2e'||!active(m))return {status:423,body:{error:`Court ${m.ladder_court_rank} was claimed by another scorer.`,locked:true}};
  76  |       return {success:true,hostAuthority:true,expires_at:m.scoring_lock_expires_at};
  77  |     }
  78  |     if(name==='kotcCommand'&&body.commandType==='host_release_score'){
  79  |       const m=model.matches.find(x=>x.id===body.matchId);if(m?.scoring_lock_owner==='host:host-e2e'){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
  80  |     }
  81  |     if(name==='kotcCommand'&&body.commandType==='correct_match'){
  82  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  83  |       if(!active(m)||m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:'This saved score is being corrected elsewhere or your correction lock expired. Refresh before trying again.',locked:true}};
  84  |       if(Number(body.expectedMatchRevision)!==m.revision)return {status:409,body:{error:'Match changed since you opened it.'}};
  85  |       m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.revision+=1;m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=null;return {success:true,match:{...m},correction:true};
  86  |     }
  87  |     if(name==='saveKotcScore'){
  88  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  89  |       if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:`Court ${m.ladder_court_rank} is already being entered by a player.`}};
  90  |       if(Number(body.expectedMatchRevision)!==m.revision)return {status:409,body:{error:'Match changed since you opened it.'}};
  91  |       m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=null;return {success:true,match:{...m}};
  92  |     }
  93  |     return {success:true};
  94  |   };
  95  |   return model;
  96  | }
  97  | 
  98  | async function install(context,model,source){
  99  |   await context.route('**/api/apps/**',async route=>{
  100 |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  101 |     if(!url.pathname.includes(marker))return json(route,[]);
  102 |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');let body={};try{body=req.postDataJSON()||{};}catch{}
  103 |     const out=await model.handle(source,name,body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  104 |   });
  105 | }
  106 | 
> 107 | async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('Collaborative Score E2E')).toBeVisible();return page;}
      |                                                                                                                                                                              ^ Error: expect(locator).toBeVisible() failed
  108 | async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}
  109 | 
  110 | test('host + two scorer devices: first claim wins, mixed parallel scoring, manual host refresh only',async({browser})=>{
  111 |   test.setTimeout(60000);
  112 |   const model=createModel();
  113 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  114 |   await install(hostCtx,model,'host');await install(aCtx,model,'scorer-a');await install(bCtx,model,'scorer-b');
  115 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  116 |   await expect(host.getByTestId('kotc-refresh-player-scores')).toBeVisible();
  117 | 
  118 |   // No background host score polling: wait longer than the old polling interval.
  119 |   const before=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  120 |   await host.waitForTimeout(4500);
  121 |   expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(before);
  122 | 
  123 |   const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  124 |   const scorerStateBefore=model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length;
  125 |   await a.waitForTimeout(5500);
  126 |   expect(model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length).toBe(scorerStateBefore);
  127 |   await a.getByTestId('scorer-court-1').locator('input').nth(0).fill('1');
  128 |   await b.getByTestId('scorer-court-2').locator('input').nth(0).fill('7');
  129 |   await expect(a.getByTestId('scorer-court-1')).toContainText('locked to you');
  130 |   await expect(b.getByTestId('scorer-court-2')).toContainText('locked to you');
  131 | 
  132 |   // Host learns ownership only when deliberately refreshing; claimed player courts become unavailable to host.
  133 |   await host.getByTestId('kotc-refresh-player-scores').click();
  134 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Player entering this court');
  135 |   await expect(host.getByTestId('kotc-score-1-a')).toBeDisabled();
  136 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Player entering this court');
  137 |   await expect(host.getByTestId('kotc-score-2-a')).toBeDisabled();
  138 | 
  139 |   // Host claims a different free court on the first actual digit. The scorer page does not poll;
  140 |   // one explicit scorer refresh reveals the host lock.
  141 |   await host.getByTestId('kotc-score-3-a').fill('6');
  142 |   await expect(host.getByTestId('kotc-score-card-3')).toContainText('HOST ENTERING');
  143 |   await a.getByTestId('scorer-refresh').click();
  144 |   await expect(a.getByTestId('scorer-court-3')).toContainText(/host or another scorer|LOCKED/);
  145 | 
  146 |   // All three can score in parallel on separate courts.
  147 |   const cardA=await fillCourt(a,1,11,1),cardB=await fillCourt(b,2,7,8);
  148 |   await host.getByTestId('kotc-score-3-b').fill('4');
  149 |   await Promise.all([
  150 |     cardA.getByRole('button',{name:'Save Result'}).click(),
  151 |     cardB.getByRole('button',{name:'Save Result'}).click(),
  152 |     host.getByTestId('kotc-complete-3').click(),
  153 |   ]);
  154 |   await expect(cardA).toContainText('Score saved: 11–1');await expect(cardB).toContainText('Score saved: 7–8');await expect(host.getByTestId('kotc-score-card-3')).toContainText('Saved 6–4');
  155 | 
  156 |   // Player saves do not magically appear on host: host has only its local Court 3 result until a deliberate action.
  157 |   await expect(host.getByTestId('kotc-next-action')).toContainText('1/4 scores saved');
  158 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toBeVisible();
  159 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('1/4 saved');
  160 |   const toolbarBeforeCourtOne=await host.evaluate(()=>{const toolbar=document.querySelector('[data-testid="kotc-player-score-toolbar"]'),court=document.querySelector('[data-testid="kotc-score-card-1"]');if(!toolbar||!court)return false;return !!(toolbar.compareDocumentPosition(court)&Node.DOCUMENT_POSITION_FOLLOWING);});
  161 |   expect(toolbarBeforeCourtOne,'Player Scores refresh toolbar should sit immediately before the court score grid').toBe(true);
  162 |   const refreshReadsBefore=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  163 |   await host.waitForTimeout(1500);
  164 |   expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(refreshReadsBefore);
  165 | 
  166 |   // Normal manual refresh pulls both player saves in and remains cheap.
  167 |   await host.getByTestId('kotc-refresh-player-scores').click();
  168 |   await expect(host.getByTestId('kotc-next-action')).toContainText('3/4 scores saved');
  169 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–1');
  170 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Saved 7–8');
  171 | 
  172 |   // Host can take the remaining free court on first digit and finish the round locally.
  173 |   await host.getByTestId('kotc-score-4-a').fill('9');await host.getByTestId('kotc-score-4-b').fill('5');await host.getByTestId('kotc-complete-4').click();
  174 |   await expect(host.getByText('All scores saved for Round 1')).toBeVisible();
  175 | 
  176 |   await hostCtx.close();await aCtx.close();await bCtx.close();
  177 | });
  178 | 
  179 | test('stale host cannot type over a helper score that was already saved',async({browser})=>{
  180 |   const model=createModel();
  181 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  182 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  183 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  184 |   const scorer=await openScorer(scorerCtx);
  185 | 
  186 |   // Host deliberately never refreshes after the helper starts. From the host's stale local view Court 1 still looks free.
  187 |   const helperCard=await fillCourt(scorer,1,11,2);await helperCard.getByRole('button',{name:'Save Result'}).click();
  188 |   await expect(helperCard).toContainText('Score saved: 11–2');
  189 |   await expect(host.getByTestId('kotc-score-1-a')).toHaveValue('');
  190 |   await expect(host.getByTestId('kotc-score-1-a')).toBeEnabled();
  191 | 
  192 |   // First attempted host digit hits the authoritative claim endpoint. Because the helper already saved,
  193 |   // the digit must never appear; the UI performs one lightweight refresh and renders 11–2 instead.
  194 |   await host.getByTestId('kotc-score-1-a').fill('5');
  195 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  196 |   await expect(host.getByTestId('kotc-score-1-a')).toHaveValue('11');
  197 |   expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(2);expect(model.matches[0].revision).toBe(1);
  198 |   expect(model.calls.some(c=>c.source==='host'&&c.name==='kotcCommand'&&c.body.commandType==='host_claim_score')).toBe(true);
  199 | 
  200 |   await hostCtx.close();await scorerCtx.close();
  201 | });
  202 | 
  203 | test('same-millisecond host/helper first digits leave exactly one court owner',async({browser})=>{
  204 |   const model=createModel();
  205 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  206 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  207 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
```