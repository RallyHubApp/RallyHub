import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, MessageCircle } from 'lucide-react';
import Seo from '@/components/public/Seo';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';

export default function Events() {
  return <>
    <Seo title="Events | RallyHub" description="RallyHub Events is under development. Event organisers can contact RallyHub to have an upcoming event considered for listing." path="/events" robots="index,follow" />
    <div className="min-h-screen bg-white text-[#07184c]">
      <PublicDirectoryHeader />
      <main className="bg-[linear-gradient(135deg,#f8fcfd_0%,#f1faf6_100%)] px-4 py-16 sm:px-6 sm:py-24">
        <section className="mx-auto max-w-[820px] rounded-[24px] border border-[#dbe6e8] bg-white p-7 text-center shadow-[0_18px_50px_rgba(8,30,70,.09)] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#078e48]/10"><CalendarDays className="h-7 w-7 text-[#078e48]"/></div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#078e48]">RallyHub Events</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em] sm:text-5xl">Events are coming to RallyHub</h1>
          <p className="mx-auto mt-5 max-w-[650px] text-base leading-7 text-[#52627d]">This section is under development. If you have an upcoming event and would like it listed on RallyHub, please contact Brian. We’d be delighted to work with some of the first event organisers as we build this part of the platform.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="mailto:hello@rallyhub.ie" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-5 text-sm font-bold text-[#0c2257]"><Mail className="h-4 w-4"/>Email Brian</a>
            <a href="https://wa.me/353878100333" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#078e48] px-5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4"/>WhatsApp Brian</a>
          </div>
        </section>
      </main>
      <footer className="bg-[#053c56] text-white"><div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row"><div><div className="font-black">RallyHub</div><div className="mt-1 text-[8px] font-bold tracking-[.30em]">PLAY • CONNECT • BELONG</div></div><nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/85"><Link to="/">Home</Link><Link to="/directory">Directory</Link><Link to="/events">Events</Link><Link to="/directory/help">Club Guide</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav></div></footer>
    </div>
  </>;
}