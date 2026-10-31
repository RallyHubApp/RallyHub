/** The session CAS is authoritative. A failed denormalised mirror update must never be reported as an uncommitted score. */
export async function mirrorCommittedTournivalHostState(updateMirror:(id:string,patch:any)=>Promise<unknown>,tournament:any,next:any){
 try{
  await updateMirror(tournament.id,{tournival_state:JSON.stringify(next),
   status:next.status==='Group Complete'?'In Progress':tournament.status});
  return {committed:true,mirrorSynced:true,requiresReconciliation:false};
 }catch(error){
  console.warn('Tournival mirror update deferred after committed session CAS',error instanceof Error?error.message:'mirror update failed');
  return {committed:true,mirrorSynced:false,requiresReconciliation:true};
 }
}
