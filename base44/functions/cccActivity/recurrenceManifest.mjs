/** Deterministic, read-only recurrence creation plan.
 * A manifest is NOT a reservation: no atomic slot lock or external booking checks.
 * Keys are stable per source activity + occurrence and must not be used to
 * bypass fresh backend validation during eventual creation.
 */
const acceptable=/^[a-zA-Z0-9_-]{1,120}$/;
export function buildRecurrenceManifest(source,occurrences,{tenantId,clubId,sourceRevision,inventoryComplete=false,ready=false}={}){
 const issues=[];
 if(!source?.id||!acceptable.test(String(source.id)))issues.push('source_id_invalid');
 if(source?.tenant_id!==tenantId||source?.club_id!==clubId)issues.push('source_scope_mismatch');
 if(!Number.isSafeInteger(sourceRevision)||sourceRevision<1||source?.revision!==sourceRevision)issues.push('source_revision_changed');
 if(source?.status!=='draft')issues.push('source_must_be_draft');
 if(source?.linked_event_id)issues.push('linked_event_requires_separate_setup');
 if(!inventoryComplete)issues.push('inventory_incomplete');
 if(!ready)issues.push('schedule_not_ready');
 if(!Array.isArray(occurrences)||occurrences.length<1||occurrences.length>12)issues.push('invalid_occurrence_count');
 const rows=[],keys=new Set(),dates=new Set();
 for(const o of Array.isArray(occurrences)?occurrences.slice(0,12):[]){
  const week=Number(o?.week),start=o?.startsAt,end=o?.endsAt;
  if(!Number.isSafeInteger(week)||week<1||week>12||typeof start!=='string'||typeof end!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(end)){issues.push('invalid_occurrence');continue}
  if(dates.has(start)){issues.push('duplicate_occurrence');continue}
  dates.add(start);
  if(o.conflicts?.length||o.legacyOverlaps?.length||o.legacyUnmapped?.length||o.localTimeIssues?.length){issues.push('occurrence_blocked');continue}
  const key='ccc-rec-'+source.id+'-'+sourceRevision+'-'+week;
  if(key.length>120||keys.has(key)){issues.push('idempotency_key_invalid');continue}
  keys.add(key);
  rows.push({week,startsAt:start,endsAt:end,operationId:key,sourceActivityId:source.id,sourceRevision,venueId:source.venue_id,courtId:source.court_id||null,status:'draft'});
 }
 return {valid:issues.length===0&&rows.length===occurrences?.length,issues:[...new Set(issues)],rows:issues.length?[]:rows,readyToCreate:false,requiresAtomicReservation:true,requiresFreshValidation:true,mutationPerformed:false};
}
