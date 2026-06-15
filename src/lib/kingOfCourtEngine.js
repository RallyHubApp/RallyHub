/** King of the Court live-session engine. */

export function autoAllocateCourts(playerCount) {
  if (playerCount <= 6) return 1;
  if (playerCount <= 10) return 2;
  if (playerCount <= 14) return 3;
  return 4;
}

export function createKotcState({ players, numCourts, playerOrder = [] }) {
  return {
    players: players.map(p => ({
      id: p.id,
      name: p.name || p.full_name || String(p.id),
      rating: p.rating || p.skill_rating || 3.0,
    })),
    playerOrder,
    inactivePlayerIds: [],
    numCourts,
    rounds: [],
    results: {},
    sitOutCounts: Object.fromEntries(players.map(p => [p.id, 0])),
    benchQueue: [],
    recentBench: [],
    pairingHistory: [],
  };
}

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

function crossPair(pair1, pair2, historySet) {
  const [A, B] = pair1;
  const [C, D] = pair2;
  const opt1 = { tA: [A, C], tB: [B, D], score: pairScore([A, C], [B, D], historySet) };
  const opt2 = { tA: [A, D], tB: [B, C], score: pairScore([A, D], [B, C], historySet) };
  if (opt1.score < opt2.score) return [opt1.tA, opt1.tB];
  if (opt2.score < opt1.score) return [opt2.tA, opt2.tB];
  return Math.random() < 0.5 ? [opt1.tA, opt1.tB] : [opt2.tA, opt2.tB];
}

