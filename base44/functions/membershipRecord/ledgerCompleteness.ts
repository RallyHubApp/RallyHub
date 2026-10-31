/** A full Base44 page is not proof that the ledger is complete. */
export function assessMembershipLedgerCompleteness({memberships,people,accesses,pageSize=500}:any){
 const issues:string[]=[];
 if(!Number.isSafeInteger(pageSize)||pageSize<1)issues.push('invalid_page_size');
 for(const [name,rows] of Object.entries({memberships,people,accesses})){
  if(!Array.isArray(rows))issues.push(`${name}_response_invalid`);
  else if(rows.length>=pageSize)issues.push(`${name}_may_be_truncated`);
 }
 return {complete:issues.length===0,issues,source:'ClubMembership',requiresPagination:issues.some(x=>x.endsWith('_may_be_truncated'))};
}
