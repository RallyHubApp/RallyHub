import assert from 'node:assert/strict';
import {
  calculateClubChallengeFormat,
  generateClubChallengeFixtures,
  analyseClubChallengeFairness,
  calculateClubChallengeScore,
  validateClubChallengeScore,
  applyShowcasePoints,
  resolveClubChallengeWinner,
  checkResultRevision,
  validateClubChallengeSetup,
} from '../src/lib/clubChallengeEngine.js';

function makeClub(prefix, club, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    name: `${club} ${i + 1}`,
    club,
    rank: i + 1,
    gender: i % 2 === 0 ? 'Male' : 'Female',
  }));
}

function assertScheduleIntegrity({ count, courts, rounds, expectedMin, expectedMax, label }) {
  const a = makeClub(`${label}A`, `${label} A`, count);
  const b = makeClub(`${label}B`, `${label} B`, count);
  const schedule = generateClubChallengeFixtures({ clubAPlayers: a, clubBPlayers: b, courts, rounds });
  const fairness = analyseClubChallengeFairness({ schedule, clubAPlayers: a, clubBPlayers: b });
  assert.equal(schedule.rounds.length, rounds, `${label}: rounds`);
  assert.equal(fairness.totalMatches, courts * rounds, `${label}: match count`);
  assert.equal(fairness.duplicatePlayerRoundIssues, 0, `${label}: duplicate player in round`);
  assert.equal(fairness.sameClubIntegrityIssues, 0, `${label}: malformed inter-club court`);
  assert.equal(fairness.minGames, expectedMin, `${label}: min games`);
  assert.equal(fairness.maxGames, expectedMax, `${label}: max games`);
  for (const round of schedule.rounds) {
    assert.equal(round.courts.length, courts, `${label}: court count`);
    const seen = new Set();
    for (const court of round.courts) {
      assert.equal(court.clubA.length, 2);
      assert.equal(court.clubB.length, 2);
      for (const id of [...court.clubA, ...court.clubB]) {
        assert.equal(seen.has(id), false, `${label}: duplicate ${id} in round ${round.roundNumber}`);
        seen.add(id);
      }
    }
  }
  return fairness;
}

// CC-SET / CC-TIME canonical setup
const clare = makeClub('C', 'Clare', 16);
const galway = makeClub('G', 'Galway', 16);
const setup = validateClubChallengeSetup({ clubAPlayers: clare, clubBPlayers: galway, courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2, includeBreak: true, breakMinutes: 20 });
assert.equal(setup.valid, true, setup.errors.join('; '));

const canonical = calculateClubChallengeFormat({ clubAPlayerCount: 16, clubBPlayerCount: 16, courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2, includeBreak: true, breakMinutes: 20, breakAfterRound: 6 });
assert.equal(canonical.recommendedRounds, 12);
assert.equal(canonical.totalMatches, 48);
assert.equal(canonical.averageGamesClubA, 6);
assert.equal(canonical.averageGamesClubB, 6);
assert.deepEqual(canonical.gamesRangeClubA, [6, 6]);
assert.equal(canonical.structuredMinutes, 164);
assert.equal(canonical.remainingMinutes, 16);
assert.equal(canonical.break.afterRound, 6);

// Variable timer: 8-minute play + 2-minute changeover is not hard-coded.
const variableTimer = calculateClubChallengeFormat({ clubAPlayerCount: 16, clubBPlayerCount: 16, courts: 4, availableMinutes: 180, playMinutes: 8, changeoverMinutes: 2, includeBreak: true, breakMinutes: 20, breakAfterRound: 6 });
assert.equal(variableTimer.playMinutes, 8);
assert.equal(variableTimer.changeoverMinutes, 2);
assert.equal(variableTimer.roundBlockMinutes, 10);
assert.equal(variableTimer.recommendedRounds, 16);
assert.equal(variableTimer.averageGamesClubA, 8);
assert.equal(variableTimer.structuredMinutes, 180);

