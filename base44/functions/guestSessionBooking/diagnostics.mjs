const token = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,180}$/.test(value) ? value : '';
export function classify(status, providerStatus, network=false) {
  if(network) return 'network';
  if(status===401||status===403) return 'authentication';
  if(status===429) return 'rate_limit';
  if(status>=500) return 'provider';
  if(status>=400) return 'request';
  if(['FAILED','DECLINED','CANCELLED','EXPIRED'].includes(providerStatus)) return 'declined_or_expired';
  return '';
}
export async function diagnosticFetch(fetcher, sink, context, url, options) {
  const start=Date.now();
  const emit=async (response,data,network=false)=>{
    try {
      const tx=Array.isArray(data?.transactions)?data.transactions.find(t=>t?.status==='SUCCESSFUL')||data.transactions[0]:null;
      const status=token(data?.status);
      const event={scope:context.scope,tenant_id:context.tenant_id||'',club_id:context.club_id||'',workflow:context.workflow,operation:context.operation,checkout_id:token(context.checkout_id||data?.id),transaction_id:token(context.transaction_id||tx?.id||data?.transaction_id),reference:token(context.reference||data?.checkout_reference),provider_status:status,http_status:response?.status||0,fault_category:classify(response?.status||0,status,network),duration_ms:Date.now()-start,occurred_at:new Date().toISOString()};
      if(event.scope==='club'&&(!event.tenant_id||!event.club_id))return;
      await sink(event);
    } catch { /* diagnostics must not change payment outcome */ }
  };
  let response;
  try { response=await fetcher(url,options); } catch(error) { await emit(null,null,true); throw error; }
  let data={};
  try { data=await response.clone().json(); } catch {}
  await emit(response,data);
  return response;
}
export function historyScope(user) {
  if(!user?.active_tenant_id||!user?.active_club_id) return null;
  if(user.role!=='admin'&&!(user.approval_status==='approved'&&user.active_club_role==='club_admin'))return null;
  return {scope:'club',tenant_id:user.active_tenant_id,club_id:user.active_club_id};
}
