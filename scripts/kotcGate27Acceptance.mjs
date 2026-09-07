import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KOTC_ENGINE_VERSION, KOTC_RULES_VERSION, DEFAULT_LEADERBOARD_POLICY } from '../src/lib/kotcV2Domain.js';
import { computeKotcV2Leaderboard, resolveCourt1Champions } from '../src/lib/kotcV2Results.js';

let checks = 0;
const ok = (value, message) => { checks += 1; assert.ok(value, message); };

ok(KOTC_ENGINE_VERSION === '2.0.0-rc.1', 'Engine must be promoted to rc.1');
ok(KOTC_RULES_VERSION === '1.2.0', 'Rules version must remain 1.2.0');
assert.deepEqual(DEFAULT_LEADERBOARD_POLICY.rankingFields, [
  'points','wins','score_difference','points_for','court1_wins','final_court_rank','court1_rounds','seed_rank',
]); checks += 1;
ok(DEFAULT_LEADERBOARD_POLICY.court1ChampionsRule === 'winning_pair_final_completed_court1_match');

const participants = Array.from({ length: 8 }, (_, i) => ({ id: `p${i + 1}`, display_name: `P${i + 1}`, seed_rank: i + 1 }));
const matches = [
  { id:'r1c1', round_number:1, ladder_court_rank:1, status:'completed', team_a_participant_ids:['p1','p2'], team_b_participant_ids:['p3','p4'], team_a_score:8, team_b_score:6, winner_side:'A' },
  { id:'r1c2', round_number:1, ladder_court_rank:2, status:'completed', team_a_participant_ids:['p5','p6'], team_b_participant_ids:['p7','p8'], team_a_score:5, team_b_score:8, winner_side:'B' },
  { id:'r2c1', round_number:2, ladder_court_rank:1, status:'completed', team_a_participant_ids:['p1','p3'], team_b_participant_ids:['p7','p8'], team_a_score:7, team_b_score:9, winner_side:'B' },
  { id:'r2c2', round_number:2, ladder_court_rank:2, status:'completed', team_a_participant_ids:['p2','p4'], team_b_participant_ids:['p5','p6'], team_a_score:8, team_b_score:4, winner_side:'A' },
];
const board = computeKotcV2Leaderboard({ participants, matches });
ok(board.length === 8);
ok(board.every((row, index) => row.final_rank === index + 1));
ok(board[0].points >= board[1].points);
ok(board.filter(r => r.podium_group === 'gold').length === 2);
ok(board.filter(r => r.podium_group === 'silver').length === 2);
ok(board.filter(r => r.podium_group === 'bronze').length === 2);

const champs = resolveCourt1Champions({ matches, enabled:true });
ok(champs.awarded);
assert.deepEqual(champs.participantIds, ['p7','p8']); checks += 1;
ok(champs.roundNumber === 2);
ok(!resolveCourt1Champions({ matches, enabled:false }).awarded);
ok(!resolveCourt1Champions({ matches:[...matches.filter(m=>m.id!=='r2c1'), { ...matches.find(m=>m.id==='r2c1'), status:'abandoned' }], enabled:true }).awarded);

// No unseeded randomness may exist in V2 sporting/runtime modules.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
for (const name of ['kotcV2Domain.js','kotcV2Engine.js','kotcV2Fairness.js','kotcV2Workflow.js','kotcV2Results.js','kotcV2Simulator.js']) {
  const text = fs.readFileSync(path.join(root, 'src/lib', name), 'utf8');
  ok(!text.includes('Math.random('), `${name} contains unseeded Math.random()`);
}

// Explicitly guard against the old recovery defect entering V2 code.
for (const name of ['kotcV2Workflow.js','kotcV2Simulator.js','kotcV2Results.js']) {
  const text = fs.readFileSync(path.join(root, 'src/lib', name), 'utf8');
  ok(!/missing.{0,80}team.?a.{0,80}win/i.test(text), `${name} appears to fabricate a default Team A result`);
}

console.log(`KOTC Gate 2.7 engine acceptance: PASS\n${checks} release-candidate acceptance checks, 0 failures.\nEngine ${KOTC_ENGINE_VERSION}; rules ${KOTC_RULES_VERSION}.`);
