/** Fail-closed guest journey audit. Read-only: does not reserve capacity or settle payment. */
export function reviewGuestBookingIntegrity({registration,approval,payment,attendance}={}){
 const issues=[];
 if(!registration?.id||!registration?.tenant_id||!registration?.club_id)issues.push('registration_scope_missing');
 for(const [name,row] of [['approval',approval],['payment',payment],['attendance',attendance]]){
  if(row&&(row.tenant_id!==registration?.tenant_id||row.club_id!==registration?.club_id))issues.push(`${name}_scope_mismatch`);
  if(row?.registration_id&&row.registration_id!==registration?.id)issues.push(`${name}_registration_mismatch`);
 }
 if(payment?.payment_status==='paid'&&approval?.status!=='approved')issues.push('paid_without_approval');
 if(attendance?.status==='attended'&&registration?.registration_status!=='confirmed')issues.push('attendance_without_confirmation');
 if(registration?.registration_status==='confirmed'&&payment?.payment_status!=='paid'&&registration?.payment_method!=='cash')issues.push('confirmed_without_settlement');
 return {healthy:issues.length===0,issues,automaticRepair:false};
}
