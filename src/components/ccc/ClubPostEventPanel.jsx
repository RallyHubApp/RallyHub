import React from 'react';
import { Link } from 'react-router-dom';
import { attendanceRoster, attendanceSummary } from '@/lib/ccc/attendanceProjection';
import { postEventQueue, postEventSummary } from '@/lib/ccc/postEventQueue';

/** Read-only post-session reconciliation; sending stays in existing admin workflow. */
export default function ClubPostEventPanel({tenantId,clubId,sessions=[],bookings=[],attendance=[],attempts=[],fromDate,toDate,loading=false,error=false}){
 const recent=(Array.isArray(sessions)?sessions:[]).filter(s=>s?.tenant_id===tenantId&&s?.club_id===clubId&&s?.id&&s.session_date>=fromDate&&s.session_date<toDate&&!s.archived_at).sort((a,b)=>b.session_date.localeCompare(a.session_date)||String(b.start_time||'').localeCompare(String(a.start_time||''))).slice(0,8);
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Post-event attendance and follow-up">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">After the session</h2><p className="text-sm text-muted-foreground">Attendance and follow-up readiness · Previous 14 days</p></div><Link to="/app/guest-bookings" className="text-sm font-medium text-primary hover:underline">Manage attendance and follow-ups</Link></div>
  {loading?<p className="text-sm text-muted-foreground">Loading session attendance…</p>:error?<p role="alert" className="text-sm text-destructive">Attendance reconciliation unavailable. No follow-ups have been sent.</p>:!tenantId||!clubId?<p className="text-sm text-muted-foreground">Select an active club to view follow-ups.</p>:recent.length===0?<p className="text-sm text-muted-foreground">No recent sessions to reconcile.</p>:
  <div className="space-y-2">{recent.map(session=>{
   const roster=attendanceRoster({tenantId,clubId,sessionLinkId:session.id,bookings,attendance});
   const counts=attendanceSummary(roster);
   const queue=postEventQueue({tenantId,clubId,sessionLinkId:session.id,roster,attempts});
   const follow=postEventSummary(queue);
   return <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
    <div><p className="text-sm font-medium">{session.session_label||session.venue_name||'Club session'}</p><p className="text-xs text-muted-foreground">{session.session_date} · {session.start_time||''} · {session.venue_name||'Venue not specified'}</p></div>
    <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border px-2 py-1">{counts.attended} attended</span><span className="rounded-full border px-2 py-1">{counts.noShow} no-shows</span><span className="rounded-full border px-2 py-1">{counts.unconfirmed} unconfirmed</span><span className="rounded-full border px-2 py-1">{follow.followUpReady} follow-ups ready</span></div>
   </div>;
  })}</div>}
  <p className="mt-3 text-xs text-muted-foreground">Only recorded attendees qualify for the follow-up queue. Counts are limited to recently fetched records; review the full session roster before sending.</p>
 </section>;
}
