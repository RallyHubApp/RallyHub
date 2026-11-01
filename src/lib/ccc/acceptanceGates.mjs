/** Deterministic release gates for CCC v2.1; evidence is explicit, never inferred from builds. */
export const CCC_GATES=Object.freeze(['membership_payment','guest_booking','event_attendance','tournival_results','communications_delivery']);
export function assessReleaseEvidence(evidence={}){
 const gates=CCC_GATES.map(id=>{
  const record=evidence[id];
  const issues=[];
  if(!record?.sourceTestsPassed)issues.push('source_tests_missing');
  if(!record?.runtimeVerified)issues.push('base44_runtime_unverified');
  if(!record?.crossTenantDenied)issues.push('tenant_isolation_unverified');
  if(!record?.failureRecoveryVerified)issues.push('failure_recovery_unverified');
  if(['membership_payment','guest_booking'].includes(id)&&!record?.paymentProviderVerified)issues.push('payment_provider_unverified');
  if(id==='communications_delivery'&&!record?.deliveryProviderVerified)issues.push('delivery_provider_unverified');
  return {id,passed:issues.length===0,issues};
 });
 return {ready:gates.every(g=>g.passed),passed:gates.filter(g=>g.passed).length,total:gates.length,gates,productionVerified:false};
}
