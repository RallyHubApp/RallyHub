// RallyHub Club Challenge v1.0 engine.
// Pure scheduling/scoring logic. UI and persistence are intentionally separate.

const pairKey = (a, b) => [a, b].sort().join('|');
const nearlyInteger = value => Math.abs(value - Math.round(value)) < 1e-9;
const finite = value => Number.isFinite(Number(value));

function combinations(items, choose) {
  const out = [];
  function walk(start, picked) {
    if (picked.length === choose) { out.push([...picked]); return; }
    for (let i = start; i <= items.length - (choose - picked.length); i++) {
      picked.push(items[i]); walk(i + 1, picked); picked.pop();
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

function stableIdScore(ids) {
  return ids.join('|').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function normaliseClubChallengePlayer(player, fallbackClub = '') {
  return {
    id: player?.id ?? null,
    name: String(player?.name ?? player?.full_name ?? '').trim(),
    club: String(player?.club ?? fallbackClub ?? '').trim(),
    rank: finite(player?.rank) ? Number(player.rank) : null,
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
  const c = Number(courts);

  if (!Number.isInteger(c) || c < 1) errors.push('Courts must be at least 1.');
  if (!finite(availableMinutes) || Number(availableMinutes) <= 0) errors.push('Available event time must be greater than 0 minutes.');
  if (!finite(playMinutes) || Number(playMinutes) <= 0) errors.push('Playing time per round must be greater than 0 minutes.');
  if (!finite(changeoverMinutes) || Number(changeoverMinutes) < 0) errors.push('Changeover time cannot be negative.');
  if (includeBreak && (!finite(breakMinutes) || Number(breakMinutes) < 0)) errors.push('Break time cannot be negative.');
  if (clubAPlayers.length < 4) errors.push('Club A needs at least 4 players.');
  if (clubBPlayers.length < 4) errors.push('Club B needs at least 4 players.');
  if (Number.isInteger(c) && c > 0 && c * 2 > clubAPlayers.length) errors.push('Club A does not have enough players for the selected courts.');
  if (Number.isInteger(c) && c > 0 && c * 2 > clubBPlayers.length) errors.push('Club B does not have enough players for the selected courts.');
  if (clubAPlayers.length !== clubBPlayers.length) warnings.push('Club rosters are unequal; strictly equal games may not be possible.');

  const ids = [...clubAPlayers, ...clubBPlayers].map(p => p.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) errors.push('A participant cannot occupy more than one Club Challenge slot.');

  const checkRanks = (players, label) => {
    const ranks = players.map(p => Number(p.rank));
    if (ranks.some(r => !Number.isFinite(r))) { warnings.push(`${label} ranking is incomplete.`); return; }
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
  const a = Number(clubAPlayerCount), b = Number(clubBPlayerCount), c = Number(courts);
  const total = Number(availableMinutes), play = Number(playMinutes), change = Number(changeoverMinutes);
  const pause = includeBreak ? Number(breakMinutes) : 0;
  if (![a, b, c, total, play, change, pause].every(Number.isFinite)) throw new Error('Format inputs must be numeric.');
  if (a < 4 || b < 4 || !Number.isInteger(c) || c < 1 || total <= 0 || play <= 0 || change < 0 || pause < 0) throw new Error('Format inputs are outside the supported range.');
  if (c * 2 > a || c * 2 > b) throw new Error('Not enough players for the selected number of courts.');

  const block = play + change;
  const maxRounds = Math.floor((total - pause) / block);
  if (maxRounds < 1) throw new Error('The event is too short for one round.');

  let rounds = maxRounds;
  let exactEquality = false;
  for (let r = maxRounds; r >= 1; r--) {
    const gamesA = (c * 2 * r) / a;
    const gamesB = (c * 2 * r) / b;
    if (nearlyInteger(gamesA) && nearlyInteger(gamesB)) { rounds = r; exactEquality = true; break; }
  }

  const avgA = (c * 2 * rounds) / a, avgB = (c * 2 * rounds) / b;
  const structuredMinutes = rounds * block + pause;
  const afterRound = includeBreak
    ? Math.min(rounds, Math.max(1, Number.isInteger(Number(breakAfterRound)) ? Number(breakAfterRound) : Math.floor(rounds / 2)))
    : null;
  const range = avg => nearlyInteger(avg) ? [Math.round(avg), Math.round(avg)] : [Math.floor(avg), Math.ceil(avg)];

  return {
    recommendedRounds: rounds,
    maxRoundsByTime: maxRounds,
    courts: c,
    activePlayersPerRound: c * 4,
    activePerClubPerRound: c * 2,
    totalMatches: rounds * c,
    averageGamesClubA: avgA,
    averageGamesClubB: avgB,
    gamesRangeClubA: range(avgA),
    gamesRangeClubB: range(avgB),
    equalGamesClubA: nearlyInteger(avgA),
    equalGamesClubB: nearlyInteger(avgB),
    exactEquality,
    playMinutes: play,
    changeoverMinutes: change,
    roundBlockMinutes: block,
    structuredMinutes,
    remainingMinutes: total - structuredMinutes,
    break: includeBreak ? { enabled: true, minutes: pause, afterRound } : { enabled: false, minutes: 0, afterRound: null },
  };
}

function generatePerfectMatchings(ids) {
  if (ids.length % 2) throw new Error('An even number of players per club is currently required for unique-partner factor scheduling.');
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

function teamStrength(team, byId) {
  return team.reduce((sum, id) => sum + (finite(byId[id]?.rank) ? Number(byId[id].rank) : 0), 0);
}

function candidateInternalScore({ teams, allIds, games, previousBench, byId, rosterSize, targetGames }) {
  const active = new Set(teams.flat());
  const projected = allIds.map(id => (games[id] || 0) + (active.has(id) ? 1 : 0));
  const min = Math.min(...projected), max = Math.max(...projected);
  const mean = projected.reduce((a, b) => a + b, 0) / projected.length;
  const variance = projected.reduce((s, n) => s + (n - mean) ** 2, 0);
  const bench = allIds.filter(id => !active.has(id));
  const consecutiveRest = bench.filter(id => previousBench.has(id)).length;
  let partnerGapPenalty = 0;
  for (const [a, b] of teams) {
    const gap = Math.abs(Number(byId[a]?.rank || 0) - Number(byId[b]?.rank || 0));
    partnerGapPenalty += gap;
    if (gap >= Math.ceil(rosterSize / 2)) partnerGapPenalty += gap * 8;
  }
  const targetCeiling = Number.isFinite(targetGames) ? Math.ceil(targetGames) : Infinity;
  const overTarget = projected.reduce((sum, n) => sum + Math.max(0, n - targetCeiling), 0);
  return overTarget * 1_000_000_000 + (max - min) * 100000 + variance * 10000 + consecutiveRest * 800 + partnerGapPenalty * 8 + stableIdScore(teams.flat()) * 0.000001;
}

function generateRoundCandidates({ players, courts, games, previousBench, usedFactors, targetGames, maxCandidates = 24 }) {
  const ids = players.map(p => p.id);
  const byId = Object.fromEntries(players.map(p => [p.id, p]));
  const factors = generatePerfectMatchings(ids);
  const unused = factors.map((_, i) => i).filter(i => !usedFactors.has(i));
  const factorIndices = unused.length ? unused : factors.map((_, i) => i);
  const candidates = [];

  for (const factorIndex of factorIndices) {
    const factor = factors[factorIndex];
    for (const teamIndices of combinations(factor.map((_, i) => i), courts)) {
      const teams = teamIndices.map(i => factor[i]);
      const active = new Set(teams.flat());
      const bench = ids.filter(id => !active.has(id));
      const internalScore = candidateInternalScore({ teams, allIds: ids, games, previousBench, byId, rosterSize: ids.length, targetGames });
      candidates.push({ factorIndex, teams, bench, internalScore });
    }
  }
  candidates.sort((x, y) => x.internalScore - y.internalScore);
  return candidates.slice(0, maxCandidates);
}

function bestCrossClubMatch({ aTeams, bTeams, aById, bById, opponentCounts, previousCourt }) {
  let best = null;
  for (const permuted of permutations(bTeams)) {
    let repeatedOpponentPenalty = 0, strengthGapTotal = 0, sameCourtPenalty = 0;
    for (let court = 0; court < aTeams.length; court++) {
      const aTeam = aTeams[court], bTeam = permuted[court];
      const gap = Math.abs(teamStrength(aTeam, aById) - teamStrength(bTeam, bById));
      strengthGapTotal += gap;
      for (const a of aTeam) for (const b of bTeam) {
        const repeats = opponentCounts[pairKey(a, b)] || 0;
        repeatedOpponentPenalty += repeats * repeats + repeats;
      }
      for (const id of [...aTeam, ...bTeam]) if (previousCourt[id] === court + 1) sameCourtPenalty++;
    }
    // Opponent variety is deliberately weighted above perfect strength equality.
    const score = repeatedOpponentPenalty * 180 + strengthGapTotal * 24 + sameCourtPenalty * 4;
    if (!best || score < best.score) best = { bTeams: permuted, score, repeatedOpponentPenalty, strengthGapTotal };
  }
  return best;
}

function applyRoundState({ candidate, games, previousBench, usedFactors }) {
  for (const id of candidate.teams.flat()) games[id] = (games[id] || 0) + 1;
  previousBench.clear();
  for (const id of candidate.bench) previousBench.add(id);
  usedFactors.add(candidate.factorIndex);
}

export function generateClubChallengeFixtures({ clubAPlayers, clubBPlayers, courts, rounds }) {
  const aPlayers = clubAPlayers.map(p => normaliseClubChallengePlayer(p, 'Club A'));
  const bPlayers = clubBPlayers.map(p => normaliseClubChallengePlayer(p, 'Club B'));
  const c = Number(courts), r = Number(rounds);
  if (aPlayers.length !== bPlayers.length) throw new Error('Fixture generation currently requires equal club rosters; unequal-roster setup must be resolved before draw approval.');
  if (aPlayers.length % 2 || bPlayers.length % 2) throw new Error('Fixture generation currently requires an even roster size per club.');
  if (!Number.isInteger(c) || c < 1 || !Number.isInteger(r) || r < 1) throw new Error('Courts and rounds must be positive integers.');
  if (c * 2 > aPlayers.length || c * 2 > bPlayers.length) throw new Error('Not enough players for the selected number of courts.');
  if (aPlayers.some(p => !p.id) || bPlayers.some(p => !p.id)) throw new Error('Every participant requires an event participant ID.');
  const allIds = [...aPlayers, ...bPlayers].map(p => p.id);
  if (new Set(allIds).size !== allIds.length) throw new Error('The same participant cannot occupy two Club Challenge slots.');

  const aById = Object.fromEntries(aPlayers.map(p => [p.id, p]));
  const bById = Object.fromEntries(bPlayers.map(p => [p.id, p]));
  const aGames = Object.fromEntries(aPlayers.map(p => [p.id, 0]));
  const bGames = Object.fromEntries(bPlayers.map(p => [p.id, 0]));
  const targetGamesA = (c * 2 * r) / aPlayers.length;
  const targetGamesB = (c * 2 * r) / bPlayers.length;
  const aPreviousBench = new Set(), bPreviousBench = new Set();
  const aUsedFactors = new Set(), bUsedFactors = new Set();
  const opponentCounts = {};
  const previousCourt = {};
  const output = [];

  for (let roundIndex = 0; roundIndex < r; roundIndex++) {
    const aCandidates = generateRoundCandidates({ players: aPlayers, courts: c, games: aGames, previousBench: aPreviousBench, usedFactors: aUsedFactors, targetGames: targetGamesA });
    const bCandidates = generateRoundCandidates({ players: bPlayers, courts: c, games: bGames, previousBench: bPreviousBench, usedFactors: bUsedFactors, targetGames: targetGamesB });
    let best = null;
    for (const aCandidate of aCandidates) {
      for (const bCandidate of bCandidates) {
        const cross = bestCrossClubMatch({ aTeams: aCandidate.teams, bTeams: bCandidate.teams, aById, bById, opponentCounts, previousCourt });
        const total = aCandidate.internalScore + bCandidate.internalScore + cross.score;
        if (!best || total < best.total) best = { aCandidate, bCandidate, cross, total };
      }
    }
    if (!best) throw new Error(`Unable to generate Club Challenge round ${roundIndex + 1}.`);

    const courtsOut = best.aCandidate.teams.map((aTeam, courtIndex) => {
      const bTeam = best.cross.bTeams[courtIndex];
      for (const a of aTeam) for (const b of bTeam) opponentCounts[pairKey(a, b)] = (opponentCounts[pairKey(a, b)] || 0) + 1;
      for (const id of [...aTeam, ...bTeam]) previousCourt[id] = courtIndex + 1;
      return {
        courtNumber: courtIndex + 1,
        clubA: aTeam,
        clubB: bTeam,
        clubAStrength: teamStrength(aTeam, aById),
        clubBStrength: teamStrength(bTeam, bById),
      };
    });

    applyRoundState({ candidate: best.aCandidate, games: aGames, previousBench: aPreviousBench, usedFactors: aUsedFactors });
    applyRoundState({ candidate: best.bCandidate, games: bGames, previousBench: bPreviousBench, usedFactors: bUsedFactors });
    output.push({ roundNumber: roundIndex + 1, courts: courtsOut, benchClubA: best.aCandidate.bench, benchClubB: best.bCandidate.bench });
  }

  return {
    mode: 'club_challenge',
    rulesVersion: '1.0',
    rounds: output,
    metadata: { rosterSizeClubA: aPlayers.length, rosterSizeClubB: bPlayers.length, courts: c, rounds: r, totalMatches: c * r },
  };
}

export function analyseClubChallengeFairness({ schedule, clubAPlayers, clubBPlayers }) {
  const all = [...clubAPlayers, ...clubBPlayers];
  const games = Object.fromEntries(all.map(p => [p.id, 0]));
  const partnerCounts = {}, opponentCounts = {}, courtCounts = {};
  const consecutiveRest = Object.fromEntries(all.map(p => [p.id, 0]));
  const restedLastRound = Object.fromEntries(all.map(p => [p.id, false]));
  let duplicatePlayerRoundIssues = 0, sameClubIntegrityIssues = 0;
  let maxStrengthGap = 0, totalStrengthGap = 0, matches = 0;

  for (const round of schedule.rounds) {
    const seen = new Set();
    for (const court of round.courts) {
      if (court.clubA.length !== 2 || court.clubB.length !== 2) sameClubIntegrityIssues++;
      const ids = [...court.clubA, ...court.clubB];
      for (const id of ids) {
        if (seen.has(id)) duplicatePlayerRoundIssues++;
        seen.add(id); games[id] = (games[id] || 0) + 1;
        courtCounts[id] ??= {};
        courtCounts[id][court.courtNumber] = (courtCounts[id][court.courtNumber] || 0) + 1;
      }
      for (const team of [court.clubA, court.clubB]) partnerCounts[pairKey(team[0], team[1])] = (partnerCounts[pairKey(team[0], team[1])] || 0) + 1;
      for (const a of court.clubA) for (const b of court.clubB) opponentCounts[pairKey(a, b)] = (opponentCounts[pairKey(a, b)] || 0) + 1;
      const gap = Math.abs(Number(court.clubAStrength || 0) - Number(court.clubBStrength || 0));
      maxStrengthGap = Math.max(maxStrengthGap, gap); totalStrengthGap += gap; matches++;
    }
    const bench = new Set([...(round.benchClubA || []), ...(round.benchClubB || [])]);
    for (const p of all) {
      const isResting = bench.has(p.id);
      if (isResting && restedLastRound[p.id]) consecutiveRest[p.id]++;
      restedLastRound[p.id] = isResting;
    }
  }

  const partnerRepeats = Object.values(partnerCounts).filter(n => n > 1);
  const opponentRepeats = Object.values(opponentCounts).filter(n => n > 1);
  const values = Object.values(games);
  return {
    totalMatches: matches,
    gameCounts: games,
    minGames: Math.min(...values), maxGames: Math.max(...values), equalGames: Math.min(...values) === Math.max(...values),
    duplicatePlayerRoundIssues, sameClubIntegrityIssues,
    repeatedPartnerPairs: partnerRepeats.length, maxPartnerRepeat: partnerRepeats.length ? Math.max(...partnerRepeats) : 1,
    repeatedOpponentPairs: opponentRepeats.length, maxOpponentRepeat: opponentRepeats.length ? Math.max(...opponentRepeats) : 1,
    consecutiveRestOccurrences: Object.values(consecutiveRest).reduce((sum, n) => sum + n, 0),
    maxStrengthGap, averageStrengthGap: matches ? totalStrengthGap / matches : 0,
    courtCounts,
  };
}

export function validateClubChallengeScore({ scoreA, scoreB, matchFormat }) {
  const a = Number(scoreA), b = Number(scoreB);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return { valid: false, error: 'Scores must be non-negative whole numbers.' };
  const format = matchFormat || { type: 'timed', drawsAllowed: true };
  if (format.type === 'timed') {
    if (a === b && format.drawsAllowed === false) return { valid: false, error: 'This timed format requires a winner.' };
    return { valid: true, outcome: a === b ? 'draw' : a > b ? 'clubA' : 'clubB' };
  }
  if (format.type !== 'points') return { valid: false, error: 'Unknown match format.' };
  const target = Number(format.target), winBy = Number(format.winBy);
  if (![target, winBy].every(Number.isInteger) || target < 1 || ![1, 2].includes(winBy)) return { valid: false, error: 'Invalid points-format configuration.' };
  if (a === b) return { valid: false, error: 'Point-based matches require a winner.' };
  const winner = Math.max(a, b), loser = Math.min(a, b), lead = winner - loser;
  if (winner < target) return { valid: false, error: `Winner must reach at least ${target}.` };
  if (lead < winBy) return { valid: false, error: `Winner must win by ${winBy}.` };
  if (winBy === 1 && winner > target && loser < target) return { valid: false, error: `With win-by-1, the match should end when a player reaches ${target}.` };
  return { valid: true, outcome: a > b ? 'clubA' : 'clubB' };
}

export function calculateClubChallengeScore(results, { winPoints = 2, drawPoints = 1, lossPoints = 0 } = {}) {
  const out = { clubA: 0, clubB: 0, matchesWonA: 0, matchesWonB: 0, draws: 0, gamePointsA: 0, gamePointsB: 0, completedMatches: 0 };
  for (const result of results || []) {
    if (!result || !finite(result.scoreA) || !finite(result.scoreB) || result.status === 'missing') continue;
    const a = Number(result.scoreA), b = Number(result.scoreB);
    out.gamePointsA += a; out.gamePointsB += b; out.completedMatches++;
    if (a > b) { out.clubA += winPoints; out.clubB += lossPoints; out.matchesWonA++; }
    else if (b > a) { out.clubB += winPoints; out.clubA += lossPoints; out.matchesWonB++; }
    else { out.clubA += drawPoints; out.clubB += drawPoints; out.draws++; }
  }
  return { ...out, gamePointDifference: out.gamePointsA - out.gamePointsB, leader: out.clubA === out.clubB ? 'draw' : out.clubA > out.clubB ? 'clubA' : 'clubB' };
}

export function applyShowcasePoints(baseScore, { winner, points }) {
  const p = Number(points);
  if (!Number.isFinite(p) || p < 0) throw new Error('Showcase points must be zero or greater.');
  const score = { ...baseScore };
  if (winner === 'clubA') score.clubA += p;
  else if (winner === 'clubB') score.clubB += p;
  else throw new Error('Showcase winner must be clubA or clubB.');
  return { ...score, showcaseWinner: winner, showcasePoints: p, leader: score.clubA === score.clubB ? 'draw' : score.clubA > score.clubB ? 'clubA' : 'clubB' };
}

export function resolveClubChallengeWinner(score, { allowDraw = true } = {}) {
  if (score.clubA !== score.clubB) return score.clubA > score.clubB ? 'clubA' : 'clubB';
  if (allowDraw) return 'draw';
  if ((score.matchesWonA || 0) !== (score.matchesWonB || 0)) return score.matchesWonA > score.matchesWonB ? 'clubA' : 'clubB';
  const diff = Number(score.gamePointDifference || 0);
  if (diff !== 0) return diff > 0 ? 'clubA' : 'clubB';
  return 'tiebreak_required';
}

export function checkResultRevision({ expectedRevision, currentRevision }) {
  const expected = Number(expectedRevision), current = Number(currentRevision);
  if (!Number.isInteger(expected) || !Number.isInteger(current) || expected < 0 || current < 0) throw new Error('Result revisions must be non-negative integers.');
  return { canWrite: expected === current, conflict: expected !== current, nextRevision: current + 1 };
}
