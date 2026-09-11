import { test, expect } from '@playwright/test';

const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
const now=()=>Date.now();

function createModel(){
  const participants=Array.from({length:18},(_,i)=>({id:`participant-${String(i+1).padStart(2,'0')}`,player_id:`player-${String(i+1).padStart(2,'0')}`,display_name:`Player ${String(i+1).padStart(2,'0')}`,status:'present',seed_rank:i+1}));
  const slots=[];const matches=[];
  for(let c=1;c<=4;c++){
    const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);
    slots.push(
      {id:`slot-${c}-a1`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'A',slot_number:1,participant_id:ids[0]},
      {id:`slot-${c}-a2`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'A',slot_number:2,participant_id:ids[1]},
      {id:`slot-${c}-b1`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'B',slot_number:1,participant_id:ids[2]},
      {id:`slot-${c}-b2`,round_id:'round-1',round_number:1,ladder_court_rank:c,team_side:'B',slot_number:2,participant_id:ids[3]},
    );
    matches.push({id:`match-${c}`,session_id:'session-live',round_id:'round-1',round_number:1,ladder_court_rank:c,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:'scheduled',revision:0,team_a_score:null,team_b_score:null,scoring_lock_owner:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null});
  }
  const model={
    calls:[],participants,slots,matches,
    round:{id:'round-1',session_id:'session-live',round_number:1,status:'started',proposal_revision:1,active_court_count:4,bench_count:2},
    session:{id:'session-live',tournament_id:'e2e-kotc-tournament',name:'Collaborative Score E2E',status:'in_progress',current_round_number:1,current_round_id:'round-1',revision:2,play_minutes:8,scoring_mode:'timed',score_target:11,win_by_two:false,timer_state_json:JSON.stringify({roundId:'round-1',roundNumber:1,durationSeconds:480,remainingSeconds:420,running:true,deadlineAt:new Date(Date.now()+420000).toISOString(),lastAction:'start'})},
  };
  const active=m=>!!(m.scoring_lock_owner&&m.scoring_lock_expires_at&&Date.parse(m.scoring_lock_expires_at)>now());
  const names=Object.fromEntries(participants.map(p=>[p.id,p.display_name]));
  const liveScorePayload=()=>({liveScoresOnly:true,session:{id:model.session.id,status:model.session.status,current_round_id:model.session.current_round_id,current_round_number:1,revision:model.session.revision,timer_state_json:model.session.timer_state_json},matches:model.matches.map(m=>({id:m.id,status:m.status,team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,serving_side_at_horn:m.serving_side_at_horn,result_method:m.result_method,revision:m.revision,correction_count:0,completed_at:m.completed_at,command_id:m.command_id,scoring_lock_active:active(m),scoring_lock_kind:active(m)?(String(m.scoring_lock_owner).startsWith('host:')?'host':'player'):'none',scoring_lock_expires_at:active(m)?m.scoring_lock_expires_at:null}))});
  const scorerState=clientId=>({success:true,session:{name:model.session.name,status:model.session.status,current_round_number:1,scoring_mode:'timed',score_target:11,win_by_two:false},round:{id:model.round.id,round_number:1,status:model.round.status},bench:['Player 17','Player 18'],timer:{running:true,remainingSeconds:420,deadlineAt:new Date(Date.now()+420000).toISOString()},matches:model.matches.map(m=>({id:m.id,court:m.ladder_court_rank,status:m.status,revision:m.revision,team_a:m.team_a_participant_ids.map(id=>names[id]),team_b:m.team_b_participant_ids.map(id=>names[id]),team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,lock_status:active(m)?(m.scoring_lock_owner===clientId?'mine':'other'):'free',lock_seconds:active(m)?Math.ceil((Date.parse(m.scoring_lock_expires_at)-now())/1000):0,can_correct:m.status==='completed'&&m.scorer_correction_owner_client_id===clientId}))});
  model.handle=async(source,name,body)=>{
    model.calls.push({source,name,body:{...body},at:Date.now()});
    if(name==='getKotcV2State'){
      if(body.liveScoresOnly)return liveScorePayload();
      return {session:model.session,participants:model.participants,rounds:[model.round],slots:model.slots,matches:model.matches,fixedPairs:[],scorerLinkActive:true,contactDirectory:{},currentAccessRole:'admin',isAdmin:true};
    }
    if(name==='kotcTimer')return {success:true,state:JSON.parse(model.session.timer_state_json)};
    if(name==='kotcScorer'){
      const action=body.action||'state',clientId=body.clientId||'';
      if(action==='state')return scorerState(clientId);
      const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
      if(action==='claim'){
        const mine=model.matches.find(x=>x.id!==m.id&&x.scoring_lock_owner===clientId&&active(x));if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.ladder_court_rank}. Save or cancel that court first.`,locked:true}};
        if(active(m)&&m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is being scored on another device.`,locked:true}};
        m.scoring_lock_owner=clientId;m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();return {success:true,claimed:true,lease_seconds:90,expires_at:m.scoring_lock_expires_at};
      }
      if(action==='heartbeat'){
        if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:'Your scoring lock is no longer active.'}};
        m.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();return {success:true};
      }
      if(action==='release'){
        if(m.scoring_lock_owner===clientId){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
      }
      if(action==='save'||action==='correct'){
        if(!active(m)||m.scoring_lock_owner!==clientId)return {status:423,body:{error:`Court ${m.ladder_court_rank} is not locked to this scorer.`}};
        if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.'}};
        m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=clientId;
        return {success:true,message:action==='correct'?'Updated score saved':'Score saved',match:{...m,can_correct:true,lock_status:'free'}};
      }
    }
    if(name==='kotcCommand'&&body.commandType==='host_claim_score'){
      const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
      if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:`Court ${m.ladder_court_rank} is already being entered by a player. Wait for them to save or cancel, then refresh player scores.`,locked:true}};
      m.scoring_lock_owner='host:host-e2e';m.scoring_lock_expires_at=new Date(Date.now()+300000).toISOString();return {success:true,hostAuthority:true,expires_at:m.scoring_lock_expires_at};
    }
    if(name==='kotcCommand'&&body.commandType==='host_release_score'){
      const m=model.matches.find(x=>x.id===body.matchId);if(m?.scoring_lock_owner==='host:host-e2e'){m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;}return {success:true,released:true};
    }
    if(name==='saveKotcScore'){
      const m=model.matches.find(x=>x.id===body.matchId);if(!m)return {status:404,body:{error:'Match not found'}};
      if(active(m)&&m.scoring_lock_owner!=='host:host-e2e')return {status:423,body:{error:`Court ${m.ladder_court_rank} is already being entered by a player.`}};
      if(Number(body.expectedMatchRevision)!==m.revision)return {status:409,body:{error:'Match changed since you opened it.'}};
      m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>m.team_b_score?'A':'B';m.status='completed';m.revision+=1;m.completed_at=new Date().toISOString();m.scoring_lock_owner=null;m.scoring_lock_expires_at=null;m.scorer_correction_owner_client_id=null;return {success:true,match:{...m}};
    }
    return {success:true};
  };
  return model;
}

