/** Ancillary notices must never turn a committed sporting result into a false save failure. */
export async function runTournivalPostCommitNotices(loadRecipients:()=>Promise<any[]>,queueNotice:(recipient:any)=>Promise<unknown>){
 try{
  const recipients=await loadRecipients();
  if(!Array.isArray(recipients))return {noticesComplete:false,requiresCommunicationReview:true};
  let failures=0;
  for(const recipient of recipients){try{await queueNotice(recipient)}catch{failures++;}}
  return {noticesComplete:failures===0,requiresCommunicationReview:failures>0,attempted:recipients.length,failures};
 }catch(error){console.warn('Tournival results saved; communication follow-up required',error instanceof Error?error.message:'notice read failed');return {noticesComplete:false,requiresCommunicationReview:true};}
}
