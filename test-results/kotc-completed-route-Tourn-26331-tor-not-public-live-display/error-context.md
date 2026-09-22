# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-completed-route.spec.mjs >> Tournament Control Centre → completed KOTC opens host review/editor, not public live display
- Location: e2e/kotc-completed-route.spec.mjs:14:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('830 Session').first()
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('830 Session').first() with timeout 3000ms
  - waiting for getByText('830 Session').first()

```

```yaml
- heading "Tournament Control Centre" [level=1]
- paragraph: 0 events · create, run and review competitions
- button "Create Competition":
  - img
  - text: Create Competition
- paragraph: Start a competition
- paragraph: Choose a featured format, add the event details, then continue into its dedicated setup.
- button "Import KOTC roster":
  - img
  - text: Import KOTC roster
- button "King of the Court Fast-moving court rotation for club sessions and social competition.":
  - img
  - img
  - paragraph: King of the Court
  - paragraph: Fast-moving court rotation for club sessions and social competition.
- button "Tournival Group play followed by a seeded knockout competition.":
  - img
  - img
  - paragraph: Tournival
  - paragraph: Group play followed by a seeded knockout competition.
- button "RallyHub Interclub Run an interclub event with fairness, live scoring and event-day controls.":
  - img
  - img
  - paragraph: RallyHub Interclub
  - paragraph: Run an interclub event with fairness, live scoring and event-day controls.
- img
- textbox "Search tournaments..."
- combobox: All Statuses
- img
- heading "No tournaments" [level=3]
- paragraph: Create your first tournament to get started
- button "Create Tournament"
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
  9  | const tournament={id:tournamentId,name:'830 Session',format:'King of the Court',status:'Completed',player_ids:playerIds,tenant_id:'tenant-clare',host_club_id:'club-clare',updated_date:'2026-09-10T21:04:39.291Z'};
  10 | const session={id:'session-830',tournament_id:tournamentId,tenant_id:'tenant-clare',club_id:'club-clare',name:'830 Session',status:'completed',current_round_number:8,current_round_id:'round-8',revision:16,play_minutes:8,scoring_mode:'timed',planned_rounds:30,actual_first_round_start:'2026-09-10T19:46:54.960Z',actual_session_end:'2026-09-10T21:04:35.397Z',exclude_from_aggregates:true};
  11 | const state={session,participants,rounds,slots:[],matches,fixedPairs:[],contactDirectory:{},currentUserId:'admin-user',currentAccessRole:'admin',isAdmin:true};
  12 | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  13 | 
  14 | test('Tournament Control Centre → completed KOTC opens host review/editor, not public live display',async({page})=>{
  15 |   const errors=[];const functionCalls=[];const emailPayloads=[];let previewAttempts=0;page.on('pageerror',e=>errors.push(e.message));
  16 |   await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  17 |   await page.route(`**/api/apps/${APP_ID}/entities/Tournament**`,route=>json(route,[tournament]));
  18 |   await page.route(`**/api/apps/${APP_ID}/entities/Player**`,route=>json(route,players));
  19 |   await page.route(`**/api/apps/${APP_ID}/entities/Match**`,route=>json(route,[]));
  20 |   await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
  21 |     const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';functionCalls.push(name);
  22 |     if(name==='getKotcV2State')return json(route,state);
  23 |     if(name==='kotcResultsShare'){let body={};try{body=route.request().postDataJSON()||{};}catch{}if(body.action==='email_preview'){previewAttempts++;if(previewAttempts===1){await new Promise(resolve=>setTimeout(resolve,250));return json(route,{success:false,error:'Results email preview failed while loading player email addresses: simulated provider failure',stage:'player emails'},200);}return json(route,{success:true,token:'share-token',fromName:'Clare Pickleball <clarepb2025@gmail.com>',subject:'830 Session — results & player link',sampleBody:'Hi [First name],\n\nThanks for playing in 830 Session.\n\nWe’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished.\n\nYour player link:\nhttps://rallyhub.ie/kotc-score/player-token\n\nOpen it and tap Refresh / View Results (or simply refresh the page) to see the final standings and where you finished for the evening.\n\nWe’ve also put together a simple infographic showing how to use the player link:\nhttps://base44.app/api/apps/test/files/player-guide.png\n\nYou can keep using this same link for this session — there is no separate results link to find.\n\nThanks for playing. Looking forward to seeing you on court again soon.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball\n\n—\nPowered by RallyHub',recipientCount:16,guestOrUnlinked:1,missingOrDuplicate:0,transportReady:true,transportMessage:'Ready to send from clarepb2025@gmail.com.',testRecipient:'brian.moore007@gmail.com',testRecipientName:'Brian Moore'});}if(body.action==='email_test'){emailPayloads.push(body);return json(route,{success:true,test:true,to:'brian.moore007@gmail.com',gmailMessageId:'gmail-test-1'});}if(body.action==='email_players'){emailPayloads.push(body);return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}return json(route,{success:true,token:'share-token'});}
  24 |     return json(route,{success:true});
  25 |   });
  26 |   await page.route(`**/api/apps/${APP_ID}/analytics/**`,route=>json(route,{success:true}));
  27 |   await page.goto('/e2e/kotcCompletedRouteHarness.html');
