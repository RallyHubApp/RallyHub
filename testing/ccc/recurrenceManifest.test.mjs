import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRecurrenceManifest} from '../../base44/functions/cccActivity/recurrenceManifest.mjs';
const source={id:'a1',tenant_id:'t1',club_id:'c1',revision:3,status:'draft',venue_id:'v1',court_id:'court1'};
const occurrences=[{week:1,startsAt:'2026-11-02T19:00',endsAt:'2026-11-02T20:30',conflicts:[]},{week:2,startsAt:'2026-11-09T19:00',endsAt:'2026-11-09T20:30',conflicts:[]}];
const opts={tenantId:'t1',clubId:'c1',sourceRevision:3,inventoryComplete:true,ready:true};
test('stable recurrence manifest is read only, never reserves capacity',()=>{
 const a=buildRecurrenceManifest(source,occurrences,opts),b=buildRecurrenceManifest(source,occurrences,opts);
 assert.equal(a.valid,true);assert.equal(a.readyToCreate,false);assert.equal(a.mutationPerformed,false);
 assert.deepEqual(a.rows,b.rows);assert.notEqual(a.rows[0].operationId,a.rows[1].operationId);
});
test('scope, revision, status and linked events fail closed',()=>{
 for(const [s,o] of [[{...source,club_id:'c2'},opts],[source,{...opts,sourceRevision:4}],[{...source,status:'scheduled'},opts],[{...source,linked_event_id:'e1'},opts]]){
  const r=buildRecurrenceManifest(s,occurrences,o);assert.equal(r.valid,false);assert.deepEqual(r.rows,[]);
 }
});
test('incomplete inventory, overlaps and duplicate occurrences prevent manifest',()=>{
 for(const [rows,options] of [[occurrences,{...opts,inventoryComplete:false}],[[{...occurrences[0],legacyOverlaps:[{sessionId:'g'}]}],opts],[[occurrences[0],occurrences[0]],opts]]){
  const r=buildRecurrenceManifest(source,rows,options);assert.equal(r.valid,false);assert.deepEqual(r.rows,[]);
 }
});
