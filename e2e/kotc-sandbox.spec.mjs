import {test,expect} from '@playwright/test';
import fs from 'node:fs';

const APP_ID='6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

function makeModel(){
  const participants=Array.from({length:18},(_,i)=>({id:`participant-${i+1}`,display_name:`Test Player ${String(i+1).padStart(2,'0')}`,participant_type:'guest',source_type:'guest',status:'present',seed_rank:i+1,rounds_played:0,fairness_benches:0,consecutive_rounds_played:0,consecutive_court1_rounds:0,court1_rounds:0}));
  const model={session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[],calls:[]};
  const makeRound=(n)=>{
    const round={id:`round-${n}`,session_id:'sandbox-session',round_number:n,status:'proposed',proposal_revision:1,active_court_count:4,bench_count:2};
    const active=participants.slice((n-1)%2,16+(n-1)%2).map(p=>p.id).slice(0,16);
    const slots=[];const matches=[];
    for(let court=1;court<=4;court++){
      const four=active.slice((court-1)*4,court*4);
      const defs=[['A',1,four[0]],['A',2,four[1]],['B',1,four[2]],['B',2,four[3]]];
      for(const [side,slot,pid] of defs)slots.push({id:`r${n}-c${court}-${side}-${slot}`,session_id:'sandbox-session',round_id:round.id,round_number:n,ladder_court_rank:court,team_side:side,slot_number:slot,participant_id:pid,assignment_type:n===1?'initial_seed':'sporting_movement',assignment_revision:1});
      matches.push({id:`match-r${n}-c${court}`,session_id:'sandbox-session',round_id:round.id,round_number:n,ladder_court_rank:court,team_a_participant_ids:four.slice(0,2),team_b_participant_ids:four.slice(2),status:'scheduled',revision:0,correction_count:0});
    }
    return {round,slots,matches};
  };
  model.create=()=>{const {round,slots,matches}=makeRound(1);model.session={id:'sandbox-session',tournament_id:'sandbox-tournament',tenant_id:'tenant-test',club_id:'club-test',name:'KOTC Test Sandbox',status:'ready',current_round_number:1,current_round_id:round.id,revision:0,play_minutes:8,scoring_mode:'timed',demo_mode:true,exclude_from_aggregates:true};model.participants=participants;model.rounds=[round];model.slots=slots;model.matches=matches;};
  model.start=()=>{model.session={...model.session,status:'in_progress',revision:model.session.revision+1,actual_first_round_start:new Date().toISOString()};model.rounds=model.rounds.map(r=>r.id===model.session.current_round_id?{...r,status:'started',started_at:new Date().toISOString()}:r);return model.rounds.find(r=>r.id===model.session.current_round_id);};
  model.fill=()=>{const round=model.rounds.find(r=>r.id===model.session.current_round_id);model.matches=model.matches.map(m=>m.round_id!==round.id||m.status==='completed'?m:{...m,status:'completed',team_a_score:(round.round_number+m.ladder_court_rank)%2===0?11:7,team_b_score:(round.round_number+m.ladder_court_rank)%2===0?7:11,winner_side:(round.round_number+m.ladder_court_rank)%2===0?'A':'B',revision:m.revision+1,completed_at:new Date().toISOString()});return model.matches.filter(m=>m.round_id===round.id);};
  model.prepare=()=>{const current=model.rounds.find(r=>r.id===model.session.current_round_id);model.rounds=model.rounds.map(r=>r.id===current.id?{...r,status:'completed',completed_at:new Date().toISOString()}:r);const {round,slots,matches}=makeRound(current.round_number+1);model.rounds.push(round);model.slots.push(...slots);model.matches.push(...matches);model.session={...model.session,current_round_number:round.round_number,current_round_id:round.id,revision:model.session.revision+1};return {round,slots,matches};};
  model.state=()=>({session:model.session,participants:model.participants,rounds:model.rounds,slots:model.slots,matches:model.matches,fixedPairs:model.fixedPairs,currentAccessRole:'admin',isAdmin:true});
  return model;
}

