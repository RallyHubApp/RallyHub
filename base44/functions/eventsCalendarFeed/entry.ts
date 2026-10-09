import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
const escape=(v:any)=>String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const local=(date:any,time:any)=>`${String(date||'').replace(/-/g,'')}T${String(time||'12:00').replace(':','').padEnd(6,'0')}`;
Deno.serve(async(req)=>{
 try{
  const b=createClientFromRequest(req),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const rows=await b.asServiceRole.entities.Tournament.filter({event_public_visible:true,event_publish_status:'published'},'start_date',500);
  const events=rows.filter((e:any)=>e.status!=='Archived'&&String(e.end_date||e.start_date||'')>=today);
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RallyHub//Public Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:RallyHub Events','X-WR-TIMEZONE:Europe/Dublin'];
  for(const e of events){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(e.start_date||'')))continue;
   lines.push('BEGIN:VEVENT',`UID:${escape(e.id)}@rallyhub.ie`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z')}`,
    `DTSTART;TZID=Europe/Dublin:${local(e.start_date,e.event_start_time)}`,`DTEND;TZID=Europe/Dublin:${local(e.end_date||e.start_date,e.event_end_time||'17:00')}`,
    `SUMMARY:${escape(e.name)}`,`LOCATION:${escape(e.location)}`,`DESCRIPTION:${escape(e.event_public_summary||'')}\\nhttps://rallyhub.ie/events/${escape(e.event_slug)}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.join('\r\n')+'\r\n',{headers:{'Content-Type':'text/calendar; charset=utf-8','Cache-Control':'public, max-age=900','Content-Disposition':'inline; filename="rallyhub-events.ics"','Access-Control-Allow-Origin':'*'}});
 }catch(e){console.error('calendar feed',e);return Response.json({error:'Calendar feed unavailable'},{status:503});}
});
