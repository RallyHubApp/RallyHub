# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> delegated host: session-only controls, attendee contacts, links and keyboard scoring
- Location: e2e/kotc-delegated-host.spec.mjs:59:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Live Player View')
Expected: visible
Error: strict mode violation: getByText('Live Player View') resolved to 2 elements:
    1) <p data-dynamic-content="false" class="text-xs text-muted-foreground mt-1" data-source-location="src/components/kotc/KotcHostAccessPanel.jsx:53:168">Live player view, scorer access and restricted ho…</p> aka getByRole('button', { name: 'Session Links & Access Live' })
    2) <p data-dynamic-content="false" class="text-xs font-semibold flex items-center gap-2" data-source-location="src/components/kotc/KotcHostAccessPanel.jsx:58:66">…</p> aka getByText('Live Player View', { exact: true })

Call log:
  - Expect "toBeVisible" getByText('Live Player View') with timeout 3000ms
  - waiting for getByText('Live Player View')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — ROUND READY
        - paragraph [ref=e8]: 1 courts · 0 bench
      - button "Session Menu" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - paragraph [ref=e11]: What happens next
      - paragraph [ref=e12]: Round 1 ready
      - paragraph [ref=e13]: "Next: check the 1 court assignments, then Start Round 1."
    - generic [ref=e14]:
      - generic [ref=e15]:
        - button "Round History" [ref=e16] [cursor=pointer]
        - button "Players" [ref=e17] [cursor=pointer]
        - button "Timer" [ref=e18] [cursor=pointer]
        - button "Contacts" [ref=e19] [cursor=pointer]
        - button "Copy Live Link" [ref=e20] [cursor=pointer]
        - button "Email Players" [ref=e21] [cursor=pointer]
        - button "Resend Results" [ref=e22] [cursor=pointer]
      - generic [ref=e23]:
        - generic [ref=e24]:
          - paragraph [ref=e25]: Host Player 1
          - paragraph [ref=e26]: "Mobile: 0850000001"
          - paragraph [ref=e27]: "Emergency contact: Emergency One — Partner"
          - paragraph [ref=e28]: "Emergency mobile: 0860000001"
        - generic [ref=e29]:
          - paragraph [ref=e30]: Host Player 2
          - paragraph [ref=e31]: "Mobile: 0850000002"
          - paragraph [ref=e32]: "Emergency contact: Emergency Two — Spouse"
          - paragraph [ref=e33]: "Emergency mobile: 0860000002"
        - generic [ref=e34]:
          - paragraph [ref=e35]: Host Player 3
          - paragraph [ref=e36]: "Mobile: 0850000003"
          - paragraph [ref=e37]: "Emergency contact: Emergency Three — Sibling"
          - paragraph [ref=e38]: "Emergency mobile: 0860000003"
        - generic [ref=e39]:
          - paragraph [ref=e40]: Host Player 4
          - paragraph [ref=e41]: "Mobile: 0850000004"
          - paragraph [ref=e42]: "Emergency contact: Emergency Four — Friend"
          - paragraph [ref=e43]: "Emergency mobile: 0860000004"
      - generic [ref=e44]:
        - button [active] [ref=e45] [cursor=pointer]:
          - generic [ref=e50]:
            - paragraph [ref=e51]: Session Links & Access
            - paragraph [ref=e52]: Live player view, scorer access and restricted host control for this session.
        - generic [ref=e56]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Live Player View
            - paragraph [ref=e62]: Public, read-only and updates automatically through assignments, live scores, standings and podium.
            - button "Copy Live Link" [ref=e63] [cursor=pointer]
          - generic [ref=e64]:
            - paragraph [ref=e65]: Player Scoring Link
            - paragraph [ref=e69]: Share with all players. Each court nominates one player to enter/correct that court’s score. Per-court edit locking prevents two devices overwriting each other.
            - button "Copy Player Scoring Link" [ref=e70] [cursor=pointer]
      - generic [ref=e71]:
        - button "Finish Session Now" [ref=e72] [cursor=pointer]
        - button "Abandon / Cancel" [ref=e73] [cursor=pointer]
    - generic [ref=e74]:
      - generic [ref=e75]:
        - generic [ref=e76]:
          - heading "Host Round Editor" [level=4] [ref=e77]
          - paragraph [ref=e78]: Tap one player then another to swap. Only one pending selection is allowed.
        - generic [ref=e80]:
          - generic [ref=e81]: Court 1
          - generic [ref=e85]:
            - generic [ref=e86]:
              - paragraph [ref=e87]: Team A
              - button "Lock pair" [ref=e88] [cursor=pointer]
            - generic [ref=e89]:
              - button "Host Player 1" [ref=e90] [cursor=pointer]
              - button "Host Player 2" [ref=e99] [cursor=pointer]
          - generic [ref=e108]:
            - generic [ref=e109]:
              - paragraph [ref=e110]: Team B
              - button "Lock pair" [ref=e111] [cursor=pointer]
            - generic [ref=e112]:
              - button "Host Player 3" [ref=e113] [cursor=pointer]
              - button "Host Player 4" [ref=e122] [cursor=pointer]
      - button "START ROUND 1" [ref=e131] [cursor=pointer]
      - button "Back to Setup" [ref=e132] [cursor=pointer]
      - button "Restore Original Draw" [ref=e133] [cursor=pointer]
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
> 75 |   await expect(page.getByText('Live Player View')).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  76 |   await expect(page.getByText('Player Scoring Link')).toBeVisible();
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
  92 |   await save.click();
  93 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  94 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
  95 | 
  96 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  97 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  98 | });
  99 | 
```