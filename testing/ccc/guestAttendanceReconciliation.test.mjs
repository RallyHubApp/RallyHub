import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reconcileGuestSession} from '../../src/lib/ccc/guestAttendanceReconciliation.mjs';
const row=(id,status='confirmed')=>({id,full_name:id,booking_status:status});
test('guest reconciliation distinguishes attended, no-show, cancelled and outstanding',()=>{
 const r=reconcileGuestSession([row('a'),row('b','cash_due'),row('c'),row('d'),row('e','pending')],{a:'attended',b:'no_show',c:'cancelled'});
 assert.deepEqual(r.counts,{eligible:4,attended:1,noShow:1,cancelled:1,unconfirmed:1,excluded:1,duplicates:0});
 assert.deepEqual(r.outstanding.map(x=>x.id),['d']);assert.equal(r.complete,false);
});
test('no-shows are never inferred and excluded bookings cannot be checked in',()=>{
 const r=reconcileGuestSession([row('a'),row('b','pending')],{});
 assert.equal(r.counts.noShow,0);assert.equal(r.counts.unconfirmed,1);assert.equal(r.counts.excluded,1);
});
test('duplicate IDs block reconciliation closure',()=>{
 const r=reconcileGuestSession([row('a'),row('a')],{a:'attended'});
 assert.equal(r.counts.attended,1);assert.equal(r.counts.duplicates,1);assert.equal(r.complete,false);
});
test('all explicitly marked bookings close guest reconciliation',()=>{
 assert.equal(reconcileGuestSession([row('a')],{a:'attended'}).complete,true);
});
test('guest attendance UI uses the existing session-scoped save handler',()=>{
 const parent=readFileSync(new URL('../../src/components/communications/GuestAttendanceFollowup.jsx',import.meta.url),'utf8');
 const child=readFileSync(new URL('../../src/components/communications/GuestSessionReconciliation.jsx',import.meta.url),'utf8');
 assert.match(parent,/GuestSessionReconciliation/);assert.match(parent,/onMark=\{update\}/);
 assert.match(parent,/action:'attendance_save'/);assert.match(child,/onMark\(item\.id,item\.status\)/);
 assert.doesNotMatch(child,/\.create\(|sendEmail|followup_send/);
});
