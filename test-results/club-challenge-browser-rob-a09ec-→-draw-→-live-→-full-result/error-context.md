# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:206:1

# Error details

```
Error: ranking_ack_ms should be <= 250ms but was 262ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    262
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
          - paragraph [ref=e15]: Club Challenge v1.0
          - paragraph [ref=e16]: "Status: draft"
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
          - generic [ref=e53]:
            - textbox "Add Clare Pickleball Club player" [ref=e54]
            - button [disabled]
          - generic [ref=e56]:
            - textbox "Add Galway Pickleball player" [ref=e57]
            - button [disabled]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]:
              - generic [ref=e61]:
                - paragraph [ref=e62]: Clare Pickleball Club
                - paragraph [ref=e63]: "Strongest #1 → developing"
              - generic [ref=e64]: "16"
            - generic [ref=e65]:
              - generic [ref=e66]:
                - button [ref=e67] [cursor=pointer]
                - generic [ref=e75]: "1"
                - generic [ref=e76]: Club A Test 01
                - generic [ref=e77]: Male
                - generic [ref=e78]:
                  - button "Move Club A Test 01 up" [disabled] [ref=e79]
                  - button "Move Club A Test 01 down" [ref=e82] [cursor=pointer]
              - generic [ref=e85]:
                - button [ref=e86] [cursor=pointer]
                - generic [ref=e94]: "2"
                - generic [ref=e95]: Club A Test 02
                - generic [ref=e96]: Female
                - generic [ref=e97]:
                  - button "Move Club A Test 02 up" [active] [ref=e98] [cursor=pointer]
                  - button "Move Club A Test 02 down" [ref=e101] [cursor=pointer]
              - generic [ref=e104]:
                - button [ref=e105] [cursor=pointer]
                - generic [ref=e113]: "3"
                - generic [ref=e114]: Club A Test 03
                - generic [ref=e115]: Male
                - generic [ref=e116]:
                  - button "Move Club A Test 03 up" [ref=e117] [cursor=pointer]
                  - button "Move Club A Test 03 down" [ref=e120] [cursor=pointer]
              - generic [ref=e123]:
                - button [ref=e124] [cursor=pointer]
                - generic [ref=e132]: "4"
                - generic [ref=e133]: Club A Test 04
                - generic [ref=e134]: Female
                - generic [ref=e135]:
                  - button "Move Club A Test 04 up" [ref=e136] [cursor=pointer]
                  - button "Move Club A Test 04 down" [ref=e139] [cursor=pointer]
              - generic [ref=e142]:
                - button [ref=e143] [cursor=pointer]
                - generic [ref=e151]: "5"
                - generic [ref=e152]: Club A Test 05
                - generic [ref=e153]: Male
                - generic [ref=e154]:
                  - button "Move Club A Test 05 up" [ref=e155] [cursor=pointer]
                  - button "Move Club A Test 05 down" [ref=e158] [cursor=pointer]
              - generic [ref=e161]:
                - button [ref=e162] [cursor=pointer]
                - generic [ref=e170]: "6"
                - generic [ref=e171]: Club A Test 06
                - generic [ref=e172]: Female
                - generic [ref=e173]:
                  - button "Move Club A Test 06 up" [ref=e174] [cursor=pointer]
                  - button "Move Club A Test 06 down" [ref=e177] [cursor=pointer]
              - generic [ref=e180]:
                - button [ref=e181] [cursor=pointer]
                - generic [ref=e189]: "7"
                - generic [ref=e190]: Club A Test 07
                - generic [ref=e191]: Male
                - generic [ref=e192]:
                  - button "Move Club A Test 07 up" [ref=e193] [cursor=pointer]
                  - button "Move Club A Test 07 down" [ref=e196] [cursor=pointer]
              - generic [ref=e199]:
                - button [ref=e200] [cursor=pointer]
                - generic [ref=e208]: "8"
                - generic [ref=e209]: Club A Test 08
                - generic [ref=e210]: Female
                - generic [ref=e211]:
                  - button "Move Club A Test 08 up" [ref=e212] [cursor=pointer]
                  - button "Move Club A Test 08 down" [ref=e215] [cursor=pointer]
              - generic [ref=e218]:
                - button [ref=e219] [cursor=pointer]
                - generic [ref=e227]: "9"
                - generic [ref=e228]: Club A Test 09
                - generic [ref=e229]: Male
                - generic [ref=e230]:
                  - button "Move Club A Test 09 up" [ref=e231] [cursor=pointer]
                  - button "Move Club A Test 09 down" [ref=e234] [cursor=pointer]
              - generic [ref=e237]:
                - button [ref=e238] [cursor=pointer]
                - generic [ref=e246]: "10"
                - generic [ref=e247]: Club A Test 10
                - generic [ref=e248]: Female
                - generic [ref=e249]:
                  - button "Move Club A Test 10 up" [ref=e250] [cursor=pointer]
                  - button "Move Club A Test 10 down" [ref=e253] [cursor=pointer]
              - generic [ref=e256]:
                - button [ref=e257] [cursor=pointer]
                - generic [ref=e265]: "11"
                - generic [ref=e266]: Club A Test 11
                - generic [ref=e267]: Male
                - generic [ref=e268]:
                  - button "Move Club A Test 11 up" [ref=e269] [cursor=pointer]
                  - button "Move Club A Test 11 down" [ref=e272] [cursor=pointer]
              - generic [ref=e275]:
                - button [ref=e276] [cursor=pointer]
                - generic [ref=e284]: "12"
                - generic [ref=e285]: Club A Test 12
                - generic [ref=e286]: Female
                - generic [ref=e287]:
                  - button "Move Club A Test 12 up" [ref=e288] [cursor=pointer]
                  - button "Move Club A Test 12 down" [ref=e291] [cursor=pointer]
              - generic [ref=e294]:
                - button [ref=e295] [cursor=pointer]
                - generic [ref=e303]: "13"
                - generic [ref=e304]: Club A Test 13
                - generic [ref=e305]: Male
                - generic [ref=e306]:
                  - button "Move Club A Test 13 up" [ref=e307] [cursor=pointer]
                  - button "Move Club A Test 13 down" [ref=e310] [cursor=pointer]
              - generic [ref=e313]:
                - button [ref=e314] [cursor=pointer]
                - generic [ref=e322]: "14"
                - generic [ref=e323]: Club A Test 14
                - generic [ref=e324]: Female
                - generic [ref=e325]:
                  - button "Move Club A Test 14 up" [ref=e326] [cursor=pointer]
                  - button "Move Club A Test 14 down" [ref=e329] [cursor=pointer]
              - generic [ref=e332]:
                - button [ref=e333] [cursor=pointer]
                - generic [ref=e341]: "15"
                - generic [ref=e342]: Club A Test 15
                - generic [ref=e343]: Male
                - generic [ref=e344]:
                  - button "Move Club A Test 15 up" [ref=e345] [cursor=pointer]
                  - button "Move Club A Test 15 down" [ref=e348] [cursor=pointer]
              - generic [ref=e351]:
                - button [ref=e352] [cursor=pointer]
                - generic [ref=e360]: "16"
                - generic [ref=e361]: Club A Test 16
                - generic [ref=e362]: Female
                - generic [ref=e363]:
                  - button "Move Club A Test 16 up" [ref=e364] [cursor=pointer]
                  - button "Move Club A Test 16 down" [disabled] [ref=e367]
          - generic [ref=e370]:
            - generic [ref=e371]:
              - generic [ref=e372]:
                - paragraph [ref=e373]: Galway Pickleball
                - paragraph [ref=e374]: "Strongest #1 → developing"
              - generic [ref=e375]: "16"
            - generic [ref=e376]:
              - generic [ref=e377]:
                - button [ref=e378] [cursor=pointer]
                - generic [ref=e386]: "1"
                - generic [ref=e387]: Club B Test 01
                - generic [ref=e388]: Male
                - generic [ref=e389]:
                  - button "Move Club B Test 01 up" [disabled] [ref=e390]
                  - button "Move Club B Test 01 down" [ref=e393] [cursor=pointer]
              - generic [ref=e396]:
                - button [ref=e397] [cursor=pointer]
                - generic [ref=e405]: "2"
                - generic [ref=e406]: Club B Test 02
                - generic [ref=e407]: Female
                - generic [ref=e408]:
                  - button "Move Club B Test 02 up" [ref=e409] [cursor=pointer]
                  - button "Move Club B Test 02 down" [ref=e412] [cursor=pointer]
              - generic [ref=e415]:
                - button [ref=e416] [cursor=pointer]
                - generic [ref=e424]: "3"
                - generic [ref=e425]: Club B Test 03
                - generic [ref=e426]: Male
                - generic [ref=e427]:
                  - button "Move Club B Test 03 up" [ref=e428] [cursor=pointer]
                  - button "Move Club B Test 03 down" [ref=e431] [cursor=pointer]
              - generic [ref=e434]:
                - button [ref=e435] [cursor=pointer]
                - generic [ref=e443]: "4"
                - generic [ref=e444]: Club B Test 04
                - generic [ref=e445]: Female
                - generic [ref=e446]:
                  - button "Move Club B Test 04 up" [ref=e447] [cursor=pointer]
                  - button "Move Club B Test 04 down" [ref=e450] [cursor=pointer]
              - generic [ref=e453]:
                - button [ref=e454] [cursor=pointer]
                - generic [ref=e462]: "5"
                - generic [ref=e463]: Club B Test 05
                - generic [ref=e464]: Male
                - generic [ref=e465]:
                  - button "Move Club B Test 05 up" [ref=e466] [cursor=pointer]
                  - button "Move Club B Test 05 down" [ref=e469] [cursor=pointer]
              - generic [ref=e472]:
                - button [ref=e473] [cursor=pointer]
                - generic [ref=e481]: "6"
                - generic [ref=e482]: Club B Test 06
                - generic [ref=e483]: Female
                - generic [ref=e484]:
                  - button "Move Club B Test 06 up" [ref=e485] [cursor=pointer]
                  - button "Move Club B Test 06 down" [ref=e488] [cursor=pointer]
              - generic [ref=e491]:
                - button [ref=e492] [cursor=pointer]
                - generic [ref=e500]: "7"
                - generic [ref=e501]: Club B Test 07
                - generic [ref=e502]: Male
                - generic [ref=e503]:
                  - button "Move Club B Test 07 up" [ref=e504] [cursor=pointer]
                  - button "Move Club B Test 07 down" [ref=e507] [cursor=pointer]
              - generic [ref=e510]:
                - button [ref=e511] [cursor=pointer]
                - generic [ref=e519]: "8"
                - generic [ref=e520]: Club B Test 08
                - generic [ref=e521]: Female
                - generic [ref=e522]:
                  - button "Move Club B Test 08 up" [ref=e523] [cursor=pointer]
                  - button "Move Club B Test 08 down" [ref=e526] [cursor=pointer]
              - generic [ref=e529]:
                - button [ref=e530] [cursor=pointer]
                - generic [ref=e538]: "9"
                - generic [ref=e539]: Club B Test 09
                - generic [ref=e540]: Male
                - generic [ref=e541]:
                  - button "Move Club B Test 09 up" [ref=e542] [cursor=pointer]
                  - button "Move Club B Test 09 down" [ref=e545] [cursor=pointer]
              - generic [ref=e548]:
                - button [ref=e549] [cursor=pointer]
                - generic [ref=e557]: "10"
                - generic [ref=e558]: Club B Test 10
                - generic [ref=e559]: Female
                - generic [ref=e560]:
                  - button "Move Club B Test 10 up" [ref=e561] [cursor=pointer]
                  - button "Move Club B Test 10 down" [ref=e564] [cursor=pointer]
              - generic [ref=e567]:
                - button [ref=e568] [cursor=pointer]
                - generic [ref=e576]: "11"
                - generic [ref=e577]: Club B Test 11
                - generic [ref=e578]: Male
                - generic [ref=e579]:
                  - button "Move Club B Test 11 up" [ref=e580] [cursor=pointer]
                  - button "Move Club B Test 11 down" [ref=e583] [cursor=pointer]
              - generic [ref=e586]:
                - button [ref=e587] [cursor=pointer]
                - generic [ref=e595]: "12"
                - generic [ref=e596]: Club B Test 12
                - generic [ref=e597]: Female
                - generic [ref=e598]:
                  - button "Move Club B Test 12 up" [ref=e599] [cursor=pointer]
                  - button "Move Club B Test 12 down" [ref=e602] [cursor=pointer]
              - generic [ref=e605]:
                - button [ref=e606] [cursor=pointer]
                - generic [ref=e614]: "13"
                - generic [ref=e615]: Club B Test 13
                - generic [ref=e616]: Male
                - generic [ref=e617]:
                  - button "Move Club B Test 13 up" [ref=e618] [cursor=pointer]
                  - button "Move Club B Test 13 down" [ref=e621] [cursor=pointer]
              - generic [ref=e624]:
                - button [ref=e625] [cursor=pointer]
                - generic [ref=e633]: "14"
                - generic [ref=e634]: Club B Test 14
                - generic [ref=e635]: Female
                - generic [ref=e636]:
                  - button "Move Club B Test 14 up" [ref=e637] [cursor=pointer]
                  - button "Move Club B Test 14 down" [ref=e640] [cursor=pointer]
              - generic [ref=e643]:
                - button [ref=e644] [cursor=pointer]
                - generic [ref=e652]: "15"
                - generic [ref=e653]: Club B Test 15
                - generic [ref=e654]: Male
                - generic [ref=e655]:
                  - button "Move Club B Test 15 up" [ref=e656] [cursor=pointer]
                  - button "Move Club B Test 15 down" [ref=e659] [cursor=pointer]
              - generic [ref=e662]:
                - button [ref=e663] [cursor=pointer]
                - generic [ref=e671]: "16"
                - generic [ref=e672]: Club B Test 16
                - generic [ref=e673]: Female
                - generic [ref=e674]:
                  - button "Move Club B Test 16 up" [ref=e675] [cursor=pointer]
                  - button "Move Club B Test 16 down" [disabled] [ref=e678]
        - generic [ref=e681]:
          - generic [ref=e682]:
            - paragraph [ref=e683]: "12"
            - paragraph [ref=e684]: Rounds
          - generic [ref=e685]:
            - paragraph [ref=e686]: "48"
            - paragraph [ref=e687]: Matches
          - generic [ref=e688]:
            - paragraph [ref=e689]: 6–6
            - paragraph [ref=e690]: Games/player
          - generic [ref=e691]:
            - paragraph [ref=e692]: "164"
            - paragraph [ref=e693]: Structured min
          - generic [ref=e694]:
            - paragraph [ref=e695]: "16"
            - paragraph [ref=e696]: Contingency min
        - button "Generate Draw & Fairness Report" [ref=e697] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e698]:
        - generic [ref=e702]: 32 practice players loaded. You can now rehearse the full setup and draw journey.
      - listitem [ref=e704]:
        - generic [ref=e708]: Club Challenge setup saved
```

