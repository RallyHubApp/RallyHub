/** A successful authoritative session CAS must not be reported as a failed score when its mirror write fails. */
export async function projectCommittedTournivalState(writeMirror:(id:string,patch:any)=>Promise<unknown>,tournament:any,next:any,mappedStatus:any){
 try{
  await writeMirror(tournament.id,{tournival_state:JSON.stringify(next),...(mappedStatus===undefined?{}:{status:mappedStatus})});
  return {committed:true,mirrorSynced:true,requiresReconciliation:false};
 }catch(error){
  console.warn('Tournival session committed; mirror reconciliation required',error instanceof Error?error.message:'mirror unavailable');
  return {committed:true,mirrorSynced:false,requiresReconciliation:true};
 }
}
