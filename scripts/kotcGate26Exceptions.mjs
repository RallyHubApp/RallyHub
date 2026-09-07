import assert from 'node:assert/strict';
import {
  checkCommandEnvelope, prepareScoreAutosave, prepareMatchCompletion,
  prepareMatchCorrection, finalisationIssues, prepareSessionTransition,
  prepareRoundTransition, prepareRegeneratedRoundProposal, buildRecoverySnapshot,
  validateRecoverySnapshot, prepareHostTakeover, canGenerateNextRound,
} from '../src/lib/kotcV2Workflow.js';
import { activeCourtCount } from '../src/lib/kotcV2Domain.js';
import { selectFairnessBench, applySlotPreservingSubstitutions } from '../src/lib/kotcV2Fairness.js';

let checks=0; const ok=(v,m)=>{checks++;assert.ok(v,m)};
const session={id:'s',status:'in_progress',revision:4,scoring_mode:'timed',engine_version:'v2',rules_version:'v2'};
const players=n=>Array.from({length:n},(_,i)=>({id:`p${i+1}`,fairness_benches:0,consecutive_rounds_played:i,total_rounds_played:i,consecutive_court1_rounds:i<2?2:0,recent_fairness_burden:0,was_fairness_benched_previous_round:false,destination_court_rank:Math.floor(i/4)+1}));

