import { generateClubChallengeFixtures, analyseClubChallengeFairness } from '../src/lib/clubChallengeEngine.js';

const makeClub = (prefix, club) => Array.from({ length: 16 }, (_, i) => ({
  id: `${prefix}${i + 1}`,
  name: `${club} #${i + 1}`,
  club,
  rank: i + 1,
  gender: i % 2 === 0 ? 'Male' : 'Female',
}));

const clare = makeClub('C', 'Clare');
const galway = makeClub('G', 'Galway');
const allPlayers = [...clare, ...galway];
const byId = Object.fromEntries(allPlayers.map(p => [p.id, p]));
const schedule = generateClubChallengeFixtures({ clubAPlayers: clare, clubBPlayers: galway, courts: 4, rounds: 12 });
const fairness = analyseClubChallengeFairness({ schedule, clubAPlayers: clare, clubBPlayers: galway });

const details = {};
for (const p of allPlayers) details[p.id] = { games: 0, rests: [], partners: {}, opponents: {}, courts: {} };

for (const round of schedule.rounds) {
  const active = new Set();
  for (const court of round.courts) {
    const [a1, a2] = court.clubA;
    const [b1, b2] = court.clubB;
    for (const id of [a1, a2, b1, b2]) {
      active.add(id);
      details[id].games++;
      details[id].courts[court.courtNumber] = (details[id].courts[court.courtNumber] || 0) + 1;
    }
    details[a1].partners[a2] = (details[a1].partners[a2] || 0) + 1;
    details[a2].partners[a1] = (details[a2].partners[a1] || 0) + 1;
    details[b1].partners[b2] = (details[b1].partners[b2] || 0) + 1;
    details[b2].partners[b1] = (details[b2].partners[b1] || 0) + 1;
    for (const a of [a1, a2]) for (const b of [b1, b2]) {
      details[a].opponents[b] = (details[a].opponents[b] || 0) + 1;
      details[b].opponents[a] = (details[b].opponents[a] || 0) + 1;
    }
  }
  for (const p of allPlayers) if (!active.has(p.id)) details[p.id].rests.push(round.roundNumber);
}

console.log('=== FIXTURES ===');
for (const round of schedule.rounds) {
  console.log(`ROUND ${round.roundNumber}`);
  for (const court of round.courts) {
    const A = court.clubA.map(id => `C${byId[id].rank}`).join('+');
    const B = court.clubB.map(id => `G${byId[id].rank}`).join('+');
    console.log(`Court ${court.courtNumber}: ${A} vs ${B} | strengths ${court.clubAStrength}-${court.clubBStrength}`);
  }
  console.log(`Rest Clare: ${round.benchClubA.map(id => `C${byId[id].rank}`).join(', ')}`);
  console.log(`Rest Galway: ${round.benchClubB.map(id => `G${byId[id].rank}`).join(', ')}`);
}

console.log('\n=== FAIRNESS SUMMARY ===');
console.log(JSON.stringify({
  totalMatches: fairness.totalMatches,
  minGames: fairness.minGames,
  maxGames: fairness.maxGames,
  equalGames: fairness.equalGames,
  duplicatePlayerRoundIssues: fairness.duplicatePlayerRoundIssues,
  sameClubIntegrityIssues: fairness.sameClubIntegrityIssues,
  repeatedPartnerPairs: fairness.repeatedPartnerPairs,
  maxPartnerRepeat: fairness.maxPartnerRepeat,
  repeatedOpponentPairs: fairness.repeatedOpponentPairs,
  maxOpponentRepeat: fairness.maxOpponentRepeat,
  consecutiveRestOccurrences: fairness.consecutiveRestOccurrences,
  averageStrengthGap: Number(fairness.averageStrengthGap.toFixed(2)),
  maxStrengthGap: fairness.maxStrengthGap,
}, null, 2));

console.log('\n=== PLAYER DETAIL ===');
for (const p of allPlayers) {
  const d = details[p.id];
  const repsP = Object.entries(d.partners).filter(([, n]) => n > 1).map(([id, n]) => `${byId[id].club[0]}${byId[id].rank}x${n}`);
  const repsO = Object.entries(d.opponents).filter(([, n]) => n > 1).map(([id, n]) => `${byId[id].club[0]}${byId[id].rank}x${n}`);
  const courtStr = Object.entries(d.courts).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`${p.club[0]}${p.rank} games=${d.games} rests=[${d.rests.join(',')}] repeatedPartners=[${repsP.join(',') || '-'}] repeatedOpponents=[${repsO.join(',') || '-'}] courts={${courtStr}}`);
}
