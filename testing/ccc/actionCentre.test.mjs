import test from 'node:test';
import assert from 'node:assert/strict';
import {actionCentreItems,actionCentreCounts} from '../../src/lib/ccc/actionCentre.js';
test('only selected tenant and club appear in action centre',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',guestBookings:[
 {id:'1',tenant_id:'t',club_id:'c',registration_status:'pending_approval'},
 {id:'2',tenant_id:'other',club_id:'c',registration_status:'pending_approval'},
 {id:'3',tenant_id:'t',club_id:'other',registration_status:'pending_approval'}
 ]});
 assert.equal(items.length,1);assert.equal(items[0].id,'guest:1');
});
test('payment failures precede approvals and waiting lists',()=>{
 const items=actionCentreItems({tenantId:'t',clubId:'c',memberships:[{id:'m',tenant_id:'t',club_id:'c',status:'payment_failed'}],guestBookings:[{id:'g',tenant_id:'t',club_id:'c',registration_status:'pending_approval'},{id:'w',tenant_id:'t',club_id:'c',registration_status:'waitlisted'}]});
 assert.deepEqual(items.map(i=>i.type),['membership_payment_failed','guest_approval','guest_waitlist']);
 assert.deepEqual(actionCentreCounts(items),{total:3,approvals:1,payments:1,waitlist:1});
});
test('missing scope fails closed',()=>assert.deepEqual(actionCentreItems({guestBookings:[{id:'g',registration_status:'pending_approval'}]}),[]));
