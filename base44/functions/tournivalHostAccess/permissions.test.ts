import {strict as assert} from 'node:assert';
import {validateDelegatedTournivalHostEdit as check} from './permissions.ts';
const match={id:'q:1:1',round:1,order:0,teamA:['a','b'],teamB:['c','d'],
 status:'waiting',court:null,revision:0,result:null};
const base={numCourts:2,numRounds:2,matchFormat:'timed_10',playerIds:['a','b','c','d'],
 rounds:[{roundNumber:1,courts:[{courtNumber:1,teamA:['a','b'],teamB:['c','d']}]}],
 matches:[match],results:{},status:'In Progress'};
Deno.test('host may allocate safe court and score started match',()=>{
 const allocated={...base,matches:[{...match,status:'playing',court:1}]};
 assert.equal(check(base,allocated).valid,true);
 const result={scoreA:8,scoreB:4,winner:'A'};
 const scored={...allocated,results:{1:{1:result}},matches:[{...match,status:'completed',result,court:null}]};
 assert.equal(check(allocated,scored).valid,true);
});
Deno.test('host cannot mutate config, completion, roster, or fixtures',()=>{
 assert.equal(check(base,{...base,numCourts:3}).valid,false);
 assert.equal(check(base,{...base,duprEnabled:true}).valid,false);
 assert.equal(check(base,{...base,status:'Completed'}).valid,false);
 assert.equal(check(base,{...base,matches:[{...match,teamB:['c','x']}]}).valid,false);
 assert.equal(check(base,{...base,matches:[]}).valid,false);
});
Deno.test('host cannot fake score, double allocate or finish incomplete session',()=>{
 assert.equal(check(base,{...base,matches:[{...match,status:'completed',result:{scoreA:8,scoreB:4,winner:'A'}}]}).valid,false);
 assert.equal(check(base,{...base,status:'Group Complete'}).valid,false);
 const duplicate={...match,id:'q:1:2'};
 const prior={...base,matches:[match,duplicate]};
 const after={...prior,matches:[{...match,status:'playing',court:1},{...duplicate,status:'playing',court:2}]};
 assert.equal(check(prior,after).valid,false);
});

Deno.test('host cannot submit duplicate match IDs, stale revisions or invalid states',()=>{
 const duplicate={...match,id:'q:1:2'};
 const before={...base,matches:[match,duplicate]};
 assert.equal(check(before,{...before,matches:[match,match]}).valid,false);
 assert.equal(check(base,{...base,matches:[{...match,revision:-1}]}).valid,false);
 assert.equal(check(base,{...base,matches:[{...match,status:'cancelled'}]}).valid,false);
});
Deno.test('completed results and revisions are immutable for delegated host',()=>{
 const result={scoreA:8,scoreB:4,winner:'A'};
 const completed={...match,status:'completed',revision:2,result};
 const before={...base,matches:[completed],results:{1:{1:result}}};
 assert.equal(check(before,{...before,matches:[{...completed,result:{scoreA:9,scoreB:4,winner:'A'}}]}).valid,false);
 assert.equal(check(before,{...before,matches:[{...completed,revision:3}]}).valid,false);
 assert.equal(check(before,{...before,matches:[{...completed,status:'waiting'}]}).valid,false);
});
Deno.test('host cannot fake invalid winner or score',()=>{
 const playing={...base,matches:[{...match,status:'playing',court:1,revision:1}]};
 const invalid={scoreA:8,scoreB:4,winner:'B'};
 const next={...playing,matches:[{...match,status:'completed',revision:2,result:invalid}],results:{1:{1:invalid}}};
 assert.equal(check(playing,next).valid,false);
});
