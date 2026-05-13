/**
 * King of the Court — Split-and-Cross Partner Rotation Engine
 *
 * Core rule (user specification):
 *   After every round:
 *   - Winners from adjacent courts SPLIT from their partner and CROSS-PAIR.
 *     e.g. Court 1 winner A1+A2 beat, Court 2 winner C1+C2:
 *       Next round Court 1: A1+C1 vs A2+C2  (or A1+C2 vs A2+C1 — whichever is fresher)
 *   - Losers from adjacent courts do the same, moving DOWN.
 *   - Top-court winners stay but still cross-pair among themselves.
 *   - Bottom-court losers stay but still cross-pair among themselves.
 *   - Maximum partner variety enforced via pairingHistory.
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
 *   pairingHistory: string[],
 * }
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
 * Score a pairing option: lower is better.
 * Counts how many pairs have already played together.
 */
function pairScore(teamA, teamB, historySet) {
  return (hasPaired(teamA[0], teamA[1], historySet) ? 1 : 0) +
         (hasPaired(teamB[0], teamB[1], historySet) ? 1 : 0);
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
  const scored = options.map(([tA, tB]) => ({ tA, tB, score: pairScore(tA, tB, historySet) }));
  scored.sort((a, b) => a.score - b.score);
  return [scored[0].tA, scored[0].tB];
}

/**
 * Cross-pair two pairs of players (4 total) using split-and-cross logic.
 *
 * Given pair1 = [p1a, p1b] and pair2 = [p2a, p2b] (two winning or two losing pairs
 * that are merging into one court next round), we must split BOTH pairs and cross.
 *
 * Valid cross-pairings:
 *   Option 1: [p1a, p2a] vs [p1b, p2b]
 *   Option 2: [p1a, p2b] vs [p1b, p2a]
 *
 * We choose whichever minimises repeated pairings.
 * Note: [p1a, p1b] together again is FORBIDDEN (same-partner constraint).
 */
function crossPair(pair1, pair2, historySet) {
  const [p1a, p1b] = pair1;
  const [p2a, p2b] = pair2;

  const opt1 = { tA: [p1a, p2a], tB: [p1b, p2b], score: pairScore([p1a, p2a], [p1b, p2b], historySet) };
  const opt2 = { tA: [p1a, p2b], tB: [p1b, p2a], score: pairScore([p1a, p2b], [p1b, p2a], historySet) };

  // Tiebreak: if equal score, pick randomly for variety
  if (opt1.score < opt2.score) return [opt1.tA, opt1.tB];
  if (opt2.score < opt1.score) return [opt2.tA, opt2.tB];
  // Equal — shuffle to get variety over time
  const choice = Math.random() < 0.5 ? opt1 : opt2;
  return [choice.tA, choice.tB];
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
    const aRecent = recentBench.includes(a) ? 1 : 0;
    const bRecent = recentBench.includes(b) ? 1 : 0;
    return aRecent - bRecent;
  });
  return sorted.slice(0, numBench);
}

// ─── Round 1 ─────────────────────────────────────────────────────────────────

/**
 * Generate Round 1.
 * Players seeded by rating — highest rated on highest courts (Court 1 = King Court).
 */
export function generateRound1(state) {
  const { players, numCourts, sitOutCounts, recentBench } = state;
  const historySet = new Set(state.pairingHistory);
  const activeSpots = numCourts * 4;
  const numBench = Math.max(0, players.length - activeSpots);

  const ordered = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const orderedIds = ordered.map(p => p.id);

  const benchIds = pickBench(orderedIds, numBench, sitOutCounts, recentBench);
  const activeIds = orderedIds.filter(id => !benchIds.includes(id));

  const courts = [];
  for (let c = 0; c < numCourts; c++) {
    const four = activeIds.slice(c * 4, c * 4 + 4);
    if (four.length < 4) break;
    const [teamA, teamB] = bestTeamSplit(four, historySet);
    courts.push({ courtNumber: c + 1, teamA, teamB });
  }

  return { roundNumber: 1, courts, bench: benchIds };
}

// ─── Next Round — Split-and-Cross Engine ─────────────────────────────────────

