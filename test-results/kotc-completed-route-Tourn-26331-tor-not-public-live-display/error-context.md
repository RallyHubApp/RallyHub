# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-completed-route.spec.mjs >> Tournament Control Centre → completed KOTC opens host review/editor, not public live display
- Location: e2e/kotc-completed-route.spec.mjs:14:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('kotc-email-send-all')
Expected: 0
Received: 1
Timeout:  3000ms

Call log:
  - Expect "toHaveCount" getByTestId('kotc-email-send-all') with timeout 3000ms
  - waiting for getByTestId('kotc-email-send-all')
    10 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Back to Tournaments" [ref=e4] [cursor=pointer]:
    - /url: /app/tournaments
  - generic [ref=e7]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - paragraph [ref=e11]: King of the Court V2
        - heading "830 Session" [level=1] [ref=e12]
        - paragraph [ref=e13]: Session
      - generic [ref=e14]: CURRENT SESSION
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Session complete" [level=3] [ref=e24]
        - paragraph [ref=e25]: Final podium after 7 completed rounds. Detailed round scores remain available for review below.
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: 🥇
          - paragraph [ref=e29]: Gold
          - paragraph [ref=e30]: Player 1
          - paragraph [ref=e31]: 7W · 0L · +14
        - generic [ref=e32]:
          - generic [ref=e33]: 🥈
          - paragraph [ref=e34]: Silver
          - paragraph [ref=e35]: Player 2
          - paragraph [ref=e36]: 7W · 0L · +14
        - generic [ref=e37]:
          - generic [ref=e38]: 🥉
          - paragraph [ref=e39]: Bronze
          - paragraph [ref=e40]: Player 10
          - paragraph [ref=e41]: 7W · 0L · +14
      - generic [ref=e42]:
        - generic [ref=e43]:
          - paragraph [ref=e44]: Review & Correct Results
          - paragraph [ref=e45]: Choose any completed round and correct a court score. RallyHub recalculates the session standings/podium and member leaderboard. Historical court assignments are not rewritten.
        - generic [ref=e46]:
          - button "Round 1" [ref=e47] [cursor=pointer]
          - button "Round 2" [ref=e48] [cursor=pointer]
          - button "Round 3" [ref=e49] [cursor=pointer]
          - button "Round 4" [ref=e50] [cursor=pointer]
          - button "Round 5" [ref=e51] [cursor=pointer]
          - button "Round 6" [ref=e52] [cursor=pointer]
          - button "Round 7" [ref=e53] [cursor=pointer]
          - button "Round 8" [ref=e54] [cursor=pointer]
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]:
              - generic [ref=e58]: Court 1
              - generic [ref=e62]: SAVED
            - generic [ref=e63]:
              - generic [ref=e64]:
                - paragraph [ref=e65]: Team A
                - paragraph [ref=e66]: Player 1 & Player 2
                - paragraph [ref=e73]: WINNERS
              - textbox [disabled] [ref=e74]: "6"
            - generic [ref=e75]:
              - generic [ref=e76]:
                - paragraph [ref=e77]: Team B
                - paragraph [ref=e78]: Player 3 & Player 4
              - textbox [disabled] [ref=e79]: "4"
            - generic [ref=e80]: ✓ Saved 6–4 · Player 1 & Player 2 win 6–4
            - button "Edit result" [ref=e81] [cursor=pointer]
          - generic [ref=e82]:
            - generic [ref=e83]:
              - generic [ref=e84]: Court 2
              - generic [ref=e86]: SAVED
            - generic [ref=e87]:
              - generic [ref=e88]:
                - paragraph [ref=e89]: Team A
                - paragraph [ref=e90]: Player 5 & Player 6
                - paragraph [ref=e97]: WINNERS
              - textbox [disabled] [ref=e98]: "7"
            - generic [ref=e99]:
              - generic [ref=e100]:
                - paragraph [ref=e101]: Team B
                - paragraph [ref=e102]: Player 7 & Player 8
              - textbox [disabled] [ref=e103]: "5"
            - generic [ref=e104]: ✓ Saved 7–5 · Player 5 & Player 6 win 7–5
            - button "Edit result" [ref=e105] [cursor=pointer]
          - generic [ref=e106]:
            - generic [ref=e107]:
              - generic [ref=e108]: Court 3
              - generic [ref=e110]: SAVED
            - generic [ref=e111]:
              - generic [ref=e112]:
                - paragraph [ref=e113]: Team A
                - paragraph [ref=e114]: Player 9 & Player 10
                - paragraph [ref=e121]: WINNERS
              - textbox [disabled] [ref=e122]: "8"
            - generic [ref=e123]:
              - generic [ref=e124]:
                - paragraph [ref=e125]: Team B
                - paragraph [ref=e126]: Player 11 & Player 12
              - textbox [disabled] [ref=e127]: "6"
            - generic [ref=e128]: ✓ Saved 8–6 · Player 9 & Player 10 win 8–6
            - button "Edit result" [ref=e129] [cursor=pointer]
          - generic [ref=e130]:
            - generic [ref=e131]:
              - generic [ref=e132]: Court 4
              - generic [ref=e134]: SAVED
            - generic [ref=e135]:
              - generic [ref=e136]:
                - paragraph [ref=e137]: Team A
                - paragraph [ref=e138]: Player 13 & Player 14
                - paragraph [ref=e145]: WINNERS
              - textbox [disabled] [ref=e146]: "9"
            - generic [ref=e147]:
              - generic [ref=e148]:
                - paragraph [ref=e149]: Team B
                - paragraph [ref=e150]: Player 15 & Player 16
              - textbox [disabled] [ref=e151]: "7"
            - generic [ref=e152]: ✓ Saved 9–7 · Player 13 & Player 14 win 9–7
            - button "Edit result" [ref=e153] [cursor=pointer]
      - generic [ref=e154]:
        - generic [ref=e155]:
          - button "Share Results" [ref=e156] [cursor=pointer]
          - button "Copy Results Link" [ref=e157] [cursor=pointer]
          - button "Preview ready" [ref=e158] [cursor=pointer]
        - generic [ref=e159]:
          - generic [ref=e160]:
            - generic [ref=e161]:
              - paragraph [ref=e162]: Results email preview
              - paragraph [ref=e163]: Nothing is sent until you confirm below.
            - button "Close" [ref=e164] [cursor=pointer]
          - generic [ref=e165]:
            - generic [ref=e166]:
              - text: From
              - paragraph [ref=e167]: Clare Pickleball <clarepb2025@gmail.com>
            - generic [ref=e168]:
              - text: To
              - paragraph [ref=e169]: 16 players · 1 guest/unlinked excluded
          - generic [ref=e170]:
            - text: Subject
            - textbox [ref=e171]: 830 Session — results & player link
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]: Message
              - generic [ref=e175]: Use [First name] to personalise each email
            - textbox [ref=e176]: "Hi [First name], Thanks for playing in 830 Session. We’ve made a small update to RallyHub. The same player link you used during the session now becomes your results link once King of the Court is finished. Open your RallyHub player link Open it and tap Refresh / View Results (or simply refresh the page) to see the final podium and completed round results. Full individual rankings are not published on the shared results page. We’ve also put together a simple infographic showing how to use the player link: Clare Pickleball Player Link Infographic You can keep using this same link for this session — there is no separate results link to find. Thanks for playing. Looking forward to seeing you on court again soon. Regards, Brian Moore Session Host Clare Pickleball — Powered by RallyHub"
            - paragraph [ref=e177]: You can edit the wording above. RallyHub inserts the clickable player-link and infographic links automatically when the email is sent.
            - generic [ref=e178]:
              - link "Open your RallyHub player link" [ref=e179] [cursor=pointer]:
                - /url: https://rallyhub.ie/kotc-score/player-token
              - link "Clare Pickleball Player Link Infographic" [ref=e180] [cursor=pointer]:
                - /url: https://rallyhub.ie/guides/clare-pickleball/player-link
          - generic [ref=e181]: Ready to send from clarepb2025@gmail.com.
          - generic [ref=e182]:
            - button "Send to 16 Players" [ref=e183] [cursor=pointer]
            - 'button "Optional: send test email to Brian Moore" [ref=e184] [cursor=pointer]'
            - paragraph [ref=e185]: Review the preview before sending. Sending a test email is optional.
        - generic [ref=e186]: Preview ready · 16 recipients · nothing sent yet
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
  57 |   await expect(page.getByTestId('kotc-email-preview').locator('a[href="https://rallyhub.ie/guides/clare-pickleball/player-link"]')).toBeVisible();
  58 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Brian Moore');
  59 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Clare Pickleball');
  60 |   await expect(page.getByTestId('kotc-email-body')).toContainText('Powered by RallyHub');
  61 |   await expect(page.getByTestId('kotc-email-preview')).toContainText('16 players · 1 guest/unlinked excluded');
  62 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Optional: send test email to Brian Moore');
  63 |   await expect(page.getByTestId('kotc-email-test')).toBeEnabled();
