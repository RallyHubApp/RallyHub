import {reviewTournivalRecovery} from './tournivalRecoveryReview.mjs';
/** Pure advisory proposal. Caller must enforce authoritative host grants and server-side CAS. */
export function proposeTournivalHostRecovery(event,{expectedRevision,courts=4,hostId,confirmedMatchIds=[]}={}) {
 const review=reviewTournivalRecovery(event,{courts,expectedRevision});
 const issues=[...review.issues];
 if(typeof hostId!=='string'||!hostId.trim())issues.push({code:'host_identity_required'});
 if(!Number.isInteger(expectedRevision))issues.push({code:'expected_revision_required'});
 const playing=Array.isArray(event?.matches)?event.matches.filter(m=>m?.status==='playing'):[];
 const confirmed=new Set(confirmedMatchIds);
 if(!Array.isArray(confirmedMatchIds)||confirmed.size!==confirmedMatchIds.length)issues.push({code:'invalid_confirmations'});
 if(playing.some(m=>!confirmed.has(m.id)))issues.push({code:'active_match_confirmation_missing'});
 if([...confirmed].some(id=>!playing.some(m=>m.id===id)))issues.push({code:'unknown_match_confirmation'});
 return {ready:issues.length===0,issues,expectedRevision,hostId:hostId||null,
  actions:playing.map(m=>({matchId:m.id,action:'host_confirm_current_score_and_court',requiresManualAction:true})),
  writesPerformed:false,externalCallsPerformed:false};
}
/** Requires a fresh snapshot and explicit acknowledgement. Never modifies results. */
export function acknowledgeTournivalHostRecovery(event,proposal,{expectedRevision,hostId}={}) {
 if(!proposal?.ready)throw Error('Recovery proposal not ready');
 if(!event||event.revision!==expectedRevision||proposal.expectedRevision!==expectedRevision)throw Error('Stale recovery revision');
 if(!hostId||proposal.hostId!==hostId)throw Error('Recovery host mismatch');
 const current=proposeTournivalHostRecovery(event,{expectedRevision,hostId,
  confirmedMatchIds:proposal.actions.map(a=>a.matchId)});
 if(!current.ready)throw Error('Recovery snapshot failed validation');
 // Domain-only candidate: persistence must enforce authoritative host grants and compare-and-swap.
 return {...event,revision:event.revision+1,audit:[...(event.audit||[]),{
  revision:event.revision+1,type:'host_recovery_acknowledged',actor:hostId,at:new Date().toISOString(),
  matchIds:proposal.actions.map(a=>a.matchId)}]};
}
