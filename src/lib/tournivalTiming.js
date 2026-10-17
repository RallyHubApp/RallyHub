/**
 * Pure Tournival operational forecast. Never mutates match durations, draws,
 * participant eligibility or sporting state.
 */
export function forecastTournivalProgress({
 matches = [], courts = 1, minutesPerMatch = 10,
 changeoverMinutes = 3, venueEndAt, now = Date.now(),
 actualStartedAt, paused = false,
} = {}) {
 const maxCourts=Number(courts),duration=Number(minutesPerMatch),change=Number(changeoverMinutes);
 if(!Number.isInteger(maxCourts)||maxCourts<1||!Number.isFinite(duration)||duration<=0||
    !Number.isFinite(change)||change<0)throw Error('Invalid timing assumptions');
 const completed=matches.filter(m=>m.status==='completed');
 const playing=matches.filter(m=>m.status==='playing');
 const waiting=matches.filter(m=>m.status==='waiting');
 const finished=completed.length;
 const total=matches.length;
 const remaining=total-finished;
 const queuedWorkMinutes=waiting.length*(duration+change);
 const playingWorkMinutes=playing.length*duration;
 const residualMinutes=Math.ceil((queuedWorkMinutes+playingWorkMinutes)/maxCourts);
 const atMs=Number(now);
 const forecastAt=new Date(atMs+residualMinutes*60000).toISOString();
 const venueMs=venueEndAt?Date.parse(venueEndAt):NaN;
 const hasDeadline=Number.isFinite(venueMs);
 const overrunMinutes=hasDeadline?Math.max(0,Math.ceil((atMs+residualMinutes*60000-venueMs)/60000)):null;
 const startMs=actualStartedAt?Date.parse(actualStartedAt):NaN;
 const elapsedMinutes=Number.isFinite(startMs)?Math.max(0,Math.round((atMs-startMs)/60000)):null;
 const courtUtilisation=maxCourts?Math.round(playing.length/maxCourts*100):0;
 const trend=overrunMinutes>0?'behind':overrunMinutes===0?'on_track':'unknown';
 return {completed:finished,active:playing.length,waiting:waiting.length,total,remaining,
   paused,elapsedMinutes,estimatedRemainingMinutes:residualMinutes,
   projectedEndAt:forecastAt,venueEndAt:hasDeadline?new Date(venueMs).toISOString():null,
   projectedOverrunMinutes:overrunMinutes,courtUtilisationPercent:courtUtilisation,
   status:trend,recoveries:overrunMinutes>0?[
     'Check whether an additional safe, available court can be opened',
     'Review future changeover or break durations with the organiser',
     'Avoid changes to scoring rules unless explicitly approved',
     'Notify participants of revised timings'
   ]:[]};
}
