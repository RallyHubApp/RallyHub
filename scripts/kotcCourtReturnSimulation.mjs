import fs from 'node:fs';
import assert from 'node:assert/strict';
import {transform} from 'esbuild';
const source=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const start=source.indexOf('        const returnPreference:any=');
const end=source.indexOf('        const replacementFor=',start);
assert(start>0&&end>start);
const snippet=source.slice(start,end);
const js=(await transform(`function assign(lastPlayedCourt,outgoing,replacements,activeCourts){${snippet};return assigned;}`,{loader:'ts'})).code;
const assign=new Function(`${js};return assign`)();
const preference={1:[1,2,3,4],2:[2,3,4,1],3:[3,4,2,1],4:[4,3,2,1]};
let cases=0,returnCount=0,exact=0,firstAlternative=0,farther=0,forced=0;
function check(previous,available){const ids=previous.map((_,i)=>`P${i}`);const slots=available.map(ladder_court_rank=>({ladder_court_rank}));const map=new Map(ids.map((id,i)=>[id,previous[i]]));const output=assign(map,slots,ids,4);assert.equal(output.length,ids.length);assert.equal(new Set(output).size,ids.length);const actual=output.map((id,i)=>({from:map.get(id),to:available[i]}));for(const x of actual){const idx=preference[x.from].indexOf(x.to);assert(idx>=0);returnCount++;if(idx===0)exact++;else if(idx===1)firstAlternative++;else farther++;}cases++;return actual;}
for(let c=1;c<=4;c++){const actual=check([c],preference[c]);assert.equal(actual[0].to,preference[c][0]);for(const dest of preference[c]){const a=check([c],[dest]);assert.equal(a[0].to,dest);if(dest!==c)forced++;}}
for(let a=1;a<=4;a++)for(let b=1;b<=4;b++)for(let c=1;c<=4;c++)for(let d=1;d<=4;d++){
  for(const available of [[1,2,3,4],[4,3,2,1],[1,1,3,4],[2,2,3,4],[1,2,4,4],[1,1,1,1]]){
    const previous=[a,b,c,d],result=check(previous,available);
    const cost=result.reduce((sum,x)=>sum+preference[x.from].indexOf(x.to),0);
    // Exhaustively compare all 24 assignments, proving global optimum rather than greedy matching.
    let minimum=Infinity;
    const rec=(used,idx,total)=>{if(idx===4){minimum=Math.min(minimum,total);return;}for(let j=0;j<4;j++)if(!(used&(1<<j)))rec(used|(1<<j),idx+1,total+preference[previous[j]].indexOf(available[idx]));};
    rec(0,0,0);assert.equal(cost,minimum,JSON.stringify({previous,available,result,cost,minimum}));
  }
}
for(let n=1;n<=9;n++)for(let seed=0;seed<60;seed++){
  const prev=Array.from({length:n},(_,i)=>1+((seed*7+i*3+i*i)%4));
  const avail=Array.from({length:n},(_,i)=>1+((seed*11+i*5)%4));
  check(prev,avail);
}
console.log(JSON.stringify({passed:true,assignmentScenarios:cases,individualReturns:returnCount,sameCourt:exact,firstAlternative,otherCourt:farther,forcedSingleSlotCases:forced,notes:'Includes 1-9 returns, all 4-court priority combinations, duplicates and exhaustive optimum checks for four returnees'}));
