import {assessTournivalHostStateHealth} from '../tournivalHostAccess/stateHealth.ts';
import {planTournivalHostReconciliation} from '../tournivalHostAccess/reconciliation.ts';
/** Read-only organiser diagnostic. Never automatically writes a stale mirror over authoritative state. */
export function reviewTournivalOrganiserHealth(tournament:any,sessions:any[]){
 const issues:string[]=[];
 if(!tournament?.id||!tournament?.tenant_id||!tournament?.host_club_id)issues.push('event_scope_missing');
 if(!Array.isArray(sessions)||sessions.length!==1)issues.push('session_count_invalid');
 const session=Array.isArray(sessions)&&sessions.length===1?sessions[0]:null;
 if(session?.rehearsal)issues.push('rehearsal_session_not_live');
 if(session&&session.club_id!==tournament?.host_club_id)issues.push('session_club_scope_mismatch');
 const health=session?assessTournivalHostStateHealth(session,tournament):null;
 const plan=session?planTournivalHostReconciliation(session,tournament):null;
 const safe=issues.length===0&&health?.healthy===true;
 return {healthy:safe,issues:[...issues,...(health?.issues||[])],sessionRevision:health?.sessionRevision??null,
  mirrorRevision:health?.mirrorRevision??null,requiresReconciliation:!safe,
  readyForOrganiserReview:issues.length===0&&plan?.readyForOrganiserReview===true,
  proposedAction:issues.length===0?plan?.action||'none':'investigate_inconsistent_state',
  automaticRepair:false,requiresManualApproval:true,hostWritesAllowed:safe};
}
