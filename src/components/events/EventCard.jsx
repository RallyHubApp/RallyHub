import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { eventPath, eventStatusClass, eventTags, prettyEventDateRange, registrationState } from '@/lib/event-utils';

export default function EventCard({ event, onRegister }) {
  const state = registrationState(event);
  const tags = eventTags(event,3);
  const image = event.event_card_image_url || event.event_image_url;
  const x = Number(event.event_card_position_x ?? event.event_image_position_x ?? 50);
  const y = Number(event.event_card_position_y ?? event.event_image_position_y ?? 50);
  const zoom = Number(event.event_card_zoom ?? event.event_image_zoom ?? 1);
  const canRegister = state.actionable && event.event_registration_mode !== 'none' && (event.event_registration_url || event.event_registration_mode === 'contact' || event.event_registration_mode === 'rallyhub');
  const actionLabel = state.key === 'invite_only' ? 'Request invitation' : 'Register';

  return (
    <article className="overflow-hidden rounded-[16px] border border-[#dbe6e8] bg-white shadow-[0_8px_24px_rgba(8,24,77,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(8,24,77,.10)]">
      <Link to={eventPath(event)} className="relative block aspect-[16/7] overflow-hidden bg-[#eef5f2]">
        {image ? (
          <img src={image} alt={`${event.name} event artwork`} className="h-full w-full object-cover" style={{objectPosition:`${x}% ${y}%`,transform:`scale(${zoom})`,transformOrigin:`${x}% ${y}%`}} />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#073b57_0%,#078e48_100%)] px-6 text-center text-white">
            <div><CalendarDays className="mx-auto h-8 w-8"/><p className="mt-3 text-xl font-black leading-tight">{event.name}</p></div>
          </div>
        )}
        {state.key==='full'&&<div className="pointer-events-none absolute inset-x-[-10%] top-[45%] -rotate-5 bg-[#b42318]/95 py-2 text-center text-sm font-black tracking-[.16em] text-white shadow-lg">EVENT FULL</div>}
        <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${eventStatusClass(state)}`}>{state.label}</span>
        {event.event_featured_public && <span className="absolute right-3 top-3 rounded-full bg-[#07184c] px-2.5 py-1 text-[10px] font-black text-white">Featured</span>}
      </Link>

      <div className="p-4">
        <Link to={eventPath(event)}><h2 className="line-clamp-2 text-[17px] font-black leading-tight text-[#07184c] hover:text-[#078e48]">{event.name}</h2></Link>
        <div className="mt-3 space-y-1.5 text-[12px] text-[#52627d]">
          <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#078e48]"/><span>{prettyEventDateRange(event)}{event.event_start_time ? ` · ${event.event_start_time}` : ''}</span></p>
          {event.location && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#078e48]"/><span className="line-clamp-2">{event.location}{event.event_county ? `, ${event.event_county}` : ''}</span></p>}
          {state.detail && <p className={`flex items-start gap-2 font-bold ${state.key==='closed'?'text-[#69758a]':['full','cancelled'].includes(state.key)?'text-[#a1281f]':state.key==='closing_soon'?'text-[#9a6400]':'text-[#078e48]'}`}><Clock3 className="mt-0.5 h-4 w-4 shrink-0"/><span>{state.detail}</span></p>}
        </div>

        {event.host && <div className="mt-3 flex items-center gap-2 border-t border-[#edf1f2] pt-3 text-[11px] text-[#52627d]"><span>Hosted by</span>{event.host.logo_url && <img src={event.host.logo_url} alt="" className="h-6 w-6 rounded-full object-contain"/>}<span className="font-bold text-[#07184c]">{event.host.name}</span>{event.event_verified_organiser && <span className="rounded-full bg-[#e9f7ef] px-1.5 py-0.5 text-[9px] font-black text-[#078e48]">VERIFIED</span>}</div>}

        {!!tags.length && <div className="mt-3 flex flex-wrap gap-1.5">{tags.map(tag=><span key={tag} className="rounded-full bg-[#f1f6f7] px-2 py-1 text-[10px] font-semibold text-[#38506f]">{tag}</span>)}</div>}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={eventPath(event)} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#078e48] px-3 text-center text-[12px] font-bold text-white hover:bg-[#067b3f]">View event</Link>
          {canRegister ? (
            <button type="button" onClick={()=>onRegister?.(event)} className="min-h-10 rounded-lg border border-[#078e48] bg-white px-3 text-[12px] font-bold text-[#078e48] hover:bg-[#f1fbf5]">{actionLabel}</button>
          ) : (
            <Link to={eventPath(event)} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cad7dd] bg-white px-3 text-center text-[12px] font-bold text-[#17325f]">{state.key==='opening_soon'?'Remind me':'Details'}</Link>
          )}
        </div>
      </div>
    </article>
  );
}