// Canonical fixture acceptance.
const canonicalFairness = assertScheduleIntegrity({ count: 16, courts: 4, rounds: 12, expectedMin: 6, expectedMax: 6, label: 'CANON' });
assert.equal(canonicalFairness.equalGames, true);
assert.equal(canonicalFairness.repeatedPartnerPairs, 0);
assert.ok(canonicalFairness.maxOpponentRepeat <= 4, `Canonical max opponent repeat too high: ${canonicalFairness.maxOpponentRepeat}`);
assert.equal(canonicalFairness.consecutiveRestOccurrences, 0);
const canonicalMaxSameCourt = Math.max(...Object.values(canonicalFairness.courtCounts).flatMap(counts => Object.values(counts)));
assert.ok(canonicalMaxSameCourt <= 3, `Canonical court rotation too concentrated: ${canonicalMaxSameCourt} games on one court`);

// Generalised v1.0 scheduler: not hard-coded to 16+16/4 courts.
const f12 = assertScheduleIntegrity({ count: 12, courts: 3, rounds: 12, expectedMin: 6, expectedMax: 6, label: 'T12' });
const f20_4 = assertScheduleIntegrity({ count: 20, courts: 4, rounds: 10, expectedMin: 4, expectedMax: 4, label: 'T20C4' });
const f20_5 = assertScheduleIntegrity({ count: 20, courts: 5, rounds: 12, expectedMin: 6, expectedMax: 6, label: 'T20C5' });
const f24_4 = assertScheduleIntegrity({ count: 24, courts: 4, rounds: 12, expectedMin: 4, expectedMax: 4, label: 'T24C4' });
const f24_6 = assertScheduleIntegrity({ count: 24, courts: 6, rounds: 12, expectedMin: 6, expectedMax: 6, label: 'T24C6' });
const f13 = assertScheduleIntegrity({ count: 13, courts: 3, rounds: 13, expectedMin: 6, expectedMax: 6, label: 'T13ODD' });
// 12+12/3 courts has half the roster resting each round. Because consecutive rests
// outrank partner repetition in the frozen fairness hierarchy, the theoretical
// zero-consecutive-rest pattern necessarily limits each player to five possible
// partners across six games; one repeat per player is therefore accepted here.
assert.ok(f12.repeatedPartnerPairs <= 12);
for (const f of [f20_4, f20_5, f24_4, f24_6, f13]) assert.equal(f.repeatedPartnerPairs, 0);

// Unequal roster handling is explicit at setup and draw generation.
const unequalSetup = validateClubChallengeSetup({ clubAPlayers: makeClub('UA', 'A', 16), clubBPlayers: makeClub('UB', 'B', 15), courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2 });
assert.equal(unequalSetup.valid, true);
assert.ok(unequalSetup.warnings.some(w => w.includes('unequal')));
assert.throws(() => generateClubChallengeFixtures({ clubAPlayers: makeClub('UA2', 'A', 16), clubBPlayers: makeClub('UB2', 'B', 14), courts: 4, rounds: 10 }), /equal club rosters/);

// Scoring format validation.
assert.equal(validateClubChallengeScore({ scoreA: 9, scoreB: 7, matchFormat: { type: 'timed', drawsAllowed: true } }).outcome, 'clubA');
assert.equal(validateClubChallengeScore({ scoreA: 8, scoreB: 8, matchFormat: { type: 'timed', drawsAllowed: true } }).outcome, 'draw');
assert.equal(validateClubChallengeScore({ scoreA: 8, scoreB: 8, matchFormat: { type: 'timed', drawsAllowed: false } }).valid, false);
assert.equal(validateClubChallengeScore({ scoreA: 11, scoreB: 10, matchFormat: { type: 'points', target: 11, winBy: 1 } }).valid, true);
assert.equal(validateClubChallengeScore({ scoreA: 11, scoreB: 10, matchFormat: { type: 'points', target: 11, winBy: 2 } }).valid, false);
assert.equal(validateClubChallengeScore({ scoreA: 12, scoreB: 10, matchFormat: { type: 'points', target: 11, winBy: 2 } }).valid, true);
assert.equal(validateClubChallengeScore({ scoreA: 15, scoreB: 14, matchFormat: { type: 'points', target: 15, winBy: 1 } }).valid, true);
assert.equal(validateClubChallengeScore({ scoreA: 15, scoreB: 14, matchFormat: { type: 'points', target: 15, winBy: 2 } }).valid, false);
assert.equal(validateClubChallengeScore({ scoreA: 16, scoreB: 14, matchFormat: { type: 'points', target: 15, winBy: 2 } }).valid, true);

