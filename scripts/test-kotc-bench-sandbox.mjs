import fs from 'node:fs';
import assert from 'node:assert/strict';
import {transform} from 'esbuild';
const src=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const body=src.slice(src.indexOf('      // Fairness-first:'),src.indexOf('      const selectedSet=',src.indexOf('      // Fairness-first:')));
const js=(await transform(`function select(projected,activeLocks,benchPlaces,session,nextNumber){const stableHash=x=>{let h=0;for(const c of x)h=(h*31+c.charCodeAt(0))>>>0;return h;};${body};return selected;}`,{loader:'ts'})).code;
const select=new Function(`${js};return select`)();
let cases=0;
for(let courts=1;courts<=4;courts++)for(let extras=1;extras<=3;extras++)for(let rounds=5;rounds<=12;rounds++){
 const n=courts*4+extras;const p=Array.from({length:n},(_,i)=>({id:String(i),fairness_benches:0,_previousBench:false}));
 for(let round=1;round<=rounds;round++){
  const ids=select(p,[],extras,{random_seed:'test'},round);assert.equal(ids.length,extras);assert.equal(new Set(ids).size,extras);
  const min=Math.min(...p.map(x=>x.fairness_benches));assert.ok(ids.every(id=>p.find(x=>x.id===id).fairness_benches===min)||p.every(x=>x.fairness_benches>=min));
  for(const x of p){x._previousBench=ids.includes(x.id);if(x._previousBench)x.fairness_benches++;}
 }
 const counts=p.map(x=>x.fairness_benches);assert.ok(Math.max(...counts)-Math.min(...counts)<=1,JSON.stringify({courts,extras,rounds,counts}));cases++;
}
for(const extras of [1,2,3]){const p=Array.from({length:10},(_,i)=>({id:String(i),fairness_benches:i<2?1:0,_previousBench:false}));const locks=[{participant1_id:'0',participant2_id:'1',pair_source:'host_selected'}];const ids=select(p,locks,extras,{random_seed:'test'},2);assert.equal(ids.includes('0'),ids.includes('1'));cases++;}
console.log(`PASS ${cases} backend bench-selection simulations`);
