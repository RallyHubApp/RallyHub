import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ExternalLink, MapPin, ShieldCheck, Ticket, UsersRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import Seo from '@/components/public/Seo';
import PublicSiteHeader from '@/components/public/PublicSiteHeader';
import PublicSiteFooter from '@/components/public/PublicSiteFooter';
import EventActionBar from '@/components/events/EventActionBar';
import { EVENT_TYPES, eventStatusClass, eventTags, prettyEventDateRange, registrationState } from '@/lib/event-utils';

const infoPreview=value=>{
  const text=String(value||'').replace(/\s+/g,' ').trim();
  return text.length>130?`${text.slice(0,127)}…`:text;
};

function InfoRow({title,summary,children}){
  if(!children)return null;
  return <details className="group rounded-xl border border-[#dbe6e8] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4"><div><p className="text-sm font-black text-[#07184c]">{title}</p>{summary&&<p className="mt-1 text-xs leading-5 text-[#52627d]">{summary}</p>}</div><span className="text-xl font-bold text-[#078e48] transition group-open:rotate-45">+</span></summary><div className="border-t border-[#edf1f2] px-4 py-4 text-sm leading-6 text-[#405270] whitespace-pre-wrap">{children}</div></details>;
}

function Schedule({event}){
  const rows=Array.isArray(event.event_schedule)?event.event_schedule:[];
  if(!rows.length)return null;
  return <section className="rounded-2xl border border-[#dbe6e8] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-[#078e48]"/><h2 className="text-lg font-black">Event schedule</h2></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{rows.map((row,index)=><article key={`${row.date||row.day||'day'}-${index}`} className="rounded-xl border border-[#dbe6e8] bg-[#f8fbfc] p-4"><p className="text-xs font-black uppercase tracking-wide text-[#078e48]">{row.day||row.date||`Day ${index+1}`}</p>{row.time&&<p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#17325f]"><Clock3 className="h-3.5 w-3.5"/>{row.time}</p>}<p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-[#405270]">{row.title||row.details||row.description||''}</p></article>)}</div></section>;
}

export default function PublicEventDetail(){
  const {slug}=useParams();
  const {isAuthenticated,user}=useAuth();
  const {data:event,isLoading,error}=useQuery({queryKey:['public-event-detail',slug],queryFn:async()=>{const res=await base44.functions.invoke('publicEvents',{action:'detail',slug});if(res.data?.error)throw new Error(res.data.error);return res.data?.event||null},enabled:!!slug,staleTime:60000,refetchOnWindowFocus:true});
  const {data:savedRows=[]}=useQuery({queryKey:['event-saved-state',event?.id,user?.id],queryFn:()=>base44.entities.EventSavedItem.filter({user_id:user.id,tournament_id:event.id},'-updated_date',2),enabled:!!isAuthenticated&&!!event?.id&&!!user?.id,staleTime:30000});

  if(isLoading)return <div className="min-h-screen bg-white"><PublicSiteHeader/><main className="mx-auto max-w-[1180px] px-5 py-20 text-center text-sm text-[#52627d]">Loading event…</main><PublicSiteFooter/></div>;
  if(error||!event)return <div className="min-h-screen bg-white"><PublicSiteHeader/><main className="mx-auto max-w-[1180px] px-5 py-20 text-center"><h1 className="text-2xl font-black text-[#07184c]">Event not found</h1><p className="mt-2 text-sm text-[#52627d]">{error?.message||'This event is not currently public.'}</p><Link to="/events" className="mt-5 inline-flex rounded-lg bg-[#078e48] px-4 py-2 text-sm font-bold text-white">Back to Events</Link></main><PublicSiteFooter/></div>;

  const state=registrationState(event);
  const typeLabel=EVENT_TYPES.find(([key])=>key===event.event_category)?.[1]||event.event_category||'Event';
  const tags=eventTags(event,8);
  const fullPoster=event.event_image_url;
  const originalPoster=event.event_image_original_url||event.event_image_url;
  const updated=event.updated_date?new Date(event.updated_date):null;
  const canonical=`https://rallyhub.ie/events/${event.event_slug}`;
  const isFull=state.key==='full';
  const invitationOnly=(event.event_tags||[]).some(tag=>String(tag||'').trim().toLowerCase()==='invitation only');
  const phoneUnlockDate=event.event_contact_phone_hidden_until?new Date(event.event_contact_phone_hidden_until):null;
  const phoneUnlockLabel=phoneUnlockDate&&!Number.isNaN(phoneUnlockDate.getTime())?phoneUnlockDate.toLocaleDateString('en-IE',{day:'numeric',month:'long',year:'numeric'}):'';

  return <>
    <Seo title={`${event.name} | RallyHub Events`} description={event.event_public_summary||event.description||`Event information for ${event.name}.`} path={`/events/${event.event_slug}`} robots="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
    <div className="min-h-screen bg-[#f7fafb] text-[#07184c]"><PublicSiteHeader/><main className="mx-auto max-w-[1380px] px-5 pb-12 pt-5 sm:px-7 lg:px-10 xl:px-12">
      <Link to="/events" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#17325f] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4"/>Back to Events</Link>

      <section className="mt-2 grid gap-5 lg:grid-cols-[38%_62%]">
        <div className="overflow-hidden rounded-2xl border border-[#dbe6e8] bg-white shadow-[0_8px_24px_rgba(8,24,77,.06)]">
          {fullPoster?<div className="relative flex min-h-[260px] max-h-[760px] items-center justify-center overflow-hidden bg-[#eef4f5]"><img src={fullPoster} alt={`${event.name} poster`} className="block max-h-[760px] w-full object-contain" style={{objectPosition:`${Number(event.event_image_position_x??50)}% ${Number(event.event_image_position_y??50)}%`,transform:`scale(${Number(event.event_image_zoom??1)})`,transformOrigin:`${Number(event.event_image_position_x??50)}% ${Number(event.event_image_position_y??50)}%`}}/>{isFull&&<div className="pointer-events-none absolute inset-x-[-12%] top-[44%] -rotate-6 bg-[#b42318]/95 py-3 text-center text-2xl font-black tracking-[.16em] text-white shadow-xl sm:text-3xl">EVENT FULL</div>}</div>:<div className="relative flex min-h-[420px] items-center justify-center bg-[linear-gradient(135deg,#073b57,#078e48)] p-8 text-center text-white"><div><CalendarDays className="mx-auto h-12 w-12"/><p className="mt-4 text-3xl font-black">{event.name}</p></div>{isFull&&<div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[#b42318]/95 py-3 text-center text-2xl font-black tracking-[.16em] text-white">EVENT FULL</div>}</div>}
          {originalPoster&&<a href={originalPoster} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 border-t border-[#dbe6e8] text-sm font-bold text-[#17325f] hover:bg-[#f8fbfc]"><ExternalLink className="h-4 w-4"/>View original poster</a>}
        </div>

        <div className="rounded-2xl border border-[#dbe6e8] bg-white p-5 shadow-[0_8px_24px_rgba(8,24,77,.06)] sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eaf7ef] px-3 py-1 text-[11px] font-black text-[#078e48]">{typeLabel}</span><span className={`rounded-full border px-3 py-1 text-[11px] font-black ${eventStatusClass(state)}`}>{state.label}</span>{event.event_verified_organiser&&<span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-3 py-1 text-[11px] font-black text-[#078e48]"><ShieldCheck className="h-3.5 w-3.5"/>Verified organiser</span>}</div>
          <h1 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-.04em] sm:text-4xl lg:text-5xl">{event.name}</h1>
          {event.host&&<div className="mt-5 flex items-center gap-3 border-b border-[#edf1f2] pb-5">{event.host.logo_url&&<img src={event.host.logo_url} alt="" className="h-11 w-11 rounded-full object-contain"/>}<div><p className="text-[10px] uppercase tracking-wider text-[#7b8799]">Hosted by</p><p className="font-black text-[#17325f]">{event.host.name}</p></div></div>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl bg-[#f7fafb] p-4"><CalendarDays className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Dates</p><p className="mt-1 text-sm font-black">{prettyEventDateRange(event)}</p>{event.event_start_time&&<p className="mt-1 text-xs text-[#52627d]">{event.event_start_time}{event.event_end_time?`–${event.event_end_time}`:''}</p>}</div>
            <div className="rounded-xl bg-[#f7fafb] p-4"><MapPin className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Venue</p><p className="mt-1 text-sm font-black">{event.location||'Venue TBC'}</p><p className="mt-1 text-xs text-[#52627d]">{[event.event_county,event.event_country].filter(Boolean).join(', ')}</p></div>
            <div className="rounded-xl bg-[#f7fafb] p-4"><Ticket className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Entry</p><p className="mt-1 text-sm font-black">{event.event_fee_text||((event.event_fee_amount??null)!==null?`${event.event_currency||'€'}${event.event_fee_amount}`:'See organiser')}</p>{event.event_capacity&&<p className="mt-1 text-xs text-[#52627d]">Capacity {event.event_capacity}</p>}</div>
          </div>

          {event.event_public_summary&&<p className="mt-5 text-sm leading-6 text-[#405270]">{event.event_public_summary}</p>}
          {isFull&&invitationOnly&&<div className="mt-5 rounded-xl border border-[#efb4ae] bg-[#fff2f0] px-4 py-4"><p className="text-sm font-black text-[#8f1b13]">This event is full.</p><p className="mt-1 text-sm leading-6 text-[#6d2c28]">All {event.host?.name||'organiser'} events are invitation only. If you would like to be considered for a future event, use <strong>Request a future invitation</strong> below. Your enquiry will be sent through RallyHub.</p>{!event.event_contact_phone&&phoneUnlockLabel&&<p className="mt-2 text-xs text-[#7b5a57]">The organiser’s mobile number is being kept private until {phoneUnlockLabel}.</p>}</div>}
          {state.detail&&<div className={`mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${['closed'].includes(state.key)?'border-[#d5dae2] bg-[#f3f5f7] text-[#69758a]':['full','cancelled'].includes(state.key)?'border-[#efb4ae] bg-[#fff2f0] text-[#8f1b13]':state.key==='closing_soon'?'border-[#f0cd63] bg-[#fff8df] text-[#8b5a00]':'border-[#bfe3cf] bg-[#eff9f3] text-[#067b3f]'}`}><Clock3 className="mt-0.5 h-4 w-4 shrink-0"/><span>{state.detail}</span></div>}
          {!!tags.length&&<div className="mt-5 flex flex-wrap gap-2">{tags.map(tag=><span key={tag} className="rounded-full bg-[#f1f6f7] px-2.5 py-1 text-[10px] font-semibold text-[#38506f]">{tag}</span>)}</div>}
          <div className="mt-6"><EventActionBar event={event} initiallySaved={savedRows.length>0}/></div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#dbe6e8] bg-white p-5 sm:p-6"><h2 className="text-lg font-black">At a glance</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-[#f7fafb] p-4"><UsersRound className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Playing levels</p><p className="mt-1 text-sm font-black">{(event.event_levels||[]).join(' · ')||'Open / see event info'}</p></div>
        <div className="rounded-xl bg-[#f7fafb] p-4"><UsersRound className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Age groups</p><p className="mt-1 text-sm font-black">{(event.event_age_groups||[]).join(' · ')||'All / see event info'}</p></div>
        <div className="rounded-xl bg-[#f7fafb] p-4"><CheckCircle2 className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Disciplines</p><p className="mt-1 text-sm font-black">{(event.event_disciplines||[]).join(' · ')||'See event info'}</p></div>
        <div className="rounded-xl bg-[#f7fafb] p-4"><MapPin className="h-5 w-5 text-[#078e48]"/><p className="mt-2 text-xs text-[#52627d]">Setting</p><p className="mt-1 text-sm font-black">{event.event_indoor_outdoor?event.event_indoor_outdoor.replace(/^./,c=>c.toUpperCase()):'See venue information'}</p></div>
      </div></section>

      <div className="mt-5"><Schedule event={event}/></div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[58%_42%]">
        <div className="space-y-3">
          <InfoRow title="Eligibility & levels" summary={infoPreview(event.event_eligibility)}>{event.event_eligibility}</InfoRow>
          <InfoRow title="Player information" summary={infoPreview(event.event_player_info||event.description)}>{event.event_player_info||event.description}</InfoRow>
          <InfoRow title="Fees & cancellation" summary={infoPreview(event.event_fees_cancellation)}>{event.event_fees_cancellation}</InfoRow>
          <InfoRow title="Contact organiser" summary={isFull&&invitationOnly?'Future invitation enquiries are sent through RallyHub.':([event.event_contact,event.event_contact_phone].filter(Boolean).join(' · ')||(event.host?.name||'Event organiser'))}>{isFull&&invitationOnly?<div><p>This event is full. Use <strong>Request a future invitation</strong> above so RallyHub can pass your email to the organiser and record that the enquiry came through RallyHub.</p>{event.event_contact_phone&&<p className="mt-2"><a href={`tel:${event.event_contact_phone}`} className="font-bold text-[#078e48]">Call {event.event_contact_phone}</a></p>}</div>:<div>{event.event_contact&&<p>{event.event_contact}</p>}{event.event_contact_phone&&<p className="mt-2"><a href={`tel:${event.event_contact_phone}`} className="font-bold text-[#078e48]">Call {event.event_contact_phone}</a></p>}</div>}</InfoRow>
        </div>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[#dbe6e8] bg-white"><div className="p-5"><h2 className="text-lg font-black">Venue</h2><p className="mt-2 font-bold">{event.location||'Venue TBC'}</p><p className="mt-1 text-sm text-[#52627d]">{[event.event_county,event.event_country].filter(Boolean).join(', ')}</p>{event.event_map_url&&<a href={event.event_map_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cad7dd] px-3 text-sm font-bold"><MapPin className="h-4 w-4"/>Get directions</a>}</div><div className="border-t border-[#edf1f2] bg-[#f7fafb] p-5"><div className="rounded-2xl border border-[#dbe6e8] bg-white p-5 text-sm leading-6 text-[#405270]"><p className="font-bold text-[#07184c]">Directions open in Google Maps.</p><p className="mt-1">This avoids showing a broken or misleading embedded map if map tiles fail to load.</p></div></div></section>
          {event.host&&<section className="rounded-2xl border border-[#dbe6e8] bg-white p-5"><div className="flex items-center gap-3">{event.host.logo_url&&<img src={event.host.logo_url} alt="" className="h-12 w-12 rounded-full object-contain"/>}<div><p className="text-[10px] uppercase tracking-wider text-[#7b8799]">Organiser</p><h2 className="font-black">{event.host.name}</h2></div></div>{event.event_source_url&&<a href={event.event_source_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#078e48]"><ExternalLink className="h-4 w-4"/>Official event information</a>}</section>}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#dbe6e8] pt-5 text-[11px] text-[#758197]"><span>{updated&&!Number.isNaN(updated.getTime())?`Last updated ${updated.toLocaleDateString('en-IE',{day:'numeric',month:'short',year:'numeric'})}`:'Event information supplied by the organiser.'}</span><a href={`mailto:rallyhubapp@gmail.com?subject=${encodeURIComponent(`Event information query: ${event.name}`)}&body=${encodeURIComponent(`Event: ${canonical}\n\nPlease describe the information that needs attention:`)}`} className="font-bold text-[#17325f]">Report incorrect event information</a></div>
    </main><PublicSiteFooter/></div>
  </>;
}
