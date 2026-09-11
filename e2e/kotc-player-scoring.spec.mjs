import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function createModel(){
  const now=()=>Date.now();
  const matches=[1,2].map(c=>({id:`match-${c}`,court:c,status:'scheduled',revision:0,team_a:[`P${c}A1`,`P${c}A2`],team_b:[`P${c}B1`,`P${c}B2`],team_a_score:null,team_b_score:null,lockOwner:'',lockExpires:0,correctionOwner:'',correction_count:0,completedAt:0}));
  const calls=[];let transientSaveRateLimits=0,commitThenFail=0;
  const correctionOpen=(m,clientId)=>m.status==='completed'&&m.correctionOwner===clientId&&m.completedAt>0&&now()-m.completedAt<=90000;
  const state=(clientId)=>({success:true,session:{name:'E2E Player Scoring',status:'in_progress',current_round_number:1,scoring_mode:'timed'},round:{id:'round-1',round_number:1,status:'started'},bench:[],timer:{running:true,remainingSeconds:300,deadlineAt:new Date(Date.now()+300000).toISOString()},matches:matches.map(m=>({id:m.id,court:m.court,status:m.status,revision:m.revision,team_a:m.team_a,team_b:m.team_b,team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,lock_status:m.lockOwner&&m.lockExpires>now()?(m.lockOwner===clientId?'mine':'other'):'free',lock_seconds:m.lockExpires>now()?Math.ceil((m.lockExpires-now())/1000):0,can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((m.completedAt+90000-now())/1000)):0}))});
  const handle=async(body)=>{
    calls.push({...body,at:Date.now()});
    const action=body.action||'state',clientId=body.clientId||'';
    if(action==='state') return state(clientId);
    const m=matches.find(x=>x.id===body.matchId); if(!m) return {status:404,body:{error:'Current-round match not found'}};
    if(action==='claim'){
      if(m.status==='completed'&&!correctionOpen(m,clientId))return {status:423,body:{error:`Court ${m.court} is already saved. The scorer correction window has closed; the host can still correct this result.`,saved:true,read_only:true}};
      const mine=matches.find(x=>x.id!==m.id&&x.lockOwner===clientId&&x.lockExpires>now());
      if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.court}. Save or cancel that court first.`,locked:true}};
      if(m.lockOwner&&m.lockExpires>now()&&m.lockOwner!==clientId)return {status:423,body:{error:`Court ${m.court} is being scored on another device.`,locked:true}};
      await sleep(10);m.lockOwner=clientId;m.lockExpires=now()+90000;await sleep(35);
      if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:`Court ${m.court} was claimed by another scorer.`,locked:true}};
      return {status:200,body:{success:true,claimed:true,lease_seconds:90}};
    }
    if(action==='heartbeat'){
      if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:'Your scoring lock is no longer active.'}};
      m.lockExpires=now()+90000;return {status:200,body:{success:true}};
    }
    if(action==='release'){
      if(m.lockOwner===clientId){m.lockOwner='';m.lockExpires=0;}return {status:200,body:{success:true,released:true}};
    }
    if(action==='save'||action==='correct'){
      if(transientSaveRateLimits>0){transientSaveRateLimits--;return {status:429,body:{error:'Rate limit exceeded'}};}
      if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:`Court ${m.court} is not locked to this scorer.`}};
      if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.',conflict:true,currentRevision:m.revision}};
      const correcting=action==='correct';
      if(correcting&&m.status!=='completed')return {status:409,body:{error:'This score has not been saved yet.'}};
      if(correcting&&!correctionOpen(m,clientId))return {status:423,body:{error:'The 90-second scorer correction window has closed. Ask the host to correct this result.',read_only:true}};
      if(!correcting&&m.status==='completed')return {status:409,body:{error:'This result is already saved. Use Undo / Update on the scorer screen.'}};
      m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>=m.team_b_score?'A':'B';m.status='completed';m.revision++;if(correcting)m.correction_count++;else m.completedAt=now();m.lockOwner='';m.lockExpires=0;m.correctionOwner=clientId;
      if(commitThenFail>0){commitThenFail--;return {status:503,body:{error:'Response lost after committed sporting write'}};}
      return {status:200,body:{success:true,corrected:correcting,message:correcting?'Updated score saved':'Score saved',match:{...m,completed_at:new Date(m.completedAt).toISOString(),can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((m.completedAt+90000-now())/1000)):0,lock_status:'free'}}};
    }
    return {status:400,body:{error:'Unsupported'}};
  };
  return {matches,calls,handle,setTransientSaveRateLimits:n=>{transientSaveRateLimits=n;},setCommitThenFail:n=>{commitThenFail=n;}};
}

async function install(context,model){
  await context.route('**/api/apps/**', async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(!url.pathname.includes(marker)) return json(route,[]);
    const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
    if(name!=='kotcScorer') return json(route,{success:true});
    let body={};try{body=req.postDataJSON()||{};}catch{}
    const out=await model.handle(body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  });
}

async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('E2E Player Scoring')).toBeVisible();return page;}

async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}

test('player scoring: per-court lock, parallel courts, saved confirmation and correction',async({browser})=>{
  const model=createModel();
  const aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  await install(aCtx,model);await install(bCtx,model);
  const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);

  // First actual digit claims Court 1 for Phone A. No separate claim button is needed.
  const aCourt1First=a.getByTestId('scorer-court-1').locator('input').nth(0);
  await aCourt1First.fill('1');
  await expect(a.getByTestId('scorer-court-1')).toContainText('locked to you');
  await expect(aCourt1First).toHaveValue('1');

  // Same phone cannot hoard a second court while holding Court 1; the attempted digit never appears.
  const aCourt2First=a.getByTestId('scorer-court-2').locator('input').nth(0);
  await aCourt2First.fill('2');
  await expect(a.getByTestId('scorer-court-2')).toContainText('already scoring Court 1');
  await expect(aCourt2First).toHaveValue('');

  // Phone B cannot take Court 1, but its first digit can claim Court 2 independently.
  const bCourt1First=b.getByTestId('scorer-court-1').locator('input').nth(0);
  await bCourt1First.fill('9');
  await expect(b.getByTestId('scorer-court-1')).toContainText(/another device|LOCKED|being scored/);
  await expect(bCourt1First).toHaveValue('');
  const bCourt2First=b.getByTestId('scorer-court-2').locator('input').nth(0);
  await bCourt2First.fill('7');
  await expect(b.getByTestId('scorer-court-2')).toContainText('locked to you');
  await bCourt2First.fill('123');await expect(bCourt2First).toHaveValue('12');await bCourt2First.fill('');

  // Court 1 saves and gives explicit confirmation even if Base44 transiently rate-limits
  // the first save attempt. The scorer page must retry instead of exposing a raw 429.
  model.setTransientSaveRateLimits(1);
  let card=await fillCourt(a,1,11,7);await card.getByRole('button',{name:'Save Result'}).click();
  await expect(card).toContainText('Score saved: 11–7');
  expect(model.matches[0].revision).toBe(1);

  // Other players pull the saved result only when they explicitly refresh; there is no hidden scorer polling.
  const bStateBefore=model.calls.filter(c=>c.action==='state').length;
  await b.waitForTimeout(5500);
  expect(model.calls.filter(c=>c.action==='state').length).toBe(bStateBefore);
  await b.getByTestId('scorer-refresh').click();
  await expect(b.getByTestId('scorer-court-1')).toContainText('Score saved: 11–7');
  await expect(b.getByTestId('scorer-court-1').getByRole('button',{name:'Undo / Update Score'})).toHaveCount(0);
  await expect(b.getByTestId('scorer-court-1')).toContainText(/Result already entered|host can update/i);

  // The scorer device that saved it can reopen and correct while the host has not advanced the round.
  await card.getByRole('button',{name:'Undo / Update Score'}).click();
  await expect(card).toContainText('Court 1 ready for correction');
  card=await fillCourt(a,1,12,8);await card.getByRole('button',{name:'Save Updated Score'}).click();
  await expect(card).toContainText('Score saved: 12–8');
  expect(model.matches[0].revision).toBe(2);expect(model.matches[0].correction_count).toBe(1);

  // Sporting-integrity guard: a tied timed game cannot be saved until the scorer
  // explicitly confirms which team was serving at the horn. There is no Team A default.
  let card2=await fillCourt(b,2,8,8);
  await expect(card2.getByText('Tie at the horn — who was serving?')).toBeVisible();
  await expect(card2.getByRole('button',{name:'Save Result'})).toBeDisabled();
  await card2.getByRole('combobox').click();
  await b.getByRole('option',{name:'Team B serving at horn'}).click();
  await expect(card2.getByRole('button',{name:'Save Result'})).toBeEnabled();

  // Court 2 can then save in parallel and the player page waits for the host rather than advancing.
  card2=await fillCourt(b,2,9,6);await card2.getByRole('button',{name:'Save Result'}).click();
  await expect(card2).toContainText('Score saved: 9–6');
  await expect(b.getByText('All court scores saved')).toBeVisible({timeout:2500});
  await expect(b.getByText(/waiting for the host/i)).toBeVisible();
  expect(model.calls.some(c=>c.commandType==='generate_next_round'||c.action==='generate_next_round')).toBe(false);

  // Busy-hall phone checks: no sideways scrolling and primary score controls are
  // comfortably tappable rather than tiny desktop targets.
  const mobileLayout=await b.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.innerWidth+1);
  const updateBox=await card2.getByRole('button',{name:'Undo / Update Score'}).boundingBox();
  expect(updateBox?.height||0).toBeGreaterThanOrEqual(44);

  // The helper correction privilege is deliberately short-lived. Simulate expiry and
  // force a state refresh: the helper must lose Undo / Update while the host remains authoritative.
  model.matches[0].completedAt=Date.now()-91000;model.matches[0].lockOwner='';model.matches[0].lockExpires=0;
  await a.reload();await expect(a.getByText('E2E Player Scoring')).toBeVisible();
  await expect(a.getByTestId('scorer-court-1').getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  await expect(a.getByTestId('scorer-court-1')).toContainText(/host/i);

  await aCtx.close();await bCtx.close();
});