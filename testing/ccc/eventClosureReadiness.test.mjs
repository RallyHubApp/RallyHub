import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewEventClosure} from '../../src/lib/ccc/eventClosureReadiness.mjs';
const registration=(id,attendance='attended')=>({id,status:'confirmed',attendance,attendanceRevision:1});
const finance={complete:true,requiresReview:false,anomalies:[]};
test('complete internal roster and finance still never imply external settlement or delivery authorisation',()=>{
 const result=reviewEventClosure([registration('r1')],{hasMore:false,paymentReadComplete:true,finance,activityStatus:'completed'});
 assert.equal(result.operationallyReconciled,true);assert.equal(result.releaseApproved,false);assert.equal(result.deliveryApproved,false);assert.equal(result.passed,5);assert.equal(result.required,8);
});
test('incomplete roster blocks attendance and operational close-out',()=>{
 const result=reviewEventClosure([registration('r1')],{hasMore:true,paymentReadComplete:true,finance,activityStatus:'completed'});
 assert.equal(result.operationallyReconciled,false);assert.ok(result.open.includes('roster_complete'));assert.ok(result.open.includes('attendance_reconciled'));
});
test('unmarked confirmed attendance is not inferred to be a no-show',()=>{
 const result=reviewEventClosure([registration('r1','not_marked')],{hasMore:false,paymentReadComplete:true,finance,activityStatus:'completed'});
 assert.ok(result.open.includes('attendance_reconciled'));assert.equal(result.attendance.counts.noShow,0);
});
test('duplicate roster and payment exceptions prevent reconciliation',()=>{
 const result=reviewEventClosure([registration('r1'),registration('r1')],{hasMore:false,paymentReadComplete:true,finance:{complete:true,requiresReview:true,anomalies:[{code:'duplicate'}]},activityStatus:'completed'});
 assert.equal(result.operationallyReconciled,false);assert.ok(result.open.includes('roster_complete'));assert.ok(result.open.includes('financial_exceptions_clear'));
});
test('unknown activity state cannot be treated as completed',()=>{
 const result=reviewEventClosure([registration('r1')],{hasMore:false,paymentReadComplete:true,finance});assert.ok(result.open.includes('activity_completed'));
});
test('close-out UI is integrated without mutations or sends',()=>{
 const parent=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../../src/components/ccc/ClubEventClosureReview.jsx',import.meta.url),'utf8');
 assert.match(parent,/ClubEventClosureReview/);assert.match(parent,/registrations=\{loaded\}/);assert.doesNotMatch(ui,/base44\.functions|sendEmail|\.create\(/);
});
