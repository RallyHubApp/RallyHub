import test from 'node:test';
import assert from 'node:assert/strict';
import {countActiveEventRegistrations} from '../../base44/functions/eventRegistration/availabilityCount.mjs';
test('availability count requests only active and unexpired holds with full tenant/club scope',async()=>{
 const queries=[];const entity={async count(query){queries.push(query);return queries.length===1?12:3}};
 const result=await countActiveEventRegistrations(entity,{eventId:'e',tenantId:'t',clubId:'c',now:'2026-10-31T12:00:00.000Z'});
 assert.equal(result,15);assert.equal(queries.length,2);
 for(const query of queries)assert.equal(query.event_id,'e'),assert.equal(query.tenant_id,'t'),assert.equal(query.club_id,'c');
 assert.deepEqual(queries[0].registration_status.$in,['pending_approval','confirmed','cash_confirmed']);
 assert.equal(queries[1].payment_hold_expires_at.$gt,'2026-10-31T12:00:00.000Z');
});
test('availability rejects invalid count responses rather than claiming spare places',async()=>{
 const entity={async count(){return undefined}};
 await assert.rejects(()=>countActiveEventRegistrations(entity,{eventId:'e',tenantId:'t',clubId:'c'}),/invalid/);
});
test('availability requires scoped count support',async()=>{
 await assert.rejects(()=>countActiveEventRegistrations({}, {eventId:'e',tenantId:'t',clubId:'c'}),/unavailable/);
 await assert.rejects(()=>countActiveEventRegistrations({count:async()=>0},{eventId:'e',tenantId:'',clubId:'c'}),/scope required/);
});
