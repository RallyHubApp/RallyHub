import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function makeState(phase='live'){
  const names=n=>[`Player ${String(n).padStart(2,'0')}`,`Player ${String(n+1).padStart(2,'0')}`];
  const matches=[1,2,3,4].map((court,i)=>({
    round_number:4,
    court,
    status:i<2?'completed':'in_progress',
    team_a:names(i*4+1),
    team_b:names(i*4+3),
    team_a_score:i<2?11:null,
    team_b_score:i<2?7+i:null,
  }));
  const standings=Array.from({length:18},(_,i)=>({id:`p${i+1}`,rank:i+1,name:i===1?'Guest One':`Player ${String(i+1).padStart(2,'0')}`,wins:Math.max(0,5-Math.floor(i/4)),losses:Math.floor(i/4),differential:18-i}));
  if(phase==='finished')return {
    session:{name:'Thursday Improver KOTC',status:'completed',current_round_number:8,scoring_mode:'timed'},
    completed_rounds:8,current_round:{round_number:8,status:'completed'},current_matches:matches.map(m=>({...m,round_number:8,status:'completed',team_a_score:11,team_b_score:8})),bench:[],timer:{running:false,remainingSeconds:0},standings,matches:[],podium:standings.slice(0,3),
  };
  return {
    session:{name:'Thursday Improver KOTC',status:'in_progress',current_round_number:4,scoring_mode:'timed'},
    completed_rounds:3,current_round:{round_number:4,status:'started'},current_matches:matches,bench:['Player 17','Guest One'],timer:{running:true,remainingSeconds:326,deadlineAt:new Date(Date.now()+326000).toISOString()},standings,matches:[],podium:[],
  };
}

async function install(page,getPhase){
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(url.pathname.includes(marker)){
      const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
      if(name==='kotcResultsShare')return json(route,makeState(getPhase()));
    }
    return json(route,[]);
  });
}

test('hall display: current round, big timer, four courts and podium remain glanceable',async({browser})=>{
  let phase='live';
  const context=await browser.newContext({viewport:{width:1366,height:768}});
  const page=await context.newPage();
  await install(page,()=>phase);
  await page.goto('/e2e/kotcLiveHarness.html');
  await page.getByTestId('enter-hall-display').click();
  await expect(page.getByTestId('public-kotc-hall-display')).toBeVisible();
  await expect(page.getByTestId('hall-round-timer')).toContainText('Round 4');
  await expect(page.getByTestId('hall-round-timer')).toContainText(/05:2\d|05:3\d/);
  await expect(page.getByTestId('hall-bench')).toContainText('Guest One');
  for(let court=1;court<=4;court++)await expect(page.getByTestId(`public-kotc-court-${court}`)).toBeVisible();

  const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,innerHeight:window.innerHeight}));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  const boxes=[];for(let court=1;court<=4;court++)boxes.push(await page.getByTestId(`public-kotc-court-${court}`).boundingBox());
  for(const box of boxes)expect((box?.y||0)+(box?.height||0)).toBeLessThanOrEqual(layout.innerHeight+2);

  phase='finished';
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  await expect(page.getByTestId('public-kotc-podium')).toContainText('Guest One');
  const podiumBox=await page.getByTestId('public-kotc-podium').boundingBox();
  expect((podiumBox?.y||0)+(podiumBox?.height||0)).toBeLessThanOrEqual(768+5);
  await context.close();
});
