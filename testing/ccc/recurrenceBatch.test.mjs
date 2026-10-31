import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecurrenceDraftBatch} from '../../base44/functions/cccActivity/recurrenceBatch.mjs';
import {recurrenceDraftPayloads} from '../../base44/functions/cccActivity/recurrenceDrafts.mjs';
const source={id:'a1',tenant_id:'t1',club_id:'c1',status:'draft',revision:2,sport:'pickleball',type:'social',title:'Wednesday',venue_id:'v1',starts_at:'2026-11-04T19:00',ends_at:'2026-11-04T20:30',capacity:16};
const manifest={valid:true,rows:[{week:1,startsAt:'2026-11-04T19:00',endsAt:'2026-11-04T20:30',operationId:'ccc-rec-a1-2-1',sourceActivityId:'a1',sourceRevision:2,venueId:'v1',courtId:null},{week:2,startsAt:'2026-11-11T19:00',endsAt:'2026-11-11T20:30',operationId:'ccc-rec-a1-2-2',sourceActivityId:'a1',sourceRevision:2,venueId:'v1',courtId:null}]};
function setup({failAt=0}={}){
 const rows=[structuredClone(source)];let attempts=0;
 const matches=(r,q)=>Object.entries(q).every(([k,v])=>typeof v==='object'&&v!==null&&'$exists'in v?(v.$exists?(r[k]!==undefined):(r[k]===undefined)):r[k]===v);
 const entity={
  filter:async(q)=>rows.filter(r=>matches(r,q)),
  updateMany:async(q,p)=>{let updated=0;for(const r of rows)if(matches(r,q)){Object.assign(r,p.$set);updated++}return {updated}},
  create:async(d)=>{attempts++;if(attempts===failAt)throw Error('simulated write failure');const row={...d,id:'new'+attempts};rows.push(row);return row}
 };
 return {rows,entity};
}
const batchKey='ccc-batch-12345678';
const drafts=recurrenceDraftPayloads(source,manifest,{userId:'admin'});
test('batch claims source once, creates only scoped drafts and completes',async()=>{
 const h=setup(),r=await createRecurrenceDraftBatch(h.entity,{source,manifest,batchKey,userId:'admin',drafts});
 assert.equal(r.success,true);assert.equal(r.createdIds.length,2);assert.equal(h.rows[0].recurrence_batch_state,'complete');
 assert.equal(h.rows[0].revision,4);assert.ok(h.rows.slice(1).every(x=>x.status==='draft'&&!x.linked_event_id&&x.tenant_id==='t1'));
 const second=await createRecurrenceDraftBatch(h.entity,{source,manifest,batchKey,userId:'admin',drafts});
 assert.equal(second.success,false);assert.equal(second.reason,'concurrent_claim');assert.equal(h.rows.length,3);
});
test('partial failure retains source claim and exposes created IDs for manual reconciliation',async()=>{
 const h=setup({failAt:2}),r=await createRecurrenceDraftBatch(h.entity,{source,manifest,batchKey,userId:'admin',drafts});
 assert.equal(r.success,false);assert.equal(r.reason,'manual_reconciliation_required');assert.equal(r.createdIds.length,1);
 assert.equal(h.rows[0].recurrence_batch_state,'needs_recovery');assert.equal(h.rows.length,2);
});
test('invalid manifest or mismatched source cannot create',async()=>{
 assert.throws(()=>recurrenceDraftPayloads({...source,linked_event_id:'e1'},manifest,{userId:'admin'}));
 assert.throws(()=>recurrenceDraftPayloads({...source,revision:3},manifest,{userId:'admin'}));
 const h=setup();await assert.rejects(createRecurrenceDraftBatch(h.entity,{source,manifest:{valid:false,rows:[]},batchKey,userId:'admin',drafts:[]}));
 assert.equal(h.rows.length,1);
});
