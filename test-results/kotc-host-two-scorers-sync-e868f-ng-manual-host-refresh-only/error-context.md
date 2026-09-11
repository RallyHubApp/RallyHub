# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-two-scorers-sync.spec.mjs >> host + two scorer devices: first claim wins, mixed parallel scoring, manual host refresh only
- Location: e2e/kotc-host-two-scorers-sync.spec.mjs:90:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/1\/4 scores saved/)
Expected: visible
Error: strict mode violation: getByText(/1\/4 scores saved/) resolved to 2 elements:
    1) <p data-dynamic-content="true" class="text-xs text-muted-foreground" data-source-location="src/components/kotc/KotcV2SessionView.jsx:238:202">4 courts · 2 bench · 1/4 scores saved</p> aka getByText('4 courts · 2 bench · 1/4')
    2) <p data-dynamic-content="true" class="font-semibold text-sm mt-1" data-collection-item-field="title" data-source-location="src/components/kotc/KotcV2SessionView.jsx:240:298">Round 1 live · 1/4 scores saved</p> aka getByText('Round 1 live · 1/4 scores')

Call log:
  - Expect "toBeVisible" getByText(/1\/4 scores saved/) with timeout 3000ms
  - waiting for getByText(/1\/4 scores saved/)

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 1/4 scores saved
      - generic [ref=e9]:
        - button "Links" [ref=e10] [cursor=pointer]
        - button "Menu" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - paragraph [ref=e13]: What happens next
      - paragraph [ref=e14]: Round 1 live · 1/4 scores saved
      - paragraph [ref=e15]: "Next: collect Court 1, Court 2, Court 4 results. You can correct any saved score before advancing."
      - button "Refresh Player Scores" [ref=e16] [cursor=pointer]
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - paragraph [ref=e20]: Play Time
          - paragraph [ref=e21]: 8 min round timer
        - generic [ref=e22]:
          - button "Test speaker and spoken announcement" [ref=e23] [cursor=pointer]
          - button "Float and move timer" [ref=e24] [cursor=pointer]
          - button "Full screen timer" [ref=e25] [cursor=pointer]
      - generic [ref=e26]: 06:46
      - paragraph [ref=e30]: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
      - generic [ref=e31]:
        - button "Pause Timer" [ref=e32] [cursor=pointer]
        - button "Reset" [ref=e33] [cursor=pointer]
      - paragraph [ref=e34]: Tap the speaker once before play to enable sound. The timer itself starts automatically when the sporting round starts.
    - paragraph [ref=e35]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - generic [ref=e36]:
      - paragraph [ref=e37]: Bench This Round
      - paragraph [ref=e38]: Player 17 · Player 18
    - generic [ref=e39]: 1 of 4 saved — Waiting for Court 1, Court 2, Court 4
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]:
          - generic [ref=e43]: Court 1
          - generic [ref=e47]: LIVE
        - generic [ref=e48]:
          - generic [ref=e49]:
            - paragraph [ref=e50]: Team A
            - paragraph [ref=e51]: Player 01 & Player 02
          - textbox [disabled] [ref=e52]
        - generic [ref=e53]:
          - generic [ref=e54]:
            - paragraph [ref=e55]: Team B
            - paragraph [ref=e56]: Player 03 & Player 04
          - textbox [disabled] [ref=e57]
        - generic [ref=e58]: Player entering this court — wait for them to save or cancel, then refresh.
        - button "Player entering score" [disabled]
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]: Court 2
          - generic [ref=e63]: LIVE
        - generic [ref=e64]:
          - generic [ref=e65]:
            - paragraph [ref=e66]: Team A
            - paragraph [ref=e67]: Player 05 & Player 06
          - textbox [disabled] [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - paragraph [ref=e71]: Team B
            - paragraph [ref=e72]: Player 07 & Player 08
          - textbox [disabled] [ref=e73]
        - generic [ref=e74]: Player entering this court — wait for them to save or cancel, then refresh.
        - button "Player entering score" [disabled]
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]: Court 3
          - generic [ref=e79]: SAVED
        - generic [ref=e80]:
          - generic [ref=e81]:
            - paragraph [ref=e82]: Team A
            - paragraph [ref=e83]: Player 09 & Player 10
          - textbox [disabled] [ref=e84]: "6"
        - generic [ref=e85]:
          - generic [ref=e86]:
            - paragraph [ref=e87]: Team B
            - paragraph [ref=e88]: Player 11 & Player 12
          - textbox [disabled] [ref=e89]: "4"
        - generic [ref=e90]: ✓ Saved 6–4
        - button "Edit result" [ref=e91] [cursor=pointer]
      - generic [ref=e92]:
        - generic [ref=e93]:
          - generic [ref=e94]: Court 4
          - generic [ref=e96]: LIVE
        - generic [ref=e97]:
          - generic [ref=e98]:
            - paragraph [ref=e99]: Team A
            - paragraph [ref=e100]: Player 13 & Player 14
          - textbox [disabled] [ref=e101]
        - generic [ref=e102]:
          - generic [ref=e103]:
            - paragraph [ref=e104]: Team B
            - paragraph [ref=e105]: Player 15 & Player 16
          - textbox [disabled] [ref=e106]
        - generic [ref=e107]: A player can score this court, or the host can enter it here.
        - button "Enter Score as Host" [ref=e108] [cursor=pointer]
  - generic [ref=e109]:
    - button "Scroll up" [ref=e110] [cursor=pointer]
    - button "Scroll down" [disabled]
