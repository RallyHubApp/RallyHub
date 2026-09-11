# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live.spec.mjs >> finished KOTC host management: secure menu, local share, explicit email and post-event correction
- Location: e2e/kotc-public-live.spec.mjs:61:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Edit Court Result' })

```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e8]: Host results management
      - paragraph [ref=e9]: Review, correct and share this finished session.
    - button "Host Menu" [ref=e10] [cursor=pointer]
  - generic [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Correct Results" [level=2] [ref=e14]
        - paragraph [ref=e15]: Choose a completed round and correct one court. Saving recalculates the standings and podium; historical court assignments do not change.
      - button [ref=e16] [cursor=pointer]
    - button "Round 1" [ref=e18] [cursor=pointer]
  - generic [ref=e19]:
    - button "Hall Display" [ref=e21] [cursor=pointer]
    - paragraph [ref=e22]: King of the Court · Final Results
    - heading "E2E Live KOTC" [level=1] [ref=e25]
    - generic [ref=e26]:
      - generic [ref=e27]: Round 3
      - generic [ref=e28]: COMPLETED
      - generic [ref=e29]: 3 rounds completed
    - paragraph [ref=e30]: These are the final saved results. This link remains available after the session.
  - generic [ref=e31]:
    - heading "Podium" [level=2] [ref=e39]
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]: 🥇
        - paragraph [ref=e43]: Player 01
        - paragraph [ref=e44]: 3W · 0L · +14
      - generic [ref=e45]:
        - generic [ref=e46]: 🥈
        - paragraph [ref=e47]: Guest One
        - paragraph [ref=e48]: 3W · 0L · +10
      - generic [ref=e49]:
        - generic [ref=e50]: 🥉
        - paragraph [ref=e51]: Player 03
        - paragraph [ref=e52]: 2W · 1L · +6
  - generic [ref=e53]:
    - generic [ref=e54]:
      - heading "Final Round · Round 3" [level=2] [ref=e55]
      - generic [ref=e56]: COMPLETED
    - generic [ref=e57]:
      - paragraph [ref=e58]: Bench This Round
      - paragraph [ref=e59]: Player 17 · Guest One
    - generic [ref=e61]:
      - generic [ref=e62]:
        - paragraph [ref=e66]: Court 1
        - generic [ref=e67]: SAVED
      - generic [ref=e68]:
        - generic [ref=e69]: Player 01 & Player 02
        - strong [ref=e70]: "11"
      - generic [ref=e71]: vs
      - generic [ref=e72]:
        - generic [ref=e73]: Player 03 & Player 04
        - strong [ref=e74]: "9"
  - generic [ref=e75]:
    - heading "Final Standings" [level=2] [ref=e83]
    - generic [ref=e84]:
      - generic [ref=e85]: "#"
      - generic [ref=e86]: Player
      - generic [ref=e87]: W
      - generic [ref=e88]: L
      - generic [ref=e89]: Diff
    - generic [ref=e90]:
      - generic [ref=e91]: "1"
      - generic [ref=e92]: Player 01
      - generic [ref=e93]: "3"
      - generic [ref=e94]: "0"
      - generic [ref=e95]: "+14"
    - generic [ref=e96]:
      - generic [ref=e97]: "2"
      - generic [ref=e98]: Guest One
      - generic [ref=e99]: "3"
      - generic [ref=e100]: "0"
      - generic [ref=e101]: "+10"
    - generic [ref=e102]:
      - generic [ref=e103]: "3"
      - generic [ref=e104]: Player 03
      - generic [ref=e105]: "2"
      - generic [ref=e106]: "1"
      - generic [ref=e107]: "+6"
  - generic [ref=e108]:
    - generic [ref=e109]:
      - generic [ref=e110]:
        - heading "Round Results" [level=2] [ref=e111]
        - paragraph [ref=e112]: Choose a completed round to see every court result.
      - generic [ref=e113]: Round 1
    - button "Round 1" [ref=e115] [cursor=pointer]
    - generic [ref=e117]:
      - paragraph [ref=e118]: Court 1
      - generic [ref=e119]:
        - generic [ref=e120]: Player 01 & Player 02
        - strong [ref=e121]: "11"
      - generic [ref=e122]: vs
      - generic [ref=e123]:
        - generic [ref=e124]: Player 03 & Player 04
        - strong [ref=e125]: "7"
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
  54  |   await expect(page.getByText('King of the Court · Final Results')).toBeVisible();
  55  |   await expect(page.getByText('Final Standings')).toBeVisible();
  56  |   await expect(page.getByText('These are the final saved results. This link remains available after the session.')).toBeVisible();
  57  |   await expect(page.getByTestId('public-kotc-podium').getByText('Guest One')).toBeVisible();
  58  |   const callsAtFinish=publicCalls;await new Promise(resolve=>setTimeout(resolve,500));expect(publicCalls,'completed public results must stop polling Base44').toBe(callsAtFinish);
  59  | });
  60  | 
  61  | test('finished KOTC host management: secure menu, local share, explicit email and post-event correction',async({page})=>{
  62  |   const finished=makeState('finished');
  63  |   let correctionCalls=0,emailCalls=0,managementCalls=0,publicCalls=0;
  64  |   const management={canManage:true,role:'admin',sessionId:'session-finished',tournamentId:'tournament-finished',sessionName:'E2E Live KOTC',matches:[{id:'match-r3-c1',round_id:'round-3',round_number:3,court:1,team_a_participant_ids:['p1','p2'],team_b_participant_ids:['p3','p4'],team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9,winner_side:'A',result_method:'normal',revision:1}]};
  65  |   await page.addInitScript(()=>{navigator.share=async payload=>{window.__kotcShared=payload;};});
  66  |   await page.route('**/api/apps/**',async route=>{
  67  |     const request=route.request();const path=new URL(request.url()).pathname;const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
  68  |     if(idx<0)return json(route,[]);
  69  |     const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=request.postDataJSON()||{};}catch{}
  70  |     if(name==='kotcResultsShare'){
  71  |       if(body.action==='management_state'){managementCalls++;return json(route,management);}
  72  |       if(body.action==='email_players'){emailCalls++;return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}
  73  |       publicCalls++;return json(route,{...finished,poll_after_ms:0});
  74  |     }
  75  |     if(name==='kotcCommand'){
  76  |       correctionCalls++;management.matches[0]={...management.matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore),revision:2};
  77  |       finished.current_matches[0]={...finished.current_matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore)};
  78  |       return json(route,{success:true,match:management.matches[0]});
  79  |     }
  80  |     return json(route,{});
  81  |   });
  82  | 
  83  |   await page.goto('/e2e/kotcLiveHarness.html?manage=1');
  84  |   await expect(page.getByTestId('kotc-results-host-menu')).toBeVisible({timeout:1800});
  85  |   expect(managementCalls).toBeGreaterThan(0);
  86  |   await page.getByRole('button',{name:'Host Menu'}).click();
  87  |   const callsBeforeShare=publicCalls+managementCalls+correctionCalls+emailCalls;
  88  |   await page.getByRole('button',{name:'Share Results'}).click();
  89  |   expect(await page.evaluate(()=>window.__kotcShared?.url)).toContain('/kotc-live/e2e-live-token');
  90  |   expect(publicCalls+managementCalls+correctionCalls+emailCalls,'Share Results must be local').toBe(callsBeforeShare);
  91  | 
  92  |   await page.getByRole('button',{name:'Send to Players'}).click();
  93  |   expect(emailCalls).toBe(1);
  94  | 
  95  |   await page.getByRole('button',{name:'Correct Results'}).click();
  96  |   await expect(page.getByTestId('kotc-results-correction-panel')).toBeVisible();
> 97  |   await page.getByRole('button',{name:'Edit Court Result'}).click();
      |                                                             ^ Error: locator.click: Test timeout of 45000ms exceeded.
  98  |   const scoreInputs=page.getByTestId('kotc-results-correction-panel').locator('input[type="number"]');
  99  |   await scoreInputs.nth(0).fill('10');await scoreInputs.nth(1).fill('9');
  100 |   await page.getByRole('button',{name:'Save Correction'}).click();
  101 |   await expect.poll(()=>correctionCalls).toBe(1);
  102 |   await expect(page.getByTestId('kotc-results-correction-panel')).toContainText('10');
  103 | });
  104 | 
```