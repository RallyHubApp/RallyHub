import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(`KOTC access architecture gate failed: ${message}`);};
const includes=(text,needle,message)=>assert(text.includes(needle),message||`missing ${needle}`);

const access=read('base44/functions/manageKotcSessionAccess/entry.ts');
const state=read('base44/functions/getKotcV2State/entry.ts');
const contacts=read('base44/functions/getKotcContacts/entry.ts');
const command=read('base44/functions/kotcCommand/entry.ts');
const scorer=read('base44/functions/kotcScorer/entry.ts');
const saveScore=read('base44/functions/saveKotcScore/entry.ts');
const startRound=read('base44/functions/startKotcRound/entry.ts');
const pairLock=read('base44/functions/setKotcPairLock/entry.ts');
const prepareNext=read('base44/functions/prepareKotcNextRound/entry.ts');
const scorerLinks=read('base44/functions/manageKotcScorerLinks/entry.ts');
const results=read('base44/functions/kotcResultsShare/entry.ts');
const create=read('base44/functions/createKotcV2Session/entry.ts');
const role=read('src/hooks/useKotcRole.jsx');
const hostUi=read('src/components/kotc/KotcV2SessionView.jsx');
const scorerUi=read('src/pages/PublicKotcScorer.jsx');
const workflow=read('src/lib/kotcV2Workflow.js');
const dashboard=read('src/pages/Dashboard.jsx');
const hostSessionPage=read('src/pages/KotcHostSession.jsx');
const mobileHostTest=read('e2e/kotc-host-journey.spec.mjs');
const kotcView=read('src/components/kotc/KotcView.jsx');
const setupPanel=read('src/components/kotc/KotcSetupPanel.jsx');
const timerUi=read('src/components/kotc/RoundTimer.jsx');

// Super Admin / host boundary.
includes(access,"caller.role!=='admin'",'only platform admins may grant or revoke delegated host access');
includes(role,"user.role === 'admin'",'platform admin must resolve through KOTC role hook');
includes(role,"return 'super_admin'",'platform admin must resolve as KOTC super_admin');
includes(state,"['session_host','assistant_host','viewer'].includes(a.role)",'session_host must remain a recognised state access role');
includes(state,'contactDirectory:{}','normal KOTC state must not fetch private contacts on the live hot path');
includes(contacts,"a.role!=='session_host'",'contact endpoint must be limited to primary session_host or platform admin');
includes(contacts,'entities.Person.filter','session contacts must come from canonical Person records');
includes(contacts,"participants||[]).map((p:any)=>p.player_id",'contact lookup must start from the session participant roster');
includes(contacts,"person.emergency_contact_name||person.emergency_contact_raw||player.emergency_contact",'session contacts must fall back to the imported raw emergency name when structured name is empty');

// Public live view: token first, no authentication requirement, and no private contact fields in public branch.
const publicStart=results.indexOf("if(action==='public_state')");
const authStart=results.indexOf('const user=await base44.auth.me()');
assert(publicStart>=0&&authStart>publicStart,'public_state must be handled before authenticated host actions');
const publicBranch=results.slice(publicStart,authStart);
assert(!/emergency_|emergency contact|\.mobile\b|phone:/i.test(publicBranch),'public live payload must not expose member phone/emergency fields');
includes(publicBranch,'KotcSessionShare.filter','public live state must require an active unguessable share token');
includes(publicBranch,"status:'active'",'public live share must be active');

// Delegated host may create session-scoped public/scoring links, but host delegation remains admin-only.
includes(results,"a.role!=='session_host'",'non-admin live-link generation must require session_host');
includes(scorerLinks,"a.role!=='session_host'",'non-admin scorer-link generation must require session_host');
assert(!scorerLinks.includes('manageKotcSessionAccess'),'scorer-link function must not grant host access');

// Player scorer must remain narrow and deadlock-safe.
includes(scorer,'This device is already scoring Court','one scorer device may hold only one court lease');
includes(scorer,'is being scored on another device','same-court scorer collision must be rejected');
includes(scorer,'expectedRevision','scorer save must use optimistic revision protection');
includes(scorer,'scorer_correction_owner_client_id:clientId','successful player score must retain correction ownership for the saving device');
includes(scorer,'Only the scorer device that saved it, or the host','another player device must not reopen an already-saved court');
includes(scorer,'can_correct:RESOLVED.has(m.status)','scorer state must expose correction ability only to the saving device');
assert(!scorer.includes('generate_next_round'),'player scorer must never advance the sporting round');
assert(!scorer.includes('set_participant_status'),'player scorer must never change participant availability');

