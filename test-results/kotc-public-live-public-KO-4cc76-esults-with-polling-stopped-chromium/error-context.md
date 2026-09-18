# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live.spec.mjs >> public KOTC link: assignments → live scores → permanent final results with polling stopped
- Location: e2e/kotc-public-live.spec.mjs:25:1

# Error details

```
Error: winner podium must be tallest

expect(received).toBeGreaterThan(expected)

Expected: > 190
Received:   190
```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - button "Hall Display" [ref=e7] [cursor=pointer]
    - paragraph [ref=e8]: King of the Court · Final Results
    - heading "E2E Live KOTC" [level=1] [ref=e11]
    - generic [ref=e12]:
      - generic [ref=e13]: Round 3
      - generic [ref=e14]: COMPLETED
      - generic [ref=e15]: 3 rounds completed
    - paragraph [ref=e16]: These are the final saved results. This link remains available after the session.
  - generic [ref=e17]:
    - heading "Podium" [level=2] [ref=e25]
    - list "Final podium" [ref=e26]:
      - 'listitem "2nd place: Guest One" [ref=e27]':
        - generic [ref=e28]: 🥈
        - paragraph [ref=e29]: 2nd place
        - paragraph [ref=e30]: Guest One
        - paragraph [ref=e31]: 3W · 0L · +10
        - generic [ref=e32]: "2"
      - 'listitem "1st place: Player 01" [ref=e34]':
        - generic [ref=e35]: 🥇
        - paragraph [ref=e36]: 1st place
        - paragraph [ref=e37]: Player 01
        - paragraph [ref=e38]: 3W · 0L · +14
        - generic [ref=e39]: "1"
      - 'listitem "3rd place: Player 03" [ref=e41]':
        - generic [ref=e42]: 🥉
        - paragraph [ref=e43]: 3rd place
        - paragraph [ref=e44]: Player 03
        - paragraph [ref=e45]: 2W · 1L · +6
        - generic [ref=e46]: "3"
  - generic [ref=e48]:
    - generic [ref=e49]:
      - heading "Final Round · Round 3" [level=2] [ref=e50]
      - generic [ref=e51]: COMPLETED
    - generic [ref=e52]:
      - paragraph [ref=e53]: Bench This Round
      - paragraph [ref=e54]: Player 17 · Guest One
    - generic [ref=e56]:
      - generic [ref=e57]:
        - paragraph [ref=e61]: Court 1
        - generic [ref=e62]: SAVED
      - generic [ref=e63]:
        - generic [ref=e64]: Player 01 & Player 02
        - strong [ref=e65]: "11"
      - generic [ref=e66]: vs
      - generic [ref=e67]:
        - generic [ref=e68]: Player 03 & Player 04
        - strong [ref=e69]: "9"
  - generic [ref=e70]:
    - heading "Final Standings" [level=2] [ref=e78]
    - generic [ref=e79]:
      - generic [ref=e80]: "#"
      - generic [ref=e81]: Player
      - generic [ref=e82]: W
      - generic [ref=e83]: L
      - generic [ref=e84]: Diff
    - generic [ref=e85]:
      - generic [ref=e86]: "1"
      - generic [ref=e87]: Player 01
      - generic [ref=e88]: "3"
      - generic [ref=e89]: "0"
      - generic [ref=e90]: "+14"
    - generic [ref=e91]:
      - generic [ref=e92]: "2"
      - generic [ref=e93]: Guest One
      - generic [ref=e94]: "3"
      - generic [ref=e95]: "0"
      - generic [ref=e96]: "+10"
    - generic [ref=e97]:
      - generic [ref=e98]: "3"
      - generic [ref=e99]: Player 03
      - generic [ref=e100]: "2"
      - generic [ref=e101]: "1"
      - generic [ref=e102]: "+6"
  - generic [ref=e103]:
    - generic [ref=e104]:
      - generic [ref=e105]:
        - heading "Round Results" [level=2] [ref=e106]
        - paragraph [ref=e107]: Choose a completed round to see every court result.
      - generic [ref=e108]: Round 1
    - button "Round 1" [ref=e110] [cursor=pointer]
    - generic [ref=e112]:
      - paragraph [ref=e113]: Court 1
      - generic [ref=e114]:
        - generic [ref=e115]: Player 01 & Player 02
        - strong [ref=e116]: "11"
      - generic [ref=e117]: vs
      - generic [ref=e118]:
        - generic [ref=e119]: Player 03 & Player 04
        - strong [ref=e120]: "7"
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
  58  |   const podiumItems=page.getByTestId('public-kotc-podium').locator('[role="listitem"]');
  59  |   await expect(podiumItems).toHaveCount(3);
  60  |   await expect(podiumItems.nth(0)).toHaveAttribute('aria-label',/2nd place/);
  61  |   await expect(podiumItems.nth(1)).toHaveAttribute('aria-label',/1st place/);
  62  |   await expect(podiumItems.nth(2)).toHaveAttribute('aria-label',/3rd place/);
  63  |   const podiumBoxes=await Promise.all([0,1,2].map(i=>podiumItems.nth(i).boundingBox()));
