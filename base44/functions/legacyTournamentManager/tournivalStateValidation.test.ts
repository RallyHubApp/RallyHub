import {strict as assert} from 'node:assert';
import {validateTournivalStateTransition as validate} from './tournivalStateValidation.ts';
const ids=['a','b','c','d'];
const round={roundNumber:1,courts:[{courtNumber:1,teamA:['a','b'],teamB:['c','d']}]};
const base={numRounds:2,numCourts:1,matchFormat:'first_11_by1',rounds:[round,{...round,roundNumber:2}],results:{}};
Deno.test('valid Tournival launch and score',()=>{
 assert.equal(validate(null,base,{playerIds:ids}).valid,true);
 const next={...base,results:{1:{1:{scoreA:11,scoreB:9,winner:'A'}}}};
 assert.equal(validate(base,next,{playerIds:ids}).valid,true);
 assert.equal(validate(next,next,{playerIds:ids}).valid,true);
});
Deno.test('tampered scores and duplicate or outsider players rejected',()=>{
 const bad={...base,results:{1:{1:{scoreA:11,scoreB:11,winner:'A'}}}};
 assert.equal(validate(base,bad,{playerIds:ids}).valid,false);
 const bogus={...base,rounds:[{roundNumber:1,courts:[{courtNumber:1,teamA:['a','a'],teamB:['c','d']}]},round]};
 assert.equal(validate(null,bogus,{playerIds:ids}).valid,false);
 assert.equal(validate(null,base,{playerIds:['a','b','c']}).valid,false);
});
Deno.test('score correction always requires an audit reason',()=>{
 const before={...base,results:{1:{1:{scoreA:11,scoreB:9,winner:'A'}}}};
 const after={...base,results:{1:{1:{scoreA:11,scoreB:8,winner:'A'}}}};
 assert.equal(validate(before,after,{playerIds:ids}).valid,false);
 assert.equal(validate(before,after,{playerIds:ids,correctionReason:'Host corrected paper score'}).valid,true);
 assert.equal(validate(before,base,{playerIds:ids,correctionReason:'Host corrected paper score'}).valid,false);
});
Deno.test('no fake completed state without knockout final',()=>{
 assert.equal(validate(base,{...base,status:'Completed'},{playerIds:ids}).valid,false);
});
