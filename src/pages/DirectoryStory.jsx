import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Heart, MapPin, Search, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const Signature = () => (
  <div>
    <p className="text-sm text-slate-500">Yours in sport,</p>
    <p className="text-3xl text-slate-900 leading-none mt-1" style={{fontFamily:'cursive', transform:'rotate(-3deg)', transformOrigin:'left center'}}>Brian Moore</p>
  </div>
);

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
        <Button onClick={downloadImage} disabled={downloading} className="gap-2"><Download className="w-4 h-4"/>{downloading?'Creating image…':'Download one-pager'}</Button>
      </div>

      <section ref={cardRef} className="bg-white text-slate-950 rounded-[30px] overflow-hidden border border-slate-200 shadow-xl">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f0faf4_58%,#e9f4ef_100%)]">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/35" />
          <div className="relative grid lg:grid-cols-[1.12fr_.88fr]">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4">
                <img src={LOGO_URL} crossOrigin="anonymous" alt="RallyHub" className="w-16 h-16 object-contain"/>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#0d2142]">Rally<span className="text-emerald-600">Hub</span></div>
                  <div className="text-[10px] sm:text-xs tracking-[.28em] text-slate-500 font-bold mt-1">PLAY • CONNECT • BELONG</div>
                </div>
              </div>

              <p className="text-xs uppercase tracking-[.22em] font-black text-emerald-700 mt-8">RallyHub Directory · Irish pickleball launch</p>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.03] mt-2 text-[#0d2142]">Helping players find your club, your venues and your sessions</h1>
              <p className="text-lg text-slate-600 mt-4 max-w-2xl">A simple, free discovery layer for pickleball in Ireland — helping people find where to play and who to contact, while clubs keep using the systems that already work for them.</p>
            </div>

            <div className="bg-[#0d2142] text-white p-8 sm:p-10 flex flex-col justify-center">
              <p className="text-lime-300 text-xs uppercase tracking-[.2em] font-black">Why I started it</p>
              <p className="text-2xl sm:text-3xl font-black mt-3 leading-tight">I was away from home, had time for a game, and found it far too hard to work out where to play and who to contact.</p>
              <p className="text-sm text-slate-300 mt-4 leading-6">That experience made me think we could create one useful public place for clubs, venues, sessions and contact details.</p>
              <div className="mt-6 text-2xl text-white/95" style={{fontFamily:'cursive', transform:'rotate(-2deg)', transformOrigin:'left center'}}>Good people. Great games.</div>
              <div className="h-1 w-28 bg-emerald-400 rounded-full mt-2" />
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-6">
            <Heart className="w-7 h-7 text-emerald-600"/>
            <h2 className="text-2xl font-black mt-3 text-[#0d2142]">Why I built this</h2>
            <p className="text-sm leading-6 text-slate-600 mt-3">RallyHub began as a father-and-son project to help me run Clare Pickleball. As it developed, I realised some of the same technology could make club discovery much easier for the wider pickleball community.</p>
            <p className="text-sm leading-6 text-slate-600 mt-3">The Directory is the first public piece: practical, useful and separate from the wider RallyHub Club platform.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <Users className="w-7 h-7 text-emerald-600"/>
            <h2 className="text-2xl font-black mt-3 text-[#0d2142]">What your club gets</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><Search className="w-4 h-4 text-emerald-600 mt-0.5"/><span>Be easier for local and travelling players to find</span></li>
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-emerald-600 mt-0.5"/><span>Show venues, session times, levels and visitor information clearly</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5"/><span>Control one accurate public listing</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5"/><span>Direct people to your preferred contact route, website or booking system</span></li>
            </ul>
          </div>
        </div>

        <div className="mx-8 sm:mx-10 rounded-3xl bg-[#0d2142] text-white p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[.2em] text-lime-300 font-black">Important</p>
          <h2 className="text-2xl font-black mt-2">Keep using what already works for your club.</h2>
          <p className="text-sm text-slate-300 mt-2 leading-6">The RallyHub Directory does not replace Spond, WhatsApp, Facebook, websites or booking systems. It helps players discover your club and then points them towards the information and contact route you choose.</p>
        </div>

        <div className="mx-8 sm:mx-10 my-6 grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="font-black text-xl text-[#0d2142]">No catch</h2>
            <ul className="text-sm text-slate-600 mt-3 space-y-2">
              <li>✓ No charge to claim or maintain the Directory listing</li>
              <li>✓ No subscription required for the Directory</li>
              <li>✓ Directory access only</li>
              <li>✓ No obligation to use RallyHub Club later</li>
              <li>✓ Your club controls its public information</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="font-black text-xl text-[#0d2142]">A little about RallyHub</h2>
            <p className="text-sm text-slate-600 mt-3 leading-6">RallyHub is being built as a multi-tenant racket-sports platform for clubs, organisers, competitions and communities. Pickleball in Ireland is where we are proving it first. RallyHub Club is still in development and is not being offered generally to clubs yet.</p>
          </div>
        </div>

        <div className="bg-[linear-gradient(90deg,#eef9f2_0%,#ffffff_58%,#eef4f7_100%)] px-8 sm:px-10 py-7 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <p className="font-black text-lg text-[#0d2142]">Created by Brian Moore through RallyHub</p>
            <p className="text-sm text-slate-600 mt-1">Part of my contribution to helping more people find and enjoy pickleball.</p>
            <Signature/>
          </div>
          <div className="text-sm text-slate-600 sm:text-right">
            <p className="font-black text-[#0d2142]">RallyHub Directory</p>
            <p>rallyhub.ie</p>
            <p>rallyhubapp@gmail.com · 087 810 0333</p>
            <p className="text-[10px] tracking-[.22em] font-bold text-emerald-700 mt-2">PLAY • CONNECT • BELONG</p>
          </div>
        </div>
      </section>
    </main>
  </div>;
}