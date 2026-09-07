import { assertRoundLayout } from './kotcV2Domain.js';

function stableHash(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRank(id, seed = '') {
  return stableHash(`${seed}|${id}`);
}

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function opponentKey(a, b) {
  return [a, b].sort().join('|');
}

function normaliseHistory(history = {}) {
  return {
    partnerCounts: history.partnerCounts ?? {},
    opponentCounts: history.opponentCounts ?? {},
  };
}

function partnerCount(a, b, history) {
  return history.partnerCounts[pairKey(a, b)] ?? 0;
}

function opponentCount(a, b, history) {
  return history.opponentCounts[opponentKey(a, b)] ?? 0;
}

function teamPairPenalty(teamA, teamB, history) {
  const partnerPenalty = partnerCount(teamA[0], teamA[1], history) + partnerCount(teamB[0], teamB[1], history);
  let opponentPenalty = 0;
  for (const a of teamA) {
    for (const b of teamB) opponentPenalty += opponentCount(a, b, history);
  }
  return { partnerPenalty, opponentPenalty };
}

function deterministicChoice(options, seedKey) {
  return [...options].sort((a, b) => {
    if (a.partnerPenalty !== b.partnerPenalty) return a.partnerPenalty - b.partnerPenalty;
    if (a.opponentPenalty !== b.opponentPenalty) return a.opponentPenalty - b.opponentPenalty;
    return seededRank(a.key, seedKey) - seededRank(b.key, seedKey) || a.key.localeCompare(b.key);
  })[0];
}

export function splitFourRotating(participantIds, historyInput = {}, seedKey = '') {
  if (!Array.isArray(participantIds) || participantIds.length !== 4) {
    throw new Error('splitFourRotating requires exactly four participant IDs');
  }
  if (new Set(participantIds).size !== 4) throw new Error('splitFourRotating participant IDs must be unique');

  const [a, b, c, d] = participantIds;
  const history = normaliseHistory(historyInput);
  const candidates = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ].map(([teamA, teamB]) => {
    const penalty = teamPairPenalty(teamA, teamB, history);
    return {
      teamA,
      teamB,
      ...penalty,
      key: `${teamA.join(',')}|${teamB.join(',')}`,
    };
  });

  const selected = deterministicChoice(candidates, seedKey);
  return { teamA: selected.teamA, teamB: selected.teamB };
}

export function crossSplitResultPairs(pairOne, pairTwo, historyInput = {}, seedKey = '') {
  if (!Array.isArray(pairOne) || pairOne.length !== 2 || !Array.isArray(pairTwo) || pairTwo.length !== 2) {
    throw new Error('crossSplitResultPairs requires two pairs');
  }
  const all = [...pairOne, ...pairTwo];
  if (new Set(all).size !== 4) throw new Error('crossSplitResultPairs participant IDs must be unique');

  const [a, b] = pairOne;
  const [c, d] = pairTwo;
  const history = normaliseHistory(historyInput);
  const candidates = [
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ].map(([teamA, teamB]) => {
    const penalty = teamPairPenalty(teamA, teamB, history);
    return {
      teamA,
      teamB,
      ...penalty,
      key: `${teamA.join(',')}|${teamB.join(',')}`,
    };
  });

  const selected = deterministicChoice(candidates, seedKey);
  return { teamA: selected.teamA, teamB: selected.teamB };
}

export function recordRoundHistory(historyInput = {}, courts = []) {
  const history = normaliseHistory(historyInput);
  const partnerCounts = { ...history.partnerCounts };
  const opponentCounts = { ...history.opponentCounts };

  for (const court of courts) {
    const teamA = court.teamA ?? [];
    const teamB = court.teamB ?? [];
    if (teamA.length !== 2 || teamB.length !== 2) continue;
    const aKey = pairKey(teamA[0], teamA[1]);
    const bKey = pairKey(teamB[0], teamB[1]);
    partnerCounts[aKey] = (partnerCounts[aKey] ?? 0) + 1;
    partnerCounts[bKey] = (partnerCounts[bKey] ?? 0) + 1;
    for (const a of teamA) {
      for (const b of teamB) {
        const key = opponentKey(a, b);
        opponentCounts[key] = (opponentCounts[key] ?? 0) + 1;
      }
    }
  }

  return { partnerCounts, opponentCounts };
}

