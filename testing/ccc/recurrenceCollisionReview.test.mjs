import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewDraftResourceCollisions} from '../../base44/functions/cccActivity/recurrenceCollisionReview.mjs';
const draft=(id,source,starts_at,ends_at,court_id='')=>({id,tenant_id:'t',club_id:'c',venue_id:'v',court_id,status:'draft',starts_at,ends_at,configuration:{recurrence_source_activity_id:source}});
test('overlapping drafts from different sources are flagged, without claiming a reservation',()=>{
 const r=reviewDraftResourceCollisions([draft('a','s1','2026-11-01T19:00','2026-11-01T20:00'),draft('b','s2','2026-11-01T19:30','2026-11-01T20:30')],{complete:true});
 assert.equal(r.collisionCount,1);assert.equal(r.venueReservationConfirmed,false);assert.equal(r.readOnly,true);
});
test('half-open boundaries, different courts and same-source drafts are not conflicts',()=>{
 const a=draft('a','s1','2026-11-01T19:00','2026-11-01T20:00','court1');
 for(const b of [draft('b','s2','2026-11-01T20:00','2026-11-01T21:00','court1'),draft('b','s2','2026-11-01T19:00','2026-11-01T20:00','court2'),draft('b','s1','2026-11-01T19:00','2026-11-01T20:00','court1')])assert.equal(reviewDraftResourceCollisions([a,b],{complete:true}).collisionCount,0);
});
test('tenant and club isolation and invalid schedule are enforced',()=>{
 const a=draft('a','s1','2026-11-01T19:00','2026-11-01T20:00');
 const other={...draft('b','s2','2026-11-01T19:00','2026-11-01T20:00'),club_id:'other'};
 assert.equal(reviewDraftResourceCollisions([a,other]).collisionCount,0);
 const bad=draft('bad','s3','invalid','invalid');
 const r=reviewDraftResourceCollisions([bad],{complete:false});
 assert.deepEqual(r.invalidDraftIds,['bad']);assert.equal(r.resultsMayBeTruncated,true);
});
