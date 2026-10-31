import React from 'react';
import { paymentLedger, paymentReconciliationSummary } from '@/lib/ccc/paymentReconciliation';

/** Read-only payment status summary; no financial operations or payment verification. */
export default function ClubPaymentPanel({tenantId,clubId,payments=[],loading=false,error=false}){
 const ledger=paymentLedger({tenantId,clubId,payments});
 const summary=paymentReconciliationSummary(ledger);
 const metrics=[['Paid records',summary.paid],['Pending records',summary.pending],['Failed records',summary.failed],['Refunded / partially refunded',summary.refunded]];
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Club payment reconciliation">
  <div className="mb-3"><h2 className="text-lg font-bold">Payment reconciliation</h2><p className="text-sm text-muted-foreground">Read-only payment record status · Latest 250 records</p></div>
  {loading?<p className="text-sm text-muted-foreground">Loading payment records…</p>:error?<p role="alert" className="text-sm text-destructive">Payment records unavailable. No financial changes have been made.</p>:!tenantId||!clubId?<p className="text-sm text-muted-foreground">Select an active club to view payment status.</p>:<>
   <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{metrics.map(([label,value])=><div key={label} className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>)}</div>
   {summary.duplicates>0&&<p className="mt-3 text-sm text-destructive">{summary.duplicates} potential duplicate provider transaction records need review.</p>}
   {summary.unknownAmount>0&&<p className="mt-2 text-sm text-muted-foreground">{summary.unknownAmount} records have an unverified amount.</p>}
   <p className="mt-3 text-xs text-muted-foreground">Status counts are not revenue totals. Confirm payments against the provider before taking action.</p>
  </>}
 </section>;
}
