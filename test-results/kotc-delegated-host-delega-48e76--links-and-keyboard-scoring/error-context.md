# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> delegated host: session-only controls, attendee contacts, links and keyboard scoring
- Location: e2e/kotc-delegated-host.spec.mjs:59:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-complete-1')
    - locator resolved to <button data-dynamic-content="true" data-testid="kotc-complete-1" data-source-location="src/components/kotc/KotcV2SessionView.jsx:46:16" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px…>Complete Match</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass space-y-4 border border-primary/20 fixed inset-0 z-[100] rounded-none flex flex-col justify-center p-6 sm:p-8 bg-background">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass space-y-4 border border-primary/20 fixed inset-0 z-[100] rounded-none flex flex-col justify-center p-6 sm:p-8 bg-background">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    83 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass space-y-4 border border-primary/20 fixed inset-0 z-[100] rounded-none flex flex-col justify-center p-6 sm:p-8 bg-background">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 1 courts · 0 bench · 0/1 scores saved
      - button "Session Menu" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - paragraph [ref=e11]: What happens next
      - paragraph [ref=e12]: Round 1 live · 0/1 scores saved
      - paragraph [ref=e13]: "Next: collect Court 1 result. You can correct any saved score before advancing."
    - generic [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e17]: Play Time
        - generic [ref=e18]:
          - button "Test / enable speaker sound" [ref=e19] [cursor=pointer]
          - button "Float and move timer" [ref=e20] [cursor=pointer]
          - button "Full screen timer" [ref=e21] [cursor=pointer]
      - generic [ref=e22]: 07:16
      - generic [ref=e25]:
        - button "Pause Timer" [ref=e26] [cursor=pointer]
        - button "Reset" [ref=e27] [cursor=pointer]
    - paragraph [ref=e28]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "Undo Start / Back to Round Setup" [ref=e29] [cursor=pointer]
    - generic [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]: Court 1
        - generic [ref=e37]: LIVE
      - generic [ref=e38]:
        - generic [ref=e39]:
          - paragraph [ref=e40]: Team A
          - paragraph [ref=e41]: Host Player 1 & Host Player 2
        - spinbutton [ref=e42]: "11"
      - generic [ref=e43]:
        - generic [ref=e44]:
          - paragraph [ref=e45]: Team B
          - paragraph [ref=e46]: Host Player 3 & Host Player 4
        - spinbutton [active] [ref=e47]: "7"
      - button "Complete Match" [ref=e48] [cursor=pointer]
