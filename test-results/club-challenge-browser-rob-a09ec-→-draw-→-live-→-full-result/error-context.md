# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:240:1

# Error details

```
Error: draw_ack_ms should be <= 250ms but was 341ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    341
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - paragraph [ref=e6]: Generating draw and fairness report… one command sent
          - paragraph [ref=e7]: RallyHub has accepted your tap. Keep this screen open; the control stays locked until the action resolves.
        - generic [ref=e8]:
          - generic [ref=e14]:
            - paragraph [ref=e15]: RallyHub Interclub
            - paragraph [ref=e16]: "Interclub Challenge · Status: draft"
          - generic [ref=e17]:
            - generic [ref=e18]:
              - generic [ref=e19]:
                - generic [ref=e20]: CL
                - generic [ref=e21]: Clare Blue
              - generic [ref=e22]: vs
              - generic [ref=e23]:
                - generic [ref=e24]: CL
                - generic [ref=e25]: Clare Gold
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
            - button "Practice with 32 Test Players" [disabled]
          - generic [ref=e50]:
            - generic [ref=e52]:
              - generic [ref=e53]:
                - paragraph [ref=e54]: Build the two teams
                - paragraph [ref=e55]: Import Spond or CSV directly into either team, then drag within each team to rank 1–16. Use the Player Pool only for genuinely unassigned players. Rotation players are included in the draw; Reserves stay outside the scheduled rotation until activated.
              - generic [ref=e56]:
                - generic [ref=e57]: 32 players
                - generic [ref=e58]: "A: 16 rotation · 0 reserve"
                - generic [ref=e59]: "B: 16 rotation · 0 reserve"
                - generic [ref=e60]: Rotation squads balanced
            - generic [ref=e61]:
              - generic [ref=e62]:
                - generic [ref=e63]:
                  - generic [ref=e64]:
                    - paragraph [ref=e65]: Unassigned Player Pool
                    - paragraph [ref=e66]: Use this only for players who are not yet assigned. Add or import players directly into their team panels where possible.
                  - generic [ref=e67]: "0"
                - generic [ref=e69]:
                  - button "Import Unassigned Spond Players" [disabled]
                  - generic [ref=e70]:
                    - textbox "Add player manually" [disabled] [ref=e71]
                    - button [disabled]
                - generic [ref=e72]: Import Spond attendees here
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]:
                    - text: Team name
                    - textbox [disabled] [ref=e77]: Clare Blue
                    - generic [ref=e78]:
                      - paragraph [ref=e83]: Roster controls
                      - textbox "Search RallyHub club players" [disabled] [ref=e88]
                      - generic [ref=e89]:
                        - textbox "Guest name" [disabled] [ref=e90]
                        - combobox [disabled] [ref=e91]:
                          - generic: Gender optional
                        - button "Add Guest" [disabled]
                      - paragraph [ref=e94]: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
                    - generic [ref=e95]:
                      - button "Import Spond" [disabled]
                      - generic: Import CSV
                  - generic [ref=e96]:
                    - generic [ref=e97]: "16"
                    - generic [ref=e98]:
                      - generic [ref=e99]: M 8
                      - generic [ref=e100]: F 8
                - generic [ref=e101]:
                  - generic [ref=e102]:
                    - generic [ref=e111]: "1"
                    - generic [ref=e112]: Club A Test 02
                    - combobox [disabled] [ref=e113]:
                      - generic: Rotation
                    - generic "Female" [ref=e116]: F
                    - button "Remove Club A Test 02 from roster" [disabled] [ref=e117]
                  - generic [ref=e121]:
                    - generic [ref=e130]: "2"
                    - generic [ref=e131]: Club A Test 01
                    - combobox [disabled] [ref=e132]:
                      - generic: Rotation
                    - generic "Male" [ref=e135]: M
                    - button "Remove Club A Test 01 from roster" [disabled] [ref=e136]
                  - generic [ref=e140]:
                    - generic [ref=e149]: "3"
                    - generic [ref=e150]: Club A Test 03
                    - combobox [disabled] [ref=e151]:
                      - generic: Rotation
                    - generic "Male" [ref=e154]: M
                    - button "Remove Club A Test 03 from roster" [disabled] [ref=e155]
                  - generic [ref=e159]:
                    - generic [ref=e168]: "4"
                    - generic [ref=e169]: Club A Test 04
                    - combobox [disabled] [ref=e170]:
                      - generic: Rotation
                    - generic "Female" [ref=e173]: F
                    - button "Remove Club A Test 04 from roster" [disabled] [ref=e174]
                  - generic [ref=e178]:
                    - generic [ref=e187]: "5"
                    - generic [ref=e188]: Club A Test 05
                    - combobox [disabled] [ref=e189]:
                      - generic: Rotation
                    - generic "Male" [ref=e192]: M
                    - button "Remove Club A Test 05 from roster" [disabled] [ref=e193]
                  - generic [ref=e197]:
                    - generic [ref=e206]: "6"
                    - generic [ref=e207]: Club A Test 06
                    - combobox [disabled] [ref=e208]:
                      - generic: Rotation
                    - generic "Female" [ref=e211]: F
                    - button "Remove Club A Test 06 from roster" [disabled] [ref=e212]
                  - generic [ref=e216]:
                    - generic [ref=e225]: "7"
                    - generic [ref=e226]: Club A Test 07
                    - combobox [disabled] [ref=e227]:
                      - generic: Rotation
                    - generic "Male" [ref=e230]: M
                    - button "Remove Club A Test 07 from roster" [disabled] [ref=e231]
                  - generic [ref=e235]:
                    - generic [ref=e244]: "8"
                    - generic [ref=e245]: Club A Test 08
                    - combobox [disabled] [ref=e246]:
                      - generic: Rotation
                    - generic "Female" [ref=e249]: F
                    - button "Remove Club A Test 08 from roster" [disabled] [ref=e250]
                  - generic [ref=e254]:
                    - generic [ref=e263]: "9"
                    - generic [ref=e264]: Club A Test 09
                    - combobox [disabled] [ref=e265]:
                      - generic: Rotation
                    - generic "Male" [ref=e268]: M
                    - button "Remove Club A Test 09 from roster" [disabled] [ref=e269]
                  - generic [ref=e273]:
                    - generic [ref=e282]: "10"
                    - generic [ref=e283]: Club A Test 10
                    - combobox [disabled] [ref=e284]:
                      - generic: Rotation
                    - generic "Female" [ref=e287]: F
                    - button "Remove Club A Test 10 from roster" [disabled] [ref=e288]
                  - generic [ref=e292]:
                    - generic [ref=e301]: "11"
                    - generic [ref=e302]: Club A Test 11
                    - combobox [disabled] [ref=e303]:
                      - generic: Rotation
                    - generic "Male" [ref=e306]: M
                    - button "Remove Club A Test 11 from roster" [disabled] [ref=e307]
                  - generic [ref=e311]:
                    - generic [ref=e320]: "12"
                    - generic [ref=e321]: Club A Test 12
                    - combobox [disabled] [ref=e322]:
                      - generic: Rotation
                    - generic "Female" [ref=e325]: F
                    - button "Remove Club A Test 12 from roster" [disabled] [ref=e326]
                  - generic [ref=e330]:
                    - generic [ref=e339]: "13"
                    - generic [ref=e340]: Club A Test 13
                    - combobox [disabled] [ref=e341]:
                      - generic: Rotation
                    - generic "Male" [ref=e344]: M
                    - button "Remove Club A Test 13 from roster" [disabled] [ref=e345]
                  - generic [ref=e349]:
                    - generic [ref=e358]: "14"
                    - generic [ref=e359]: Club A Test 14
                    - combobox [disabled] [ref=e360]:
                      - generic: Rotation
                    - generic "Female" [ref=e363]: F
                    - button "Remove Club A Test 14 from roster" [disabled] [ref=e364]
                  - generic [ref=e368]:
                    - generic [ref=e377]: "15"
                    - generic [ref=e378]: Club A Test 15
                    - combobox [disabled] [ref=e379]:
                      - generic: Rotation
                    - generic "Male" [ref=e382]: M
                    - button "Remove Club A Test 15 from roster" [disabled] [ref=e383]
                  - generic [ref=e387]:
                    - generic [ref=e396]: "16"
                    - generic [ref=e397]: Club A Test 16
                    - combobox [disabled] [ref=e398]:
                      - generic: Rotation
                    - generic "Female" [ref=e401]: F
                    - button "Remove Club A Test 16 from roster" [disabled] [ref=e402]
              - generic [ref=e406]:
                - generic [ref=e407]:
                  - generic [ref=e408]:
                    - text: Team name
                    - textbox [disabled] [ref=e409]: Clare Gold
                    - generic [ref=e410]:
                      - paragraph [ref=e415]: Roster controls
                      - textbox "Search RallyHub club players" [disabled] [ref=e420]
                      - generic [ref=e421]:
                        - textbox "Guest name" [disabled] [ref=e422]
                        - combobox [disabled] [ref=e423]:
                          - generic: Gender optional
                        - button "Add Guest" [disabled]
                      - paragraph [ref=e426]: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
                    - generic [ref=e427]:
                      - button "Import Spond" [disabled]
                      - generic: Import CSV
                  - generic [ref=e428]:
                    - generic [ref=e429]: "16"
                    - generic [ref=e430]:
                      - generic [ref=e431]: M 8
                      - generic [ref=e432]: F 8
                - generic [ref=e433]:
                  - generic [ref=e434]:
                    - generic [ref=e443]: "1"
                    - generic [ref=e444]: Club B Test 01
                    - combobox [disabled] [ref=e445]:
                      - generic: Rotation
                    - generic "Male" [ref=e448]: M
                    - button "Remove Club B Test 01 from roster" [disabled] [ref=e449]
                  - generic [ref=e453]:
                    - generic [ref=e462]: "2"
                    - generic [ref=e463]: Club B Test 02
                    - combobox [disabled] [ref=e464]:
                      - generic: Rotation
                    - generic "Female" [ref=e467]: F
                    - button "Remove Club B Test 02 from roster" [disabled] [ref=e468]
                  - generic [ref=e472]:
                    - generic [ref=e481]: "3"
                    - generic [ref=e482]: Club B Test 03
                    - combobox [disabled] [ref=e483]:
                      - generic: Rotation
                    - generic "Male" [ref=e486]: M
                    - button "Remove Club B Test 03 from roster" [disabled] [ref=e487]
                  - generic [ref=e491]:
                    - generic [ref=e500]: "4"
                    - generic [ref=e501]: Club B Test 04
                    - combobox [disabled] [ref=e502]:
                      - generic: Rotation
                    - generic "Female" [ref=e505]: F
                    - button "Remove Club B Test 04 from roster" [disabled] [ref=e506]
                  - generic [ref=e510]:
                    - generic [ref=e519]: "5"
                    - generic [ref=e520]: Club B Test 05
                    - combobox [disabled] [ref=e521]:
                      - generic: Rotation
                    - generic "Male" [ref=e524]: M
                    - button "Remove Club B Test 05 from roster" [disabled] [ref=e525]
                  - generic [ref=e529]:
                    - generic [ref=e538]: "6"
                    - generic [ref=e539]: Club B Test 06
                    - combobox [disabled] [ref=e540]:
                      - generic: Rotation
                    - generic "Female" [ref=e543]: F
                    - button "Remove Club B Test 06 from roster" [disabled] [ref=e544]
                  - generic [ref=e548]:
                    - generic [ref=e557]: "7"
                    - generic [ref=e558]: Club B Test 07
                    - combobox [disabled] [ref=e559]:
                      - generic: Rotation
                    - generic "Male" [ref=e562]: M
                    - button "Remove Club B Test 07 from roster" [disabled] [ref=e563]
                  - generic [ref=e567]:
                    - generic [ref=e576]: "8"
                    - generic [ref=e577]: Club B Test 08
                    - combobox [disabled] [ref=e578]:
                      - generic: Rotation
                    - generic "Female" [ref=e581]: F
                    - button "Remove Club B Test 08 from roster" [disabled] [ref=e582]
                  - generic [ref=e586]:
                    - generic [ref=e595]: "9"
                    - generic [ref=e596]: Club B Test 09
                    - combobox [disabled] [ref=e597]:
                      - generic: Rotation
                    - generic "Male" [ref=e600]: M
                    - button "Remove Club B Test 09 from roster" [disabled] [ref=e601]
                  - generic [ref=e605]:
                    - generic [ref=e614]: "10"
                    - generic [ref=e615]: Club B Test 10
                    - combobox [disabled] [ref=e616]:
                      - generic: Rotation
                    - generic "Female" [ref=e619]: F
                    - button "Remove Club B Test 10 from roster" [disabled] [ref=e620]
                  - generic [ref=e624]:
                    - generic [ref=e633]: "11"
                    - generic [ref=e634]: Club B Test 11
                    - combobox [disabled] [ref=e635]:
                      - generic: Rotation
                    - generic "Male" [ref=e638]: M
                    - button "Remove Club B Test 11 from roster" [disabled] [ref=e639]
                  - generic [ref=e643]:
                    - generic [ref=e652]: "12"
                    - generic [ref=e653]: Club B Test 12
                    - combobox [disabled] [ref=e654]:
                      - generic: Rotation
                    - generic "Female" [ref=e657]: F
                    - button "Remove Club B Test 12 from roster" [disabled] [ref=e658]
                  - generic [ref=e662]:
                    - generic [ref=e671]: "13"
                    - generic [ref=e672]: Club B Test 13
                    - combobox [disabled] [ref=e673]:
                      - generic: Rotation
                    - generic "Male" [ref=e676]: M
                    - button "Remove Club B Test 13 from roster" [disabled] [ref=e677]
                  - generic [ref=e681]:
                    - generic [ref=e690]: "14"
                    - generic [ref=e691]: Club B Test 14
                    - combobox [disabled] [ref=e692]:
                      - generic: Rotation
                    - generic "Female" [ref=e695]: F
                    - button "Remove Club B Test 14 from roster" [disabled] [ref=e696]
                  - generic [ref=e700]:
                    - generic [ref=e709]: "15"
                    - generic [ref=e710]: Club B Test 15
                    - combobox [disabled] [ref=e711]:
                      - generic: Rotation
                    - generic "Male" [ref=e714]: M
                    - button "Remove Club B Test 15 from roster" [disabled] [ref=e715]
                  - generic [ref=e719]:
                    - generic [ref=e728]: "16"
                    - generic [ref=e729]: Club B Test 16
                    - combobox [disabled] [ref=e730]:
                      - generic: Rotation
                    - generic "Female" [ref=e733]: F
                    - button "Remove Club B Test 16 from roster" [disabled] [ref=e734]
            - generic [ref=e738]:
              - generic [ref=e739]: "Ready: 16 rotation players per club."
              - button "Saving…" [disabled]
            - generic [ref=e740]: Teams saved · 16 in Clare Blue · 16 in Clare Gold.
          - generic [ref=e741]:
            - generic [ref=e742]:
              - paragraph [ref=e743]: "12"
              - paragraph [ref=e744]: Rounds
            - generic [ref=e745]:
              - paragraph [ref=e746]: "48"
              - paragraph [ref=e747]: Matches
            - generic [ref=e748]:
              - paragraph [ref=e749]: 6–6
              - paragraph [ref=e750]: Games/player
            - generic [ref=e751]:
              - paragraph [ref=e752]: "164"
              - paragraph [ref=e753]: Structured min
            - generic [ref=e754]:
              - paragraph [ref=e755]: "16"
              - paragraph [ref=e756]: Contingency min
          - button "Generate Draw & Fairness Report" [disabled]
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e757]:
          - generic [ref=e761]: 48 fixtures generated
        - listitem [ref=e763]:
          - generic [ref=e767]: Teams saved · 16 vs 16
        - listitem [ref=e769]:
          - generic [ref=e773]: 32 practice players loaded. You can now rehearse the full setup and draw journey.
  - generic [ref=e775]: You have dropped the item. You have moved the item from position 2 to position 1
```