function normaliseSeedEntries(participants, seedingMode, seed = '') {
  return participants.map((participant, index) => {
    const id = participant.id ?? participant.participant_id;
    if (!id) throw new Error('Every participant requires an id or participant_id');
    let sortPrimary;
    if (seedingMode === 'internal_rating') sortPrimary = -(participant.rating_snapshot ?? participant.internal_rating ?? 0);
    else if (seedingMode === 'dupr') sortPrimary = -(participant.dupr_rating_snapshot ?? participant.dupr_rating ?? 0);
    else if (seedingMode === 'previous_kotc') sortPrimary = participant.previous_kotc_rank ?? Number.MAX_SAFE_INTEGER;
    else if (seedingMode === 'random_seeded') sortPrimary = seededRank(id, seed);
    else sortPrimary = participant.seed_rank ?? participant.manual_rank ?? index + 1;
    return { id, participant, sortPrimary, originalIndex: index };
  }).sort((a, b) => a.sortPrimary - b.sortPrimary || a.originalIndex - b.originalIndex || a.id.localeCompare(b.id));
}

export function orderParticipantsForRound1(participants, { seedingMode = 'manual', seed = '' } = {}) {
  return normaliseSeedEntries(participants, seedingMode, seed).map((entry) => entry.id);
}

function makeSlotsFromCourts(courts, roundNumber, assignmentType) {
  return courts.flatMap((court) => [
    { participant_id: court.teamA[0], ladder_court_rank: court.courtRank, team_side: 'A', slot_number: 1, round_number: roundNumber, assignment_type: assignmentType },
    { participant_id: court.teamA[1], ladder_court_rank: court.courtRank, team_side: 'A', slot_number: 2, round_number: roundNumber, assignment_type: assignmentType },
    { participant_id: court.teamB[0], ladder_court_rank: court.courtRank, team_side: 'B', slot_number: 1, round_number: roundNumber, assignment_type: assignmentType },
    { participant_id: court.teamB[1], ladder_court_rank: court.courtRank, team_side: 'B', slot_number: 2, round_number: roundNumber, assignment_type: assignmentType },
  ]);
}

export function generateRound1Rotating({ participantIds, activeCourts, benchIds = [], history = {}, seed = '' }) {
  if (!Number.isInteger(activeCourts) || activeCourts < 1) throw new Error('activeCourts must be at least 1');
  const uniqueIds = [...new Set(participantIds ?? [])];
  if (uniqueIds.length !== (participantIds ?? []).length) throw new Error('participantIds must be unique');
  const benchSet = new Set(benchIds);
  const courtIds = uniqueIds.filter((id) => !benchSet.has(id));
  if (courtIds.length !== activeCourts * 4) {
    throw new Error(`Round 1 requires exactly ${activeCourts * 4} court players after bench selection`);
  }

  const courts = [];
  for (let index = 0; index < activeCourts; index += 1) {
    const four = courtIds.slice(index * 4, index * 4 + 4);
    const split = splitFourRotating(four, history, `${seed}|r1|c${index + 1}`);
    courts.push({ courtRank: index + 1, ...split });
  }
  const slots = makeSlotsFromCourts(courts, 1, 'initial_seed');
  assertRoundLayout({ slots, eligibleParticipantIds: uniqueIds, activeCourts });
  return { roundNumber: 1, courts, slots, benchIds: [...benchIds] };
}

