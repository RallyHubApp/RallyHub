import {reviewTournivalOrganiserHealth} from './healthReview.ts';
/** Read-only evidence for a human organiser; never authorises a repair by itself. */
export function buildTournivalRecoveryPreview(tournament:any,sessions:any[]){
 const review=reviewTournivalOrganiserHealth(tournament,sessions);
 if(!review.readyForOrganiserReview||sessions?.length!==1)return {available:false,review,automaticRepair:false};
 const session=sessions[0];
 let state:any,mirror:any;
 try{state=JSON.parse(session.state_json);mirror=JSON.parse(tournament.tournival_state);}catch{return {available:false,review,automaticRepair:false};}
 if(!state||!mirror||typeof state!=='object'||typeof mirror!=='object')return {available:false,review,automaticRepair:false};
 const changes={matches:Array.isArray(state.matches)?state.matches.length:0,
  results:Array.isArray(state.results)?state.results.length:Object.keys(state.results||{}).length,
  status:String(state.status||''),revision:state.revision};
 return {available:true,review,sessionId:session.id,tournamentId:tournament.id,
  fromRevision:mirror.revision,toRevision:state.revision,changes,
  proposedOperation:'restore_tournament_mirror_from_authoritative_session',
  requiresManualApproval:true,automaticRepair:false,writePerformed:false};
}
