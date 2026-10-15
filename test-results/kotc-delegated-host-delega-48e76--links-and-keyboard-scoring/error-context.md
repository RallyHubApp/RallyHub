# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> delegated host: session-only controls, attendee contacts, links and keyboard scoring
- Location: e2e/kotc-delegated-host.spec.mjs:61:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-next-action')
Expected substring: "review the 1 results"
Received string:    "What happens nextRound 1 scores completeNext: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('kotc-next-action') with timeout 3000ms
  - waiting for getByTestId('kotc-next-action')
    10 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-next-action" class="rounded-xl border p-3 border-green-500/30 bg-green-500/10" data-source-location="src/components/kotc/KotcV2SessionView.jsx:319:14">…</div>
       - unexpected value "What happens nextRound 1 scores completeNext: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."

```

```yaml
- paragraph: What happens next
- paragraph: Round 1 scores complete
- paragraph: "Next: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."
```

# Test source

```ts
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
  82  |   await page.getByText('Player Link, Broadcasts & Access').click();
  83  |   await expect(page.getByText('KOTC Player Link',{exact:true})).toBeVisible();
  84  |   await expect(page.getByText('Player Link scoring — one scorer per court')).toHaveCount(0);
  85  |   await expect(page.getByText('Player scoring',{exact:true})).toBeVisible();
  86  |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  87  |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  88  |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  89  | 
  90  |   // Close the menu and run the sporting action as a host.
  91  |   await page.getByTestId('kotc-session-menu').click();
  92  |   await page.getByTestId('kotc-start-round').click();
  93  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  94  | 
  95  |   // Simulate real keyboard entry rather than programmatic value injection.
  96  |   // KOTC pickleball score boxes are physically limited to two digits.
  97  |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  98  |   await a.focus();await page.keyboard.type('123');await expect(a).toHaveValue('12');
  99  |   await a.fill('');await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  100 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  101 |   const save=page.getByTestId('kotc-complete-1');
  102 |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  103 |   await save.click();
  104 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
> 105 |   await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');
      |                                                      ^ Error: expect(locator).toContainText(expected) failed
  106 | 
  107 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  108 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  109 | });
  110 | 
  111 | test('super admin test-mode tools stay local until the real sporting save',async({page})=>{
  112 |   const model=createModel({isAdmin:true});model.session.exclude_from_aggregates=true;await install(page,model);
  113 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  114 |   await expect(page.getByTestId('kotc-sound-check')).toBeVisible();
  115 |   const callsBeforeSound=model.calls.length;
  116 |   await page.getByTestId('kotc-sound-check').getByRole('button',{name:'Test Full Announcement'}).click();
  117 |   await page.waitForTimeout(120);
  118 |   expect(model.calls.length,'Sound check must be device-local and make no Base44 call').toBe(callsBeforeSound);
  119 | 
  120 |   await page.getByTestId('kotc-start-round').click();
  121 |   await expect(page.getByTestId('kotc-fill-test-scores')).toBeVisible({timeout:1800});
  122 |   const savesBefore=model.calls.filter(c=>c.name==='saveKotcScore').length;
  123 |   await page.getByTestId('kotc-fill-test-scores').click();
  124 |   await expect(page.getByTestId('kotc-score-1-a')).toHaveValue('11');
  125 |   await expect(page.getByTestId('kotc-score-1-b')).toHaveValue('6');
  126 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length,'Fill Test Scores must not save anything itself').toBe(savesBefore);
  127 |   await page.getByTestId('kotc-complete-1').click();
  128 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–6',{timeout:1800});
  129 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length).toBe(savesBefore+1);
  130 | });
  131 | 
  132 | test('session host never sees Super Admin test tools even on a test-flagged session',async({page})=>{
  133 |   const model=createModel();model.session.exclude_from_aggregates=true;model.session.demo_mode=true;await install(page,model);
  134 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  135 |   await page.getByTestId('kotc-start-round').click();
  136 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  137 |   await expect(page.getByTestId('kotc-fill-test-scores')).toHaveCount(0);
  138 | });
  139 | 
  140 | test('busy-hall recovery: failed score save preserves keystrokes and retries safely',async({page})=>{
  141 |   const model=createModel({failFirstScore:true});await install(page,model);
  142 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  143 |   await page.getByTestId('kotc-start-round').click();
  144 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  145 | 
  146 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  147 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  148 |   await page.getByTestId('kotc-complete-1').click();
  149 | 
  150 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Save failed — your score is still on screen',{timeout:1800});
  151 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  152 |   await expect(page.getByTestId('kotc-complete-1')).toContainText('Retry Save');
  153 |   await page.getByTestId('kotc-complete-1').click();
  154 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
  155 |   expect(model.match.revision).toBe(1);
  156 | });
  157 | 
```