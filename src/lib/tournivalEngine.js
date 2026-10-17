/**
 * Tournival Engine
 * Handles fixture generation, fairness checks, leaderboard, and knockout pairings
 * for the Tournival format (4 group rounds of mixed doubles, then knockout).
 */

// ── Shuffle ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate 4 rounds of mixed-doubles group fixtures.
 * Each round: players are split into pairs (random partners), then matched against another pair on each court.
 * Players rotate partners and opponents across rounds as much as possible.
 *
 * Returns: rounds = [ { roundNumber, courts: [ { courtNumber, teamA: [id, id], teamB: [id, id] } ], bench: [id] } ]
 */
export function generateGroupFixtures(playerIds, numCourts, numRounds = 4) {
  const n = playerIds.length;
  const rounds = [];
  const partnerHistory = {}; // id -> Set of partner ids
  const opponentHistory = {}; // id -> Set of opponent ids

  for (const id of playerIds) {
    partnerHistory[id] = new Set();
    opponentHistory[id] = new Set();
  }

  for (let r = 0; r < numRounds; r++) {
    const round = generateOneRound(playerIds, numCourts, partnerHistory, opponentHistory, r + 1);
    rounds.push(round);

    // Update histories
    for (const court of round.courts) {
      const [a1, a2] = court.teamA;
      const [b1, b2] = court.teamB;
      partnerHistory[a1].add(a2); partnerHistory[a2].add(a1);
      partnerHistory[b1].add(b2); partnerHistory[b2].add(b1);
      for (const p of [a1, a2]) { opponentHistory[p].add(b1); opponentHistory[p].add(b2); }
      for (const p of [b1, b2]) { opponentHistory[p].add(a1); opponentHistory[p].add(a2); }
    }
  }

  return rounds;
}

function generateOneRound(playerIds, numCourts, partnerHistory, opponentHistory, roundNumber) {
  const active = [...playerIds];
  const bench = [];

  // How many players can play (numCourts * 4)
  const slots = numCourts * 4;
  if (active.length > slots) {
    // Use seed order as the source order and rotate bench predictably by round.
    const offset = ((roundNumber - 1) * slots) % active.length;
    const rotated = [...active.slice(offset), ...active.slice(0, offset)];
    bench.push(...rotated.slice(slots));
    active.splice(0, active.length, ...rotated.slice(0, slots));
  }

  // Pair players into teams trying to minimise partner repeats, keeping seed order as the base order
  const players = [...active];
  const teams = [];

  // Greedy pairing: pick first available, find best partner
  const used = new Set();
  while (players.length - used.size >= 2) {
    const p1 = players.find(p => !used.has(p));
    if (!p1) break;
    used.add(p1);

    // Find best partner for p1 (least repeated)
    const candidates = players.filter(p => !used.has(p));
    candidates.sort((a, b) => {
      const aSeen = partnerHistory[p1].has(a) ? 1 : 0;
      const bSeen = partnerHistory[p1].has(b) ? 1 : 0;
      return aSeen - bSeen;
    });
    const p2 = candidates[0];
    used.add(p2);
    teams.push([p1, p2]);
  }

  // Match teams into courts (also try to minimise repeated matchups)
  const courts = [];
  const usedTeams = new Set();
  for (let c = 0; c < numCourts && teams.length - usedTeams.size >= 2; c++) {
    const teamA = teams.find((_, i) => !usedTeams.has(i));
    const idxA = teams.indexOf(teamA);
    usedTeams.add(idxA);

    // Find best opposing team
    const remaining = teams.map((t, i) => ({ t, i })).filter(({ i }) => !usedTeams.has(i));
    remaining.sort(({ t: ta }) => {
      const seen = teamA.some(p => ta.some(q => opponentHistory[p].has(q)));
      return seen ? 1 : -1;
    });
    const { t: teamB, i: idxB } = remaining[0];
    usedTeams.add(idxB);

    courts.push({ courtNumber: c + 1, teamA, teamB });
  }

  return { roundNumber, courts, bench };
}

// ── Fairness Check ─────────────────────────────────────────────────────────────
export function checkFairness(rounds) {
  const partnerCount = {}; // 'id1-id2' -> count
  const matchupCount = {}; // 'id1-id2' -> count (sorted)
  const issues = [];

  const key = (a, b) => [a, b].sort().join('|');

  for (const round of rounds) {
    for (const court of round.courts) {
      const [a1, a2] = court.teamA;
      const [b1, b2] = court.teamB;

      const pk1 = key(a1, a2);
      const pk2 = key(b1, b2);
      partnerCount[pk1] = (partnerCount[pk1] || 0) + 1;
      partnerCount[pk2] = (partnerCount[pk2] || 0) + 1;

      for (const p of [a1, a2]) {
        for (const q of [b1, b2]) {
          const mk = key(p, q);
          matchupCount[mk] = (matchupCount[mk] || 0) + 1;
        }
      }
    }
  }

  for (const [k, count] of Object.entries(partnerCount)) {
    if (count > 1) issues.push({ type: 'repeated_partner', pair: k, count });
  }
  for (const [k, count] of Object.entries(matchupCount)) {
    if (count > 1) issues.push({ type: 'repeated_matchup', pair: k, count });
  }

  return issues;
}

