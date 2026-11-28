export const INCIDENT_TYPES = Object.freeze(['injury','medical','near_miss','hazard','complaint','other']);
export const REPORT_STATES = Object.freeze(['draft','awaiting_sync','submitted','submission_failed']);
export function validateIncidentDraft(draft) {
  if (!draft || typeof draft !== 'object') return ['Incident data is required'];
  const errors=[];
  if (!INCIDENT_TYPES.includes(draft.type)) errors.push('Select a valid incident type');
  if (!draft.sessionId && !draft.retrospective) errors.push('Session reference is required');
  if (!draft.venueId) errors.push('Venue reference is required');
  if (!draft.incidentAt || Number.isNaN(Date.parse(draft.incidentAt))) errors.push('Valid incident time is required');
  if (!String(draft.description || '').trim()) errors.push('Factual description is required');
  if (!draft.reporterId) errors.push('Authorised reporter is required');
  return errors;
}
export function createDraft({id,sessionId,venueId,reporterId,incidentAt,type='injury'}) {
  if (!id || !reporterId) throw new Error('Draft identifier and reporter required');
  return {id,sessionId,venueId,reporterId,incidentAt,type,status:'draft',persons:[],actions:[],supplies:[],description:'',version:1};
}
export function transitionReport(report,next,{confirmed=false}={}) {
  const allowed={draft:['awaiting_sync'],awaiting_sync:['submitted','submission_failed'],submission_failed:['awaiting_sync'],submitted:[]};
  if (!allowed[report.status]?.includes(next)) throw new Error('Invalid report transition');
  if (next==='submitted' && !confirmed) throw new Error('Server confirmation required');
  return {...report,status:next,version:report.version+1};
}
export function stockMovementKey(incidentId,kitId,itemId) {
  if (![incidentId,kitId,itemId].every(Boolean)) throw new Error('Movement identifiers required');
  return [incidentId,kitId,itemId].map(v=>encodeURIComponent(String(v))).join(':');
}
