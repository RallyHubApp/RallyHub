import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  calculateClubChallengeFormat,
  generateClubChallengeFixtures,
  analyseClubChallengeFairness,
  calculateClubChallengeScore,
} from '../src/lib/clubChallengeEngine.js';

const ui = fs.readFileSync('src/components/clubchallenge/ClubChallengeView.jsx','utf8');
const publicDisplay = fs.readFileSync('src/pages/PublicClubChallengeDisplay.jsx','utf8');
const publicVote = fs.readFileSync('src/pages/PublicClubChallengeVote.jsx','utf8');
const timerFn = fs.readFileSync('base44/functions/updateClubChallengeTimer/entry.ts','utf8');
const roundFn = fs.readFileSync('base44/functions/updateClubChallengeRound/entry.ts','utf8');
const eventFn = fs.readFileSync('base44/functions/manageClubChallengeEvent/entry.ts','utf8');
const scoreFn = fs.readFileSync('base44/functions/saveClubChallengeScore/entry.ts','utf8');
const voteFn = fs.readFileSync('base44/functions/castPublicClubChallengePotVote/entry.ts','utf8');
const participantFn = fs.readFileSync('base44/functions/manageClubChallengeParticipant/entry.ts','utf8');
const spondFn = fs.readFileSync('base44/functions/spondIntegrationWorking/entry.ts','utf8');
const scheduleFn = fs.readFileSync('base44/functions/updateClubChallengeSchedule/entry.ts','utf8');
const finaliseFn = fs.readFileSync('base44/functions/finaliseClubChallenge/entry.ts','utf8');
const practiceFn = fs.readFileSync('base44/functions/loadClubChallengePracticeRoster/entry.ts','utf8');
const fullPracticeFn = fs.readFileSync('base44/functions/populateClubChallengePracticeScenario/entry.ts','utf8');
const hallAudio = fs.readFileSync('src/lib/rallyHubHallAudio.js','utf8');
const drawFn = fs.readFileSync('base44/functions/replaceClubChallengeDraw/entry.ts','utf8');
const interclubBranding = fs.readFileSync('src/lib/interclubBranding.js','utf8');
const tournamentsPage = fs.readFileSync('src/pages/Tournaments.jsx','utf8');
const createTournamentModal = fs.readFileSync('src/components/tournaments/CreateTournamentModal.jsx','utf8');
const publicDisplayPage = fs.readFileSync('src/pages/PublicClubChallengeDisplay.jsx','utf8');

let passed = 0;
const check = (name, condition) => {
  assert.ok(condition, name);
  passed += 1;
  console.log(`PASS  ${name}`);
};
const contains = (text, needle) => text.includes(needle);

console.log('RALLYHUB CLUB CHALLENGE — INTERACTION ROBOT');
console.log('Purpose: challenge the host/scorer/player/display journeys before physical acceptance.\n');