# Test source

```ts
  135 |         next={...current,running:false,started_at:null};
  136 |       } else if (body.action === 'resume') {
  137 |         next={...current,running:true,started_at:now()};
  138 |       } else if (body.action === 'reset') {
  139 |         next={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round:Number(model.event.current_round||1)};
  140 |       } else if (body.action === 'set_round_minutes') {
  141 |         next={phase:'ready',running:false,remaining_seconds:Number(body.minutes)*60,started_at:null,round:Number(model.event.current_round||1)};
  142 |       } else if (body.action === 'add_minute') {
  143 |         next={...current,remaining_seconds:Number(current.remaining_seconds||0)+60};
  144 |       }
  145 |       model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  146 |       model.event.timer_state_json=JSON.stringify(next);
  147 |       return { success:true, event:model.event, state:next, server_now:now() };
  148 |     }
  149 | 
  150 |     if (name === 'updateClubChallengeRound') {
  151 |       await sleep(260);
  152 |       const round=Number(body.nextRound);const nextTimer={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round};
  153 |       Object.assign(model.event,{current_round:round,status:'in_progress',timer_state_json:JSON.stringify(nextTimer),timer_revision:Number(model.event.timer_revision||0)+1});
  154 |       return {success:true,event:model.event,timer_state:nextTimer,timer_revision:model.event.timer_revision};
  155 |     }
  156 | 
  157 |     if (name === 'updateClubChallengeSchedule') {
  158 |       await sleep(420);
  159 |       for(const c of body.changes||[]){const m=model.matches.find(x=>x.id===c.id);if(m)Object.assign(m,{round_number:Number(c.newRound),court_number:Number(c.newCourt),revision:Number(m.revision||0)+1});}
  160 |       for(const matchId of body.dropIds||[]){const m=model.matches.find(x=>x.id===matchId);if(m)Object.assign(m,{status:'not_played',winner:'none',revision:Number(m.revision||0)+1});}
  161 |       Object.assign(model.event,{courts:Number(body.courts),available_minutes:Number(body.availableMinutes),event_pack_stale:true});
  162 |       return {success:true,event:model.event,changed:(body.changes||[]).length,dropped:(body.dropIds||[]).length,alreadyApplied:false};
  163 |     }
  164 | 
  165 |     if (name === 'saveClubChallengeScore') {
  166 |       await sleep(260);
  167 |       const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
  168 |       if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
  169 |       const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
  170 |       return {success:true,match};
  171 |     }
  172 | 
  173 |     if (name === 'populateClubChallengePracticeScenario') {
  174 |       await sleep(650);
  175 |       const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
  176 |       normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
  177 |       if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
  178 |       const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
  179 |       const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
  180 |       return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
  181 |     }
  182 | 
  183 |     if (name === 'updateClubChallengePot') {
  184 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
  185 |     }
  186 |     if (name === 'castClubChallengePotVote') {
  187 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  188 |     }
  189 | 
  190 |     if (name === 'manageClubChallengePublicLinks') {
  191 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  192 |     }
  193 | 
  194 |     return { success:true };
  195 |   };
  196 | 
  197 |   return model;
  198 | }
  199 | 
  200 | async function installClubChallengeBackend(page, model) {
  201 |   await page.route('**/api/apps/**', async route => {
  202 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  203 |     if(path.includes('/analytics/'))return json(route,{});
  204 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  205 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  206 |     const fnIndex=path.indexOf(fnMarker);
  207 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  208 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  209 |     const entityIndex=path.indexOf(entityMarker);
  210 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  211 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  212 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  213 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  214 |       if(req.method()==='DELETE')return json(route,{});
  215 |     }
  216 |     return json(route,{});
  217 |   });
  218 | }
  219 | 
  220 | async function installHallDeviceMocks(page){
  221 |   await page.addInitScript(()=>{
  222 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  223 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  224 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  225 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  226 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  227 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  228 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  229 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  230 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  231 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  232 |   });
  233 | }
  234 | 
> 235 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
      |                                                                                                                            ^ Error: draw_ack_ms should be <= 250ms but was 341ms
  236 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  237 | 
  238 | test.use({ viewport:{width:390,height:844} });
  239 | 
  240 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  241 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  242 |   await page.goto('/e2e/clubChallengeHarness.html');
  243 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  244 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  245 |   await expect(page.getByText('2h 44m')).toBeVisible();
  246 |   await expectNoHorizontalOverflow(page);
  247 | 
  248 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  249 |   expect(model.event?.status).toBe('draft');
  250 | 
  251 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  252 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  253 | 
  254 |   await expect(page.getByText('Build the two teams')).toBeVisible();await expect(page.getByText('Unassigned Player Pool',{exact:true})).toBeVisible();
  255 |   const organiseBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length;
  256 |   await page.getByTestId('cc-team-name-club_a').fill('Clare Blue');await page.getByTestId('cc-team-name-club_b').fill('Clare Gold');
  257 |   const drag=page.getByTestId('cc-team-drag-cc-a-2');await drag.focus();await drag.press('Space');await drag.press('ArrowUp');await drag.press('Space');
  258 |   started=Date.now();await page.getByTestId('cc-save-team-builder').click();await expect(page.getByText('Saving teams and rankings… one command sent')).toBeVisible({timeout:300});metric(report,'team_builder_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-team-builder-status')).toContainText('Teams saved',{timeout:1800});
  259 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length-organiseBefore).toBe(1);expect(model.participants.find(p=>p.id==='cc-a-2')?.event_rank).toBe(1);expect(model.event.club_a_name).toBe('Clare Blue');expect(model.event.club_b_name).toBe('Clare Gold');report.team_builder_browser_calls=1;report.drag_ranking_saved=true;
  260 | 
  261 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  262 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  263 | 
  264 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  265 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  266 | 
  267 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;
  268 | 
  269 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  270 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  271 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;
  272 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  273 | 
  274 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  275 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Starting now/i.test(x.text))).toBe(true);expect(device.speech.some(x=>/One minute remaining|Thirty seconds|Ten seconds/i.test(x.text))).toBe(false);report.timer_double_tap_calls=1;report.start_announcement_full=true;report.legacy_warnings_removed=true;
  276 |   await page.getByRole('button',{name:'Audio ON',exact:true}).click();await expect(page.getByRole('button',{name:'Audio OFF',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cc-audio-muted'))).toBe('true');await page.getByRole('button',{name:'Audio OFF',exact:true}).click();await expect(page.getByRole('button',{name:'Audio ON',exact:true})).toBeVisible();report.audio_toggle_persistent=true;
  277 | 
  278 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  279 | 
  280 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  281 |   await page.getByRole('button',{name:'Player Changes',exact:true}).click();await expect(page.getByText('Player Changes & Reserves',{exact:true})).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  282 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText(new RegExp(`^Replacing .* with Replacement Test from Round 1… command sent$`))).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  283 | 
  284 |   model.event.timer_state_json=JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:1});model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  285 |   await page.reload();await expect(page.getByTestId('cc-root')).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'})).toBeVisible({timeout:1800});
  286 |   started=Date.now();await page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('Earlier scores still to enter')).toBeVisible();expect(model.calls.filter(c=>c.name==='updateClubChallengeRound').at(-1)?.body.allowPendingScores).toBe(true);report.next_round_before_scores=true;
  287 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  288 |   await expect(page.getByText('Earlier scores still to enter')).toBeHidden({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.pending_scores_cleared_during_next_round=true;report.round_transition_timer_reset=true;
  289 | 
  290 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  291 | 
  292 |   await page.getByRole('button',{name:'Hall Display'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  293 | 
  294 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  295 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  296 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  297 | 
  298 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  299 | 
  300 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  301 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  302 | });
  303 | 
  304 | test('Club Challenge public voter robot: one browser ballot across both teams',async({page},testInfo)=>{
  305 |   const participants=[
  306 |     {id:'a1',side:'club_a',display_name:'Aoife M.'},{id:'a2',side:'club_a',display_name:'Brian K.'},{id:'b1',side:'club_b',display_name:'Cara D.'},{id:'b2',side:'club_b',display_name:'Declan R.'},
  307 |   ];
  308 |   const calls=[];
  309 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',pot_vote_closes_at:null,junior_display_mode:true,display_token:'ccd_0123456789abcdef0123456789abcdef'},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(!body.voterDeviceId||!body.clubANomineeParticipantId||!body.clubBNomineeParticipantId)return json(route,{error:'Both team choices and device are required.'});return json(route,{success:true,votesRecorded:2,sides:['club_a','club_b']});}return json(route,{});});
  310 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One ballot per phone/browser for this Interclub.')).toBeVisible();
  311 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await combos.nth(1).click();await page.getByRole('option',{name:'Cara D.'}).click();
  312 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Submit My Votes'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Votes recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);await expect(page.getByRole('link',{name:'Back to Live Event'})).toHaveAttribute('href','https://rallyhub.ie/club-challenge/display/ccd_0123456789abcdef0123456789abcdef');const report={vote_ack_ms:Date.now()-started,cast_calls:1,two_team_ballot:true,device_identity:true,live_return_link:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  313 | });
  314 | 
  315 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  316 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`,side:i<10?'club_a':'club_b',event_rank:(i%10)+1,roster_role:'rotation',reserve_activated:false,status:'active'}));
  317 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  318 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  319 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  320 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  321 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  322 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Teams'}).click();await expect(page.getByRole('heading',{name:'Teams'})).toBeVisible();await expect(page.getByText('Player 1',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Results'}).click();await expect(page.getByRole('heading',{name:'Match Results'})).toBeVisible();await page.getByRole('button',{name:'Live'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  323 | });
```