> 28 |   await expect(page.getByText('830 Session').first()).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  29 |   await expect(page.getByText('Review & edit results')).toBeVisible();
  30 |   await page.getByText('830 Session').first().click();
  31 |   await expect(page).toHaveURL(new RegExp(`/app/tournaments/${tournamentId}$`));
  32 |   await expect(page.getByText('Session complete')).toBeVisible();
  33 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  34 |   await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  35 |   await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  36 |   await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  37 |   await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  38 |   expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(0);
  39 |   await page.getByTestId('kotc-email-players').click();
  40 |   await expect(page.getByTestId('kotc-email-players')).toContainText('Loading preview…');
  41 |   await expect(page.getByTestId('kotc-email-players')).toBeDisabled();
  42 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Preview failed');
  43 |   await expect(page.getByTestId('kotc-email-players')).toContainText('Preview failed — retry');
  44 |   await page.getByTestId('kotc-email-players').click();
  45 |   await expect(page.getByTestId('kotc-email-preview')).toBeVisible();
  46 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('Clare Pickleball <clarepb2025@gmail.com>');
  47 |   await expect(page.getByTestId('kotc-email-subject')).toHaveValue('830 Session — results & player link');
  48 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Hi [First name]');
  49 |   await expect(page.getByTestId('kotc-email-body')).toContainText('same player link you used during the session');
  50 |   await expect(page.getByTestId('kotc-email-body')).toContainText('https://rallyhub.ie/kotc-score/player-token');
  51 |   await expect(page.getByTestId('kotc-email-body')).toContainText('simple infographic showing how to use the player link');
  52 |   await expect(page.getByTestId('kotc-email-body')).toContainText('https://base44.app/api/apps/test/files/player-guide.png');
  53 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Brian Moore');
  54 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Clare Pickleball');
  55 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Powered by RallyHub');
  56 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('16 players · 1 guest/unlinked excluded');
  57 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Send test email to Brian Moore');
  58 |   await expect(page.getByTestId('kotc-email-test')).toBeEnabled();
  59 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
  60 |   await page.getByTestId('kotc-email-subject').fill('Thursday KOTC — results');
  61 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nThanks for a great night. Your results are here.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  62 |   await page.getByTestId('kotc-email-test').click();
  63 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Test email sent to brian.moore007@gmail.com');
  64 |   await expect(page.getByTestId('kotc-email-send-all')).toBeEnabled();
  65 |   expect(emailPayloads[0].subject).toBe('Thursday KOTC — results');
  66 |   expect(emailPayloads[0].messageBody).toContain('Hi [First name]');
  67 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nUpdated wording.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  68 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
  69 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Send test email to Brian Moore');
  70 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Email changed');
  71 |   expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(3);
  72 |   expect(errors).toEqual([]);
  73 | });
  74 | 
```