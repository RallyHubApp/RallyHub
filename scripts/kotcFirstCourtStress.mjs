import assert from 'node:assert/strict';
import { validateKotcScore, checkCommandEnvelope } from '../src/lib/kotcV2Workflow.js';
import { buildSportingMovements } from '../src/lib/kotcV2Engine.js';
import { runKotcV2ProductionSimulation } from '../src/lib/kotcV2Simulator.js';
import { readFileSync } from 'node:fs';
const source=(p)=>readFileSync(p,'utf8');
const modes=['timed','first_to','first_court_to_target'];
const paths=['kotcCommand','saveKotcScore','kotcPlayerScore','kotcScorer'];
let checks=0;
for(const fn of paths){const s=source(`base44/functions/${fn}/entry.ts`);assert.match(s,/first_court_to_target/);assert.match(s,/servingSideAtHorn/);checks+=2;}
const command=source('base44/functions/kotcCommand/entry.ts');assert.match(command,/firstCourtCalledRoundId/);assert.match(command,/At least one court must have reached/);assert.match(command,/unresolved\.length/);checks+=3;
const creation=source('base44/functions/createKotcV2Session/entry.ts');assert.match(creation,/score_target:scoringMode==='first_court_to_target'\?11/);assert.match(creation,/win_by_two:scoringMode==='first_court_to_target'\?false/);checks+=2;
const session={scoring_mode:'first_court_to_target',score_target:11,win_by_two:false};
const cases=[[11,7,null,'A'],[7,11,null,'B'],[8,6,null,'A'],[5,5,'B','B'],[0,0,'A','A'],[10,10,null,null],[12,1,null,null]];
for(let i=0;i<1500;i++)for(const [a,b,serving,winner] of cases){const r=validateKotcScore({teamAScore:a,teamBScore:b,session,servingSideAtHorn:serving,final:true});assert.equal(r.valid,winner!==null);if(winner)assert.equal(r.winnerSide,winner);checks++;}
const courts=Array.from({length:4},(_,i)=>({courtRank:i+1,teamA:[`p${4*i+1}`,`p${4*i+2}`],teamB:[`p${4*i+3}`,`p${4*i+4}`]}));
for(let i=0;i<1000;i++){
 const scores=[[11,7],[8,6],[5,5],[9,4]];const resultsByCourt={};
 for(let c=0;c<4;c++){const [a,b]=scores[c];const r=validateKotcScore({teamAScore:a,teamBScore:b,session,servingSideAtHorn:c===2?'B':null,final:true});assert(r.valid);resultsByCourt[c+1]={winnerSide:r.winnerSide};checks++;}
 const movements=buildSportingMovements({courts,resultsByCourt});assert.equal(movements.length,16);assert.equal(new Set(movements.map(m=>m.participantId)).size,16);checks+=2;
 assert.equal(movements.find(m=>m.participantId==='p11').earnedCourtRank,2);checks++;
}
for(let i=0;i<1000;i++){
 const commandId=`cmd-${i}`;const first=checkCommandEnvelope({commandId,commandType:'end_first_court_round',expectedSessionRevision:4,currentSessionRevision:4});assert(first.ok);const stale=checkCommandEnvelope({commandId,commandType:'end_first_court_round',expectedSessionRevision:4,currentSessionRevision:5});assert(stale.conflict);const duplicate=checkCommandEnvelope({commandId,commandType:'end_first_court_round',expectedSessionRevision:4,currentSessionRevision:5,priorCommands:[{command_id:commandId}]});assert(duplicate.duplicate);checks+=3;
}
const existing=runKotcV2ProductionSimulation({rounds:12});assert(existing.passed);console.log(JSON.stringify({result:'PASS',checks,scenarios:existing.scenarioCount,existingEngineChecks:existing.checkCount,scorePaths:paths.length,benchAndSporting:'existing 12-round simulator passed',modes}));