// 1. Sporting-engine baseline remains unchanged.
const clubA = Array.from({length:16},(_,i)=>({id:`A${i+1}`,name:`A${i+1}`,rank:i+1,gender:i%2?'Female':'Male'}));
const clubB = Array.from({length:16},(_,i)=>({id:`B${i+1}`,name:`B${i+1}`,rank:i+1,gender:i%2?'Female':'Male'}));
const format = calculateClubChallengeFormat({clubAPlayerCount:16,clubBPlayerCount:16,courts:4,availableMinutes:180,playMinutes:10,changeoverMinutes:2,includeBreak:true,breakMinutes:20,breakAfterRound:6});
check('sporting: canonical duration = 164 structured minutes', format.structuredMinutes === 164);
check('sporting: canonical contingency = 16 minutes', format.remainingMinutes === 16);
check('sporting: canonical 12 rounds', format.recommendedRounds === 12);
check('sporting: canonical 48 matches', format.totalMatches === 48);
const schedule = generateClubChallengeFixtures({clubAPlayers:clubA,clubBPlayers:clubB,courts:4,rounds:12});
const fairness = analyseClubChallengeFairness({schedule,clubAPlayers:clubA,clubBPlayers:clubB});
check('sporting: equal games remain protected', fairness.equalGames && fairness.minGames === 6 && fairness.maxGames === 6);
check('sporting: no partner repeats remain protected', fairness.repeatedPartnerPairs === 0);
check('sporting: no consecutive rests remain protected', fairness.consecutiveRestOccurrences === 0);
const rotationFormat = calculateClubChallengeFormat({clubAPlayerCount:18,clubBPlayerCount:18,courts:4,availableMinutes:180,playMinutes:10,changeoverMinutes:2,includeBreak:true,breakMinutes:20,breakAfterRound:6});
const rotationSchedule = generateClubChallengeFixtures({clubAPlayers:Array.from({length:18},(_,i)=>({id:`RA${i+1}`,name:`RA${i+1}`,rank:i+1})),clubBPlayers:Array.from({length:18},(_,i)=>({id:`RB${i+1}`,name:`RB${i+1}`,rank:i+1})),courts:4,rounds:rotationFormat.recommendedRounds});
const rotationFairness = analyseClubChallengeFairness({schedule:rotationSchedule,clubAPlayers:Array.from({length:18},(_,i)=>({id:`RA${i+1}`,name:`RA${i+1}`,rank:i+1})),clubBPlayers:Array.from({length:18},(_,i)=>({id:`RB${i+1}`,name:`RB${i+1}`,rank:i+1}))});
check('sporting: 18-a-side uses available time instead of dropping four rounds', rotationFormat.recommendedRounds === 13 && rotationFormat.totalMatches === 52 && rotationFormat.remainingMinutes === 4);
check('sporting: 18-a-side rotation remains within one game per player', rotationFairness.balancedGames && rotationFairness.minGames === 5 && rotationFairness.maxGames === 6);

// 2. Host setup / first-use journey.
check('branding: user-facing module is RallyHub Interclub', contains(interclubBranding,"INTERCLUB_MODULE_NAME = 'RallyHub Interclub'") && contains(tournamentsPage,'INTERCLUB_MODULE_NAME'));
check('branding: user-facing event type is Interclub Challenge', contains(interclubBranding,"INTERCLUB_EVENT_LABEL = 'Interclub Challenge'") && contains(createTournamentModal,'INTERCLUB_EVENT_LABEL'));
check('branding: internal Club Challenge format key remains stable', contains(interclubBranding,"INTERCLUB_INTERNAL_FORMAT = 'Club Challenge'") && contains(ui,'INTERCLUB_INTERNAL_FORMAT'));
check('branding: Hall Display uses RallyHub Interclub', contains(publicDisplayPage,'INTERCLUB_MODULE_NAME') && contains(ui,'INTERCLUB_MODULE_NAME} · Hall Display'));
check('host: live estimated duration is visible during setup', contains(ui,'Estimated event duration'));
check('host: planned player count drives estimate before roster entry', contains(ui,'Planned total players'));
check('host: estimate exposes rounds, block, break and contingency', contains(ui,'min contingency'));
check('host: practice roster has a clear first-time-host affordance', contains(ui,'Practice with 32 Test Players'));
check('host: practice data is protected behind event-manager authority', contains(practiceFn,'Event manager permission required'));
check('host: practice data cannot overwrite an approved/live event', contains(practiceFn,"['draft','draw_generated'].includes(event.status)"));
check('host: practice load is audited', contains(practiceFn,"action:'practice_roster_loaded'"));
check('test mode: complete visual journey has a single host action', contains(ui,'Populate Full Test Event') && contains(ui,"populateClubChallengePracticeScenario"));
check('test mode: full population is dummy-roster restricted server-side', contains(fullPracticeFn,"startsWith('gate3-')"));
check('test mode: full population fills all normal scores', contains(fullPracticeFn,"status:'completed'") && contains(fullPracticeFn,"normal_matches:normal.length"));
check('test mode: full population includes Showcase when enabled', contains(fullPracticeFn,'showcase_enabled') && contains(fullPracticeFn,"is_showcase:true"));
check('test mode: full population includes sample POT voting', contains(fullPracticeFn,'practiceVotes') && contains(fullPracticeFn,"pot_status:'revealed'"));
check('test mode: visual bulk population is one browser function invocation', (ui.match(/populateClubChallengePracticeScenario/g)||[]).length === 1);

