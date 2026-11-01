import {reviewEventOperations} from './operationalTriage.mjs';
import {planEventOperations} from './operationsActionPlan.mjs';
import {reviewCheckoutRecovery} from './checkoutRecovery.mjs';
import {reviewEventNoticeRecovery} from './noticeRecovery.mjs';
/** Single read-only snapshot of event operations, payments and communication recovery. */
export function reviewEventRecoveryDashboard({event,rows,payments,now=Date.now()}={}){
 const operations=reviewEventOperations({event,rows,payments,now});
 const actionPlan=planEventOperations({review:operations,rows});
 const checkouts=reviewCheckoutRecovery({event,rows,payments});
 const confirmations=reviewEventNoticeRecovery({event,rows,noticeType:'booking_confirmed'});
 const blocked=new Set(operations.queue.filter(q=>q.priority===1&&q.registrationId).map(q=>q.registrationId));
 const actionableCheckouts=checkouts.tasks.map(task=>({...task,action:task.action&&!operations.capacityIssue&&!blocked.has(task.registrationId)?task.action:null}));
 return {previewOnly:true,operations,actionPlan,checkouts:{...checkouts,tasks:actionableCheckouts,verifyReady:actionableCheckouts.filter(t=>t.action).length},confirmations,summary:{critical:operations.summary.critical,operationsActions:actionPlan.actionable,checkoutVerification:actionableCheckouts.filter(t=>t.action).length,confirmationDeliveryAudits:confirmations.eligible},requiresManualReconciliation:operations.capacityIssue||operations.summary.critical>0};
}
