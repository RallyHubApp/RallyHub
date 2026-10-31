/** Stable, auditable read-only evidence of a candidate tournament mirror reconciliation. */
export function summariseTournivalRecoveryEvidence(preview:any){
 if(!preview?.available||!preview?.review?.readyForOrganiserReview)return {valid:false,reason:'not_reconcilable'};
 const {fromRevision,toRevision,sessionId,tournamentId,changes}=preview;
 if(!sessionId||!tournamentId||!Number.isSafeInteger(fromRevision)||!Number.isSafeInteger(toRevision)||toRevision<=fromRevision)return {valid:false,reason:'revision_invalid'};
 if(!changes||!Number.isSafeInteger(changes.matches)||!Number.isSafeInteger(changes.results)||changes.matches<0||changes.results<0)return {valid:false,reason:'result_inventory_invalid'};
 return {valid:true,sessionId,tournamentId,fromRevision,toRevision,revisionGap:toRevision-fromRevision,matchCount:changes.matches,resultCount:changes.results,manualApprovalRequired:true,automaticWriteAllowed:false};
}
