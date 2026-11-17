# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live.spec.mjs >> public KOTC link: assignments → live scores → permanent final results with polling stopped
- Location: e2e/kotc-public-live.spec.mjs:25:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Full individual rankings are not published here.')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Full individual rankings are not published here.') with timeout 3000ms
  - waiting for getByText('Full individual rankings are not published here.')

```

```yaml
- banner:
  - heading "King of the Court" [level=1]
  - paragraph: E2E Live KOTC · Final results
- navigation "Player session navigation":
  - button "Results"
  - button "My KOTC"
  - button "Leaderboard"
  - button "Players"
  - button "Rounds"
  - button "Event Info"
  - button "Help & Guide"
- img
- text: Player View
- button "Auto" [pressed]:
  - img
  - text: Auto
- button "Light":
  - img
  - text: Light
- button "Hall":
  - img
  - text: Hall
- button "Dark":
  - img
  - text: Dark
- main:
  - text: Player view Round 3 COMPLETED
  - paragraph: Session complete · Final results
  - heading "Your Individual Results" [level=2]
  - paragraph: Choose your name to see your played rounds without a verification code. These are the published court results.
  - combobox "Choose your player name":
    - option "Choose your name" [selected]
  - img
  - paragraph: Final Podium
  - list "Final podium":
    - 'listitem "1st place: Player 01"':
      - text: 🥇
      - paragraph: 1st
      - paragraph: Player 01
      - paragraph: 3W · 0L · +14
    - 'listitem "2nd place: Guest One"':
      - text: 🥈
      - paragraph: 2nd
      - paragraph: Guest One
      - paragraph: 3W · 0L · +10
    - 'listitem "3rd place: Player 03"':
      - text: 🥉
      - paragraph: 3rd
      - paragraph: Player 03
      - paragraph: 2W · 1L · +6
- contentinfo:
  - link "Powered by RallyHub":
    - /url: https://rallyhub.ie/
    - text: Powered by
    - img "RallyHub"
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
  49  |   await page.getByRole('button',{name:'Leaderboard',exact:true}).click();
  50  |   await expect(page.getByText('Live Standings')).toBeVisible();
  51  | 
  52  |   await page.getByRole('button',{name:'Live',exact:true}).click();
  53  |   phase='finished';
  54  |   await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  55  |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  56  |   await page.getByRole('button',{name:'Results',exact:true}).click();
  57  |   await expect(page.getByTestId('public-kotc-podium').getByText('Final Podium',{exact:true})).toBeVisible();
