import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticFetch,historyScope} from '../base44/functions/paymentDiagnosticHistory/diagnostics.mjs';
const ctx={scope:'club',tenant_id:'t',club_id:'c',workflow:'test',operation:'checkout'};
for(const [code,status,fault] of [[200,'PAID',''],[200,'FAILED','declined_or_expired'],[401,'','authentication'],[503,'','provider'],[429,'','rate_limit'],[204,'','']]){
 test('HTTP '+code+' '+status,async()=>{const events=[];const response=new Response(code===204?null:JSON.stringify({status,id:'checkout-1',secret:'never-store',transactions:[{id:'tx-1'}]}),{status:code});assert.equal(await diagnosticFetch(async()=>response,async e=>events.push(e),ctx,'mock'),response);assert.equal(events[0].fault_category,fault);assert.equal(events[0].secret,undefined);assert.equal(events[0].tenant_id,'t');});
}
test('network error preserved',async()=>{let event;await assert.rejects(diagnosticFetch(async()=>{throw Error('network')},async e=>event=e,ctx,'mock'),/network/);assert.equal(event.fault_category,'network');});
test('logger failure is fail open',async()=>{const response=new Response('{}');assert.equal(await diagnosticFetch(async()=>response,async()=>{throw Error('db')},ctx,'mock'),response);});
test('missing scope is not written',async()=>{let count=0;await diagnosticFetch(async()=>new Response('{}'),async()=>count++,{...ctx,club_id:''},'mock');assert.equal(count,0);});
test('scope requires approved club admin or admin',()=>{assert.equal(historyScope({role:'user',active_tenant_id:'t',active_club_id:'c'}),null);assert.deepEqual(historyScope({role:'user',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'t',active_club_id:'c'}),{scope:'club',tenant_id:'t',club_id:'c'});});
