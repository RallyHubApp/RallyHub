# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> delegated host: session-only controls, attendee contacts, links and keyboard scoring
- Location: e2e/kotc-delegated-host.spec.mjs:61:1

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
        - paragraph [ref=e7]: Round 1 — ROUND READY
        - paragraph [ref=e8]: 1 courts · 0 bench
      - generic [ref=e9]:
        - button "Roster" [ref=e10] [cursor=pointer]
        - button "Leaderboard" [ref=e11] [cursor=pointer]
        - button "Links" [ref=e12] [cursor=pointer]
        - button "Menu" [ref=e13] [cursor=pointer]
    - generic [ref=e14]:
      - paragraph [ref=e15]: What happens next
      - paragraph [ref=e16]: Round 1 ready
      - paragraph [ref=e17]: "Next: check the 1 court assignments, then Start Round 1."
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - paragraph [ref=e21]: Session tools
          - paragraph [ref=e22]: Use these only when something changes during play.
        - generic [ref=e23]:
          - button "Round History" [ref=e24] [cursor=pointer]
          - button "Roster" [ref=e25] [cursor=pointer]
          - button "Timer" [ref=e26] [cursor=pointer]
          - button "Contacts" [ref=e27] [cursor=pointer]
      - generic [ref=e28]:
        - generic [ref=e29]:
          - paragraph [ref=e30]: Session contacts only
          - paragraph [ref=e31]: Search a player, then tap a number to call. No wider member directory is exposed here.
          - textbox "Search player name" [active] [ref=e32]
        - generic [ref=e33]:
          - paragraph [ref=e34]: Host Player 1
          - generic [ref=e35]:
            - generic [ref=e36]:
              - generic [ref=e37]: Member mobile
              - link "0850000001" [ref=e38] [cursor=pointer]:
                - /url: tel:0850000001
            - generic [ref=e41]:
              - paragraph [ref=e42]: "Emergency: Emergency One — Partner"
              - link "0860000001" [ref=e43] [cursor=pointer]:
                - /url: tel:0860000001
        - generic [ref=e46]:
          - paragraph [ref=e47]: Host Player 2
          - generic [ref=e48]:
            - generic [ref=e49]:
              - generic [ref=e50]: Member mobile
              - link "0850000002" [ref=e51] [cursor=pointer]:
                - /url: tel:0850000002
            - generic [ref=e54]:
              - paragraph [ref=e55]: "Emergency: Emergency Two — Spouse"
              - link "0860000002" [ref=e56] [cursor=pointer]:
                - /url: tel:0860000002
        - generic [ref=e59]:
          - paragraph [ref=e60]: Host Player 3
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e63]: Member mobile
              - link "0850000003" [ref=e64] [cursor=pointer]:
                - /url: tel:0850000003
            - generic [ref=e67]:
              - paragraph [ref=e68]: "Emergency: Emergency Three — Sibling"
              - link "0860000003" [ref=e69] [cursor=pointer]:
                - /url: tel:0860000003
        - generic [ref=e72]:
          - paragraph [ref=e73]: Host Player 4
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Member mobile
              - link "0850000004" [ref=e77] [cursor=pointer]:
                - /url: tel:0850000004
            - generic [ref=e80]:
              - paragraph [ref=e81]: "Emergency: Emergency Four — Friend"
              - link "0860000004" [ref=e82] [cursor=pointer]:
                - /url: tel:0860000004
      - generic [ref=e85]:
        - generic [ref=e86]:
          - paragraph [ref=e87]: Sharing & access
          - paragraph [ref=e88]: Live view, player scoring and delegated host access all stay session-specific.
        - button [ref=e90] [cursor=pointer]:
          - generic [ref=e95]:
            - paragraph [ref=e96]: Player Link, Broadcasts & Access
            - paragraph [ref=e97]: One KOTC Player Link evolves from sign-up through live rounds, scoring and final results.
      - generic [ref=e100]:
        - generic [ref=e101]:
          - paragraph [ref=e102]: Session control
          - paragraph [ref=e103]: Pause if play stops. Finish only when tonight’s session is over.
        - button "Finish Session" [ref=e105] [cursor=pointer]
        - group [ref=e106]:
          - generic "Emergency / cancel session" [ref=e107] [cursor=pointer]
    - generic [ref=e108]:
      - paragraph [ref=e109]: ROUND 1 HAS NOT STARTED
      - paragraph [ref=e110]: Call the court assignments below, make any host changes, then press START ROUND. The timer is not running and score entry is hidden until you start.
    - generic [ref=e111]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - heading "Host Round Editor" [level=4] [ref=e114]
          - paragraph [ref=e115]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
        - generic [ref=e117]:
          - generic [ref=e118]:
            - generic [ref=e119]: Court 1
            - button "Move whole Court 1" [ref=e123] [cursor=pointer]: Move court
          - generic [ref=e131]:
            - generic [ref=e132]:
              - paragraph [ref=e133]: Team A
              - button "Lock pair" [ref=e134] [cursor=pointer]
            - generic [ref=e135]:
              - button "Host Player 1" [ref=e136] [cursor=pointer]
              - button "Host Player 2" [ref=e145] [cursor=pointer]
          - generic [ref=e154]:
            - generic [ref=e155]:
              - paragraph [ref=e156]: Team B
              - button "Lock pair" [ref=e157] [cursor=pointer]
            - generic [ref=e158]:
              - button "Host Player 3" [ref=e159] [cursor=pointer]
              - button "Host Player 4" [ref=e168] [cursor=pointer]
        - generic [ref=e177]:
          - generic [ref=e178]:
            - paragraph [ref=e179]: Round setup is saved
            - paragraph [ref=e180]: You can leave this screen and return without losing the court layout.
          - button "Saved ✓" [disabled]
      - generic [ref=e181]:
        - generic [ref=e182]:
          - paragraph [ref=e183]: Pre-Round Check
          - paragraph [ref=e184]: Confirm the round time and hall sound before players begin.
        - generic [ref=e185]:
          - generic [ref=e186]:
            - generic [ref=e191]:
              - paragraph [ref=e192]: Round timer
              - paragraph [ref=e193]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e194]: 08:00
          - generic [ref=e195]:
            - button "− 1 min" [ref=e196] [cursor=pointer]
            - button "+ 1 min" [ref=e197] [cursor=pointer]
        - generic [ref=e199]:
          - generic [ref=e200]:
            - paragraph [ref=e201]: Audio & announcements check
            - paragraph [ref=e202]: "Current KOTC announcement: “5, 4, 3, 2, 1. Hand in your scores.” No other automatic round warnings."
          - button "Test Full Announcement" [ref=e203] [cursor=pointer]
        - button "START ROUND 1" [ref=e204] [cursor=pointer]
      - button "Back to Setup" [ref=e205] [cursor=pointer]
      - button "Restore Original Draw" [ref=e206] [cursor=pointer]