> 64  |   expect(podiumBoxes[1]?.height||0,'winner podium must be tallest').toBeGreaterThan(podiumBoxes[0]?.height||0);
      |                                                                     ^ Error: winner podium must be tallest
  65  |   expect(podiumBoxes[0]?.height||0,'second-place podium must be taller than third').toBeGreaterThan(podiumBoxes[2]?.height||0);
  66  |   const callsAtFinish=publicCalls;await new Promise(resolve=>setTimeout(resolve,500));expect(publicCalls,'completed public results must stop polling Base44').toBe(callsAtFinish);
  67  | });
  68  | 
  69  | test('finished KOTC host management: secure menu, local share, explicit email and post-event correction',async({page})=>{
  70  |   const finished=makeState('finished');
  71  |   let correctionCalls=0,emailCalls=0,managementCalls=0,publicCalls=0;
  72  |   const management={canManage:true,role:'admin',sessionId:'session-finished',tournamentId:'tournament-finished',sessionName:'E2E Live KOTC',matches:[{id:'match-r1-c1',round_id:'round-1',round_number:1,court:1,team_a_participant_ids:['p1','p2'],team_b_participant_ids:['p3','p4'],team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9,winner_side:'A',result_method:'normal',revision:1}]};
  73  |   await page.addInitScript(()=>{navigator.share=async payload=>{window.__kotcShared=payload;};});
  74  |   await page.route('**/api/apps/**',async route=>{
  75  |     const request=route.request();const path=new URL(request.url()).pathname;const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
  76  |     if(idx<0)return json(route,[]);
  77  |     const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=request.postDataJSON()||{};}catch{}
  78  |     if(name==='kotcResultsShare'){
  79  |       if(body.action==='management_state'){managementCalls++;return json(route,management);}
  80  |       if(body.action==='email_players'){emailCalls++;return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}
  81  |       publicCalls++;return json(route,{...finished,poll_after_ms:0});
  82  |     }
  83  |     if(name==='kotcCommand'){
  84  |       correctionCalls++;management.matches[0]={...management.matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore),revision:2};
  85  |       finished.current_matches[0]={...finished.current_matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore)};
  86  |       return json(route,{success:true,match:management.matches[0]});
  87  |     }
  88  |     return json(route,{});
  89  |   });
  90  | 
  91  |   await page.goto('/e2e/kotcLiveHarness.html?manage=1');
  92  |   await expect(page.getByTestId('kotc-results-host-menu')).toBeVisible({timeout:1800});
  93  |   expect(managementCalls).toBeGreaterThan(0);
  94  |   await page.getByRole('button',{name:'Host Menu'}).click();
  95  |   const callsBeforeShare=publicCalls+managementCalls+correctionCalls+emailCalls;
  96  |   await page.getByRole('button',{name:'Share Results'}).click();
  97  |   expect(await page.evaluate(()=>window.__kotcShared?.url)).toContain('/kotc-live/e2e-live-token');
  98  |   expect(publicCalls+managementCalls+correctionCalls+emailCalls,'Share Results must be local').toBe(callsBeforeShare);
  99  | 
  100 |   await page.getByRole('button',{name:'Send to Players'}).click();
  101 |   expect(emailCalls).toBe(1);
  102 | 
  103 |   await page.getByRole('button',{name:'Correct Results'}).click();
  104 |   await expect(page.getByTestId('kotc-results-correction-panel')).toBeVisible();
  105 |   await page.getByRole('button',{name:'Edit Court Result'}).click();
  106 |   const scoreInputs=page.getByTestId('kotc-results-correction-panel').locator('input[type="number"]');
  107 |   await scoreInputs.nth(0).fill('10');await scoreInputs.nth(1).fill('9');
  108 |   await page.getByRole('button',{name:'Save Correction'}).click();
  109 |   await expect.poll(()=>correctionCalls).toBe(1);
  110 |   await expect(page.getByTestId('kotc-results-correction-panel')).toContainText('10');
  111 | });
  112 | 
```