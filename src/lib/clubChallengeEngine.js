// Club Challenge engine — isolated from the existing Tournival engine.
// Phase 1: deterministic inter-club doubles scheduling, fairness analysis,
// format calculation and club scoring.

function combinations(items, choose) {
  const out = [];
  function walk(start, picked) {
    if (picked.length === choose) {
      out.push([...picked]);
      return;
    }
    for (let i = start; i <= items.length - (choose - picked.length); i++) {
      picked.push(items[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  }
  walk(0, []);
  return out;
}

function permutations(items) {
  if (items.length <= 1) return [items];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([items[i], ...tail]);
  }
  return out;
}

const pairKey = (a, b) => [a, b].sort().join('|');
const nearlyInteger = value => Math.abs(value - Math.round(value)) < 1e-9;

export function normaliseClubChallengePlayer(player, fallbackClub = '') {
  return {
    id: player?.id ?? null,
    name: String(player?.name ?? player?.full_name ?? '').trim(),
    club: String(player?.club ?? fallbackClub ?? '').trim(),
    rank: Number.isFinite(Number(player?.rank)) ? Number(player.rank) : null,
    gender: player?.gender ?? null,
    ageCategory: player?.ageCategory ?? player?.age_category ?? null,
  };
}

export function validateClubChallengeSetup({
  clubAPlayers = [], clubBPlayers = [], courts, availableMinutes, playMinutes,
  changeoverMinutes = 0, includeBreak = false, breakMinutes = 0,
}) {
  const errors = [];
  const warnings = [];
  const numCourts = Number(courts);
  const activePerClub = numCourts * 2;

  if (!Number.isInteger(numCourts) || numCourts < 1) errors.push('Courts must be at least 1.');
  if (!Number.isFinite(Number(availableMinutes)) || Number(availableMinutes) <= 0) errors.push('Available event time must be greater than 0 minutes.');
  if (!Number.isFinite(Number(playMinutes)) || Number(playMinutes) <= 0) errors.push('Playing time per round must be greater than 0 minutes.');
  if (!Number.isFinite(Number(changeoverMinutes)) || Number(changeoverMinutes) < 0) errors.push('Changeover time cannot be negative.');
  if (includeBreak && (!Number.isFinite(Number(breakMinutes)) || Number(breakMinutes) < 0)) errors.push('Break time cannot be negative.');
  if (clubAPlayers.length < 4) errors.push('Club A needs at least 4 players.');
  if (clubBPlayers.length < 4) errors.push('Club B needs at least 4 players.');
  if (activePerClub > clubAPlayers.length) errors.push('Club A does not have enough players for the selected courts.');
  if (activePerClub > clubBPlayers.length) errors.push('Club B does not have enough players for the selected courts.');
  if (clubAPlayers.length !== clubBPlayers.length) warnings.push('Club rosters are unequal; strictly equal games may not be possible.');

  const checkRanks = (players, label) => {
    const ranks = players.map(p => Number(p.rank));
    if (ranks.some(r => !Number.isFinite(r))) {
      warnings.push(`${label} ranking is incomplete.`);
      return;
    }
    if (new Set(ranks).size !== ranks.length) warnings.push(`${label} has duplicate ranks.`);
    const sorted = [...ranks].sort((a, b) => a - b);
    if (sorted.some((r, i) => r !== i + 1)) warnings.push(`${label} ranks should run from 1 to ${players.length}.`);
  };
  checkRanks(clubAPlayers, 'Club A');
  checkRanks(clubBPlayers, 'Club B');
  return { valid: errors.length === 0, errors, warnings };
}

export function calculateClubChallengeFormat({
  clubAPlayerCount, clubBPlayerCount, courts, availableMinutes, playMinutes,
  changeoverMinutes = 0, includeBreak = false, breakMinutes = 0, breakAfterRound = null,
}) {
  const a = Number(clubAPlayerCount);
  const b = Number(clubBPlayerCount);
  const c = Number(courts);
  const total = Number(availableMinutes);
  const play = Number(playMinutes);
  const change = Number(changeoverMinutes);
  const pause = includeBreak ? Number(breakMinutes) : 0;

  if (![a, b, c, total, play, change, pause].every(Number.isFinite)) throw new Error('Format inputs must be numeric.');
  if (a < 4 || b < 4 || !Number.isInteger(c) || c < 1 || total <= 0 || play <= 0 || change < 0 || pause < 0) throw new Error('Format inputs are outside the supported range.');
  if (c * 2 > a || c * 2 > b) throw new Error('Not enough players for the selected number of courts.');

  const block = play + change;
  const maxRounds = Math.floor((total - pause) / block);
  if (maxRounds < 1) throw new Error('The event is too short for one round.');

  let rounds = maxRounds;
  for (let r = maxRounds; r >= 1; r--) {
    const gamesA = (c * 2 * r) / a;
    const gamesB = (c * 2 * r) / b;
    if (nearlyInteger(gamesA) && nearlyInteger(gamesB)) {
      rounds = r;
      break;
    }
  }

  const avgA = (c * 2 * rounds) / a;
  const avgB = (c * 2 * rounds) / b;
  const structuredMinutes = rounds * block + pause;
  const afterRound = includeBreak
    ? Math.min(rounds, Math.max(1, Number.isInteger(Number(breakAfterRound)) ? Number(breakAfterRound) : Math.floor(rounds / 2)))
    : null;

  return {
    recommendedRounds: rounds,
    courts: c,
    activePlayersPerRound: c * 4,
    activePerClubPerRound: c * 2,
    totalMatches: rounds * c,
    averageGamesClubA: avgA,
    averageGamesClubB: avgB,
    equalGamesClubA: nearlyInteger(avgA),
    equalGamesClubB: nearlyInteger(avgB),
    roundBlockMinutes: block,
    structuredMinutes,
    remainingMinutes: total - structuredMinutes,
    break: includeBreak ? { enabled: true, minutes: pause, afterRound } : { enabled: false, minutes: 0, afterRound: null },
  };
}

function generatePerfectMatchings(ids) {
  if (ids.length % 2) throw new Error('An even number of players is required.');
  const fixed = ids[0];
  let rotating = ids.slice(1);
  const factors = [];
  for (let r = 0; r < ids.length - 1; r++) {
    const lineup = [fixed, ...rotating];
    const pairs = [];
    for (let i = 0; i < lineup.length / 2; i++) pairs.push([lineup[i], lineup[lineup.length - 1 - i]]);
    factors.push(pairs);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }
  return factors;
}

function selectFactors(players, factors, count) {
  const byId = Object.fromEntries(players.map(p => [p.id, p]));
  let best = null;
  for (const set of combinations(factors.map((_, i) => i), count)) {
    let score = 0;
    let extreme = 0;
    for (const idx of set) {
      for (const [x, y] of factors[idx]) {
        const gap = Math.abs(Number(byId[x].rank) - Number(byId[y].rank));
        score += gap * gap;
        if (gap >= players.length / 2) extreme++;
      }
    }
    score += extreme * 250;
    if (!best || score < best.score) best = { set, score, extreme };
  }
  return best;
}

function factorToTwoRounds(factor, courts, previousBench) {
  const chunks = [];
  for (let i = 0; i < factor.length; i += courts) chunks.push(factor.slice(i, i + courts));
  if (chunks.length !== 2) throw new Error('Phase 1 currently expects exactly two half-roster rounds per factor.');

  const all = factor.flat();
  const benchFor = teams => {
    const active = new Set(teams.flat());
    return all.filter(id => !active.has(id));
  };
  if (previousBench?.size) {
    const rest0 = benchFor(chunks[0]).filter(id => previousBench.has(id)).length;
    const rest1 = benchFor(chunks[1]).filter(id => previousBench.has(id)).length;
    if (rest1 < rest0) chunks.reverse();
  }
  return chunks.map(teams => ({ teams, bench: benchFor(teams) }));
}

function buildClubRounds(players, courts, rounds) {
  const factors = generatePerfectMatchings(players.map(p => p.id));
  const factorCount = rounds / 2;
  const selection = selectFactors(players, factors, factorCount);
  const out = [];
  let previousBench = new Set();
  for (const idx of selection.set) {
    for (const half of factorToTwoRounds(factors[idx], courts, previousBench)) {
      out.push(half);
      previousBench = new Set(half.bench);
    }
  }
  return { rounds: out, selection };
}

function strength(team, byId) {
  return team.reduce((sum, id) => sum + Number(byId[id].rank), 0);
}

function matchTeams(aTeams, bTeams, aById, bById, opponentHistory, previousCourt) {
  let best = null;
  for (const candidate of permutations(bTeams)) {
    let score = 0;
    for (let i = 0; i < aTeams.length; i++) {
      const aTeam = aTeams[i];
      const bTeam = candidate[i];
      score += Math.abs(strength(aTeam, aById) - strength(bTeam, bById)) * 20;
      for (const a of aTeam) for (const b of bTeam) score += (opponentHistory[pairKey(a, b)] || 0) * 60;
      for (const id of [...aTeam, ...bTeam]) if (previousCourt[id] === i + 1) score += 5;
    }
    if (!best || score < best.score) best = { teams: candidate, score };
  }
  return best.teams;
}

export function generateClubChallengeFixtures({ clubAPlayers, clubBPlayers, courts, rounds }) {
  const aPlayers = clubAPlayers.map(p => normaliseClubChallengePlayer(p, 'Club A'));
  const bPlayers = clubBPlayers.map(p => normaliseClubChallengePlayer(p, 'Club B'));
  const c = Number(courts);
  const r = Number(rounds);

  if (aPlayers.length !== bPlayers.length) throw new Error('Phase 1 requires equal club rosters.');
  if (aPlayers.length % 2) throw new Error('Phase 1 requires an even roster size per club.');
  if (!Number.isInteger(c) || c < 1 || !Number.isInteger(r) || r < 2 || r % 2) throw new Error('Phase 1 requires a positive court count and an even round count.');
  if (aPlayers.length / 2 !== c * 2) throw new Error('Phase 1 deterministic generator currently supports roster size = courts × 4 per club (e.g. 16 players and 4 courts).');
  if (r / 2 > aPlayers.length - 1) throw new Error('Too many rounds for unique-partner scheduling.');

  const aBuilt = buildClubRounds(aPlayers, c, r);
  const bBuilt = buildClubRounds(bPlayers, c, r);
  // Reverse Club B's selected factor order to reduce recurring cross-club patterns.
  const bRebuilt = buildClubRounds(bPlayers.slice().reverse(), c, r);
  const bRounds = bRebuilt.rounds;

  const aById = Object.fromEntries(aPlayers.map(p => [p.id, p]));
  const bById = Object.fromEntries(bPlayers.map(p => [p.id, p]));
  const opponentHistory = {};
  const previousCourt = {};
  const output = [];

  for (let i = 0; i < r; i++) {
    const matchedB = matchTeams(aBuilt.rounds[i].teams, bRounds[i].teams, aById, bById, opponentHistory, previousCourt);
    const courtRows = aBuilt.rounds[i].teams.map((aTeam, courtIndex) => {
      const bTeam = matchedB[courtIndex];
      for (const a of aTeam) for (const b of bTeam) opponentHistory[pairKey(a, b)] = (opponentHistory[pairKey(a, b)] || 0) + 1;
      for (const id of [...aTeam, ...bTeam]) previousCourt[id] = courtIndex + 1;
      return {
        courtNumber: courtIndex + 1,
        clubA: aTeam,
        clubB: bTeam,
        clubAStrength: strength(aTeam, aById),
        clubBStrength: strength(bTeam, bById),
      };
    });
    output.push({
      roundNumber: i + 1,
      courts: courtRows,
      benchClubA: aBuilt.rounds[i].bench,
      benchClubB: bRounds[i].bench,
    });
  }

  return {
    mode: 'club_challenge',
    rounds: output,
    metadata: {
      rosterSizePerClub: aPlayers.length,
      courts: c,
      rounds: r,
      totalMatches: c * r,
      partnerFactorScoreClubA: aBuilt.selection.score,
      partnerFactorScoreClubB: bBuilt.selection.score,
    },
  };
}

export function analyseClubChallengeFairness({ schedule, clubAPlayers, clubBPlayers }) {
  const all = [...clubAPlayers, ...clubBPlayers];
  const games = Object.fromEntries(all.map(p => [p.id, 0]));
  const partnerCounts = {};
  const opponentCounts = {};
  const consecutiveRest = Object.fromEntries(all.map(p => [p.id, 0]));
  const restedLastRound = Object.fromEntries(all.map(p => [p.id, false]));
  let duplicatePlayerRoundIssues = 0;
  let maxStrengthGap = 0;
  let totalStrengthGap = 0;
  let matches = 0;

  for (const round of schedule.rounds) {
    const seen = new Set();
    for (const court of round.courts) {
      const ids = [...court.clubA, ...court.clubB];
      for (const id of ids) {
        if (seen.has(id)) duplicatePlayerRoundIssues++;
        seen.add(id);
        games[id]++;
      }
      for (const team of [court.clubA, court.clubB]) partnerCounts[pairKey(team[0], team[1])] = (partnerCounts[pairKey(team[0], team[1])] || 0) + 1;
      for (const a of court.clubA) for (const b of court.clubB) opponentCounts[pairKey(a, b)] = (opponentCounts[pairKey(a, b)] || 0) + 1;
      const gap = Math.abs(court.clubAStrength - court.clubBStrength);
      maxStrengthGap = Math.max(maxStrengthGap, gap);
      totalStrengthGap += gap;
      matches++;
    }
    const bench = new Set([...round.benchClubA, ...round.benchClubB]);
    for (const p of all) {
      const isResting = bench.has(p.id);
      if (isResting && restedLastRound[p.id]) consecutiveRest[p.id]++;
      restedLastRound[p.id] = isResting;
    }
  }

  const repeatedPartners = Object.values(partnerCounts).filter(n => n > 1);
  const repeatedOpponents = Object.values(opponentCounts).filter(n => n > 1);
  const values = Object.values(games);
  return {
    totalMatches: matches,
    gameCounts: games,
    minGames: Math.min(...values),
    maxGames: Math.max(...values),
    equalGames: Math.min(...values) === Math.max(...values),
    duplicatePlayerRoundIssues,
    repeatedPartnerPairs: repeatedPartners.length,
    maxPartnerRepeat: repeatedPartners.length ? Math.max(...repeatedPartners) : 1,
    repeatedOpponentPairs: repeatedOpponents.length,
    maxOpponentRepeat: repeatedOpponents.length ? Math.max(...repeatedOpponents) : 1,
    consecutiveRestOccurrences: Object.values(consecutiveRest).reduce((sum, n) => sum + n, 0),
    maxStrengthGap,
    averageStrengthGap: matches ? totalStrengthGap / matches : 0,
  };
}

export function calculateClubChallengeScore(results) {
  const out = { clubA: 0, clubB: 0, matchesWonA: 0, matchesWonB: 0, draws: 0, gamePointsA: 0, gamePointsB: 0, completedMatches: 0 };
  for (const result of results) {
    if (!result || !Number.isFinite(Number(result.scoreA)) || !Number.isFinite(Number(result.scoreB))) continue;
    const a = Number(result.scoreA);
    const b = Number(result.scoreB);
    out.gamePointsA += a;
    out.gamePointsB += b;
    out.completedMatches++;
    if (a > b) { out.clubA += 2; out.matchesWonA++; }
    else if (b > a) { out.clubB += 2; out.matchesWonB++; }
    else { out.clubA++; out.clubB++; out.draws++; }
  }
  return {
    ...out,
    gamePointDifference: out.gamePointsA - out.gamePointsB,
    leader: out.clubA === out.clubB ? 'draw' : out.clubA > out.clubB ? 'clubA' : 'clubB',
  };
}
