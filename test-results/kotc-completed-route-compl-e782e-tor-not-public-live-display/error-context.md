# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-completed-route.spec.mjs >> completed KOTC tournament opens host review/editor, not public live display
- Location: e2e/kotc-completed-route.spec.mjs:14:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: '830 Session' }).first()
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: '830 Session' }).first() with timeout 3000ms
  - waiting for getByRole('heading', { name: '830 Session' }).first()

```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const APP_ID='6a01dc00702b7dd2a2978c28';
  3  | const tournamentId='6aa2df782975f38410d2a90a';
  4  | const playerIds=Array.from({length:16},(_,i)=>`player-${i+1}`);
  5  | const players=playerIds.map((id,i)=>({id,full_name:`Player ${i+1}`,status:'Active'}));
  6  | const participants=Array.from({length:17},(_,i)=>({id:`participant-${i+1}`,player_id:i<16?playerIds[i]:null,display_name:i<16?`Player ${i+1}`:'Guest Player',status:'present',rounds_played:7,fairness_benches:0,consecutive_rounds_played:0,consecutive_court1_rounds:0,court1_rounds:i<4?3:1}));
  7  | const rounds=[];const matches=[];
  8  | for(let r=1;r<=8;r++){const roundId=`round-${r}`;rounds.push({id:roundId,round_number:r,status:r<=7?'completed':'abandoned',proposal_revision:1,active_court_count:4,bench_count:1});for(let c=1;c<=4;c++){const base=((r-1)*4+c-1)*4;const ids=[0,1,2,3].map(k=>participants[(base+k)%16].id);matches.push({id:`m-${r}-${c}`,round_id:roundId,round_number:r,ladder_court_rank:c,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:r<=7?'completed':'not_played',team_a_score:r<=7?5+c:null,team_b_score:r<=7?3+c:null,winner_side:r<=7?'A':null,revision:1,correction_count:0});}}
  9  | const tournament={id:tournamentId,name:'830 Session',format:'King of the Court',status:'Completed',player_ids:playerIds,tenant_id:'tenant-clare',host_club_id:'club-clare'};
  10 | const session={id:'session-830',tournament_id:tournamentId,tenant_id:'tenant-clare',club_id:'club-clare',name:'830 Session',status:'completed',current_round_number:8,current_round_id:'round-8',revision:16,play_minutes:8,scoring_mode:'timed',planned_rounds:30,actual_first_round_start:'2026-09-10T19:46:54.960Z',actual_session_end:'2026-09-10T21:04:35.397Z',exclude_from_aggregates:true};
  11 | const state={session,participants,rounds,slots:[],matches,fixedPairs:[],contactDirectory:{},currentUserId:'admin-user',currentAccessRole:'admin',isAdmin:true};
  12 | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  13 | 
  14 | test('completed KOTC tournament opens host review/editor, not public live display',async({page})=>{
  15 |   const errors=[];page.on('pageerror',e=>errors.push(e.message));
  16 |   await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  17 |   await page.route(`**/api/apps/${APP_ID}/entities/Tournament**`,route=>json(route,[tournament]));
  18 |   await page.route(`**/api/apps/${APP_ID}/entities/Player**`,route=>json(route,players));
  19 |   await page.route(`**/api/apps/${APP_ID}/entities/Match**`,route=>json(route,[]));
  20 |   await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
  21 |     const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';
  22 |     if(name==='getKotcV2State')return json(route,state);
  23 |     if(name==='kotcResultsShare')return json(route,{success:true,token:'share-token'});
  24 |     return json(route,{success:true});
  25 |   });
  26 |   await page.route(`**/api/apps/${APP_ID}/analytics/**`,route=>json(route,{success:true}));
  27 |   await page.goto('/e2e/kotcCompletedRouteHarness.html');
> 28 |   await expect(page.getByRole('heading',{name:'830 Session'}).first()).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  29 |   await expect(page.getByText('Session complete')).toBeVisible();
  30 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  31 |   await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  32 |   await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  33 |   await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  34 |   await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  35 |   expect(errors).toEqual([]);
  36 | });
  37 | 
```