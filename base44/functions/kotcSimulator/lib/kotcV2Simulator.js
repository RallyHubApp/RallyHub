import { activeCourtCount, assertRoundLayout, KOTC_ENGINE_VERSION, KOTC_RULES_VERSION } from './kotcV2Domain.js';
import {
  buildSportingMovements,
  generateNextRoundRotating,
  generateRound1Rotating,
  orderParticipantsForRound1,
} from './kotcV2Engine.js';
import {
  applyCompletedRoundFairnessMetrics,
  applySlotPreservingSubstitutions,
  buildDestinationByParticipant,
  planRoundBench,
} from './kotcV2Fairness.js';
import {
  buildRecoverySnapshot,
  canGenerateNextRound,
  checkCommandEnvelope,
  finalisationIssues,
  prepareHostTakeover,
  prepareMatchCompletion,
  prepareScoreAutosave,
  validateRecoverySnapshot,
} from './kotcV2Workflow.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ids(count) {
  return Array.from({ length: count }, (_, index) => `p${index + 1}`);
}

function participantRecord(id, index = 0) {
  return {
    id,
    participant_id: id,
    display_name: `Player ${id.replace(/^p/, '')}`,
    status: 'present',
    seed_rank: index + 1,
    fairness_benches: 0,
    rounds_played: 0,
    consecutive_rounds_played: 0,
    consecutive_court1_rounds: 0,
    court1_rounds: 0,
    recent_fairness_burden: 0,
    was_fairness_benched_previous_round: false,
    just_returned_from_fairness_bench: false,
  };
}

function slotsToCourts(slots) {
  const byRank = new Map();
  for (const slot of slots) {
    if (!byRank.has(slot.ladder_court_rank)) byRank.set(slot.ladder_court_rank, []);
    byRank.get(slot.ladder_court_rank).push(slot);
  }
  return [...byRank.entries()].sort((a, b) => a[0] - b[0]).map(([courtRank, courtSlots]) => {
    const ordered = [...courtSlots].sort((a, b) => String(a.team_side).localeCompare(String(b.team_side)) || a.slot_number - b.slot_number);
    const teamA = ordered.filter((slot) => slot.team_side === 'A').sort((a, b) => a.slot_number - b.slot_number).map((slot) => slot.participant_id);
    const teamB = ordered.filter((slot) => slot.team_side === 'B').sort((a, b) => a.slot_number - b.slot_number).map((slot) => slot.participant_id);
    return { courtRank, teamA, teamB };
  });
}

function deterministicResults(round) {
  return Object.fromEntries(round.courts.map((court) => [court.courtRank, {
    winnerSide: (round.roundNumber + court.courtRank) % 2 === 0 ? 'A' : 'B',
  }]));
}

function report(checks, scenario, round, rule, passed, details = '') {
  checks.push({ scenario, round, rule, passed: Boolean(passed), details });
}

function assertUniqueCoverage({ courtIds, fairnessBenchIds, voluntaryRestIds = [], unavailableIds = [], eligibleIds, scenario, round, checks }) {
  const all = [...courtIds, ...fairnessBenchIds, ...voluntaryRestIds, ...unavailableIds];
  const duplicateCount = all.length - new Set(all).size;
  const missing = eligibleIds.filter((id) => !all.includes(id));
  report(checks, scenario, round, 'No duplicate participants', duplicateCount === 0, `${duplicateCount} duplicate assignments`);
  report(checks, scenario, round, 'No eligible participant disappears', missing.length === 0, missing.length ? `Missing: ${missing.join(', ')}` : 'none');
}

function makeSession(playerCount, venueCourtLimit) {
  return {
    id: `sim-${playerCount}-${venueCourtLimit}`,
    tenant_id: 'sim-tenant',
    club_id: 'sim-club',
    name: `Simulator ${playerCount}/${venueCourtLimit}`,
    status: 'in_progress',
    revision: 0,
    scoring_mode: 'timed',
    partnership_mode: 'rotating_doubles',
    engine_version: KOTC_ENGINE_VERSION,
    rules_version: KOTC_RULES_VERSION,
    available_court_limit: venueCourtLimit,
    random_seed: `sim-${playerCount}-${venueCourtLimit}`,
  };
}

function benchMetricsAfterRound(participants, round, fairnessBenchIds) {
  const played = round.courts.flatMap((court) => [...court.teamA, ...court.teamB]);
  const court1 = round.courts.find((court) => court.courtRank === 1);
  return applyCompletedRoundFairnessMetrics({
    participants,
    playedParticipantIds: played,
    fairnessBenchIds,
    court1ParticipantIds: court1 ? [...court1.teamA, ...court1.teamB] : [],
  });
}

