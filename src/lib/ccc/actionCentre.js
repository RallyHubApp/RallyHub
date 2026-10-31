/** CCC v2.1 action centre: deterministic projections of already-authorised tenant records.
 * This module does not query, mutate, message or approve any production records.
 */
const STATUS = Object.freeze({
  membership: {pending_approval:'membership_approval',approved_awaiting_payment:'membership_payment',payment_failed:'membership_payment_failed'},
  guest: {pending_approval:'guest_approval',approved_payment_hold:'guest_payment',waitlisted:'guest_waitlist'},
  event: {pending_approval:'event_approval',approved_payment_hold:'event_payment',waitlisted:'event_waitlist'}
});
const priority = {membership_payment_failed:0,guest_approval:1,membership_approval:1,event_approval:1,guest_payment:2,event_payment:2,membership_payment:2,guest_waitlist:3,event_waitlist:3};
export function actionCentreItems({tenantId,clubId,memberships=[],guestBookings=[],eventRegistrations=[]}={}){
  if(!tenantId||!clubId) return [];
  const sources=[['membership',memberships],['guest',guestBookings],['event',eventRegistrations]];
  const items=[];
  for(const [source,rows] of sources){
    for(const record of Array.isArray(rows)?rows:[]){
      if(record?.tenant_id!==tenantId||record?.club_id!==clubId)continue;
      const state=record.registration_status||record.application_status||record.status;
      const type=STATUS[source][state];
      if(!type||!record.id)continue;
      items.push({id:`${source}:${record.id}`,source,recordId:record.id,type,priority:priority[type],createdAt:record.created_at||record.created_date||''});
    }
  }
  return items.sort((a,b)=>a.priority-b.priority||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}
export function actionCentreCounts(items=[]){
  const counts={total:0,approvals:0,payments:0,waitlist:0};
  for(const item of items){counts.total++;if(item.type.endsWith('_approval'))counts.approvals++;else if(item.type.includes('payment'))counts.payments++;else if(item.type.endsWith('_waitlist'))counts.waitlist++;}
  return counts;
}
