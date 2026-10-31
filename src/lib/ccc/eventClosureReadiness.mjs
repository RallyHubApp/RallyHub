import {reconcileEventAttendance} from './attendanceReconciliation.mjs';
import {exportReadiness} from './registrationExports.mjs';
/** Advisory post-event closure gate: fail closed on incomplete reads, attendance, finance and delivery evidence. */
export function reviewEventClosure(registrations=[],{hasMore=true,paymentReadComplete=false,finance=null,followup=null,activityStatus='',duplicateIds=[]}={}){
 const attendance=reconcileEventAttendance(registrations,{hasMore});
 const roster=exportReadiness(registrations,{hasMore,initialPaymentReadComplete:paymentReadComplete,extraReview:!!finance?.requiresReview});
 const checks=[
  {code:'activity_completed',label:'Activity marked completed',passed:activityStatus==='completed'},
  {code:'roster_complete',label:'Complete registration roster loaded',passed:roster.complete&&!duplicateIds.length},
  {code:'attendance_reconciled',label:'All confirmed registrations have explicit attendance outcomes',passed:attendance.closed},
  {code:'payment_records_complete',label:'All linked payment records loaded',passed:paymentReadComplete&&!!finance?.complete},
  {code:'financial_exceptions_clear',label:'No outstanding internal payment discrepancies',passed:!!finance&&!finance.requiresReview&&!(finance.anomalies||[]).length},
  {code:'provider_settlement_verified',label:'External payment settlement independently verified',passed:false},
  {code:'followup_permission_verified',label:'Follow-up consent and endpoint suppression independently checked',passed:false},
  {code:'delivery_audit_verified',label:'Communication delivery and audit independently verified',passed:false}
 ];
 return {checks,passed:checks.filter(c=>c.passed).length,required:checks.length,open:checks.filter(c=>!c.passed).map(c=>c.code),operationallyReconciled:checks.slice(0,5).every(c=>c.passed),releaseApproved:false,deliveryApproved:false,attendance,roster,followupReviewOnly:!!followup};
}
