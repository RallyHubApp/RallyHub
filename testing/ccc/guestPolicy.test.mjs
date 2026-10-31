import test from 'node:test';
import assert from 'node:assert/strict';
import {guestVenueReview} from '../../base44/functions/cccActivity/guestPolicy.mjs';
const venue=(name)=>({id:'v1',tenant_id:'t1',club_id:'c1',status:'active',name});
const check=(name,experience,other={})=>guestVenueReview({tenantId:'t1',clubId:'c1',venue:venue(name),experience,...other});
test('experienced guests may request Ennis, Ennistymon, Shannon, Clarecastle and Corofin',()=>{
 for(const name of ['St. Josephs Doora Barefield GAA Club','Ennistymon Community Centre','Shannon','Clarecastle','Corofin (Clare) GAA Sports Hall'])assert.equal(check(name,'experienced').eligible,true,name);
});
test('beginners exclude Ennis but may request Ennistymon, Shannon, Clarecastle and Corofin',()=>{
 assert.equal(check('St. Josephs Doora Barefield GAA Club','beginner').eligible,false);
 for(const name of ['Ennistymon Community Centre','Shannon','Clarecastle','Corofin (Clare) GAA Sports Hall'])assert.equal(check(name,'beginner').eligible,true,name);
});
test('unknown venues, wrong club and closed sessions fail closed',()=>{
 assert.ok(check('Mystery venue','experienced').issues.includes('venue_policy_unmapped'));
 assert.ok(check('Shannon','experienced',{clubId:'c2'}).issues.includes('venue_outside_active_club'));
 assert.ok(check('Shannon','experienced',{sessionActive:false}).issues.includes('session_closed'));
});
test('review never creates a booking, payment or approval',()=>{
 const r=check('Shannon','beginner');assert.equal(r.approvalRequired,true);assert.equal(r.bookingCreated,false);assert.equal(r.paymentInitiated,false);
});
test('actual Clare venue display name is recognised as restricted Ennis',()=>{
 assert.ok(check("St. Joseph's Doora Barefield",'beginner').issues.includes('beginner_ennis_restricted'));
});
