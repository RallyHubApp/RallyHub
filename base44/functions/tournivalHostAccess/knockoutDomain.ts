/**
 * Server-owned Tournival knockout creation and progression.
 * Hosts submit scores only. Backend calculates pairs and downstream opponents.
 */
const scoreValid=(a:number,b:number,format:string)=>{
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b)return false;
 const win=Math.max(a,b),lose=Math.min(a,b);
 if(format.startsWith('timed_'))return true;
 if(format==='first_11_by1')return win===11&&lose<=10;
 if(format==='first_11_by2')return win>=11&&win-lose>=2&&(win===11||win-lose===2);
 return false;
};
function buildBracket(pairs:any[],stage:string){
 const n=pairs.length;
 if(n<2||n%2!==0)throw Error('Knockout requires even seeded pairs.');
 let positions:number[];
 if(n===8)positions=[0,7,3,4,2,5,1,6];
 else if(n===4)positions=[0,3,1,2];
 else if(n===2)positions=[0,1];
 else throw Error('Unsupported knockout pairing count.');
 return Array.from({length:n/2},(_,i)=>({
  id:`${stage}_${i}`,stage,label:stage==='Final'?'Final':`${stage} ${i+1}`,
  pair1:pairs[positions[i*2]],pair2:pairs[positions[i*2+1]],result:null
 }));
}
export function startTournivalKnockout(state:any,playerNames:Record<string,string>={}){
 if(state.knockoutState?.bracket?.length)throw Error('Knockout already exists');
 const rounds=state.rounds||[],matches=state.matches||[];
 if(!rounds.length||!matches.length||matches.some((m:any)=>m.status!=='completed'))
  throw Error('All qualification matches must be confirmed first.');
 const ids=state.playerIds||[],entries=new Map<string,any>(ids.map((id:string,i:number)=>[
  id,{id,name:playerNames[id]||id,seedOrder:i,won:0,for:0,against:0}
 ]));
 for(const m of matches) {
  const r=m.result;
  if(!r||!scoreValid(Number(r.scoreA),Number(r.scoreB),String(state.matchFormat)))throw Error('Invalid qualification result');
  const a=r.winner==='A'?m.teamA:m.teamB,losers=r.winner==='A'?m.teamB:m.teamA;
  const winnersScore=Math.max(Number(r.scoreA),Number(r.scoreB));
  const loserScore=Math.min(Number(r.scoreA),Number(r.scoreB));
  for(const id of a||[]) {
   const row=entries.get(id);if(row){row.won++;row.for+=winnersScore;row.against+=loserScore;}
  }
  for(const id of losers||[]) {
   const row=entries.get(id);if(row){row.for+=loserScore;row.against+=winnersScore;}
  }
 }
 const board=[...entries.values()].sort((a,b)=>b.won-a.won||b.for-a.for||
  (b.for-b.against)-(a.for-a.against)||a.seedOrder-b.seedOrder);
 const maxPairs=Math.min(8,2**Math.floor(Math.log2(Math.floor(board.length/2))));
 const pairsCount=Math.min(maxPairs,Number(state.knockoutPairs||maxPairs));
 if(![2,4,8].includes(pairsCount)||pairsCount>maxPairs)throw Error('Invalid knockout qualification count');
 const ranked=board.slice(0,pairsCount*2),pairs=Array.from({length:pairsCount},(_,i)=>({
  seed:i+1,player1:ranked[i],player2:ranked[ranked.length-i-1]
 }));
 const stage=pairsCount===8?'QF':pairsCount===4?'SF':'Final';
 return {...state,knockoutState:{pairs,bracket:buildBracket(pairs,stage),currentStage:stage},
  status:'Knockout In Progress'};
}
export function scoreTournivalKnockout(state:any,{
 matchId,scoreA,scoreB,correctionReason=''
}: {matchId:string;scoreA:number;scoreB:number;correctionReason?:string}){
 const knockout=state.knockoutState;
 if(!knockout?.bracket?.length)throw Error('Knockout not created');
 const format=String(state.knockoutMatchFormat||state.matchFormat||'first_11_by1');
 if(!scoreValid(scoreA,scoreB,format))throw Error('Invalid knockout score for format');
 const match=knockout.bracket.find((m:any)=>m.id===matchId);
 if(!match)throw Error('Unknown knockout match');
 if(match.result){
  if(match.result.scoreA===scoreA&&match.result.scoreB===scoreB)
   return {state,duplicate:true};
  if(String(correctionReason).trim().length<6)throw Error('Correction requires written reason');
  // Corrections that may invalidate subsequent completed games require
  // organiser review; do not silently redraw or overwrite downstream fixtures.
  if(knockout.bracket.some((m:any)=>m.stage!==match.stage&&m.result))
   throw Error('Downstream matches already scored; organiser must review correction impact');
 }
 const revision={scoreA,scoreB,winner:scoreA>scoreB?'A':'B'};
 const bracket=knockout.bracket.map((m:any)=>m.id===matchId?{...m,result:revision}:m);
 const stage=knockout.currentStage;
 const current=bracket.filter((m:any)=>m.stage===stage);
 let nextStage=stage;
 if(current.every((m:any)=>m.result)){
  if(stage==='QF'||stage==='SF'){
   nextStage=stage==='QF'?'SF':'Final';
   const winners=current.map((m:any)=>m.result.winner==='A'?m.pair1:m.pair2);
   const additions=buildBracket(winners,nextStage);
   if(nextStage==='Final'&&current.length===2){
    const losers=current.map((m:any)=>m.result.winner==='A'?m.pair2:m.pair1);
    additions.push({id:'3rd_0',stage:'3rd',label:'3rd/4th',pair1:losers[0],pair2:losers[1],result:null});
   }
   bracket.push(...additions);
  }else if(stage==='Final') {
   nextStage='Final';
  }
 }
 const updated={...state,knockoutState:{...knockout,bracket,currentStage:nextStage}};
 const final=bracket.find((m:any)=>m.stage==='Final');
 const third=bracket.find((m:any)=>m.stage==='3rd');
 if(final?.result&&(!third||third.result))
  updated.status='Pending Final Review';
 return {state:updated,duplicate:false};
}
