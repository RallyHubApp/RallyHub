import {strict as assert} from 'node:assert';
import {projectCommittedTournivalState as project} from './tournivalMirrorCommit.ts';
Deno.test('successful mirror reports fully synced',async()=>{let patch:any;const r=await project(async(_id,p)=>{patch=p}, {id:'t'},{revision:3},'In Progress');assert.equal(r.mirrorSynced,true);assert.equal(JSON.parse(patch.tournival_state).revision,3);});
Deno.test('failed mirror preserves committed session status',async()=>{const r=await project(async()=>{throw Error('offline')},{id:'t'},{revision:3},'In Progress');assert.equal(r.committed,true);assert.equal(r.requiresReconciliation,true);});
Deno.test('no status patch when status omitted',async()=>{let patch:any;await project(async(_id,p)=>{patch=p},{id:'t'},{revision:3},undefined);assert.equal('status' in patch,false);});
