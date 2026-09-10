import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function makeState(phase){
  const standings=[
    {id:'p1',rank:1,name:'Player 01',wins:3,losses:0,differential:14},
    {id:'p2',rank:2,name:'Guest One',wins:3,losses:0,differential:10},
    {id:'p3',rank:3,name:'Player 03',wins:2,losses:1,differential:6},
  ];
  const history=[
    {round_number:1,court:1,team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},
    {round_number:1,court:2,team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:9,team_b_score:11},
    {round_number:2,court:1,team_a:['Player 01','Player 05'],team_b:['Player 03','Player 07'],team_a_score:11,team_b_score:8},
  ];
  const common={completed_rounds:phase==='finished'?2:0,bench:['Player 17','Guest One'],matches:phase==='finished'?history:[],standings,timer:{remainingSeconds:420,running:phase==='live',deadlineAt:phase==='live'?new Date(Date.now()+420000).toISOString():null}};
  if(phase==='ready')return {...common,session:{name:'E2E Live KOTC',status:'ready',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'proposed'},current_matches:[{round_number:1,court:1,status:'scheduled',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04']}],podium:[]};
  if(phase==='live')return {...common,session:{name:'E2E Live KOTC',status:'in_progress',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'started'},current_matches:[{round_number:1,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},{round_number:1,court:2,status:'in_progress',team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:8,team_b_score:8}],podium:[]};
  return {...common,session:{name:'E2E Live KOTC',status:'completed',current_round_number:2,scoring_mode:'timed'},current_round:{round_number:2,status:'completed'},current_matches:[{round_number:2,court:1,status:'completed',team_a:['Player 01','Player 05'],team_b:['Player 03','Player 07'],team_a_score:11,team_b_score:8}],podium:standings.slice(0,3)};
}

test.use({viewport:{width:1440,height:900}});

test('desktop public KOTC: live session and round history are clear without overflow',async({page})=>{
  let phase='ready';
  await page.route('**/api/apps/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    const marker=`/api/apps/${APP_ID}/functions/`;
    const idx=path.indexOf(marker);
    if(idx>=0){const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);if(name==='kotcResultsShare')return json(route,makeState(phase));}
    return json(route,[]);
  });

  await page.goto('/e2e/kotcLiveHarness.html');
  await expect(page.getByText('Round Ready · Round 1')).toBeVisible();
  phase='live';await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('On Court Now · Round 1')).toBeVisible({timeout:1800});
  await expect(page.getByText('Live Standings')).toBeVisible();
  let layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);

  phase='finished';await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  await expect(page.getByTestId('public-kotc-round-history')).toBeVisible();
  await expect(page.getByTestId('public-kotc-round-history')).toContainText('Round 2');
  await page.getByTestId('public-kotc-round-history').getByRole('button',{name:'Round 1'}).click();
  await expect(page.getByTestId('public-kotc-round-history')).toContainText('Player 05');
  await expect(page.getByTestId('public-kotc-round-history')).toContainText('11');
  layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  await expect(page.getByText(/Emergency contact|Member mobile/i)).toHaveCount(0);
});
