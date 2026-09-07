import { DEFAULT_FAIRNESS_POLICY, activeCourtCount } from './kotcV2Domain.js';

function stableHash(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function idOf(participant) {
  return participant?.id ?? participant?.participant_id;
}

function metric(participant, snake, camel, fallback = 0) {
  const value = participant?.[snake] ?? participant?.[camel];
  return Number.isFinite(value) ? value : fallback;
}

function boolMetric(participant, snake, camel) {
  return Boolean(participant?.[snake] ?? participant?.[camel]);
}

export function normaliseFairnessParticipant(participant, destinationByParticipant = {}) {
  const id = idOf(participant);
  if (!id) throw new Error('Fairness participant requires an id or participant_id');
  return {
    id,
    fairnessBenches: metric(participant, 'fairness_benches', 'fairnessBenches'),
    consecutiveRoundsPlayed: metric(participant, 'consecutive_rounds_played', 'consecutiveRoundsPlayed'),
    roundsPlayed: metric(participant, 'rounds_played', 'roundsPlayed'),
    consecutiveCourt1Rounds: metric(participant, 'consecutive_court1_rounds', 'consecutiveCourt1Rounds'),
    recentFairnessBurden: metric(participant, 'recent_fairness_burden', 'recentFairnessBurden'),
    wasFairnessBenchedPreviousRound: boolMetric(participant, 'was_fairness_benched_previous_round', 'wasFairnessBenchedPreviousRound'),
    justReturnedFromFairnessBench: boolMetric(participant, 'just_returned_from_fairness_bench', 'justReturnedFromFairnessBench'),
    destinationCourtRank: destinationByParticipant[id] ?? metric(participant, 'destination_court_rank', 'destinationCourtRank', Number.MAX_SAFE_INTEGER),
    raw: participant,
  };
}

export function compareFairnessCandidates(a, b, { policy = DEFAULT_FAIRNESS_POLICY, seed = '' } = {}) {
  // Near-hard fairness cycle: players with fewer fairness benches are always preferred.
  if (a.fairnessBenches !== b.fairnessBenches) return a.fairnessBenches - b.fairnessBenches;

  // Protect a player who sat the immediately preceding round / has just returned.
  const aProtected = Number(
    (policy.avoidConsecutiveFairnessBench && a.wasFairnessBenchedPreviousRound) ||
    (policy.protectJustReturnedFromFairnessBench && a.justReturnedFromFairnessBench),
  );
  const bProtected = Number(
    (policy.avoidConsecutiveFairnessBench && b.wasFairnessBenchedPreviousRound) ||
    (policy.protectJustReturnedFromFairnessBench && b.justReturnedFromFairnessBench),
  );
  if (aProtected !== bProtected) return aProtected - bProtected;

  // Current-session opportunity first: longest uninterrupted and total court time rests first.
  if (a.consecutiveRoundsPlayed !== b.consecutiveRoundsPlayed) return b.consecutiveRoundsPlayed - a.consecutiveRoundsPlayed;
  if (a.roundsPlayed !== b.roundsPlayed) return b.roundsPlayed - a.roundsPlayed;

  // Court 1 tenure is a fairness factor, not an automatic punishment.
  const threshold = policy.court1TenurePriorityAfterRounds ?? 2;
  const aCourt1Priority = Number(a.consecutiveCourt1Rounds >= threshold);
  const bCourt1Priority = Number(b.consecutiveCourt1Rounds >= threshold);
  if (aCourt1Priority !== bCourt1Priority) return bCourt1Priority - aCourt1Priority;
  if (a.consecutiveCourt1Rounds !== b.consecutiveCourt1Rounds) return b.consecutiveCourt1Rounds - a.consecutiveCourt1Rounds;

  // Historical burden protects players who have already carried more recent fairness rests.
  if (a.recentFairnessBurden !== b.recentFairnessBurden) return a.recentFairnessBurden - b.recentFairnessBurden;

  // Only after fairness is otherwise equal do we minimise disruption to the ladder.
  if (policy.minimiseLadderDisruptionAsTieBreak && a.destinationCourtRank !== b.destinationCourtRank) {
    return b.destinationCourtRank - a.destinationCourtRank;
  }

  const aRank = stableHash(`${seed}|${a.id}`);
  const bRank = stableHash(`${seed}|${b.id}`);
  return aRank - bRank || a.id.localeCompare(b.id);
}

export function selectFairnessBench({
  participants,
  requiredFairnessBenchCount,
  excludedParticipantIds = [],
  destinationByParticipant = {},
  policy = DEFAULT_FAIRNESS_POLICY,
  seed = '',
} = {}) {
  if (!Number.isInteger(requiredFairnessBenchCount) || requiredFairnessBenchCount < 0) {
    throw new Error('requiredFairnessBenchCount must be a non-negative integer');
  }
  const excluded = new Set(excludedParticipantIds);
  const candidates = (participants ?? [])
    .map((participant) => normaliseFairnessParticipant(participant, destinationByParticipant))
    .filter((participant) => !excluded.has(participant.id));

  if (requiredFairnessBenchCount > candidates.length) {
    throw new Error(`Cannot select ${requiredFairnessBenchCount} fairness benches from ${candidates.length} eligible candidates`);
  }

  const sorted = [...candidates].sort((a, b) => compareFairnessCandidates(a, b, { policy, seed }));
  const selected = sorted.slice(0, requiredFairnessBenchCount);

  return {
    fairnessBenchIds: selected.map((entry) => entry.id),
    ranking: sorted.map((entry, index) => ({
      participantId: entry.id,
      rank: index + 1,
      fairnessBenches: entry.fairnessBenches,
      consecutiveRoundsPlayed: entry.consecutiveRoundsPlayed,
      roundsPlayed: entry.roundsPlayed,
      consecutiveCourt1Rounds: entry.consecutiveCourt1Rounds,
      recentFairnessBurden: entry.recentFairnessBurden,
      protectedFromImmediateRepeat: Boolean(entry.wasFairnessBenchedPreviousRound || entry.justReturnedFromFairnessBench),
      destinationCourtRank: entry.destinationCourtRank,
    })),
  };
}

export function planRoundBench({
  participants,
  venueCourtLimit,
  voluntaryRestIds = [],
  unavailableIds = [],
  destinationByParticipant = {},
  policy = DEFAULT_FAIRNESS_POLICY,
  seed = '',
} = {}) {
  const participantIds = (participants ?? []).map(idOf);
  if (participantIds.some((id) => !id)) throw new Error('Every participant requires an id or participant_id');
  if (new Set(participantIds).size !== participantIds.length) throw new Error('Participant IDs must be unique');

  const voluntary = new Set(voluntaryRestIds);
  const unavailable = new Set(unavailableIds);
  const overlap = [...voluntary].filter((id) => unavailable.has(id));
  if (overlap.length) throw new Error(`Participant cannot be both voluntary rest and unavailable: ${overlap.join(', ')}`);

  const unknown = [...voluntary, ...unavailable].filter((id) => !participantIds.includes(id));
  if (unknown.length) throw new Error(`Unknown participant in bench plan: ${[...new Set(unknown)].join(', ')}`);

  const playableIds = participantIds.filter((id) => !voluntary.has(id) && !unavailable.has(id));
  const activeCourts = activeCourtCount(playableIds.length, venueCourtLimit);
  const courtPlaces = activeCourts * 4;
  const requiredFairnessBenchCount = Math.max(0, playableIds.length - courtPlaces);
  const excluded = [...voluntary, ...unavailable];

  const fairness = selectFairnessBench({
    participants,
    requiredFairnessBenchCount,
    excludedParticipantIds: excluded,
    destinationByParticipant,
    policy,
    seed,
  });

  return {
    activeCourts,
    courtPlaces,
    fairnessBenchIds: fairness.fairnessBenchIds,
    voluntaryRestIds: [...voluntary],
    unavailableIds: [...unavailable],
    allNonPlayingIds: [...fairness.fairnessBenchIds, ...voluntary, ...unavailable],
    fairnessRanking: fairness.ranking,
  };
}

export function buildDestinationByParticipant(movements = []) {
  return Object.fromEntries(movements.map((movement) => [movement.participantId, movement.earnedCourtRank]));
}

export function applySlotPreservingSubstitutions({
  sportingSlots,
  outgoing,
  replacementParticipantIds,
  seed = '',
} = {}) {
  const outgoingEntries = Object.entries(outgoing ?? {});
  const outgoingIds = new Set(outgoingEntries.map(([participantId]) => participantId));
  const replacements = [...(replacementParticipantIds ?? [])];

  if (new Set(replacements).size !== replacements.length) throw new Error('Replacement participant IDs must be unique');
  if (replacements.some((id) => outgoingIds.has(id))) throw new Error('Outgoing participant cannot also be a replacement');

  const vacancies = (sportingSlots ?? []).filter((slot) => outgoingIds.has(slot.participant_id));
  if (vacancies.length !== outgoingEntries.length) {
    throw new Error('Every outgoing participant must occupy exactly one sporting slot');
  }
  if (replacements.length !== vacancies.length) {
    throw new Error(`Slot-preserving substitution requires ${vacancies.length} replacements, received ${replacements.length}`);
  }

  const sortedReplacements = [...replacements].sort((a, b) => stableHash(`${seed}|${a}`) - stableHash(`${seed}|${b}`) || a.localeCompare(b));
  const sortedVacancies = [...vacancies].sort((a, b) =>
    a.ladder_court_rank - b.ladder_court_rank ||
    String(a.team_side).localeCompare(String(b.team_side)) ||
    a.slot_number - b.slot_number,
  );
  const replacementFor = new Map(sortedVacancies.map((slot, index) => [slot.participant_id, sortedReplacements[index]]));

  const slots = sportingSlots.map((slot) => {
    const replacementId = replacementFor.get(slot.participant_id);
    if (!replacementId) return { ...slot };
    const reason = outgoing?.[slot.participant_id] ?? 'manual_override';
    const assignmentTypeByReason = {
      fairness_bench: 'fairness_return',
      voluntary_rest: 'voluntary_rest_replacement',
      temporary_absence: 'temporary_absence_replacement',
      injury: 'injury_replacement',
      left: 'leave_replacement',
      leaving_early: 'leave_replacement',
    };
    return {
      ...slot,
      participant_id: replacementId,
      replacement_for_participant_id: slot.participant_id,
      assignment_type: assignmentTypeByReason[reason] ?? 'manual_override',
    };
  });

  return {
    slots,
    substitutions: sortedVacancies.map((slot, index) => ({
      outgoingParticipantId: slot.participant_id,
      incomingParticipantId: sortedReplacements[index],
      reason: outgoing?.[slot.participant_id] ?? 'manual_override',
      preservedCourtRank: slot.ladder_court_rank,
      preservedTeamSide: slot.team_side,
      preservedSlotNumber: slot.slot_number,
    })),
  };
}

export function applyCompletedRoundFairnessMetrics({ participants, playedParticipantIds = [], fairnessBenchIds = [], court1ParticipantIds = [] } = {}) {
  const played = new Set(playedParticipantIds);
  const benched = new Set(fairnessBenchIds);
  const court1 = new Set(court1ParticipantIds);
  return (participants ?? []).map((participant) => {
    const id = idOf(participant);
    const didPlay = played.has(id);
    const fairnessBenched = benched.has(id);
    const didPlayCourt1 = didPlay && court1.has(id);
    return {
      ...participant,
      rounds_played: metric(participant, 'rounds_played', 'roundsPlayed') + (didPlay ? 1 : 0),
      fairness_benches: metric(participant, 'fairness_benches', 'fairnessBenches') + (fairnessBenched ? 1 : 0),
      consecutive_rounds_played: didPlay ? metric(participant, 'consecutive_rounds_played', 'consecutiveRoundsPlayed') + 1 : 0,
      consecutive_court1_rounds: didPlayCourt1 ? metric(participant, 'consecutive_court1_rounds', 'consecutiveCourt1Rounds') + 1 : 0,
      court1_rounds: metric(participant, 'court1_rounds', 'court1Rounds') + (didPlayCourt1 ? 1 : 0),
      was_fairness_benched_previous_round: fairnessBenched,
      just_returned_from_fairness_bench: didPlay && boolMetric(participant, 'was_fairness_benched_previous_round', 'wasFairnessBenchedPreviousRound'),
    };
  });
}

export function explainFairnessSelection(participantId, ranking = []) {
  const entry = ranking.find((item) => item.participantId === participantId);
  if (!entry) return null;
  const reasons = [];
  if (entry.fairnessBenches === 0) reasons.push('no previous fairness bench this session');
  else reasons.push(`${entry.fairnessBenches} previous fairness bench${entry.fairnessBenches === 1 ? '' : 'es'} this session`);
  if (entry.consecutiveRoundsPlayed > 0) reasons.push(`${entry.consecutiveRoundsPlayed} consecutive round${entry.consecutiveRoundsPlayed === 1 ? '' : 's'} played`);
  if (entry.consecutiveCourt1Rounds > 0) reasons.push(`${entry.consecutiveCourt1Rounds} consecutive round${entry.consecutiveCourt1Rounds === 1 ? '' : 's'} on Court 1`);
  if (entry.recentFairnessBurden > 0) reasons.push(`recent fairness burden ${entry.recentFairnessBurden}`);
  return reasons.join(', ');
}
