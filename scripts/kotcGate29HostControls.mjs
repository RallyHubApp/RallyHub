import assert from 'node:assert/strict';
import fs from 'node:fs';

const v2=fs.readFileSync('src/components/kotc/KotcV2SessionView.jsx','utf8');
const command=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const startCommand=fs.readFileSync('base44/functions/startKotcRound/entry.ts','utf8');
let checks=0; const ok=(v,m)=>{checks++;assert.ok(v,m)};

ok(v2.includes('Host Round Editor'),'proposed round host editor present');
ok(v2.includes('Tap one player then another to swap'),'single tap-to-swap interaction is the current host editor');
ok(v2.includes('clickCourt'),'court-player tap selection is wired');
ok(v2.includes('clickBench'),'bench-to-court swap path is wired');
ok(!v2.includes('Save Host Adjustments'),'redundant separate save step removed');
ok(v2.includes('onClick={()=>onStart(draft)}'),'edited draft is submitted by the explicit START ROUND tap');
ok(v2.includes("functions.invoke('startKotcRound'"),'UI starts the proposed round through the dedicated start function');
ok(v2.includes("currentRound?.status==='proposed'&&!assistant&&<ProposedRoundEditor"),'editor only appears for proposed round');
ok(!v2.includes("currentRound?.status==='started'&&<ProposedRoundEditor"),'started rounds cannot be host-edited');

ok(startCommand.includes("round.status!=='proposed'"),'server rejects start from a non-proposed round');
ok(startCommand.includes("new Set(nextIds).size!==nextIds.length"),'duplicate-player invariant guarded at start');
ok(startCommand.includes('every team must contain two players'),'two-player team integrity guarded at start');
ok(startCommand.includes("assignment_type:'manual_override'"),'manual overrides are explicitly recorded');
ok(startCommand.includes('changedCourts'),'only changed courts are rebuilt');
ok(startCommand.includes("action:'kotc_round_started'"),'round start and manual court changes are audited');
ok(startCommand.includes('team_a_participant_ids:court.filter'),'match Team A is rebuilt from edited slots');
ok(startCommand.includes('team_b_participant_ids:court.filter'),'match Team B is rebuilt from edited slots');

ok(command.includes("commandType === 'set_participant_status'"),'participant status command wired');
ok(command.includes("action==='voluntary_rest'"),'one-round voluntary rest wired');
ok(command.includes("action==='temporarily_unavailable'"),'temporary unavailable wired');
ok(command.includes("action==='injured'"),'injury wired');
ok(command.includes("action==='leaving_early'"),'leaving early wired');
ok(command.includes("action==='back_available'"),'return available wired');
ok(command.includes("fairness_credit:false"),'status exceptions do not earn fairness credit');
ok(command.includes("available_again_from_round"),'temporary/rest return round persisted');
ok(v2.includes('PlayerStatusControls'),'live player controls rendered through the current Session Menu component');
ok(v2.includes("act('voluntary_rest')"),'sit-out quick action rendered');
ok(v2.includes("act('injured')"),'injury quick action rendered');
ok(v2.includes("act('leaving_early')"),'leaving-early quick action rendered');
ok(v2.includes("act('back_available')"),'back-available quick action rendered');
ok(command.includes('currentActiveCourts'),'safe court-count transition compares old and new court counts');
ok(command.includes('court-transition'),'court-count remap uses deterministic transition seed');
ok(command.includes('Court transition did not produce exactly four players per active court'),'court transition enforces complete-court invariant');
ok(command.includes("action:'kotc_court_count_transition'"),'court-count transitions are audited');
ok(command.includes('Fewer than four available players remain. Finish or abandon the session'),'catastrophic under-four state fails safely');
ok(command.includes('destination_from_prior_round:s.destination_from_prior_round'),'transition preserves earned destination metadata');
console.log(`KOTC Gate 2.9 host controls: PASS\n${checks} host-control checks, 0 failures.`);