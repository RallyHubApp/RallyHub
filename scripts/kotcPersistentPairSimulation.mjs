import assert from 'node:assert/strict';

function stableHash(value){const text=String(value??'');let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function keepsLocks(teams,locks){return locks.every(l=>{const a=l[0],b=l[1],flat=teams.flat();const present=flat.includes(a)&&flat.includes(b);return !present||teams.some(t=>t.includes(a)&&t.includes(b));});}
function splitFour(ids,seed,locks){const [a,b,c,d]=ids;const opts=[[[a,b],[c,d]],[[a,c],[b,d]],[[a,d],[b,c]]].filter(x=>keepsLocks(x,locks));assert.ok(opts.length,'locked-pair constraints must be satisfiable within a court');return opts.sort((x,y)=>stableHash(`${seed}|${x.flat().join('|')}`)-stableHash(`${seed}|${y.flat().join('|')}`))[0];}
function crossSplit(pairOne,pairTwo,seed,locks){const [a,b]=pairOne,[c,d]=pairTwo;const opts=[[[a,c],[b,d]],[[a,d],[b,c]],[[a,b],[c,d]]].filter(x=>keepsLocks(x,locks));assert.ok(opts.length,'locked-pair constraints must be satisfiable at sporting destination');return opts.sort((x,y)=>stableHash(`${seed}|${x.flat().join('|')}`)-stableHash(`${seed}|${y.flat().join('|')}`))[0];}
function destinations(courts,results){const n=courts.length,w={},l={};for(const c of courts){const side=results[c.rank];w[c.rank]=side==='A'?[...c.a]:[...c.b];l[c.rank]=side==='A'?[...c.b]:[...c.a];}const d={};if(n===1){d[1]={one:w[1],two:l[1]};return d;}for(let r=1;r<=n;r++){if(r===1)d[r]={one:w[1],two:w[2]};else if(r===n)d[r]={one:l[n-1],two:l[n]};else d[r]={one:l[r-1],two:w[r+1]};}return d;}
function sameTeam(courts,a,b){return courts.some(c=>c.a.includes(a)&&c.a.includes(b)||c.b.includes(a)&&c.b.includes(b));}
function courtOf(courts,id){return courts.find(c=>c.a.includes(id)||c.b.includes(id))?.rank??null;}

let checks=0,scenarios=0;
for(let playerCount=4;playerCount<=40;playerCount++){
  for(let courtLimit=1;courtLimit<=10;courtLimit++){
    const activeCourts=Math.min(courtLimit,Math.floor(playerCount/4));if(activeCourts<1)continue;
    const ids=Array.from({length:playerCount},(_,i)=>`p${i+1}`),lock=[['p1','p2']],locked=new Set(['p1','p2']);
    // Keep the chosen persistent pair on Court 1 from the outset. Fill the remaining
    // court positions deterministically and bench only unlocked players when possible.
    const courtCapacity=activeCourts*4,active=['p1','p2',...ids.slice(2,courtCapacity)],bench=ids.filter(id=>!active.includes(id));
    let courts=[];for(let r=1;r<=activeCourts;r++){const four=active.slice((r-1)*4,r*4);const teams=r===1?[[four[0],four[1]],[four[2],four[3]]]:splitFour(four,`init-${playerCount}-${courtLimit}-${r}`,lock);courts.push({rank:r,a:teams[0],b:teams[1]});}
    assert.ok(sameTeam(courts,'p1','p2'));checks++;
    let currentBench=[...bench];
    const benchCounts=Object.fromEntries(ids.map(id=>[id,0]));for(const id of currentBench)benchCounts[id]++;
    for(let round=1;round<=12;round++){
      const results={};for(const c of courts)results[c.rank]=((stableHash(`${playerCount}|${courtLimit}|${round}|${c.rank}`)&1)===0?'A':'B');
      const lockedCourt=courts.find(c=>c.a.includes('p1')||c.b.includes('p1'));const lockedSide=lockedCourt.a.includes('p1')?'A':'B';
      const earnedCourt=results[lockedCourt.rank]===lockedSide
        ? Math.max(1,lockedCourt.rank-1)
        : Math.min(activeCourts,lockedCourt.rank+1);
      const d=destinations(courts,results);let sporting=[];
      for(const [rankText,pairs] of Object.entries(d)){const rank=Number(rankText),teams=crossSplit(pairs.one,pairs.two,`${playerCount}|${courtLimit}|r${round}|c${rank}`,lock);for(const [side,team] of [['A',teams[0]],['B',teams[1]]])for(const id of team)sporting.push({id,rank,side});}
      const benchPlaces=playerCount-courtCapacity;
      // Mirror the live rule: persistent locked players are protected from automatic
      // individual benching while enough unlocked players are available.
      const benchPriority=[...ids].filter(id=>!locked.has(id)).sort((a,b)=>benchCounts[a]-benchCounts[b]||stableHash(`${round}|${a}`)-stableHash(`${round}|${b}`));
      const nextBench=benchPriority.slice(0,benchPlaces);
      const nextBenchSet=new Set(nextBench),sportingSet=new Set(sporting.map(s=>s.id));
      const outgoing=sporting.filter(s=>nextBenchSet.has(s.id));
      const replacements=currentBench.filter(id=>!nextBenchSet.has(id));
      assert.equal(outgoing.length,replacements.length,'fairness substitutions must balance');checks++;
      const replacementFor=new Map(outgoing.map((s,i)=>[s.id,replacements[i]]));
      sporting=sporting.map(s=>replacementFor.has(s.id)?{...s,id:replacementFor.get(s.id)}:s);
      const nextCourts=[];for(let rank=1;rank<=activeCourts;rank++){const rows=sporting.filter(s=>s.rank===rank),a=rows.filter(s=>s.side==='A').map(s=>s.id),b=rows.filter(s=>s.side==='B').map(s=>s.id);assert.equal(a.length,2);assert.equal(b.length,2);nextCourts.push({rank,a,b});checks+=2;}
      const activeIds=nextCourts.flatMap(c=>[...c.a,...c.b]);assert.equal(new Set(activeIds).size,courtCapacity);checks++;
      assert.ok(!nextBenchSet.has('p1')&&!nextBenchSet.has('p2'),'locked pair must not be individually auto-benched');checks++;
      assert.ok(sameTeam(nextCourts,'p1','p2'),'persistent pair must remain the same team');checks++;
      assert.equal(courtOf(nextCourts,'p1'),courtOf(nextCourts,'p2'),'persistent pair must remain on one court');checks++;
      assert.equal(courtOf(nextCourts,'p1'),earnedCourt,'persistent pair must remain on its jointly earned sporting court');checks++;
      for(const id of nextBench)benchCounts[id]=(benchCounts[id]||0)+1;
      currentBench=nextBench;courts=nextCourts;
    }
    scenarios++;
  }
}
console.log(`KOTC persistent-pair simulation: PASS\n${checks} invariants across ${scenarios} roster/court scenarios and 12 rounds each. Locked pair stayed partnered, un-split by benching, and on its earned court.`);
