import {strict as assert} from 'node:assert';
import {runTournivalPostCommitNotices as run} from './tournivalPostCommit.ts';
Deno.test('recipient query failure does not throw after score commit',async()=>{const r=await run(async()=>{throw Error('offline')},async()=>{});assert.equal(r.requiresCommunicationReview,true);});
Deno.test('individual notice failures do not block remaining recipients',async()=>{let attempted=0;const r=await run(async()=>[1,2,3],async(n)=>{attempted++;if(n===2)throw Error('failed')});assert.equal(attempted,3);assert.equal(r.failures,1);});
Deno.test('all successful notices require no review',async()=>{const r=await run(async()=>[1,2],async()=>{});assert.equal(r.noticesComplete,true);});
