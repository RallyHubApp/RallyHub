# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> delegated host: session-only controls, attendee contacts, links and keyboard scoring
- Location: e2e/kotc-delegated-host.spec.mjs:60:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="tel:0850000001"]')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('a[href="tel:0850000001"]') with timeout 3000ms
  - waiting for locator('a[href="tel:0850000001"]')

```

```yaml
- main:
  - paragraph: Round 1 — ROUND READY
  - paragraph: 1 courts · 0 bench
  - button "Links":
    - img
    - text: Links
  - button "Menu":
    - img
    - text: Menu
  - paragraph: What happens next
  - paragraph: Round 1 ready
  - paragraph: "Next: check the 1 court assignments, then Start Round 1."
  - paragraph: Session tools
  - paragraph: Use these only when something changes during play.
  - button "Round History":
    - img
    - text: Round History
  - button "Players":
    - img
    - text: Players
  - button "Timer":
    - img
    - text: Timer
  - button "Contacts":
    - img
    - text: Contacts
  - paragraph: Session contacts only
  - paragraph: Search a player, then tap a number to call. No wider member directory is exposed here.
  - textbox "Search player name": Host Player 1
  - paragraph: Host Player 1
  - text: Member mobile Not recorded
  - paragraph: "Emergency: Not recorded"
  - paragraph: Emergency mobile not recorded
  - paragraph: Sharing & access
  - paragraph: Live view, player scoring and delegated host access all stay session-specific.
  - button "Session Links & Access Live player view, scorer access and restricted host control for this session.":
    - img
    - paragraph: Session Links & Access
    - paragraph: Live player view, scorer access and restricted host control for this session.
    - img
  - paragraph: Session control
  - paragraph: Pause if play stops. Finish only when tonight’s session is over.
  - button "Finish Session":
    - img
    - text: Finish Session
  - group: Emergency / cancel session
  - heading "Host Round Editor" [level=4]
  - paragraph: Tap one player then another to swap. Only one pending selection is allowed.
  - img
  - text: Court 1
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Host Player 1":
    - img
    - text: Host Player 1
  - button "Host Player 2":
    - img
    - text: Host Player 2
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Host Player 3":
    - img
    - text: Host Player 3
  - button "Host Player 4":
    - img
    - text: Host Player 4
  - button "START ROUND 1":
    - img
    - text: START ROUND 1
  - button "Back to Setup":
    - img
    - text: Back to Setup
  - button "Restore Original Draw":
    - img
    - text: Restore Original Draw
