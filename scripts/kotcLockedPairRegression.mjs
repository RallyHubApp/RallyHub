import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
for (const path of ['base44/functions/prepareKotcNextRound/entry.ts','base44/functions/kotcCommand/entry.ts']) {
 const source=fs.readFileSync(path,'utf8');
 const start=source.indexOf('function crossSplit(');
 const end=source.indexOf('function ',start+12);
 assert(start>=0&&end>start,'crossSplit missing: '+path);
 const snippet=source.slice(start,end);
 const js=ts.transpileModule(snippet,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const context={partnerCounts:{},console};
 vm.createContext(context);
 vm.runInContext('function pairKey(a,b){return [a,b].sort().join("|")} function stableHash(s){return 1} function keepsLocks(teams,locks){return locks.every(l=>!teams.flat().includes(l.participant1_id)||!teams.flat().includes(l.participant2_id)||teams.some(t=>t.includes(l.participant1_id)&&t.includes(l.participant2_id)))} '+js,context);
 const cases=[
  {name:'locked winning pair remains together',a:['dawna','sharmaine'],b:['fergal','mark'],locks:[{participant1_id:'dawna',participant2_id:'sharmaine'}]},
  {name:'locked losing pair remains together',a:['dawna','sharmaine'],b:['fergal','mark'],locks:[{participant1_id:'fergal',participant2_id:'mark'}]},
  {name:'both incoming pairs locked',a:['dawna','sharmaine'],b:['fergal','mark'],locks:[{participant1_id:'dawna',participant2_id:'sharmaine'},{participant1_id:'fergal',participant2_id:'mark'}]},
  {name:'unlocked incoming pairs split',a:['dawna','sharmaine'],b:['fergal','mark'],locks:[]}
 ];
 for(const c of cases){const out=context.crossSplit(c.a,c.b,{},'test',c.locks);const teams=[out.teamA,out.teamB];for(const l of c.locks)assert(teams.some(t=>t.includes(l.participant1_id)&&t.includes(l.participant2_id)),c.name);if(!c.locks.length)assert(teams.every(t=>t.some(x=>c.a.includes(x))&&t.some(x=>c.b.includes(x))),c.name);}
 console.log('PASS '+path+' 4 locked/unlocked scenarios');
}
