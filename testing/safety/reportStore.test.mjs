import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reportPayload,persistReport} from '../../base44/functions/clubSafety/reportStore.mjs';
const body={source:'kotc',operationId:'fictional-operation-001',incidentAt:'2026-01-01',type:'injury',description:' Fictional fall ',people:[{name:' Guest ',type:'guest',private:'discard'}],actions:'',outcome:'',witnesses:'',supplies:'',tenant_id:'forged'};
const payload=reportPayload(body,{tenant_id:'tenant',club_id:'club'},{id:'session',venue_id:'venue'},'host');
test('server scope and field allowlist override client data',()=>{assert.equal(payload.tenant_id,'tenant');assert.deepEqual(payload.people,[{name:'Guest',type:'guest'}]);assert.equal(payload.reporter_id,'host')});
test('atomic adapter contract handles concurrent retry',async()=>{const records=new Map();const store={async insertIfAbsent(key,p){if(records.has(key))return {record:records.get(key),created:false};const record={...p,id:'fictional-id'};records.set(key,record);return {record,created:true}}};const results=await Promise.all([persistReport(store,payload),persistReport(store,payload)]);assert.equal(records.size,1);assert.equal(results.filter(r=>r.duplicate).length,1)});
test('missing atomic storage fails closed',async()=>assert.rejects(persistReport({},payload),/Atomic storage unavailable/));
test('wrong scope receipt rejected',async()=>assert.rejects(persistReport({insertIfAbsent:async()=>({record:{...payload,id:'x',club_id:'other'}})},payload),/scope mismatch/));
