import { test,expect } from '@playwright/test';

const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function createModel({failFirstScore=false}={}){
  const participants=Array.from({length:4},(_,i)=>({id:`participant-${i+1}`,player_id:`player-${i+1}`,display_name:`Host Player ${i+1}`,status:'present',participant_type:'member',seed_rank:i+1}));
  const round={id:'delegated-round-1',session_id:'delegated-session',round_number:1,status:'proposed',proposal_revision:1,active_court_count:1,bench_count:0};
  const slots=[
    {id:'slot-a1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:1,participant_id:'participant-1'},
    {id:'slot-a2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'A',slot_number:2,participant_id:'participant-2'},
    {id:'slot-b1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:1,participant_id:'participant-3'},
    {id:'slot-b2',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_side:'B',slot_number:2,participant_id:'participant-4'},
  ];
  const match={id:'delegated-match-1',session_id:'delegated-session',round_id:round.id,round_number:1,ladder_court_rank:1,team_a_participant_ids:['participant-1','participant-2'],team_b_participant_ids:['participant-3','participant-4'],status:'scheduled',revision:0,correction_count:0};
  const session={id:'delegated-session',tournament_id:'delegated-host-tournament',name:'Delegated Host KOTC',status:'ready',current_round_number:1,current_round_id:round.id,revision:0,play_minutes:8,scoring_mode:'timed',venue_court_limit:1,available_court_limit:1};
  const calls=[];let failedScoreOnce=false;
  const state=()=>({session,participants,rounds:[round],slots,matches:[match],fixedPairs:[],contactDirectory:{
    'player-1':{phone:'0850000001',emergency_name:'Emergency One',emergency_relationship:'Partner',emergency_mobile:'0860000001'},
    'player-2':{phone:'0850000002',emergency_name:'Emergency Two',emergency_relationship:'Spouse',emergency_mobile:'0860000002'},
    'player-3':{phone:'0850000003',emergency_name:'Emergency Three',emergency_relationship:'Sibling',emergency_mobile:'0860000003'},
    'player-4':{phone:'0850000004',emergency_name:'Emergency Four',emergency_relationship:'Friend',emergency_mobile:'0860000004'},
    outsider:{phone:'999',emergency_name:'SHOULD NOT APPEAR',emergency_mobile:'999'},
  },currentAccessRole:'session_host',isAdmin:false});
  const handle=async(name,body)=>{
    calls.push({name,body});
    if(name==='getKotcV2State')return state();
    if(name==='manageKotcSessionAccess')return {__status:403,error:'Platform admin access required'};
    if(name==='kotcResultsShare')return {success:true,token:'delegated-live-token'};
    if(name==='manageKotcScorerLinks')return {success:true,token:'delegated-score-token'};
    if(name==='kotcTimer')return {success:true,state:{roundId:round.id,durationSeconds:480,remainingSeconds:480,running:false,deadlineAt:null,lastAction:body.action||'get'}};
    if(name==='kotcCommand'&&body.commandType==='host_claim_score')return {success:true,hostAuthority:true,displacedScorer:false};
    if(name==='kotcCommand'&&body.commandType==='start_proposed_round'){
      await sleep(80);round.status='started';round.started_at=new Date().toISOString();session.status='in_progress';session.revision++;session.actual_first_round_start=round.started_at;return {success:true,session,round};
    }
    if(name==='kotcCommand'&&body.commandType==='complete_match'){
      if(failFirstScore&&!failedScoreOnce){failedScoreOnce=true;return {__status:503,error:'Temporary hall network interruption'};}
      await sleep(60);match.team_a_score=Number(body.teamAScore);match.team_b_score=Number(body.teamBScore);match.winner_side=match.team_a_score>match.team_b_score?'A':'B';match.status='completed';match.revision++;return {success:true,match};
    }
    return {success:true,session};
  };
  return {session,participants,round,match,calls,state,handle};
}

async function install(page,model){
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(!url.pathname.includes(marker))return json(route,[]);
    const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
    let body={};try{body=req.postDataJSON()||{};}catch{}
    const out=await model.handle(name,body);
    if(out?.__status)return json(route,{error:out.error},out.__status);
    return json(route,out);
  });
}

test.use({viewport:{width:390,height:844}});

test('delegated host: session-only controls, attendee contacts, links and keyboard scoring',async({page})=>{
  const model=createModel();await install(page,model);
  await page.goto('/e2e/kotcDelegatedHostHarness.html');
  await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 ready');
  await expect(page.getByTestId('kotc-next-action')).toContainText('check the 1 court assignments');

  // Session-only contact access: four attendees are visible, a non-roster record is not.
  await page.getByTestId('kotc-session-menu').click();
  await page.getByRole('button',{name:'Contacts'}).click();
  await page.getByTestId('kotc-contact-search').fill('Host Player 1');
  await expect(page.getByText('Host Player 1',{exact:true})).toBeVisible();
  await expect(page.getByText('Host Player 2',{exact:true})).toHaveCount(0);
  const memberCall=page.locator('a[href="tel:0850000001"]');const emergencyCall=page.locator('a[href="tel:0860000001"]');
  await expect(memberCall).toBeVisible();await expect(emergencyCall).toBeVisible();
  expect((await memberCall.boundingBox())?.height||0).toBeGreaterThanOrEqual(40);
  await expect(page.getByText('Emergency One')).toBeVisible();
  await expect(page.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  await page.getByTestId('kotc-contact-search').fill('');

  // Delegated host can prepare player/public links but cannot appoint another host.
  await page.getByText('Session Links & Access').click();
  await expect(page.getByText('Live Player View',{exact:true})).toBeVisible();
  await expect(page.getByText('Player Scoring Link',{exact:true})).toBeVisible();
  await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);

  // Close the menu and run the sporting action as a host.
  await page.getByTestId('kotc-session-menu').click();
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});

  // Simulate real keyboard entry rather than programmatic value injection.
  const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  const save=page.getByTestId('kotc-complete-1');
  const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  await save.click();
  await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  await expect(page.getByTestId('kotc-next-action')).toContainText('review the 1 results');

  const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
});