```

# Test source

```ts
  32  |       if(body.liveScoresOnly)return liveScorePayload();
  33  |       return {session:model.session,participants:model.participants,rounds:[model.round],slots:model.slots,matches:model.matches,fixedPairs:[],scorerLinkActive:true,contactDirectory:{},currentAccessRole:'admin',isAdmin:true};
  34  |     }
  35  |     if(name==='kotcTimer')return {success:true,state:JSON.parse(model.session.timer_state_json)};
  36  |     if(name==='kotcScorer'){
  37  |       const action=body.action||'state',clientId=body.clientId||'';
  38  |       if(action==='state')return scorerState(clientId);
  39  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  40  |       if(action==='claim'){
  41  |         const mine=model.matches.find(x=>x.id!==m.id&&x.scoring_lock_owner===clientId&&active(x));if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.ladder_court_rank}. Save or cancel that court first.`,locked:true}};
  42  |         if(active(m)&&m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is being scored on another device.`,locked:true}};
  43  |         m.scoring_lock_owner=clientId;m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();return {success:true,claimed:true,lease_seconds:90,expires_at:m.scoring_lock_expires_at};
  44  |       }
  45  |       if(action==='heartbeat'){
  46  |         if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:'Your scoring lock is no longer active.'}};
  47  |         m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();return {success:true};
  48  |       }
  49  |       if(action==='release'){
  50  |         if(m.scoring_lock_owner===clientId){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
  51  |       }
  52  |       if(action==='save'||action==='correct'){
  53  |         if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is not locked to this scorer.`}};
  54  |         if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.'}};
  55  |         m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=clientId;
  56  |         return {success:true,message:action==='correct'?'Updated score saved':'Score saved',match:{...m,can_correct:true,lock_status:'free'}};
  57  |       }
  58  |     }
  59  |     if(name==='kotcCommand'&&body.commandType==='host_claim_score'){
  60  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  61  |       if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:`Court ${m.ladder_court_rank} is already being entered by a player. Wait for them to save or cancel, then refresh player scores.`,locked:true}};
  62  |       m.scoring_lock_owner='host:host-e2e';m.scoring_lock_expires_at=new Date(Date.now()+300000).toISOString();return {success:true,hostAuthority:true,expires_at:m.scoring_lock_expires_at};
  63  |     }
  64  |     if(name==='kotcCommand'&&body.commandType==='host_release_score'){
  65  |       const m=model.matches.find(x=>x.id===body.matchId);if(m?.scoring_lock_owner==='host:host-e2e'){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
  66  |     }
  67  |     if(name==='saveKotcScore'){
  68  |       const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
  69  |       if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:`Court ${m.ladder_court_rank} is already being entered by a player.`}};
  70  |       if(Number(body.expectedMatchRevision)!==m.revision)return {status:409,body:{error:'Match changed since you opened it.'}};
  71  |       m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=null;return {success:true,match:{...m}};
  72  |     }
  73  |     return {success:true};
  74  |   };
  75  |   return model;
  76  | }
  77  | 
  78  | async function install(context,model,source){
  79  |   await context.route('**/api/apps/**',async route=>{
  80  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  81  |     if(!url.pathname.includes(marker))return json(route,[]);
  82  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');let body={};try{body=req.postDataJSON()||{};}catch{}
  83  |     const out=await model.handle(source,name,body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  84  |   });
  85  | }
  86  | 
  87  | async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('Collaborative Score E2E')).toBeVisible();return page;}
  88  | async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}
  89  | 
  90  | test('host + two scorer devices: first claim wins, mixed parallel scoring, manual host refresh only',async({browser})=>{
  91  |   test.setTimeout(60000);
  92  |   const model=createModel();
  93  |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  94  |   await install(hostCtx,model,'host');await install(aCtx,model,'scorer-a');await install(bCtx,model,'scorer-b');
  95  |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  96  |   await expect(host.getByTestId('kotc-refresh-player-scores')).toBeVisible();
  97  | 
  98  |   // No background host score polling: wait longer than the old polling interval.
  99  |   const before=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  100 |   await host.waitForTimeout(4500);
  101 |   expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(before);
  102 | 
  103 |   const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  104 |   await a.getByTestId('scorer-court-1').getByRole('button',{name:'Score This Court'}).click();
  105 |   await b.getByTestId('scorer-court-2').getByRole('button',{name:'Score This Court'}).click();
  106 |   await expect(a.getByTestId('scorer-court-1')).toContainText('Court 1 ready — enter the score');
  107 |   await expect(b.getByTestId('scorer-court-2')).toContainText('Court 2 ready — enter the score');
  108 | 
  109 |   // Host learns ownership only when deliberately refreshing; claimed player courts become unavailable to host.
  110 |   await host.getByTestId('kotc-refresh-player-scores').click();
  111 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Player entering this court');
  112 |   await expect(host.getByTestId('kotc-host-score-1')).toBeDisabled();
  113 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Player entering this court');
  114 |   await expect(host.getByTestId('kotc-host-score-2')).toBeDisabled();
  115 | 
  116 |   // Host claims a different free court; scorer pages see that court as unavailable.
  117 |   await host.getByTestId('kotc-host-score-3').click();
  118 |   await expect(host.getByTestId('kotc-score-card-3')).toContainText('HOST ENTERING');
  119 |   await expect(a.getByTestId('scorer-court-3')).toContainText(/host or another scorer|LOCKED/,{timeout:6500});
  120 | 
  121 |   // All three can score in parallel on separate courts.
  122 |   const cardA=await fillCourt(a,1,11,1),cardB=await fillCourt(b,2,7,8);
  123 |   await host.getByTestId('kotc-score-3-a').fill('6');await host.getByTestId('kotc-score-3-b').fill('4');
  124 |   await Promise.all([
  125 |     cardA.getByRole('button',{name:'Save Result'}).click(),
  126 |     cardB.getByRole('button',{name:'Save Result'}).click(),
  127 |     host.getByTestId('kotc-complete-3').click(),
  128 |   ]);
  129 |   await expect(cardA).toContainText('Score saved: 11–1');await expect(cardB).toContainText('Score saved: 7–8');await expect(host.getByTestId('kotc-score-card-3')).toContainText('Saved 6–4');
  130 | 
  131 |   // Player saves do not magically appear on host: host has only its local Court 3 result until Refresh.
> 132 |   await expect(host.getByText(/1\/4 scores saved/)).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  133 |   const refreshReadsBefore=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  134 |   await host.waitForTimeout(1500);
  135 |   expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(refreshReadsBefore);
  136 |   await host.getByTestId('kotc-refresh-player-scores').click();
  137 |   await expect(host.getByText(/3\/4 scores saved/)).toBeVisible();
  138 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–1');
  139 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Saved 7–8');
  140 | 
  141 |   // Host can take the remaining free court and finish the round locally.
  142 |   await host.getByTestId('kotc-host-score-4').click();await host.getByTestId('kotc-score-4-a').fill('9');await host.getByTestId('kotc-score-4-b').fill('5');await host.getByTestId('kotc-complete-4').click();
  143 |   await expect(host.getByText('All scores saved for Round 1')).toBeVisible();
  144 | 
  145 |   await hostCtx.close();await aCtx.close();await bCtx.close();
  146 | });
  147 | 
```