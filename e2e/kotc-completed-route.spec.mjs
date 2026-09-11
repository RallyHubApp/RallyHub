import {test,expect} from '@playwright/test';
const APP_ID='6a01dc00702b7dd2a2978c28';
const tournamentId='6aa2df782975f38410d2a90a';
const playerIds=Array.from({length:16},(_,i)=>`player-${i+1}`);
const players=playerIds.map((id,i)=>({id,full_name:`Player ${i+1}`,status:'Active'}));
const participants=Array.from({length:17},(_,i)=>({id:`participant-${i+1}`,player_id:i<16?playerIds[i]:null,display_name:i<16?`Player ${i+1}`:'Guest Player',status:'present',rounds_played:7,fairness_benches:0,consecutive_rounds_played:0,consecutive_court1_rounds:0,court1_rounds:i<4?3:1}));
const rounds=[];const matches=[];
for(let r=1;r<=8;r++){const roundId=`round-${r}`;rounds.push({id:roundId,round_number:r,status:r<=7?'completed':'abandoned',proposal_revision:1,active_court_count:4,bench_count:1});for(let c=1;c<=4;c++){const base=((r-1)*4+c-1)*4;const ids=[0,1,2,3].map(k=>participants[(base+k)%16].id);matches.push({id:`m-${r}-${c}`,round_id:roundId,round_number:r,ladder_court_rank:c,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:r<=7?'completed':'not_played',team_a_score:r<=7?5+c:null,team_b_score:r<=7?3+c:null,winner_side:r<=7?'A':null,revision:1,correction_count:0});}}
const tournament={id:tournamentId,name:'830 Session',format:'King of the Court',status:'Completed',player_ids:playerIds,tenant_id:'tenant-clare',host_club_id:'club-clare',updated_date:'2026-09-10T21:04:39.291Z'};
const session={id:'session-830',tournament_id:tournamentId,tenant_id:'tenant-clare',club_id:'club-clare',name:'830 Session',status:'completed',current_round_number:8,current_round_id:'round-8',revision:16,play_minutes:8,scoring_mode:'timed',planned_rounds:30,actual_first_round_start:'2026-09-10T19:46:54.960Z',actual_session_end:'2026-09-10T21:04:35.397Z',exclude_from_aggregates:true};
const state={session,participants,rounds,slots:[],matches,fixedPairs:[],contactDirectory:{},currentUserId:'admin-user',currentAccessRole:'admin',isAdmin:true};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

test('Tournament Control Centre → completed KOTC opens host review/editor, not public live display',async({page})=>{
  const errors=[];const functionCalls=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  await page.route(`**/api/apps/${APP_ID}/entities/Tournament**`,route=>json(route,[tournament]));
  await page.route(`**/api/apps/${APP_ID}/entities/Player**`,route=>json(route,players));
  await page.route(`**/api/apps/${APP_ID}/entities/Match**`,route=>json(route,[]));
  await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
    const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';functionCalls.push(name);
    if(name==='getKotcV2State')return json(route,state);
    if(name==='kotcResultsShare'){let body={};try{body=route.request().postDataJSON()||{};}catch{}if(body.action==='email_preview')return json(route,{success:true,token:'share-token',fromName:'Brian Moore via RallyHub',subject:'830 Session — your results',sampleBody:'Hi [First name],\n\nHere are the results from 830 Session.\n\nView your results: https://rallyhub.ie/kotc-live/share-token\n\nThanks for playing. Looking forward to seeing you on court again soon.\n\nRegards,\nBrian Moore\nSession Host\nRallyHub',recipientCount:16,guestOrUnlinked:1,missingOrDuplicate:0,transportReady:false,transportMessage:'Club-wide email is not connected yet.'});if(body.action==='email_players')return json(route,{error:'Club-wide email is not connected.',transportReady:false},409);return json(route,{success:true,token:'share-token'});}
    return json(route,{success:true});
  });
  await page.route(`**/api/apps/${APP_ID}/analytics/**`,route=>json(route,{success:true}));
  await page.goto('/e2e/kotcCompletedRouteHarness.html');
  await expect(page.getByText('830 Session').first()).toBeVisible();
  await expect(page.getByText('Review & edit results')).toBeVisible();
  await page.getByText('830 Session').first().click();
  await expect(page).toHaveURL(new RegExp(`/app/tournaments/${tournamentId}$`));
  await expect(page.getByText('Session complete')).toBeVisible();
  await expect(page.getByText('Review & Correct Results')).toBeVisible();
  await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(0);
  await page.getByTestId('kotc-email-players').click();
  await expect(page.getByTestId('kotc-email-preview')).toBeVisible();
  await expect(page.getByTestId('kotc-email-preview')).toContainText('Brian Moore via RallyHub');
  await expect(page.getByTestId('kotc-email-preview')).toContainText('830 Session — your results');
  await expect(page.getByTestId('kotc-email-preview')).toContainText('Hi [First name]');
  await expect(page.getByTestId('kotc-email-preview')).toContainText('16 players · 1 guest/unlinked excluded');
  await expect(page.getByRole('button',{name:'Email sending not connected'})).toBeDisabled();
  expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(1);
  expect(errors).toEqual([]);
});
