import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsConsent, loadAnalyticsConfig, publicPage, setAnalyticsConsent, trackSiteEvent } from '@/lib/site-analytics';

export default function SiteAnalytics(){
  const location=useLocation();
  const [consent,setConsentState]=useState(()=>analyticsConsent());
  const [settingsOpen,setSettingsOpen]=useState(false);
  const startedAt=useRef(Date.now());

  useEffect(()=>{
    if(consent==='granted') loadAnalyticsConfig();
  },[consent]);

  useEffect(()=>{
    const path=location.pathname;
    if(consent!=='granted'||!publicPage(path)) return;
    startedAt.current=Date.now();
    trackSiteEvent('page_view');
    return ()=>{
      const seconds=Math.round((Date.now()-startedAt.current)/1000);
      if(seconds>=3) trackSiteEvent('page_engagement',{engagementSeconds:seconds});
    };
  },[location.pathname,location.search,consent]);

  if(!publicPage(location.pathname)) return null;

  const decide=value=>{
    setAnalyticsConsent(value);
    setConsentState(value);
    setSettingsOpen(false);
    if(value==='granted') loadAnalyticsConfig();
  };

  return <>
    {!consent||settingsOpen ? <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#cfdde0] bg-white p-4 text-[#07184c] shadow-[0_18px_60px_rgba(7,24,76,.18)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-black">Help us improve RallyHub</p>
          <p className="mt-1 text-xs leading-5 text-[#5f6f88]">We use optional analytics to understand which clubs, venues and Directory features people find useful. Analytics only starts if you allow it. We do not use this for advertising profiles.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={()=>decide('denied')} className="h-9 rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-bold">Necessary only</button>
          <button type="button" onClick={()=>decide('granted')} className="h-9 rounded-lg bg-[#078e48] px-3 text-xs font-bold text-white">Allow analytics</button>
          {settingsOpen&&consent&&<button type="button" onClick={()=>setSettingsOpen(false)} className="h-9 rounded-lg px-2 text-xs font-bold text-[#5f6f88]">Cancel</button>}
        </div>
      </div>
    </div> : <button type="button" onClick={()=>setSettingsOpen(true)} className="fixed bottom-3 left-3 z-[80] rounded-full border border-[#d6e0e4] bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#52627d] shadow-sm hover:text-[#07184c]">Cookie settings</button>}
  </>;
}