```

# Test source

```ts
  1  | import { test,expect } from '@playwright/test';
  2  | 
  3  | const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  4  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  5  | const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  6  | 
  7  | function createModel(){
  8  |   const participants=Array.from({length:4},(_,i)=>({id:`participant-${i+1}`,player_id:`player-${i+1}`,display_name:`Host Player ${i+1}`,status:'present',participant_type:'member',seed_rank:i+1}));
  9  |   const round={id:'delegated-round-1',session_id:'delegated-session',round_number:1,status:'proposed',proposal_revision:1,active_court_count:1,bench_count:0};
  10 |   const slots=[
  11 |     {id:'slot-a1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:1,participant_id:'participant-1'},
  12 |     {id:'slot-a2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:2,participant_id:'participant-2'},
  13 |     {id:'slot-b1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:1,participant_id:'participant-3'},
  14 |     {id:'slot-b2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:2,participant_id:'participant-4'},
  15 |   ];
  16 |   const match={id:'delegated-match-1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_a_participant_ids:['participant-1','participant-2'],team_b_participant_ids:['participant-3','participant-4'],status:'scheduled',revision:0,correction_count:0};
  17 |   const session={id:'delegated-session',tournament_id:'delegated-host-tournament',name:'Delegated Host KOTC',status:'ready',current_round_number:1,current_round_id:round.id,revision:0,play_minutes:8,scoring_mode:'timed',venue_court_limit:1,available_court_limit:1};
  18 |   const calls=[];
  19 |   const state=()=>({session,participants,rounds:[round],slots,matches:[match],fixedPairs:[],contactDirectory:{
  20 |     'player-1':{phone:'0850000001',emergency_name:'Emergency One',emergency_relationship:'Partner',emergency_mobile:'0860000001'},
  21 |     'player-2':{phone:'0850000002',emergency_name:'Emergency Two',emergency_relationship:'Spouse',emergency_mobile:'0860000002'},
  22 |     'player-3':{phone:'0850000003',emergency_name:'Emergency Three',emergency_relationship:'Sibling',emergency_mobile:'0860000003'},
  23 |     'player-4':{phone:'0850000004',emergency_name:'Emergency Four',emergency_relationship:'Friend',emergency_mobile:'0860000004'},
  24 |     outsider:{phone:'999',emergency_name:'SHOULD NOT APPEAR',emergency_mobile:'999'},
  25 |   },currentAccessRole:'session_host',isAdmin:false});
  26 |   const handle=async(name,body)=>{
  27 |     calls.push({name,body});
  28 |     if(name==='getKotcV2State')return state();
  29 |     if(name==='manageKotcSessionAccess')return {__status:403,error:'Platform admin access required'};
  30 |     if(name==='kotcResultsShare')return {success:true,token:'delegated-live-token'};
  31 |     if(name==='manageKotcScorerLinks')return {success:true,token:'delegated-score-token'};
  32 |     if(name==='kotcTimer')return {success:true,state:{roundId:round.id,durationSeconds:480,remainingSeconds:480,running:false,deadlineAt:null,lastAction:body.action||'get'}};
  33 |     if(name==='kotcCommand'&&body.commandType==='host_claim_score')return {success:true,hostAuthority:true,displacedScorer:false};
  34 |     if(name==='kotcCommand'&&body.commandType==='start_proposed_round'){
  35 |       await sleep(80);round.status='started';round.started_at=new Date().toISOString();session.status='in_progress';session.revision++;session.actual_first_round_start=round.started_at;return {success:true,session,round};
  36 |     }
  37 |     if(name==='kotcCommand'&&body.commandType==='complete_match'){
  38 |       await sleep(60);match.team_a_score=Number(body.teamAScore);match.team_b_score=Number(body.teamBScore);match.winner_side=match.team_a_score>match.team_b_score?'A':'B';match.status='completed';match.revision++;return {success:true,match};
  39 |     }
  40 |     return {success:true,session};
  41 |   };
  42 |   return {session,participants,round,match,calls,state,handle};
  43 | }
  44 | 
  45 | async function install(page,model){
  46 |   await page.route('**/api/apps/**',async route=>{
  47 |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  48 |     if(!url.pathname.includes(marker))return json(route,[]);
  49 |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  50 |     let body={};try{body=req.postDataJSON()||{};}catch{}
  51 |     const out=await model.handle(name,body);
  52 |     if(out?.__status)return json(route,{error:out.error},out.__status);
  53 |     return json(route,out);
  54 |   });
  55 | }
  56 | 
  57 | test.use({viewport:{width:390,height:844}});
  58 | 
  59 | test('delegated host: session-only controls, attendee contacts, links and keyboard scoring',async({page})=>{
  60 |   const model=createModel();await install(page,model);
  61 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  62 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 ready');
  63 |   await expect(page.getByTestId('kotc-next-action')).toContainText('check the 1 court assignments');
  64 | 
  65 |   // Session-only contact access: four attendees are visible, a non-roster record is not.
  66 |   await page.getByTestId('kotc-session-menu').click();
  67 |   await page.getByRole('button',{name:'Contacts'}).click();
  68 |   await expect(page.getByText('0850000001')).toBeVisible();
  69 |   await expect(page.getByText('Emergency One')).toBeVisible();
  70 |   await expect(page.getByText('0860000004')).toBeVisible();
  71 |   await expect(page.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  72 | 
  73 |   // Delegated host can prepare player/public links but cannot appoint another host.
  74 |   await page.getByText('Session Links & Access').click();
  75 |   await expect(page.getByText('Live Player View',{exact:true})).toBeVisible();
  76 |   await expect(page.getByText('Player Scoring Link',{exact:true})).toBeVisible();
  77 |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  78 |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  79 |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  80 | 
  81 |   // Close the menu and run the sporting action as a host.
  82 |   await page.getByTestId('kotc-session-menu').click();
  83 |   await page.getByTestId('kotc-start-round').click();
  84 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  85 | 
  86 |   // Simulate real keyboard entry rather than programmatic value injection.
  87 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  88 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  89 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  90 |   const save=page.getByTestId('kotc-complete-1');
  91 |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
> 92 |   await save.click();
     |              ^ Error: locator.click: Test timeout of 45000ms exceeded.
  93 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  94 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
  95 | 
  96 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  97 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  98 | });
  99 | 
```