// ── Score validation ──────────────────────────────────────────────────────────
export function validateTournivalScore(scoreA, scoreB, matchFormat = 'first_11_by1') {
  const a = Number(scoreA), b = Number(scoreB);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return { valid: false, error: 'Scores must be non-negative whole numbers.' };
  if (a === b) return { valid: false, error: 'Scores cannot be equal — there must be a winner.' };
  const winner = Math.max(a, b), loser = Math.min(a, b);
  if (String(matchFormat).startsWith('timed_')) return { valid: true };
  if (matchFormat === 'first_11_by1') {
    if (winner !== 11 || loser > 10) return { valid: false, error: 'First-to-11 (win by 1) must finish at 11 with the losing score 10 or lower.' };
    return { valid: true };
  }
  if (matchFormat === 'first_11_by2') {
    if (winner < 11 || winner - loser < 2) return { valid: false, error: 'Winner must reach at least 11 and win by 2.' };
    if (winner > 11 && winner - loser !== 2) return { valid: false, error: 'After 10–10, play continues until one pair leads by 2.' };
    return { valid: true };
  }
  return { valid: false, error: 'Unknown Tournival match format.' };
}

// ── Leaderboard ────────────────────────────────────────────────────────────────
export function computeLeaderboard(playerIds, rounds, results, playerMap) {
  const stats = {};
  for (const id of playerIds) {
    stats[id] = { id, name: playerMap[id] || id, played: 0, wins: 0, losses: 0, pf: 0, pa: 0, points: 0 };
  }

  for (const round of rounds) {
    const roundResults = results[round.roundNumber] || {};
    for (const court of round.courts) {
      const result = roundResults[court.courtNumber];
      if (!result) continue;

      const winTeam = result.winner === 'A' ? court.teamA : court.teamB;
      const loseTeam = result.winner === 'A' ? court.teamB : court.teamA;
      const winScore = result.winner === 'A' ? result.scoreA : result.scoreB;
      const loseScore = result.winner === 'A' ? result.scoreB : result.scoreA;

      for (const id of winTeam) {
        if (!stats[id]) continue;
        stats[id].played++;
        stats[id].wins++;
        stats[id].points += 3;
        stats[id].pf += (winScore || 0);
        stats[id].pa += (loseScore || 0);
      }
      for (const id of loseTeam) {
        if (!stats[id]) continue;
        stats[id].played++;
        stats[id].losses++;
        stats[id].pf += (loseScore || 0);
        stats[id].pa += (winScore || 0);
      }
    }
  }

  return Object.values(stats)
    .map(s => ({ ...s, diff: s.pf - s.pa }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.pf !== a.pf) return b.pf - a.pf;
      return b.diff - a.diff;
    });
}

// ── Knockout Pair Creation ─────────────────────────────────────────────────────
/**
 * Create fixed pairs for the knockout stage.
 * Top half of qualified players paired with bottom half to balance strong/weak.
 * For 16 players: ranks 1-8 paired with ranks 16,15,14,13,12,11,10,9 (1 with 16, 2 with 15 etc.)
 * Then seeded: Seed1 v Seed8, Seed4 v Seed5, Seed3 v Seed6, Seed2 v Seed7
 */
export function createKnockoutPairs(rankedPlayers) {
  const n = rankedPlayers.length;
  const half = Math.floor(n / 2);
  const pairs = [];

  for (let i = 0; i < half; i++) {
    pairs.push({
      seed: i + 1,
      player1: rankedPlayers[i],       // Top half (strong)
      player2: rankedPlayers[n - 1 - i], // Bottom half (weaker)
    });
  }

  return pairs;
}

/**
 * Seed bracket matchups for the quarter-finals (8 pairs → 4 QF matches).
 * Classic seeding: 1v8, 4v5, 3v6, 2v7
 */
