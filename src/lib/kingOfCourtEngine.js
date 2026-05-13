/**
 * King of the Court — Correct Split-and-Cross Rotation Engine
 *
 * Movement rules (per round):
 *   - Winners move UP one court (lower court number). Court 1 winners stay on Court 1.
 *   - Losers move DOWN one court (higher court number). Court N losers stay on Court N.
 *   - After moving, EVERY pair splits — no two players remain partners.
 *
 * Court formation next round:
 *   Court 1 next ← winners of Court 1 (stayed) + winners of Court 2 (moved up)
 *   Court 2 next ← winners of Court 3 (moved up) + losers of Court 1 (moved down)
 *   Court 3 next ← winners of Court 4 (moved up) + losers of Court 2 (moved down)
 *   Court N next ← losers of Court N-1 (moved down) + losers of Court N (stayed)
 *
 *   General: destination court d receives exactly 2 incoming pairs (one from each adjacent
 *   contributing court), which then CROSS-PAIR: each player from pair1 gets a NEW partner
 *   from pair2 (never their old partner again).
 *
 * Cross-pair rule for 4 players from pair1=[A,B] and pair2=[C,D]:
 *   Option 1: teamA=[A,C] vs teamB=[B,D]
 *   Option 2: teamA=[A,D] vs teamB=[B,C]
 *   (NOT [A,B] vs [C,D] — that keeps old pairs intact)
 *   We pick whichever option gives the most new partnerships.
 *
 * State shape:
 * {
 *   players: [{ id, name, rating }],
 *   numCourts: number,
 *   rounds: [{ roundNumber, courts: [{ courtNumber, teamA:[id,id], teamB:[id,id] }], bench:[id] }],
 *   results: { [roundNumber]: { [courtNumber]: 'A'|'B' } },
 *   sitOutCounts: { [playerId]: number },
 *   recentBench: [playerId],
 *   pairingHistory: string[],
 * }
 */

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

function pairScore(tA, tB, historySet) {
  return (hasPaired(tA[0], tA[1], historySet) ? 1 : 0) +
         (hasPaired(tB[0], tB[1], historySet) ? 1 : 0);
}

/**
 * Best split of exactly 4 ids into 2 teams — minimises repeat pairings.
 * All 3 possible splits are tried.
 */
function bestTeamSplit(ids, historySet) {
  const [a, b, c, d] = ids;
  const opts = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ].map(([tA, tB]) => ({ tA, tB, score: pairScore(tA, tB, historySet) }));
  opts.sort((x, y) => x.score - y.score);
  return [opts[0].tA, opts[0].tB];
}

/**
 * Cross-pair: given pair1=[A,B] and pair2=[C,D], produce teams where
 * A is never with B and C is never with D (i.e. old partners always split).
 * Only two valid options: [A,C]+[B,D]  or  [A,D]+[B,C].
 * Pick the one with fewer repeat pairings; randomise on equal.
 */
function crossPair(pair1, pair2, historySet) {
  const [A, B] = pair1;
  const [C, D] = pair2;
  const opt1 = { tA: [A, C], tB: [B, D], score: pairScore([A, C], [B, D], historySet) };
  const opt2 = { tA: [A, D], tB: [B, C], score: pairScore([A, D], [B, C], historySet) };
  if (opt1.score < opt2.score) return [opt1.tA, opt1.tB];
  if (opt2.score < opt1.score) return [opt2.tA, opt2.tB];
  const choice = Math.random() < 0.5 ? opt1 : opt2;
  return [choice.tA, choice.tB];
}

function pickBench(playerIds, numBench, sitOutCounts, recentBench) {
  if (numBench <= 0) return [];
  const sorted = [...playerIds].sort((a, b) => {
    const diff = (sitOutCounts[a] || 0) - (sitOutCounts[b] || 0);
    if (diff !== 0) return diff;
    return (recentBench.includes(a) ? 1 : 0) - (recentBench.includes(b) ? 1 : 0);
  });
  return sorted.slice(0, numBench);
}