function fixedPairEntries(participants) {
  const groups = new Map();
  for (const participant of participants) {
    const id = participant.id ?? participant.participant_id;
    const pairId = participant.fixed_pair_id;
    if (!id || !pairId) throw new Error('Fixed doubles participants require participant ID and fixed_pair_id');
    if (!groups.has(pairId)) groups.set(pairId, []);
    groups.get(pairId).push(id);
  }
  for (const [pairId, ids] of groups.entries()) {
    if (ids.length !== 2) throw new Error(`Fixed pair ${pairId} must contain exactly two participants`);
  }
  return [...groups.entries()].map(([pairId, ids]) => ({ pairId, ids }));
}

export function generateRound1Fixed({ participants, activeCourts, benchPairIds = [], seed = '' }) {
  if (!Number.isInteger(activeCourts) || activeCourts < 1) throw new Error('activeCourts must be at least 1');
  const pairs = fixedPairEntries(participants);
  const benchSet = new Set(benchPairIds);
  const courtPairs = pairs.filter((pair) => !benchSet.has(pair.pairId));
  if (courtPairs.length !== activeCourts * 2) {
    throw new Error(`Fixed doubles Round 1 requires exactly ${activeCourts * 2} active pairs`);
  }
  const courts = [];
  for (let index = 0; index < activeCourts; index += 1) {
    const pairA = courtPairs[index * 2];
    const pairB = courtPairs[index * 2 + 1];
    const swap = seededRank(`${pairA.pairId}|${pairB.pairId}`, seed) % 2 === 1;
    courts.push({
      courtRank: index + 1,
      teamA: swap ? pairB.ids : pairA.ids,
      teamB: swap ? pairA.ids : pairB.ids,
      teamAPairId: swap ? pairB.pairId : pairA.pairId,
      teamBPairId: swap ? pairA.pairId : pairB.pairId,
    });
  }
  const eligibleIds = participants.map((p) => p.id ?? p.participant_id);
  const slots = makeSlotsFromCourts(courts, 1, 'initial_seed');
  assertRoundLayout({ slots, eligibleParticipantIds: eligibleIds, activeCourts });
  return { roundNumber: 1, courts, slots, benchPairIds: [...benchPairIds] };
}

export function resultPairsForRound(courts, resultsByCourt) {
  const winnerPairs = {};
  const loserPairs = {};
  for (const court of courts) {
    const result = resultsByCourt[court.courtRank];
    if (!result || !['A', 'B'].includes(result.winnerSide)) {
      throw new Error(`Missing or invalid result for Court ${court.courtRank}`);
    }
    winnerPairs[court.courtRank] = result.winnerSide === 'A' ? [...court.teamA] : [...court.teamB];
    loserPairs[court.courtRank] = result.winnerSide === 'A' ? [...court.teamB] : [...court.teamA];
  }
  return { winnerPairs, loserPairs };
}

export function buildSportingDestinationPairs({ courts, resultsByCourt }) {
  const activeCourts = courts.length;
  if (activeCourts < 1) throw new Error('At least one court is required');
  const { winnerPairs, loserPairs } = resultPairsForRound(courts, resultsByCourt);
  const destinations = {};

  if (activeCourts === 1) {
    destinations[1] = { pairOne: winnerPairs[1], pairTwo: loserPairs[1] };
    return destinations;
  }

  for (let courtRank = 1; courtRank <= activeCourts; courtRank += 1) {
    if (courtRank === 1) {
      destinations[courtRank] = { pairOne: winnerPairs[1], pairTwo: winnerPairs[2] };
    } else if (courtRank === activeCourts) {
      destinations[courtRank] = { pairOne: loserPairs[activeCourts - 1], pairTwo: loserPairs[activeCourts] };
    } else {
      destinations[courtRank] = { pairOne: loserPairs[courtRank - 1], pairTwo: winnerPairs[courtRank + 1] };
    }
  }
  return destinations;
}

