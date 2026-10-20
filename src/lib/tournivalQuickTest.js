/** Tournival local acceptance robot. Synthetic data ONLY.
 * Never calls Base44, payments, email or DUPR. Uses actual V1 domain functions.
 */
import {generateGroupFixtures,createKnockoutPairs,createKnockoutBracket,computeLeaderboard,validateTournivalScore} from './tournivalEngine.js';
import {indexTournivalMatches,scheduleTournivalCourts,recordTournivalResult,verifyCourtIntegrity} from './tournivalScheduler.js';
import {createTournivalEvent,registerTournivalPlayer,checkInTournivalPlayer,startTournival,applyTournivalMatchChange,assertRehearsalIsolation} from './tournivalOperations.js';

const ids=n=>Array.from({length:n},(_,i)=>'rehearsal-player-'+(i+1));
const names=n=>Object.fromEntries(ids(n).map((id,i)=>[id,'Rehearsal Player '+(i+1)]));
const scoreFor=(m,i)=>i%3===0?[8,10]:[8,5];
function play(m,a,b){
 return recordTournivalResult([m],{
  matchId:m.id,expectedRevision:m.revision,idempotencyKey:'quick-test:'+m.id+':'+m.revision,
  scoreA:a,scoreB:b,matchFormat:'timed_10'
 },validateTournivalScore).matches[0];
}
function finishMatches(matches,courts){
 let pending=matches.map(m=>({...m})),cycles=0;
 while(pending.some(m=>m.status!=='completed')){
  if(++cycles>100)throw Error('Simulation stalled: unexpected fixture or court conflict');
  const scheduled=scheduleTournivalCourts(pending,{courts});
  pending=scheduled.matches;
  verifyCourtIntegrity(pending,courts);
  const active=pending.filter(m=>m.status==='playing');
  if(!active.length)throw Error('Simulation cannot allocate remaining matches');
  for(const [i,m] of active.entries()){
   const [a,b]=scoreFor(m,cycles+i);
   pending=pending.map(x=>x.id===m.id?play(m,a,b):x);
  }
 }
 return pending;
}
export function createQuickScenario({players=16,courts=4,rounds=4}={}){
 if(!Number.isInteger(players)||players<8||players>32||players%4!==0)throw Error('Choose 8–32 players in groups of four');
 if(!Number.isInteger(courts)||courts<1||courts>8||courts>players/4)throw Error('Choose an available number of courts');
 if(!Number.isInteger(rounds)||rounds<2||rounds>6)throw Error('Choose 2–6 rounds');
 let event=createTournivalEvent({id:'REHEARSAL-QUICK-LOCAL',tenantId:'simulation',clubId:'simulation',capacity:players,fee:5,rehearsal:true});
 for(const [i,id] of ids(players).entries()){
  event=registerTournivalPlayer(event,{playerId:id,name:'Rehearsal Player '+(i+1),operationId:'quick-register:'+id}).event;
  event=checkInTournivalPlayer(event,{playerId:id});
 }
 const qualification=generateGroupFixtures(ids(players),courts,rounds);
 event=startTournival(event,{matches:indexTournivalMatches(qualification)});
 assertRehearsalIsolation(event);
 return {event,qualification,knockout:[],phase:'qualification',ranked:[],players,courts,rounds,checks:['Synthetic registration and check-in passed','Rehearsal isolation verified']};
}
export function finishQuickQualification(scenario){
 if(!scenario||scenario.phase!=='qualification')throw Error('Start a qualification rehearsal first');
 const {qualification,courts,players,rounds}=scenario;
 const done=finishMatches(scenario.event.matches,courts);
 const event=applyTournivalMatchChange(scenario.event,{matches:done,action:'quick_test_qualification'});
 assertRehearsalIsolation(event);
 const results={};
 for(const m of done){
  if(!results[m.round])results[m.round]={};
  results[m.round][m.order+1]=m.result;
 }
 const ranked=computeLeaderboard(ids(players),qualification,results,names(players));
 const pairCount=Math.min(8,2**Math.floor(Math.log2(Math.floor(players/2))));
 const pairs=createKnockoutPairs(ranked.slice(0,pairCount*2));
 if(pairs.length<2)throw Error('No valid seeded knockout pairs');
 const initial=createKnockoutBracket(pairs).map((m,i)=>({
  id:'knockout:0:'+i,round:rounds+1,order:i,
  stage:m.match.startsWith('QF')?'QF':m.match.startsWith('SF')?'SF':'Final',
  pair1:m.pair1,pair2:m.pair2,
  teamA:[m.pair1.player1.id,m.pair1.player2.id],
  teamB:[m.pair2.player1.id,m.pair2.player2.id],
  status:'waiting',court:null,revision:0,result:null,matchFormat:'timed_10'
 }));
 return {...scenario,event,ranked,knockout:initial,phase:'knockout',
  checks:[...scenario.checks,'Qualification scored on actual scheduler: '+done.length+' matches','Individual rankings and '+pairs.length+' seeded pairs calculated']};
}
export function finishQuickKnockout(scenario){
 if(!scenario||scenario.phase!=='knockout')throw Error('Finish qualification before knockout');
 let bracket=[...scenario.knockout],steps=0;
 while(true){
  if(++steps>8)throw Error('Knockout failed to terminate');
  const current=bracket.at(-1).stage;
  const active=bracket.filter(m=>m.stage===current&&m.status!=='completed');
  if(active.length){
   const complete=finishMatches(active,scenario.courts);
   const byId=new Map(complete.map(m=>[m.id,m]));
   bracket=bracket.map(m=>byId.get(m.id)||m);
  }
  if(current==='Final')break;
  const winners=bracket.filter(m=>m.stage===current).map(m=>{
   if(!m.result)throw Error('Unscored knockout match');
   return m.result.winner==='A'?m.pair1:m.pair2;
  });
  if(winners.length<2)throw Error('Knockout winners missing');
  const next=createKnockoutBracket(winners).map((m,i)=>({
   id:'knockout:'+bracket.length+':'+i,round:scenario.rounds+steps+1,
   order:i,stage:winners.length===2?'Final':'SF',pair1:m.pair1,pair2:m.pair2,
   teamA:[m.pair1.player1.id,m.pair1.player2.id],
   teamB:[m.pair2.player1.id,m.pair2.player2.id],
   status:'waiting',court:null,revision:0,result:null,matchFormat:'timed_10'
  }));
  if(!next.length)throw Error('No next knockout stage generated');
  bracket=[...bracket,...next];
 }
 if(!bracket.some(m=>m.stage==='Final'&&m.result))throw Error('No final result');
 assertRehearsalIsolation(scenario.event);
 return {...scenario,knockout:bracket,phase:'complete',
  checks:[...scenario.checks,'Knockout finished: '+bracket.length+' scored matches','Final recorded; all external integrations disabled']};
}
export function runQuickAcceptance(options){return finishQuickKnockout(finishQuickQualification(createQuickScenario(options)));}
export function quickTestReport(scenario){
 if(!scenario)return null;
 const matches=scenario.event.matches;
 const all=[...matches,...scenario.knockout];
 return {phase:scenario.phase,players:scenario.players,registered:scenario.event.registrations.length,
  checkedIn:scenario.event.registrations.filter(r=>r.checkedIn).length,
  qualificationScored:matches.filter(m=>m.status==='completed'&&m.result).length,
  qualificationExpected:scenario.qualification.reduce((n,r)=>n+r.courts.length,0),
  knockoutScored:scenario.knockout.filter(m=>m.status==='completed'&&m.result).length,
  champion:scenario.knockout.find(m=>m.stage==='Final'&&m.result)?.result?.winner||null,
  allScored:scenario.phase==='complete'&&all.every(m=>m.status==='completed'&&m.result),
  isolated:scenario.event.rehearsal===true&&scenario.event.outbox.length===0,
  checks:scenario.checks
 };
}
