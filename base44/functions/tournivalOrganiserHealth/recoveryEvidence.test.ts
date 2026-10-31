import {strict as assert} from 'node:assert';
import {summariseTournivalRecoveryEvidence as summarise} from './recoveryEvidence.ts';
const preview=()=>({available:true,review:{readyForOrganiserReview:true},fromRevision:2,toRevision:4,sessionId:'s',tournamentId:'t',changes:{matches:6,results:3}});
Deno.test('valid evidence is read-only and requires manual approval',()=>{const r=summarise(preview());assert.equal(r.valid,true);assert.equal(r.revisionGap,2);assert.equal(r.automaticWriteAllowed,false);});
Deno.test('equal revisions cannot reconcile',()=>assert.equal(summarise({...preview(),toRevision:2}).valid,false));
Deno.test('mirror ahead cannot reconcile',()=>assert.equal(summarise({...preview(),toRevision:1}).valid,false));
Deno.test('negative results are rejected',()=>assert.equal(summarise({...preview(),changes:{matches:2,results:-1}}).valid,false));
Deno.test('unavailable preview rejected',()=>assert.equal(summarise({...preview(),available:false}).valid,false));
Deno.test('missing approval candidate rejected',()=>assert.equal(summarise({...preview(),review:{readyForOrganiserReview:false}}).valid,false));
