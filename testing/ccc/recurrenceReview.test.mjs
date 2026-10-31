import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewWeeklyRecurrence} from '../../base44/functions/cccActivity/recurrenceReview.mjs';
const candidate={id:'new',tenant_id:'t1',club_id:'c1',venue_id:'v1',court_id:'court1',starts_at:'2026-11-02T19:00',ends_at:'2026-11-02T20:30'};
test('weekly preview produces exact 12 calendar dates with unchanged wall-clock time',()=>{
 const r=reviewWeeklyRecurrence(candidate,[],{weeks:12,complete:true});
 assert.equal(r.occurrences.length,12);assert.equal(r.occurrences[0].startsAt,'2026-11-02T19:00');
 assert.equal(r.occurrences[11].startsAt,'2027-01-18T19:00');
 assert.equal(r.ready,true);assert.equal(r.mutationPerformed,false);
});
test('conflicts only for matching scoped court or whole venue',()=>{
 const activities=[{id:'a',tenant_id:'t1',club_id:'c1',venue_id:'v1',court_id:'court1',status:'scheduled',starts_at:'2026-11-16T19:15',ends_at:'2026-11-16T20:00'},
 {id:'b',tenant_id:'t1',club_id:'c2',venue_id:'v1',court_id:'court1',status:'scheduled',starts_at:'2026-11-02T19:00',ends_at:'2026-11-02T20:00'},
 {id:'c',tenant_id:'t1',club_id:'c1',venue_id:'v1',court_id:'court2',status:'scheduled',starts_at:'2026-11-02T19:00',ends_at:'2026-11-02T20:00'}];
 const r=reviewWeeklyRecurrence(candidate,activities,{weeks:4,complete:true});
 assert.equal(r.conflictedWeeks,1);assert.deepEqual(r.occurrences[2].conflicts,[{activityId:'a',status:'scheduled'}]);
});
test('invalid dates, overnight, too many weeks and incomplete inventory fail closed',()=>{
 for(const invalid of [{starts_at:'2026-02-30T19:00'},{ends_at:'2026-11-03T20:30'},{ends_at:'2026-11-02T18:00'}])assert.equal(reviewWeeklyRecurrence({...candidate,...invalid},[],{complete:true}).valid,false);
 assert.equal(reviewWeeklyRecurrence(candidate,[],{weeks:13,complete:true}).valid,false);
 assert.equal(reviewWeeklyRecurrence(candidate,[],{weeks:4,complete:false}).ready,false);
});
test('weekly preview has no booking, capacity or external calendar verification',()=>{
 const r=reviewWeeklyRecurrence(candidate,[],{complete:true});
 assert.equal(r.externalCalendarChecked,false);assert.equal(r.bookingCapacityVerified,false);
});
