# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:233:1

# Error details

```
Error: ranking_ack_ms should be <= 350ms but was 359ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 350
Received:    359
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - paragraph [ref=e6]: Saving player ranking… one command sent
        - paragraph [ref=e7]: RallyHub has accepted your tap. Keep this screen open; the control stays locked until the action resolves.
      - generic [ref=e8]:
        - generic [ref=e14]:
          - paragraph [ref=e15]: RallyHub Interclub
          - paragraph [ref=e16]: "Interclub Challenge · Status: draft"
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: CL
              - generic [ref=e21]: Clare Pickleball Club
            - generic [ref=e22]: vs
            - generic [ref=e23]:
              - generic [ref=e24]: GA
              - generic [ref=e25]: Galway Pickleball
          - button "Public Links / QR" [ref=e26] [cursor=pointer]
      - generic [ref=e28]:
        - button [ref=e29] [cursor=pointer]
        - button "2 Teams" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: "2"
          - text: Teams
        - button "3 Draw" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]: "3"
          - text: Draw
        - button "4 Live Event" [ref=e38] [cursor=pointer]:
          - generic [ref=e39]: "4"
          - text: Live Event
        - button "5 Simulator" [ref=e40] [cursor=pointer]:
          - generic [ref=e41]: "5"
          - text: Simulator
        - button "6 Results" [ref=e42] [cursor=pointer]:
          - generic [ref=e43]: "6"
          - text: Results
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e48]: Participants
            - paragraph [ref=e49]: Event ranks are independent of permanent RallyHub skill ratings.
          - button "Practice with 32 Test Players" [ref=e50] [cursor=pointer]
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]:
                - paragraph [ref=e55]: Clare Pickleball Club
                - paragraph [ref=e56]: Add manually or import confirmed attendees from Spond.
              - button "Import Spond" [ref=e57] [cursor=pointer]
            - generic [ref=e58]:
              - textbox "Add Clare Pickleball Club player" [ref=e59]
              - button [disabled]
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e62]:
                - paragraph [ref=e63]: Galway Pickleball
                - paragraph [ref=e64]: Add manually or import confirmed attendees from Spond.
              - button "Import Spond" [ref=e65] [cursor=pointer]
            - generic [ref=e66]:
              - textbox "Add Galway Pickleball player" [ref=e67]
              - button [disabled]
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Clare Pickleball Club
                - paragraph [ref=e73]: "Strongest #1 → developing"
              - generic [ref=e74]: "16"
            - generic [ref=e75]:
              - generic [ref=e76]:
                - button [ref=e77] [cursor=pointer]
                - generic [ref=e85]: "1"
                - generic [ref=e86]: Club A Test 01
                - generic [ref=e87]: Male
                - generic [ref=e88]:
                  - button "Move Club A Test 01 up" [disabled] [ref=e89]
                  - button "Move Club A Test 01 down" [ref=e92] [cursor=pointer]
              - generic [ref=e95]:
                - button [ref=e96] [cursor=pointer]
                - generic [ref=e104]: "2"
                - generic [ref=e105]: Club A Test 02
                - generic [ref=e106]: Female
                - generic [ref=e107]:
                  - button "Move Club A Test 02 up" [active] [ref=e108] [cursor=pointer]
                  - button "Move Club A Test 02 down" [ref=e111] [cursor=pointer]
              - generic [ref=e114]:
                - button [ref=e115] [cursor=pointer]
                - generic [ref=e123]: "3"
                - generic [ref=e124]: Club A Test 03
                - generic [ref=e125]: Male
                - generic [ref=e126]:
                  - button "Move Club A Test 03 up" [ref=e127] [cursor=pointer]
                  - button "Move Club A Test 03 down" [ref=e130] [cursor=pointer]
              - generic [ref=e133]:
                - button [ref=e134] [cursor=pointer]
                - generic [ref=e142]: "4"
                - generic [ref=e143]: Club A Test 04
                - generic [ref=e144]: Female
                - generic [ref=e145]:
                  - button "Move Club A Test 04 up" [ref=e146] [cursor=pointer]
                  - button "Move Club A Test 04 down" [ref=e149] [cursor=pointer]
              - generic [ref=e152]:
                - button [ref=e153] [cursor=pointer]
                - generic [ref=e161]: "5"
                - generic [ref=e162]: Club A Test 05
                - generic [ref=e163]: Male
                - generic [ref=e164]:
                  - button "Move Club A Test 05 up" [ref=e165] [cursor=pointer]
                  - button "Move Club A Test 05 down" [ref=e168] [cursor=pointer]
              - generic [ref=e171]:
                - button [ref=e172] [cursor=pointer]
                - generic [ref=e180]: "6"
                - generic [ref=e181]: Club A Test 06
                - generic [ref=e182]: Female
                - generic [ref=e183]:
                  - button "Move Club A Test 06 up" [ref=e184] [cursor=pointer]
                  - button "Move Club A Test 06 down" [ref=e187] [cursor=pointer]
              - generic [ref=e190]:
                - button [ref=e191] [cursor=pointer]
                - generic [ref=e199]: "7"
                - generic [ref=e200]: Club A Test 07
                - generic [ref=e201]: Male
                - generic [ref=e202]:
                  - button "Move Club A Test 07 up" [ref=e203] [cursor=pointer]
                  - button "Move Club A Test 07 down" [ref=e206] [cursor=pointer]
              - generic [ref=e209]:
                - button [ref=e210] [cursor=pointer]
                - generic [ref=e218]: "8"
                - generic [ref=e219]: Club A Test 08
                - generic [ref=e220]: Female
                - generic [ref=e221]:
                  - button "Move Club A Test 08 up" [ref=e222] [cursor=pointer]
                  - button "Move Club A Test 08 down" [ref=e225] [cursor=pointer]
              - generic [ref=e228]:
                - button [ref=e229] [cursor=pointer]
                - generic [ref=e237]: "9"
                - generic [ref=e238]: Club A Test 09
                - generic [ref=e239]: Male
                - generic [ref=e240]:
                  - button "Move Club A Test 09 up" [ref=e241] [cursor=pointer]
                  - button "Move Club A Test 09 down" [ref=e244] [cursor=pointer]
              - generic [ref=e247]:
                - button [ref=e248] [cursor=pointer]
                - generic [ref=e256]: "10"
                - generic [ref=e257]: Club A Test 10
                - generic [ref=e258]: Female
                - generic [ref=e259]:
                  - button "Move Club A Test 10 up" [ref=e260] [cursor=pointer]
                  - button "Move Club A Test 10 down" [ref=e263] [cursor=pointer]
              - generic [ref=e266]:
                - button [ref=e267] [cursor=pointer]
                - generic [ref=e275]: "11"
                - generic [ref=e276]: Club A Test 11
                - generic [ref=e277]: Male
                - generic [ref=e278]:
                  - button "Move Club A Test 11 up" [ref=e279] [cursor=pointer]
                  - button "Move Club A Test 11 down" [ref=e282] [cursor=pointer]
              - generic [ref=e285]:
                - button [ref=e286] [cursor=pointer]
                - generic [ref=e294]: "12"
                - generic [ref=e295]: Club A Test 12
                - generic [ref=e296]: Female
                - generic [ref=e297]:
                  - button "Move Club A Test 12 up" [ref=e298] [cursor=pointer]
                  - button "Move Club A Test 12 down" [ref=e301] [cursor=pointer]
              - generic [ref=e304]:
                - button [ref=e305] [cursor=pointer]
                - generic [ref=e313]: "13"
                - generic [ref=e314]: Club A Test 13
                - generic [ref=e315]: Male
                - generic [ref=e316]:
                  - button "Move Club A Test 13 up" [ref=e317] [cursor=pointer]
                  - button "Move Club A Test 13 down" [ref=e320] [cursor=pointer]
              - generic [ref=e323]:
                - button [ref=e324] [cursor=pointer]
                - generic [ref=e332]: "14"
                - generic [ref=e333]: Club A Test 14
                - generic [ref=e334]: Female
                - generic [ref=e335]:
                  - button "Move Club A Test 14 up" [ref=e336] [cursor=pointer]
                  - button "Move Club A Test 14 down" [ref=e339] [cursor=pointer]
              - generic [ref=e342]:
                - button [ref=e343] [cursor=pointer]
                - generic [ref=e351]: "15"
                - generic [ref=e352]: Club A Test 15
                - generic [ref=e353]: Male
                - generic [ref=e354]:
                  - button "Move Club A Test 15 up" [ref=e355] [cursor=pointer]
                  - button "Move Club A Test 15 down" [ref=e358] [cursor=pointer]
              - generic [ref=e361]:
                - button [ref=e362] [cursor=pointer]
                - generic [ref=e370]: "16"
                - generic [ref=e371]: Club A Test 16
                - generic [ref=e372]: Female
                - generic [ref=e373]:
                  - button "Move Club A Test 16 up" [ref=e374] [cursor=pointer]
                  - button "Move Club A Test 16 down" [disabled] [ref=e377]
          - generic [ref=e380]:
            - generic [ref=e381]:
              - generic [ref=e382]:
                - paragraph [ref=e383]: Galway Pickleball
                - paragraph [ref=e384]: "Strongest #1 → developing"
              - generic [ref=e385]: "16"
            - generic [ref=e386]:
              - generic [ref=e387]:
                - button [ref=e388] [cursor=pointer]
                - generic [ref=e396]: "1"
                - generic [ref=e397]: Club B Test 01
                - generic [ref=e398]: Male
                - generic [ref=e399]:
                  - button "Move Club B Test 01 up" [disabled] [ref=e400]
                  - button "Move Club B Test 01 down" [ref=e403] [cursor=pointer]
              - generic [ref=e406]:
                - button [ref=e407] [cursor=pointer]
                - generic [ref=e415]: "2"
                - generic [ref=e416]: Club B Test 02
                - generic [ref=e417]: Female
                - generic [ref=e418]:
                  - button "Move Club B Test 02 up" [ref=e419] [cursor=pointer]
                  - button "Move Club B Test 02 down" [ref=e422] [cursor=pointer]
              - generic [ref=e425]:
                - button [ref=e426] [cursor=pointer]
                - generic [ref=e434]: "3"
                - generic [ref=e435]: Club B Test 03
                - generic [ref=e436]: Male
                - generic [ref=e437]:
                  - button "Move Club B Test 03 up" [ref=e438] [cursor=pointer]
                  - button "Move Club B Test 03 down" [ref=e441] [cursor=pointer]
              - generic [ref=e444]:
                - button [ref=e445] [cursor=pointer]
                - generic [ref=e453]: "4"
                - generic [ref=e454]: Club B Test 04
                - generic [ref=e455]: Female
                - generic [ref=e456]:
                  - button "Move Club B Test 04 up" [ref=e457] [cursor=pointer]
                  - button "Move Club B Test 04 down" [ref=e460] [cursor=pointer]
              - generic [ref=e463]:
                - button [ref=e464] [cursor=pointer]
                - generic [ref=e472]: "5"
                - generic [ref=e473]: Club B Test 05
                - generic [ref=e474]: Male
                - generic [ref=e475]:
                  - button "Move Club B Test 05 up" [ref=e476] [cursor=pointer]
                  - button "Move Club B Test 05 down" [ref=e479] [cursor=pointer]
              - generic [ref=e482]:
                - button [ref=e483] [cursor=pointer]
                - generic [ref=e491]: "6"
                - generic [ref=e492]: Club B Test 06
                - generic [ref=e493]: Female
                - generic [ref=e494]:
                  - button "Move Club B Test 06 up" [ref=e495] [cursor=pointer]
                  - button "Move Club B Test 06 down" [ref=e498] [cursor=pointer]
              - generic [ref=e501]:
                - button [ref=e502] [cursor=pointer]
                - generic [ref=e510]: "7"
                - generic [ref=e511]: Club B Test 07
                - generic [ref=e512]: Male
                - generic [ref=e513]:
                  - button "Move Club B Test 07 up" [ref=e514] [cursor=pointer]
                  - button "Move Club B Test 07 down" [ref=e517] [cursor=pointer]
              - generic [ref=e520]:
                - button [ref=e521] [cursor=pointer]
                - generic [ref=e529]: "8"
                - generic [ref=e530]: Club B Test 08
                - generic [ref=e531]: Female
                - generic [ref=e532]:
                  - button "Move Club B Test 08 up" [ref=e533] [cursor=pointer]
                  - button "Move Club B Test 08 down" [ref=e536] [cursor=pointer]
              - generic [ref=e539]:
                - button [ref=e540] [cursor=pointer]
                - generic [ref=e548]: "9"
                - generic [ref=e549]: Club B Test 09
                - generic [ref=e550]: Male
                - generic [ref=e551]:
                  - button "Move Club B Test 09 up" [ref=e552] [cursor=pointer]
                  - button "Move Club B Test 09 down" [ref=e555] [cursor=pointer]
              - generic [ref=e558]:
                - button [ref=e559] [cursor=pointer]
                - generic [ref=e567]: "10"
                - generic [ref=e568]: Club B Test 10
                - generic [ref=e569]: Female
                - generic [ref=e570]:
                  - button "Move Club B Test 10 up" [ref=e571] [cursor=pointer]
                  - button "Move Club B Test 10 down" [ref=e574] [cursor=pointer]
              - generic [ref=e577]:
                - button [ref=e578] [cursor=pointer]
                - generic [ref=e586]: "11"
                - generic [ref=e587]: Club B Test 11
                - generic [ref=e588]: Male
                - generic [ref=e589]:
                  - button "Move Club B Test 11 up" [ref=e590] [cursor=pointer]
                  - button "Move Club B Test 11 down" [ref=e593] [cursor=pointer]
              - generic [ref=e596]:
                - button [ref=e597] [cursor=pointer]
                - generic [ref=e605]: "12"
                - generic [ref=e606]: Club B Test 12
                - generic [ref=e607]: Female
                - generic [ref=e608]:
                  - button "Move Club B Test 12 up" [ref=e609] [cursor=pointer]
                  - button "Move Club B Test 12 down" [ref=e612] [cursor=pointer]
              - generic [ref=e615]:
                - button [ref=e616] [cursor=pointer]
                - generic [ref=e624]: "13"
                - generic [ref=e625]: Club B Test 13
                - generic [ref=e626]: Male
                - generic [ref=e627]:
                  - button "Move Club B Test 13 up" [ref=e628] [cursor=pointer]
                  - button "Move Club B Test 13 down" [ref=e631] [cursor=pointer]
              - generic [ref=e634]:
                - button [ref=e635] [cursor=pointer]
                - generic [ref=e643]: "14"
                - generic [ref=e644]: Club B Test 14
                - generic [ref=e645]: Female
                - generic [ref=e646]:
                  - button "Move Club B Test 14 up" [ref=e647] [cursor=pointer]
                  - button "Move Club B Test 14 down" [ref=e650] [cursor=pointer]
              - generic [ref=e653]:
                - button [ref=e654] [cursor=pointer]
                - generic [ref=e662]: "15"
                - generic [ref=e663]: Club B Test 15
                - generic [ref=e664]: Male
                - generic [ref=e665]:
                  - button "Move Club B Test 15 up" [ref=e666] [cursor=pointer]
                  - button "Move Club B Test 15 down" [ref=e669] [cursor=pointer]
              - generic [ref=e672]:
                - button [ref=e673] [cursor=pointer]
                - generic [ref=e681]: "16"
                - generic [ref=e682]: Club B Test 16
                - generic [ref=e683]: Female
                - generic [ref=e684]:
                  - button "Move Club B Test 16 up" [ref=e685] [cursor=pointer]
                  - button "Move Club B Test 16 down" [disabled] [ref=e688]
        - generic [ref=e691]:
          - generic [ref=e692]:
            - paragraph [ref=e693]: "12"
            - paragraph [ref=e694]: Rounds
          - generic [ref=e695]:
            - paragraph [ref=e696]: "48"
            - paragraph [ref=e697]: Matches
          - generic [ref=e698]:
            - paragraph [ref=e699]: 6–6
            - paragraph [ref=e700]: Games/player
          - generic [ref=e701]:
            - paragraph [ref=e702]: "164"
            - paragraph [ref=e703]: Structured min
          - generic [ref=e704]:
            - paragraph [ref=e705]: "16"
            - paragraph [ref=e706]: Contingency min
        - button "Generate Draw & Fairness Report" [ref=e707] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e708]:
        - generic [ref=e712]: 32 practice players loaded. You can now rehearse the full setup and draw journey.
      - listitem [ref=e714]:
        - generic [ref=e718]: Interclub Challenge setup saved
```

