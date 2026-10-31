/** Membership configuration preflight. Does not approve, charge or communicate. */
export function membershipReadiness(configs=[],policies=[],documents=[],gateways=[],{tenantId,clubId,complete=false}={}){
 const scoped=(rows)=>rows.filter(x=>x?.tenant_id===tenantId&&x?.club_id===clubId);
 const active=scoped(configs).filter(c=>c.status==='active');
 const results=active.map(c=>{
  const issues=[];
  if(!c.public_slug)issues.push('public_slug_missing');
  if(!c.season_label)issues.push('season_missing');
  if(!Number.isFinite(Number(c.membership_fee))||Number(c.membership_fee)<0)issues.push('fee_invalid');
  if(!c.currency)issues.push('currency_missing');
  if(c.payment_required){
   if(!c.payment_gateway_account_id)issues.push('gateway_not_selected');
   else if(!scoped(gateways).some(g=>g.id===c.payment_gateway_account_id&&g.provider==='sumup'&&g.status==='connected'))issues.push('gateway_not_connected');
  }
  const docs=scoped(documents).filter(d=>d.active===true);
  for(const [field,type] of [['privacy_document_id','privacy_data'],['waiver_document_id','liability_waiver'],['code_document_id','code_of_conduct'],['health_document_id','health_declaration']]){
   if(!c[field]||!docs.some(d=>d.id===c[field]&&d.document_type===type))issues.push(type+'_not_verified');
  }
  if(!scoped(policies).some(p=>p.policy_type==='adult_participation'&&p.status==='active'&&Number(p.minimum_age)>=18))issues.push('adult_policy_not_verified');
  if(c.active_until&&c.active_from&&c.active_until<c.active_from)issues.push('invalid_active_window');
  return {configId:c.id,season:c.season_label||'',issues,structurallyReady:issues.length===0};
 });
 return {configurations:results,activeConfigCount:active.length,readyConfigCount:results.filter(r=>r.structurallyReady).length,complete,requiresReview:!complete||!active.length||results.some(r=>r.issues.length),checkoutVerified:false,emailRoutingVerified:false,authorisedToCharge:false,mutationPerformed:false};
}
