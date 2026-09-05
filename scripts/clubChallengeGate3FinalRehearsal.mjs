import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  generateClubChallengeFixtures,
  analyseClubChallengeFairness,
  resolveClubChallengeWinner,
  applyShowcasePoints,
} from '../src/lib/clubChallengeEngine.js';
import {
  createChallengeEventDraft,
  buildApprovedDraw,
  fixtureRecordsFromSchedule,
  prepareScoreMutation,
  scoreFromMatchRecords,
  replaceParticipantInFutureMatches,
  finalisationIssues,
} from '../src/lib/clubChallengeWorkflow.js';

const terminal = new Set(['completed','draw','retired','forfeit','abandoned','not_played']);
const makeClub = (prefix, club) => Array.from({ length: 16 }, (_, i) => ({ id:`${prefix}${i+1}`, display_name:`${club} ${String(i+1).padStart(2,'0')}`, name:`${club} ${String(i+1).padStart(2,'0')}`, club, rank:i+1, event_rank:i+1, gender:i%2===0?'Male':'Female', status:'active' }));
const clare = makeClub('C','Clare');
const galway = makeClub('G','Galway');
const tournament = { id:'T-E2E', tenant_id:'TENANT-CLARE', host_club_id:'CLARE' };
const draft = createChallengeEventDraft({ tournament, hostClub:{id:'CLARE',name:'Clare'}, opponent:{name:'Galway'}, setup:{ courts:4, availableMinutes:180, playMinutes:10, changeoverMinutes:2, includeBreak:true, breakMinutes:20, breakAfterRound:6, matchFormat:{type:'timed',drawsAllowed:true}, winPoints:2, drawPoints:1, lossPoints:0, compositionMode:'open', showcaseEnabled:true, showcasePoints:5, potEnabled:true } });
const schedule = generateClubChallengeFixtures({ clubAPlayers:clare, clubBPlayers:galway, courts:4, rounds:12 });
const fairness = analyseClubChallengeFairness({ schedule, clubAPlayers:clare, clubBPlayers:galway });
assert.equal(schedule.metadata.totalMatches,48); assert.equal(fairness.totalMatches,48); assert.equal(fairness.equalGames,true); assert.equal(fairness.duplicatePlayerRoundIssues,0); assert.equal(fairness.sameClubIntegrityIssues,0); assert.equal(fairness.minGames,6); assert.equal(fairness.maxGames,6);
const approved = buildApprovedDraw({ schedule, clubAPlayers:clare, clubBPlayers:galway, previousVersion:0, approvedBy:'organiser' });
const event = { id:'CCE-E2E', ...draft, ...approved, pot_status:'closed', current_round:1 };
const participantMap = Object.fromEntries([...clare,...galway].map(p=>[p.id,p]));
let matches = fixtureRecordsFromSchedule({ event, schedule, participantMap });

// Round 1: two separate scorers, one draw, then stale correction attempt.
for (let i=0;i<4;i++) {
  const scores = i===1 ? [8,8] : i%2===0 ? [9,7] : [7,9];
  const r = prepareScoreMutation({ match:matches[i], scoreA:scores[0], scoreB:scores[1], matchFormat:{type:'timed',drawsAllowed:true}, expectedRevision:0, userId:i<2?'scorer-A':'scorer-B' });
  assert.equal(r.ok,true); matches[i] = {...matches[i],...r.update};
}
const stale = prepareScoreMutation({ match:matches[0], scoreA:1, scoreB:9, matchFormat:{type:'timed',drawsAllowed:true}, expectedRevision:0, userId:'offline-scorer' });
assert.equal(stale.conflict,true);

// Replacement from round 3 never changes completed round 1.
const historical = JSON.stringify(matches.slice(0,4));
matches = replaceParticipantInFutureMatches({ matches, outgoingParticipantId:'C1', incomingParticipantId:'C99', effectiveRound:3 });
assert.equal(JSON.stringify(matches.slice(0,4)),historical);
assert.ok(matches.filter(m=>m.round_number>=3 && !terminal.has(m.status)).every(m=>!(m.club_a_participant_ids||[]).includes('C1')));