# Test source

```ts
  128 |         next={...current,running:false,started_at:null};
  129 |       } else if (body.action === 'resume') {
  130 |         next={...current,running:true,started_at:now()};
  131 |       } else if (body.action === 'reset') {
  132 |         next={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round:Number(model.event.current_round||1)};
  133 |       } else if (body.action === 'set_round_minutes') {
  134 |         next={phase:'ready',running:false,remaining_seconds:Number(body.minutes)*60,started_at:null,round:Number(model.event.current_round||1)};
  135 |       } else if (body.action === 'add_minute') {
  136 |         next={...current,remaining_seconds:Number(current.remaining_seconds||0)+60};
  137 |       }
  138 |       model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  139 |       model.event.timer_state_json=JSON.stringify(next);
  140 |       return { success:true, event:model.event, state:next, server_now:now() };
  141 |     }
  142 | 
  143 |     if (name === 'updateClubChallengeRound') {
  144 |       await sleep(260);
  145 |       const round=Number(body.nextRound);const nextTimer={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round};
  146 |       Object.assign(model.event,{current_round:round,status:'in_progress',timer_state_json:JSON.stringify(nextTimer),timer_revision:Number(model.event.timer_revision||0)+1});
  147 |       return {success:true,event:model.event,timer_state:nextTimer,timer_revision:model.event.timer_revision};
  148 |     }
  149 | 
  150 |     if (name === 'updateClubChallengeSchedule') {
  151 |       await sleep(420);
  152 |       for(const c of body.changes||[]){const m=model.matches.find(x=>x.id===c.id);if(m)Object.assign(m,{round_number:Number(c.newRound),court_number:Number(c.newCourt),revision:Number(m.revision||0)+1});}
  153 |       for(const matchId of body.dropIds||[]){const m=model.matches.find(x=>x.id===matchId);if(m)Object.assign(m,{status:'not_played',winner:'none',revision:Number(m.revision||0)+1});}
  154 |       Object.assign(model.event,{courts:Number(body.courts),available_minutes:Number(body.availableMinutes),event_pack_stale:true});
  155 |       return {success:true,event:model.event,changed:(body.changes||[]).length,dropped:(body.dropIds||[]).length,alreadyApplied:false};
  156 |     }
  157 | 
  158 |     if (name === 'saveClubChallengeScore') {
  159 |       await sleep(260);
  160 |       const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
  161 |       if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
  162 |       const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
  163 |       return {success:true,match};
  164 |     }
  165 | 
  166 |     if (name === 'populateClubChallengePracticeScenario') {
  167 |       await sleep(650);
  168 |       const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
  169 |       normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
  170 |       if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
  171 |       const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
  172 |       const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
  173 |       return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
  174 |     }
  175 | 
  176 |     if (name === 'updateClubChallengePot') {
  177 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
  178 |     }
  179 |     if (name === 'castClubChallengePotVote') {
  180 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  181 |     }
  182 | 
  183 |     if (name === 'manageClubChallengePublicLinks') {
  184 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  185 |     }
  186 | 
  187 |     return { success:true };
  188 |   };
  189 | 
  190 |   return model;
  191 | }
  192 | 
  193 | async function installClubChallengeBackend(page, model) {
  194 |   await page.route('**/api/apps/**', async route => {
  195 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  196 |     if(path.includes('/analytics/'))return json(route,{});
  197 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  198 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  199 |     const fnIndex=path.indexOf(fnMarker);
  200 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  201 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  202 |     const entityIndex=path.indexOf(entityMarker);
  203 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  204 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  205 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  206 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  207 |       if(req.method()==='DELETE')return json(route,{});
  208 |     }
  209 |     return json(route,{});
  210 |   });
  211 | }
  212 | 
  213 | async function installHallDeviceMocks(page){
  214 |   await page.addInitScript(()=>{
  215 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  216 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  217 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  218 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  219 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  220 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  221 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  222 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  223 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  224 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  225 |   });
  226 | }
  227 | 
> 228 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
      |                                                                                                                            ^ Error: ranking_ack_ms should be <= 350ms but was 359ms
  229 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  230 | 
  231 | test.use({ viewport:{width:390,height:844} });
  232 | 
  233 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  234 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  235 |   await page.goto('/e2e/clubChallengeHarness.html');
  236 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  237 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  238 |   await expect(page.getByText('2h 44m')).toBeVisible();
  239 |   await expectNoHorizontalOverflow(page);
  240 | 
  241 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  242 |   expect(model.event?.status).toBe('draft');
  243 | 
  244 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  245 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  246 | 
  247 |   const reorderBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length;
  248 |   started=Date.now();await page.getByRole('button',{name:'Move Club A Test 02 up'}).click();await expect(page.getByText('Saving player ranking… one command sent')).toBeVisible({timeout:300});metric(report,'ranking_ack_ms',Date.now()-started,350);await expect(page.getByText('Saving player ranking… one command sent')).toBeHidden({timeout:1800});
  249 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length-reorderBefore).toBe(1);report.ranking_browser_calls=1;
  250 | 
  251 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  252 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  253 | 
  254 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  255 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  256 | 
  257 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;
  258 | 
  259 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  260 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  261 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;
  262 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  263 | 
  264 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  265 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;
  266 | 
  267 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  268 | 
  269 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  270 |   await page.getByRole('button',{name:'Players',exact:true}).click();await expect(page.getByText('Replace / Withdraw a Player')).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  271 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText('Applying player replacement from Round 1… command sent')).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  272 | 
  273 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  274 |   started=Date.now();await page.getByRole('button',{name:'Complete Round 1 & Go to Round 2'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.round_transition_timer_reset=true;
  275 | 
  276 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  277 | 
  278 |   await page.getByRole('button',{name:'Hall Display'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  279 | 
  280 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  281 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  282 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  283 | 
  284 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  285 | 
  286 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  287 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  288 | });
  289 | 
  290 | test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  291 |   const participants=[
  292 |     {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  293 |   ];
  294 |   const calls=[];
  295 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  296 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  297 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  298 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  299 | });
  300 | 
  301 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  302 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  303 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  304 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  305 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  306 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  307 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  308 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  309 | });
```