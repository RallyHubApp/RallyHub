import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewLegacySessionOverlaps} from '../../base44/functions/cccActivity/legacySessionReview.mjs';
const occurrences=[{week:1,startsAt:'2026-11-02T19:00',endsAt:'2026-11-02T20:30'},{week:2,startsAt:'2026-11-09T19:00',endsAt:'2026-11-09T20:30'}];
const session={id:'s1',tenant_id:'t1',club_id:'c1',venue_name:'Doora-Barefield',venue_key:'doora_barefield',session_date:'2026-11-02',start_time:'19:30',end_time:'20:30',active:true};
const review=(sessions,opts={})=>reviewLegacySessionOverlaps(occurrences,sessions,{tenantId:'t1',clubId:'c1',venueName:'Doora Barefield',complete:true,...opts});
test('detects legacy guest-session collision by normalised venue, even for a different court',()=>{
 const r=review([session]);assert.equal(r.conflictedWeeks,1);assert.equal(r.ready,false);
 assert.deepEqual(r.occurrences[0].legacyOverlaps,[{sessionId:'s1',status:'active'}]);
});
test('closed session reserves hall; archived and different venue do not',()=>{
 assert.equal(review([{...session,active:false}]).conflictedWeeks,1);
 assert.equal(review([{...session,archived_at:'2026-11-01'}]).conflictedWeeks,0);
 assert.equal(review([{...session,venue_name:'Ennistymon',venue_key:'ennistymon'}]).conflictedWeeks,0);
});
test('tenant and club isolation, half-open time boundaries',()=>{
 assert.equal(review([{...session,club_id:'c2'},{...session,id:'s2',tenant_id:'t2'}]).conflictedWeeks,0);
 assert.equal(review([{...session,start_time:'20:30',end_time:'21:00'}]).conflictedWeeks,0);
});
test('incomplete inventory and malformed overlapping sessions fail readiness closed',()=>{
 assert.equal(review([],{complete:false}).ready,false);
 const r=review([{...session,venue_name:'',venue_key:'',start_time:'19:00'}]);
 assert.equal(r.unmappedWeeks,1);assert.equal(r.ready,false);
});
