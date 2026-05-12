/**
 * King of the Court — Rotation Engine
 *
 * Terminology:
 *  player   = { id, name }
 *  court    = 1..numCourts (1 is King Court)
 *  slot     = { courtNumber, team: 'A'|'B', position: 0|1 }
 *
 * State shape (kotcState):
 * {
 *   players: [{ id, name }],
 *   numCourts: number,
 *   rounds: [{
 *     roundNumber,
 *     courts: [{ courtNumber, teamA: [id,id], teamB: [id,id] }],
 *     bench: [id],
 *   }],
 *   results: { [roundNumber]: { [courtNumber]: 'A'|'B' } },
 *   sitOutCounts: { [playerId]: number },
 *   recentBench: [playerId],   // players who sat out last round
 *   pairingHistory: Set of "id1-id2" strings (sorted),
 * }
 */

/** Create the initial state (before round 1) */
export function createKotcState({ players, numCourts }) {
  return {
    players: players.map(p => ({ id: p.id, name: p.name || p.full_name || p.id })),
    numCourts,
    rounds: [],
    results: {},
    sitOutCounts: Object.fromEntries(players.map(p => [p.id, 0])),
    recentBench: [],
    pairingHistory: new Set(),
  };
}

/** How many players are active (on courts) per round */
function activeSpotsPerRound(numCourts) {
  return numCourts * 4;
}

/**
 * Pick bench players fairly.
 * Priority: fewest sit-outs → then those who sat out most recently go back in first.
 */
function pickBench(playerIds, numBench, sitOutCounts, recentBench) {
  if (numBench <= 0) return [];

  const sorted = [...playerIds].sort((a, b) => {
    const diff = sitOutCounts[a] - sitOutCounts[b];
    if (diff !== 0) return diff; // fewer sit-outs → bench them more
    // tie-break: if they sat out recently, prioritise them back into play (i.e. don't bench them again)
    const aRecent = recentBench.includes(a) ? 1 : 0;
    const bRecent = recentBench.includes(b) ? 1 : 0;
    return aRecent - bRecent; // recent benchers less likely to bench again
  });

  return sorted.slice(0, numBench);
}

/** Pair string for history tracking */
function pairKey(a, b) {
  return [a, b].sort().join('|');
}

/**
 * Score a potential team pairing — lower is better (prefer novel pairs).
 */
function teamScore(a, b, history) {
  return history.has(pairKey(a, b)) ? 1 : 0;
}

/**
 * Build teams for `numCourts` courts from `activePlayers` array.
 * Strategy: shuffle, then try to minimise repeated pairings.
 */
function buildTeams(activePlayers, numCourts, pairingHistory) {
  // Shuffle
  const pool = [...activePlayers];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const courts = [];
  for (let c = 0; c < numCourts; c++) {
    const four = pool.slice(c * 4, c * 4 + 4);
    if (four.length < 4) break;

    // Try all 3 possible pairings for these 4 players, pick best
    const pairings = [
      [[four[0], four[1]], [four[2], four[3]]],
      [[four[0], four[2]], [four[1], four[3]]],
      [[four[0], four[3]], [four[1], four[2]]],
    ];

    const scored = pairings.map(([tA, tB]) => ({
      tA,
      tB,
      score: teamScore(tA[0], tA[1], pairingHistory) +
             teamScore(tB[0], tB[1], pairingHistory),
    }));
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0];

    courts.push({
      courtNumber: c + 1,
      teamA: best.tA,
      teamB: best.tB,
    });
  }

  return courts;
}

/**
 * Generate round 1 (no prior results needed).
 * Players seeded by skill_rating if available.
 */
export function generateRound1(state) {
  const { players, numCourts, pairingHistory, sitOutCounts, recentBench } = state;
  const activeSpots = activeSpotsPerRound(numCourts);
  const numBench = Math.max(0, players.length - activeSpots);

  // Seed by rating initially (highest rated → highest courts)
  const ordered = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const orderedIds = ordered.map(p => p.id);

  const benchIds = pickBench(orderedIds, numBench, sitOutCounts, recentBench);
  const activeIds = orderedIds.filter(id => !benchIds.includes(id));

  const courts = buildTeams(activeIds, numCourts, pairingHistory);

  return {
    roundNumber: 1,
    courts,
    bench: benchIds,
  };
}

/**
 * Process results for a round and generate the next round.
 *
 * results = { [courtNumber]: 'A' | 'B' }
 *
 * Movement rules:
 *  Winner: move UP one court (Court 1 stays), partners split
 *  Loser:  move DOWN one court (bottom court stays), partners split
 */