export function simulateSteadyKotcSession({ playerCount, venueCourtLimit, rounds = 9 } = {}) {
  if (!Number.isInteger(playerCount) || playerCount < 4 || playerCount > 40) throw new Error('playerCount must be 4-40');
  if (!Number.isInteger(venueCourtLimit) || venueCourtLimit < 1 || venueCourtLimit > 10) throw new Error('venueCourtLimit must be 1-10');
  if (!Number.isInteger(rounds) || rounds < 1) throw new Error('rounds must be positive');

  const scenario = `${playerCount} players / ${venueCourtLimit} venue courts`;
  const checks = [];
  const session = makeSession(playerCount, venueCourtLimit);
  let participants = ids(playerCount).map(participantRecord);
  const orderedIds = orderParticipantsForRound1(participants, { seedingMode: 'manual', seed: session.random_seed });
  let history = {};
  let priorBenchIds = [];

  const r1Plan = planRoundBench({ participants, venueCourtLimit, seed: `${session.random_seed}|r1` });
  if (r1Plan.activeCourts < 1) throw new Error('Simulation requires at least one active doubles court');
  let currentRound = generateRound1Rotating({
    participantIds: orderedIds,
    activeCourts: r1Plan.activeCourts,
    benchIds: r1Plan.fairnessBenchIds,
    history,
    seed: session.random_seed,
  });
  priorBenchIds = [...r1Plan.fairnessBenchIds];

  for (let roundNumber = 1; roundNumber <= rounds; roundNumber += 1) {
    const plan = roundNumber === 1 ? r1Plan : null;
    const fairnessBenchIds = plan ? plan.fairnessBenchIds : priorBenchIds;
    const courtIds = currentRound.courts.flatMap((court) => [...court.teamA, ...court.teamB]);
    const expectedCourts = activeCourtCount(playerCount, venueCourtLimit);
    report(checks, scenario, roundNumber, 'Correct active court count', currentRound.courts.length === expectedCourts, `${currentRound.courts.length}/${expectedCourts}`);
    report(checks, scenario, roundNumber, 'Exactly four players per active court', currentRound.courts.every((court) => court.teamA.length === 2 && court.teamB.length === 2), `${currentRound.courts.length} courts checked`);
    assertRoundLayout({ slots: currentRound.slots, eligibleParticipantIds: ids(playerCount), activeCourts: expectedCourts });
    assertUniqueCoverage({ courtIds, fairnessBenchIds, eligibleIds: ids(playerCount), scenario, round: roundNumber, checks });

    // Strong fairness-cycle invariants.
    const selectedSet = new Set(fairnessBenchIds);
    const selectedCounts = fairnessBenchIds.map((id) => Number(participants.find((p) => p.id === id)?.fairness_benches || 0));
    const unselectedCounts = participants.filter((p) => !selectedSet.has(p.id)).map((p) => Number(p.fairness_benches || 0));
    const highestSelectedCount = selectedCounts.length ? Math.max(...selectedCounts) : 0;
    const lowestUnselectedCount = unselectedCounts.length ? Math.min(...unselectedCounts) : Number.POSITIVE_INFINITY;
    report(
      checks,
      scenario,
      roundNumber,
      'No avoidable repeat fairness bench',
      highestSelectedCount <= lowestUnselectedCount,
      `highest selected prior benches ${highestSelectedCount}; lowest unselected ${lowestUnselectedCount}`,
    );
    const consecutive = fairnessBenchIds.filter((id) => participants.find((p) => p.id === id)?.was_fairness_benched_previous_round);
    const avoidableConsecutive = consecutive.filter((id) => {
      const selected = participants.find((p) => p.id === id);
      const selectedCount = Number(selected?.fairness_benches || 0);
      return participants.some((p) => !selectedSet.has(p.id) && !p.was_fairness_benched_previous_round && Number(p.fairness_benches || 0) === selectedCount);
    });
    report(checks, scenario, roundNumber, 'No avoidable consecutive fairness bench', avoidableConsecutive.length === 0, avoidableConsecutive.join(', '));

    participants = benchMetricsAfterRound(participants, currentRound, fairnessBenchIds);
    if (roundNumber === rounds) break;

    const resultsByCourt = deterministicResults(currentRound);
    const sporting = generateNextRoundRotating({ currentRound, resultsByCourt, history, seed: session.random_seed });
    history = sporting.history;
    const destinationByParticipant = buildDestinationByParticipant(sporting.movements);
    const nextPlan = planRoundBench({ participants, venueCourtLimit, destinationByParticipant, seed: `${session.random_seed}|r${roundNumber + 1}` });
    if (nextPlan.activeCourts !== currentRound.courts.length) {
      throw new Error('Steady-session simulator encountered unexpected court-count change');
    }

    const nextFairnessSet = new Set(nextPlan.fairnessBenchIds);
    const outgoing = {};
    for (const slot of sporting.slots) {
      if (nextFairnessSet.has(slot.participant_id)) outgoing[slot.participant_id] = 'fairness_bench';
    }
    const currentBenchSet = new Set(fairnessBenchIds);
    const replacements = [...currentBenchSet].filter((id) => !nextFairnessSet.has(id));
    const vacancies = Object.keys(outgoing);
    if (replacements.length !== vacancies.length) {
      throw new Error(`Fairness substitution mismatch: ${vacancies.length} vacancies / ${replacements.length} returning bench players`);
    }
    const substituted = applySlotPreservingSubstitutions({ sportingSlots: sporting.slots, outgoing, replacementParticipantIds: replacements, seed: `${session.random_seed}|sub|r${roundNumber + 1}` });
    const nextCourts = slotsToCourts(substituted.slots);
    const nextCourtIds = nextCourts.flatMap((court) => [...court.teamA, ...court.teamB]);
    report(checks, scenario, roundNumber + 1, 'Slot-preserving substitutions do not cascade', substituted.substitutions.every((sub) => {
      const source = sporting.slots.find((slot) => slot.participant_id === sub.outgoingParticipantId);
      return source && source.ladder_court_rank === sub.preservedCourtRank && source.team_side === sub.preservedTeamSide && source.slot_number === sub.preservedSlotNumber;
    }), `${substituted.substitutions.length} substitutions`);
    report(checks, scenario, roundNumber + 1, 'Returning bench fills only vacated earned slots', replacements.every((id) => nextCourtIds.includes(id)), `${replacements.length} returners`);

    currentRound = {
      ...sporting,
      courts: nextCourts,
      slots: substituted.slots,
      benchIds: [...nextPlan.fairnessBenchIds],
    };
    priorBenchIds = [...nextPlan.fairnessBenchIds];
  }

  return {
    scenario,
    passed: checks.every((item) => item.passed),
    checks,
    finalParticipants: participants,
  };
}