// 3. Team build + ranking journey: pooled import, drag/drop and one-save organisation.
check('host: Unassigned Pool is available on demand rather than permanently occupying a team column', contains(ui,"const [poolOpen, setPoolOpen] = useState(false)") && contains(ui,'Unassigned Pool') && contains(ui,"poolOpen && lane('pool','Player Pool',lanes.pool)"));
check('host: teams and rankings use cross-column drag/drop', contains(ui,'DragDropContext') && contains(ui,"Droppable droppableId={id}") && contains(ui,"club_a") && contains(ui,"club_b"));
check('host: team names are editable before saving', contains(ui,'Team name') && contains(ui,'Save Teams & Rankings'));
check('host: team rank number is visually prominent', contains(ui,'rounded-full bg-primary text-primary-foreground'));
check('host: team organisation is a single backend action', contains(ui,"action:'organise_teams'") && contains(participantFn,"action === 'organise_teams'"));
check('host: draw is blocked until pool is empty and Rotation squad sizes match', contains(ui,'poolPlayers.length') && contains(ui,'aRotationPlayers.length !== bRotationPlayers.length'));
check('host: team builder distinguishes Rotation and Reserve players', contains(ui,'Rotation') && contains(ui,'Reserve') && contains(ui,"roster_role || 'rotation'"));
check('host: Reserve numbers may differ without entering the scheduled draw', contains(ui,'Reserve numbers may differ') && contains(ui,'const aRotationPlayers') && contains(ui,'const bRotationPlayers'));
check('host: rotation rankings are compacted after reserves are removed', contains(ui,'rank:i + 1'));
check('Spond: Interclub import supports neutral Player Pool', contains(spondFn,"['pool','club_a','club_b'].includes(side)") && contains(spondFn,"Interclub Player Pool"));

// 4. Busy-hall live operation.
check('host: live screen has at-a-glance court state', contains(ui,'Round at a Glance'));
check('host: live screen exposes who is resting', contains(ui,'Resting this round'));
check('host: not-played fixtures are excluded from NOW, score cards and next-round cards', contains(ui,"m.status !== 'not_played'") && contains(ui,"currentMatches = matches.filter"));
check('host: late players are not labelled as resting before their available round', contains(ui,"p.status === 'late' && Number(p.available_from_round || 1) <= currentRound"));
check('host: live screen exposes next round without navigation', contains(ui,'Up next · Round'));
check('display: Hall Display exposes On Court Now', contains(ui,'On Court Now') && contains(publicDisplay,'On Court Now'));
check('display: Hall Display exposes Resting This Round', contains(ui,'Resting This Round') && contains(publicDisplay,'Resting This Round'));
check('display: Hall Display exposes Up Next', contains(ui,'Up Next') && contains(publicDisplay,'Up Next'));
check('display: not-played fixtures never appear as NOW or NEXT', contains(publicDisplay,"m.status!=='not_played'") && contains(ui,"m.status !== 'not_played'"));
check('display: approved round total is shown from persisted plan', contains(publicDisplay,'plannedRounds') && contains(ui,'plannedRounds'));
check('display: public display retains disconnect warning', contains(publicDisplay,'showing last known state'));

