import assert from 'node:assert/strict';
import {
  calculateClubChallengeFormat,
  generateClubChallengeFixtures,
  analyseClubChallengeFairness,
  calculateClubChallengeScore,
  validateClubChallengeSetup,
} from '../src/lib/clubChallengeEngine.js';

const makeClub = (prefix, club) => Array.from({ length: 16 }, (_, i) => ({
  id: `${prefix}${i + 1}`,
  name: `${club} ${i + 1}`,
  club,
  rank: i + 1,
  gender: i % 2 === 0 ? 'Male' : 'Female',
}));

const clare = makeClub('C', 'Clare');
const galway = makeClub('G', 'Galway');

const setup = validateClubChallengeSetup({
  clubAPlayers: clare,
  clubBPlayers: galway,
  courts: 4,
  availableMinutes: 180,
  playMinutes: 10,
  changeoverMinutes: 2,
  includeBreak: true,
  breakMinutes: 20,
});
assert.equal(setup.valid, true, setup.errors.join('; '));

const format = calculateClubChallengeFormat({
  clubAPlayerCount: 16,
  clubBPlayerCount: 16,
  courts: 4,
  availableMinutes: 180,
  playMinutes: 10,
  changeoverMinutes: 2,
  includeBreak: true,
  breakMinutes: 20,
  breakAfterRound: 6,
});
assert.equal(format.recommendedRounds, 12);
assert.equal(format.totalMatches, 48);
assert.equal(format.averageGamesClubA, 6);
assert.equal(format.averageGamesClubB, 6);
assert.equal(format.break.afterRound, 6);
assert.equal(format.break.minutes, 20);
assert.equal(format.structuredMinutes, 164);
assert.equal(format.remainingMinutes, 16);

const schedule = generateClubChallengeFixtures({
  clubAPlayers: clare,
  clubBPlayers: galway,
  courts: 4,
  rounds: 12,
});
assert.equal(schedule.rounds.length, 12);
assert.equal(schedule.metadata.totalMatches, 48);

for (const round of schedule.rounds) {
  assert.equal(round.courts.length, 4);
  const seen = new Set();
  for (const court of round.courts) {
    assert.equal(court.clubA.length, 2);
    assert.equal(court.clubB.length, 2);
    assert.ok(court.clubA.every(id => id.startsWith('C')));
    assert.ok(court.clubB.every(id => id.startsWith('G')));
    for (const id of [...court.clubA, ...court.clubB]) {
      assert.equal(seen.has(id), false, `Duplicate player ${id} in round ${round.roundNumber}`);
      seen.add(id);
    }
  }
  assert.equal(seen.size, 16);
  assert.equal(round.benchClubA.length, 8);
  assert.equal(round.benchClubB.length, 8);
}

const fairness = analyseClubChallengeFairness({ schedule, clubAPlayers: clare, clubBPlayers: galway });
assert.equal(fairness.totalMatches, 48);
assert.equal(fairness.equalGames, true);
assert.equal(fairness.minGames, 6);
assert.equal(fairness.maxGames, 6);
assert.equal(fairness.duplicatePlayerRoundIssues, 0);
assert.equal(fairness.repeatedPartnerPairs, 0);

// Simulate all 48 results, deliberately including draws.
const results = [];
for (const round of schedule.rounds) {
  for (const court of round.courts) {
    const selector = (round.roundNumber + court.courtNumber) % 5;
    if (selector === 0) results.push({ scoreA: 10, scoreB: 10 });
    else if (selector % 2 === 0) results.push({ scoreA: 11, scoreB: 8 });
    else results.push({ scoreA: 7, scoreB: 11 });
  }
}
const score = calculateClubChallengeScore(results);
assert.equal(score.completedMatches, 48);
assert.equal(score.clubA + score.clubB, 96); // every match contributes 2 total challenge points, including 1+1 draws
assert.equal(score.matchesWonA + score.matchesWonB + score.draws, 48);

console.log('\nCLUB CHALLENGE PHASE 1 SIMULATION — PASS');
console.log('----------------------------------------');
console.log(`Format: 16 Clare + 16 Galway | 4 courts | ${format.recommendedRounds} rounds | ${format.totalMatches} matches`);
console.log(`Games/player: ${fairness.minGames}-${fairness.maxGames}`);
console.log(`Repeated partner pairs: ${fairness.repeatedPartnerPairs}`);
console.log(`Repeated opponent pairs: ${fairness.repeatedOpponentPairs} (max repeat ${fairness.maxOpponentRepeat})`);
console.log(`Consecutive rest occurrences: ${fairness.consecutiveRestOccurrences}`);
console.log(`Strength gap: avg ${fairness.averageStrengthGap.toFixed(2)}, max ${fairness.maxStrengthGap}`);
console.log(`Timeline: ${format.structuredMinutes} min structured + ${format.remainingMinutes} min spare; break after R${format.break.afterRound} for ${format.break.minutes} min`);
console.log(`Simulated final club score: Clare ${score.clubA} - ${score.clubB} Galway | draws ${score.draws}`);