// Club scoring, draws and missing results.
const score = calculateClubChallengeScore([
  { scoreA: 9, scoreB: 7 },
  { scoreA: 8, scoreB: 8 },
  { scoreA: 5, scoreB: 10 },
  { status: 'missing' },
]);
assert.equal(score.clubA, 3);
assert.equal(score.clubB, 3);
assert.equal(score.completedMatches, 3);
assert.equal(score.draws, 1);
assert.equal(score.gamePointsA, 22);
assert.equal(score.gamePointsB, 25);

// Showcase can overturn the normal result.
const beforeShowcase = { clubA: 50, clubB: 53, matchesWonA: 20, matchesWonB: 22, gamePointDifference: -5 };
const afterShowcase = applyShowcasePoints(beforeShowcase, { winner: 'clubA', points: 5 });
assert.equal(afterShowcase.clubA, 55);
assert.equal(afterShowcase.clubB, 53);
assert.equal(afterShowcase.leader, 'clubA');

// Final winner/tie hierarchy. With 2/1/0 scoring, equal Club Challenge points generally also
// means equal match wins, so cumulative game-point differential is the meaningful first metric.
assert.equal(resolveClubChallengeWinner({ clubA: 40, clubB: 40, matchesWonA: 19, matchesWonB: 19, gamePointDifference: 12, gamePointsA: 410, gamePointsB: 398 }, { allowDraw: false }), 'clubA');
assert.equal(resolveClubChallengeWinner({ clubA: 40, clubB: 40, matchesWonA: 19, matchesWonB: 19, gamePointDifference: -2, gamePointsA: 396, gamePointsB: 398 }, { allowDraw: false }), 'clubB');
assert.equal(resolveClubChallengeWinner({ clubA: 40, clubB: 40, matchesWonA: 19, matchesWonB: 19, gamePointDifference: 0, gamePointsA: 400, gamePointsB: 400 }, { allowDraw: false }), 'tiebreak_required');
assert.equal(resolveClubChallengeWinner({ clubA: 40, clubB: 40, matchesWonA: 20, matchesWonB: 18, gamePointDifference: 0, gamePointsA: 400, gamePointsB: 400 }, { allowDraw: false, tiebreakOrder: ['matchesWon'] }), 'clubA');

// Optimistic concurrency helper: same revision succeeds, stale revision conflicts.
assert.deepEqual(checkResultRevision({ expectedRevision: 3, currentRevision: 3 }), { canWrite: true, conflict: false, nextRevision: 4 });
assert.deepEqual(checkResultRevision({ expectedRevision: 2, currentRevision: 3 }), { canWrite: false, conflict: true, nextRevision: 4 });

console.log('\nCLUB CHALLENGE v1.0 — GATE 1 ENGINE TESTS PASS');
console.log('------------------------------------------------');
console.log(`Canonical: 16+16 | 4 courts | 12 rounds | 48 matches | games ${canonicalFairness.minGames}-${canonicalFairness.maxGames}`);
console.log(`Canonical fairness: partner repeats ${canonicalFairness.repeatedPartnerPairs}; opponent pairs repeated ${canonicalFairness.repeatedOpponentPairs}; max opponent repeat ${canonicalFairness.maxOpponentRepeat}; consecutive rests ${canonicalFairness.consecutiveRestOccurrences}; avg strength gap ${canonicalFairness.averageStrengthGap.toFixed(2)}`);
console.log('Generalised fixtures: 12+12/3c, 13+13/3c, 20+20/4c, 20+20/5c, 24+24/4c, 24+24/6c PASS');
console.log('Variable timing, timed draws, 11/15 win-by-1/2 validation, showcase scoring, tiebreak and revision-conflict helpers PASS');
