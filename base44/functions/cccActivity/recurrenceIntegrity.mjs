/** Read-only recurrence consistency checks, independent of SDK. */
export function reviewRecurrenceIntegrity(source,children,{inventoryComplete=false}={}){
 const issues=[],seenWeeks=new Set(),seenKeys=new Set();
 const expected=source?.recurrence_expected_count;
 if(!source?.recurrence_batch_key)issues.push('batch_claim_missing');
 if(!Number.isSafeInteger(expected)||expected<1||expected>12)issues.push('expected_count_invalid');
 if(!inventoryComplete)issues.push('inventory_incomplete');
 if(children.length!==expected)issues.push('child_count_mismatch');
 for(const child of children){
  const week=child.configuration?.recurrence_week;
  if(!Number.isSafeInteger(week)||week<1||week>12||seenWeeks.has(week))issues.push('duplicate_or_invalid_week');
  seenWeeks.add(week);
  if(!child.idempotency_key||seenKeys.has(child.idempotency_key))issues.push('duplicate_or_missing_operation_id');
  seenKeys.add(child.idempotency_key);
  if(child.tenant_id!==source.tenant_id||child.club_id!==source.club_id||child.venue_id!==source.venue_id||String(child.court_id||'')!==String(source.court_id||''))issues.push('child_scope_or_resource_mismatch');
  if(child.status!=='draft'||child.linked_event_id)issues.push('child_not_unlinked_draft');
  if(child.configuration?.recurrence_source_activity_id!==source.id)issues.push('source_reference_mismatch');
  if(child.configuration?.recurrence_source_revision!==source.revision-1&&child.configuration?.recurrence_source_revision!==source.revision-2)issues.push('source_revision_mismatch');
  if(child.idempotency_key!==('ccc-rec-'+source.id+'-'+child.configuration?.recurrence_source_revision+'-'+week))issues.push('operation_id_mismatch');
 }
 if(Number.isSafeInteger(expected))for(let week=1;week<=expected;week++)if(!seenWeeks.has(week))issues.push('missing_week');
 return {issues:[...new Set(issues)],consistent:issues.length===0,observedCount:children.length,expectedCount:expected??null,requiresManualReview:issues.length>0||source.recurrence_batch_state!=='complete',safeToAutoRetry:false};
}