// ─── Round 1 ──────────────────────────────────────────────────────────────────

export function generateRound1(state) {
  const { players, numCourts, sitOutCounts, recentBench } = state;
  const historySet = new Set(state.pairingHistory);
  const numBench = Math.max(0, players.length - numCourts * 4);

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

// ─── Next Round ───────────────────────────────────────────────────────────────

/**
 * Correct destination mapping for N courts.
 *
 * For each destination court d (1..N), determine which two pairs arrive there:
 *
 *   Court 1: winners(1) stayed  +  winners(2) moved up
 *   Court 2: winners(3) moved up  +  losers(1) moved down      [if N>=3, else losers(1)+losers(2)]
 *   Court k (2..N-1): winners(k+1) moved up  +  losers(k-1) moved down
 *   Court N: losers(N-1) moved down  +  losers(N) stayed
 *
 * Special cases:
 *   N=2: Court 1 ← winners(1)+winners(2), Court 2 ← losers(1)+losers(2)
 *   N=1: No movement needed, just re-split same 4 players.
 */
function buildDestinationMap(numCourts, winnerPairs, loserPairs) {
  // destMap[courtNumber] = { pairA: [id,id], pairB: [id,id] }
  const destMap = {};

  if (numCourts === 1) {
    // Only one court — re-cross the same players
    const all = [...(winnerPairs[1] || []), ...(loserPairs[1] || [])];
    destMap[1] = { pairA: [all[0], all[1]], pairB: [all[2], all[3]] };
    return destMap;
  }

  if (numCourts === 2) {
    destMap[1] = { pairA: winnerPairs[1] || [], pairB: winnerPairs[2] || [] };
    destMap[2] = { pairA: loserPairs[1]  || [], pairB: loserPairs[2]  || [] };
    return destMap;
  }

  // General case: N >= 3
  for (let d = 1; d <= numCourts; d++) {
    if (d === 1) {
      // Top court: Court 1 winners (stay) + Court 2 winners (move up)
      destMap[d] = { pairA: winnerPairs[1] || [], pairB: winnerPairs[2] || [] };
    } else if (d === numCourts) {
      // Bottom court: Court N-1 losers (move down) + Court N losers (stay)
      destMap[d] = { pairA: loserPairs[numCourts - 1] || [], pairB: loserPairs[numCourts] || [] };
    } else {
      // Middle courts: winners from court d+1 (move up) + losers from court d-1 (move down)
      destMap[d] = { pairA: winnerPairs[d + 1] || [], pairB: loserPairs[d - 1] || [] };
    }
  }

  return destMap;
}

export function generateNextRound(state, roundNumber, results) {
  const { players, numCourts, sitOutCounts, recentBench } = state;
  const historySet = new Set(state.pairingHistory);
  const currentRound = state.rounds[roundNumber - 1];
  if (!currentRound) throw new Error('Round not found: ' + roundNumber);

  const numBench = Math.max(0, players.length - numCourts * 4);

  // 1. Record pairings from this round into history
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

  // 3. Extract winner / loser pairs per court + build movement log
  const winnerPairs = {}; // courtNumber → [id, id]
  const loserPairs  = {};
  const movements   = [];

  currentRound.courts.forEach(({ courtNumber, teamA, teamB }) => {
    const winSide = results[courtNumber];
    if (!winSide) return;

    const winners = [...(winSide === 'A' ? teamA : teamB)];
    const losers  = [...(winSide === 'A' ? teamB : teamA)];

    winnerPairs[courtNumber] = winners;
    loserPairs[courtNumber]  = losers;

    const winDest  = Math.max(1, courtNumber - 1);
    const loseDest = Math.min(numCourts, courtNumber + 1);

    winners.forEach(id => movements.push({
      playerId: id, fromCourt: courtNumber, toCourt: winDest,
      direction: winDest < courtNumber ? 'up' : 'stay', result: 'win',
    }));
    losers.forEach(id => movements.push({
      playerId: id, fromCourt: courtNumber, toCourt: loseDest,
      direction: loseDest > courtNumber ? 'down' : 'stay', result: 'loss',
    }));
  });

  // 4. Build destination map (which 2 pairs go to each court)
  const destMap = buildDestinationMap(numCourts, winnerPairs, loserPairs);

  // 5. Bench selection — from all active players (court players + bench returners)
  const allCourtIds = new Set(Object.values(destMap).flatMap(d => [...d.pairA, ...d.pairB]));
  const returningBench = currentRound.bench.filter(id => !allCourtIds.has(id));
  const allAvailable = [...allCourtIds, ...returningBench];
  players.forEach(p => { if (!allAvailable.includes(p.id)) allAvailable.push(p.id); });

  const newBench = pickBench(allAvailable, numBench, newSitOutCounts, currentRound.bench);
  const benchSet = new Set(newBench);

  newBench.forEach(id => movements.push({
    playerId: id, fromCourt: null, toCourt: null, direction: 'bench', result: 'bench',
  }));

  // 6. Build courts using cross-pair, skipping benched players
  const usedSet = new Set(newBench);
  // Extra unassigned active players (bench returners filling gaps)
  const floaters = allAvailable.filter(id => !benchSet.has(id) && !allCourtIds.has(id));

  const newCourts = [];

  for (let c = 1; c <= numCourts; c++) {
    let pairA = (destMap[c]?.pairA || []).filter(id => !usedSet.has(id));
    let pairB = (destMap[c]?.pairB || []).filter(id => !usedSet.has(id));

    // Fill missing spots from floaters (bench returners)
    while (pairA.length < 2 && floaters.length > 0) pairA.push(floaters.shift());
    while (pairB.length < 2 && floaters.length > 0) pairB.push(floaters.shift());

    // Still short? pull from any remaining available player not yet used
    const remaining = allAvailable.filter(id => !usedSet.has(id) && !pairA.includes(id) && !pairB.includes(id));
    while (pairA.length < 2 && remaining.length > 0) pairA.push(remaining.shift());
    while (pairB.length < 2 && remaining.length > 0) pairB.push(remaining.shift());

    if (pairA.length === 2 && pairB.length === 2) {
      const [teamA, teamB] = crossPair(pairA, pairB, newHistorySet);
      newHistorySet.add(pairKey(teamA[0], teamA[1]));
      newHistorySet.add(pairKey(teamB[0], teamB[1]));
      newCourts.push({ courtNumber: c, teamA, teamB });
      [...teamA, ...teamB].forEach(id => usedSet.add(id));
    } else {
      // Fallback — shouldn't happen in normal play
      const four = [...new Set([...pairA, ...pairB])];
      if (four.length >= 4) {
        const [teamA, teamB] = bestTeamSplit(four.slice(0, 4), newHistorySet);
        newHistorySet.add(pairKey(teamA[0], teamA[1]));
        newHistorySet.add(pairKey(teamB[0], teamB[1]));
        newCourts.push({ courtNumber: c, teamA, teamB });
        four.slice(0, 4).forEach(id => usedSet.add(id));
      }
    }
  }

  newCourts.sort((a, b) => a.courtNumber - b.courtNumber);

  const nextRound = { roundNumber: roundNumber + 1, courts: newCourts, bench: newBench };

  const updatedState = {
    ...state,
    pairingHistory: [...newHistorySet],
    sitOutCounts: newSitOutCounts,
    recentBench: currentRound.bench,
    results: { ...state.results, [roundNumber]: results },
  };

  return { nextRound, updatedState, movements };
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function computeKotcLeaderboard(state) {
  const scores = {};
  state.players.forEach(p => {
    scores[p.id] = { id: p.id, name: p.name, wins: 0, losses: 0, courtPoints: 0, sitOuts: state.sitOutCounts?.[p.id] || 0 };
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
      losers.forEach(id => { if (scores[id]) scores[id].losses++; });
    });
  });

  return Object.values(scores).sort(
    (a, b) => b.wins - a.wins || b.courtPoints - a.courtPoints || a.losses - b.losses
  );
}