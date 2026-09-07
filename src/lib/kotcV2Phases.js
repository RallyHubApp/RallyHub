import { compareFairnessCandidates, normaliseFairnessParticipant } from './kotcV2Fairness.js';

export const PAIR_SOURCES = Object.freeze(['preselected','pair_at_transition','host_select_at_transition']);

export function normalisePartnershipPhases(phases, plannedRounds) {
  const maxRound = Number(plannedRounds || 0);
  if (!Number.isInteger(maxRound) || maxRound < 1) throw new Error('plannedRounds must be a positive integer');
  const input = Array.isArray(phases) && phases.length ? phases : [{ start_round:1, end_round:maxRound, mode:'rotating' }];
  const sorted = input.map((phase,index)=>({
    phase_order:index+1,
    start_round:Number(phase.start_round),
    end_round:phase.end_round == null ? maxRound : Number(phase.end_round),
    mode:phase.mode === 'fixed' ? 'fixed' : 'rotating',
    fixed_pair_source:phase.mode === 'fixed' ? (PAIR_SOURCES.includes(phase.fixed_pair_source) ? phase.fixed_pair_source : 'preselected') : undefined,
  })).sort((a,b)=>a.start_round-b.start_round||a.phase_order-b.phase_order);
  let expected=1;
  for(const phase of sorted){
    if(!Number.isInteger(phase.start_round)||!Number.isInteger(phase.end_round)||phase.start_round!==expected||phase.end_round<phase.start_round||phase.end_round>maxRound) throw new Error('Partnership phases must cover every planned round exactly once with no gaps or overlaps');
    expected=phase.end_round+1;
  }
  if(expected!==maxRound+1) throw new Error('Partnership phases must cover every planned round');
  return sorted.map((p,i)=>({...p,phase_order:i+1}));
}

export function phaseForRound(phases, roundNumber) {
  return (phases||[]).find(p=>Number(roundNumber)>=Number(p.start_round)&&Number(roundNumber)<=Number(p.end_round))||null;
}

export function validatePairs(playerIds, pairs, { requireComplete=true }={}) {
  const allowed=new Set(playerIds||[]); const used=new Set(); const errors=[];
  for(const [index,pair] of (pairs||[]).entries()){
    const a=String(pair.player1_id||pair.participant1_id||''), b=String(pair.player2_id||pair.participant2_id||'');
    if(!a||!b||a===b) errors.push(`Pair ${index+1} must contain two different players`);
    for(const id of [a,b]){if(id&&!allowed.has(id))errors.push(`Pair ${index+1} contains an unknown player`);if(id&&used.has(id))errors.push(`Player ${id} appears in more than one pair`);used.add(id);}
  }
  if(requireComplete&&used.size!==allowed.size)errors.push('Every available player must belong to exactly one fixed pair');
  return {valid:errors.length===0,errors};
}

export function selectFixedPairBench({pairs, participants, requiredPairBenchCount, previousBenchIds=[], seed=''}){
  const byId=Object.fromEntries((participants||[]).map(p=>[p.id,p])); const previous=new Set(previousBenchIds||[]);
  const ranked=(pairs||[]).map(pair=>{
    const members=[byId[pair.participant1_id],byId[pair.participant2_id]].filter(Boolean);
    if(members.length!==2)throw new Error('Fixed pair is missing a participant');
    const n=members.map(p=>normaliseFairnessParticipant({...p,was_fairness_benched_previous_round:previous.has(p.id)}));
    const benches=n.map(x=>x.fairnessBenches); const consecutive=n.map(x=>x.consecutiveRoundsPlayed); const rounds=n.map(x=>x.roundsPlayed);
    return {pair,...pair,
      minFairnessBenches:Math.min(...benches), totalFairnessBenches:benches.reduce((a,b)=>a+b,0),
      protected:Number(n.some(x=>x.wasFairnessBenchedPreviousRound||x.justReturnedFromFairnessBench)),
      totalConsecutive:consecutive.reduce((a,b)=>a+b,0), totalRounds:rounds.reduce((a,b)=>a+b,0),
      tie:`${seed}|${pair.id||pair.pair_name||pair.participant1_id+'|'+pair.participant2_id}`};
  }).sort((a,b)=>a.minFairnessBenches-b.minFairnessBenches||a.totalFairnessBenches-b.totalFairnessBenches||a.protected-b.protected||b.totalConsecutive-a.totalConsecutive||b.totalRounds-a.totalRounds||a.tie.localeCompare(b.tie));
  return {benchPairIds:ranked.slice(0,requiredPairBenchCount).map(x=>x.id),ranking:ranked};
}

export function estimateAvailableRounds({scheduledStart, actualStart=new Date(), plannedDurationMinutes, playMinutes, changeoverMinutes}){
  const block=Math.max(1,Number(playMinutes||0)+Number(changeoverMinutes||0));
  const planned=Math.max(0,Number(plannedDurationMinutes||0));
  let remaining=planned;
  if(scheduledStart){const delay=Math.max(0,(new Date(actualStart).getTime()-new Date(scheduledStart).getTime())/60000);remaining=Math.max(0,planned-delay);}
  return {remainingMinutes:Math.floor(remaining),estimatedRounds:Math.floor(remaining/block),roundBlockMinutes:block};
}
