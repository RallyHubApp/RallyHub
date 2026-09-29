# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-completed-route.spec.mjs >> Tournament Control Centre → completed KOTC opens host review/editor, not public live display
- Location: e2e/kotc-completed-route.spec.mjs:14:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-email-preview')
Timeout: 3000ms
- Expected substring  -  1
+ Received string     + 24

- https://rallyhub.ie/guides/clare-pickleball/player-link
+ Results email previewNothing is sent until you confirm below.CloseFromClare Pickleball <clarepb2025@gmail.com>To16 players · 1 guest/unlinked excludedSubjectMessageUse [First name] to personalise each emailHi [First name],
+
+ Thanks for playing in 830 Session.
+
+ We’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished.
+
+ Open your RallyHub player link
+
+ Open it and tap Refresh / View Results (or simply refresh the page) to see the final podium and completed round results. Full individual rankings are not published on the shared results page.
+
+ We’ve also put together a simple infographic showing how to use the player link:
+ Clare Pickleball Player Link Infographic
+
+ You can keep using this same link for this session — there is no separate results link to find.
+
+ Thanks for playing. Looking forward to seeing you on court again soon.
+
+ Regards,
+ Brian Moore
+ Session Host
+ Clare Pickleball
+
+ —
+ Powered by RallyHubYou can edit the wording above. RallyHub inserts the clickable player-link and infographic links automatically when the email is sent.Open your RallyHub player linkClare Pickleball Player Link InfographicReady to send from clarepb2025@gmail.com.Send test email to Brian MooreThis sends one email to brian.moore007@gmail.com. The player send unlocks only after the test succeeds.

Call log:
  - Expect "toContainText" getByTestId('kotc-email-preview') with timeout 3000ms
  - waiting for getByTestId('kotc-email-preview')
    9 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-email-preview" data-collection-item-field="transportMessage" data-source-location="src/components/kotc/KotcV2SessionView.jsx:302:3652" class="fixed inset-3 sm:inset-x-[12%] sm:inset-y-8 z-[100] overflow-y-auto rounded-2xl border border-primary/30 bg-background p-4 sm:p-6 space-y-4 shadow-2xl">…</div>
      - unexpected value "Results email previewNothing is sent until you confirm below.CloseFromClare Pickleball <clarepb2025@gmail.com>To16 players · 1 guest/unlinked excludedSubjectMessageUse [First name] to personalise each emailHi [First name],

Thanks for playing in 830 Session.

We’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished.

Open your RallyHub player link

Open it and tap Refresh / View Results (or simply refresh the page) to see the final podium and completed round results. Full individual rankings are not published on the shared results page.

We’ve also put together a simple infographic showing how to use the player link:
Clare Pickleball Player Link Infographic

You can keep using this same link for this session — there is no separate results link to find.

Thanks for playing. Looking forward to seeing you on court again soon.

Regards,
Brian Moore
Session Host
Clare Pickleball

—
Powered by RallyHubYou can edit the wording above. RallyHub inserts the clickable player-link and infographic links automatically when the email is sent.Open your RallyHub player linkClare Pickleball Player Link InfographicReady to send from clarepb2025@gmail.com.Send test email to Brian MooreThis sends one email to brian.moore007@gmail.com. The player send unlocks only after the test succeeds."

```

```yaml
- paragraph: Results email preview
- paragraph: Nothing is sent until you confirm below.
- button "Close"
- text: From
- paragraph: Clare Pickleball <clarepb2025@gmail.com>
- text: To
- paragraph: 16 players · 1 guest/unlinked excluded
- text: Subject
- textbox: 830 Session — results & player link
- text: Message Use [First name] to personalise each email
- textbox: "Hi [First name], Thanks for playing in 830 Session. We’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished. Open your RallyHub player link Open it and tap Refresh / View Results (or simply refresh the page) to see the final podium and completed round results. Full individual rankings are not published on the shared results page. We’ve also put together a simple infographic showing how to use the player link: Clare Pickleball Player Link Infographic You can keep using this same link for this session — there is no separate results link to find. Thanks for playing. Looking forward to seeing you on court again soon. Regards, Brian Moore Session Host Clare Pickleball — Powered by RallyHub"
- paragraph: You can edit the wording above. RallyHub inserts the clickable player-link and infographic links automatically when the email is sent.
- link "Open your RallyHub player link":
  - /url: https://rallyhub.ie/kotc-score/player-token
- link "Clare Pickleball Player Link Infographic":
  - /url: https://rallyhub.ie/guides/clare-pickleball/player-link
