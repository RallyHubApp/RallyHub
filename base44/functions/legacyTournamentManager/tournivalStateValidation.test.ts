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
Deno.test('continuous match state rejects overlapping active players and courts',()=>{
 const ids=['a','b','c','d','e','f','g','h'];
 const matches=[
  {id:'m1',round:1,teamA:['a','b'],teamB:['c','d'],court:1,status:'playing'},
  {id:'m2',round:1,teamA:['e','f'],teamB:['g','h'],court:2,status:'playing'}
 ];
 const setup={...base,numCourts:2,matches};
 assert.equal(validate(null,setup,{playerIds:ids}).valid,true);
 assert.equal(validate(null,{...setup,matches:[matches[0],{...matches[1],court:1}]},{playerIds:ids}).valid,false);
 assert.equal(validate(null,{...setup,matches:[matches[0],{...matches[1],teamA:['a','f']}]},{playerIds:ids}).valid,false);
 assert.equal(validate(null,{...setup,matches:[matches[0],{...matches[1],id:'m1'}]},{playerIds:ids}).valid,false);
 assert.equal(validate(setup,{...setup,matches:[matches[0]]},{playerIds:ids}).valid,false);
 assert.equal(validate(setup,{...setup,matches:[matches[0],{...matches[1],id:'new'}]},{playerIds:ids}).valid,false);
 assert.equal(validate(null,{...setup,matches:[{...matches[0],status:'completed',result:null},matches[1]]},{playerIds:ids}).valid,false);
});

Deno.test('completed fixtures and substitutions retain sporting integrity',()=>{
 const roster=['a','b','c','d','e'];
 const before={...base,matches:[{id:'m1',round:1,teamA:['a','b'],teamB:['c','d'],
   status:'completed',court:null,result:{scoreA:11,scoreB:8,winner:'A'}}]};
 const changed={...before,matches:[{...before.matches[0],teamA:['a','e']}]};
 assert.equal(validate(before,changed,{playerIds:roster,correctionReason:'substitution approved'}).valid,false);
 const reopen={...before,matches:[{...before.matches[0],status:'waiting',result:null}]};
 assert.equal(validate(before,reopen,{playerIds:roster,correctionReason:'host wants reopening'}).valid,false);
 const waiting={...base,matches:[{id:'m2',round:1,teamA:['a','b'],teamB:['c','d'],
    status:'waiting',court:null,result:null}]};
 const replaced={...waiting,matches:[{...waiting.matches[0],teamA:['a','e']}]};
 assert.equal(validate(waiting,replaced,{playerIds:roster}).valid,false);
 assert.equal(validate(waiting,replaced,{playerIds:roster,correctionReason:'player injured; approved replacement'}).valid,true);
});
