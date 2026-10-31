/** Scoped audit projection. Never exposes private payloads or secrets. */
const ACTIONS=new Set(['created','updated','approved','declined','cancelled','archived','restored','attendance_marked','payment_verified','message_sent']);
export function auditTrail({tenantId,clubId,events=[],limit=100}={}){
 if(!tenantId||!clubId)return [];
 const max=Number.isSafeInteger(limit)?Math.max(0,Math.min(500,limit)):100;
 return (Array.isArray(events)?events:[]).filter(e=>e?.tenant_id===tenantId&&e?.club_id===clubId&&e?.id&&ACTIONS.has(e.action)&&Number.isFinite(Date.parse(e.occurred_at||'')))
 .map(e=>({id:e.id,action:e.action,entityType:e.entity_type||'unknown',entityId:e.entity_id||null,actorId:e.actor_id||null,occurredAt:e.occurred_at}))
 .sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)||a.id.localeCompare(b.id)).slice(0,max);
}
