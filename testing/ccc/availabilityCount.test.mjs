import test from 'node:test';
import assert from 'node:assert/strict';
import {countActiveEventRegistrations} from '../../base44/functions/eventRegistration/availabilityCount.mjs';
const scope={eventId:'e',tenantId:'t',clubId:'c',now:'2026-10-31T12:00:00.000Z'};
const row=(id,status,expiry)=>({id,event_id:'e',tenant_id:'t',club_id:'c',registration_status:status,payment_hold_expires_at:expiry});
test('availability uses scoped Base44 array and counts active plus unexpired holds',async()=>{
 let calls=0;const entity={async filter(query,sort,limit){calls++;assert.deepEqual(query,{event_id:'e',tenant_id:'t',club_id:'c'});assert.equal(limit,500);return [row('a','pending_approval'),row('b','confirmed'),row('c','cancelled'),row('d','approved_payment_hold','2099-01-01T00:00:00Z'),row('e','approved_payment_hold','2020-01-01T00:00:00Z')];}};
 assert.equal(await countActiveEventRegistrations(entity,scope),3);assert.equal(calls,1);
});
test('availability fails closed on unverified or truncated SDK results',async()=>{
 await assert.rejects(()=>countActiveEventRegistrations({filter:async()=>({items:[]})},scope),/unavailable/);
 await assert.rejects(()=>countActiveEventRegistrations({filter:async()=>Array.from({length:500},(_,i)=>row(String(i),'confirmed'))},scope),/safe SDK row limit/);
 await assert.rejects(()=>countActiveEventRegistrations({filter:async()=>[row('x','confirmed'),{...row('y','confirmed'),tenant_id:'wrong'}]},scope),/scope violation/);
});
test('availability requires complete scope and SDK filter',async()=>{
 await assert.rejects(()=>countActiveEventRegistrations({},scope),/unavailable/);
 await assert.rejects(()=>countActiveEventRegistrations({filter:async()=>[]},{...scope,tenantId:''}),/scope required/);
});
