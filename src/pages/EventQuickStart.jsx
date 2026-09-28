import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import PublicSiteHeader from '@/components/public/PublicSiteHeader';
import PublicSiteFooter from '@/components/public/PublicSiteFooter';
import Seo from '@/components/public/Seo';
import { EVENT_GUIDE_PDF_URL } from '@/lib/event-guide';

export default function EventQuickStart(){
  return <div className="min-h-screen bg-[#f7faf9] text-[#07184c]">
    <Seo title="RallyHub Events Quick Start Guide" description="A visual quick start guide for organisers adding, previewing and publishing events on RallyHub." path="/events/quick-start" robots="index,follow" />
    <PublicSiteHeader />
    <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#52647d] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4"/>Back to Events</Link>
        <div className="flex flex-wrap gap-2">
          <a href={EVENT_GUIDE_PDF_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cbd7dc] bg-white px-4 text-sm font-bold text-[#0c2257] hover:bg-[#f4faf7]"><ExternalLink className="h-4 w-4"/>Open full size</a>
          <a href={EVENT_GUIDE_PDF_URL} download="RallyHub-Events-Quick-Start-Guide.pdf" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#078e48] px-4 text-sm font-bold text-white hover:bg-[#067b3f]"><Download className="h-4 w-4"/>Download PDF</a>
        </div>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#dbe6e8] bg-white shadow-[0_14px_40px_rgba(8,24,77,.08)]">
        <div className="border-b border-[#dbe6e8] bg-[linear-gradient(135deg,#f4fbfc_0%,#eef9f2_100%)] px-6 py-6 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#078e48]">RallyHub Events</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">Adding Your Event</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52647d]">The same seven-step event editor is used in the RallyHub Directory and RallyHub Club. View the approved RallyHub Quick Start Guide below or download the exact PDF for later.</p>
        </div>

        <div className="bg-[#eef3f4] p-2 sm:p-4">
          <object data={EVENT_GUIDE_PDF_URL} type="application/pdf" className="h-[78vh] min-h-[720px] w-full rounded-xl bg-white" aria-label="RallyHub Events Quick Start Guide PDF">
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center">
              <p className="font-bold">Your browser cannot show the PDF inside this page.</p>
              <p className="mt-2 text-sm text-[#52647d]">Open the guide full size or download it using the buttons above.</p>
              <a href={EVENT_GUIDE_PDF_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#078e48] px-4 text-sm font-bold text-white"><ExternalLink className="h-4 w-4"/>Open guide</a>
            </div>
          </object>
        </div>

        <div className="border-t border-[#dbe6e8] bg-[#053c56] px-6 py-5 text-white sm:px-8"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">Need more help?</p><p className="mt-1 text-xs text-white/80">Directory owners use Manage Listing → Manage events. RallyHub Club admins use Events inside the club app. The workflow is deliberately the same.</p></div><Link to="/directory/help" className="text-sm font-bold text-[#b8ff55] hover:underline">Open Help & FAQs →</Link></div></div>
      </section>
    </main>
    <PublicSiteFooter />
  </div>;
}
