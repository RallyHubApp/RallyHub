import test from 'node:test';import assert from 'node:assert/strict';
import {admitAtomically} from '../../base44/functions/eventRegistration/atomicAdmission.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
test('simultaneous last-place attempts cannot both be admitted',async()=>{
 let lease=null;const rows=[{id:'paid',registration_status:'confirmed'}];let seq=0;
 const tournaments={async updateMany(q,u){if(q.$or){if(lease)return {updated:0};lease=u.$set.event_payment_confirmation_lease;return {updated:1}}if(lease===q.event_payment_confirmation_lease){lease=null;return {updated:1}}return {updated:0}}};
 const registrations={async get(id){return rows.find(x=>x.id===id)}};
 const run=(email,operationId)=>admitAtomically({tournaments,registrations,eventId:'e',tenantId:'t',capacity:2,email,operationId,read:async()=>rows.slice(),create:async(accepted)=>{await delay(30);const row={id:String(++seq),email,email_key:email,operation_id:operationId,registration_status:accepted?'pending_approval':'waitlisted'};rows.push(row);return row}});
 const pair=await Promise.all([run('a@test.ie','a'),run('b@test.ie','b')]);assert.equal(pair.filter(x=>x.kind==='created'&&x.accepted).length,1);assert.equal(pair.filter(x=>x.kind==='busy').length,1);
 const retry=await run('b@test.ie','b');assert.equal(retry.kind,'created');assert.equal(retry.accepted,false);
});
