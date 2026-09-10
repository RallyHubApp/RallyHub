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

Locator: getByText('Host Player 1', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Host Player 1', { exact: true }) resolved to 2 elements:
    1) <p data-dynamic-content="true" class="text-sm font-semibold" data-collection-item-id="participant-1" data-collection-item-field="display_name" data-source-location="src/components/kotc/KotcV2SessionView.jsx:150:3207">Host Player 1</p> aka getByRole('paragraph').filter({ hasText: 'Host Player' })
    2) <span data-dynamic-content="true" class="text-sm font-medium leading-tight" data-source-location="src/components/kotc/KotcV2SessionView.jsx:74:1707">Host Player 1</span> aka getByTestId('kotc-slot-slot-a1')

Call log:
  - Expect "toBeVisible" getByText('Host Player 1', { exact: true }) with timeout 3000ms
  - waiting for getByText('Host Player 1', { exact: true })

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
          - paragraph [ref=e25]: Session contacts only
          - paragraph [ref=e26]: Search a player, then tap a number to call. No wider member directory is exposed here.
          - textbox "Search player name" [active] [ref=e27]: Host Player 1
        - generic [ref=e28]:
          - paragraph [ref=e29]: Host Player 1
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: Member mobile
              - link "0850000001" [ref=e33] [cursor=pointer]:
                - /url: tel:0850000001
            - generic [ref=e36]:
              - paragraph [ref=e37]: "Emergency: Emergency One — Partner"
              - link "0860000001" [ref=e38] [cursor=pointer]:
                - /url: tel:0860000001
      - button [ref=e42] [cursor=pointer]:
        - generic [ref=e47]:
          - paragraph [ref=e48]: Session Links & Access
          - paragraph [ref=e49]: Live player view, scorer access and restricted host control for this session.
      - generic [ref=e52]:
        - button "Finish Session Now" [ref=e53] [cursor=pointer]
        - button "Abandon / Cancel" [ref=e54] [cursor=pointer]
    - generic [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]:
          - heading "Host Round Editor" [level=4] [ref=e58]
          - paragraph [ref=e59]: Tap one player then another to swap. Only one pending selection is allowed.
        - generic [ref=e61]:
          - generic [ref=e62]: Court 1
          - generic [ref=e66]:
            - generic [ref=e67]:
              - paragraph [ref=e68]: Team A
              - button "Lock pair" [ref=e69] [cursor=pointer]
            - generic [ref=e70]:
              - button "Host Player 1" [ref=e71] [cursor=pointer]
              - button "Host Player 2" [ref=e80] [cursor=pointer]
          - generic [ref=e89]:
            - generic [ref=e90]:
              - paragraph [ref=e91]: Team B
              - button "Lock pair" [ref=e92] [cursor=pointer]
            - generic [ref=e93]:
              - button "Host Player 3" [ref=e94] [cursor=pointer]
              - button "Host Player 4" [ref=e103] [cursor=pointer]
      - button "START ROUND 1" [ref=e112] [cursor=pointer]
      - button "Back to Setup" [ref=e113] [cursor=pointer]
      - button "Restore Original Draw" [ref=e114] [cursor=pointer]
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
  34  |     if(name==='kotcCommand'&&body.commandType==='start_proposed_round'){
  35  |       await sleep(80);round.status='started';round.started_at=new Date().toISOString();session.status='in_progress';session.revision++;session.actual_first_round_start=round.started_at;return {success:true,session,round};
  36  |     }
  37  |     if(name==='kotcCommand'&&body.commandType==='complete_match'){
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
> 70  |   await expect(page.getByText('Host Player 1',{exact:true})).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  71  |   await expect(page.getByText('Host Player 2',{exact:true})).toHaveCount(0);
  72  |   const memberCall=page.locator('a[href="tel:0850000001"]');const emergencyCall=page.locator('a[href="tel:0860000001"]');
  73  |   await expect(memberCall).toBeVisible();await expect(emergencyCall).toBeVisible();
  74  |   expect((await memberCall.boundingBox())?.height||0).toBeGreaterThanOrEqual(40);
  75  |   await expect(page.getByText('Emergency One')).toBeVisible();
  76  |   await expect(page.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  77  |   await page.getByTestId('kotc-contact-search').fill('');
  78  | 
  79  |   // Delegated host can prepare player/public links but cannot appoint another host.
  80  |   await page.getByText('Session Links & Access').click();
  81  |   await expect(page.getByText('Live Player View',{exact:true})).toBeVisible();
  82  |   await expect(page.getByText('Player Scoring Link',{exact:true})).toBeVisible();
  83  |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  84  |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  85  |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  86  | 
  87  |   // Close the menu and run the sporting action as a host.
  88  |   await page.getByTestId('kotc-session-menu').click();
  89  |   await page.getByTestId('kotc-start-round').click();
  90  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  91  | 
  92  |   // Simulate real keyboard entry rather than programmatic value injection.
  93  |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  94  |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  95  |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  96  |   const save=page.getByTestId('kotc-complete-1');
  97  |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  98  |   await save.click();
  99  |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  100 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
  101 | 
  102 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  103 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  104 | });
  105 | 
  106 | test('busy-hall recovery: failed score save preserves keystrokes and retries safely',async({page})=>{
  107 |   const model=createModel({failFirstScore:true});await install(page,model);
  108 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  109 |   await page.getByTestId('kotc-start-round').click();
  110 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  111 | 
  112 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  113 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  114 |   await page.getByTestId('kotc-complete-1').click();
  115 | 
  116 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Save failed — your score is still on screen',{timeout:1800});
  117 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  118 |   await expect(page.getByTestId('kotc-complete-1')).toContainText('Retry Save');
  119 |   await page.getByTestId('kotc-complete-1').click();
  120 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
  121 |   expect(model.match.revision).toBe(1);
  122 | });
  123 | 
```