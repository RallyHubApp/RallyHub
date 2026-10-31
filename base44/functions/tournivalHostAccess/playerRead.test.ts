import {strict as assert} from 'node:assert';
import {loadTournivalHostPlayerMap as load} from './playerRead.ts';
Deno.test('queries only unique scoped player IDs',async()=>{const calls:any[]=[];const entity={filter:async(q:any)=>{calls.push(q);return [{id:q.id,tenant_id:q.tenant_id,full_name:'Player '+q.id}]}};const r=await load(entity,'tenant',['a','b','a']);assert.equal(calls.length,2);assert.equal(r.playerMap.a,'Player a');});
Deno.test('filters cross-tenant records even if backend returns them',async()=>{const r=await load({filter:async()=>[{id:'a',tenant_id:'other',full_name:'Private'}]},'tenant',['a']);assert.deepEqual(r.playerMap,{});assert.deepEqual(r.missingPlayerIds,['a']);});
Deno.test('missing players reported',async()=>{const r=await load({filter:async()=>[]},'tenant',['a']);assert.deepEqual(r.missingPlayerIds,['a']);});
Deno.test('oversized or malformed scopes fail without reads',async()=>{const entity={filter:async()=>{throw Error('unexpected read')}};assert.equal((await load(entity,'tenant',Array(257).fill('a'))).error,'invalid_player_scope');assert.equal((await load(entity,'tenant',[''])).error,'invalid_player_scope');});
Deno.test('empty roster needs no query',async()=>{const r=await load({filter:async()=>{throw Error('unexpected read')}},'tenant',[]);assert.deepEqual(r.playerMap,{});});