export function buildSportingMovements({ courts, resultsByCourt }) {
  const activeCourts = courts.length;
  const movements = [];
  for (const court of courts) {
    const result = resultsByCourt[court.courtRank];
    if (!result || !['A', 'B'].includes(result.winnerSide)) throw new Error(`Missing or invalid result for Court ${court.courtRank}`);
    const winners = result.winnerSide === 'A' ? court.teamA : court.teamB;
    const losers = result.winnerSide === 'A' ? court.teamB : court.teamA;
    const winnerDestination = Math.max(1, court.courtRank - 1);
    const loserDestination = Math.min(activeCourts, court.courtRank + 1);
    for (const participantId of winners) movements.push({ participantId, fromCourtRank: court.courtRank, earnedCourtRank: winnerDestination, result: 'win' });
    for (const participantId of losers) movements.push({ participantId, fromCourtRank: court.courtRank, earnedCourtRank: loserDestination, result: 'loss' });
  }
  return movements;
}

export function generateNextRoundRotating({ currentRound, resultsByCourt, history = {}, seed = '' }) {
  const destinations = buildSportingDestinationPairs({ courts: currentRound.courts, resultsByCourt });
  const updatedHistory = recordRoundHistory(history, currentRound.courts);
  const courts = Object.entries(destinations).map(([rankText, destination]) => {
    const courtRank = Number(rankText);
    const split = crossSplitResultPairs(destination.pairOne, destination.pairTwo, updatedHistory, `${seed}|r${currentRound.roundNumber + 1}|c${courtRank}`);
    return { courtRank, ...split };
  });
  const eligibleIds = courts.flatMap((court) => [...court.teamA, ...court.teamB]);
  const slots = makeSlotsFromCourts(courts, currentRound.roundNumber + 1, 'sporting_movement');
  assertRoundLayout({ slots, eligibleParticipantIds: eligibleIds, activeCourts: courts.length });
  return {
    roundNumber: currentRound.roundNumber + 1,
    courts,
    slots,
    benchIds: [],
    history: updatedHistory,
    movements: buildSportingMovements({ courts: currentRound.courts, resultsByCourt }),
  };
}

export function generateNextRoundFixed({ currentRound, resultsByCourt }) {
  const destinations = buildSportingDestinationPairs({ courts: currentRound.courts, resultsByCourt });
  const courts = Object.entries(destinations).map(([rankText, destination]) => ({
    courtRank: Number(rankText),
    teamA: [...destination.pairOne],
    teamB: [...destination.pairTwo],
  }));
  const eligibleIds = courts.flatMap((court) => [...court.teamA, ...court.teamB]);
  const slots = makeSlotsFromCourts(courts, currentRound.roundNumber + 1, 'sporting_movement');
  assertRoundLayout({ slots, eligibleParticipantIds: eligibleIds, activeCourts: courts.length });
  return {
    roundNumber: currentRound.roundNumber + 1,
    courts,
    slots,
    benchPairIds: [],
    movements: buildSportingMovements({ courts: currentRound.courts, resultsByCourt }),
  };
}

export function assertSportingMovement({ currentRound, nextRound, resultsByCourt }) {
  const expected = buildSportingMovements({ courts: currentRound.courts, resultsByCourt });
  const actualCourtByParticipant = new Map();
  for (const court of nextRound.courts) {
    for (const id of [...court.teamA, ...court.teamB]) actualCourtByParticipant.set(id, court.courtRank);
  }
  const errors = [];
  for (const movement of expected) {
    const actual = actualCourtByParticipant.get(movement.participantId);
    if (actual !== movement.earnedCourtRank) {
      errors.push(`${movement.participantId} earned Court ${movement.earnedCourtRank} but was placed on Court ${actual ?? 'none'}`);
    }
  }
  if (errors.length) throw new Error(`KOTC sporting movement invariant failure: ${errors.join('; ')}`);
  return true;
}
