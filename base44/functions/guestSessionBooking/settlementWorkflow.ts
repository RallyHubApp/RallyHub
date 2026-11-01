/** Admin settlement decisions are monotonic and scoped to the booking. */
export function reviewCashSettlement(booking:any){
 if(booking?.payment_method!=='cash')return {allowed:false,reason:'not_cash'};
 if(['refunded','partially_refunded','refund_pending'].includes(String(booking.payment_status||'')))return {allowed:false,reason:'refund_state'};
 if(booking.payment_status==='paid')return {allowed:true,alreadySettled:true};
 if(!['cash_due','confirmed'].includes(String(booking.booking_status||'')))return {allowed:false,reason:'booking_not_eligible'};
 return {allowed:true,alreadySettled:false};
}
export function selectBookingPaymentRecords(records:any[],booking:any,session:any){
 const rows=(Array.isArray(records)?records:[]).filter(p=>p?.purpose_type==='booking'&&p?.purpose_id===booking?.id&&p?.tenant_id===session?.tenant_id&&p?.club_id===session?.club_id);
 if(rows.length>1)return {records:[],reason:'multiple_payment_records'};
 if(records?.length&&rows.length!==records.length)return {records:[],reason:'cross_scope_payment_record'};
 return {records:rows,reason:null};
}
