/** Read-only, scoped identity integrity review. No implicit merges or repairs. */
export function assessMembershipIdentityHealth({tenantId,clubId,person,membership,player,accessRows=[]}:any){
 const issues:string[]=[];
 if(!tenantId||!clubId||!person?.id||!membership?.id)issues.push('scope_or_record_missing');
 if(person?.tenant_id!==tenantId||membership?.tenant_id!==tenantId||membership?.club_id!==clubId)issues.push('record_scope_mismatch');
 if(membership?.person_id!==person?.id)issues.push('membership_person_mismatch');
 if(!player?.id)issues.push('player_record_missing');
 else {
  if(player.tenant_id!==tenantId||player.club_id!==clubId)issues.push('player_scope_mismatch');
  if(player.person_id!==person?.id)issues.push('player_person_mismatch');
 }
 const linkedUserId=String(person?.linked_user_id||'');
 const playerUserId=String(player?.user_id||'');
 if(Boolean(linkedUserId)!==Boolean(playerUserId))issues.push('partial_account_link');
 if(linkedUserId&&playerUserId&&linkedUserId!==playerUserId)issues.push('conflicting_account_links');
 if(!Array.isArray(accessRows))issues.push('access_records_invalid');
 else {
  const relevant=accessRows.filter((a:any)=>a?.person_id===person?.id||a?.player_id===player?.id||
   (linkedUserId&&a?.user_id===linkedUserId)||(playerUserId&&a?.user_id===playerUserId));
  if(relevant.length>1)issues.push('multiple_access_records');
  for(const access of relevant){
   if(access.tenant_id!==tenantId||access.club_id!==clubId)issues.push('access_scope_mismatch');
   if(access.person_id&&access.person_id!==person?.id)issues.push('access_person_mismatch');
   if(access.player_id&&access.player_id!==player?.id)issues.push('access_player_mismatch');
   if(access.user_id&&(linkedUserId||playerUserId)&&access.user_id!==(linkedUserId||playerUserId))issues.push('access_user_mismatch');
   if(access.status==='active'&&!linkedUserId)issues.push('access_without_account_link');
  }
  if(linkedUserId&&!relevant.some((a:any)=>a.user_id===linkedUserId&&a.status==='active'))issues.push('linked_account_missing_active_access');
 }
 return {healthy:issues.length===0,issues:[...new Set(issues)],linked:Boolean(linkedUserId&&playerUserId),requiresManualReview:issues.length>0,automaticRepair:false};
}
