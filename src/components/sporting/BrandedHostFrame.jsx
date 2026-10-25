import React from 'react';
import { BookOpen, Grid2X2, Menu, Play, Users, ChartNoAxesColumn, LogOut, ShieldCheck } from 'lucide-react';

// Presentation only: shared by sporting host flows. The caller retains its own sporting commands.
const CLARE_TENANT='6a9b7790bc4a8d299938bda9';
const CLARE_LOGO='https://rallyhub.ie/email-templates/clare-interclub/clare-logo-transparent.png';
const RALLYHUB_REVERSE_LOGO='https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/85b0612d8_rallyhub-1fa08c810cc2f349fd52.png';
/** @type {[string,string,import('lucide-react').LucideIcon][]} */
const actions=[['run','Run',Play],['players','Players',Users],['courts','Courts',Grid2X2],['scores','Scores',ChartNoAxesColumn],['more','More',Menu],['guide','Guide',BookOpen]];

export default function BrandedHostFrame({tenantId,title,subtitle,roundNote,hostName,activeTab,onTab,onSignOut,communicationsUrl,children}){
  const clare=String(tenantId)===CLARE_TENANT;
  return <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-[#081342]" data-testid="sporting-branded-host-frame">
    <header className="bg-white" data-testid="sporting-host-brand-header">
      <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-4 flex items-center gap-3">
        {clare&&<img src={CLARE_LOGO} alt="Clare Pickleball logo" className="h-14 w-14 sm:h-20 sm:w-20 shrink-0 object-contain"/>}
        <div className="min-w-0 flex-1"><h1 className="text-lg sm:text-2xl font-black leading-tight text-[#081342]">{title}</h1><p className="text-[11px] sm:text-sm text-[#314563] leading-snug mt-1">{subtitle||roundNote||'Session host'}</p>{clare&&<p className="mt-1.5 text-[10px] sm:text-xs font-bold tracking-[.19em] text-[#081342]">PLAY <span className="text-[#e6b400]">•</span> CONNECT <span className="text-[#e6b400]">•</span> BELONG</p>}</div>
      </div>
      <div className="h-5 sm:h-6 overflow-hidden" aria-hidden="true"><svg viewBox="0 0 600 24" className="w-full h-full" preserveAspectRatio="none"><path d="M0 21 C170 30 340 25 600 0 L600 10 C340 34 170 35 0 23Z" fill="#f9cb17"/><path d="M0 24 C170 35 340 30 600 7 L600 24Z" fill="#073b74"/></svg></div>
    </header>
    <nav className="sticky top-0 z-40 bg-[#073b74] text-white shadow-sm" aria-label="Session host navigation" data-testid="sporting-host-mobile-tabs"><div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-hide px-1 sm:px-3">{actions.map(([key,label,Icon])=><button key={key} type="button" aria-current={activeTab===key?'page':undefined} onClick={()=>onTab(key)} className={`min-w-[63px] sm:min-w-[90px] flex-1 min-h-[58px] sm:min-h-[62px] px-1.5 flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white ${activeTab===key?'bg-[#f9cb17] text-[#081342]':'text-white hover:bg-white/15'}`}><Icon size={18} aria-hidden="true"/>{label}</button>)}</div></nav>
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#314563]"><span className="inline-flex items-center gap-1 font-semibold"><ShieldCheck size={15} className="text-[#078e48]"/> Session Host Mode · {hostName||'Authorised host'}</span><div className="flex items-center gap-2">{communicationsUrl&&<a className="rounded-md border px-3 py-2 font-semibold bg-white" href={communicationsUrl}>Communications</a>}<button type="button" onClick={onSignOut} className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-2 font-semibold"><LogOut size={14}/>Sign out</button></div></div>
    <main id="sporting-host-main" className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 flex-1">{children}</main>
    <footer className="bg-[#053c56] px-3 py-2 mt-5 text-center" data-testid="sporting-host-approved-footer"><a href="https://rallyhub.ie/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 no-underline" aria-label="Powered by RallyHub"><span className="text-[11px] text-white">Powered by</span><img src={RALLYHUB_REVERSE_LOGO} width="145" alt="RallyHub" className="w-[145px] max-w-[52vw] h-auto object-contain"/></a></footer>
  </div>;
}
