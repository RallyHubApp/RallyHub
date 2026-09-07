export const KOTC_ENGINE_VERSION = '2.0.0-alpha.1';
export const KOTC_RULES_VERSION = '1.2.0';

export const SESSION_STATUSES = Object.freeze([
  'draft',
  'ready',
  'in_progress',
  'paused',
  'completed',
  'finalised',
  'abandoned',
  'cancelled',
]);

export const ROUND_STATUSES = Object.freeze([
  'proposed',
  'confirmed',
  'started',
  'completed',
  'superseded',
  'abandoned',
]);

export const MATCH_STATUSES = Object.freeze([
  'scheduled',
  'in_progress',
  'completed',
  'retired',
  'abandoned',
  'not_played',
]);

export const PARTICIPANT_STATUSES = Object.freeze([
  'registered',
  'confirmed',
  'present',
  'late_not_arrived',
  'temporarily_unavailable',
  'voluntary_rest',
  'injured',
  'leaving_early',
  'left',
  'no_show',
  'withdrawn',
  'replaced',
]);

export const SESSION_TRANSITIONS = Object.freeze({
  draft: ['ready', 'cancelled'],
  ready: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'completed', 'abandoned'],
  paused: ['in_progress', 'completed', 'abandoned'],
  completed: ['finalised', 'in_progress'],
  finalised: [],
  abandoned: [],
  cancelled: [],
});

export const ROUND_TRANSITIONS = Object.freeze({
  proposed: ['confirmed', 'superseded', 'abandoned'],
  confirmed: ['started', 'superseded', 'abandoned'],
  started: ['completed', 'abandoned'],
  completed: [],
  superseded: [],
  abandoned: [],
});

export const DEFAULT_FAIRNESS_POLICY = Object.freeze({
  version: KOTC_RULES_VERSION,
  avoidConsecutiveFairnessBench: true,
  avoidSecondFairnessBenchUntilCycleComplete: true,
  protectJustReturnedFromFairnessBench: true,
  maxOneFairnessBenchPerSessionWhereAchievable: true,
  voluntaryRestEarnsFairnessCredit: false,
  temporaryAbsenceEarnsFairnessCredit: false,
  injuryEarnsFairnessCredit: false,
  recentHistoryScope: 'template_series',
  recentHistorySessionCount: 4,
  court1TenurePriorityAfterRounds: 2,
  minimiseLadderDisruptionAsTieBreak: true,
});

export const DEFAULT_LEADERBOARD_POLICY = Object.freeze({
  version: KOTC_RULES_VERSION,
  rankingFields: ['points', 'wins', 'score_difference', 'points_for', 'court1_wins'],
  doublesAwards: {
    gold: [1, 2],
    silver: [3, 4],
    bronze: [5, 6],
  },
  singlesAwards: {
    gold: [1],
    silver: [2],
    bronze: [3],
  },
  court1ChampionsSeparateRecognition: true,
});

export function canTransitionSession(fromStatus, toStatus) {
  return SESSION_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

export function canTransitionRound(fromStatus, toStatus) {
  return ROUND_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

export function activeCourtCount(activePresentPlayers, venueCourtLimit) {
  if (!Number.isInteger(activePresentPlayers) || activePresentPlayers < 0) {
    throw new Error('activePresentPlayers must be a non-negative integer');
  }
  if (!Number.isInteger(venueCourtLimit) || venueCourtLimit < 0) {
    throw new Error('venueCourtLimit must be a non-negative integer');
  }
  return Math.min(venueCourtLimit, Math.floor(activePresentPlayers / 4));
}

export function benchCount(activePresentPlayers, venueCourtLimit) {
  return activePresentPlayers - activeCourtCount(activePresentPlayers, venueCourtLimit) * 4;
}

export function isParticipantEligibleForRound(participant, roundNumber) {
  if (!participant || !Number.isInteger(roundNumber) || roundNumber < 1) return false;

  const startRound = participant.availability_effective_from_round ?? participant.joined_at_round ?? 1;
  if (roundNumber < startRound) return false;

  if (participant.left_after_round != null && roundNumber > participant.left_after_round) return false;

  const unavailableStatuses = new Set([
    'late_not_arrived',
    'temporarily_unavailable',
    'voluntary_rest',
    'injured',
    'left',
    'no_show',
    'withdrawn',
    'replaced',
  ]);

  if (unavailableStatuses.has(participant.status)) {
    const returnRound = participant.available_again_from_round;
    return Number.isInteger(returnRound) && roundNumber >= returnRound;
  }

  return ['confirmed', 'present', 'leaving_early'].includes(participant.status);
}

export function podiumGroupForRank(rank, partnershipMode = 'rotating_doubles') {
  if (!Number.isInteger(rank) || rank < 1) return 'none';

  if (partnershipMode === 'singles') {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'none';
  }

  if (rank <= 2) return 'gold';
  if (rank <= 4) return 'silver';
  if (rank <= 6) return 'bronze';
  return 'none';
}

export function validateRoundLayout({ slots, eligibleParticipantIds, activeCourts }) {
  const errors = [];
  const expectedSlotCount = activeCourts * 4;
  const playerSlots = slots ?? [];

  if (playerSlots.length !== expectedSlotCount) {
    errors.push(`Expected ${expectedSlotCount} court slots, found ${playerSlots.length}`);
  }

  const participantIds = playerSlots.map((slot) => slot.participant_id).filter(Boolean);
  const duplicateIds = participantIds.filter((id, index) => participantIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate participant assignment: ${[...new Set(duplicateIds)].join(', ')}`);
  }

  const courtCounts = new Map();
  for (const slot of playerSlots) {
    const courtRank = slot.ladder_court_rank;
    courtCounts.set(courtRank, (courtCounts.get(courtRank) ?? 0) + 1);
  }
  for (let courtRank = 1; courtRank <= activeCourts; courtRank += 1) {
    if ((courtCounts.get(courtRank) ?? 0) !== 4) {
      errors.push(`Court ${courtRank} does not contain exactly four players`);
    }
  }

  const eligibleSet = new Set(eligibleParticipantIds ?? []);
  for (const id of participantIds) {
    if (!eligibleSet.has(id)) {
      errors.push(`Ineligible participant assigned to court: ${id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertRoundLayout(input) {
  const result = validateRoundLayout(input);
  if (!result.valid) {
    throw new Error(`KOTC round invariant failure: ${result.errors.join('; ')}`);
  }
  return true;
}