// KOTC pickleball score-entry ergonomics and server validation.
assert((hostUi.match(/maxLength=\{2\}/g)||[]).length>=2,'host score inputs must physically limit entry to two digits');
assert((scorerUi.match(/maxLength=\{2\}/g)||[]).length>=2,'player scorer inputs must physically limit entry to two digits');
includes(hostUi,'inputMode="numeric"','host score inputs must request the numeric mobile keypad');
includes(scorerUi,'inputMode="numeric"','player scorer inputs must request the numeric mobile keypad');
includes(saveScore,"KOTC scores cannot exceed 99.",'dedicated host score endpoint must reject scores above 99');
includes(scorer,"KOTC scores cannot exceed 99.",'player scorer endpoint must reject scores above 99');
includes(command,"KOTC scores cannot exceed 99.",'general correction/autosave path must reject scores above 99');
includes(workflow,"KOTC scores cannot exceed 99.",'sporting workflow validation must enforce the same two-digit score ceiling');
assert(!dashboard.includes("player.skill_rating || 3.0"),'dashboard must never display a manufactured 3.0 rating for an unrated player');
includes(dashboard,'player.dupr_rating != null','dashboard may show a rating only when a genuine DUPR value exists');
assert(!create.includes('skill_rating||3')&&!create.includes('skill_rating || 3'),'KOTC session creation must not manufacture a 3.0 rating snapshot');
assert(!hostSessionPage.includes('rating_snapshot||3')&&!hostSessionPage.includes('rating_snapshot || 3'),'restricted host view must not manufacture a 3.0 rating');

// Host is authoritative over a player scorer.
includes(command,"commandType === 'host_claim_score'",'host must have explicit scorer takeover command');
includes(command,'scoring_lock_owner:hostOwner','host takeover must own the court lease');
includes(command,'scoring_lock_owner:null','host correction must release the court lease');
includes(saveScore,'scoring_lock_owner:null','dedicated host score save must release the court lease');
includes(saveScore,'alreadySaved:true','score-save retry after a lost response must reconcile as success');
includes(saveScore,'AuditLog.create','dedicated score save retains best-effort audit support');
includes(saveScore,"console.warn('KOTC score audit skipped'",'score audit failure must not poison the sporting save');
includes(startRound,"round.status==='started'",'START ROUND retry after a lost response must be idempotent');
includes(hostUi,"functions.invoke('setKotcPairLock'",'host pair lock must use its dedicated lightweight backend function');
includes(pairLock,"RUNTIME_VERSION='kotc-2026-09-10-r7'",'pair-lock endpoint must expose its deployed runtime contract version');
assert(!pairLock.includes('KotcRecoveryCheckpoint')&&!pairLock.includes('snapshot_json'),'pair-lock endpoint must never depend on recovery snapshot payloads');
includes(hostUi,"Saving…",'pair-lock tap must acknowledge immediately while the backend confirms it');
includes(hostUi,"Locked ✓ · Unlock",'confirmed pair lock must be visually unmistakable');
includes(pairLock,"slotParticipantIds",'pair-lock endpoint must receive the current proposed-round draft');
includes(pairLock,"draft slot save",'pair-lock endpoint must persist changed proposed-round slots before confirming the lock');
includes(pairLock,"draft match save",'pair-lock endpoint must keep proposed-round match teams aligned with persisted slot changes');
includes(pairLock,"round proposal revision",'persisting pair-related draft changes must advance the proposed-round revision');
includes(pairLock,"KOTC pair-lock rate limit",'pair-lock endpoint must retry transient Base44 provider limits');
includes(hostUi,"slotParticipantIds:shouldLock?draft",'host UI must send the current Round Editor draft when locking a pair');

// Membership is not inferred from Player existence.
includes(create,'entities.ClubRelationship.filter','session participant classification must consult club relationship');
includes(create,'participantTypeFor','session creation must classify permanent non-member Players');
includes(create,"rel==='booking_only'",'booking-only Player must be represented explicitly');
includes(create,"rel==='waiting_list'",'waiting-list Player must be represented explicitly');
includes(command,"p.participant_type!=='member'",'non-member participant types must be excluded from KOTC aggregates');
includes(command,"x.participant_type==='member'",'historical aggregate records must also be member-only');

// Historical corrections are controlled and do not mutate future draw history.
includes(command,"commandType === 'correct_match' && user.role === 'admin'",'finalised score corrections must require Super Admin');
includes(command,"action:'kotc_score_corrected'",'score correction must be audit logged');

