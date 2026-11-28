// Storage adapter requires an atomic insert-if-absent implementation. Never substitute a read/create pair.
export function reportPayload(body,scope,session,actor){
 return {...scope,session_id:session.id,venue_id:session.venue_id,source:body.source,reporter_id:actor,operation_id:body.operationId,incident_at:new Date(body.incidentAt).toISOString(),type:body.type,description:body.description.trim(),people:body.people.map(p=>({name:p.name.trim(),type:p.type})),actions:body.actions,outcome:body.outcome,witnesses:body.witnesses,supplies:body.supplies,status:'submitted'};
}
export async function persistReport(store,payload){
 if(typeof store?.insertIfAbsent!=='function')throw Error('Atomic storage unavailable');
 const key=JSON.stringify([payload.tenant_id,payload.club_id,payload.source,payload.session_id,payload.reporter_id,payload.operation_id]);
 const result=await store.insertIfAbsent(key,payload);
 if(!result?.record?.id)throw Error('Submission not confirmed');
 if(result.record.operation_id!==payload.operation_id||result.record.reporter_id!==payload.reporter_id||result.record.tenant_id!==payload.tenant_id||result.record.club_id!==payload.club_id||result.record.session_id!==payload.session_id||result.record.source!==payload.source)throw Error('Receipt scope mismatch');
 return {id:result.record.id,duplicate:!result.created};
}
