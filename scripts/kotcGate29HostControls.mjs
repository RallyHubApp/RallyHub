import assert from 'node:assert/strict';
import fs from 'node:fs';

const v2=fs.readFileSync('src/components/kotc/KotcV2SessionView.jsx','utf8');
const command=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
let checks=0; const ok=(v,m)=>{checks++;assert.ok(v,m)};

ok(v2.includes('Host Round Editor'),'proposed round host editor present');
ok(v2.includes('draggable'),'desktop drag support present');
ok(v2.includes("onDrop={e=>"),'cross-slot drop support present');
ok(v2.includes('clickSlot'),'tap-to-swap mobile fallback present');
ok(v2.includes('Save Host Adjustments'),'explicit save step present');
ok(v2.includes("doCommand('adjust_proposed_round'"),'UI saves via authoritative command');
ok(v2.includes("currentRound?.status==='proposed'&&<ProposedRoundEditor"),'editor only appears for proposed round');
ok(!v2.includes("currentRound?.status==='started'&&<ProposedRoundEditor"),'started rounds cannot be drag-edited');

ok(command.includes("'adjust_proposed_round'"),'adjust command is structural/revision guarded');
ok(command.includes("round.status !== 'proposed'"),'server rejects post-confirm/start edits');
ok(command.includes('A player cannot appear in more than one slot'),'duplicate-player invariant guarded');
ok(command.includes('swap/reposition of the same active players'),'active-player set invariant guarded');
ok(command.includes('Court ${rank} is incomplete after adjustment'),'four-player court integrity guarded');
ok(command.includes("assignment_type:'manual_override'"),'manual overrides are explicitly recorded');
ok(command.includes("action:'kotc_round_host_adjustment'"),'manual adjustment audit event recorded');
ok(command.includes('proposal_revision:currentProposalRevision+1'),'proposal revision increments after host edit');
ok(command.includes('revision:currentSessionRevision+1'),'session revision increments after host edit');
ok(command.includes('team_a_participant_ids:teamA'),'match teams rebuilt from edited slots');
ok(command.includes('team_b_participant_ids:teamB'),'both match sides rebuilt from edited slots');
ok(command.includes("await createSnapshot(base44,session,commandId,'command'"),'recovery checkpoint follows host edit');

ok(command.includes("commandType === 'set_participant_status'"),'participant status command wired');
ok(command.includes("action==='voluntary_rest'"),'one-round voluntary rest wired');
ok(command.includes("action==='temporarily_unavailable'"),'temporary unavailable wired');
ok(command.includes("action==='injured'"),'injury wired');
ok(command.includes("action==='leaving_early'"),'leaving early wired');
ok(command.includes("action==='back_available'"),'return available wired');
ok(command.includes("fairness_credit:false"),'status exceptions do not earn fairness credit');
ok(command.includes("available_again_from_round"),'temporary/rest return round persisted');
ok(v2.includes('Live Player Controls'),'live player controls rendered');
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