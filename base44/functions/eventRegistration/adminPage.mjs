import {readAdminEventPayments} from './scopedPaymentReader.mjs';
import {selectRefundableEventPayment,selectCheckoutPayment} from './paymentSelection.mjs';
/** Read-only event-admin paging with the Base44 SDK positional filter API. */
export async function readEventAdminPage(registrationEntity,paymentEntity,{eventId,tenantId,clubId,cursor='',pageSize=200}){
 if(!eventId||!tenantId||!clubId)throw Error('Admin event scope required');
 const offset=cursor?Number(cursor):0;
 if(!Number.isSafeInteger(offset)||offset<0||offset>10000)throw Error('Invalid event admin page offset');
 const query={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const page=await registrationEntity.filter(query,'-created_date',pageSize+1,offset);
 if(!Array.isArray(page))throw Error('Admin registration listing unavailable');
 const hasMore=page.length>pageSize;
 const registrations=page.slice(0,pageSize);
 const payments=await readAdminEventPayments(paymentEntity,{tenantId,clubId,registrationIds:registrations.map(r=>r.id)});
 const groups=new Map();
 for(const p of payments){const list=groups.get(p.purpose_id)||[];list.push(p);groups.set(p.purpose_id,list)}
 const rows=registrations.map(r=>{
  const group=groups.get(r.id)||[],selection=selectRefundableEventPayment(group,r);
  const p=selection.payment||selectCheckoutPayment(group,r).payment||null;
  return {id:r.id,name:r.full_name,email:r.email,mobile:r.mobile,emergencyContactName:r.emergency_contact_name,emergencyContactMobile:r.emergency_contact_mobile,status:r.registration_status,paymentStatus:r.payment_status,createdAt:r.created_at,paymentRecordId:p?.id||null,paymentRecordStatus:p?.payment_status||null,amount:Number(p?.amount||0),refundedAmount:Number(p?.amount_refunded||0),transactionReference:p?.provider_payment_reference||'',refundableAmount:selection.payment?Math.max(0,Number(selection.payment.amount||0)-Number(selection.payment.amount_refunded||0)):0,refundReviewRequired:selection.reason==='ambiguous_refundable_payments'||selection.reason==='checkout_mismatch'||selection.reason==='refund_in_progress'||(r.payment_status==='paid'&&!selection.payment)};
 });
 return {registrations:rows,nextCursor:hasMore?String(offset+pageSize):null,hasMore};
}