# Test source

```ts
  101 |         if(body.label)labels[String(body.round)]=body.label;else delete labels[String(body.round)];model.event.round_labels_json=JSON.stringify(labels);
  102 |       } else if (body.action === 'archive') model.event.status='archived';
  103 |       else if (body.action === 'reopen') model.event.status='completed';
  104 |       return { success:true, event:model.event };
  105 |     }
  106 | 
  107 |     if (name === 'updateClubChallengeTimer') {
  108 |       await sleep(480);
  109 |       const current = (()=>{try{return model.event.timer_state_json?JSON.parse(model.event.timer_state_json):{};}catch{return {};}})();
  110 |       if (Number(body.expectedRevision||0)!==Number(model.event.timer_revision||0)) return { conflict:true, error:'Timer revision conflict' };
  111 |       let next=current;
  112 |       if (body.action === 'start') {
  113 |         const seconds = body.phase === 'changeover' ? Number(model.event.changeover_minutes||2)*60 : body.phase === 'break' ? Number(model.event.break_minutes||20)*60 : Number(current.remaining_seconds||0)>0&&current.phase==='play'&&!current.running?Number(current.remaining_seconds):Number(model.event.play_minutes||10)*60;
  114 |         next={phase:body.phase||'play',running:true,remaining_seconds:seconds,started_at:now(),round:Number(model.event.current_round||1)};
  115 |       } else if (body.action === 'pause') {
  116 |         next={...current,running:false,started_at:null};
  117 |       } else if (body.action === 'resume') {
  118 |         next={...current,running:true,started_at:now()};
  119 |       } else if (body.action === 'reset') {
  120 |         next={phase:'play',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round:Number(model.event.current_round||1)};
  121 |       } else if (body.action === 'set_round_minutes') {
  122 |         next={phase:'play',running:false,remaining_seconds:Number(body.minutes)*60,started_at:null,round:Number(model.event.current_round||1)};
  123 |       } else if (body.action === 'add_minute') {
  124 |         next={...current,remaining_seconds:Number(current.remaining_seconds||0)+60};
  125 |       }
  126 |       model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  127 |       model.event.timer_state_json=JSON.stringify(next);
  128 |       return { success:true, event:model.event, state:next, server_now:now() };
  129 |     }
  130 | 
  131 |     if (name === 'saveClubChallengeScore') {
  132 |       await sleep(260);
  133 |       const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
  134 |       if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
  135 |       const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
  136 |       return {success:true,match};
  137 |     }
  138 | 
  139 |     if (name === 'populateClubChallengePracticeScenario') {
  140 |       await sleep(650);
  141 |       const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
  142 |       normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
  143 |       if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
  144 |       const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
  145 |       const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
  146 |       return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
  147 |     }
  148 | 
  149 |     if (name === 'updateClubChallengePot') {
  150 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
  151 |     }
  152 |     if (name === 'castClubChallengePotVote') {
  153 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  154 |     }
  155 | 
  156 |     if (name === 'manageClubChallengePublicLinks') {
  157 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  158 |     }
  159 | 
  160 |     return { success:true };
  161 |   };
  162 | 
  163 |   return model;
  164 | }
  165 | 
  166 | async function installClubChallengeBackend(page, model) {
  167 |   await page.route('**/api/apps/**', async route => {
  168 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  169 |     if(path.includes('/analytics/'))return json(route,{});
  170 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  171 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  172 |     const fnIndex=path.indexOf(fnMarker);
  173 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  174 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  175 |     const entityIndex=path.indexOf(entityMarker);
  176 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  177 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  178 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  179 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  180 |       if(req.method()==='DELETE')return json(route,{});
  181 |     }
  182 |     return json(route,{});
  183 |   });
  184 | }
  185 | 
  186 | async function installHallDeviceMocks(page){
  187 |   await page.addInitScript(()=>{
  188 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  189 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  190 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  191 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  192 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  193 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  194 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  195 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  196 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  197 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  198 |   });
  199 | }
  200 | 
> 201 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
      |                                                                                                                            ^ Error: ranking_ack_ms should be <= 250ms but was 262ms
  202 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  203 | 
  204 | test.use({ viewport:{width:390,height:844} });
  205 | 
  206 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  207 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  208 |   await page.goto('/e2e/clubChallengeHarness.html');
  209 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  210 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  211 |   await expect(page.getByText('2h 44m')).toBeVisible();
  212 |   await expectNoHorizontalOverflow(page);
  213 | 
  214 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  215 |   expect(model.event?.status).toBe('draft');
  216 | 
  217 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  218 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  219 | 
  220 |   const reorderBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length;
  221 |   started=Date.now();await page.getByRole('button',{name:'Move Club A Test 02 up'}).click();await expect(page.getByText('Saving player ranking… one command sent')).toBeVisible({timeout:300});metric(report,'ranking_ack_ms',Date.now()-started,250);await expect(page.getByText('Saving player ranking… one command sent')).toBeHidden({timeout:1800});
  222 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length-reorderBefore).toBe(1);report.ranking_browser_calls=1;
  223 | 
  224 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  225 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Hard checks PASS')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  226 | 
  227 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  228 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  229 | 
  230 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;
  231 | 
  232 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  233 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Club Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  234 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expectNoHorizontalOverflow(page);
  235 | 
  236 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  237 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;
  238 | 
  239 |   await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Revision 1',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  240 | 
  241 |   await page.getByRole('button',{name:'Hall Display'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).click();
  242 | 
  243 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  244 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  245 |   await expect(page.getByText('Player of the Tournament')).toBeVisible();await expect(page.getByText('Club A Test 01')).toBeVisible();await expectNoHorizontalOverflow(page);
  246 | 
  247 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  248 | 
  249 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  250 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  251 | });
  252 | 
  253 | test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  254 |   const participants=[
  255 |     {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  256 |   ];
  257 |   const calls=[];
  258 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  259 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  260 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  261 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  262 | });
  263 | 
  264 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  265 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  266 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  267 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  268 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  269 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  270 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  271 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  272 | });
```