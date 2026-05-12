/**
 * King of the Court — Result-Driven Rotation Engine
 *
 * State shape (kotcState):
 * {
 *   players: [{ id, name, rating }],
 *   numCourts: number,
 *   rounds: [{
 *     roundNumber,
 *     courts: [{ courtNumber, teamA: [id,id], teamB: [id,id] }],
 *     bench: [id],
 *   }],
 *   results: { [roundNumber]: { [courtNumber]: 'A'|'B' } },
 *   sitOutCounts: { [playerId]: number },
 *   recentBench: [playerId],
 *   pairingHistory: string[],  // serialised as array, used as Set internally
 * }
 *
 * Movement rules:
 *   Winners move UP one court (Court 1 winners stay on Court 1)
 *   Losers  move DOWN one court (Bottom court losers stay on bottom)
 *   All partnerships dissolved — new pairings built from court pools
 */

/** Create the initial state (before round 1) */
export function createKotcState({ players, numCourts }) {
  return {
    players: players.map(p => ({
      id: p.id,
      name: p.name || p.full_name || String(p.id),
      rating: p.rating || p.skill_rating || 3.0,
    })),
    numCourts,
    rounds: [],
    results: {},
    sitOutCounts: Object.fromEntries(players.map(p => [p.id, 0])),
    recentBench: [],
    pairingHistory: [],
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function hasPaired(a, b, historySet) {
  return historySet.has(pairKey(a, b));
}

/** Shuffle array in-place (Fisher–Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick `numBench` players to sit out.
 * Priority: fewest sit-outs → don't bench consecutively.
 */
function pickBench(playerIds, numBench, sitOutCounts, recentBench) {
  if (numBench <= 0) return [];
  const sorted = [...playerIds].sort((a, b) => {
    const diff = (sitOutCounts[a] || 0) - (sitOutCounts[b] || 0);
    if (diff !== 0) return diff;
    // tie-break: avoid benching someone who just sat out
    const aRecent = recentBench.includes(a) ? 1 : 0;
    const bRecent = recentBench.includes(b) ? 1 : 0;
    return aRecent - bRecent;
  });
  return sorted.slice(0, numBench);
}

/**
 * Given exactly 4 player ids, return the best [teamA, teamB] split
 * that minimises repeated pairings.
 */
function bestTeamSplit(ids, historySet) {
  const [a, b, c, d] = ids;
  const options = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ];
  const scored = options.map(([tA, tB]) => ({
    tA, tB,
    score: (hasPaired(tA[0], tA[1], historySet) ? 1 : 0) +
           (hasPaired(tB[0], tB[1], historySet) ? 1 : 0),
  }));
  scored.sort((a, b) => a.score - b.score);
  return [scored[0].tA, scored[0].tB];
}

// ─── Round 1 ─────────────────────────────────────────────────────────────────

/**
 * Generate Round 1.
 * Players seeded by rating — highest rated on highest courts.
 */
export function generateRound1(state) {
  const { players, numCourts, sitOutCounts, recentBench } = state;
  const historySet = new Set(state.pairingHistory);
  const activeSpots = numCourts * 4;
  const numBench = Math.max(0, players.length - activeSpots);

  // Sort by rating desc for initial seeding
  const ordered = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const orderedIds = ordered.map(p => p.id);

  const benchIds = pickBench(orderedIds, numBench, sitOutCounts, recentBench);
  const activeIds = orderedIds.filter(id => !benchIds.includes(id));

  // Assign to courts: first 4 → Court 1 (King), next 4 → Court 2, etc.
  const courts = [];
  for (let c = 0; c < numCourts; c++) {
    const four = activeIds.slice(c * 4, c * 4 + 4);
    if (four.length < 4) break;
    const [teamA, teamB] = bestTeamSplit(four, historySet);
    courts.push({ courtNumber: c + 1, teamA, teamB });
  }

  return { roundNumber: 1, courts, bench: benchIds };
}

// ─── Next Round ───────────────────────────────────────────────────────────────

/**
 * Generate next round from completed results.
 *
 * Returns { nextRound, updatedState, movements }
 * movements = [{ player, fromCourt, toCourt, direction }] for UI summary
 */
export function generateNextRound(state, roundNumber, results) {
  const { players, numCourts, sitOutCounts, recentBench } = state;
  const historySet = new Set(state.pairingHistory);
  const currentRound = state.rounds[roundNumber - 1];
  if (!currentRound) throw new Error('Round not found: ' + roundNumber);

  const activeSpots = numCourts * 4;
  const numBench = Math.max(0, players.length - activeSpots);

  // 1. Record pairings from completed round
  const newHistorySet = new Set(historySet);
  currentRound.courts.forEach(court => {
    newHistorySet.add(pairKey(court.teamA[0], court.teamA[1]));
    newHistorySet.add(pairKey(court.teamB[0], court.teamB[1]));
  });

  // 2. Update sit-out counts for benched players
  const newSitOutCounts = { ...sitOutCounts };
  currentRound.bench.forEach(id => {
    newSitOutCounts[id] = (newSitOutCounts[id] || 0) + 1;
  });

  // 3. Apply movement rules — build destination court pools
  //    Court pools keyed by destination court number
  const courtPools = {};
  for (let c = 1; c <= numCourts; c++) courtPools[c] = [];

  const movements = []; // for UI summary

  currentRound.courts.forEach(court => {
    const { courtNumber, teamA, teamB } = court;
    const winSide = results[courtNumber];
    if (!winSide) return; // shouldn't happen but be safe

    const winners = winSide === 'A' ? teamA : teamB;
    const losers  = winSide === 'A' ? teamB : teamA;

    // Winners move UP (lower court number), Court 1 winners stay
    const winnerDest = Math.max(1, courtNumber - 1);
    // Losers move DOWN (higher court number), bottom court losers stay
    const loserDest  = Math.min(numCourts, courtNumber + 1);

    winners.forEach(id => {
      courtPools[winnerDest].push(id);
      movements.push({
        playerId: id,
        fromCourt: courtNumber,
        toCourt: winnerDest,
        direction: winnerDest < courtNumber ? 'up' : 'stay',
        result: 'win',
      });
    });

    losers.forEach(id => {
      courtPools[loserDest].push(id);
      movements.push({
        playerId: id,
        fromCourt: courtNumber,
        toCourt: loserDest,
        direction: loserDest > courtNumber ? 'down' : 'stay',
        result: 'loss',
      });
    });
  });

  // 4. Return bench players to lowest available courts
  const returningBench = currentRound.bench.filter(id => {
    return !Object.values(courtPools).flat().includes(id);
  });

  // 5. Build full available pool and pick new bench
  const allAvailable = [...Object.values(courtPools).flat(), ...returningBench];
  // Catch any player not yet in pool (edge case)
  players.forEach(p => {
    if (!allAvailable.includes(p.id)) allAvailable.push(p.id);
  });

  const newBench = pickBench(allAvailable, numBench, newSitOutCounts, currentRound.bench);
  const activeIds = allAvailable.filter(id => !newBench.includes(id));

  newBench.forEach(id => {
    movements.push({
      playerId: id,
      fromCourt: null,
      toCourt: null,
      direction: 'bench',
      result: 'bench',
    });
  });

  // 6. Assign active players to courts respecting movement pools.
  //    Each court needs exactly 4. We fill courts top-down from movement pool,
  //    topping up with bench-returners and overflow from adjacent courts.
  const finalAssignments = assignToCourts(courtPools, newBench, activeIds, numCourts);

  // 7. Build optimal team pairings per court
  const courts = finalAssignments.map((ids, idx) => {
    const courtNumber = idx + 1;
    const [teamA, teamB] = bestTeamSplit(ids, newHistorySet);
    // Record new pairs in history
    newHistorySet.add(pairKey(teamA[0], teamA[1]));
    newHistorySet.add(pairKey(teamB[0], teamB[1]));
    return { courtNumber, teamA, teamB };
  });

  const nextRound = {
    roundNumber: roundNumber + 1,
    courts,
    bench: newBench,
  };

  const updatedState = {
    ...state,
    pairingHistory: [...newHistorySet],
    sitOutCounts: newSitOutCounts,
    recentBench: currentRound.bench,
    results: { ...state.results, [roundNumber]: results },
  };

  return { nextRound, updatedState, movements };
}

/**
 * Assign active players to courts (4 per court), respecting movement pools.
 * Courts with too many players spill overflow to adjacent courts.
 * Courts with too few pull from returning bench players.
 */
function assignToCourts(courtPools, newBench, activeIds, numCourts) {
  // Start from movement pools, excluding newly-benched players
  const pools = {};
  for (let c = 1; c <= numCourts; c++) {
    pools[c] = (courtPools[c] || []).filter(id => !newBench.includes(id));
  }

  // Players not in any pool yet (bench returners not yet assigned)
  const assigned = new Set(Object.values(pools).flat());
  const unassigned = activeIds.filter(id => !assigned.has(id));

  // Distribute unassigned to courts with fewest players, starting from lowest courts
  const courtOrder = Array.from({ length: numCourts }, (_, i) => i + 1).sort(
    (a, b) => pools[a].length - pools[b].length
  );
  let ui = 0;
  for (const c of courtOrder) {
    while (pools[c].length < 4 && ui < unassigned.length) {
      pools[c].push(unassigned[ui++]);
    }
  }

  // If still short (shouldn't happen), add remaining unassigned anywhere
  for (let c = 1; c <= numCourts; c++) {
    while (pools[c].length < 4 && ui < unassigned.length) {
      pools[c].push(unassigned[ui++]);
    }
  }

  // Handle overflow: courts with >4 players spill to adjacent courts
  for (let c = 1; c <= numCourts; c++) {
    while (pools[c].length > 4) {
      const extra = pools[c].pop();
      // Try to push to court below (higher number), then above
      const dest = c < numCourts ? c + 1 : c - 1;
      if (dest >= 1 && dest <= numCourts) pools[dest].push(extra);
    }
  }

  // Return as array indexed by court (0-based → courtNumber = idx+1)
  return Array.from({ length: numCourts }, (_, i) => pools[i + 1] || []);
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function computeKotcLeaderboard(state) {
  const scores = {};
  state.players.forEach(p => {
    scores[p.id] = {
      id: p.id,
      name: p.name,
      wins: 0,
      losses: 0,
      courtPoints: 0,
      sitOuts: state.sitOutCounts?.[p.id] || 0,
    };
  });

  state.rounds.forEach(round => {
    const roundResults = state.results?.[round.roundNumber] || {};
    round.courts.forEach(court => {
      const result = roundResults[court.courtNumber];
      if (!result) return;
      const winners = result === 'A' ? court.teamA : court.teamB;
      const losers  = result === 'A' ? court.teamB : court.teamA;

      winners.forEach(id => {
        if (scores[id]) {
          scores[id].wins++;
          // Court 1 wins worth more (King Court bonus)
          scores[id].courtPoints += Math.max(1, state.numCourts + 1 - court.courtNumber);
        }
      });
      losers.forEach(id => {
        if (scores[id]) scores[id].losses++;
      });
    });
  });

  return Object.values(scores).sort(
    (a, b) => b.wins - a.wins || b.courtPoints - a.courtPoints || a.losses - b.losses
  );
}