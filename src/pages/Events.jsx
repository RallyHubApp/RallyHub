import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, MessageCircle } from 'lucide-react';
import Seo from '@/components/public/Seo';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';

export default function Events() {
  return <>
    <Seo title="Pickleball Events, Tournaments & Coaching in Ireland | RallyHub" description="Discover upcoming pickleball events, tournaments, competitions, social events and coaching opportunities in Ireland. RallyHub Events is being built as a national discovery hub." path="/events" robots="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" structuredData={{'@context':'https://schema.org','@type':'CollectionPage',name:'Pickleball Events, Tournaments & Coaching in Ireland',url:'https://rallyhub.ie/events',description:'Irish pickleball events, tournaments, competitions, social events and coaching opportunities.'}} />
    <div className="min-h-screen bg-white text-[#07184c]">
      <PublicDirectoryHeader />
      <main className="bg-[linear-gradient(135deg,#f8fcfd_0%,#f1faf6_100%)] px-4 py-16 sm:px-6 sm:py-24">
        <section className="mx-auto max-w-[820px] rounded-[24px] border border-[#dbe6e8] bg-white p-7 text-center shadow-[0_18px_50px_rgba(8,30,70,.09)] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#078e48]/10"><CalendarDays className="h-7 w-7 text-[#078e48]"/></div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#078e48]">RallyHub Events</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em] sm:text-5xl">Pickleball events, tournaments & coaching in Ireland</h1>
          <p className="mx-auto mt-5 max-w-[650px] text-base leading-7 text-[#52627d]">RallyHub Events is being developed as a national place to discover pickleball tournaments, competitions, social events, coaching and other playing opportunities around Ireland. If you have an upcoming event and would like it considered for listing, please contact Brian.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="mailto:rallyhubapp@gmail.com" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-5 text-sm font-bold text-[#0c2257]"><Mail className="h-4 w-4"/>Email Brian</a>
            <a href="https://wa.me/353878100333" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#078e48] px-5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4"/>WhatsApp Brian</a>
          </div>
        </section>
      </main>
      <div className="px-4 sm:px-6 lg:px-10 xl:px-12">
        <footer className="mx-auto w-full max-w-[1380px] overflow-hidden bg-[#053c56] text-white">
          <div className="flex min-h-[70px] flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-10 xl:px-12">
            <div>
              <div className="font-black">RallyHub</div>
              <div className="mt-1 text-[8px] font-bold tracking-[.30em] text-white/90">PLAY • CONNECT • BELONG</div>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/85">
              <Link to="/">Home</Link>
              <Link to="/directory">Directory</Link>
              <Link to="/events">Events</Link>
              <Link to="/directory/help">Club Guide</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          <div className="flex min-h-[36px] items-center justify-center border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium text-white/70 sm:text-[11px]">© 2026 RallyHub All rights reserved.</div>
        </footer>
      </div>
    </div>
  </>;
}