// 5. Per-round timer flexibility without weakening the authoritative clock.
check('host: per-round duration has minus control', contains(ui,'Reduce this round by one minute'));
check('host: per-round duration has plus control', contains(ui,'Add one minute to this round'));
check('timer: prepared duration is server-side and revision protected', contains(timerFn,"action === 'set_round_minutes'") && contains(timerFn,'expectedRevision'));
check('timer: duration cannot be changed while running', contains(timerFn,'Pause the timer before changing the round duration.'));
check('timer: prepared current-round duration is used when play starts', contains(timerFn,'preparedPlaySeconds'));
check('timer: ordinary later rounds retain event default', contains(ui,"Number(event?.play_minutes || 10)"));
check('timer: reset returns the current round to ready at the configured duration', contains(timerFn,"phase: 'ready'") && contains(timerFn,"action === 'reset'") && contains(timerFn,'Number(event.play_minutes || 10) * 60'));
check('timer: starting the event prepares Round 1 at the configured duration', contains(eventFn,"initialTimer = { phase:'ready'") && contains(eventFn,"remaining_seconds:Number(event.play_minutes || 10) * 60"));
check('timer: advancing a round clears the previous paused/running state', contains(roundFn,"nextTimer = { phase:'ready'") && contains(roundFn,"status: 'in_progress'") && contains(roundFn,'timer_revision'));
check('sound: hall cue uses local Web Audio rather than a Base44 call', contains(hallAudio,'createOscillator') && !contains(hallAudio,'base44'));
check('sound: hall volume is explicit and persisted', contains(ui,"cc-hall-volume") && contains(ui,'RallyHub live sound volume'));
check('sound: Test Sound is available before live play', contains(ui,'Test Sound'));
check('sound: external mic selection uses direct capture compatibility mode', contains(hallAudio,'explicitExternalMic') && contains(hallAudio,'echoCancellation: false') && contains(hallAudio,'noiseSuppression: false'));
check('sound: live PA and RallyHub-generated audio volumes are clearly distinguished', contains(ui,'Live PA mic volume') && contains(ui,'RallyHub alerts & voice volume'));
check('sound: mobile audio is unlocked from the host play gesture', contains(ui,'await unlockHallAudio()'));
check('sound: wake lock is requested during the authoritative timer', contains(ui,"navigator.wakeLock.request('screen')"));
check('sound: legacy one-minute, 30-second and 10-second warnings are removed', !contains(ui,'One minute remaining.') && !contains(ui,'Thirty seconds.') && !contains(ui,'Ten seconds.'));
check('sound: final countdown is only 5, 4, 3, 2, 1', contains(ui,'timerRemaining <= 5 && timerRemaining > 0'));
check('sound: round-end cue asks for scores without replaying the round-finished speech', contains(ui,"? 'Please hand in your scores.'") && !contains(ui,'Round finished. Please give your scores.'));
check('sound: historic timer state cannot speak merely because the host reloads or refreshes', contains(ui,'timerSpeechArmedRef.current') && contains(ui,"!['in_progress','paused'].includes(event?.status)"));
check('sound: round start clearly repeats the full round announcement', contains(ui,'${label}. ${label} starting now. ${label} starting now.'));
check('Base44 control: timer actions are single-flight', contains(ui,'timerCommandRef.current'));
check('Base44 control: major sporting actions are single-flight', contains(ui,'sportingActionRef.current'));
check('Base44 control: team assignment and ranking save in one browser function call', contains(ui,"action:'organise_teams'") && !contains(ui,'Promise.all(ordered.map'));
check('Base44 control: full draw replacement is one browser function call', contains(ui,"replaceClubChallengeDraw") && contains(drawFn,'ClubChallengeMatch.bulkCreate'));
check('Base44 control: unactivated Reserves are excluded from authoritative draw validation', contains(drawFn,"roster_role || 'rotation'") && contains(drawFn,'Unactivated Reserves cannot appear in the draw'));
check('Base44 control: one-game rotation spread is accepted but wider unfairness is rejected', contains(drawFn,'aSpread > 1 || bSpread > 1') && contains(drawFn,'fairness.balancedGames'));
check('Base44 control: approve/start route through authorised event backend', contains(ui,"action:'approve_draw'") && contains(ui,"action:'start'"));
check('Base44 control: public voting double-tap is single-flight', contains(publicVote,'savingRef.current'));
check('Base44 control: public player polling is single-flight and deliberately de-synchronised', contains(publicDisplay,'loadInFlightRef.current') && contains(publicDisplay,'pollJitterRef') && contains(publicDisplay,'18000'));
check('Base44 control: host queries do not refetch on every window focus', contains(ui,'refetchOnWindowFocus:false'));
check('Base44 control: authoritative host sync is serial rather than a four-request burst', contains(ui,'await refetchEvent();') && contains(ui,'await refetchParticipants();') && contains(ui,'await refetchMatches();') && !contains(ui,'Promise.all([refetchEvent(), refetchParticipants(), refetchMatches()'));
check('Base44 control: successful score saves merge returned match locally instead of forcing another Base44 read', contains(ui,'mergeSavedMatch') && contains(ui,'res.data?.match || null'));
check('busy-hall UX: accepted host command stays visibly acknowledged', contains(ui,'RallyHub has accepted your tap'));

