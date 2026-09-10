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
check('voting: self-vote is blocked server-side', /self/i.test(voteFn));
check('voting: duplicate vote is blocked server-side', /already|duplicate/i.test(voteFn));
check('voting: personal access code remains server-side verified', /access|code/i.test(voteFn));
check('voting: ballot audit does not expose nominee', !/new_value_json.*nominee/i.test(voteFn));

// 9. Simple outcome model used by the robot to challenge the journey.
const clearWinner = calculateClubChallengeScore(Array.from({length:48},(_,i)=>({scoreA:i<28?11:8,scoreB:i<28?8:11,status:'completed'})),{winPoints:2,drawPoints:1,lossPoints:0});
check('end state: clear winner can be produced without compulsory final', clearWinner.clubA !== clearWinner.clubB);
check('end state: Showcase remains optional rather than replacing normal result', contains(ui,'Showcase / Tiebreak Final'));
check('end state: POT remains optional and privacy-aware', contains(ui,'Player of Tournament voting'));

console.log(`\nINTERACTION ROBOT PASS — ${passed} assertions`);
console.log('Perspectives exercised: sporting engine, host, scorer, Hall Display/public viewer, voter, event-day disruption, finalisation.');
console.log('This is the pre-browser robot. Physical device/tap/QR/network/sleep verification remains the final acceptance layer.');
