import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function makeState(phase){
  const common={
    completed_rounds: phase==='ready'?0:phase==='live'?0:3,
    bench:['Player 17','Guest One'],
    matches: phase==='finished'?[{round_number:1,court:1,team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7}]:[],
    standings:[
      {id:'p1',rank:1,name:'Player 01',wins:3,losses:0,differential:14},
      {id:'p2',rank:2,name:'Guest One',wins:3,losses:0,differential:10},
      {id:'p3',rank:3,name:'Player 03',wins:2,losses:1,differential:6},
    ],
    timer:{remainingSeconds:420,running:phase==='live',deadlineAt:phase==='live'?new Date(Date.now()+420000).toISOString():null},
  };
  if(phase==='ready')return {...common,session:{name:'E2E Live KOTC',status:'ready',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'proposed'},current_matches:[{round_number:1,court:1,status:'scheduled',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'] }],podium:[]};
  if(phase==='live')return {...common,session:{name:'E2E Live KOTC',status:'in_progress',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'started'},current_matches:[{round_number:1,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},{round_number:1,court:2,status:'in_progress',team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:8,team_b_score:8}],podium:[]};
  return {...common,session:{name:'E2E Live KOTC',status:'completed',current_round_number:3,scoring_mode:'timed'},current_round:{round_number:3,status:'completed'},current_matches:[{round_number:3,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9}],podium:common.standings.slice(0,3)};
}

test.use({ viewport:{width:390,height:844} });

test('public KOTC link: assignments → live scores → permanent final results with polling stopped', async ({page})=>{
  let phase='ready';let publicCalls=0;
  await page.route('**/api/apps/**', async route=>{
    const request=route.request();
    const path=new URL(request.url()).pathname;
    const marker=`/api/apps/${APP_ID}/functions/`;
    const idx=path.indexOf(marker);
    if(idx>=0){
      const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);
      if(name==='kotcResultsShare'){publicCalls++;return json(route,{...makeState(phase),poll_after_ms:phase==='finished'?0:12000});}
    }
    return json(route,[]);
  });

  await page.goto('/e2e/kotcLiveHarness.html');
  await expect(page.getByText('Round Ready · Round 1')).toBeVisible({timeout:1800});
  await expect(page.getByTestId('kotc-results-host-menu')).toHaveCount(0);
  await expect(page.getByTestId('public-kotc-court-1')).toContainText('Players assigned');

  phase='live';
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByText('On Court Now · Round 1')).toBeVisible({timeout:1800});
  await expect(page.getByTestId('public-kotc-court-1')).toContainText('11');
  await expect(page.getByTestId('public-kotc-court-2')).toContainText('8');
  await expect(page.getByText('Live Standings')).toBeVisible();

  phase='finished';
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  await expect(page.getByText('King of the Court · Final Results')).toBeVisible();
  await expect(page.getByText('Final Standings')).toBeVisible();
  await expect(page.getByText('These are the final saved results. This link remains available after the session.')).toBeVisible();
  await expect(page.getByTestId('public-kotc-podium').getByText('Guest One')).toBeVisible();
  const callsAtFinish=publicCalls;await new Promise(resolve=>setTimeout(resolve,500));expect(publicCalls,'completed public results must stop polling Base44').toBe(callsAtFinish);
});

test('finished KOTC host management: secure menu, local share, explicit email and post-event correction',async({page})=>{
  const finished=makeState('finished');
  let correctionCalls=0,emailCalls=0,managementCalls=0,publicCalls=0;
  const management={canManage:true,role:'admin',sessionId:'session-finished',tournamentId:'tournament-finished',sessionName:'E2E Live KOTC',matches:[{id:'match-r3-c1',round_id:'round-3',round_number:3,court:1,team_a_participant_ids:['p1','p2'],team_b_participant_ids:['p3','p4'],team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9,winner_side:'A',result_method:'normal',revision:1}]};
  await page.addInitScript(()=>{navigator.share=async payload=>{window.__kotcShared=payload;};});
  await page.route('**/api/apps/**',async route=>{
    const request=route.request();const path=new URL(request.url()).pathname;const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
    if(idx<0)return json(route,[]);
    const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=request.postDataJSON()||{};}catch{}
    if(name==='kotcResultsShare'){
      if(body.action==='management_state'){managementCalls++;return json(route,management);}
      if(body.action==='email_players'){emailCalls++;return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}
      publicCalls++;return json(route,{...finished,poll_after_ms:0});
    }
    if(name==='kotcCommand'){
      correctionCalls++;management.matches[0]={...management.matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore),revision:2};
      finished.current_matches[0]={...finished.current_matches[0],team_a_score:Number(body.teamAScore),team_b_score:Number(body.teamBScore)};
      return json(route,{success:true,match:management.matches[0]});
    }
    return json(route,{});
  });

  await page.goto('/e2e/kotcLiveHarness.html?manage=1');
  await expect(page.getByTestId('kotc-results-host-menu')).toBeVisible({timeout:1800});
  expect(managementCalls).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Host Menu'}).click();
  const callsBeforeShare=publicCalls+managementCalls+correctionCalls+emailCalls;
  await page.getByRole('button',{name:'Share Results'}).click();
  expect(await page.evaluate(()=>window.__kotcShared?.url)).toContain('/kotc-live/e2e-live-token');
  expect(publicCalls+managementCalls+correctionCalls+emailCalls,'Share Results must be local').toBe(callsBeforeShare);

  await page.getByRole('button',{name:'Send to Players'}).click();
  expect(emailCalls).toBe(1);

  await page.getByRole('button',{name:'Correct Results'}).click();
  await expect(page.getByTestId('kotc-results-correction-panel')).toBeVisible();
  await page.getByRole('button',{name:'Edit Court Result'}).click();
  const scoreInputs=page.getByTestId('kotc-results-correction-panel').locator('input[type="number"]');
  await scoreInputs.nth(0).fill('10');await scoreInputs.nth(1).fill('9');
  await page.getByRole('button',{name:'Save Correction'}).click();
  await expect.poll(()=>correctionCalls).toBe(1);
  await expect(page.getByTestId('kotc-results-correction-panel')).toContainText('10');
});
