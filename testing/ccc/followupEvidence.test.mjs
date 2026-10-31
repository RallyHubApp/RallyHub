import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {followupEvidenceState} from '../../src/lib/ccc/followupEvidence.mjs';
const ui=readFileSync(new URL('../../src/components/ccc/ClubFollowupEvidenceReview.jsx',import.meta.url),'utf8');
test('missing evidence is not cleared',()=>{const result=followupEvidenceState(null);assert.equal(result.sendEligible,false);assert.equal(result.checked,false)});
test('even clear person evidence cannot clear endpoint or provider',()=>{const result=followupEvidenceState({issues:[],sendEligible:true});assert.equal(result.sendEligible,false);assert.ok(result.issues.includes('endpoint_suppression_not_checked'));assert.ok(result.issues.includes('provider_and_template_not_checked'))});
test('existing consent/suppression issues remain visible',()=>{const result=followupEvidenceState({issues:['active_suppression','preference_withdrawn']});assert.ok(result.issues.includes('active_suppression'));assert.ok(result.issues.includes('preference_withdrawn'))});
test('UI requires explicit Person ID, guards stale results, never sends',()=>{assert.match(ui,/person_communication_review/);assert.match(ui,/version\.current/);assert.match(ui,/request!==version\.current/);assert.doesNotMatch(ui,/followup_send|sendEmail|\.create\(/)});
