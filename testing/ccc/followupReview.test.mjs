import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFollowupReview} from '../../base44/functions/cccActivity/followupReview.mjs';
const row=(id,email,overrides={})=>({id,full_name:'Player '+id,email,attendance_status:'attended',registration_status:'confirmed',...overrides});
test('follow-up review includes attended confirmed and cash-confirmed only',()=>{
 const result=buildFollowupReview([row('1','one@example.ie'),row('2','two@example.ie',{registration_status:'cash_confirmed'}),row('3','three@example.ie',{attendance_status:'no_show'}),row('4','four@example.ie',{registration_status:'waitlisted'})]);
 assert.deepEqual(result.candidates.map(c=>c.registrationId),['1','2']);
 assert.equal(result.deliveryEnabled,false);
});
test('duplicate addresses are flagged case-insensitively',()=>{
 const result=buildFollowupReview([row('1','ONE@example.ie'),row('2','one@example.ie')]);
 assert.ok(result.candidates[1].reviewReasons.includes('duplicate_email'));
});
test('missing and invalid emails are flagged, not eligible',()=>{
 const result=buildFollowupReview([row('1',''),row('2','not-email')]);
 for(const candidate of result.candidates){assert.equal(candidate.hasEmail,false);assert.equal(candidate.sendEligible,false);assert.ok(candidate.reviewReasons.includes('email_missing_or_invalid'))}
});
test('valid address never implies consent or suppression clearance',()=>{
 const result=buildFollowupReview([row('1','one@example.ie')]);
 assert.deepEqual(result.candidates[0].reviewReasons,['consent_not_verified','suppression_not_verified','approved_template_not_verified']);
 assert.equal(result.candidates[0].sendEligible,false);
 assert.equal(result.consentAndSuppressionNotChecked,true);
});