> 58  |   await expect(page.getByText('Full individual rankings are not published here.')).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  59  |   await expect(page.getByText('Live Standings')).toHaveCount(0);
  60  |   await expect(page.getByText('Final Standings',{exact:true})).toHaveCount(0);
  61  |   await expect(page.getByRole('button',{name:'Leaderboard',exact:true})).toBeVisible();
  62  |   await page.getByRole('button',{name:'Leaderboard',exact:true}).click();
  63  |   await expect(page.getByText('Live Standings')).toBeVisible();
  64  |   await page.getByRole('button',{name:'Results',exact:true}).click();
  65  |   await expect(page.getByTestId('public-kotc-current-round')).toHaveCount(0);
  66  |   await page.getByRole('button',{name:'Rounds',exact:true}).click();
  67  |   await expect(page.getByTestId('public-kotc-round-history')).toBeVisible();
  68  |   await page.getByRole('button',{name:'Results',exact:true}).click();
  69  |   await expect(page.getByTestId('public-kotc-podium').getByText('Guest One')).toBeVisible();
  70  |   const podiumItems=page.getByTestId('public-kotc-podium').locator('[role="listitem"]');
  71  |   await expect(podiumItems).toHaveCount(3);
  72  |   await expect(podiumItems.nth(0)).toHaveAttribute('aria-label',/1st place/);
  73  |   await expect(podiumItems.nth(1)).toHaveAttribute('aria-label',/2nd place/);
  74  |   await expect(podiumItems.nth(2)).toHaveAttribute('aria-label',/3rd place/);
  75  |   const podiumBoxes=await Promise.all([0,1,2].map(i=>podiumItems.nth(i).boundingBox()));
  76  |   expect(podiumBoxes[0]?.height||0,'winner podium must be tallest').toBeGreaterThan(podiumBoxes[1]?.height||0);
  77  |   expect(podiumBoxes[1]?.height||0,'second-place podium must be taller than third').toBeGreaterThan(podiumBoxes[2]?.height||0);
  78  |   const callsAtFinish=publicCalls;await new Promise(resolve=>setTimeout(resolve,500));expect(publicCalls,'completed public results must stop polling Base44').toBe(callsAtFinish);
  79  | });
  80  | 
  81  | test('finished KOTC host management: secure menu, local share, explicit email and post-event correction',async({page})=>{
  82  |   const finished=makeState('finished');
  83  |   let correctionCalls=0,emailCalls=0,managementCalls=0,publicCalls=0;
  84  |   const management={canManage:true,role:'admin',sessionId:'session-finished',tournamentId:'tournament-finished',sessionName:'E2E Live KOTC',standings:finished.standings,matches:[{id:'match-r1-c1',round_id:'round-1',round_number:1,court:1,team_a_participant_ids:['p1','p2'],team_b_participant_ids:['p3','p4'],team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9,winner_side:'A',result_method:'normal',revision:1}]};
  85  |   await page.addInitScript(()=>{navigator.share=async payload=>{window.__kotcShared=payload;};});
  86  |   await page.route('**/api/apps/**',async route=>{
  87  |     const request=route.request();const path=new URL(request.url()).pathname;const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
  88  |     if(idx<0)return json(route,[]);
  89  |     const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=request.postDataJSON()||{};}catch{}
  90  |     if(name==='kotcResultsShare'){
  91  |       if(body.action==='management_state'){managementCalls++;return json(route,management);}
  92  |       if(body.action==='email_players'){emailCalls++;return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}
  93  |       publicCalls++;return json(route,{...finished,poll_after_ms:0});
  94  |     }
  95  |     if(name==='kotcCommand'){
  96  |       correctionCalls++;management.matches[0]={...management.matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore),revision:2};
  97  |       finished.current_matches[0]={...finished.current_matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore)};
  98  |       return json(route,{success:true,match:management.matches[0]});
  99  |     }
  100 |     return json(route,{});
  101 |   });
  102 | 
  103 |   await page.goto('/e2e/kotcLiveHarness.html?manage=1');
  104 |   await expect(page.getByTestId('kotc-results-host-menu')).toBeVisible({timeout:1800});
  105 |   await expect(page.getByTestId('kotc-host-final-standings')).toContainText('Full Final Standings · Host Only');
  106 |   await expect(page.getByTestId('kotc-host-final-standings')).toContainText('Guest One');
  107 |   await expect(page.getByText('Final Standings',{exact:true})).toHaveCount(0);
  108 |   expect(managementCalls).toBeGreaterThan(0);
  109 |   await page.getByRole('button',{name:'Host Menu'}).click();
  110 |   const callsBeforeShare=publicCalls+managementCalls+correctionCalls+emailCalls;
  111 |   await page.getByRole('button',{name:'Share Results'}).click();
  112 |   expect(await page.evaluate(()=>window.__kotcShared?.url)).toContain('/kotc-live/e2e-live-token');
  113 |   expect(publicCalls+managementCalls+correctionCalls+emailCalls,'Share Results must be local').toBe(callsBeforeShare);
  114 | 
  115 |   await page.getByRole('button',{name:'Send to Players'}).click();
  116 |   expect(emailCalls).toBe(1);
  117 | 
  118 |   await page.getByRole('button',{name:'Correct Results'}).click();
  119 |   await expect(page.getByTestId('kotc-results-correction-panel')).toBeVisible();
  120 |   await page.getByRole('button',{name:'Edit Court Result'}).click();
  121 |   const scoreInputs=page.getByTestId('kotc-results-correction-panel').locator('input[type="number"]');
  122 |   await scoreInputs.nth(0).fill('10');await scoreInputs.nth(1).fill('9');
  123 |   await page.getByRole('button',{name:'Save Correction'}).click();
  124 |   await expect.poll(()=>correctionCalls).toBe(1);
  125 |   await expect(page.getByTestId('kotc-results-correction-panel')).toContainText('10');
  126 | });
  127 | 
```