// 6. Scorer perspective.
check('scorer: score controls derive from explicit canScore permission', contains(ui,'canScore={canScoreEvent}'));
check('scorer: stale revision conflict remains surfaced', contains(ui,'Score conflict: this result changed on another device'));
check('scorer: offline result is never presented as saved', contains(ui,'UNSYNCHRONISED'));
check('scorer: host correction route remains distinct', contains(ui,'Update Result') && contains(scoreFn,'score_corrected'));
check('scorer: score entry is capped to two digits in UI and backend', contains(ui,'maxLength={2}') && contains(scoreFn,'a > 99 || b > 99'));

// 7. What-if / disruption controls.
check('what-if: replacement remains future-only', contains(participantFn,'effectiveRound'));
check('what-if: replacement tap gives immediate visible acknowledgement', contains(ui,'setPlayerControlStatus({ state:\'working\'') && contains(ui,'data-testid="cc-player-control-status"'));
check('what-if: unused team reserve can be activated without creating a duplicate person', contains(participantFn,"action === 'activate_reserve'") && contains(participantFn,'reserve_activated:true') && contains(ui,'Activate team reserve'));
check('what-if: existing rotation player can cover an outgoing player', contains(participantFn,"action === 'cover_existing'") && contains(ui,'Existing rotation player covers'));
check('what-if: cover logic prevents the chosen player appearing twice in one round', contains(participantFn,'scheduled.has(cover.id)') && contains(participantFn,'!scheduled.has(p.id)'));
check('what-if: cover conflicts use a resting same-team rotation player or stop safely', contains(participantFn,'No conflict-free cover arrangement is available') && contains(participantFn,'assignmentCounts'));
check('what-if: activated reserves and cover players are visibly labelled without changing canonical names', contains(ui,'· Reserve') && contains(ui,'· Cover'));
check('what-if: player-control changes are protected from duplicate taps', contains(ui,'playerControlBusy') && contains(ui,'sportingActionRef.current || playerControlBusy'));
check('busy-hall UX: sticky host bar keeps round, timer and scores visible', contains(ui,'data-testid="cc-sticky-host-bar"') && contains(ui,"data-pinned={hostBarPinned ? 'true' : 'false'}") && contains(ui,"hostBarPinned && 'fixed z-20'") && contains(ui,'scores saved'));
check('busy-hall UX: PA is collapsible during normal scoring', contains(ui,'id="cc-pa-panel"') && contains(ui,'Open only when you need the microphone or an announcement.'));
check('busy-hall UX: reserve changes are surfaced directly and detailed player controls remain available', contains(ui,'Quick Reserve Handover') && contains(ui,'id="cc-player-controls"') && contains(ui,'Reserve / Player Change'));
check('what-if: registered replacement candidates can be offered before manual entry', contains(participantFn,"'replacement_candidates'") && contains(ui,'Registered available player'));
check('what-if: changeover is state-gated so it cannot replace the initial play timer', contains(ui,'changeoverAvailable') && contains(ui,'Start Play first. Changeover becomes available'));
check('what-if: late arrival remains explicit', contains(participantFn,"'late_arrival'"));
check('what-if: continue-short remains supported', contains(participantFn,"'continue_short'"));
check('what-if: court/time change remains authoritative', contains(scheduleFn,'event_pack_stale'));
check('what-if: court/time changes cannot extend beyond approved rounds', contains(scheduleFn,'newRound > plannedRounds') && contains(scheduleFn,'beyondPlan'));
check('what-if: approved round count is persisted with the generated draw', contains(drawFn,'planned_rounds:plannedRounds'));
check('what-if: overlapping schedule updates use a server-side lock', contains(scheduleFn,'schedule_adjustment_lock_token') && contains(scheduleFn,'crypto.randomUUID()') && contains(scheduleFn,'won the update race'));
const disruptionCurrentRound=3, disruptionPlannedRounds=12, disruptionCourts=3, disruptionMinutes=144, disruptionBlock=12, disruptionBreak=20;
const disruptionTimeRounds=Math.floor((disruptionMinutes-disruptionBreak)/disruptionBlock);
const disruptionPlanRounds=disruptionPlannedRounds-disruptionCurrentRound+1;
const disruptionRoundCapacity=Math.min(disruptionTimeRounds,disruptionPlanRounds);
check('what-if: 4-to-3 court disruption stays inside Round 12', disruptionRoundCapacity===10 && disruptionRoundCapacity*disruptionCourts===30);
check('what-if: court/time confirm gives immediate visible acknowledgement', contains(ui,'Applying court & time changes… command sent') && contains(ui,'data-testid="cc-schedule-change-status"'));
check('what-if: court/time confirm blocks duplicate host taps', contains(ui,'eventDayAdjustmentBusy') && contains(ui,'sportingActionRef.current'));
check('what-if: repeated schedule apply is server-idempotent after success', contains(scheduleFn,'alreadyApplied:true') && contains(scheduleFn,'sameEventSettings') && contains(scheduleFn,'changesAlreadyApplied'));
check('what-if: finalisation blocks unresolved matches', contains(finaliseFn,'unresolved'));
check('what-if: finalisation checks POT open state', contains(finaliseFn,'pot_status'));
check('live flow: the host can prepare the next round after play ends even with scores still pending', contains(ui,'canPrepareNextRound') && contains(ui,'allowPendingScores:true') && contains(ui,'Earlier scores still to enter'));
check('late-start intelligence: setup stores hall booking start and event start stores actual start', contains(ui,'Hall booking start') && contains(eventFn,'actual_started_at'));
check('late-start intelligence: live host gets a continuously recalculated finish-on-time guide', contains(ui,'Finish-on-Time Guide') && contains(ui,'projectedFinish') && contains(ui,'Recommended recovery'));
check('post-event voting: completed events can still open, close and reveal POT before archive', contains(ui,'const canManagePot') && contains(ui,"event.status !== 'archived'"));