export function simulateWorkflowSafety() {
  const checks = [];
  const scenario = 'workflow safety';
  const session = makeSession(12, 3);

  let envelope = checkCommandEnvelope({ commandId: 'pause-1', commandType: 'pause_session', expectedSessionRevision: 0, currentSessionRevision: 0, priorCommands: [] });
  report(checks, scenario, 0, 'Structural command accepts current revision', envelope.ok && envelope.nextRevision === 1, JSON.stringify(envelope));
  envelope = checkCommandEnvelope({ commandId: 'pause-2', commandType: 'pause_session', expectedSessionRevision: 0, currentSessionRevision: 1, priorCommands: [] });
  report(checks, scenario, 0, 'Stale structural command rejected', envelope.conflict === true, JSON.stringify(envelope));
  envelope = checkCommandEnvelope({ commandId: 'pause-1', commandType: 'pause_session', expectedSessionRevision: 0, currentSessionRevision: 1, priorCommands: [{ command_id: 'pause-1', result_json: '{"success":true}' }] });
  report(checks, scenario, 0, 'Duplicate command is idempotent', envelope.duplicate === true, JSON.stringify(envelope));

  const match = { id: 'm1', status: 'scheduled', revision: 0 };
  const autosave = prepareScoreAutosave({ match, teamAScore: 4, teamBScore: 3, expectedRevision: 0, commandId: 'score-1', now: '2026-09-07T12:00:00Z' });
  report(checks, scenario, 0, 'Partial score autosave persists independently', autosave.ok && autosave.update.revision === 1 && autosave.update.status === 'in_progress', JSON.stringify(autosave));
  const completed = prepareMatchCompletion({ match: { ...match, ...autosave.update }, session, teamAScore: 8, teamBScore: 8, servingSideAtHorn: 'B', expectedRevision: 1, commandId: 'score-2', userId: 'host', now: '2026-09-07T12:08:00Z' });
  report(checks, scenario, 0, 'Timed tie preserves tied score and serving-side winner metadata', completed.ok && completed.update.team_a_score === 8 && completed.update.team_b_score === 8 && completed.update.winner_side === 'B' && completed.update.result_method === 'timed_serving_tiebreak', JSON.stringify(completed));

  const gate = canGenerateNextRound({ currentRound: { round_number: 1, status: 'completed' }, matches: [{ round_number: 1, status: 'in_progress' }] });
  report(checks, scenario, 0, 'Unresolved match blocks next-round generation', gate.allowed === false, JSON.stringify(gate));
  const issues = finalisationIssues({ session: { ...session, status: 'completed' }, rounds: [{ status: 'completed' }], matches: [{ status: 'in_progress' }] });
  report(checks, scenario, 0, 'Unresolved match blocks finalisation', issues.length === 1 && issues[0].includes('unresolved'), issues.join('; '));

  const takeover = prepareHostTakeover({ activeLease: { holder_user_id: 'host-a', lease_revision: 2, status: 'active' }, newUserId: 'host-b', expectedLeaseRevision: 2, reason: 'Primary host phone unavailable', now: '2026-09-07T12:10:00Z' });
  report(checks, scenario, 0, 'Host takeover creates revisioned lease', takeover.ok && takeover.newLease.lease_revision === 3 && takeover.supersedeCurrent.status === 'superseded', JSON.stringify(takeover));

  const snapshot = buildRecoverySnapshot({ session, participants: [participantRecord('p1')], rounds: [{ id: 'r1', status: 'completed' }], matches: [{ id: 'm1', status: 'completed', winner_side: 'A', team_a_score: 8, team_b_score: 5 }] });
  snapshot.session.id = session.id;
  const recovery = validateRecoverySnapshot(snapshot);
  report(checks, scenario, 0, 'Recovery snapshot validates without invented results', recovery.valid, recovery.errors.join('; '));

  return { scenario, passed: checks.every((item) => item.passed), checks };
}