async function mock(page,model){
  await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  await page.route(`**/api/apps/${APP_ID}/entities/KotcPlayerAggregate**`,route=>json(route,[]));
  await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
    const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';
    const body=await route.request().postDataJSON().catch(()=>({}));model.calls.push({name,body});
    if(name==='getKotcV2State')return json(route,model.state());
    if(name==='createKotcV2Session'){model.create();return json(route,{success:true});}
    if(name==='startKotcRound'){const round=model.start();return json(route,{success:true,session:model.session,round,slots:model.slots.filter(s=>s.round_id===round.id),matches:model.matches.filter(m=>m.round_id===round.id)});}
    if(name==='manageKotcTestSandbox'&&body.action==='fill_current_round_scores'){const matches=model.fill();return json(route,{success:true,roundNumber:model.session.current_round_number,filled:matches.length,matches});}
    if(name==='prepareKotcNextRound'){const x=model.prepare();return json(route,{success:true,session:model.session,round:x.round,slots:x.slots,matches:x.matches,participants:model.participants});}
    if(name==='manageKotcSessionAccess')return json(route,{success:true,grants:[]});
    if(name==='kotcResultsShare')return json(route,{success:true,token:'sandbox-live-token'});
    if(name==='manageKotcScorerLinks')return json(route,{success:true,token:'sandbox-scorer-token'});
    if(name==='kotcTimer')return json(route,{success:true});
    return json(route,{success:true});
  });
}

test('sandbox safety guards are hard-coded server-side',async()=>{
  const manage=fs.readFileSync('base44/functions/manageKotcTestSandbox/entry.ts','utf8');
  const create=fs.readFileSync('base44/functions/createKotcV2Session/entry.ts','utf8');
  const share=fs.readFileSync('base44/functions/kotcResultsShare/entry.ts','utf8');
  const aggregate=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
  expect(manage).toContain("Array.from({length:18}");
  expect(manage).toContain("session.demo_mode!==true||session.exclude_from_aggregates!==true");
  expect(manage).toContain("participants.some((p:any)=>!!p.player_id||p.participant_type!=='guest')");
  expect(create).toContain("member Player records are forbidden");
  expect(create).toContain("const testMode=sandboxTournament||");
  expect(share).toContain("Email Players is disabled for KOTC Test Sandbox / excluded sessions.");
  expect(aggregate).toContain("s.exclude_from_aggregates!==true");
});

test('18-player isolated sandbox creates, starts, fills and advances without real-member tools',async({page})=>{
  const model=makeModel();const errors=[];page.on('pageerror',e=>errors.push(e.message));await mock(page,model);
  await page.goto('/e2e/kotcSandboxHarness.html');
  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  await expect(page.getByText('18 players').first()).toBeVisible();
  await expect(page.getByText('Previous KOTC performance')).toBeVisible();
  expect(model.calls.some(c=>c.name==='KotcPlayerAggregate')).toBeFalsy();
  await page.getByRole('button',{name:'Test Player 17'}).click();
  await page.getByRole('button',{name:'Test Player 18'}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  expect(model.session.demo_mode).toBe(true);expect(model.session.exclude_from_aggregates).toBe(true);
  expect(model.participants).toHaveLength(18);expect(model.participants.every(p=>p.participant_type==='guest'&&!p.player_id)).toBe(true);
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByText(/Round 1 live/i)).toBeVisible();
  await expect(page.getByTestId('kotc-fill-save-sandbox-round')).toBeVisible();
  await page.getByTestId('kotc-fill-save-sandbox-round').click();
  await expect(page.getByText('✓ All scores saved for Round 1')).toBeVisible();
  expect(model.matches.filter(m=>m.round_number===1).every(m=>m.status==='completed')).toBe(true);
  await page.getByTestId('kotc-prepare-next-round').click();
  await expect(page.getByText('Round 2 ready')).toBeVisible();
  expect(model.session.current_round_number).toBe(2);
  await page.getByTestId('kotc-quick-links').click();
  await page.getByText('Session Links & Access').click();
  await expect(page.getByRole('button',{name:'Copy Live Link'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy Player Scoring Link'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy Host Link'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Grant Host Access'})).toBeVisible();
  expect(errors).toEqual([]);
});
