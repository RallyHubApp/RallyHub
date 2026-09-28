import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PublicSiteHeader from '@/components/public/PublicSiteHeader';
import PublicSiteFooter from '@/components/public/PublicSiteFooter';
import EventCard from '@/components/events/EventCard';
import Seo from '@/components/public/Seo';

export default function MyEvents(){
  const {isAuthenticated,isLoadingAuth}=useAuth();
  const {data:savedItems=[],isLoading}=useQuery({
    queryKey:['my-public-events'],
    queryFn:async()=>{const res=await base44.functions.invoke('eventEngagement',{action:'my'});if(res.data?.error)throw new Error(res.data.error);return res.data?.items||[]},
    enabled:isAuthenticated,
    staleTime:30000,
  });
  const {data:publicEvents=[]}=useQuery({
    queryKey:['public-events-v2'],
    queryFn:async()=>{const res=await base44.functions.invoke('publicEvents',{action:'list'});if(res.data?.error)throw new Error(res.data.error);return res.data?.events||[]},
    enabled:isAuthenticated,
    staleTime:60000,
  });
  const events=useMemo(()=>{const byId=new Map(publicEvents.map(event=>[String(event.id),event]));return savedItems.map(item=>byId.get(String(item.saved?.tournament_id||item.event?.id))||item.event).filter(Boolean)},[savedItems,publicEvents]);
  const register=event=>{if(event.event_registration_url)window.open(event.event_registration_url,'_blank','noopener,noreferrer')};

  return <><Seo title="My Events | RallyHub" description="Keep track of the RallyHub events you save." path="/events/my" robots="noindex,follow"/><div className="min-h-screen bg-[#f7fafb] text-[#07184c]"><PublicSiteHeader/><main className="mx-auto max-w-[1380px] px-5 py-10 sm:px-7 lg:px-10 xl:px-12">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#078e48]">RallyHub Events</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em] sm:text-4xl">My Events</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#52627d]">Keep the events you are interested in together in one place.</p></div><Link to="/events" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cad7dd] bg-white px-4 text-sm font-bold">Browse all events</Link></div>
    {isLoadingAuth||isLoading?<div className="mt-8 rounded-2xl border border-[#dbe6e8] bg-white py-16 text-center text-sm text-[#52627d]">Loading My Events…</div>:!isAuthenticated?<div className="mt-8 rounded-2xl border border-[#dbe6e8] bg-white p-8 text-center"><BookmarkCheck className="mx-auto h-9 w-9 text-[#078e48]"/><h2 className="mt-3 text-xl font-black">Sign in to use My Events</h2><p className="mt-2 text-sm text-[#52627d]">Save events and find them again later.</p><Link to="/login?returnTo=%2Fevents%2Fmy" className="mt-5 inline-flex rounded-lg bg-[#078e48] px-5 py-2.5 text-sm font-bold text-white">Log in</Link></div>:events.length===0?<div className="mt-8 rounded-2xl border border-[#dbe6e8] bg-white p-8 text-center"><CalendarDays className="mx-auto h-9 w-9 text-[#078e48]"/><h2 className="mt-3 text-xl font-black">Nothing saved yet</h2><p className="mt-2 text-sm text-[#52627d]">Use Save event on a public event and it will appear here.</p><Link to="/events" className="mt-5 inline-flex rounded-lg bg-[#078e48] px-5 py-2.5 text-sm font-bold text-white">Find events</Link></div>:<div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map(event=><EventCard key={event.id} event={event} onRegister={register}/>)}</div>}
  </main><PublicSiteFooter/></div></>;
}
