/** Server-authoritative internal close-out review. Never closes an activity or sends a notice. */
export function assessEventCloseout({activity,registrations=[],payments=[],registrationComplete=false,paymentComplete=false,finance}={}){
 const confirmed=registrations.filter(r=>['confirmed','cash_confirmed'].includes(r.registration_status));
 const unresolved=confirmed.filter(r=>!['attended','no_show','excused'].includes(r.attendance_status));
 const unsettled=registrations.filter(r=>['pending_approval','approved_payment_hold'].includes(r.registration_status)||r.payment_status==='approval_processing');
 const issues=[];
 if(!registrationComplete)issues.push('registration_inventory_incomplete');
 if(!paymentComplete)issues.push('payment_inventory_incomplete');
 if(unresolved.length)issues.push('attendance_unresolved');
 if(unsettled.length)issues.push('booking_or_payment_pending');
 if(finance?.requiresReview||!finance||finance.anomalies?.length)issues.push('internal_finance_discrepancy');
 if(activity?.status!=='completed')issues.push('activity_not_completed');
 return {internalReady:issues.length===0,issues,counts:{registrations:registrations.length,confirmed:confirmed.length,attendanceUnresolved:unresolved.length,bookingPending:unsettled.length,paymentRecords:payments.length},providerSettlementVerified:false,communicationDeliveryVerified:false,finalClosureApproved:false,readOnly:true};
}
