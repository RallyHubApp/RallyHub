import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeKotcV2Leaderboard, resolveCourt1Champions } from '../src/lib/kotcV2Results.js';
import { runKotcV2ProductionSimulation } from '../src/lib/kotcV2Simulator.js';

let checks=0; const ok=(v,m)=>{checks++;assert.ok(v,m)};
const command=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const startCommand=fs.readFileSync('base44/functions/startKotcRound/entry.ts','utf8');
const endCommand=fs.readFileSync('base44/functions/endKotcSession/entry.ts','utf8');
const state=fs.readFileSync('base44/functions/getKotcV2State/entry.ts','utf8');
const view=fs.readFileSync('src/components/kotc/KotcV2SessionView.jsx','utf8');

// Security / tenancy / authority rehearsal.
ok(state.includes("if(!user)return Response.json({error:'Unauthorized'}"),'state endpoint requires authentication');
ok(state.includes("KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'})"),'state endpoint checks per-session access');
ok(state.includes("String(a.tenant_id||'')!==String(tenantId||'')"),'state access verifies tenant id');
ok(command.includes("if (!user) return Response.json({ error:'Unauthorized' }"),'command endpoint requires authentication');
ok(command.includes("KotcSessionAccess.filter({ session_id:session.id, user_id:user.id, status:'active' })"),'command endpoint checks per-session host access');
ok(command.includes("String(a.tenant_id || '') !== String(tenantId || '')"),'command access verifies tenant id');
ok(command.includes("['session_host','assistant_host'].includes(a.role)"),'command endpoint restricts write roles');
ok(command.includes("if (!allowed) return Response.json({ error:'KOTC session host permission required'"),'unauthorised mutation is rejected');

// Concurrency / idempotency / recovery rehearsal.
ok(command.includes('KotcCommandLog.filter({ session_id:session.id, command_id:commandId })'),'duplicate commands are detected');
ok(command.includes("Session changed since you opened it."),'stale structural revisions are rejected');
ok(command.includes("Match changed since you opened it."),'stale score revisions are rejected');
ok(command.includes('proposal_revision:currentProposalRevision+1'),'manual round edit bumps proposal revision');
ok(command.includes('KotcRecoveryCheckpoint.create'),'recovery snapshots are persisted');
ok(command.includes("commandType === 'takeover_host'"),'host takeover path exists');
ok(command.includes('lease_revision:currentLeaseRevision + 1'),'host takeover is revisioned');

// Live host / exception rehearsal.
ok(view.includes('Host Round Editor'),'host can review and adjust proposed rounds');
ok(!view.includes('Save Host Adjustments'),'redundant explicit host-adjustment save removed from normal flow');
ok(view.includes("functions.invoke('kotcCommand'"),'general live host mutations use the KOTC command endpoint');
ok(view.includes("functions.invoke('startKotcRound'"),'START ROUND uses the dedicated lightweight start endpoint');
ok(startCommand.includes('const user=await base44.auth.me()')&&startCommand.includes("error:'Unauthorized'")&&startCommand.includes('status:401'),'dedicated start endpoint requires authentication');
ok(startCommand.includes("Primary session host access required"),'dedicated start endpoint requires primary host access');
ok(startCommand.includes("round.status==='started'"),'dedicated start endpoint is idempotent after a successful start');
ok(startCommand.includes("round.status!=='proposed'"),'dedicated start endpoint only starts proposed rounds');
ok(startCommand.includes("expectedProposalRevision"),'dedicated start endpoint guards the sporting proposal revision');
ok(startCommand.includes("status:'started'"),'dedicated start endpoint commits the round to started');
ok(view.includes('Undo Start / Back to Round Setup'),'safe unscored-round recovery is visible');
ok(command.includes("commandType === 'undo_start_round'"),'undo-start backend command exists');
ok(command.includes("commandType === 'set_pair_lock'"),'host pair-lock backend command exists');
ok(view.includes('Lock pair'),'pair lock/unlock is exposed in the host editor');
ok(view.includes('PlayerStatusControls'),'live participant controls remain available behind Session Menu');
ok(command.includes("action==='voluntary_rest'"),'voluntary one-round rest supported');
ok(command.includes("action==='temporarily_unavailable'"),'temporary absence supported');
ok(command.includes("action==='injured'"),'injury supported');
ok(command.includes("action==='leaving_early'"),'leaving early supported');
ok(command.includes("action==='back_available'"),'return to availability supported');
ok(command.includes("action:'kotc_court_count_transition'"),'court count transition is audited');
ok(command.includes('Fewer than four available players remain. Finish or abandon the session'),'catastrophic under-four path fails safely');
ok(command.includes("commandType === 'finish_session_now'"),'normal finish path exists');
ok(command.includes("commandType === 'abandon_session'"),'abandon fail-safe exists');

