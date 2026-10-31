/** Explicit identity linking; never merge by matching email or mobile alone. */
export function identityLinkDecision({tenantId,clubId,person,member,confirmedByAdmin=false}={}){
 const deny=reason=>({allowed:false,reason});
 if(!tenantId||!clubId)return deny('scope_required');
 if(!person?.id||!member?.id)return deny('record_required');
 if(person.tenant_id!==tenantId||member.tenant_id!==tenantId||member.club_id!==clubId)return deny('scope_mismatch');
 if(member.person_id&&member.person_id!==person.id)return deny('conflicting_person_link');
 if(!confirmedByAdmin)return deny('explicit_confirmation_required');
 return {allowed:true,personId:person.id,memberId:member.id,alreadyLinked:member.person_id===person.id};
}
