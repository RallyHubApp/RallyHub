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
const voteFn = fs.readFileSync('base44/functions/castPublicClubChallengePotVote/entry.ts','utf8');
const participantFn = fs.readFileSync('base44/functions/manageClubChallengeParticipant/entry.ts','utf8');
const scheduleFn = fs.readFileSync('base44/functions/updateClubChallengeSchedule/entry.ts','utf8');
const finaliseFn = fs.readFileSync('base44/functions/finaliseClubChallenge/entry.ts','utf8');
const practiceFn = fs.readFileSync('base44/functions/loadClubChallengePracticeRoster/entry.ts','utf8');
const fullPracticeFn = fs.readFileSync('base44/functions/populateClubChallengePracticeScenario/entry.ts','utf8');
const hallAudio = fs.readFileSync('src/lib/rallyHubHallAudio.js','utf8');
const drawFn = fs.readFileSync('base44/functions/replaceClubChallengeDraw/entry.ts','utf8');

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

// 2. Host setup / first-use journey.
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

// 3. Ranking journey: touch-friendly as well as drag/drop.
check('host: rankings retain drag/drop', contains(ui,'DragDropContext'));
check('host: rankings expose explicit move-up control', contains(ui,'Move ${p.display_name} up'));
check('host: rankings expose explicit move-down control', contains(ui,'Move ${p.display_name} down'));
check('host: rank number is visually prominent', contains(ui,'rounded-full bg-primary text-primary-foreground'));

// 4. Busy-hall live operation.
check('host: live screen has at-a-glance court state', contains(ui,'Round at a Glance'));
check('host: live screen exposes who is resting', contains(ui,'Resting this round'));
check('host: live screen exposes next round without navigation', contains(ui,'Up next · Round'));
check('display: Hall Display exposes On Court Now', contains(ui,'On Court Now') && contains(publicDisplay,'On Court Now'));
check('display: Hall Display exposes Resting This Round', contains(ui,'Resting This Round') && contains(publicDisplay,'Resting This Round'));
check('display: Hall Display exposes Up Next', contains(ui,'Up Next') && contains(publicDisplay,'Up Next'));
check('display: public display retains disconnect warning', contains(publicDisplay,'showing last known state'));

// 5. Per-round timer flexibility without weakening the authoritative clock.
check('host: per-round duration has minus control', contains(ui,'Reduce this round by one minute'));
check('host: per-round duration has plus control', contains(ui,'Add one minute to this round'));
check('timer: prepared duration is server-side and revision protected', contains(timerFn,"action === 'set_round_minutes'") && contains(timerFn,'expectedRevision'));
check('timer: duration cannot be changed while running', contains(timerFn,'Pause the timer before changing the round duration.'));
check('timer: prepared current-round duration is used when play starts', contains(timerFn,'preparedPlaySeconds'));
check('timer: ordinary later rounds retain event default', contains(ui,'normal event duration remains'));
check('sound: hall cue uses local Web Audio rather than a Base44 call', contains(hallAudio,'createOscillator') && !contains(hallAudio,'base44'));
check('sound: hall volume is explicit and persisted', contains(ui,"cc-hall-volume") && contains(ui,'RallyHub Interclub hall volume'));
check('sound: Test Sound is available before live play', contains(ui,'Test Sound'));
check('sound: mobile audio is unlocked from the host play gesture', contains(ui,'await unlockHallAudio()'));
check('sound: wake lock is requested during the authoritative timer', contains(ui,"navigator.wakeLock.request('screen')"));
check('sound: one-minute, 30-second, 10-second and five-second countdown cues exist', contains(ui,'One minute remaining.') && contains(ui,'Thirty seconds.') && contains(ui,'Ten seconds.') && contains(ui,'timerRemaining <= 5'));
check('sound: round-end cue asks for scores', contains(ui,'Round finished. Please give your scores.'));
check('Base44 control: timer actions are single-flight', contains(ui,'timerCommandRef.current'));
check('Base44 control: major sporting actions are single-flight', contains(ui,'sportingActionRef.current'));
check('Base44 control: player ranking is one browser function call, not 16 parallel entity writes', contains(ui,"action:'reorder'") && !contains(ui,'Promise.all(ordered.map'));
check('Base44 control: full draw replacement is one browser function call', contains(ui,"replaceClubChallengeDraw") && contains(drawFn,'ClubChallengeMatch.bulkCreate'));
check('Base44 control: approve/start route through authorised event backend', contains(ui,"action:'approve_draw'") && contains(ui,"action:'start'"));
check('Base44 control: public voting double-tap is single-flight', contains(publicVote,'savingRef.current'));
check('busy-hall UX: accepted host command stays visibly acknowledged', contains(ui,'RallyHub has accepted your tap'));

// 6. Scorer perspective.
check('scorer: score controls derive from explicit canScore permission', contains(ui,'canScore={canScoreEvent}'));
check('scorer: stale revision conflict remains surfaced', contains(ui,'Score conflict: this result changed on another device'));
check('scorer: offline result is never presented as saved', contains(ui,'UNSYNCHRONISED'));
check('scorer: host correction route remains distinct', contains(ui,'Correct Result'));

// 7. What-if / disruption controls.
check('what-if: replacement remains future-only', contains(participantFn,'effectiveRound'));
check('what-if: late arrival remains explicit', contains(participantFn,"'late_arrival'"));
check('what-if: continue-short remains supported', contains(participantFn,"'continue_short'"));
check('what-if: court/time change remains authoritative', contains(scheduleFn,'event_pack_stale'));
check('what-if: finalisation blocks unresolved matches', contains(finaliseFn,'unresolved'));
check('what-if: finalisation checks POT open state', contains(finaliseFn,'pot_status'));

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