export function generateNextRound(state, roundNumber, results) {
  const { players, numCourts, pairingHistory, sitOutCounts, recentBench } = state;
  const currentRound = state.rounds[roundNumber - 1];
  if (!currentRound) throw new Error('Round not found');

  const activeSpots = activeSpotsPerRound(numCourts);
  const totalPlayers = players.length;
  const numBench = Math.max(0, totalPlayers - activeSpots);

  // Track new pairing history
  const newHistory = new Set(pairingHistory);
  currentRound.courts.forEach(court => {
    newHistory.add(pairKey(court.teamA[0], court.teamA[1]));
    newHistory.add(pairKey(court.teamB[0], court.teamB[1]));
  });

  // Update sit-out counts for current bench players
  const newSitOutCounts = { ...sitOutCounts };
  currentRound.bench.forEach(id => { newSitOutCounts[id] = (newSitOutCounts[id] || 0) + 1; });

  // Determine where each player moves
  // courtAssignment[courtNumber] = { winners: [id,id], losers: [id,id] }
  const movements = {}; // courtNumber => { winnerCourt, loserCourt, winners, losers }

  currentRound.courts.forEach(court => {
    const { courtNumber, teamA, teamB } = court;
    const winner = results[courtNumber];
    const [winners, losers] = winner === 'A' ? [teamA, teamB] : [teamB, teamA];

    const winnerCourt = courtNumber === 1 ? 1 : courtNumber - 1;
    const loserCourt = courtNumber === numCourts ? numCourts : courtNumber + 1;

    movements[courtNumber] = { winners, losers, winnerCourt, loserCourt };
  });

  // Build a pool per target court: [playerId, ...]
  const courtPools = {};
  for (let c = 1; c <= numCourts; c++) courtPools[c] = [];

  Object.values(movements).forEach(({ winners, losers, winnerCourt, loserCourt }) => {
    winners.forEach(id => courtPools[winnerCourt].push(id));
    losers.forEach(id => courtPools[loserCourt].push(id));
  });

  // Re-integrate bench players — put them on the lowest courts first
  const returningBench = currentRound.bench;
  const allPooledIds = Object.values(courtPools).flat();
  const returningFiltered = returningBench.filter(id => !allPooledIds.includes(id));

  // Pick new bench from ALL available players (pooled + returning bench)
  const allAvailable = [...allPooledIds, ...returningFiltered];

  // Also add any player not currently in a court pool (edge case: player added late)
  players.forEach(p => {
    if (!allAvailable.includes(p.id)) allAvailable.push(p.id);
  });

  const newBench = pickBench(allAvailable, numBench, newSitOutCounts, currentRound.bench);
  const activeIds = allAvailable.filter(id => !newBench.includes(id));

  // Now assign activeIds to courts. 
  // We try to respect the movement-based court pools, but if a court is over/under-stocked
  // we balance them (each court needs exactly 4 players).
  const finalCourtAssignments = balanceCourts(courtPools, newBench, numCourts, activeIds);

  // Build teams per court
  const courts = finalCourtAssignments.map((ids, idx) => {
    const courtNumber = idx + 1;
    const [tA, tB] = buildOptimalTeams(ids, newHistory);
    return { courtNumber, teamA: tA, teamB: tB };
  });

  // Update history with new pairs
  courts.forEach(court => {
    newHistory.add(pairKey(court.teamA[0], court.teamA[1]));
    newHistory.add(pairKey(court.teamB[0], court.teamB[1]));
  });

  return {
    nextRound: {
      roundNumber: roundNumber + 1,
      courts,
      bench: newBench,
    },
    updatedState: {
      ...state,
      pairingHistory: newHistory,
      sitOutCounts: newSitOutCounts,
      recentBench: currentRound.bench,
    },
  };
}

/** Ensure each court has exactly 4 players by redistributing overflows */
function balanceCourts(courtPools, bench, numCourts, activeIds) {
  // Simple: just assign activeIds in order to courts (4 per court)
  // They've already been movement-ordered from low to high court
  const sorted = [...activeIds];
  const result = [];
  for (let c = 0; c < numCourts; c++) {
    result.push(sorted.slice(c * 4, c * 4 + 4));
  }
  return result;
}

/** Given exactly 4 player ids, pick the best team split */
function buildOptimalTeams(ids, history) {
  if (ids.length < 4) {
    // Pad if needed (shouldn't happen in normal flow)
    return [ids.slice(0, 2), ids.slice(2, 4)];
  }
  const pairings = [
    [[ids[0], ids[1]], [ids[2], ids[3]]],
    [[ids[0], ids[2]], [ids[1], ids[3]]],
    [[ids[0], ids[3]], [ids[1], ids[2]]],
  ];
  const scored = pairings.map(([tA, tB]) => ({
    tA, tB,
    score: teamScore(tA[0], tA[1], history) + teamScore(tB[0], tB[1], history),
  }));
  scored.sort((a, b) => a.score - b.score);
  return [scored[0].tA, scored[0].tB];
}

/** Compute leaderboard from results history */
export function computeKotcLeaderboard(state) {
  const scores = {};
  state.players.forEach(p => {
    scores[p.id] = { id: p.id, name: p.name, wins: 0, losses: 0, courtPoints: 0, sitOuts: state.sitOutCounts[p.id] || 0 };
  });

  state.rounds.forEach(round => {
    const roundResults = state.results[round.roundNumber] || {};
    round.courts.forEach(court => {
      const result = roundResults[court.courtNumber];
      if (!result) return;
      const [winners, losers] = result === 'A' ? [court.teamA, court.teamB] : [court.teamB, court.teamA];
      winners.forEach(id => {
        if (scores[id]) {
          scores[id].wins++;
          // Court 1 wins worth more
          scores[id].courtPoints += (5 - court.courtNumber);
        }
      });
      losers.forEach(id => {
        if (scores[id]) scores[id].losses++;
      });
    });
  });

  return Object.values(scores).sort((a, b) =>
    b.wins - a.wins || b.courtPoints - a.courtPoints || a.losses - b.losses
  );
}