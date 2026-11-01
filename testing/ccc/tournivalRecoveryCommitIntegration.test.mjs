import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/tournivalOrganiserHealth/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/tournival/TournivalView.jsx',import.meta.url),'utf8');
test('recovery endpoint reuses club-admin grants and CAS update',()=>{assert.match(backend,/canReviewTournivalHealth/);assert.match(backend,/commitTournivalMirrorRecovery/);assert.match(backend,/Tournament\.updateMany/);});
test('organiser must explicitly confirm recovery and provide both revisions',()=>{assert.match(ui,/recoveryConfirmed/);assert.match(ui,/confirmRecovery:true/);assert.match(ui,/expectedSessionRevision:recoveryEvidence.toRevision/);assert.match(ui,/expectedMirrorRevision:recoveryEvidence.fromRevision/);});
test('recovery invalidates tournament state after successful write',()=>assert.match(ui,/Tournament mirror reconciled; review integrity again/));
