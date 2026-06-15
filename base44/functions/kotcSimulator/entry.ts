import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function autoAllocateCourts(playerCount) {
  if (playerCount <= 6) return 1;
  if (playerCount <= 10) return 2;
  if (playerCount <= 14) return 3;
  return 4;
}

function makePlayers(count) {
  return Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, name: `Player ${i + 1}`, rating: 5 - i * 0.05 }));
}

function createState(players) {
  return {
    players,
    numCourts: autoAllocateCourts(players.length),
    rounds: [],
    results: {},
    sitOutCounts: Object.fromEntries(players.map(p => [p.id, 0])),
    benchQueue: [],
    inactivePlayerIds: [],
  };
}

function splitCourt(ids, courtNumber) {
  return { courtNumber, teamA: [ids[0], ids[2]], teamB: [ids[1], ids[3]] };
}

function generateRound(state, roundNumber) {
  const activeIds = state.players.filter(p => !state.inactivePlayerIds.includes(p.id)).map(p => p.id);
  const playableCourts = Math.min(state.numCourts, Math.floor(activeIds.length / 4));
  const benchCount = Math.max(0, activeIds.length - playableCourts * 4);
  const queueRank = new Map((state.benchQueue || []).map((id, i) => [id, i]));
  const bench = [...activeIds]
    .sort((a, b) => (state.sitOutCounts[a] || 0) - (state.sitOutCounts[b] || 0) || (queueRank.get(a) ?? -1) - (queueRank.get(b) ?? -1))
    .slice(0, benchCount);
  const benchSet = new Set(bench);
  const courtIds = activeIds.filter(id => !benchSet.has(id));
  const courts = [];
  for (let i = 0; i < playableCourts; i++) {
    const four = courtIds.slice(i * 4, i * 4 + 4);
    if (four.length === 4) courts.push(splitCourt(four, i + 1));
  }
  return { roundNumber, courts, bench };
}

function nextState(state, round) {
  const results = Object.fromEntries(round.courts.map(c => [c.courtNumber, c.courtNumber % 2 ? 'A' : 'B']));
  const sitOutCounts = { ...state.sitOutCounts };
  round.bench.forEach(id => { sitOutCounts[id] = (sitOutCounts[id] || 0) + 1; });
  return {
    ...state,
    rounds: [...state.rounds, round],
    results: { ...state.results, [round.roundNumber]: results },
    sitOutCounts,
    benchQueue: [...(state.benchQueue || []).filter(id => !round.bench.includes(id)), ...round.bench],
  };
}

function replacePlayer(state, oldId, newId) {
  return {
    ...state,
    players: state.players.map(p => p.id === oldId ? { id: newId, name: 'Replacement Player', rating: 3 } : p),
    rounds: state.rounds.map(round => ({
      ...round,
      courts: round.courts.map(c => ({
        ...c,
        teamA: c.teamA.map(id => id === oldId ? newId : id),
        teamB: c.teamB.map(id => id === oldId ? newId : id),
      })),
      bench: round.bench.map(id => id === oldId ? newId : id),
    })),
    sitOutCounts: { ...state.sitOutCounts, [newId]: state.sitOutCounts[oldId] || 0 },
  };
}

function addLatePlayer(state, player) {
  const rounds = [...state.rounds];
  if (rounds.length) rounds[rounds.length - 1] = { ...rounds[rounds.length - 1], bench: [...rounds[rounds.length - 1].bench, player.id] };
  const existingCounts = Object.values(state.sitOutCounts || {});
  const baseline = existingCounts.length ? Math.min(...existingCounts) : 0;
  return { ...state, players: [...state.players, player], rounds, sitOutCounts: { ...state.sitOutCounts, [player.id]: baseline } };
}

function validate(state, round) {
  const reports = [];
  const activeIds = state.players.filter(p => !state.inactivePlayerIds.includes(p.id)).map(p => p.id);
  const seen = [];
  round.courts.forEach(c => seen.push(...c.teamA, ...c.teamB));
  seen.push(...round.bench);
  const duplicates = seen.filter((id, i) => seen.indexOf(id) !== i);
  const missing = activeIds.filter(id => !seen.includes(id));
  const expectedCourts = Math.min(autoAllocateCourts(activeIds.length), Math.floor(activeIds.length / 4));
  const projectedCounts = { ...state.sitOutCounts };
  round.bench.forEach(id => { projectedCounts[id] = (projectedCounts[id] || 0) + 1; });
  const benchCounts = activeIds.map(id => projectedCounts[id] || 0);
  const maxBench = Math.max(...benchCounts, 0);
  const minBench = Math.min(...benchCounts, 0);

  reports.push({ round: round.roundNumber, rule: 'No duplicate players', expected: '0 duplicates', actual: `${duplicates.length} duplicates`, passed: duplicates.length === 0 });
  reports.push({ round: round.roundNumber, rule: 'No missing players', expected: '0 missing', actual: `${missing.length} missing`, passed: missing.length === 0 });
  reports.push({ round: round.roundNumber, rule: 'Court allocation valid', expected: expectedCourts, actual: round.courts.length, passed: round.courts.length === expectedCourts });
  const fairnessTolerance = 3;
  reports.push({ round: round.roundNumber, rule: 'Bench fairness maintained', expected: `max difference <= ${fairnessTolerance}`, actual: `difference ${maxBench - minBench}`, passed: maxBench - minBench <= fairnessTolerance });
  return reports;
}

function simulate(count, rounds = 9, scenarios = []) {
  let state = createState(makePlayers(count));
  const report = [];
  const undoStack = [];

  for (let roundNumber = 1; roundNumber <= rounds; roundNumber++) {
    if (roundNumber === 3 && scenarios.includes('replacement')) {
      undoStack.push(JSON.parse(JSON.stringify(state)));
      state = replacePlayer(state, 'p1', `replacement_${count}`);
    }
    if (roundNumber === 5 && scenarios.includes('late_player')) {
      undoStack.push(JSON.parse(JSON.stringify(state)));
      state = addLatePlayer(state, { id: `late_${count}`, name: 'Late Player', rating: 3 });
      state.numCourts = autoAllocateCourts(state.players.length);
    }
    if (roundNumber === 6 && scenarios.includes('undo') && undoStack.length) {
      state = undoStack.pop();
    }

    const round = generateRound(state, roundNumber);
    report.push(...validate(state, round).map(r => ({ scenario: `${count} players`, ...r })));
    state = nextState(state, round);
  }

  return { count, passed: report.every(r => r.passed), report };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const role = user?.kotc_role || (user?.role === 'admin' ? 'super_admin' : 'player');
    if (!['super_admin', 'admin'].includes(role)) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const counts = body.numPlayers ? [body.numPlayers] : [6, 10, 14, 18];
    const rounds = body.numRounds || 9;
    const scenarios = body.scenarios || ['replacement', 'late_player', 'undo'];
    const runs = counts.map(count => simulate(count, rounds, scenarios));
    const failedReports = runs.flatMap(run => run.report.filter(item => !item.passed));
    return Response.json({ passed: failedReports.length === 0, failedReports, runs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});