import test from 'node:test';
import assert from 'node:assert/strict';
import {activityTypes,canTransition,assertScope,validateDraft} from '../../src/lib/ccc/activityContracts.js';
const valid={tenant_id:'t',club_id:'c',sport:'pickleball',type:'taster',title:'Open taster',venue_id:'v',starts_at:'2026-11-10T19:00:00Z',ends_at:'2026-11-10T20:30:00Z',capacity:16};
test('supports existing protected sporting formats',()=>{for(const type of ['kotc','tournival','interclub','guest_session'])assert.ok(activityTypes.includes(type));});
test('rejects invalid capacity and reversed dates',()=>{assert.deepEqual(validateDraft(valid),[]);assert.ok(validateDraft({...valid,capacity:0}).includes('capacity_invalid'));assert.ok(validateDraft({...valid,ends_at:valid.starts_at}).includes('time_invalid'));});
test('does not skip activity lifecycle',()=>{assert.ok(canTransition('draft','ready'));assert.ok(!canTransition('draft','completed'));assert.ok(!canTransition('archived','scheduled'));});
test('tenant and club access fail closed',()=>{assert.ok(assertScope({tenant_id:'t',club_id:'c'},{tenant_id:'t',club_id:'c'}));assert.throws(()=>assertScope({tenant_id:'other'},{tenant_id:'t'}));assert.throws(()=>assertScope({tenant_id:'t',club_id:'other'},{tenant_id:'t',club_id:'c'}));});
