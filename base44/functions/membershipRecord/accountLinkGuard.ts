/** Fail-closed account-to-member identity linking. Never infer a link from contact matches. */
export function assessMemberAccountLink({tenantId,clubId,userId,person,membership,player,target,otherPerson,otherPlayer,accessRows=[]}:any){
 const issues:string[]=[];
 if(!tenantId||!clubId||!userId)issues.push('scope_missing');
 if(!person?.id||!membership?.id||!player?.id||!target?.id)issues.push('record_missing');
 if(person?.tenant_id!==tenantId||membership?.tenant_id!==tenantId||membership?.club_id!==clubId||
    player?.tenant_id!==tenantId||player?.club_id!==clubId)issues.push('record_scope_mismatch');
 if(membership?.person_id!==person?.id||player?.person_id!==person?.id)issues.push('person_relationship_mismatch');
 if(target?.id!==userId)issues.push('user_identity_mismatch');
 if(person?.linked_user_id&&person.linked_user_id!==userId)issues.push('person_already_linked');
 if(player?.user_id&&player.user_id!==userId)issues.push('player_already_linked');
 if(otherPerson?.id&&otherPerson.id!==person?.id)issues.push('user_linked_to_other_person');
 if(otherPlayer?.id&&otherPlayer.id!==player?.id)issues.push('user_linked_to_other_player');
 if(!Array.isArray(accessRows))issues.push('access_records_invalid');
 else if(accessRows.length>1)issues.push('duplicate_access_records');
 else for(const row of accessRows){
  if(row?.tenant_id!==tenantId||row?.club_id!==clubId||row?.user_id!==userId)issues.push('access_scope_mismatch');
  if(row?.person_id&&row.person_id!==person?.id)issues.push('access_person_conflict');
  if(row?.player_id&&row.player_id!==player?.id)issues.push('access_player_conflict');
  if(row?.status==='revoked'||row?.status==='suspended')issues.push('access_requires_admin_review');
 }
 return {allowed:issues.length===0,issues:[...new Set(issues)],alreadyLinked:person?.linked_user_id===userId&&player?.user_id===userId};
}
