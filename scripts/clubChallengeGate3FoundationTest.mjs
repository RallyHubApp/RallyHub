import assert from 'node:assert/strict';
import { generateClubChallengeFixtures } from '../src/lib/clubChallengeEngine.js';
import {
  createChallengeEventDraft,
  buildApprovedDraw,
  fixtureRecordsFromSchedule,
  prepareScoreMutation,
  scoreFromMatchRecords,
  replaceParticipantInFutureMatches,
  finalisationIssues,
} from '../src/lib/clubChallengeWorkflow.js';

const makeClub = (prefix, club) => Array.from({ length: 16 }, (_, i) => ({
  id: `${prefix}${i + 1}`,
  display_name: `${club} ${i + 1}`,
  name: `${club} ${i + 1}`,
  club,
  rank: i + 1,
  gender: i % 2 === 0 ? 'Male' : 'Female',
}));

const clare = makeClub('C', 'Clare');
const galway = makeClub('G', 'Galway');
const tournament = { id: 'T1', tenant_id: 'TENANT1', host_club_id: 'CLARECLUB' };
const eventDraft = createChallengeEventDraft({
  tournament,
  hostClub: { id: 'CLARECLUB', name: 'Clare', primary_colour: '#123456', secondary_colour: '#abcdef' },
  opponent: { name: 'Galway', primary_colour: '#654321', secondary_colour: '#fedcba' },
  setup: {
    courts: 4, availableMinutes: 180, playMinutes: 10, changeoverMinutes: 2,
    includeBreak: true, breakMinutes: 20, breakAfterRound: 6,
    matchFormat: { type: 'timed', drawsAllowed: true },
    winPoints: 2, drawPoints: 1, lossPoints: 0,
    compositionMode: 'open', showcaseEnabled: true, showcasePoints: 5, potEnabled: true,
  },
});
assert.equal(eventDraft.rules_version, '1.0');
assert.equal(eventDraft.play_minutes, 10);
assert.equal(eventDraft.changeover_minutes, 2);
assert.equal(eventDraft.showcase_points, 5);

const schedule = generateClubChallengeFixtures({ clubAPlayers: clare, clubBPlayers: galway, courts: 4, rounds: 12 });
const approved = buildApprovedDraw({ schedule, clubAPlayers: clare, clubBPlayers: galway, previousVersion: 0, approvedBy: 'Brian' });
assert.equal(approved.draw_version, 1);
assert.equal(approved.status, 'draw_approved');

const event = { id: 'CCE1', ...eventDraft, ...approved };
const participantMap = Object.fromEntries([...clare, ...galway].map(p => [p.id, p]));
let matches = fixtureRecordsFromSchedule({ event, schedule, participantMap });
assert.equal(matches.length, 48);
assert.equal(new Set(matches.map(m => `${m.round_number}-${m.court_number}`)).size, 48);
assert.ok(matches.every(m => m.revision === 0 && m.status === 'scheduled'));

// Two assistants scoring different matches must not collide because each match has its own revision.
const m1 = matches[0];
const m2 = matches[1];
const r1 = prepareScoreMutation({ match: m1, scoreA: 9, scoreB: 7, matchFormat: { type: 'timed', drawsAllowed: true }, expectedRevision: 0, userId: 'assistant-A' });
const r2 = prepareScoreMutation({ match: m2, scoreA: 8, scoreB: 8, matchFormat: { type: 'timed', drawsAllowed: true }, expectedRevision: 0, userId: 'assistant-B' });
assert.equal(r1.ok, true);
assert.equal(r2.ok, true);
matches[0] = { ...m1, ...r1.update };
matches[1] = { ...m2, ...r2.update };
assert.equal(matches[0].winner, 'club_a');
assert.equal(matches[1].winner, 'draw');

// Stale same-match edit is rejected at workflow level.
const stale = prepareScoreMutation({ match: matches[0], scoreA: 7, scoreB: 9, matchFormat: { type: 'timed', drawsAllowed: true }, expectedRevision: 0, userId: 'assistant-B' });
assert.equal(stale.ok, false);
assert.equal(stale.conflict, true);

// Authorised correction with current revision generates audit info.
const correction = prepareScoreMutation({ match: matches[0], scoreA: 10, scoreB: 7, matchFormat: { type: 'timed', drawsAllowed: true }, expectedRevision: 1, userId: 'organiser' });
assert.equal(correction.ok, true);
assert.ok(correction.audit);
assert.equal(correction.update.revision, 2);
matches[0] = { ...matches[0], ...correction.update };

// Score aggregate sees completed/drawn only.
const score = scoreFromMatchRecords(matches, { winPoints: 2, drawPoints: 1, lossPoints: 0 });
assert.equal(score.completedMatches, 2);
assert.equal(score.clubA, 3);
assert.equal(score.clubB, 1);

// Replacement changes future unplayed fixtures but never completed history.
const beforeCompleted = JSON.stringify(matches[0]);
const outgoing = 'C1';
const incoming = 'C99';
const replaced = replaceParticipantInFutureMatches({ matches, outgoingParticipantId: outgoing, incomingParticipantId: incoming, effectiveRound: 3 });
assert.equal(JSON.stringify(replaced[0]), beforeCompleted);
for (const m of replaced.filter(x => x.round_number >= 3 && !['completed','draw'].includes(x.status))) {
  assert.equal((m.club_a_participant_ids || []).includes(outgoing), false);
}

// Finalisation blocks unresolved matches, incomplete showcase and open POT.
const issues = finalisationIssues({ matches: replaced, showcaseEnabled: true, showcaseComplete: false, potEnabled: true, potStatus: 'open' });
assert.ok(issues.some(x => x.includes('match result')));
assert.ok(issues.some(x => x.includes('Showcase')));
assert.ok(issues.some(x => x.includes('voting')));

console.log('CLUB CHALLENGE v1.0 — GATE 3 FOUNDATION TEST PASS');
console.log('48 match records created; separate-match scoring, timed draw, stale-edit conflict, correction audit, score aggregation, future-only replacement and finalisation blockers all PASS.');