async function install(context,model,source){
  await context.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(!url.pathname.includes(marker))return json(route,[]);
    const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');let body={};try{body=req.postDataJSON()||{};}catch{}
    const out=await model.handle(source,name,body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  });
}

async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('Collaborative Score E2E')).toBeVisible();return page;}
async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}

test('host + two scorer devices: first claim wins, mixed parallel scoring, manual host refresh only',async({browser})=>{
  test.setTimeout(60000);
  const model=createModel();
  const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  await install(hostCtx,model,'host');await install(aCtx,model,'scorer-a');await install(bCtx,model,'scorer-b');
  const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  await expect(host.getByTestId('kotc-refresh-player-scores')).toBeVisible();

  // No background host score polling: wait longer than the old polling interval.
  const before=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  await host.waitForTimeout(4500);
  expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(before);

  const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  await a.getByTestId('scorer-court-1').getByRole('button',{name:'Score This Court'}).click();
  await b.getByTestId('scorer-court-2').getByRole('button',{name:'Score This Court'}).click();
  await expect(a.getByTestId('scorer-court-1')).toContainText('Court 1 ready — enter the score');
  await expect(b.getByTestId('scorer-court-2')).toContainText('Court 2 ready — enter the score');

  // Host learns ownership only when deliberately refreshing; claimed player courts become unavailable to host.
  await host.getByTestId('kotc-refresh-player-scores').click();
  await expect(host.getByTestId('kotc-score-card-1')).toContainText('Player entering this court');
  await expect(host.getByTestId('kotc-host-score-1')).toBeDisabled();
  await expect(host.getByTestId('kotc-score-card-2')).toContainText('Player entering this court');
  await expect(host.getByTestId('kotc-host-score-2')).toBeDisabled();

  // Host claims a different free court; scorer pages see that court as unavailable.
  await host.getByTestId('kotc-host-score-3').click();
  await expect(host.getByTestId('kotc-score-card-3')).toContainText('HOST ENTERING');
  await expect(a.getByTestId('scorer-court-3')).toContainText(/host or another scorer|LOCKED/,{timeout:6500});

  // All three can score in parallel on separate courts.
  const cardA=await fillCourt(a,1,11,1),cardB=await fillCourt(b,2,7,8);
  await host.getByTestId('kotc-score-3-a').fill('6');await host.getByTestId('kotc-score-3-b').fill('4');
  await Promise.all([
    cardA.getByRole('button',{name:'Save Result'}).click(),
    cardB.getByRole('button',{name:'Save Result'}).click(),
    host.getByTestId('kotc-complete-3').click(),
  ]);
  await expect(cardA).toContainText('Score saved: 11–1');await expect(cardB).toContainText('Score saved: 7–8');await expect(host.getByTestId('kotc-score-card-3')).toContainText('Saved 6–4');

  // Player saves do not magically appear on host: host has only its local Court 3 result until Refresh.
  await expect(host.getByTestId('kotc-next-action')).toContainText('1/4 scores saved');
  await expect(host.getByTestId('kotc-player-score-toolbar')).toBeVisible();
  await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('1/4 saved');
  const toolbarBeforeCourtOne=await host.evaluate(()=>{const toolbar=document.querySelector('[data-testid="kotc-player-score-toolbar"]'),court=document.querySelector('[data-testid="kotc-score-card-1"]');if(!toolbar||!court)return false;return !!(toolbar.compareDocumentPosition(court)&Node.DOCUMENT_POSITION_FOLLOWING);});
  expect(toolbarBeforeCourtOne,'Player Scores refresh toolbar should sit immediately before the court score grid').toBe(true);
  const refreshReadsBefore=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  await host.waitForTimeout(1500);
  expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(refreshReadsBefore);
  await host.getByTestId('kotc-refresh-player-scores').click();
  await expect(host.getByTestId('kotc-next-action')).toContainText('3/4 scores saved');
  await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–1');
  await expect(host.getByTestId('kotc-score-card-2')).toContainText('Saved 7–8');

  // Host can take the remaining free court and finish the round locally.
  await host.getByTestId('kotc-host-score-4').click();await host.getByTestId('kotc-score-4-a').fill('9');await host.getByTestId('kotc-score-4-b').fill('5');await host.getByTestId('kotc-complete-4').click();
  await expect(host.getByText('All scores saved for Round 1')).toBeVisible();

  await hostCtx.close();await aCtx.close();await bCtx.close();
});
