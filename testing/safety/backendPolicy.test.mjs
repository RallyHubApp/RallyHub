import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activeHost,validateReport} from '../../base44/functions/clubSafety/policy.mjs';
test('viewer, revoked and expired host denied',()=>{for(const g of [{status:'active',role:'viewer'},{status:'revoked',role:'session_host'},{status:'active',role:'session_host',ends_at:'2020-01-01'}])assert.equal(activeHost(g),false);assert.equal(activeHost({status:'active',role:'assistant_host'}),true)});
const report={type:'injury',description:'Fictional fall',operationId:'fictional-operation-001',incidentAt:'2026-01-01T00:00:00Z',people:[{name:'Fictional guest',type:'guest'}],actions:'',outcome:'',witnesses:'',supplies:''};
test('valid fictional report',()=>assert.deepEqual(validateReport(report),[]));
test('reject malformed people, invalid operation and missing description',()=>assert.equal(validateReport({...report,people:[null],operationId:'x',description:''}).length,3));
test('reject excessive clinical narrative and future incident',()=>assert.equal(validateReport({...report,actions:'x'.repeat(4001),incidentAt:'2099-01-01'}).length,2));
