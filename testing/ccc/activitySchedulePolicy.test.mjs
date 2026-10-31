import test from 'node:test';
import assert from 'node:assert/strict';
import {activityScheduleConflicts} from '../../base44/functions/cccActivity/activitySchedulePolicy.mjs';
const row=(id,start='2026-11-04T19:00:00Z',end='2026-11-04T20:30:00Z',extra={})=>({id,tenant_id:'t1',club_id:'c1',venue_id:'v1',starts_at:start,ends_at:end,status:'scheduled',...extra});
test('overlapping active activities block a venue, adjacent times do not',()=>{
 const c=row('candidate');
 const result=activityScheduleConflicts(c,[row('a','2026-11-04T18:30:00Z','2026-11-04T19:30:00Z'),row('b','2026-11-04T20:30:00Z','2026-11-04T21:00:00Z')]);
 assert.deepEqual(result.conflicts,[{activityId:'a',status:'scheduled'}]);
});
test('drafts, archived, cancelled, different venue and tenant do not conflict',()=>{
 const c=row('candidate');
 const result=activityScheduleConflicts(c,[row('draft',undefined,undefined,{status:'draft'}),row('archive',undefined,undefined,{status:'archived'}),row('otherVenue',undefined,undefined,{venue_id:'v2'}),row('otherTenant',undefined,undefined,{tenant_id:'t2'}),row('same',undefined,undefined,{id:'candidate'})]);
 assert.deepEqual(result.conflicts,[]);
});
test('invalid schedule fails closed',()=>{
 assert.equal(activityScheduleConflicts(row('x','bad')).valid,false);
 assert.equal(activityScheduleConflicts(row('x','2026-11-04T20:00:00Z','2026-11-04T19:00:00Z')).valid,false);
});
