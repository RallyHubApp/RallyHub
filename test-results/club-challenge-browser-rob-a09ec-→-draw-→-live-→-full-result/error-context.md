# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:206:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 3000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: Club Challenge v1.0
          - paragraph [ref=e13]: "Status: draw approved"
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - generic [ref=e17]: CL
              - generic [ref=e18]: Clare Pickleball Club
            - generic [ref=e19]: vs
            - generic [ref=e20]:
              - generic [ref=e21]: GA
              - generic [ref=e22]: Galway Pickleball
          - button "Public Links / QR" [ref=e23] [cursor=pointer]
          - button "Print Event Pack v1" [ref=e24] [cursor=pointer]
      - generic [ref=e26]:
        - button [ref=e27] [cursor=pointer]
        - button [ref=e32] [cursor=pointer]
        - button "3 Draw" [ref=e37] [cursor=pointer]:
          - generic [ref=e38]: "3"
          - text: Draw
        - button "4 Live Event" [ref=e39] [cursor=pointer]:
          - generic [ref=e40]: "4"
          - text: Live Event
        - button "5 Simulator" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]: "5"
          - text: Simulator
        - button "6 Results" [ref=e43] [cursor=pointer]:
          - generic [ref=e44]: "6"
          - text: Results
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - paragraph [ref=e50]: Fairness Report
              - paragraph [ref=e51]: Gate 2 priorities applied
            - generic [ref=e52]: Hard checks PASS
          - generic [ref=e53]:
            - generic [ref=e54]:
              - paragraph [ref=e55]: "48"
              - paragraph [ref=e56]: Matches
            - generic [ref=e57]:
              - paragraph [ref=e58]: "6"
              - paragraph [ref=e59]: Games min
            - generic [ref=e60]:
              - paragraph [ref=e61]: "6"
              - paragraph [ref=e62]: Games max
            - generic [ref=e63]:
              - paragraph [ref=e64]: "0"
              - paragraph [ref=e65]: Partner repeats
            - generic [ref=e66]:
              - paragraph [ref=e67]: "2"
              - paragraph [ref=e68]: Max opp repeat
            - generic [ref=e69]:
              - paragraph [ref=e70]: "0"
              - paragraph [ref=e71]: Consecutive rests
            - generic [ref=e72]:
              - paragraph [ref=e73]: "2.33"
              - paragraph [ref=e74]: Avg strength gap
            - generic [ref=e75]:
              - paragraph [ref=e76]: "8"
              - paragraph [ref=e77]: Max gap
        - generic [ref=e78]:
          - generic [ref=e79]:
            - generic [ref=e80]:
              - paragraph [ref=e81]: Round 1
              - generic [ref=e82]: 4 courts
            - generic [ref=e83]:
              - generic [ref=e84]:
                - paragraph [ref=e85]: Court 1
                - paragraph [ref=e86]: Club A Test 02 & Club A Test 01
                - paragraph [ref=e87]: vs
                - paragraph [ref=e88]: Club B Test 01 & Club B Test 02
              - generic [ref=e89]:
                - paragraph [ref=e90]: Court 2
                - paragraph [ref=e91]: Club A Test 03 & Club A Test 04
                - paragraph [ref=e92]: vs
                - paragraph [ref=e93]: Club B Test 03 & Club B Test 04
              - generic [ref=e94]:
                - paragraph [ref=e95]: Court 3
                - paragraph [ref=e96]: Club A Test 05 & Club A Test 06
                - paragraph [ref=e97]: vs
                - paragraph [ref=e98]: Club B Test 05 & Club B Test 06
              - generic [ref=e99]:
                - paragraph [ref=e100]: Court 4
                - paragraph [ref=e101]: Club A Test 07 & Club A Test 08
                - paragraph [ref=e102]: vs
                - paragraph [ref=e103]: Club B Test 07 & Club B Test 08
          - generic [ref=e104]:
            - generic [ref=e105]:
              - paragraph [ref=e106]: Round 2
              - generic [ref=e107]: 4 courts
            - generic [ref=e108]:
              - generic [ref=e109]:
                - paragraph [ref=e110]: Court 1
                - paragraph [ref=e111]: Club A Test 09 & Club A Test 10
                - paragraph [ref=e112]: vs
                - paragraph [ref=e113]: Club B Test 09 & Club B Test 10
              - generic [ref=e114]:
                - paragraph [ref=e115]: Court 2
                - paragraph [ref=e116]: Club A Test 11 & Club A Test 12
                - paragraph [ref=e117]: vs
                - paragraph [ref=e118]: Club B Test 11 & Club B Test 12
              - generic [ref=e119]:
                - paragraph [ref=e120]: Court 3
                - paragraph [ref=e121]: Club A Test 13 & Club A Test 14
                - paragraph [ref=e122]: vs
                - paragraph [ref=e123]: Club B Test 13 & Club B Test 14
              - generic [ref=e124]:
                - paragraph [ref=e125]: Court 4
                - paragraph [ref=e126]: Club A Test 15 & Club A Test 16
                - paragraph [ref=e127]: vs
                - paragraph [ref=e128]: Club B Test 15 & Club B Test 16
          - generic [ref=e129]:
            - generic [ref=e130]:
              - paragraph [ref=e131]: Round 3
              - generic [ref=e132]: 4 courts
            - generic [ref=e133]:
              - generic [ref=e134]:
                - paragraph [ref=e135]: Court 1
                - paragraph [ref=e136]: Club A Test 02 & Club A Test 03
                - paragraph [ref=e137]: vs
                - paragraph [ref=e138]: Club B Test 05 & Club B Test 07
              - generic [ref=e139]:
                - paragraph [ref=e140]: Court 2
                - paragraph [ref=e141]: Club A Test 01 & Club A Test 04
                - paragraph [ref=e142]: vs
                - paragraph [ref=e143]: Club B Test 06 & Club B Test 08
              - generic [ref=e144]:
                - paragraph [ref=e145]: Court 3
                - paragraph [ref=e146]: Club A Test 05 & Club A Test 07
                - paragraph [ref=e147]: vs
                - paragraph [ref=e148]: Club B Test 01 & Club B Test 03
              - generic [ref=e149]:
                - paragraph [ref=e150]: Court 4
                - paragraph [ref=e151]: Club A Test 06 & Club A Test 08
                - paragraph [ref=e152]: vs
                - paragraph [ref=e153]: Club B Test 02 & Club B Test 04
          - generic [ref=e154]:
            - generic [ref=e155]:
              - paragraph [ref=e156]: Round 4
              - generic [ref=e157]: 4 courts
            - generic [ref=e158]:
              - generic [ref=e159]:
                - paragraph [ref=e160]: Court 1
                - paragraph [ref=e161]: Club A Test 09 & Club A Test 11
                - paragraph [ref=e162]: vs
                - paragraph [ref=e163]: Club B Test 13 & Club B Test 15
              - generic [ref=e164]:
                - paragraph [ref=e165]: Court 2
                - paragraph [ref=e166]: Club A Test 10 & Club A Test 12
                - paragraph [ref=e167]: vs
                - paragraph [ref=e168]: Club B Test 14 & Club B Test 16
              - generic [ref=e169]:
                - paragraph [ref=e170]: Court 3
                - paragraph [ref=e171]: Club A Test 13 & Club A Test 15
                - paragraph [ref=e172]: vs
                - paragraph [ref=e173]: Club B Test 09 & Club B Test 11
              - generic [ref=e174]:
                - paragraph [ref=e175]: Court 4
                - paragraph [ref=e176]: Club A Test 14 & Club A Test 16
                - paragraph [ref=e177]: vs
                - paragraph [ref=e178]: Club B Test 10 & Club B Test 12
          - generic [ref=e179]:
            - generic [ref=e180]:
              - paragraph [ref=e181]: Round 5
              - generic [ref=e182]: 4 courts
            - generic [ref=e183]:
              - generic [ref=e184]:
                - paragraph [ref=e185]: Court 1
                - paragraph [ref=e186]: Club A Test 05 & Club A Test 08
                - paragraph [ref=e187]: vs
                - paragraph [ref=e188]: Club B Test 05 & Club B Test 08
              - generic [ref=e189]:
                - paragraph [ref=e190]: Court 2
                - paragraph [ref=e191]: Club A Test 06 & Club A Test 07
                - paragraph [ref=e192]: vs
                - paragraph [ref=e193]: Club B Test 06 & Club B Test 07
              - generic [ref=e194]:
                - paragraph [ref=e195]: Court 3
                - paragraph [ref=e196]: Club A Test 02 & Club A Test 04
                - paragraph [ref=e197]: vs
                - paragraph [ref=e198]: Club B Test 01 & Club B Test 04
              - generic [ref=e199]:
                - paragraph [ref=e200]: Court 4
                - paragraph [ref=e201]: Club A Test 01 & Club A Test 03
                - paragraph [ref=e202]: vs
                - paragraph [ref=e203]: Club B Test 02 & Club B Test 03
          - generic [ref=e204]:
            - generic [ref=e205]:
              - paragraph [ref=e206]: Round 6
              - generic [ref=e207]: 4 courts
            - generic [ref=e208]:
              - generic [ref=e209]:
                - paragraph [ref=e210]: Court 1
                - paragraph [ref=e211]: Club A Test 13 & Club A Test 16
                - paragraph [ref=e212]: vs
                - paragraph [ref=e213]: Club B Test 13 & Club B Test 16
              - generic [ref=e214]:
                - paragraph [ref=e215]: Court 2
                - paragraph [ref=e216]: Club A Test 14 & Club A Test 15
                - paragraph [ref=e217]: vs
                - paragraph [ref=e218]: Club B Test 14 & Club B Test 15
              - generic [ref=e219]:
                - paragraph [ref=e220]: Court 3
                - paragraph [ref=e221]: Club A Test 09 & Club A Test 12
                - paragraph [ref=e222]: vs
                - paragraph [ref=e223]: Club B Test 09 & Club B Test 12
              - generic [ref=e224]:
                - paragraph [ref=e225]: Court 4
                - paragraph [ref=e226]: Club A Test 10 & Club A Test 11
                - paragraph [ref=e227]: vs
                - paragraph [ref=e228]: Club B Test 10 & Club B Test 11
          - generic [ref=e229]:
            - generic [ref=e230]:
              - paragraph [ref=e231]: Round 7
              - generic [ref=e232]: 4 courts
            - generic [ref=e233]:
              - generic [ref=e234]:
                - paragraph [ref=e235]: Court 1
                - paragraph [ref=e236]: Club A Test 03 & Club A Test 07
                - paragraph [ref=e237]: vs
                - paragraph [ref=e238]: Club B Test 04 & Club B Test 08
              - generic [ref=e239]:
                - paragraph [ref=e240]: Court 2
                - paragraph [ref=e241]: Club A Test 02 & Club A Test 05
                - paragraph [ref=e242]: vs
                - paragraph [ref=e243]: Club B Test 02 & Club B Test 06
              - generic [ref=e244]:
                - paragraph [ref=e245]: Court 3
                - paragraph [ref=e246]: Club A Test 04 & Club A Test 08
                - paragraph [ref=e247]: vs
                - paragraph [ref=e248]: Club B Test 03 & Club B Test 07
              - generic [ref=e249]:
                - paragraph [ref=e250]: Court 4
                - paragraph [ref=e251]: Club A Test 01 & Club A Test 06
                - paragraph [ref=e252]: vs
                - paragraph [ref=e253]: Club B Test 01 & Club B Test 05
          - generic [ref=e254]:
            - generic [ref=e255]:
              - paragraph [ref=e256]: Round 8
              - generic [ref=e257]: 4 courts
            - generic [ref=e258]:
              - generic [ref=e259]:
                - paragraph [ref=e260]: Court 1
                - paragraph [ref=e261]: Club A Test 11 & Club A Test 15
                - paragraph [ref=e262]: vs
                - paragraph [ref=e263]: Club B Test 12 & Club B Test 16
              - generic [ref=e264]:
                - paragraph [ref=e265]: Court 2
                - paragraph [ref=e266]: Club A Test 09 & Club A Test 13
                - paragraph [ref=e267]: vs
                - paragraph [ref=e268]: Club B Test 10 & Club B Test 14
              - generic [ref=e269]:
                - paragraph [ref=e270]: Court 3
                - paragraph [ref=e271]: Club A Test 12 & Club A Test 16
                - paragraph [ref=e272]: vs
                - paragraph [ref=e273]: Club B Test 11 & Club B Test 15
              - generic [ref=e274]:
                - paragraph [ref=e275]: Court 4
                - paragraph [ref=e276]: Club A Test 10 & Club A Test 14
                - paragraph [ref=e277]: vs
                - paragraph [ref=e278]: Club B Test 09 & Club B Test 13
          - generic [ref=e279]:
            - generic [ref=e280]:
              - paragraph [ref=e281]: Round 9
              - generic [ref=e282]: 4 courts
            - generic [ref=e283]:
              - generic [ref=e284]:
                - paragraph [ref=e285]: Court 1
                - paragraph [ref=e286]: Club A Test 02 & Club A Test 06
                - paragraph [ref=e287]: vs
                - paragraph [ref=e288]: Club B Test 03 & Club B Test 08
              - generic [ref=e289]:
                - paragraph [ref=e290]: Court 2
                - paragraph [ref=e291]: Club A Test 01 & Club A Test 05
                - paragraph [ref=e292]: vs
                - paragraph [ref=e293]: Club B Test 04 & Club B Test 07
              - generic [ref=e294]:
                - paragraph [ref=e295]: Court 3
                - paragraph [ref=e296]: Club A Test 03 & Club A Test 08
                - paragraph [ref=e297]: vs
                - paragraph [ref=e298]: Club B Test 01 & Club B Test 06
              - generic [ref=e299]:
                - paragraph [ref=e300]: Court 4
                - paragraph [ref=e301]: Club A Test 04 & Club A Test 07
                - paragraph [ref=e302]: vs
                - paragraph [ref=e303]: Club B Test 02 & Club B Test 05
          - generic [ref=e304]:
            - generic [ref=e305]:
              - paragraph [ref=e306]: Round 10
              - generic [ref=e307]: 4 courts
            - generic [ref=e308]:
              - generic [ref=e309]:
                - paragraph [ref=e310]: Court 1
                - paragraph [ref=e311]: Club A Test 09 & Club A Test 14
                - paragraph [ref=e312]: vs
                - paragraph [ref=e313]: Club B Test 11 & Club B Test 16
              - generic [ref=e314]:
                - paragraph [ref=e315]: Court 2
                - paragraph [ref=e316]: Club A Test 10 & Club A Test 13
                - paragraph [ref=e317]: vs
                - paragraph [ref=e318]: Club B Test 12 & Club B Test 15
              - generic [ref=e319]:
                - paragraph [ref=e320]: Court 3
                - paragraph [ref=e321]: Club A Test 11 & Club A Test 16
                - paragraph [ref=e322]: vs
                - paragraph [ref=e323]: Club B Test 09 & Club B Test 14
              - generic [ref=e324]:
                - paragraph [ref=e325]: Court 4
                - paragraph [ref=e326]: Club A Test 12 & Club A Test 15
                - paragraph [ref=e327]: vs
                - paragraph [ref=e328]: Club B Test 10 & Club B Test 13
          - generic [ref=e329]:
            - generic [ref=e330]:
              - paragraph [ref=e331]: Round 11
              - generic [ref=e332]: 4 courts
            - generic [ref=e333]:
              - generic [ref=e334]:
                - paragraph [ref=e335]: Court 1
                - paragraph [ref=e336]: Club A Test 01 & Club A Test 08
                - paragraph [ref=e337]: vs
                - paragraph [ref=e338]: Club B Test 04 & Club B Test 06
              - generic [ref=e339]:
                - paragraph [ref=e340]: Court 2
                - paragraph [ref=e341]: Club A Test 02 & Club A Test 07
                - paragraph [ref=e342]: vs
                - paragraph [ref=e343]: Club B Test 03 & Club B Test 05
              - generic [ref=e344]:
                - paragraph [ref=e345]: Court 3
                - paragraph [ref=e346]: Club A Test 04 & Club A Test 06
                - paragraph [ref=e347]: vs
                - paragraph [ref=e348]: Club B Test 02 & Club B Test 08
              - generic [ref=e349]:
                - paragraph [ref=e350]: Court 4
                - paragraph [ref=e351]: Club A Test 03 & Club A Test 05
                - paragraph [ref=e352]: vs
                - paragraph [ref=e353]: Club B Test 01 & Club B Test 07
          - generic [ref=e354]:
            - generic [ref=e355]:
              - paragraph [ref=e356]: Round 12
              - generic [ref=e357]: 4 courts
            - generic [ref=e358]:
              - generic [ref=e359]:
                - paragraph [ref=e360]: Court 1
                - paragraph [ref=e361]: Club A Test 10 & Club A Test 16
                - paragraph [ref=e362]: vs
                - paragraph [ref=e363]: Club B Test 12 & Club B Test 14
              - generic [ref=e364]:
                - paragraph [ref=e365]: Court 2
                - paragraph [ref=e366]: Club A Test 09 & Club A Test 15
                - paragraph [ref=e367]: vs
                - paragraph [ref=e368]: Club B Test 11 & Club B Test 13
              - generic [ref=e369]:
                - paragraph [ref=e370]: Court 3
                - paragraph [ref=e371]: Club A Test 12 & Club A Test 14
                - paragraph [ref=e372]: vs
                - paragraph [ref=e373]: Club B Test 10 & Club B Test 16
              - generic [ref=e374]:
                - paragraph [ref=e375]: Court 4
                - paragraph [ref=e376]: Club A Test 11 & Club A Test 13
                - paragraph [ref=e377]: vs
                - paragraph [ref=e378]: Club B Test 09 & Club B Test 15
        - generic [ref=e379]:
          - generic [ref=e380]:
            - paragraph [ref=e381]: Hall sound check before play
            - paragraph [ref=e382]: Use the actual phone/tablet and speaker now. This is local audio only and makes no Base44 request.
          - button "Test Sound Again ✓" [active] [ref=e383] [cursor=pointer]
        - button "Start Club Challenge" [ref=e385] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e386]:
        - generic [ref=e390]: Draw approved and locked
```

# Test source

```ts
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
  193 |     window.AudioContext=FakeAudioContext;window.webkitAudioContext=FakeAudioContext;
  194 |     window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}};
  195 |     window.speechSynthesis={getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}};
  196 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  197 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  198 |   });
  199 | }
  200 | 
  201 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
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
> 230 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.audioSignals)).toBeGreaterThan(0);await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;
      |                                                                                                                                                                                                                                                                                                ^ Error: expect(received).toBeGreaterThan(expected)
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
  271 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  272 | });
```