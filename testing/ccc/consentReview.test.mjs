import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewPersonCommunications} from '../../base44/functions/cccActivity/consentReview.mjs';
import {readPersonInventory} from '../../base44/functions/cccActivity/personInventory.mjs';
const scope={tenantId:'t1',clubId:'c1',personId:'p1',channel:'email',purpose:'marketing',complete:true};
test('affirmative consent still never authorises delivery without endpoint suppression and provider checks',()=>{
 const result=reviewPersonCommunications({...scope,consents:[{tenant_id:'t1',club_id:'c1',person_id:'p1',consent_type:'marketing',status:'accepted',channels:['email'],recorded_at:'2026-10-01',consent_version:'1'}],preferences:[{person_id:'p1',owner_scope:'tenant',tenant_id:'t1',channel:'email',purpose:'marketing',status:'accepted',confirmed_at:'2026-10-01'}]});
 assert.equal(result.consentEvidencePresent,true);assert.equal(result.preferenceEvidencePresent,true);
 assert.equal(result.sendEligible,false);assert.equal(result.deliveryEnabled,false);
 assert.ok(result.issues.includes('endpoint_suppression_not_checked'));
});
test('withdrawn preferences and global suppression block, other tenant suppression does not',()=>{
 const result=reviewPersonCommunications({...scope,preferences:[{person_id:'p1',owner_scope:'platform',channel:'email',purpose:'marketing',status:'withdrawn'}],suppressions:[{person_id:'p1',owner_scope:'platform',channel:'email',active:true},{person_id:'p1',owner_scope:'tenant',tenant_id:'t2',channel:'email',active:true}]});
 assert.equal(result.personSuppressionCount,1);assert.ok(result.issues.includes('preference_withdrawn'));assert.ok(result.issues.includes('active_suppression'));
});
test('declined consent overrides accepted record and incomplete read remains blocked',()=>{
 const result=reviewPersonCommunications({...scope,complete:false,consents:[{tenant_id:'t1',club_id:'c1',person_id:'p1',consent_type:'marketing',status:'declined'}]});
 assert.equal(result.consentEvidencePresent,false);assert.ok(result.issues.includes('records_incomplete'));
});
test('person inventory enforces ID and cursor scope, refuses bad pages',async()=>{
 const rows=[{id:'a',person_id:'p1'},{id:'b',person_id:'p1'}];
 const entity={filter:async(q,opts)=>({items:rows.slice(Number(opts.cursor||0),Number(opts.cursor||0)+1),has_more:!opts.cursor,next_cursor:opts.cursor?null:'1'})};
 const read=await readPersonInventory(entity,{personId:'p1',pageSize:1});assert.equal(read.rows.length,2);assert.equal(read.complete,true);
 await assert.rejects(()=>readPersonInventory({filter:async()=>({items:[{id:'bad',person_id:'p2'}],has_more:false})},{personId:'p1'}),/scope violation/);
});
