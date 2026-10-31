import React from 'react';
import { Link } from 'react-router-dom';
import { scheduleConflicts, sessionCalendar } from '@/lib/ccc/sessionCalendar';

/** Read-only schedule panel; receives already scoped session data from the dashboard. */
export default function ClubSchedulePanel({ tenantId, clubId, sessions = [], fromDate, toDate, loading = false, error = false }) {
 const calendar = sessionCalendar({tenantId,clubId,sessions,fromDate,toDate});
 const conflicts = scheduleConflicts(calendar);
 const conflictIds = new Set(conflicts.flatMap(c=>[c.firstId,c.secondId]));
 return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Upcoming club sessions">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
   <div><h2 className="text-lg font-bold">Upcoming sessions</h2><p className="text-sm text-muted-foreground">Read-only schedule · Next 14 days</p></div>
   <Link to="/app/guest-bookings" className="text-sm font-medium text-primary hover:underline">Manage guest bookings</Link>
  </div>
  {loading ? <p className="text-sm text-muted-foreground">Loading sessions…</p> :
   error ? <p role="alert" className="text-sm text-destructive">Session schedule unavailable. Existing bookings are unaffected.</p> :
   !tenantId || !clubId ? <p className="text-sm text-muted-foreground">Select an active club to view its schedule.</p> :
   calendar.length===0 ? <p className="text-sm text-muted-foreground">No sessions listed for this period.</p> :
   <div className="space-y-2">{calendar.slice(0,12).map(s=><div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
    <div><p className="text-sm font-medium">{s.label||s.venue||'Club session'}</p><p className="text-xs text-muted-foreground">{s.date} · {s.startTime}{s.endTime?'–'+s.endTime:''} · {s.venue||'Venue not specified'}</p></div>
    <div className="flex items-center gap-2 text-xs">{conflictIds.has(s.id)&&<span className="font-semibold text-destructive">Possible venue overlap</span>}<span className="rounded-full border px-2 py-1">{s.status}</span></div>
   </div>)}</div>}
  {calendar.length>12&&<p className="mt-2 text-xs text-muted-foreground">{calendar.length-12} more sessions in this period.</p>}
  {conflicts.length>0&&<p className="mt-3 text-xs text-muted-foreground">Overlaps are advisory: shared venues may have multiple courts or spaces.</p>}
 </section>;
}