function orderedActiveIds(state) {
  const inactive = new Set(state.inactivePlayerIds || []);
  const ids = state.players.filter(p => !inactive.has(p.id)).map(p => p.id);
  if (state.playerOrder?.length) {
    const order = new Map(state.playerOrder.map((id, index) => [id, index]));
    return [...ids].sort((a, b) => (order.get(a) ?? 9999) - (order.get(b) ?? 9999));
  }
  return [...state.players]
    .filter(p => !inactive.has(p.id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .map(p => p.id);
}

function updateBenchQueue(queue = [], newBench = []) {
  const chosen = new Set(newBench);
  return [...queue.filter(id => !chosen.has(id)), ...newBench];
}

function pickBench(playerIds, numBench, sitOutCounts = {}, benchQueue = [], priorityIds = []) {
  if (numBench <= 0) return [];
  const available = [...new Set(playerIds)];
  const priorityRank = new Map(priorityIds.map((id, index) => [id, index]));
  const queueRank = new Map(benchQueue.map((id, index) => [id, index]));

  return available.sort((a, b) => {
    const pa = priorityRank.get(a) ?? 9999;
    const pb = priorityRank.get(b) ?? 9999;
    if (pa !== pb) return pa - pb;

    const aSat = (sitOutCounts[a] || 0) > 0 ? 1 : 0;
    const bSat = (sitOutCounts[b] || 0) > 0 ? 1 : 0;
    if (aSat !== bSat) return aSat - bSat;

    const countDiff = (sitOutCounts[a] || 0) - (sitOutCounts[b] || 0);
    if (countDiff !== 0) return countDiff;

    return (queueRank.get(a) ?? -1) - (queueRank.get(b) ?? -1);
  }).slice(0, numBench);
}

export function generateRound1(state, shuffle = false) {
  const historySet = new Set(state.pairingHistory || []);
  const activeIds = shuffle ? orderedActiveIds(state).sort(() => Math.random() - 0.5) : orderedActiveIds(state);
  const numBench = Math.max(0, activeIds.length - state.numCourts * 4);
  const benchIds = pickBench(activeIds, numBench, state.sitOutCounts, state.benchQueue || state.recentBench || []);
  const benchSet = new Set(benchIds);
  const courtIds = activeIds.filter(id => !benchSet.has(id));

  const courts = [];
  for (let c = 0; c < state.numCourts; c++) {
    const four = courtIds.slice(c * 4, c * 4 + 4);
    if (four.length < 4) break;
    const [teamA, teamB] = bestTeamSplit(four, historySet);
    courts.push({ courtNumber: c + 1, teamA, teamB });
  }

  return { roundNumber: 1, courts, bench: benchIds };
}

function buildDestinationMap(numCourts, winnerPairs, loserPairs) {
  const destMap = {};
  if (numCourts === 1) {
    const all = [...(winnerPairs[1] || []), ...(loserPairs[1] || [])];
    destMap[1] = { pairA: [all[0], all[1]], pairB: [all[2], all[3]] };
    return destMap;
  }
  if (numCourts === 2) {
    destMap[1] = { pairA: winnerPairs[1] || [], pairB: winnerPairs[2] || [] };
    destMap[2] = { pairA: loserPairs[1] || [], pairB: loserPairs[2] || [] };
    return destMap;
  }
  for (let d = 1; d <= numCourts; d++) {
    if (d === 1) destMap[d] = { pairA: winnerPairs[1] || [], pairB: winnerPairs[2] || [] };
    else if (d === numCourts) destMap[d] = { pairA: loserPairs[numCourts - 1] || [], pairB: loserPairs[numCourts] || [] };
    else destMap[d] = { pairA: winnerPairs[d + 1] || [], pairB: loserPairs[d - 1] || [] };
  }
  return destMap;
}

function buildBenchPriority(currentRound, results, numCourts) {
  const priority = [];
  for (let courtNumber = numCourts; courtNumber >= 1; courtNumber--) {
    const court = currentRound.courts.find(c => c.courtNumber === courtNumber);
    if (!court) continue;
    const winSide = results[courtNumber];
    if (!winSide) continue;
    const winners = winSide === 'A' ? court.teamA : court.teamB;
    const losers = winSide === 'A' ? court.teamB : court.teamA;
    priority.push(...losers, ...winners);
  }
  return priority;
}

export function generateNextRound(state, roundNumber, results) {
  const historySet = new Set(state.pairingHistory || []);
  const currentRound = state.rounds[roundNumber - 1];
  if (!currentRound) throw new Error('Round not found: ' + roundNumber);

  const newHistorySet = new Set(historySet);
  currentRound.courts.forEach(court => {
    newHistorySet.add(pairKey(court.teamA[0], court.teamA[1]));
    newHistorySet.add(pairKey(court.teamB[0], court.teamB[1]));
  });

  const newSitOutCounts = { ...(state.sitOutCounts || {}) };
  (currentRound.bench || []).forEach(id => {
    newSitOutCounts[id] = (newSitOutCounts[id] || 0) + 1;
  });

  const winnerPairs = {};
  const loserPairs = {};
  const movements = [];
  currentRound.courts.forEach(({ courtNumber, teamA, teamB }) => {
    const winSide = results[courtNumber];
    if (!winSide) return;
    const winners = [...(winSide === 'A' ? teamA : teamB)];
    const losers = [...(winSide === 'A' ? teamB : teamA)];
    winnerPairs[courtNumber] = winners;
    loserPairs[courtNumber] = losers;
    winners.forEach(id => movements.push({ playerId: id, fromCourt: courtNumber, toCourt: Math.max(1, courtNumber - 1), direction: courtNumber === 1 ? 'stay' : 'up', result: 'win' }));
    losers.forEach(id => movements.push({ playerId: id, fromCourt: courtNumber, toCourt: Math.min(state.numCourts, courtNumber + 1), direction: courtNumber === state.numCourts ? 'stay' : 'down', result: 'loss' }));
  });

  const activeIds = orderedActiveIds(state);
  const numBench = Math.max(0, activeIds.length - state.numCourts * 4);
  const destMap = buildDestinationMap(state.numCourts, winnerPairs, loserPairs);
  const allCourtIds = new Set(Object.values(destMap).flatMap(d => [...d.pairA, ...d.pairB]).filter(Boolean));
  const returningBench = (currentRound.bench || []).filter(id => activeIds.includes(id) && !allCourtIds.has(id));
  const allAvailable = [...new Set([...allCourtIds, ...returningBench, ...activeIds])];
  const priorityIds = buildBenchPriority(currentRound, results, state.numCourts);
  const newBench = pickBench(allAvailable, numBench, newSitOutCounts, state.benchQueue || state.recentBench || [], priorityIds);
  const benchSet = new Set(newBench);

  newBench.forEach(id => movements.push({ playerId: id, fromCourt: null, toCourt: null, direction: 'bench', result: 'bench' }));

  const usedSet = new Set(newBench);
  const floaters = allAvailable.filter(id => !benchSet.has(id) && !allCourtIds.has(id));
  const newCourts = [];

  for (let c = 1; c <= state.numCourts; c++) {
    let pairA = (destMap[c]?.pairA || []).filter(id => id && !usedSet.has(id));
    let pairB = (destMap[c]?.pairB || []).filter(id => id && !usedSet.has(id));
    while (pairA.length < 2 && floaters.length > 0) pairA.push(floaters.shift());
    while (pairB.length < 2 && floaters.length > 0) pairB.push(floaters.shift());
    const remaining = allAvailable.filter(id => !usedSet.has(id) && !pairA.includes(id) && !pairB.includes(id));
    while (pairA.length < 2 && remaining.length > 0) pairA.push(remaining.shift());
    while (pairB.length < 2 && remaining.length > 0) pairB.push(remaining.shift());

    if (pairA.length === 2 && pairB.length === 2) {
      const [teamA, teamB] = crossPair(pairA, pairB, newHistorySet);
      newHistorySet.add(pairKey(teamA[0], teamA[1]));
      newHistorySet.add(pairKey(teamB[0], teamB[1]));
      newCourts.push({ courtNumber: c, teamA, teamB });
      [...teamA, ...teamB].forEach(id => usedSet.add(id));
    }
  }

  const nextRound = { roundNumber: roundNumber + 1, courts: newCourts.sort((a, b) => a.courtNumber - b.courtNumber), bench: newBench };
  const updatedState = {
    ...state,
    pairingHistory: [...newHistorySet],
    sitOutCounts: newSitOutCounts,
    benchQueue: updateBenchQueue(state.benchQueue || state.recentBench || [], newBench),
    recentBench: newBench,
    results: { ...(state.results || {}), [roundNumber]: results },
  };

  return { nextRound, updatedState, movements };
}

export function computeKotcLeaderboard(state) {
  const scores = {};
  const inactive = new Set(state.inactivePlayerIds || []);
  (state.players || []).forEach(p => {
    scores[p.id] = { id: p.id, name: p.name, wins: 0, losses: 0, courtPoints: 0, sitOuts: state.sitOutCounts?.[p.id] || 0, inactive: inactive.has(p.id), finalCourt: null };
  });

  (state.rounds || []).forEach(round => {
    const roundResults = state.results?.[round.roundNumber] || {};
    round.courts?.forEach(court => {
      [...court.teamA, ...court.teamB].forEach(id => { if (scores[id]) scores[id].finalCourt = court.courtNumber; });
      const result = roundResults[court.courtNumber];
      if (!result) return;
      const winners = result === 'A' ? court.teamA : court.teamB;
      const losers = result === 'A' ? court.teamB : court.teamA;
      winners.forEach(id => { if (scores[id]) { scores[id].wins++; scores[id].courtPoints += Math.max(1, state.numCourts + 1 - court.courtNumber); } });
      losers.forEach(id => { if (scores[id]) scores[id].losses++; });
    });
  });

  return Object.values(scores).sort((a, b) => b.wins - a.wins || b.courtPoints - a.courtPoints || a.losses - b.losses || (a.finalCourt || 99) - (b.finalCourt || 99));
}