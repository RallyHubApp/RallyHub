import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Eye, FileImage, Filter, Printer, Send, Users } from 'lucide-react';
import PublicSiteHeader from '@/components/public/PublicSiteHeader';
import PublicSiteFooter from '@/components/public/PublicSiteFooter';
import Seo from '@/components/public/Seo';

const steps=[
  {n:1,icon:CalendarDays,title:'Add the basics',copy:'Event name and type, date, time, venue, county / region and a short public summary.'},
  {n:2,icon:FileImage,title:'Upload the artwork once',copy:'Use the real event poster. Keep the full poster for the event page and adjust a separate wide crop for the Events listing card.'},
  {n:3,icon:CheckCircle2,title:'Set registration',copy:'Choose external booking, RallyHub booking, contact organiser or no booking. Add opening and closing dates, fee and capacity when known.'},
  {n:4,icon:Filter,title:'Say who it is for',copy:'Choose playing levels, age groups and disciplines. These structured fields power the public filters.'},
  {n:5,icon:Users,title:'Add useful event information',copy:'Eligibility, player information, fees / cancellation, organiser contact, an optional schedule and map or official source links.'},
  {n:6,icon:Send,title:'Choose the audience',copy:'Directory organisers publish to public RallyHub Events. RallyHub Club adds member-calendar and member-home options in the same place.'},
  {n:7,icon:Eye,title:'Preview, save and publish',copy:'Preview the public card and detail page before publishing. Save Draft and Publish always show clear working and success feedback.'},
];

export default function EventQuickStart(){
  return <div className="min-h-screen bg-[#f7faf9] text-[#07184c]">
    <Seo title="RallyHub Events Quick Start Guide" description="A quick start guide for organisers adding, previewing and publishing events on RallyHub." path="/events/quick-start" robots="index,follow" />
    <PublicSiteHeader />
    <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#52647d] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4"/>Back to Events</Link>
        <button type="button" onClick={()=>window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cbd7dc] bg-white px-4 text-sm font-bold text-[#0c2257] hover:bg-[#f4faf7]"><Printer className="h-4 w-4"/>Print / save as PDF</button>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#dbe6e8] bg-white shadow-[0_14px_40px_rgba(8,24,77,.08)]">
        <div className="border-b border-[#dbe6e8] bg-[linear-gradient(135deg,#f4fbfc_0%,#eef9f2_100%)] px-6 py-8 sm:px-9">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#078e48]">RallyHub Events</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">Adding your event</h1>
          <p className="mt-2 text-lg font-bold">A quick start guide for organisers</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#52647d]">Create it once. Preview it clearly. Publish it wherever players need it. The same seven-step editor is used by Directory organisers and RallyHub Club organisers, so moving between them does not mean learning a second workflow.</p>
        </div>

        <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-2">
          {steps.map(({n,icon:Icon,title,copy})=><article key={n} className={`rounded-2xl border border-[#dbe6e8] bg-white p-5 ${n===7?'lg:col-span-2':''}`}>
            <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#078e48] text-lg font-black text-white">{n}</div><div><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#078e48]"/><h2 className="font-black">{title}</h2></div><p className="mt-2 text-sm leading-6 text-[#52647d]">{copy}</p></div></div>
          </article>)}
        </div>

        <div className="mx-5 mb-6 rounded-2xl border border-[#bfe3cf] bg-[#eff9f3] p-5 sm:mx-7 sm:mb-7">
          <h2 className="font-black">Registration status is automatic</h2>
          <p className="mt-2 text-sm leading-6 text-[#52647d]">When opening and closing dates are supplied, RallyHub automatically shows <strong className="text-[#07184c]">Opening soon</strong>, <strong className="text-[#07184c]">Open for booking</strong>, <strong className="text-[#07184c]">Closes in X days</strong>, <strong className="text-[#07184c]">Closes today</strong> or <strong className="text-[#07184c]">Registration closed</strong>. Organisers do not have to update the status manually.</p>
        </div>

        <div className="border-t border-[#dbe6e8] bg-[#053c56] px-6 py-5 text-white sm:px-9"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">Need help?</p><p className="mt-1 text-xs text-white/80">Directory owners can open Events directly from Manage Listing. RallyHub Club admins use Events inside the club app.</p></div><Link to="/directory/help" className="text-sm font-bold text-[#b8ff55] hover:underline">Open Help & FAQs →</Link></div></div>
      </section>
    </main>
    <PublicSiteFooter />
  </div>;
}
