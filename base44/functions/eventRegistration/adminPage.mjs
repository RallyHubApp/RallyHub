import {readAdminEventPayments} from './scopedPaymentReader.mjs';
import {selectRefundableEventPayment,selectCheckoutPayment} from './paymentSelection.mjs';
/** Base44 SDK positional filter pagination for small events; fail closed at 500 records. */
export async function readEventAdminPage(registrationEntity,paymentEntity,{eventId,tenantId,clubId,cursor=''}){
 if(!eventId||!tenantId||!clubId)throw Error('Admin event scope required');
 if(cursor)throw Error('Admin registration pagination unsupported for this SDK');
 const query={event_id:eventId,tenant_id:tenantId,club_id:clubId};
 const registrations=await registrationEntity.filter(query,'-created_date',500);
 if(!Array.isArray(registrations)||registrations.length>=500)throw Error('Admin registration verification incomplete');
 for(const r of registrations)if(!r?.id||r.event_id!==eventId||r.tenant_id!==tenantId||r.club_id!==clubId)throw Error('Admin registration scope violation');
 const payments=await readAdminEventPayments(paymentEntity,{tenantId,clubId,registrationIds:registrations.map(r=>r.id)});
 const groups=new Map();
 for(const p of payments){const list=groups.get(p.purpose_id)||[];list.push(p);groups.set(p.purpose_id,list)}
 const rows=registrations.map(r=>{
  const group=groups.get(r.id)||[],selection=selectRefundableEventPayment(group,r);
  const p=selection.payment||selectCheckoutPayment(group,r).payment||null;
  return {id:r.id,name:r.full_name,email:r.email,mobile:r.mobile,emergencyContactName:r.emergency_contact_name,emergencyContactMobile:r.emergency_contact_mobile,status:r.registration_status,paymentStatus:r.payment_status,createdAt:r.created_at,paymentRecordId:p?.id||null,paymentRecordStatus:p?.payment_status||null,amount:Number(p?.amount||0),refundedAmount:Number(p?.amount_refunded||0),transactionReference:p?.provider_payment_reference||'',refundableAmount:selection.payment?Math.max(0,Number(selection.payment.amount||0)-Number(selection.payment.amount_refunded||0)):0,refundReviewRequired:selection.reason==='ambiguous_refundable_payments'||selection.reason==='checkout_mismatch'||selection.reason==='refund_in_progress'||(r.payment_status==='paid'&&!selection.payment)};
 });
 return {registrations:rows,nextCursor:null,hasMore:false};
}
