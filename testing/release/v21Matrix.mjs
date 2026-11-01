/** v2.1 release programme: explicit test coverage and externally required evidence. */
export const V21_WORKSTREAMS=Object.freeze([
 {id:'identity',name:'Identity, membership and payments',patterns:['member','membership','payment','finance','identity','access','scoped'],evidence:['base44_runtime','cross_tenant','sumup_provider','concurrency']},
 {id:'booking',name:'Sessions, guests and attendance',patterns:['booking','guest','attendance','session','host','recurrence'],evidence:['base44_runtime','cross_tenant','capacity_concurrency','host_mobile']},
 {id:'events',name:'Event registration, finance and closure',patterns:['event','registration','activity','refund','closure','followup'],evidence:['base44_runtime','provider_settlement','registration_concurrency','attendance_uat']},
 {id:'sporting',name:'Tournival, KOTC and DUPR',patterns:['tournival','kotc','sporting','dupr','fixture'],evidence:['base44_runtime','host_mobile','dupr_provider','score_concurrency']},
 {id:'directory_comms',name:'Directory, communications and Command Centre',patterns:['directory','communication','comms','people','operational','command','analytics','export','consent','brand'],evidence:['base44_runtime','cross_tenant','delivery_provider','consent_uat']}
]);
export function classifyV21Tests(paths){
 return V21_WORKSTREAMS.map(group=>({id:group.id,name:group.name,tests:paths.filter(p=>group.patterns.some(token=>p.toLowerCase().includes(token))),evidenceRequired:group.evidence}));
}
export function assessV21Release({testGroups=[],runtimeEvidence={}}={}){
 const groups=testGroups.map(group=>{
  const evidence=runtimeEvidence[group.id]||{};
  const missing=(group.evidenceRequired||[]).filter(key=>evidence[key]?.verified!==true||!evidence[key]?.reference);
  const codePassed=group.passed===true&&group.tests?.length>0;
  return {id:group.id,codePassed,missingEvidence:missing,ready:codePassed&&!missing.length};
 });
 return {ready:groups.length===V21_WORKSTREAMS.length&&groups.every(g=>g.ready),groups,productionVerified:false};
}
