/** Payment status is monotonic: provider failure cannot reverse an already settled booking. */
export function reviewGuestPaymentVerification(booking:any,providerStatus:any){
 const status=String(providerStatus||'PENDING').toUpperCase();
 const settled=['paid','partially_refunded','refunded'].includes(String(booking?.payment_status||''));
 if(settled&&status!=='PAID')return {action:'preserve_settlement',status:String(booking.payment_status)};
 if(status==='PAID')return {action:settled?'already_settled':'settle',status:'paid'};
 if(status==='FAILED'||status==='EXPIRED')return {action:'mark_failed',status:status.toLowerCase()};
 return {action:'pending',status:status.toLowerCase()};
}
/** Confirmation failures are a separate operational problem, not a payment failure. */
export async function completeGuestPaymentConfirmation(booking:any,send:(booking:any)=>Promise<any>){
 try{return {booking:await send(booking),confirmationNeedsReview:false}}catch(error){
  console.warn('Guest payment settled; confirmation needs review',error instanceof Error?error.message:'delivery unavailable');
  return {booking,confirmationNeedsReview:true};
 }
}