- text: Ready to send from clarepb2025@gmail.com.
- button "Send test email to Brian Moore"
- paragraph: This sends one email to brian.moore007@gmail.com. The player send unlocks only after the test succeeds.
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
  16 |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','kotc-completed-e2e-token'));
  17 |   await page.route('**/api/apps/public/**',route=>json(route,{id:'test',public_settings:{}}));
  18 |   await page.route(`**/api/apps/${APP_ID}/entities/User/me`,route=>json(route,{id:'admin-user',email:'admin@example.test',full_name:'Brian Moore',role:'admin',approval_status:'approved',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_role:'club_admin',kotc_role:'super_admin'}));
  19 |   await page.route(`**/api/apps/${APP_ID}/entities/Tournament**`,route=>json(route,[tournament]));
  20 |   await page.route(`**/api/apps/${APP_ID}/entities/Player**`,route=>json(route,players));
  21 |   await page.route(`**/api/apps/${APP_ID}/entities/Match**`,route=>json(route,[]));
  22 |   await page.route(`**/api/apps/${APP_ID}/functions/**`,async route=>{
  23 |     const name=new URL(route.request().url()).pathname.split('/functions/')[1]?.split('/')[0]||'';functionCalls.push(name);
  24 |     if(name==='securityContext')return json(route,{success:true,context:null});
  25 |     if(name==='getKotcV2State')return json(route,state);
  26 |     if(name==='kotcResultsShare'){let body={};try{body=route.request().postDataJSON()||{};}catch{}if(body.action==='email_preview'){previewAttempts++;if(previewAttempts===1){await new Promise(resolve=>setTimeout(resolve,250));return json(route,{success:false,error:'Results email preview failed while loading player email addresses: simulated provider failure',stage:'player emails'},200);}return json(route,{success:true,token:'share-token',fromName:'Clare Pickleball <clarepb2025@gmail.com>',subject:'830 Session — results & player link',sampleBody:'Hi [First name],\n\nThanks for playing in 830 Session.\n\nWe’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished.\n\nOpen your RallyHub player link\n\nOpen it and tap Refresh / View Results (or simply refresh the page) to see the final podium and completed round results. Full individual rankings are not published on the shared results page.\n\nWe’ve also put together a simple infographic showing how to use the player link:\nClare Pickleball Player Link Infographic\n\nYou can keep using this same link for this session — there is no separate results link to find.\n\nThanks for playing. Looking forward to seeing you on court again soon.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball\n\n—\nPowered by RallyHub',playerLink:'https://rallyhub.ie/kotc-score/player-token',playerLinkLabel:'Open your RallyHub player link',guideUrl:'https://rallyhub.ie/guides/clare-pickleball/player-link',guideLabel:'Clare Pickleball Player Link Infographic',recipientCount:16,guestOrUnlinked:1,missingOrDuplicate:0,transportReady:true,transportMessage:'Ready to send from clarepb2025@gmail.com.',testRecipient:'brian.moore007@gmail.com',testRecipientName:'Brian Moore'});}if(body.action==='email_test'){emailPayloads.push(body);return json(route,{success:true,test:true,to:'brian.moore007@gmail.com',gmailMessageId:'gmail-test-1'});}if(body.action==='email_players'){emailPayloads.push(body);return json(route,{success:true,sent:16,skipped:1,alreadySent:0,failed:0});}return json(route,{success:true,token:'share-token'});}
  27 |     return json(route,{success:true});
  28 |   });
  29 |   await page.route(`**/api/apps/${APP_ID}/analytics/**`,route=>json(route,{success:true}));
  30 |   await page.goto('/e2e/kotcCompletedRouteHarness.html');
  31 |   await expect(page.getByText('830 Session').first()).toBeVisible();
  32 |   await expect(page.getByText('Review & edit results')).toBeVisible();
  33 |   await page.getByText('830 Session').first().click();
  34 |   await expect(page).toHaveURL(new RegExp(`/app/tournaments/${tournamentId}$`));
  35 |   await expect(page.getByText('Session complete')).toBeVisible();
  36 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  37 |   await expect(page.getByRole('button',{name:'Share Results'})).toBeVisible();
  38 |   await expect(page.getByRole('button',{name:'Copy Results Link'})).toBeVisible();
  39 |   await expect(page.getByRole('button',{name:'Email Players'})).toBeVisible();
  40 |   await expect(page.getByText('King of the Court · Hall Display')).toHaveCount(0);
  41 |   expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(0);
  42 |   await page.getByTestId('kotc-email-players').click();
  43 |   await expect(page.getByTestId('kotc-email-players')).toContainText('Loading preview…');
  44 |   await expect(page.getByTestId('kotc-email-players')).toBeDisabled();
  45 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Preview failed');
  46 |   await expect(page.getByTestId('kotc-email-players')).toContainText('Preview failed — retry');
  47 |   await page.getByTestId('kotc-email-players').click();
  48 |   await expect(page.getByTestId('kotc-email-preview')).toBeVisible();
  49 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('Clare Pickleball <clarepb2025@gmail.com>');
  50 |   await expect(page.getByTestId('kotc-email-subject')).toHaveValue('830 Session — results & player link');
  51 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Hi [First name]');
  52 |   await expect(page.getByTestId('kotc-email-body')).toContainText('same player link you used during the session');
  53 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Open your RallyHub player link');
  54 |   await expect(page.getByTestId('kotc-email-body')).not.toContainText('base44.app');
  55 |   await expect(page.getByTestId('kotc-email-body')).toContainText('simple infographic showing how to use the player link');
  56 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Clare Pickleball Player Link Infographic');
> 57 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('https://rallyhub.ie/guides/clare-pickleball/player-link');
     |                                                        ^ Error: expect(locator).toContainText(expected) failed
  58 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Brian Moore');
  59 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Clare Pickleball');
  60 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Powered by RallyHub');
  61 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('16 players · 1 guest/unlinked excluded');
  62 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Send test email to Brian Moore');
  63 |   await expect(page.getByTestId('kotc-email-test')).toBeEnabled();
  64 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
  65 |   await page.getByTestId('kotc-email-subject').fill('Thursday KOTC — results');
  66 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nThanks for a great night. Your results are here.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  67 |   await page.getByTestId('kotc-email-test').click();
  68 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Test email sent to brian.moore007@gmail.com');
  69 |   await expect(page.getByTestId('kotc-email-send-all')).toBeEnabled();
  70 |   expect(emailPayloads[0].subject).toBe('Thursday KOTC — results');
  71 |   expect(emailPayloads[0].messageBody).toContain('Hi [First name]');
  72 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nUpdated wording.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  73 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
  74 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Send test email to Brian Moore');
  75 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Email changed');
  76 |   expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(3);
  77 |   expect(errors).toEqual([]);
  78 | });
  79 | 
```