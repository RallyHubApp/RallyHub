/**
 * Safe centre-ledger recovery: never retry a provider call and never clear an
 * event's atomic dedupe reservation merely because a response timed out.
 */
export function describeTournivalLedger(attempt:any,campaign:any,message:any,recipient:any){
 if(!attempt)return {state:'missing_attempt',action:'investigate'};
 if(attempt.status==='sending'||['sent','accepted','delivered','opened','clicked'].includes(attempt.status))
  return {state:attempt.status,action:'investigate_provider'};
 if(attempt.status==='suppressed'||attempt.status==='cancelled')
  return {state:attempt.status,action:'none'};
 if(!campaign||!message||!recipient||
   attempt.campaign_id!==campaign.id||attempt.message_id!==message.id||
   attempt.recipient_id!==recipient.id||
   message.campaign_id!==campaign.id||recipient.campaign_id!==campaign.id)
  return {state:'incomplete',action:attempt.status==='queued'?'quarantine':'investigate'};
 return {state:'complete',action:'none'};
}
export async function inspectTournivalQueue(base44:any,{tenantId,clubId,eventId}:any){
 const db=base44.asServiceRole.entities;
 const event=(await db.Tournament.filter({
  id:eventId,tenant_id:tenantId,host_club_id:clubId
 },'-created_date',1))?.[0];
 if(!event||String(event.format).toLowerCase()!=='tournival')throw Error('Scoped Tournival not found');
 const keys=(event.tournival_communication_keys||[]).filter((k:any)=>
  typeof k==='string'&&k.startsWith('tournival|'+tenantId+'|'+eventId+'|'));
 const attempts=await db.CommunicationDeliveryAttempt.filter({tenant_id:tenantId},'-created_date',1000);
 const scoped=(attempts||[]).filter((a:any)=>keys.includes(a.idempotency_key));
 const ids=(field:string)=>[...new Set(scoped.map((a:any)=>a[field]).filter(
  (x:any)=>x&&x!=='pending'))];
 const [campaigns,messages,recipients]=await Promise.all([
  ids('campaign_id').length?db.CommunicationCampaign.filter({tenant_id:tenantId,id:{$in:ids('campaign_id')}},'-created_date',1000):[],
  ids('message_id').length?db.CommunicationMessage.filter({tenant_id:tenantId,id:{$in:ids('message_id')}},'-created_date',1000):[],
  ids('recipient_id').length?db.CommunicationRecipient.filter({tenant_id:tenantId,id:{$in:ids('recipient_id')}},'-created_date',1000):[]
 ]);
 const byId=(rows:any[])=>new Map((rows||[]).map((r:any)=>[r.id,r]));
 const [cs,ms,rs]=[byId(campaigns),byId(messages),byId(recipients)];
 const rows=keys.map((key:string)=>{
  const a=scoped.find((x:any)=>x.idempotency_key===key);
  const c:any=a?cs.get(a.campaign_id):null;
  const m:any=a?ms.get(a.message_id):null;
  const r:any=a?rs.get(a.recipient_id):null;
  const owned=c?.source_record_id===eventId&&c?.club_id===clubId&&c?.source_module==='Tournival';
  const state=describeTournivalLedger(a,owned?c:null,m,r);
  return {key,attemptId:a?.id||null,status:a?.status||null,provider:a?.provider||null,
   errorCode:a?.error_code||null,...state};
 });
 return {eventId,rows,counts:{
  complete:rows.filter((r:any)=>r.state==='complete').length,
  incomplete:rows.filter((r:any)=>r.state==='incomplete'||r.state==='missing_attempt').length,
  unsafe:rows.filter((r:any)=>r.action==='investigate_provider').length
 }};
}
