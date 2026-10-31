/** CCC v2.1 read-only action projection using actual entity status enums.
 * A booking's payment status is distinct from its booking status.
 */
const PRIORITY={membership_payment_failed:0,guest_payment_failed:0,membership_approval:1,event_approval:1,membership_payment:2,guest_payment:2,event_payment:2,event_waitlist:3};
export function actionCentreItems({tenantId,clubId,memberships=[],guestBookings=[],eventRegistrations=[]}={}){
 if(!tenantId||!clubId)return [];
 const items=[],seen=new Set();
 const add=(source,r,type)=>{const id=source+':'+r.id;if(!type||!r.id||seen.has(id))return;seen.add(id);items.push({id,source,recordId:r.id,type,priority:PRIORITY[type],createdAt:r.created_at||r.created_date||''});};
 const scoped=rows=>(Array.isArray(rows)?rows:[]).filter(r=>r?.tenant_id===tenantId&&r?.club_id===clubId);
 for(const r of scoped(memberships)){
  if(r.status==='payment_failed'||r.payment_status==='failed')add('membership',r,'membership_payment_failed');
  else if(r.status==='submitted')add('membership',r,'membership_approval');
  else if(r.status==='pending_payment')add('membership',r,'membership_payment');
 }
 for(const r of scoped(guestBookings)){
  if(r.booking_status==='cancelled')continue;
  if(r.payment_status==='failed')add('guest',r,'guest_payment_failed');
  else if(r.booking_status==='pending_payment')add('guest',r,'guest_payment');
 }
 for(const r of scoped(eventRegistrations)){
  if(r.registration_status==='pending_approval')add('event',r,'event_approval');
  else if(r.registration_status==='approved_payment_hold')add('event',r,'event_payment');
  else if(r.registration_status==='waitlisted')add('event',r,'event_waitlist');
 }
 return items.sort((a,b)=>a.priority-b.priority||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}
export function actionCentreCounts(items=[]){
 const counts={total:0,approvals:0,payments:0,waitlist:0};
 for(const item of items){counts.total++;if(item.type.endsWith('_approval'))counts.approvals++;else if(item.type.includes('payment'))counts.payments++;else if(item.type.endsWith('_waitlist'))counts.waitlist++;}
 return counts;
}
