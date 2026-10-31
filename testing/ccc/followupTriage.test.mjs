import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {triageFollowupCandidates} from '../../src/lib/ccc/followupTriage.mjs';
const candidate=(id,email,reasons=[])=>({registrationId:id,name:id,email,reviewReasons:reasons,sendEligible:true});
test('follow-up triage never authorises sending even with superficially valid input',()=>{
 const r=triageFollowupCandidates([candidate('a','a@example.com',[])]);
 assert.equal(r.rows[0].sendEligible,false);assert.equal(r.deliveryEnabled,false);assert.equal(r.readyToSend,0);
});
test('invalid email and duplicate email reasons are counted independently',()=>{
 const r=triageFollowupCandidates([candidate('a','invalid',['consent_not_verified']),candidate('b','b@example.com',['duplicate_email','suppression_not_verified'])]);
 assert.equal(r.counts.invalidEmail,1);assert.equal(r.counts.duplicateEmail,1);assert.equal(r.counts.consentReview,1);assert.equal(r.counts.suppressionReview,1);
});
test('duplicate registration IDs do not inflate review counts',()=>{
 const r=triageFollowupCandidates([candidate('a','a@example.com'),candidate('a','a@example.com')]);assert.equal(r.counts.total,1);
});
test('partial reads retain incomplete state and cannot imply permission',()=>{
 const r=triageFollowupCandidates([candidate('a','a@example.com')],{complete:false});assert.equal(r.complete,false);assert.equal(r.rows[0].sendEligible,false);
});
test('frontend review is read-only and retains scoped backend action',()=>{
 const ui=readFileSync(new URL('../../src/components/ccc/ClubEventFollowupCandidates.jsx',import.meta.url),'utf8');
 assert.match(ui,/action:'followup_candidates'/);assert.match(ui,/tenantId,clubId,activityId/);
 assert.match(ui,/triageFollowupCandidates/);assert.doesNotMatch(ui,/followup_send|sendEmail|\.create\(/);
});
