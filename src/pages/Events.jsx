import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, Clock3, List, Map as MapIcon, MapPin, Search, SlidersHorizontal, Star, UserRound } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import Seo from '@/components/public/Seo';
import PublicSiteHeader from '@/components/public/PublicSiteHeader';
import PublicSiteFooter from '@/components/public/PublicSiteFooter';
import EventCard from '@/components/events/EventCard';
import { EVENT_TYPES, eventPath, eventStatusClass, eventTags, prettyEventDateRange, registrationActionLabel, registrationState } from '@/lib/event-utils';

L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusFilters=[
  ['all','All upcoming'],['open','Open for booking'],['invite_only','Invitation only'],['opening_soon','Opening soon'],['closing_soon','Closing soon'],['closed','Registration closed']
];
const today=()=>new Date().toISOString().slice(0,10);
const monthKey=value=>value?String(value).slice(0,7):'';
const uniqueSorted=values=>[...new Set(values.filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b));
const normal=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const validMapPoint=(latValue,lngValue)=>{
  if(latValue===null||latValue===undefined||latValue===''||lngValue===null||lngValue===undefined||lngValue==='')return false;
  const lat=Number(latValue),lng=Number(lngValue);
  return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180;
};

function FeaturedEvent({event,onRegister}){
  if(!event)return null;
  const state=registrationState(event);
  const image=event.event_card_image_url||event.event_image_url;
  const x=Number(event.event_card_position_x??event.event_image_position_x??50);
  const y=Number(event.event_card_position_y??event.event_image_position_y??50);
  const zoom=Number(event.event_card_zoom??event.event_image_zoom??1);
  return <section className="mt-8 overflow-hidden rounded-[18px] border border-[#dbe6e8] bg-white shadow-[0_10px_30px_rgba(8,24,77,.07)]">
    <div className="grid lg:grid-cols-[44%_56%]">
      <Link to={eventPath(event)} className="relative min-h-[230px] overflow-hidden bg-[#eaf4ef] sm:min-h-[300px] lg:min-h-[330px]">
        {image?<img src={image} alt={`${event.name} artwork`} className="absolute inset-0 h-full w-full object-cover" style={{objectPosition:`${x}% ${y}%`,transform:`scale(${zoom})`,transformOrigin:`${x}% ${y}%`}}/>:<div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#073b57,#078e48)] p-8 text-center text-white"><div><CalendarDays className="mx-auto h-12 w-12"/><p className="mt-4 text-3xl font-black">{event.name}</p></div></div>}
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#078e48] px-3 py-1.5 text-[11px] font-black text-white shadow"><Star className="h-3.5 w-3.5 fill-current"/>Featured Event</span>
      </Link>
      <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${eventStatusClass(state)}`}>{state.label}</span>{event.event_verified_organiser&&<span className="rounded-full bg-[#eef8f2] px-2.5 py-1 text-[10px] font-black text-[#078e48]">VERIFIED ORGANISER</span>}</div>
        <h2 className="mt-4 text-2xl font-black tracking-[-.03em] text-[#07184c] sm:text-3xl">{event.name}</h2>
        <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-[#17325f]"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#078e48]"/>{prettyEventDateRange(event)}</p>
        {event.location&&<p className="mt-2 flex items-start gap-2 text-sm text-[#52627d]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#078e48]"/>{event.location}{event.event_county?`, ${event.event_county}`:''}</p>}
        {state.detail&&<p className={`mt-2 flex items-start gap-2 text-sm font-bold ${state.key==='closed'?'text-[#69758a]':state.key==='closing_soon'?'text-[#9a6400]':'text-[#078e48]'}`}><Clock3 className="mt-0.5 h-4 w-4 shrink-0"/>{state.detail}</p>}
        {event.event_public_summary&&<p className="mt-4 line-clamp-3 text-sm leading-6 text-[#52627d]">{event.event_public_summary}</p>}
        {event.host&&<div className="mt-4 flex items-center gap-2 text-sm"><span className="text-[#52627d]">Hosted by</span>{event.host.logo_url&&<img src={event.host.logo_url} alt="" className="h-7 w-7 rounded-full object-contain"/>}<span className="font-bold text-[#07184c]">{event.host.name}</span></div>}
        <div className="mt-4 flex flex-wrap gap-2">{eventTags(event,4).map(tag=><span key={tag} className="rounded-full bg-[#f1f6f7] px-2.5 py-1 text-[10px] font-semibold text-[#38506f]">{tag}</span>)}</div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2"><Link to={eventPath(event)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#078e48] px-4 text-sm font-bold text-white hover:bg-[#067b3f]">View event</Link>{state.actionable&&(event.event_registration_url||event.event_registration_mode==='contact')?<button type="button" onClick={()=>onRegister(event)} className="min-h-11 rounded-lg border border-[#078e48] bg-white px-4 text-sm font-bold text-[#078e48] hover:bg-[#f1fbf5]">{registrationActionLabel(event,state)}</button>:<Link to={eventPath(event)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cad7dd] px-4 text-sm font-bold text-[#17325f]">{state.key==='opening_soon'?'Remind me':'Event details'}</Link>}</div>
      </div>
    </div>
  </section>;
}

function EventMap({events}){
  const points=events.filter(e=>validMapPoint(e.event_latitude,e.event_longitude));
  if(!points.length)return <div className="rounded-2xl border border-[#dbe6e8] bg-white px-6 py-16 text-center"><MapPin className="mx-auto h-9 w-9 text-[#078e48]"/><h2 className="mt-3 text-lg font-black text-[#07184c]">Map locations are being added</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52627d]">Events still appear in the complete list. When an organiser provides a mapped venue, it will appear here automatically.</p></div>;
  const center=[Number(points[0].event_latitude),Number(points[0].event_longitude)];
  return <div className="overflow-hidden rounded-2xl border border-[#dbe6e8] bg-white"><MapContainer center={center} zoom={7} scrollWheelZoom className="h-[620px] w-full"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{points.map(event=><Marker key={event.id} position={[Number(event.event_latitude),Number(event.event_longitude)]}><Popup><div className="min-w-[210px]"><strong>{event.name}</strong><br/>{prettyEventDateRange(event)}<br/>{event.location||''}<br/><a href={eventPath(event)} className="font-bold text-[#078e48]">View event</a></div></Popup></Marker>)}</MapContainer></div>;
}

export default function Events(){
  const navigate=useNavigate();
  const {isAuthenticated}=useAuth();
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('all');
  const [type,setType]=useState('all');
  const [month,setMonth]=useState('all');
  const [county,setCounty]=useState('all');
  const [country,setCountry]=useState('all');
  const [host,setHost]=useState('all');
  const [level,setLevel]=useState('all');
  const [age,setAge]=useState('all');
  const [discipline,setDiscipline]=useState('all');
  const [environment,setEnvironment]=useState('all');
  const [view,setView]=useState('list');
  const [sort,setSort]=useState('date');
  const {data,isLoading,error,refetch,isFetching}=useQuery({queryKey:['public-events-v2'],queryFn:async()=>{const res=await base44.functions.invoke('publicEvents',{action:'list'});if(res.data?.error)throw new Error(res.data.error);return res.data?.events||[]},staleTime:60000,refetchOnWindowFocus:true,retry:1});
  const events=data||[];
  const upcoming=useMemo(()=>events.filter(e=>(e.end_date||e.start_date||'9999-12-31')>=today()),[events]);
  const options=useMemo(()=>({
    months:uniqueSorted(upcoming.map(e=>monthKey(e.start_date))),
    counties:uniqueSorted(upcoming.map(e=>e.event_county)),
    countries:uniqueSorted(upcoming.map(e=>e.event_country)),
    hosts:uniqueSorted(upcoming.map(e=>e.host?.name)),
    levels:uniqueSorted(upcoming.flatMap(e=>e.event_levels||[])),
    ages:uniqueSorted(upcoming.flatMap(e=>e.event_age_groups||[])),
    disciplines:uniqueSorted(upcoming.flatMap(e=>e.event_disciplines||[])),
  }),[upcoming]);
  const filtered=useMemo(()=>{
    const q=normal(query);
    const rows=upcoming.filter(e=>{
      const state=registrationState(e);
      if(status!=='all'&&state.key!==status)return false;
      if(type!=='all'&&e.event_category!==type)return false;
      if(month!=='all'&&monthKey(e.start_date)!==month)return false;
      if(county!=='all'&&e.event_county!==county)return false;
      if(country!=='all'&&e.event_country!==country)return false;
      if(host!=='all'&&e.host?.name!==host)return false;
      if(level!=='all'&&!(e.event_levels||[]).includes(level))return false;
      if(age!=='all'&&!(e.event_age_groups||[]).includes(age))return false;
      if(discipline!=='all'&&!(e.event_disciplines||[]).includes(discipline))return false;
      if(environment!=='all'&&e.event_indoor_outdoor!==environment)return false;
      if(q){const hay=normal([e.name,e.location,e.event_county,e.event_country,e.host?.name,e.event_public_summary,...(e.event_levels||[]),...(e.event_age_groups||[]),...(e.event_disciplines||[])].join(' '));if(!hay.includes(q))return false}
      return true;
    });
    return rows.sort((a,b)=>{
      if(sort==='closing'){const aa=a.event_registration_close_at||'9999',bb=b.event_registration_close_at||'9999';return aa.localeCompare(bb)}
      if(sort==='newest')return String(b.event_published_at||b.updated_date||'').localeCompare(String(a.event_published_at||a.updated_date||''));
      return String(a.start_date||'9999').localeCompare(String(b.start_date||'9999'));
    });
  },[upcoming,query,status,type,month,county,country,host,level,age,discipline,environment,sort]);
  const featured=filtered.find(e=>e.event_featured_public)||null;
  const gridEvents=featured?filtered.filter(e=>e.id!==featured.id):filtered;
  const openRegistration=event=>{if(event.event_registration_mode==='contact'&&event.event_contact){const state=registrationState(event);const url=`${window.location.origin}${eventPath(event)}`;const subject=state.key==='invite_only'?`Invitation request: ${event.name}`:`Event enquiry: ${event.name}`;const body=state.key==='invite_only'?`Hi,\n\nI would like to be considered for an invitation to ${event.name}.\n\nRallyHub event: ${url}\n\nThank you.`:`Hi,\n\nI have a question about ${event.name}.\n\nRallyHub event: ${url}\n\nThank you.`;window.location.href=`mailto:${event.event_contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;return}if(event.event_registration_url)window.open(event.event_registration_url,'_blank','noopener,noreferrer');else navigate(eventPath(event))};
  const showResults=()=>document.getElementById('events-results')?.scrollIntoView({behavior:'smooth',block:'start'});

  const selectClass="h-11 w-full rounded-lg border border-[#cfdcdf] bg-white px-3 text-[12px] font-semibold text-[#17325f] outline-none focus:border-[#078e48]";
  return <>
    <Seo title="Pickleball Events, Tournaments & Coaching | RallyHub" description="Find upcoming pickleball tournaments, interclubs, leagues, social events, coaching and camps across Ireland and beyond." path="/events" robots="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
    <div className="min-h-screen bg-white text-[#07184c]"><PublicSiteHeader/><main>
      <section className="relative overflow-hidden bg-[#f4fbfc]">
        <div className="mx-auto grid max-w-[1380px] lg:grid-cols-[53%_47%]">
          <div className="relative z-10 flex min-h-[330px] items-center px-5 py-9 sm:px-7 lg:min-h-[360px] lg:px-10 xl:px-12">
            <div className="w-full max-w-[700px]"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#078e48]">RallyHub Events</p><h1 className="mt-2 text-[2.55rem] font-black leading-[.98] tracking-[-.045em] sm:text-[3.6rem]">Find your next <span className="text-[#078e48]">event</span></h1><p className="mt-4 max-w-[620px] text-[15px] leading-6 text-[#263d6b]">Tournaments, interclubs, leagues, coaching and social events — built around the information players actually need.</p>
              <div className="mt-6 flex min-h-12 items-center rounded-xl border border-[#cfdcdf] bg-white p-1.5 shadow-[0_8px_24px_rgba(8,24,77,.05)]"><Search className="ml-3 h-5 w-5 shrink-0 text-[#52627d]"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')showResults()}} placeholder="Search events by name, location, host or keyword…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"/><button type="button" className="hidden h-10 rounded-lg bg-[#078e48] px-6 text-sm font-bold text-white sm:block" onClick={showResults}>Search</button></div>
            </div>
          </div>
          <div className="relative hidden min-h-[360px] overflow-hidden lg:block"><img src="/assets/about/card-competitions.webp" alt="Pickleball competition" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-[linear-gradient(90deg,#f4fbfc_0%,rgba(244,251,252,.58)_18%,rgba(244,251,252,0)_45%)]"/></div>
        </div>
      </section>

      <section className="border-y border-[#e7edef] bg-white"><div className="mx-auto max-w-[1380px] px-5 py-5 sm:px-7 lg:px-10 xl:px-12">
        <div className="flex gap-2 overflow-x-auto pb-1">{statusFilters.map(([key,label])=><button key={key} type="button" onClick={()=>setStatus(key)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-bold ${status===key?'border-[#078e48] bg-[#078e48] text-white':'border-[#cfdbdf] bg-white text-[#17325f]'}`}>{label}</button>)}</div>
        <details className="mt-4 lg:hidden"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#cfdbdf] px-4 py-3 text-sm font-bold"><SlidersHorizontal className="h-4 w-4"/>More filters<ChevronDown className="ml-auto h-4 w-4"/></summary><div className="mt-3 grid grid-cols-2 gap-2">
          <select className={selectClass} value={type} onChange={e=>setType(e.target.value)}>{EVENT_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
          <select className={selectClass} value={month} onChange={e=>setMonth(e.target.value)}><option value="all">Any month</option>{options.months.map(v=><option key={v} value={v}>{new Date(`${v}-01T12:00:00`).toLocaleDateString('en-IE',{month:'long',year:'numeric'})}</option>)}</select>
          <select className={selectClass} value={county} onChange={e=>setCounty(e.target.value)}><option value="all">Any county / region</option>{options.counties.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={country} onChange={e=>setCountry(e.target.value)}><option value="all">Any country</option>{options.countries.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={host} onChange={e=>setHost(e.target.value)}><option value="all">Any host</option>{options.hosts.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={level} onChange={e=>setLevel(e.target.value)}><option value="all">Any level</option>{options.levels.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={age} onChange={e=>setAge(e.target.value)}><option value="all">Any age group</option>{options.ages.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={discipline} onChange={e=>setDiscipline(e.target.value)}><option value="all">Any discipline</option>{options.disciplines.map(v=><option key={v}>{v}</option>)}</select>
          <select className={selectClass} value={environment} onChange={e=>setEnvironment(e.target.value)}><option value="all">Indoor / outdoor</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="mixed">Mixed</option></select>
        </div></details>
        <div className="mt-4 hidden grid-cols-3 gap-2 lg:grid xl:grid-cols-9">
          <label className="text-[10px] font-bold text-[#52627d]">Event type<select className={selectClass} value={type} onChange={e=>setType(e.target.value)}>{EVENT_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Month<select className={selectClass} value={month} onChange={e=>setMonth(e.target.value)}><option value="all">All</option>{options.months.map(v=><option key={v} value={v}>{new Date(`${v}-01T12:00:00`).toLocaleDateString('en-IE',{month:'short',year:'numeric'})}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">County / region<select className={selectClass} value={county} onChange={e=>setCounty(e.target.value)}><option value="all">All</option>{options.counties.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Country<select className={selectClass} value={country} onChange={e=>setCountry(e.target.value)}><option value="all">All</option>{options.countries.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Host<select className={selectClass} value={host} onChange={e=>setHost(e.target.value)}><option value="all">All</option>{options.hosts.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Playing level<select className={selectClass} value={level} onChange={e=>setLevel(e.target.value)}><option value="all">All</option>{options.levels.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Age group<select className={selectClass} value={age} onChange={e=>setAge(e.target.value)}><option value="all">All</option>{options.ages.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Discipline<select className={selectClass} value={discipline} onChange={e=>setDiscipline(e.target.value)}><option value="all">All</option>{options.disciplines.map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#52627d]">Indoor / Outdoor<select className={selectClass} value={environment} onChange={e=>setEnvironment(e.target.value)}><option value="all">All</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="mixed">Mixed</option></select></label>
        </div>
      </div></section>

      <section id="events-results" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-12 sm:px-7 lg:px-10 xl:px-12">
        {featured&&<FeaturedEvent event={featured} onRegister={openRegistration}/>} 
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black tracking-[-.03em]">All Events <span className="text-base font-semibold text-[#52627d]">({filtered.length})</span></h2><p className="mt-1 text-sm text-[#52627d]">One event record, kept up to date by the organiser and shared wherever players need it.</p></div><div className="flex flex-wrap gap-2">
          {isAuthenticated&&<Link to="/events/my" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#cad7dd] px-3 text-xs font-bold"><UserRound className="h-4 w-4"/>My Events</Link>}
          <select className="h-10 rounded-lg border border-[#cad7dd] bg-white px-3 text-xs font-bold" value={sort} onChange={e=>setSort(e.target.value)}><option value="date">Date (soonest first)</option><option value="closing">Registration closing soon</option><option value="newest">Recently added</option></select>
          <div className="grid grid-cols-2 rounded-lg border border-[#cad7dd] p-1"><button type="button" onClick={()=>setView('list')} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold ${view==='list'?'bg-[#078e48] text-white':''}`}><List className="h-4 w-4"/>List</button><button type="button" onClick={()=>setView('map')} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold ${view==='map'?'bg-[#078e48] text-white':''}`}><MapIcon className="h-4 w-4"/>Map</button></div>
        </div></div>
        <div className="mt-6">{isLoading?<div className="rounded-2xl border border-[#dbe6e8] bg-white py-20 text-center text-sm text-[#52627d]">Loading events…</div>:error?<div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-16 text-center text-sm text-red-700"><p>{error.message||'Could not load events.'}</p><button type="button" disabled={isFetching} onClick={()=>refetch()} className="mt-4 min-h-10 rounded-lg border border-red-300 bg-white px-4 font-bold text-red-700 disabled:opacity-60">{isFetching?'Retrying…':'Try again'}</button></div>:view==='map'?<EventMap events={filtered}/>:gridEvents.length?<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{gridEvents.map(event=><EventCard key={event.id} event={event} onRegister={openRegistration}/>)}</div>:<div className="rounded-2xl border border-[#dbe6e8] bg-white py-16 text-center"><Search className="mx-auto h-8 w-8 text-[#078e48]"/><p className="mt-3 font-black">No events match those filters</p><button type="button" className="mt-3 text-sm font-bold text-[#078e48]" onClick={()=>{setQuery('');setStatus('all');setType('all');setMonth('all');setCounty('all');setCountry('all');setHost('all');setLevel('all');setAge('all');setDiscipline('all');setEnvironment('all')}}>Clear filters</button></div>}</div>
      </section>
    </main><PublicSiteFooter/></div>
  </>;
}