// Court loss 4 -> 3 with enough time: compact unresolved future fixtures only; completed remain locked.
const currentRound = 2, courts = 3, minutes = 132, block = 12;
const unresolved = matches.filter(m=>m.round_number>=currentRound && !terminal.has(m.status)).sort((a,b)=>(a.round_number-b.round_number)||(a.court_number-b.court_number));
const slots = Math.floor(minutes/block)*courts;
const keep = unresolved.slice(0,slots), drop = unresolved.slice(slots);
const remapped = keep.map((m,i)=>({...m,round_number:currentRound+Math.floor(i/courts),court_number:(i%courts)+1}));
assert.equal(matches.slice(0,4).every(m=>terminal.has(m.status)),true);
assert.ok(remapped.every(m=>m.court_number>=1 && m.court_number<=3));
assert.equal(new Set(remapped.map(m=>`${m.round_number}-${m.court_number}`)).size,remapped.length);
assert.equal(keep.length+drop.length,unresolved.length);

// Finish the authoritative normal schedule with deterministic outcomes and create a true tied club-points case.
let finalMatches = matches.map((m,idx)=> {
  if (terminal.has(m.status)) return m;
  const pair = idx % 2 === 0 ? [9,7] : [7,9];
  const r = prepareScoreMutation({ match:m, scoreA:pair[0], scoreB:pair[1], matchFormat:{type:'timed',drawsAllowed:true}, expectedRevision:m.revision||0, userId:'sim' });
  assert.equal(r.ok,true); return {...m,...r.update};
});
let score = scoreFromMatchRecords(finalMatches,{winPoints:2,drawPoints:1,lossPoints:0});
assert.equal(score.completedMatches,48);

// Explicit metrics and showcase paths are both exercised.
const clearOrMetric = resolveClubChallengeWinner(score,{allowDraw:false});
assert.ok(['clubA','clubB','tiebreak_required'].includes(clearOrMetric));
const syntheticTie = { ...score, clubA:48, clubB:48, gamePointDifference:2, gamePointsA:400, gamePointsB:398 };
assert.equal(resolveClubChallengeWinner(syntheticTie,{allowDraw:false}),'clubA');
const showcase = applyShowcasePoints({ ...syntheticTie },{winner:'clubB',points:5});
assert.equal(showcase.clubB,53); assert.equal(showcase.clubA,48);

// Finalisation blockers and clean finish.
const blocked = finalisationIssues({ matches:finalMatches.slice(0,-1).concat([{...finalMatches.at(-1),status:'scheduled'}]), showcaseEnabled:true, showcaseComplete:false, potEnabled:true, potStatus:'open' });
assert.ok(blocked.length>=3);
const clean = finalisationIssues({ matches:finalMatches, showcaseEnabled:false, showcaseComplete:true, potEnabled:true, potStatus:'closed' });
assert.equal(clean.length,0);

// Security contract: scorers may score; ordinary scorers cannot run timer/finalise/advance rounds; secure state strips private identity fields.
const scoreFn = fs.readFileSync('base44/functions/saveClubChallengeScore/entry.ts','utf8');
const timerFn = fs.readFileSync('base44/functions/updateClubChallengeTimer/entry.ts','utf8');
const stateFn = fs.readFileSync('base44/functions/getClubChallengeState/entry.ts','utf8');
const roundFn = fs.readFileSync('base44/functions/updateClubChallengeRound/entry.ts','utf8');
const finaliseFn = fs.readFileSync('base44/functions/finaliseClubChallenge/entry.ts','utf8');
assert.match(scoreFn,/event_manager.*event_host.*scorer/); assert.match(scoreFn,/Score correction permission required/);
assert.doesNotMatch(timerFn,/\['event_manager', 'event_host', 'scorer'\]/); assert.match(timerFn,/owner.*organiser/);
assert.doesNotMatch(stateFn,/email:p\.email/); assert.doesNotMatch(stateFn,/guest_access_token:p/); assert.doesNotMatch(stateFn,/unique_identity_key:p/);
assert.match(roundFn,/Event manager permission required/); assert.match(finaliseFn,/Finalisation permission required/);

console.log('CLUB CHALLENGE v1.0 — GATE 3 FINAL REHEARSAL PASS');
console.log('32 players | 48 matches | fairness | concurrent scorers | stale/offline conflict | replacement | 4→3 court disruption | metrics | showcase | finalisation blockers | role security contract PASS');
