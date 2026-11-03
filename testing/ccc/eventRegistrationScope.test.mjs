import test from 'node:test';import assert from 'node:assert/strict';import {readBookingRegistrations} from '../../base44/functions/eventRegistration/scopedRegistrationReader.mjs';
const scope={eventId:'e',tenantId:'t',clubId:'c'};
const entity=row=>({filter:async()=>({items:[row],has_more:false})});
test('accepts a complete scoped event registration',async()=>assert.equal((await readBookingRegistrations(entity({id:'r',event_id:'e',tenant_id:'t',club_id:'c'}),scope)).length,1));
for(const field of ['event_id','tenant_id','club_id'])test('rejects mismatched '+field,async()=>assert.rejects(()=>readBookingRegistrations(entity({id:'r',event_id:'e',tenant_id:'t',club_id:'c',[field]:'other'}),scope),/scope violation/));