/**
 * Generate next round using split-and-cross partner rotation.
 *
 * Returns { nextRound, updatedState, movements }
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

  // 2. Update sit-out counts
  const newSitOutCounts = { ...sitOutCounts };
  currentRound.bench.forEach(id => {
    newSitOutCounts[id] = (newSitOutCounts[id] || 0) + 1;
  });

  // 3. Extract winner-pair and loser-pair per court
  //    winnerPairs[courtNum] = [id, id]  (the winning team)
  //    loserPairs[courtNum]  = [id, id]  (the losing team)
  const winnerPairs = {};
  const loserPairs = {};
  const movements = [];

  currentRound.courts.forEach(court => {
    const { courtNumber, teamA, teamB } = court;
    const winSide = results[courtNumber];
    if (!winSide) return;

    const winners = winSide === 'A' ? [...teamA] : [...teamB];
    const losers  = winSide === 'A' ? [...teamB] : [...teamA];

    winnerPairs[courtNumber] = winners;
    loserPairs[courtNumber]  = losers;

    // Record movements (individual players)
    const winnerDest = Math.max(1, courtNumber - 1);
    const loserDest  = Math.min(numCourts, courtNumber + 1);

    winners.forEach(id => {
      movements.push({
        playerId: id,
        fromCourt: courtNumber,
        toCourt: winnerDest,
        direction: winnerDest < courtNumber ? 'up' : 'stay',
        result: 'win',
        prevPartner: winners.find(x => x !== id),
      });
    });
    losers.forEach(id => {
      movements.push({
        playerId: id,
        fromCourt: courtNumber,
        toCourt: loserDest,
        direction: loserDest > courtNumber ? 'down' : 'stay',
        result: 'loss',
        prevPartner: losers.find(x => x !== id),
      });
    });
  });

  // 4. Build next-round courts using split-and-cross
  //
  //   Court 1 next round: cross-pair winners from Court 1 + winners from Court 2
  //   Court 2 next round: cross-pair winners from Court 3 + winners from Court 4  (if 4-court)
  //                       OR: cross-pair losers from Court 1 + losers from Court 2
  //   etc.
  //
  //   General rule for N courts:
  //     Next Court k collects: winner-pair from Court k  +  winner-pair from Court k+1
  //     (Court k winner pair moves UP to Court k-1, which collects them alongside Court k-1 winners)
  //
  //   Specifically:
  //     Destination court d (1..N) receives:
  //       - Winners from court d   (stay, direction='stay' for Court 1)
  //       - Winners from court d+1 (moved up)
  //     But for bottom court N:
  //       - Losers from court N (stay)
  //       - Losers from court N-1 (moved down)
  //
  //   For odd-court counts the middle court gets a mix.
  //
  //   We pair courts in order: (1,2), (3,4), ... for winner destinations
  //   and (N-1,N), (N-3,N-2), ... for loser destinations.
  //   For the middle court in odd-count, winners from middle go up, losers go down,
  //   and we fill with the remaining pool.

  const destCourts = {};
  for (let c = 1; c <= numCourts; c++) destCourts[c] = { pair1: null, pair2: null };

  // Winners: group court pairs top-down
  //   Court 1 destination ← winners of Court 1 + winners of Court 2
  //   Court 2 destination ← winners of Court 3 + winners of Court 4
  //   etc.
  const winnerCourtNums = Object.keys(winnerPairs).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < winnerCourtNums.length; i += 2) {
    const destCourt = Math.floor(i / 2) + 1; // destinations: 1, 2, 3...
    const c1 = winnerCourtNums[i];
    const c2 = winnerCourtNums[i + 1];
    if (c2 !== undefined) {
      destCourts[destCourt].pair1 = winnerPairs[c1];
      destCourts[destCourt].pair2 = winnerPairs[c2];
    } else {
      // Odd court out — put winner pair into this court's pair1, handle below
      destCourts[destCourt].pair1 = winnerPairs[c1];
    }
  }

  // Losers: group court pairs bottom-up
  //   Bottom court destination ← losers of Court N + losers of Court N-1
  //   Next-to-bottom destination ← losers of Court N-2 + losers of Court N-3
  //   etc.
  const loserCourtNums = Object.keys(loserPairs).map(Number).sort((a, b) => b - a);
  const winnerDestCount = Math.ceil(winnerCourtNums.length / 2);

  for (let i = 0; i < loserCourtNums.length; i += 2) {
    const destCourt = numCourts - Math.floor(i / 2); // destinations: N, N-1, N-2...
    const c1 = loserCourtNums[i];
    const c2 = loserCourtNums[i + 1];
    if (c2 !== undefined) {
      destCourts[destCourt].pair1 = loserPairs[c1];
      destCourts[destCourt].pair2 = loserPairs[c2];
    } else {
      destCourts[destCourt].pair1 = loserPairs[c1];
    }
  }

  // 5. Handle the middle court (odd numCourts) or any courts not yet filled
  //    In this case we have one winner pair and one loser pair on the same court
  for (let c = 1; c <= numCourts; c++) {
    const slot = destCourts[c];
    if (slot.pair1 && !slot.pair2) {
      // Find an unpaired pair to combine with
      // Look for courts that have pair2 = null AND pair1 set in the opposite direction
      // Actually for even courts this shouldn't happen; for odd it's the middle court
      // Middle court: assign the leftover winner pair + leftover loser pair
      // (already the case since we filled top-down winners and bottom-up losers)
      // No action needed — handle in step 6 below
    }
  }

  // 6. Build final courts using cross-pair for fully paired courts,
  //    or bestTeamSplit for courts that only have one pair (middle of odd)
  //    or any fallback needed.
  const newCourts = [];
  const benchedIds = new Set();

  // Collect all active players for overflow handling
  const allCourtPlayers = new Set();
  for (let c = 1; c <= numCourts; c++) {
    const { pair1, pair2 } = destCourts[c];
    if (pair1) pair1.forEach(id => allCourtPlayers.add(id));
    if (pair2) pair2.forEach(id => allCourtPlayers.add(id));
  }

  // Bench returners not yet assigned to a court
  const returningBench = currentRound.bench.filter(id => !allCourtPlayers.has(id));
  const allAvailable = [...allCourtPlayers, ...returningBench];
  players.forEach(p => { if (!allAvailable.includes(p.id)) allAvailable.push(p.id); });

  const newBench = pickBench(allAvailable, numBench, newSitOutCounts, currentRound.bench);
  newBench.forEach(id => benchedIds.add(id));

  newBench.forEach(id => {
    movements.push({ playerId: id, fromCourt: null, toCourt: null, direction: 'bench', result: 'bench' });
  });

  // Remove benched players from destCourts
  for (let c = 1; c <= numCourts; c++) {
    const slot = destCourts[c];
    if (slot.pair1) slot.pair1 = slot.pair1.filter(id => !benchedIds.has(id));
    if (slot.pair2) slot.pair2 = slot.pair2.filter(id => !benchedIds.has(id));
    // If a pair is now empty, null it
    if (slot.pair1 && slot.pair1.length === 0) slot.pair1 = null;
    if (slot.pair2 && slot.pair2.length === 0) slot.pair2 = null;
  }

  // Build courts
  const usedInCourt = new Set([...benchedIds]);

  for (let c = 1; c <= numCourts; c++) {
    const slot = destCourts[c];
    let pair1 = (slot.pair1 || []).filter(id => !usedInCourt.has(id));
    let pair2 = (slot.pair2 || []).filter(id => !usedInCourt.has(id));

    // Pad pairs to 2 if needed (e.g. if a benched player was in the pair)
    const allActive = allAvailable.filter(id => !usedInCourt.has(id) && !benchedIds.has(id));
    while (pair1.length < 2 && allActive.length > 0) { pair1.push(allActive.shift()); }
    while (pair2.length < 2 && allActive.length > 0) { pair2.push(allActive.shift()); }

    if (pair1.length === 2 && pair2.length === 2) {
      // Full cross-pair: enforce split-and-cross
      const [teamA, teamB] = crossPair(pair1, pair2, newHistorySet);
      newHistorySet.add(pairKey(teamA[0], teamA[1]));
      newHistorySet.add(pairKey(teamB[0], teamB[1]));
      newCourts.push({ courtNumber: c, teamA, teamB });
      [teamA, teamB].flat().forEach(id => usedInCourt.add(id));
    } else {
      // Fallback: gather whatever 4 we can
      const four = [...new Set([...pair1, ...pair2])].slice(0, 4);
      if (four.length === 4) {
        const [teamA, teamB] = bestTeamSplit(four, newHistorySet);
        newHistorySet.add(pairKey(teamA[0], teamA[1]));
        newHistorySet.add(pairKey(teamB[0], teamB[1]));
        newCourts.push({ courtNumber: c, teamA, teamB });
        four.forEach(id => usedInCourt.add(id));
      }
    }
  }

  // Sort courts by number
  newCourts.sort((a, b) => a.courtNumber - b.courtNumber);

  const nextRound = {
    roundNumber: roundNumber + 1,
    courts: newCourts,
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