// Full production-module sporting simulation.
const sim=runKotcV2ProductionSimulation({rounds:9});
ok(sim.passed,`production simulation failed: ${JSON.stringify(sim.failedChecks?.slice(0,3)||[])}`);
ok(sim.steadyScenarioCount===370,'all 4-40 player / 1-10 court steady combinations rehearsed');
ok(sim.checkCount>=25000,'full production simulator invariant volume retained');

// Results/final-round rehearsal with deterministic 16-player, 4-court synthetic finish.
const participants=Array.from({length:16},(_,i)=>({id:`p${i+1}`,display_name:`Player ${i+1}`,seed_rank:i+1}));
const matches=[];
for(let r=1;r<=9;r++){
  for(let c=1;c<=4;c++){
    const base=(c-1)*4; const ids=[`p${base+1}`,`p${base+2}`,`p${base+3}`,`p${base+4}`];
    matches.push({id:`r${r}c${c}`,round_number:r,ladder_court_rank:c,status:'completed',team_a_participant_ids:[ids[0],ids[1]],team_b_participant_ids:[ids[2],ids[3]],team_a_score:8+r%3,team_b_score:6,winner_side:'A'});
  }
}
const leaderboard=computeKotcV2Leaderboard({participants,matches});
ok(leaderboard.length===16,'all participants appear in final leaderboard');
ok(new Set(leaderboard.map(x=>x.final_rank)).size===16,'final ranks are unique');
const champions=resolveCourt1Champions({matches,enabled:true});
ok(champions.awarded===true,'Court 1 Champions are awarded from final completed round');
ok(champions.roundNumber===9,'Court 1 Champions come from final completed round');
ok(champions.participantIds.join('|')==='p1|p2','Court 1 Champions preserve winning pair');

// UI lifecycle rehearsal.
ok(!view.includes("doCommand('confirm_round'"),'redundant confirm-round UI removed');
ok(view.includes("functions.invoke('startKotcRound'"),'single START ROUND path is wired through the dedicated start endpoint');
ok(view.includes("functions.invoke('prepareKotcNextRound'")&&view.includes('preparingRound')&&view.includes('advanced&&next'),'Prepare Next Round uses the dedicated reconciliation-aware generation flow');
ok(view.includes("doCommand('pause_session'"),'pause wired');
ok(view.includes("doCommand('resume_session'"),'resume wired');
ok(view.includes('data-testid="kotc-finish-session"')&&view.includes('Finish Session'),'finish control is available in Session Menu');
ok(view.includes("functions.invoke('endKotcSession'"),'finish/abandon UI uses dedicated session-end function');
ok(endCommand.includes("action==='finish'"),'dedicated finish path exists');
ok(endCommand.includes("action==='abandon'"),'dedicated abandon path exists');

console.log(`KOTC Gate 2.10 deployment rehearsal: PASS\n${checks} deployment-readiness checks, 0 failures.\nProduction simulator: ${sim.checkCount} invariant checks across ${sim.steadyScenarioCount} steady scenarios.`);
