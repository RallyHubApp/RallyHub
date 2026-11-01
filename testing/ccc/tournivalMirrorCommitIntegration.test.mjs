import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const entry=readFileSync(new URL('../../base44/functions/legacyTournamentManager/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/tournival/TournivalView.jsx',import.meta.url),'utf8');
test('legacy organiser save uses mirror projection after session CAS',()=>{assert.match(entry,/projectCommittedTournivalState/);assert.match(entry,/requiresReconciliation:projection.requiresReconciliation/);});
test('organiser is informed when committed scores need reconciliation',()=>assert.match(ui,/Scores saved; tournament display needs organiser reconciliation/));

test('post-commit communications never invalidate saved sporting state',()=>{assert.match(entry,/runTournivalPostCommitNotices/);assert.match(entry,/requiresCommunicationReview:notices.requiresCommunicationReview/);assert.match(ui,/Scores saved; results communications require review/);});