```

# Test source

```ts
  1   | import { test,expect } from '@playwright/test';
  2   | 
  3   | const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  4   | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  5   | const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  6   | 
  7   | function createModel({failFirstScore=false,isAdmin=false}={}){
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
  19  |   const contactDirectory={
  20  |     'player-1':{phone:'0850000001',emergency_name:'Emergency One',emergency_relationship:'Partner',emergency_mobile:'0860000001'},
  21  |     'player-2':{phone:'0850000002',emergency_name:'Emergency Two',emergency_relationship:'Spouse',emergency_mobile:'0860000002'},
  22  |     'player-3':{phone:'0850000003',emergency_name:'Emergency Three',emergency_relationship:'Sibling',emergency_mobile:'0860000003'},
  23  |     'player-4':{phone:'0850000004',emergency_name:'Emergency Four',emergency_relationship:'Friend',emergency_mobile:'0860000004'},
  24  |   };
  25  |   const state=()=>({session,participants,rounds:[round],slots,matches:[match],fixedPairs:[],contactDirectory:{},currentAccessRole:isAdmin?'admin':'session_host',isAdmin});
  26  |   const handle=async(name,body)=>{
  27  |     calls.push({name,body});
  28  |     if(name==='getKotcV2State')return state();
  29  |     if(name==='getKotcContacts')return {success:true,contactDirectory};
  30  |     if(name==='manageKotcSessionAccess')return {__status:403,error:'Platform admin access required'};
  31  |     if(name==='kotcResultsShare')return {success:true,token:'delegated-live-token'};
  32  |     if(name==='manageKotcScorerLinks')return {success:true,token:'delegated-score-token'};
  33  |     if(name==='kotcTimer')return {success:true,state:{roundId:round.id,durationSeconds:480,remainingSeconds:480,running:false,deadlineAt:null,lastAction:body.action||'get'}};
  34  |     if(name==='kotcCommand'&&body.commandType==='host_claim_score')return {success:true,hostAuthority:true,displacedScorer:false};
  35  |     if(name==='startKotcRound'||(name==='kotcCommand'&&body.commandType==='start_proposed_round')){
  36  |       await sleep(80);round.status='started';round.started_at=new Date().toISOString();session.status='in_progress';session.revision++;session.actual_first_round_start=round.started_at;return {success:true,session,round};
  37  |     }
  38  |     if(name==='saveKotcScore'||(name==='kotcCommand'&&body.commandType==='complete_match')){
  39  |       if(failFirstScore&&!failedScoreOnce){failedScoreOnce=true;return {__status:503,error:'Temporary hall network interruption'};}
  40  |       await sleep(60);match.team_a_score=Number(body.teamAScore);match.team_b_score=Number(body.teamBScore);match.winner_side=match.team_a_score>match.team_b_score?'A':'B';match.status='completed';match.revision++;return {success:true,match};
  41  |     }
  42  |     return {success:true,session};
  43  |   };
  44  |   return {session,participants,round,match,calls,state,handle};
  45  | }
  46  | 
  47  | async function install(page,model){
  48  |   await page.route('**/api/apps/**',async route=>{
  49  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  50  |     if(!url.pathname.includes(marker))return json(route,[]);
  51  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  52  |     let body={};try{body=req.postDataJSON()||{};}catch{}
  53  |     const out=await model.handle(name,body);
  54  |     if(out?.__status)return json(route,{error:out.error},out.__status);
  55  |     return json(route,out);
  56  |   });
  57  | }
  58  | 
  59  | test.use({viewport:{width:390,height:844}});
  60  | 
  61  | test('delegated host: session-only controls, attendee contacts, links and keyboard scoring',async({page})=>{
  62  |   const model=createModel();await install(page,model);
  63  |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  64  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 ready');
  65  |   await expect(page.getByTestId('kotc-next-action')).toContainText('check the 1 court assignments');
  66  | 
  67  |   // Session-only contact access: four attendees are visible, a non-roster record is not.
  68  |   await page.getByTestId('kotc-session-menu').click();
  69  |   await page.getByRole('button',{name:'Contacts'}).click();
  70  |   await page.getByTestId('kotc-contact-search').fill('Host Player 1');
  71  |   const contacts=page.getByTestId('kotc-contact-directory');
  72  |   await expect(contacts.getByText('Host Player 1',{exact:true})).toBeVisible();
  73  |   await expect(contacts.getByText('Host Player 2',{exact:true})).toHaveCount(0);
  74  |   const memberCall=page.locator('a[href="tel:0850000001"]');const emergencyCall=page.locator('a[href="tel:0860000001"]');
  75  |   await expect(memberCall).toBeVisible();await expect(emergencyCall).toBeVisible();
  76  |   expect((await memberCall.boundingBox())?.height||0).toBeGreaterThanOrEqual(40);
  77  |   await expect(contacts.getByText('Emergency One')).toBeVisible();
  78  |   await expect(contacts.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  79  |   await page.getByTestId('kotc-contact-search').fill('');
  80  | 
  81  |   // Delegated host can prepare player/public links but cannot appoint another host.
> 82  |   await page.getByText('Session Links & Access').click();
      |                                                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  83  |   await expect(page.getByText('Live Player View',{exact:true})).toBeVisible();
  84  |   await expect(page.getByText('Player Scoring Link',{exact:true})).toBeVisible();
  85  |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  86  |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  87  |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  88  | 
  89  |   // Close the menu and run the sporting action as a host.
  90  |   await page.getByTestId('kotc-session-menu').click();
  91  |   await page.getByTestId('kotc-start-round').click();
  92  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  93  | 
  94  |   // Simulate real keyboard entry rather than programmatic value injection.
  95  |   // KOTC pickleball score boxes are physically limited to two digits.
  96  |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  97  |   await a.focus();await page.keyboard.type('123');await expect(a).toHaveValue('12');
  98  |   await a.fill('');await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  99  |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  100 |   const save=page.getByTestId('kotc-complete-1');
  101 |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  102 |   await save.click();
  103 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  104 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
  105 | 
  106 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  107 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  108 | });
  109 | 
  110 | test('super admin test-mode tools stay local until the real sporting save',async({page})=>{
  111 |   const model=createModel({isAdmin:true});model.session.exclude_from_aggregates=true;await install(page,model);
  112 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  113 |   await expect(page.getByTestId('kotc-sound-check')).toBeVisible();
  114 |   const callsBeforeSound=model.calls.length;
  115 |   await page.getByTestId('kotc-sound-check').getByRole('button',{name:'Test Sound'}).click();
  116 |   await page.waitForTimeout(120);
  117 |   expect(model.calls.length,'Sound check must be device-local and make no Base44 call').toBe(callsBeforeSound);
  118 | 
  119 |   await page.getByTestId('kotc-start-round').click();
  120 |   await expect(page.getByTestId('kotc-fill-test-scores')).toBeVisible({timeout:1800});
  121 |   const savesBefore=model.calls.filter(c=>c.name==='saveKotcScore').length;
  122 |   await page.getByTestId('kotc-fill-test-scores').click();
  123 |   await expect(page.getByTestId('kotc-score-1-a')).toHaveValue('11');
  124 |   await expect(page.getByTestId('kotc-score-1-b')).toHaveValue('6');
  125 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length,'Fill Test Scores must not save anything itself').toBe(savesBefore);
  126 |   await page.getByTestId('kotc-complete-1').click();
  127 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–6',{timeout:1800});
  128 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length).toBe(savesBefore+1);
  129 | });
  130 | 
  131 | test('session host never sees Super Admin test tools even on a test-flagged session',async({page})=>{
  132 |   const model=createModel();model.session.exclude_from_aggregates=true;model.session.demo_mode=true;await install(page,model);
  133 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  134 |   await page.getByTestId('kotc-start-round').click();
  135 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  136 |   await expect(page.getByTestId('kotc-fill-test-scores')).toHaveCount(0);
  137 | });
  138 | 
  139 | test('busy-hall recovery: failed score save preserves keystrokes and retries safely',async({page})=>{
  140 |   const model=createModel({failFirstScore:true});await install(page,model);
  141 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  142 |   await page.getByTestId('kotc-start-round').click();
  143 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  144 | 
  145 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  146 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  147 |   await page.getByTestId('kotc-complete-1').click();
  148 | 
  149 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Save failed — your score is still on screen',{timeout:1800});
  150 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  151 |   await expect(page.getByTestId('kotc-complete-1')).toContainText('Retry Save');
  152 |   await page.getByTestId('kotc-complete-1').click();
  153 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
  154 |   expect(model.match.revision).toBe(1);
  155 | });
  156 | 
```