```

# Test source

```ts
  1   | import { test,expect } from '@playwright/test';
  2   | 
  3   | const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  4   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  5   | const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  6   | 
  7   | function createModel({failFirstScore=false}={}){
  8   |   const participants=Array.from({length:4},(_,i)=>({id:`participant-${i+1}`,player_id:`player-${i+1}`,display_name:`Host Player ${i+1}`,status:'present',participant_type:'member',seed_rank:i+1}));
  9   |   const round={id:'delegated-round-1',session_id:'delegated-session',round_number:1,status:'proposed',proposal_revision:1,active_court_count:1,bench_count:0};
  10  |   const slots=[
  11  |     {id:'slot-a1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:1,participant_id:'participant-1'},
  12  |     {id:'slot-a2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:2,participant_id:'participant-2'},
  13  |     {id:'slot-b1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:1,participant_id:'participant-3'},
  14  |     {id:'slot-b2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:2,participant_id:'participant-4'},
  15  |   ];
  16  |   const match={id:'delegated-match-1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_a_participant_ids:['participant-1','participant-2'],team_b_participant_ids:['participant-3','participant-4'],status:'scheduled',revision:0,correction_count:0};
  17  |   const session={id:'delegated-session',tournament_id:'delegated-host-tournament',name:'Delegated Host KOTC',status:'ready',current_round_number:1,current_round_id:round.id,revision:0,play_minutes:8,scoring_mode:'timed',venue_court_limit:1,available_court_limit:1};
  18  |   const calls=[];let failedScoreOnce=false;
  19  |   const state=()=>({session,participants,rounds:[round],slots,matches:[match],fixedPairs:[],contactDirectory:{
  20  |     'player-1':{phone:'0850000001',emergency_name:'Emergency One',emergency_relationship:'Partner',emergency_mobile:'0860000001'},
  21  |     'player-2':{phone:'0850000002',emergency_name:'Emergency Two',emergency_relationship:'Spouse',emergency_mobile:'0860000002'},
  22  |     'player-3':{phone:'0850000003',emergency_name:'Emergency Three',emergency_relationship:'Sibling',emergency_mobile:'0860000003'},
  23  |     'player-4':{phone:'0850000004',emergency_name:'Emergency Four',emergency_relationship:'Friend',emergency_mobile:'0860000004'},
  24  |     outsider:{phone:'999',emergency_name:'SHOULD NOT APPEAR',emergency_mobile:'999'},
  25  |   },currentAccessRole:'session_host',isAdmin:false});
  26  |   const handle=async(name,body)=>{
  27  |     calls.push({name,body});
  28  |     if(name==='getKotcV2State')return state();
  29  |     if(name==='manageKotcSessionAccess')return {__status:403,error:'Platform admin access required'};
  30  |     if(name==='kotcResultsShare')return {success:true,token:'delegated-live-token'};
  31  |     if(name==='manageKotcScorerLinks')return {success:true,token:'delegated-score-token'};
  32  |     if(name==='kotcTimer')return {success:true,state:{roundId:round.id,durationSeconds:480,remainingSeconds:480,running:false,deadlineAt:null,lastAction:body.action||'get'}};
  33  |     if(name==='kotcCommand'&&body.commandType==='host_claim_score')return {success:true,hostAuthority:true,displacedScorer:false};
  34  |     if(name==='startKotcRound'||(name==='kotcCommand'&&body.commandType==='start_proposed_round')){
  35  |       await sleep(80);round.status='started';round.started_at=new Date().toISOString();session.status='in_progress';session.revision++;session.actual_first_round_start=round.started_at;return {success:true,session,round};
  36  |     }
  37  |     if(name==='saveKotcScore'||(name==='kotcCommand'&&body.commandType==='complete_match')){
  38  |       if(failFirstScore&&!failedScoreOnce){failedScoreOnce=true;return {__status:503,error:'Temporary hall network interruption'};}
  39  |       await sleep(60);match.team_a_score=Number(body.teamAScore);match.team_b_score=Number(body.teamBScore);match.winner_side=match.team_a_score>match.team_b_score?'A':'B';match.status='completed';match.revision++;return {success:true,match};
  40  |     }
  41  |     return {success:true,session};
  42  |   };
  43  |   return {session,participants,round,match,calls,state,handle};
  44  | }
  45  | 
  46  | async function install(page,model){
  47  |   await page.route('**/api/apps/**',async route=>{
  48  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  49  |     if(!url.pathname.includes(marker))return json(route,[]);
  50  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  51  |     let body={};try{body=req.postDataJSON()||{};}catch{}
  52  |     const out=await model.handle(name,body);
  53  |     if(out?.__status)return json(route,{error:out.error},out.__status);
  54  |     return json(route,out);
  55  |   });
  56  | }
  57  | 
  58  | test.use({viewport:{width:390,height:844}});
  59  | 
  60  | test('delegated host: session-only controls, attendee contacts, links and keyboard scoring',async({page})=>{
  61  |   const model=createModel();await install(page,model);
  62  |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  63  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 ready');
  64  |   await expect(page.getByTestId('kotc-next-action')).toContainText('check the 1 court assignments');
  65  | 
  66  |   // Session-only contact access: four attendees are visible, a non-roster record is not.
  67  |   await page.getByTestId('kotc-session-menu').click();
  68  |   await page.getByRole('button',{name:'Contacts'}).click();
  69  |   await page.getByTestId('kotc-contact-search').fill('Host Player 1');
  70  |   const contacts=page.getByTestId('kotc-contact-directory');
  71  |   await expect(contacts.getByText('Host Player 1',{exact:true})).toBeVisible();
  72  |   await expect(contacts.getByText('Host Player 2',{exact:true})).toHaveCount(0);
  73  |   const memberCall=page.locator('a[href="tel:0850000001"]');const emergencyCall=page.locator('a[href="tel:0860000001"]');
> 74  |   await expect(memberCall).toBeVisible();await expect(emergencyCall).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
  75  |   expect((await memberCall.boundingBox())?.height||0).toBeGreaterThanOrEqual(40);
  76  |   await expect(contacts.getByText('Emergency One')).toBeVisible();
  77  |   await expect(contacts.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  78  |   await page.getByTestId('kotc-contact-search').fill('');
  79  | 
  80  |   // Delegated host can prepare player/public links but cannot appoint another host.
  81  |   await page.getByText('Session Links & Access').click();
  82  |   await expect(page.getByText('Live Player View',{exact:true})).toBeVisible();
  83  |   await expect(page.getByText('Player Scoring Link',{exact:true})).toBeVisible();
  84  |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  85  |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  86  |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  87  | 
  88  |   // Close the menu and run the sporting action as a host.
  89  |   await page.getByTestId('kotc-session-menu').click();
  90  |   await page.getByTestId('kotc-start-round').click();
  91  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  92  | 
  93  |   // Simulate real keyboard entry rather than programmatic value injection.
  94  |   // KOTC pickleball score boxes are physically limited to two digits.
  95  |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  96  |   await a.focus();await page.keyboard.type('123');await expect(a).toHaveValue('12');
  97  |   await a.fill('');await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  98  |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  99  |   const save=page.getByTestId('kotc-complete-1');
  100 |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  101 |   await save.click();
  102 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  103 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
  104 | 
  105 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  106 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  107 | });
  108 | 
  109 | test('busy-hall recovery: failed score save preserves keystrokes and retries safely',async({page})=>{
  110 |   const model=createModel({failFirstScore:true});await install(page,model);
  111 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  112 |   await page.getByTestId('kotc-start-round').click();
  113 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  114 | 
  115 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  116 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  117 |   await page.getByTestId('kotc-complete-1').click();
  118 | 
  119 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Save failed — your score is still on screen',{timeout:1800});
  120 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  121 |   await expect(page.getByTestId('kotc-complete-1')).toContainText('Retry Save');
  122 |   await page.getByTestId('kotc-complete-1').click();
  123 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
  124 |   expect(model.match.revision).toBe(1);
  125 | });
  126 | 
```