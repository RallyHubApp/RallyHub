import test from 'node:test';
import assert from 'node:assert/strict';
import {activityReadiness} from '../../src/lib/ccc/activityReadiness.js';
const valid={activity:{id:'a',tenant_id:'t',club_id:'c'},venue:{id:'v',tenant_id:'t',club_id:'c'},host:{id:'h'},capacity:16,registrationMode:'approval',paymentMethod:'online',approvedTemplate:{id:'template'}};
test('complete activity passes readiness',()=>assert.deepEqual(activityReadiness(valid),{ready:true,issues:[]}));
test('registration cannot open without approved communication template',()=>{
 const result=activityReadiness({...valid,approvedTemplate:null});
 assert.equal(result.ready,false);assert.ok(result.issues.includes('approved_communication_template_required'));
});
test('venue from another tenant fails readiness',()=>{
 const result=activityReadiness({...valid,venue:{id:'v',tenant_id:'other',club_id:'c'}});
 assert.ok(result.issues.includes('venue_tenant_mismatch'));
});
test('closed registration does not require template',()=>{
 assert.equal(activityReadiness({...valid,registrationMode:'closed',approvedTemplate:null}).ready,true);
});
