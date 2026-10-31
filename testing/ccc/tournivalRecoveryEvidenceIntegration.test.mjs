import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/tournivalOrganiserHealth/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/tournival/TournivalView.jsx',import.meta.url),'utf8');
test('recovery evidence is derived from scoped backend preview',()=>{assert.match(backend,/summariseTournivalRecoveryEvidence\(preview\)/);assert.match(backend,/success:true,preview,evidence/);});
test('organiser sees revision gap and match/result counts',()=>{assert.match(ui,/recoveryEvidence\.revisionGap/);assert.match(ui,/recoveryEvidence\.matchCount/);assert.match(ui,/recoveryEvidence\.resultCount/);});
test('stale evidence is reset when switching tournament',()=>assert.match(ui,/setRecoveryEvidence\(null\)/));