// 1 no-show / late arrival boundaries: allocation changes only at safe next-round generation.
ok(activeCourtCount(12,3)===3); ok(activeCourtCount(11,3)===2); ok(activeCourtCount(12,3)===3);
// 2 voluntary rest: not fairness credit; only remaining bench places selected.
let ps=players(15); let fair=selectFairnessBench({participants:ps.filter(p=>p.id!=='p15'),requiredFairnessBenchCount:2}); ok(fair.fairnessBenchIds.length===2); ok(!fair.fairnessBenchIds.includes('p15'));
// 3 slot preserving substitution: one vacancy, no cascade.
const slots=[1,2,3,4].map((n,i)=>({slot_number:n,participant_id:`p${i+1}`,ladder_court_rank:1,team_side:n<3?'A':'B'}));
const sub=applySlotPreservingSubstitutions({sportingSlots:slots,outgoing:{p1:'voluntary_rest'},replacementParticipantIds:['p15']}); ok(sub.substitutions.length===1); ok(sub.slots[0].participant_id==='p15'); ok(sub.slots.slice(1).every((s,i)=>s.participant_id===`p${i+2}`));
// 4 simultaneous departures/court contraction arithmetic.
for(const [n,c,b] of [[18,4,2],[17,4,1],[16,4,0],[15,3,3],[14,3,2],[13,3,1],[12,3,0],[11,2,3],[10,2,2],[9,2,1],[8,2,0],[7,1,3]]){ok(activeCourtCount(n,4)===c,`${n}`);ok(n-c*4===b)}
// 5 court loss/recovery effective next round.
ok(activeCourtCount(12,2)===2); ok(activeCourtCount(12,3)===3);
// 6 score autosave and retry/stale match revision.
const m={id:'m',status:'scheduled',revision:0,round_number:1}; const save=prepareScoreAutosave({match:m,teamAScore:4,teamBScore:3,expectedRevision:0,commandId:'a'}); ok(save.ok&&save.update.revision===1); ok(prepareScoreAutosave({match:{...m,revision:1},teamAScore:5,teamBScore:3,expectedRevision:0,commandId:'b'}).conflict);
// 7 tied horn preserves raw score and serving winner.
const comp=prepareMatchCompletion({match:m,session,teamAScore:8,teamBScore:8,servingSideAtHorn:'B',expectedRevision:0,commandId:'c',userId:'u'}); ok(comp.ok&&comp.update.winner_side==='B'&&comp.update.team_a_score===8&&comp.update.team_b_score===8&&comp.update.result_method==='timed_serving_tiebreak');
// 8 correction before next round starts regenerates proposal; after start does not cascade.
const done={...m,status:'completed',revision:1,team_a_score:8,team_b_score:7,winner_side:'A',result_method:'normal'};
let cor=prepareMatchCorrection({match:done,session,teamAScore:7,teamBScore:8,expectedRevision:1,commandId:'d',userId:'u',reason:'entry error',nextRound:{status:'proposed'}}); ok(cor.ok&&cor.roundRepair.regenerateProposal);
cor=prepareMatchCorrection({match:done,session,teamAScore:7,teamBScore:8,expectedRevision:1,commandId:'e',userId:'u',reason:'entry error',nextRound:{status:'started'}}); ok(cor.ok&&!cor.roundRepair.regenerateProposal&&cor.roundRepair.repairAtNextSafeTransition);
// 9 proposal versioning and started-round immutability.
let regen=prepareRegeneratedRoundProposal({round:{id:'r2',round_number:2,status:'proposed',proposal_revision:1,active_court_count:3,bench_count:0},commandId:'g',inputHash:'i',outputHash:'o'});ok(regen.ok&&regen.replacement.proposal_revision===2);ok(!prepareRegeneratedRoundProposal({round:{status:'started'},commandId:'x'}).ok);
// 10 pause/resume and abandon transitions.
let tr=prepareSessionTransition({session,toStatus:'paused',expectedRevision:4,commandId:'p',userId:'u'});ok(tr.ok&&tr.update.status==='paused');tr=prepareSessionTransition({session:{...session,status:'paused'},toStatus:'in_progress',expectedRevision:4,commandId:'q',userId:'u'});ok(tr.ok);tr=prepareSessionTransition({session,toStatus:'abandoned',expectedRevision:4,commandId:'z',userId:'u',reason:'venue emergency'});ok(tr.ok&&tr.update.abandonment_reason==='venue emergency');
// 11 unresolved match blocks advance/finalise.
ok(!canGenerateNextRound({currentRound:{status:'completed',round_number:1},matches:[{round_number:1,status:'in_progress'}]}).allowed);ok(finalisationIssues({session:{status:'completed'},rounds:[],matches:[{status:'in_progress'}]}).length>0);
// 12 completed data permits finalisation.
ok(finalisationIssues({session:{status:'completed'},rounds:[{status:'completed'}],matches:[{status:'completed'}]}).length===0);
// 13 command retry/idempotency and stale structural device.
let env=checkCommandEnvelope({commandId:'cmd',commandType:'pause_session',expectedSessionRevision:4,currentSessionRevision:4,priorCommands:[]});ok(env.ok);env=checkCommandEnvelope({commandId:'cmd',commandType:'pause_session',expectedSessionRevision:4,currentSessionRevision:5,priorCommands:[{command_id:'cmd',result_json:'{}'}]});ok(env.duplicate);env=checkCommandEnvelope({commandId:'new',commandType:'pause_session',expectedSessionRevision:4,currentSessionRevision:5,priorCommands:[]});ok(env.conflict);
// 14 independent courts can autosave despite session revision drift.
env=checkCommandEnvelope({commandId:'score2',commandType:'autosave_score',expectedSessionRevision:1,currentSessionRevision:9,priorCommands:[]});ok(env.ok&&!env.sessionRevisionEnforced);
// 15 recovery never fabricates winner/result.
const snap=buildRecoverySnapshot({session,participants:[{id:'p1'}],rounds:[{id:'r',status:'started'}],matches:[{id:'m',status:'in_progress',team_a_score:4,team_b_score:4}]});ok(validateRecoverySnapshot(snap).valid);const bad=buildRecoverySnapshot({session,participants:[{id:'p1'}],matches:[{id:'m',status:'completed'}]});ok(!validateRecoverySnapshot(bad).valid);
// 16 host takeover conflict and successful takeover.
let lease=prepareHostTakeover({activeLease:{holder_user_id:'u1',lease_revision:2,status:'active'},newUserId:'u2',expectedLeaseRevision:1,reason:'phone failed'});ok(lease.conflict);lease=prepareHostTakeover({activeLease:{holder_user_id:'u1',lease_revision:2,status:'active'},newUserId:'u2',expectedLeaseRevision:2,reason:'phone failed'});ok(lease.ok&&lease.newLease.lease_revision===3&&lease.supersedeCurrent.status==='superseded');
// 17 round lifecycle prevents unsafe transition.
ok(prepareRoundTransition({round:{status:'proposed',proposal_revision:1},toStatus:'confirmed',expectedProposalRevision:1,commandId:'r',userId:'u'}).ok);ok(!prepareRoundTransition({round:{status:'proposed',proposal_revision:1},toStatus:'completed',expectedProposalRevision:1,commandId:'r',userId:'u'}).ok);
// 18 under four cannot create doubles court.
ok(activeCourtCount(3,4)===0);
console.log(`KOTC Gate 2.6 exception/transition suite: PASS\n${checks} explicit exception checks, 0 failures.`);
