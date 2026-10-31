import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewDublinWallTime,reviewDublinOccurrences} from '../../base44/functions/cccActivity/localTimeReview.mjs';
test('Dublin normal winter and summer times have one real UTC instant',()=>{
 assert.deepEqual(reviewDublinWallTime('2026-01-12T19:00').possibleInstants,['2026-01-12T19:00:00.000Z']);
 assert.deepEqual(reviewDublinWallTime('2026-07-13T19:00').possibleInstants,['2026-07-13T18:00:00.000Z']);
});
test('spring-forward missing time and autumn repeated time are blocked',()=>{
 const missing=reviewDublinWallTime('2027-03-28T01:30');
 assert.equal(missing.valid,false);assert.equal(missing.issue,'nonexistent_local_time');
 const repeated=reviewDublinWallTime('2026-10-25T01:30');
 assert.equal(repeated.valid,false);assert.equal(repeated.issue,'ambiguous_local_time');assert.equal(repeated.possibleInstants.length,2);
});
test('invalid dates and actual duration are rejected',()=>{
 assert.equal(reviewDublinWallTime('2026-02-30T19:00').valid,false);
 const r=reviewDublinOccurrences([{week:1,startsAt:'2026-11-02T20:00',endsAt:'2026-11-02T19:00'}]);
 assert.equal(r.ready,false);assert.deepEqual(r.issues[0].issues,['nonpositive_actual_duration']);
});
test('weekly dates spanning DST preserve clock time but resolve distinct UTC offsets',()=>{
 const r=reviewDublinOccurrences([{week:1,startsAt:'2027-03-22T19:00',endsAt:'2027-03-22T20:30'},{week:2,startsAt:'2027-03-29T19:00',endsAt:'2027-03-29T20:30'}]);
 assert.equal(r.ready,true);assert.equal(r.occurrences[0].startUtc,'2027-03-22T19:00:00.000Z');
 assert.equal(r.occurrences[1].startUtc,'2027-03-29T18:00:00.000Z');
});
