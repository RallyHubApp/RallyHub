import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gate = JSON.parse(fs.readFileSync(path.join(root, 'testing/control-pack/risk-gate.json'), 'utf8'));
const briefPath = process.argv[2];
if (!briefPath) {
  console.error('Usage: node testing/control-pack/evaluateRiskGate.mjs <test-run-brief.json>');
  process.exit(2);
}
const brief = JSON.parse(fs.readFileSync(path.resolve(root, briefPath), 'utf8'));
const ranks = gate.depth_rank;
const flags = new Set(brief?.risk_gate?.risk_flags || []);

let required = gate.default_depth;
const reasons = [];
const escalations = new Set();

const hit = (items = []) => items.filter((item) => flags.has(item));
const rcHits = hit(gate.release_candidate_triggers);
const deepHits = hit(gate.deep_triggers);
const standardHits = hit(gate.standard_triggers);

if (rcHits.length) {
  required = 'RC';
  reasons.push(`RC trigger(s): ${rcHits.join(', ')}`);
} else if (deepHits.length) {
  required = 'D';
  reasons.push(`Deep trigger(s): ${deepHits.join(', ')}`);
} else if (standardHits.length) {
  required = 'S';
  reasons.push(`Standard trigger(s): ${standardHits.join(', ')}`);
} else {
  const quickFlags = gate.quick_only_when_all;
  const quick = quickFlags.every((item) => flags.has(item));
  if (quick) {
    required = 'Q';
    reasons.push('All Quick-only conditions satisfied.');
  } else {
    required = gate.default_depth;
    reasons.push(`No safe Quick-only proof; defaulting to ${gate.default_depth}.`);
  }
}

for (const flag of flags) {
  for (const req of gate.required_escalations?.[flag] || []) escalations.add(req);
}

const requested = brief?.risk_gate?.requested_depth || '';
const protocolOk = brief?.protocol_versions?.master_testing_blueprint === gate.master_blueprint_version;
const declarationOk = brief?.protocol_declaration_accepted === true;
const targetIdentified = Boolean(brief?.target_build?.commit_hash || brief?.target_build?.checkpoint_id || brief?.target_build?.release_marker_or_asset_hash);
const depthOk = ranks[requested] >= ranks[required];

const result = {
  run_id: brief.run_id,
  minimum_required_depth: required,
  requested_depth: requested,
  depth_passed: depthOk,
  protocol_version_passed: protocolOk,
  protocol_declaration_passed: declarationOk,
  target_build_identified: targetIdentified,
  required_escalations: [...escalations],
  reasons,
  gate_passed: Boolean(depthOk && protocolOk && declarationOk && targetIdentified)
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.gate_passed ? 0 : 1);
