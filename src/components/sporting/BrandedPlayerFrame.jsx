import React from 'react';
import {CalendarDays,ClipboardList,Grid2X2,Trophy,MapPin} from 'lucide-react';
import RallyHubPublicBrand from '@/components/branding/RallyHubPublicBrand';
const tabs=[['registration','My Event',CalendarDays],['fixtures','Fixtures',ClipboardList],['live','Live',Grid2X2],['knockout','Knockout',Trophy],['results','Results',Trophy],['venue','Venue',MapPin]];
const stages=['registration','fixtures','live','knockout','results'];
export default function BrandedPlayerFrame({event,stage,activeTab,onTab,children}){
 const limit=Math.max(0,stages.indexOf(stage));
 const visible=tabs.filter(([key])=>key==='venue'||stages.indexOf(key)<=limit);
 return <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-[#081342]" data-testid="tournival-player-host-style-frame">
  <header className="bg-white"><div className="mx-auto max-w-5xl px-3 pt-3 sm:px-5 sm:pt-4">
   <RallyHubPublicBrand moduleName="Tournival" pageLabel="My Tournament" club={event?.organiser} clubFirst/>
   <h1 className="text-lg sm:text-2xl font-black mt-2">{event?.name||'Tournival'}</h1>
   <p className="text-xs sm:text-sm text-[#314563] mt-1">{event?.venue||'Venue to be confirmed'} · {event?.date||'Date to be confirmed'}</p>
  </div><div className="h-5 sm:h-6 overflow-hidden" aria-hidden="true"><svg viewBox="0 0 600 24" className="w-full h-full" preserveAspectRatio="none"><path d="M0 21 C170 30 340 25 600 0 L600 10 C340 34 170 35 0 23Z" fill="#f9cb17"/><path d="M0 24 C170 35 340 30 600 7 L600 24Z" fill="#073b74"/></svg></div></header>
  <nav className="sticky top-0 z-40 bg-[#073b74] text-white shadow-sm" aria-label="Tournival player navigation"><div className="max-w-5xl mx-auto flex overflow-x-auto px-1 sm:px-3">
   {visible.map(([key,label,Icon])=><button key={key} type="button" aria-current={activeTab===key?'page':undefined} onClick={()=>onTab(key)} className={'min-w-[68px] sm:min-w-[94px] flex-1 min-h-[58px] px-1.5 flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white '+(activeTab===key?'bg-[#f9cb17] text-[#081342]':'text-white hover:bg-white/15')}><Icon size={18} aria-hidden="true"/>{label}</button>)}
  </div></nav>
  <main className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-4 flex-1 space-y-4">{children}</main>
  <footer className="bg-[#053c56] px-3 py-3 text-center text-xs text-white mt-5">Powered by <a href="https://rallyhub.ie/" className="underline font-bold text-white">RallyHub</a> · One personal link throughout the event</footer>
 </div>;
}