export function createKnockoutBracket(pairs) {
  if (pairs.length === 8) {
    return [
      { match: 'QF1', pair1: pairs[0], pair2: pairs[7] }, // 1 v 8
      { match: 'QF2', pair1: pairs[3], pair2: pairs[4] }, // 4 v 5
      { match: 'QF3', pair1: pairs[2], pair2: pairs[5] }, // 3 v 6
      { match: 'QF4', pair1: pairs[1], pair2: pairs[6] }, // 2 v 7
    ];
  }
  if (pairs.length === 4) {
    return [
      { match: 'SF1', pair1: pairs[0], pair2: pairs[3] },
      { match: 'SF2', pair1: pairs[1], pair2: pairs[2] },
    ];
  }
  // Generic: 1vN, 2v(N-1) ...
  const bracket = [];
  for (let i = 0; i < Math.floor(pairs.length / 2); i++) {
    bracket.push({ match: `M${i + 1}`, pair1: pairs[i], pair2: pairs[pairs.length - 1 - i] });
  }
  return bracket;
}

// ── Duration Estimate (qualification AND mandatory knockout) ────────────────
/**
 * Conservative court-wave forecast. Timed matches use their clock; point matches
 * use a host-configurable average. Does not promise a finish time.
 */
export function estimateDuration({
  numPlayers, numCourts, numRounds, matchFormat,
  matchMinutes, changeoverMinutes = 3, venueMinutes = 120,
  knockoutPairs, setupMinutes = 10, breakMinutes = 0,
}) {
  const players = Number(numPlayers), courts = Number(numCourts), rounds = Number(numRounds);
  if (!Number.isInteger(players) || players < 4 || !Number.isInteger(courts) || courts < 1 ||
      !Number.isInteger(rounds) || rounds < 2 || rounds > 6) {
    return { valid: false, error: 'Requires at least four players, one court and 2–6 qualification rounds.' };
  }
  const timed = String(matchFormat || '').startsWith('timed_');
  const inferredMinutes = timed ? Number(String(matchFormat).split('_')[1]) :
    matchFormat === 'first_11_by2' ? 22 : 18;
  const playMinutes = Number(matchMinutes ?? inferredMinutes);
  const change = Number(changeoverMinutes), setup = Number(setupMinutes), breaks = Number(breakMinutes);
  if (![playMinutes, change, setup, breaks].every(v => Number.isFinite(v) && v >= 0) || playMinutes <= 0) {
    return { valid: false, error: 'Match and changeover assumptions must be valid non-negative minutes.' };
  }
  const matchesPerRound = Math.floor(Math.min(players, courts * 4) / 4);
  if (!matchesPerRound) return { valid: false, error: 'No complete doubles match can be scheduled.' };
  // A rotating qualification round can include only players assigned at that time.
  const qualificationWaves = rounds;
  const groupMinutes = qualificationWaves * playMinutes + Math.max(0, rounds - 1) * change;
  // Qualified pairs must be a power of two; maximum feasible pairs follows roster.
  const maxPairs = Math.floor(players / 2);
  const suggestedPairs = Math.min(8, 2 ** Math.floor(Math.log2(maxPairs)));
  const pairs = Number(knockoutPairs ?? suggestedPairs);
  if (!Number.isInteger(pairs) || pairs < 2 || pairs > maxPairs || (pairs & (pairs - 1)) !== 0) {
    return { valid: false, error: 'Knockout pairs must be a power of two, at least two, within the roster.' };
  }
  let remaining = pairs, knockoutMinutes = 0, knockoutMatches = 0, knockoutWaves = 0;
  const stages = [];
  while (remaining > 1) {
    const matches = remaining / 2;
    const waves = Math.ceil(matches / courts);
    const minutes = waves * playMinutes + Math.max(0, waves - 1) * change;
    stages.push({ pairs: remaining, matches, waves, minutes, final: remaining === 2 });
    knockoutMinutes += minutes;
    knockoutMatches += matches;
    knockoutWaves += waves;
    remaining = matches;
  }
  const stageTransitions = Math.max(0, stages.length - 1) * change;
  knockoutMinutes += stageTransitions;
  const totalMinutes = Math.ceil(groupMinutes + knockoutMinutes + setup + breaks + change);
  const booking = Number(venueMinutes);
  const bookingValid = Number.isInteger(booking) && booking >= 60 && booking % 30 === 0;
  return {
    valid: true, numPlayers: players, numCourts: courts, numRounds: rounds,
    qualificationMatches: rounds * matchesPerRound, knockoutMatches, knockoutPairs: pairs,
    stages, qualificationWaves, knockoutWaves, matchMinutes: playMinutes,
    changeoverMinutes: change, groupMinutes, knockoutMinutes, setupMinutes: setup,
    breakMinutes: breaks, totalMinutes, venueMinutes: booking,
    venueValid: bookingValid, overrunMinutes: bookingValid ? Math.max(0, totalMinutes - booking) : null,
    fitsBooking: bookingValid && totalMinutes <= booking,
    formatted: totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`,
  };
}
