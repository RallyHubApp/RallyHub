/** Cross-record integrity diagnostics; never auto-links, merges or exposes contacts. */
export function identityIntegrity(accessRows=[],{tenantId,clubId,complete=false}={}){
 const active=accessRows.filter(a=>a?.tenant_id===tenantId&&a?.club_id===clubId&&a?.status==='active');
 const byPerson=new Map(),byUser=new Map();
 for(const a of active){
  if(a.person_id){if(!byPerson.has(a.person_id))byPerson.set(a.person_id,new Set());byPerson.get(a.person_id).add(a.user_id||'unknown')}
  if(a.user_id&&a.person_id){if(!byUser.has(a.user_id))byUser.set(a.user_id,new Set());byUser.get(a.user_id).add(a.person_id)}
 }
 const personConflicts=[...byPerson].filter(([,users])=>users.size>1).map(([personId,users])=>({personId,linkedUserCount:users.size}));
 const userConflicts=[...byUser].filter(([,people])=>people.size>1).map(([userId,people])=>({userId,linkedPersonCount:people.size}));
 const missingPerson=active.filter(a=>!a.person_id).map(a=>({accessId:a.id,userId:a.user_id||''}));
 return {complete,activeAccessCount:active.length,unlinkedActiveCount:missingPerson.length,duplicatePersonLinkCount:personConflicts.length,duplicateUserLinkCount:userConflicts.length,personConflicts:personConflicts.slice(0,50),userConflicts:userConflicts.slice(0,50),unlinkedReview:missingPerson.slice(0,50),requiresReview:!complete||missingPerson.length>0||personConflicts.length>0||userConflicts.length>0,mutationPerformed:false,autoMergeEnabled:false};
}