// Base44 provider resilience: use small recovery markers and dedicated, rate-limit-aware live endpoints.
includes(command,"recoveryModel:'authoritative_entities'",'recovery checkpoints must reference authoritative entities rather than copying the whole session');
assert(!command.includes('participationEvents:events')&&!command.includes('sessionCourts:courts'),'recovery checkpoints must not duplicate large live collections');
includes(hostUi,"functions.invoke('prepareKotcNextRound'",'host Prepare Next Round must use its dedicated live-session endpoint');
assert(!hostUi.includes("commandType:'generate_next_round'"),'host UI must not route Prepare Next Round through the heavy general command pipeline');
includes(prepareNext,"RUNTIME_VERSION='kotc-prepare-2026-09-10-r8'",'dedicated next-round endpoint must expose its current runtime contract version');
includes(prepareNext,"retry('create slots'",'next-round slot creation must retry Base44 provider limits internally');
includes(prepareNext,"retry('advance session'",'final next-round session advance must be rate-limit resilient');
assert(!prepareNext.includes('Promise.all(['),'next-round provider writes must not be fired concurrently against Base44 burst limits');
assert(!prepareNext.includes('KotcRecoveryCheckpoint')&&!prepareNext.includes('snapshot_json'),'dedicated next-round endpoint must never depend on recovery snapshot payloads');
includes(prepareNext,'KotcRoundSlot.bulkCreate(slotPayload)','next-round slot creation must use Base44 bulkCreate');
includes(prepareNext,'KotcMatch.bulkCreate(matchPayload)','next-round match creation must use Base44 bulkCreate');
includes(prepareNext,'KotcSessionParticipant.bulkUpdate(participantPayload)','next-round participant updates must use Base44 bulkUpdate');
includes(prepareNext,'KotcParticipationEvent.bulkCreate(eventPayload)','next-round participation events must be batched');
includes(prepareNext,'enforceLocks(finalSlots,locks,new Set(eligible.map','active host pair locks must be enforced before next-round slots are persisted');
includes(prepareNext,"assignment_type:'locked_pair_override'",'automatic persistent-lock repair must be identifiable in the proposed draw');
includes(prepareNext,'was split between court and bench','an available locked pair must never be split between court and bench');
includes(prepareNext,'reached different destination courts.','a pair lock must never be repaired by moving a player to an unearned court');
includes(saveScore,"withRateLimitRetry('score match save'",'host score save must retry transient Base44 rate limits');
includes(scorer,"withRateLimitRetry('scorer result save'",'player scorer save must retry transient Base44 rate limits');
includes(create,"KotcSessionParticipant.bulkCreate(participantPayload)",'Round 1 participant creation must be batched rather than one write per player');
includes(create,"KotcRoundSlot.bulkCreate(slotPayload)",'Round 1 slot creation must be batched rather than one write per slot');
includes(create,"KotcMatch.bulkCreate(matchPayload)",'Round 1 match creation must be batched rather than one write per court');
includes(create,"retry('session create'",'KOTC session creation must internally retry Base44 provider rate limits');
includes(create,"retry('round1 slots bulk create'",'Round 1 slot batch must internally retry Base44 provider rate limits');
includes(hostUi,"'pageshow'",'host UI must reconcile authoritative state when a mobile browser restores the page');
includes(hostUi,'kotc-quick-links','host UI must expose scoring/public links without backwards navigation');
includes(mobileHostTest,'PageTransitionEvent','mobile host robot must exercise back-forward-cache restoration');
includes(command,'command-log finalisation skipped after successful sporting write','secondary command-log failure must not report sporting failure');

// Busy-hall UX safeguards: sound check, local player search and explicit test-only scoring helpers.
includes(timerUi,'Sound check. RallyHub timer ready.','KOTC must provide a real spoken sound check before play');
includes(timerUi,"localStorage.getItem('kotc-voice-mode')",'KOTC announcement voice choice must persist on the host device');
includes(timerUi,"utterance.lang = 'en-IE'",'KOTC speech must request Irish English when supported by the device');
const soundCheckStart=timerUi.indexOf('const testSound = async () =>');
const soundCheckEnd=timerUi.indexOf('return <div data-testid="kotc-sound-check"',soundCheckStart);
assert(soundCheckStart>=0&&soundCheckEnd>soundCheckStart&&!timerUi.slice(soundCheckStart,soundCheckEnd).includes('base44.'),'pre-round sound check must be device-local with zero Base44 calls');
includes(kotcView,"String(p.status || 'Active').toLowerCase() === 'active'",'KOTC operational player picker must exclude inactive players');
includes(kotcView,"!['archived','inactive'].includes",'KOTC player picker must exclude archived relationships');
includes(kotcView,"localeCompare(String(b.full_name || ''), 'en'",'KOTC player picker must sort alphabetically on-device');
includes(kotcView,'data-testid="kotc-player-search"','KOTC add-player picker must expose a name search');
includes(kotcView,'searchedAvailablePlayers = playerSearch.trim()','KOTC player search must filter the already-loaded directory locally');
includes(setupPanel,'canUseTestMode&&<label','KOTC Test Mode setup control must be visible only to a Super Admin');
includes(setupPanel,'data-testid="kotc-test-mode"','KOTC setup must require an explicit test-mode choice');
includes(state,"isAdmin:user.role==='admin'",'KOTC state must return server-verified Super Admin status even before a session exists');
includes(create,"testMode=user.role==='admin'&&Boolean(body.testMode)",'backend must bind Test Mode to the authenticated Super Admin role');
includes(create,'demo_mode:testMode,exclude_from_aggregates:testMode','test mode must be excluded from historical aggregates at session creation');
includes(hostUi,'const testMode=isSuperAdmin&&!!(session?.exclude_from_aggregates||session?.demo_mode)','Fill Test Scores must require both stored test state and Super Admin status');
includes(hostUi,'data-testid="kotc-fill-test-scores"','test-mode host UI must expose the local Fill Test Scores helper');
includes(hostUi,'setTestFillKey(Date.now())','Fill Test Scores must populate local score UI rather than bulk-writing results');

console.log(`KOTC access/architecture gate: PASS\n${checks} role, privacy, scoring-lock, membership and correction checks, 0 failures.`);
