import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildDirectorySetupProgress } from '../../src/lib/directory-guided-setup.js';
const backend = readFileSync('base44/functions/directoryListingProfile/entry.ts','utf8');
const client = readFileSync('src/pages/DirectoryListingEdit.jsx','utf8');

test('coach coverage entered in guided setup is sanitised and saved', () => {
  assert.match(backend, /serviceArea: nullable\(input\?\.serviceArea, 240\)/);
  const steps = buildDirectorySetupProgress({
    listingType:'coach', visibility:'public',
    profile:{name:'Sample Coach',description:'A legitimate coaching profile description',photoUrl:'https://example.com/a.jpg',serviceArea:'Munster',contact:{email:'sample@example.com'}}
  }).steps;
  assert.equal(steps.find(x=>x.id==='location').complete,true);
});
test('completed coach review stays complete even when optional or older fields are absent', () => {
  const progress = buildDirectorySetupProgress({listingType:'coach',visibility:'public',profile:{name:'Sample Coach',description:'A legitimate coaching profile description',photoUrl:'https://example.com/a.jpg',contact:{email:'sample@example.com'}},setup:{review:{completedAt:'2026-10-26T22:45:56Z'}}});
  assert.equal(progress.steps.find(x=>x.id==='review').complete,true);
  assert.equal(progress.steps.find(x=>x.id==='events').optional,true);
  assert.match(backend,/directory_guided_completion_email_reserved/);
  assert.match(backend,/setup\.review=\{completedAt:now/);
});
test('numbered step navigation is interactive and stays in coach guided setup', () => {
  assert.match(client,/aria-label="Numbered setup steps"/);
  assert.match(client,/onClick=\{\(\) => openGuidedStep\(setupProgress.steps\[index\]\)\}/);
  assert.match(client,/aria-current=\{index===guidedStep\?'step':undefined\}/);
});
test('completion email first name and signature are normalised at send time', () => {
  assert.match(backend,/const firstName = clean\(user\.full_name/);
  assert.match(backend,/\.replace\(\/\^Hi\\s\+\[\^,\\n\]\+,\/i/);
  assert.match(backend,/Yours in sport/);
  assert.match(backend,/\.replace\(\/\\n\\s\*Yours in sport,\?\\s\*\$\/i,''\)/);
});