export function simulateAvailabilityAndCourtTransitions() {
  const checks = [];
  const scenario = 'availability/court transitions';
  const cases = [
    { present: 12, courts: 3, expected: 3 },
    { present: 11, courts: 3, expected: 2 },
    { present: 10, courts: 3, expected: 2 },
    { present: 9, courts: 3, expected: 2 },
    { present: 8, courts: 3, expected: 2 },
    { present: 7, courts: 3, expected: 1 },
    { present: 8, courts: 3, expected: 2 },
    { present: 9, courts: 3, expected: 2 },
    { present: 10, courts: 3, expected: 2 },
    { present: 11, courts: 3, expected: 2 },
    { present: 12, courts: 3, expected: 3 },
    { present: 16, courts: 4, expected: 4 },
    { present: 16, courts: 3, expected: 3 },
    { present: 16, courts: 4, expected: 4 },
  ];
  for (let index = 0; index < cases.length; index += 1) {
    const item = cases[index];
    const actual = activeCourtCount(item.present, item.courts);
    report(checks, scenario, index + 1, 'Active court recalculation at safe transition', actual === item.expected, `${item.present} present / ${item.courts} available => ${actual}`);
    report(checks, scenario, index + 1, 'No incomplete doubles court', actual * 4 <= item.present && item.present - actual * 4 >= 0, `${actual * 4} active / ${item.present - actual * 4} bench`);
  }
  return { scenario, passed: checks.every((item) => item.passed), checks };
}

export function runKotcV2ProductionSimulation({ rounds = 9, playerCounts = null, courtLimits = null } = {}) {
  const counts = playerCounts ?? Array.from({ length: 37 }, (_, index) => index + 4);
  const courts = courtLimits ?? Array.from({ length: 10 }, (_, index) => index + 1);
  const runs = [];
  for (const playerCount of counts) {
    for (const venueCourtLimit of courts) {
      runs.push(simulateSteadyKotcSession({ playerCount, venueCourtLimit, rounds }));
    }
  }
  runs.push(simulateWorkflowSafety());
  runs.push(simulateAvailabilityAndCourtTransitions());
  const failedChecks = runs.flatMap((run) => run.checks.filter((check) => !check.passed));
  return {
    engineVersion: KOTC_ENGINE_VERSION,
    rulesVersion: KOTC_RULES_VERSION,
    roundsPerSteadyScenario: rounds,
    steadyScenarioCount: counts.length * courts.length,
    scenarioCount: runs.length,
    checkCount: runs.reduce((sum, run) => sum + run.checks.length, 0),
    failureCount: failedChecks.length,
    passed: failedChecks.length === 0,
    failedChecks,
    runs,
  };
}
