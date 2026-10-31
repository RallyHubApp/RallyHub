import React from 'react';
import {reviewEventClosure} from '@/lib/ccc/eventClosureReadiness';
/** Advisory operational close-out. Never changes activity state or sends messages. */
export default function ClubEventClosureReview({registrations=[],hasMore=true,paymentReadComplete=false,finance=null,activityStatus=''}){
 const review=reviewEventClosure(registrations,{hasMore,paymentReadComplete,finance,activityStatus});
 return <section className="mt-4 rounded-xl border p-3" aria-label="Event close-out checklist"><h3 className="font-semibold">Event close-out checklist</h3><p className="mt-1 text-xs text-muted-foreground">Read-only checks for this event. Passing internal checks does not verify SumUp settlement, communication permissions or delivery. This panel cannot close an event or send anything.</p>
 <p className="mt-3 text-sm font-semibold">{review.passed} of {review.required} checks satisfied · {review.open.length} outstanding</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{review.checks.map(c=><div key={c.code} className="flex items-start gap-2 rounded-lg border p-2 text-sm"><span aria-hidden="true">{c.passed?'✓':'○'}</span><div><p>{c.label}</p><p className="text-xs text-muted-foreground">{c.passed?'Supported by loaded internal records':'Not yet verified'}</p></div></div>)}</div>
 {!review.roster.complete&&<p role="alert" className="mt-2 text-sm text-amber-700">Registration data is incomplete or duplicated. The event cannot be treated as reconciled.</p>}
 <p className="mt-3 text-xs text-muted-foreground">Internal attendance complete: {review.attendance.closed?'yes':'no'} · Internal reconciliation ready: {review.operationallyReconciled?'yes':'no'} · Production release approved: no.</p></section>;
}