> 64 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
     |                                                         ^ Error: expect(locator).toHaveCount(expected) failed
  65 |   await page.getByTestId('kotc-email-subject').fill('Thursday KOTC — results');
  66 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nThanks for a great night. Your results are here.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  67 |   await page.getByTestId('kotc-email-test').click();
  68 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Test email sent to brian.moore007@gmail.com');
  69 |   await expect(page.getByTestId('kotc-email-send-all')).toBeEnabled();
  70 |   expect(emailPayloads[0].subject).toBe('Thursday KOTC — results');
  71 |   expect(emailPayloads[0].messageBody).toContain('Hi [First name]');
  72 |   await page.getByTestId('kotc-email-body').fill('Hi [First name],\n\nUpdated wording.\n\nRegards,\nBrian Moore\nSession Host\nClare Pickleball');
  73 |   await expect(page.getByTestId('kotc-email-send-all')).toHaveCount(0);
  74 |   await expect(page.getByTestId('kotc-email-test')).toContainText('Optional: send test email to Brian Moore');
  75 |   await expect(page.getByTestId('kotc-email-status')).toContainText('Email changed');
  76 |   expect(functionCalls.filter(x=>x==='kotcResultsShare')).toHaveLength(3);
  77 |   expect(errors).toEqual([]);
  78 | });
  79 | 
```