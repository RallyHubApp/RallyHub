/**
 * Durable Base44 waitlist ticket allocator. A successful conditional increment
 * gives each contender a unique monotonically increasing ticket. Ticket gaps
 * are permitted after partial failures; duplicates are not.
 */
export async function allocateTournivalWaitlistTicket({
  tournaments,tournamentId,tenantId,seed,attempts=160
}:{
  tournaments:any;tournamentId:string;tenantId:string;seed:number;attempts?:number
}):Promise<number>{
  if(!Number.isSafeInteger(seed)||seed<0)throw Error('Invalid waitlist seed');
  const scope={id:tournamentId,tenant_id:tenantId};
  await tournaments.updateMany({...scope,tournival_waitlist_sequence:null},
    {$set:{tournival_waitlist_sequence:seed}});
  for(let i=0;i<attempts;i++){
    const row=await tournaments.get(tournamentId);
    const seen=Number(row?.tournival_waitlist_sequence);
    if(!Number.isSafeInteger(seen)||seen<0||seen===Number.MAX_SAFE_INTEGER)
      throw Error('Waitlist sequence requires administrator reconciliation');
    const claim=await tournaments.updateMany({...scope,tournival_waitlist_sequence:seen},
      {$inc:{tournival_waitlist_sequence:1}});
    if(claim.updated===1)return seen+1;
    // Backend reads can lag a competing conditional write; give them time
    // to converge instead of spinning through all retries on one stale value.
    if(i>0)await new Promise(resolve=>setTimeout(resolve,Math.min(80,10+Math.floor(i/8)*5)));
  }
  throw Error('Waitlist is busy; retry the registration');
}
