# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live.spec.mjs >> finished KOTC host management: secure menu, local share, explicit email and post-event correction
- Location: e2e/kotc-public-live.spec.mjs:72:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('kotc-results-host-menu')
Expected: visible
Timeout: 1800ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('kotc-results-host-menu') with timeout 1800ms
  - waiting for getByTestId('kotc-results-host-menu')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4   | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  5   | 
  6   | function makeState(phase){
  7   |   const common={
  8   |     completed_rounds: phase==='ready'?0:phase==='live'?0:3,
  9   |     bench:['Player 17','Guest One'],
  10  |     matches: phase==='finished'?[{round_number:1,court:1,team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7}]:[],
  11  |     standings:[
  12  |       {id:'p1',rank:1,name:'Player 01',wins:3,losses:0,differential:14},
  13  |       {id:'p2',rank:2,name:'Guest One',wins:3,losses:0,differential:10},
  14  |       {id:'p3',rank:3,name:'Player 03',wins:2,losses:1,differential:6},
  15  |     ],
  16  |     timer:{remainingSeconds:420,running:phase==='live',deadlineAt:phase==='live'?new Date(Date.now()+420000).toISOString():null},
  17  |   };
  18  |   if(phase==='ready')return {...common,session:{name:'E2E Live KOTC',status:'ready',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'proposed'},current_matches:[{round_number:1,court:1,status:'scheduled',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'] }],podium:[]};
  19  |   if(phase==='live')return {...common,session:{name:'E2E Live KOTC',status:'in_progress',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'started'},current_matches:[{round_number:1,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},{round_number:1,court:2,status:'in_progress',team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:8,team_b_score:8}],podium:[]};
  20  |   return {...common,session:{name:'E2E Live KOTC',status:'completed',current_round_number:3,scoring_mode:'timed'},current_round:{round_number:3,status:'completed'},current_matches:[{round_number:3,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9}],podium:common.standings.slice(0,3)};
  21  | }
  22  | 
  23  | test.use({ viewport:{width:390,height:844} });
  24  | 
  25  | test('public KOTC link: assignments → live scores → permanent final results with polling stopped', async ({page})=>{
  26  |   let phase='ready';let publicCalls=0;
  27  |   await page.route('**/api/apps/**', async route=>{
  28  |     const request=route.request();
  29  |     const path=new URL(request.url()).pathname;
  30  |     const marker=`/api/apps/${APP_ID}/functions/`;
  31  |     const idx=path.indexOf(marker);
  32  |     if(idx>=0){
  33  |       const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);
  34  |       if(name==='kotcResultsShare'){publicCalls++;return json(route,{...makeState(phase),poll_after_ms:phase==='finished'?0:12000});}
  35  |     }
  36  |     return json(route,[]);
  37  |   });
  38  | 
  39  |   await page.goto('/e2e/kotcLiveHarness.html');
  40  |   await expect(page.getByText('Round Ready · Round 1')).toBeVisible({timeout:1800});
  41  |   await expect(page.getByTestId('kotc-results-host-menu')).toHaveCount(0);
  42  |   await expect(page.getByTestId('public-kotc-court-1')).toContainText('Players assigned');
  43  | 
  44  |   phase='live';
  45  |   await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  46  |   await expect(page.getByText('On Court Now · Round 1')).toBeVisible({timeout:1800});
  47  |   await expect(page.getByTestId('public-kotc-court-1')).toContainText('11');
  48  |   await expect(page.getByTestId('public-kotc-court-2')).toContainText('8');
  49  |   await expect(page.getByText('Live Standings')).toBeVisible();
  50  | 
  51  |   phase='finished';
  52  |   await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  53  |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  54  |   await expect(page.getByText('Event Summary')).toBeVisible();
  55  |   await expect(page.getByText('Final Podium')).toBeVisible();
  56  |   await expect(page.getByText('Full individual rankings are not published here.')).toBeVisible();
  57  |   await expect(page.getByText('Live Standings')).toHaveCount(0);
  58  |   await expect(page.getByTestId('public-kotc-current-round')).toHaveCount(0);
  59  |   await expect(page.getByTestId('public-kotc-round-history')).toBeVisible();
  60  |   await expect(page.getByTestId('public-kotc-podium').getByText('Guest One')).toBeVisible();
  61  |   const podiumItems=page.getByTestId('public-kotc-podium').locator('[role="listitem"]');
  62  |   await expect(podiumItems).toHaveCount(3);
  63  |   await expect(podiumItems.nth(0)).toHaveAttribute('aria-label',/1st place/);
  64  |   await expect(podiumItems.nth(1)).toHaveAttribute('aria-label',/2nd place/);
  65  |   await expect(podiumItems.nth(2)).toHaveAttribute('aria-label',/3rd place/);
  66  |   const podiumBoxes=await Promise.all([0,1,2].map(i=>podiumItems.nth(i).boundingBox()));
  67  |   expect(podiumBoxes[0]?.height||0,'winner podium must be tallest').toBeGreaterThan(podiumBoxes[1]?.height||0);
  68  |   expect(podiumBoxes[1]?.height||0,'second-place podium must be taller than third').toBeGreaterThan(podiumBoxes[2]?.height||0);
  69  |   const callsAtFinish=publicCalls;await new Promise(resolve=>setTimeout(resolve,500));expect(publicCalls,'completed public results must stop polling Base44').toBe(callsAtFinish);
  70  | });
  71  | 
  72  | test('finished KOTC host management: secure menu, local share, explicit email and post-event correction',async({page})=>{
  73  |   const finished=makeState('finished');
  74  |   let correctionCalls=0,emailCalls=0,managementCalls=0,publicCalls=0;
  75  |   const management={canManage:true,role:'admin',sessionId:'session-finished',tournamentId:'tournament-finished',sessionName:'E2E Live KOTC',matches:[{id:'match-r1-c1',round_id:'round-1',round_number:1,court:1,team_a_participant_ids:['p1','p2'],team_b_participant_ids:['p3','p4'],team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9,winner_side:'A',result_method:'normal',revision:1}]};
  76  |   await page.addInitScript(()=>{navigator.share=async payload=>{window.__kotcShared=payload;};});
  77  |   await page.route('**/api/apps/**',async route=>{
  78  |     const request=route.request();const path=new URL(request.url()).pathname;const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
  79  |     if(idx<0)return json(route,[]);
  80  |     const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=request.postDataJSON()||{};}catch{}
  81  |     if(name==='kotcResultsShare'){
  82  |       if(body.action==='management_state'){managementCalls++;return json(route,management);}
  83  |       if(body.action==='email_players'){emailCalls++;return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}
  84  |       publicCalls++;return json(route,{...finished,poll_after_ms:0});
  85  |     }
  86  |     if(name==='kotcCommand'){
  87  |       correctionCalls++;management.matches[0]={...management.matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore),revision:2};
  88  |       finished.current_matches[0]={...finished.current_matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore)};
  89  |       return json(route,{success:true,match:management.matches[0]});
  90  |     }
  91  |     return json(route,{});
  92  |   });
  93  | 
  94  |   await page.goto('/e2e/kotcLiveHarness.html?manage=1');
> 95  |   await expect(page.getByTestId('kotc-results-host-menu')).toBeVisible({timeout:1800});
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  96  |   expect(managementCalls).toBeGreaterThan(0);
  97  |   await page.getByRole('button',{name:'Host Menu'}).click();
  98  |   const callsBeforeShare=publicCalls+managementCalls+correctionCalls+emailCalls;
  99  |   await page.getByRole('button',{name:'Share Results'}).click();
  100 |   expect(await page.evaluate(()=>window.__kotcShared?.url)).toContain('/kotc-live/e2e-live-token');
  101 |   expect(publicCalls+managementCalls+correctionCalls+emailCalls,'Share Results must be local').toBe(callsBeforeShare);
  102 | 
  103 |   await page.getByRole('button',{name:'Send to Players'}).click();
  104 |   expect(emailCalls).toBe(1);
  105 | 
  106 |   await page.getByRole('button',{name:'Correct Results'}).click();
  107 |   await expect(page.getByTestId('kotc-results-correction-panel')).toBeVisible();
  108 |   await page.getByRole('button',{name:'Edit Court Result'}).click();
  109 |   const scoreInputs=page.getByTestId('kotc-results-correction-panel').locator('input[type="number"]');
  110 |   await scoreInputs.nth(0).fill('10');await scoreInputs.nth(1).fill('9');
  111 |   await page.getByRole('button',{name:'Save Correction'}).click();
  112 |   await expect.poll(()=>correctionCalls).toBe(1);
  113 |   await expect(page.getByTestId('kotc-results-correction-panel')).toContainText('10');
  114 | });
  115 | 
```