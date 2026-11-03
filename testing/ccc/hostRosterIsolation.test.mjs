import test from 'node:test';import assert from 'node:assert/strict';import {readEventRegistrations} from '../../base44/functions/cccActivity/registrationReader.mjs';
const scope={tenantId:'t',clubId:'c',eventId:'e'};
const entity=(rows,has_more=false)=>({filter:async()=>({items:rows,has_more})});
test('host roster returns only scoped registrations',async()=>{const r=await readEventRegistrations(entity([{id:'r',tenant_id:'t',club_id:'c',event_id:'e'}]),scope);assert.equal(r.registrations.length,1);assert.equal(r.complete,true)});
for(const field of ['tenant_id','club_id','event_id'])test('host roster refuses '+field+' mismatch',async()=>assert.rejects(()=>readEventRegistrations(entity([{id:'r',tenant_id:'t',club_id:'c',event_id:'e',[field]:'wrong'}]),scope),/scope violation/));
test('host roster refuses missing ID',async()=>assert.rejects(()=>readEventRegistrations(entity([{tenant_id:'t',club_id:'c',event_id:'e'}]),scope),/ID missing/));
