import {assessTournivalHostStateHealth} from './stateHealth.ts';
/** Conservative recovery plan; no writes or automatic promotion of stale data. */
export function planTournivalHostReconciliation(session:any,tournament:any){
 const health=assessTournivalHostStateHealth(session,tournament);
 const blocking=health.issues.filter((issue:string)=>issue!=='tournament_mirror_revision_mismatch');
 const candidate=blocking.length===0&&health.issues.includes('tournament_mirror_revision_mismatch')&&
  Number.isInteger(health.sessionRevision)&&Number.isInteger(health.mirrorRevision)&&
  health.sessionRevision>health.mirrorRevision;
 return {readyForOrganiserReview:candidate,requiresManualApproval:true,automaticRepair:false,
  action:candidate?'review_session_to_tournament_mirror':'investigate_inconsistent_state',
  sessionRevision:health.sessionRevision,mirrorRevision:health.mirrorRevision,issues:health.issues};
}
