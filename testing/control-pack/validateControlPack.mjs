import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = path.join(root, 'testing/control-pack');
const manifestPath = path.join(base, 'testing-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const gate = JSON.parse(fs.readFileSync(path.join(base, 'risk-gate.json'), 'utf8'));
const errors = [];

for (const [name, rel] of Object.entries(manifest.required_artifacts || {})) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) errors.push(`Missing required artifact ${name}: ${rel}`);
}

if (manifest.master_blueprint_version !== gate.master_blueprint_version) {
  errors.push(`Blueprint version mismatch: manifest=${manifest.master_blueprint_version}, risk gate=${gate.master_blueprint_version}`);
}

for (const jsonFile of ['testing-manifest.json', 'risk-gate.json', 'test-run-brief.template.json', 'evidence-report.template.json']) {
  try {
    JSON.parse(fs.readFileSync(path.join(base, jsonFile), 'utf8'));
  } catch (error) {
    errors.push(`Invalid JSON ${jsonFile}: ${error.message}`);
  }
}

const expectedStates = ['PASS', 'PASS-WITH-LIMITATION', 'FAIL', 'BLOCKED'];
for (const state of expectedStates) {
  if (!manifest.result_states?.includes(state)) errors.push(`Missing result state: ${state}`);
}

const expectedDepths = ['Q', 'S', 'D', 'RC', 'LIVE'];
for (const depth of expectedDepths) {
  if (!manifest.test_depths?.includes(depth)) errors.push(`Missing test depth: ${depth}`);
  if (!gate.depth_rank?.[depth]) errors.push(`Risk gate missing depth rank: ${depth}`);
}

if (errors.length) {
  console.error('RallyHub Testing Control Pack: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`RallyHub Testing Control Pack: PASS`);
console.log(`Blueprint v${manifest.master_blueprint_version} | Control Pack v${manifest.control_pack_version}`);
console.log(`${Object.keys(manifest.required_artifacts).length} required artifacts present; JSON and core enums valid.`);
