import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [briefArg, evidenceArg] = process.argv.slice(2);
if (!briefArg || !evidenceArg) {
  console.error('Usage: node testing/control-pack/validateEvidence.mjs <test-run-brief.json> <evidence-report.json>');
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'testing/control-pack/testing-manifest.json'), 'utf8'));
const gate = JSON.parse(fs.readFileSync(path.join(root, 'testing/control-pack/risk-gate.json'), 'utf8'));
const brief = JSON.parse(fs.readFileSync(path.resolve(root, briefArg), 'utf8'));
const evidence = JSON.parse(fs.readFileSync(path.resolve(root, evidenceArg), 'utf8'));
const errors = [];
const blocks = [];

if (!brief.run_id || evidence.run_id !== brief.run_id) errors.push('Evidence run_id does not match the Test Run Brief.');
if (brief.protocol_versions?.master_testing_blueprint !== manifest.master_blueprint_version) errors.push('Brief blueprint version is not current.');
if (evidence.protocol_versions?.master_testing_blueprint !== manifest.master_blueprint_version) errors.push('Evidence blueprint version is not current.');
if (brief.protocol_versions?.testing_control_pack !== manifest.control_pack_version) errors.push('Brief Control Pack version is not current.');
if (evidence.protocol_versions?.testing_control_pack !== manifest.control_pack_version) errors.push('Evidence Control Pack version is not current.');

const ranks = gate.depth_rank;
const requiredDepth = evidence.risk_gate_result?.minimum_required_depth || brief.risk_gate?.minimum_required_depth;
const actualDepth = evidence.risk_gate_result?.actual_depth || evidence.selected_depth;
if (!requiredDepth || !ranks[requiredDepth]) errors.push('Minimum required depth is missing or invalid.');
if (!actualDepth || !ranks[actualDepth]) errors.push('Actual test depth is missing or invalid.');
if (ranks[actualDepth] < ranks[requiredDepth]) blocks.push(`Actual test depth ${actualDepth} is below required depth ${requiredDepth}.`);

const evidenceById = new Map((evidence.test_cases || []).map((test) => [test.test_id, test]));
for (const planned of brief.planned_test_cases || []) {
  if (!planned.mandatory) continue;
  const actual = evidenceById.get(planned.test_id);
  if (!actual) {
    blocks.push(`Missing mandatory test case ${planned.test_id}.`);
    continue;
  }
  if (!manifest.result_states.includes(actual.status)) errors.push(`Invalid status for ${planned.test_id}: ${actual.status}`);
  if (actual.status === 'FAIL') blocks.push(`Mandatory test ${planned.test_id} failed.`);
  if (actual.status === 'BLOCKED') blocks.push(`Mandatory test ${planned.test_id} is blocked.`);
  if (!Array.isArray(actual.evidence) || actual.evidence.length === 0) blocks.push(`Mandatory test ${planned.test_id} has no evidence.`);
}

const unresolvedP0 = Number(evidence.release_gate?.unresolved_P0 || 0);
const unresolvedP1 = Number(evidence.release_gate?.unresolved_P1 || 0);
if (unresolvedP0 > 0) blocks.push(`${unresolvedP0} unresolved P0 defect(s).`);
if (unresolvedP1 > 0) blocks.push(`${unresolvedP1} unresolved P1 defect(s).`);
if (evidence.release_gate?.unresolved_security_or_tenant_isolation_failure) blocks.push('Unresolved security or tenant-isolation failure.');
if (!evidence.release_gate?.required_layers_complete) blocks.push('Required test layers are not complete.');
if (!evidence.persistence_proof?.tested_edits_present_in_persisted_source) blocks.push('Tested edits are not proven in persisted source.');
if (!evidence.persistence_proof?.commit_hash_verified && !evidence.persistence_proof?.checkpoint_id_verified) blocks.push('No persisted commit/checkpoint proof recorded.');

if (evidence.deployment_proof?.publish_claimed) {
  if (!evidence.deployment_proof?.production_fingerprint_checked) blocks.push('Deployment claimed without production fingerprint check.');
  if (!evidence.deployment_proof?.production_matches_release_candidate) blocks.push('Production does not match the release candidate or match is unproven.');
}

const releaseGatePassed = errors.length === 0 && blocks.length === 0;
const claimedReady = evidence.release_gate?.ready_to_publish === true;
if (claimedReady && !releaseGatePassed) errors.push('Evidence claims ready_to_publish=true but mandatory release conditions are not satisfied.');

console.log(JSON.stringify({
  run_id: brief.run_id,
  report_valid: errors.length === 0,
  release_gate_passed: releaseGatePassed,
  errors,
  blocking_reasons: blocks,
  final_verdict: evidence.final_verdict,
  final_release_state: evidence.final_release_state
}, null, 2));

process.exit(releaseGatePassed && errors.length === 0 ? 0 : 1);