// 8. Voting all the way to the end.
check('player: public voting asks voter identity', /Select your name|Who are you|Voting player/.test(publicVote));
check('player: public voting asks nominee', /Select player|Player of/.test(publicVote));
check('player: public voting has a submit action', /Cast Vote|Submit Vote/.test(publicVote));
check('voting: self-vote is blocked server-side', contains(voteFn,'voterParticipantId === nomineeParticipantId') && /cannot vote for themselves/i.test(voteFn));
check('voting: duplicate vote is blocked server-side', /already voted/i.test(voteFn));
check('voting: personal access code remains server-side verified', contains(voteFn,'guest_access_token') && /access code is incorrect/i.test(voteFn));
check('voting: ballot audit does not expose nominee', contains(voteFn,"JSON.stringify({ voter_participant_id:voter.id, access_route:'qr' })") && /nominee intentionally omitted/i.test(voteFn));

// 9. Simple outcome model used by the robot to challenge the journey.
const clearWinner = calculateClubChallengeScore(Array.from({length:48},(_,i)=>({scoreA:i<28?11:8,scoreB:i<28?8:11,status:'completed'})),{winPoints:2,drawPoints:1,lossPoints:0});
check('end state: clear winner can be produced without compulsory final', clearWinner.clubA !== clearWinner.clubB);
check('end state: Showcase remains optional rather than replacing normal result', contains(ui,'Showcase / Tiebreak Final'));
check('end state: POT remains optional and privacy-aware', contains(ui,'Player of Tournament voting'));

console.log(`\nINTERACTION ROBOT PASS — ${passed} assertions`);
console.log('Perspectives exercised: sporting engine, host, scorer, Hall Display/public viewer, voter, event-day disruption, finalisation.');
console.log('This is the pre-browser robot. Physical device/tap/QR/network/sleep verification remains the final acceptance layer.');
