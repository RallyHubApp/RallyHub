import test from 'node:test';
import assert from 'node:assert/strict';
import {actionCentreItems,actionCentreCounts} from '../../src/lib/ccc/actionCentre.js';
const scoped=(id,extra={})=>({id,tenant_id:'t',club_id:'c',...extra});
test('only selected tenant and club appear in action centre',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',guestBookings:[scoped('1',{booking_status:'pending_payment'}),scoped('2',{tenant_id:'other',booking_status:'pending_payment'}),scoped('3',{club_id:'other',booking_status:'pending_payment'})]});
 assert.deepEqual(items.map(x=>x.id),['guest:1']);
});
test('real schema statuses prioritise failures, approvals, payments and waitlist',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',memberships:[scoped('m',{status:'payment_failed'}),scoped('a',{status:'submitted'})],guestBookings:[scoped('g',{booking_status:'pending_payment'})],eventRegistrations:[scoped('w',{registration_status:'waitlisted'})]});
 assert.deepEqual(items.map(i=>i.type),['membership_payment_failed','membership_approval','guest_payment','event_waitlist']);
 assert.deepEqual(actionCentreCounts(items),{total:4,approvals:1,payments:2,waitlist:1});
});
test('paid, cancelled and completed records are not action items',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',memberships:[scoped('m',{status:'paid'})],guestBookings:[scoped('g',{booking_status:'cancelled',payment_status:'failed'})],eventRegistrations:[scoped('e',{registration_status:'confirmed'})]});
 assert.deepEqual(items,[]);
});
test('one record yields only one highest-priority action',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',memberships:[scoped('m',{status:'pending_payment',payment_status:'failed'})]});
 assert.deepEqual(items.map(x=>x.type),['membership_payment_failed']);
});
test('missing scope fails closed',()=>assert.deepEqual(actionCentreItems({guestBookings:[scoped('g',{booking_status:'pending_payment'})]}),[]));
