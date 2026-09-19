import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Heart, MapPin, Search, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

export default function DirectoryStory(){
  const cardRef=useRef(null);
  const [downloading,setDownloading]=useState(false);
  const downloadImage=async()=>{
    setDownloading(true);
    try{
      const canvas=await html2canvas(cardRef.current,{scale:2,backgroundColor:'#ffffff',useCORS:true});
      const link=document.createElement('a');
      link.download='RallyHub_Directory_Explainer.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
    }finally{setDownloading(false);}
  };
  return <div className="min-h-screen bg-background text-foreground">
    <Seo title="Why the RallyHub Directory Exists" description="The story behind the RallyHub Directory and why it is free for Irish pickleball clubs." path="/directory/story" robots="index,follow"/>
    <PublicDirectoryHeader/>
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link to="/directory/help" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4"/> Club Guide & Help</Link>
        <Button onClick={downloadImage} disabled={downloading} className="gap-2"><Download className="w-4 h-4"/>{downloading?'Creating image…':'Download explainer image'}</Button>
      </div>
      <section ref={cardRef} className="bg-white text-slate-900 rounded-[30px] overflow-hidden border border-slate-200 shadow-xl">
        <div className="grid lg:grid-cols-[1.08fr_.92fr] bg-gradient-to-br from-white via-emerald-50/40 to-slate-100">
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3"><img src={LOGO_URL} crossOrigin="anonymous" alt="RallyHub" className="w-14 h-14 rounded-xl"/><div><div className="text-3xl font-black">Rally<span className="text-green-600">Hub</span></div><div className="text-[11px] tracking-[.28em] text-slate-500 font-semibold">PLAY · CONNECT · BELONG</div></div></div>
            <p className="text-xs uppercase tracking-[.18em] font-bold text-green-700 mt-7">Ireland's pickleball club directory</p>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mt-2">Helping players find your club, your venues and your sessions</h1>
            <p className="text-lg text-slate-600 mt-4">A simple, free way for players across Ireland to discover pickleball clubs, venues and sessions - and get to the right contact person.</p>
          </div>
          <div className="bg-slate-950 p-8 sm:p-10 text-white flex flex-col justify-center">
            <p className="text-lime-300 text-sm uppercase tracking-[.18em] font-bold">The idea came from a real problem</p>
            <p className="text-2xl font-black mt-3">I was away from home, had time for a game, and found it far too hard to work out where to play and who to contact.</p>
            <p className="text-sm text-slate-300 mt-4">That experience, together with seeing the existing map of Irish pickleball clubs, made me wonder whether we could build one useful place for the whole community.</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
            <Heart className="w-7 h-7 text-green-600"/><h2 className="text-2xl font-black mt-3">Why I built this</h2>
            <p className="text-sm leading-6 text-slate-600 mt-3">RallyHub began as a father-and-son project to help me run Clare Pickleball across three centres. I love the sport, and as the project developed I realised the same technology could do something useful for the wider pickleball community in Ireland.</p>
            <p className="text-sm leading-6 text-slate-600 mt-3">The Directory is part of my contribution to helping more people across Ireland find and enjoy pickleball.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <Users className="w-7 h-7 text-green-600"/><h2 className="text-2xl font-black mt-3">What's in it for your club?</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><Search className="w-4 h-4 text-green-600 mt-0.5"/><span>Be easier for travelling and local players to find</span></li>
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-green-600 mt-0.5"/><span>Show venues, session times, levels and visitor information clearly</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5"/><span>Keep one accurate public listing that your club controls</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5"/><span>Point players towards the contact route and systems you already use</span></li>
            </ul>
          </div>
        </div>

        <div className="mx-8 sm:mx-10 mb-6 rounded-2xl bg-slate-950 text-white p-6">
          <h2 className="text-2xl font-black">Keep using what already works for your club.</h2>
          <p className="text-sm text-slate-300 mt-2">RallyHub Directory is not replacing Spond, WhatsApp, Facebook, your website or your existing booking systems. It simply helps players discover your club and then directs them to the information and contact route you choose.</p>
        </div>

        <div className="mx-8 sm:mx-10 mb-8 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6"><h2 className="font-black text-xl">No catch</h2><ul className="text-sm text-slate-600 mt-3 space-y-2"><li>✓ Free to use the Directory</li><li>✓ No subscription required</li><li>✓ Directory access only</li><li>✓ No obligation to use RallyHub Club later</li><li>✓ Your club controls its public information</li></ul></div>
          <div className="rounded-2xl border border-slate-200 p-6"><h2 className="font-black text-xl">A little about RallyHub</h2><p className="text-sm text-slate-600 mt-3 leading-6">RallyHub Club is still a development project for managing members, sessions, King of the Court, inter-club challenges, tournaments and club administration. It is not on general release and is not currently being offered to clubs. It may become a commercial product in future, but the Directory is separate.</p></div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-white px-8 sm:px-10 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-5">
          <div><p className="font-black text-lg">Created by Brian Moore through RallyHub</p><p className="text-sm text-slate-600">Part of my contribution to the continued growth of pickleball in Ireland</p></div>
          <div className="text-sm text-slate-600 sm:text-right"><p className="font-semibold text-slate-900 italic text-lg">Brian Moore</p><p>rallyhub.ie · rallyhubapp@gmail.com · 087 810 0333</p></div>
        </div>
      </section>
    </main>
  </div>;
}
