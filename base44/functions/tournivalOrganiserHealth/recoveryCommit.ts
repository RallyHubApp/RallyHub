import {buildTournivalRecoveryPreview} from './recoveryPreview.ts';
import {summariseTournivalRecoveryEvidence} from './recoveryEvidence.ts';
/** Explicit organiser-approved CAS reconciliation; never promotes a stale mirror into the session. */
export async function commitTournivalMirrorRecovery({tournament,sessions,expectedSessionRevision,expectedMirrorRevision,confirm,updateMirror}:any){
 if(confirm!==true)return {committed:false,reason:'confirmation_required'};
 const preview=buildTournivalRecoveryPreview(tournament,sessions);
 const evidence=summariseTournivalRecoveryEvidence(preview);
 if(!evidence.valid)return {committed:false,reason:'recovery_not_safe'};
 if(evidence.toRevision!==expectedSessionRevision||evidence.fromRevision!==expectedMirrorRevision)return {committed:false,reason:'stale_preview'};
 const session=sessions[0];
 const result=await updateMirror({id:tournament.id,tenant_id:tournament.tenant_id,host_club_id:tournament.host_club_id,tournival_state:tournament.tournival_state},{$set:{tournival_state:session.state_json}});
 if(result?.updated!==1)return {committed:false,reason:'concurrent_change'};
 return {committed:true,fromRevision:evidence.fromRevision,toRevision:evidence.toRevision,requiresRecheck:true};
}
