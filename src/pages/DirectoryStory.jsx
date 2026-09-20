import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';

const PDF_URL = '/downloads/RallyHub_Directory_Explainer.pdf';

export default function DirectoryStory() {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#07184c]">
      <Seo title="RallyHub Directory Explainer" description="Helping players find your club, your venues and your sessions." path="/directory/story" robots="index,follow" />
      <PublicDirectoryHeader />
      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-10">
        <Link to="/directory/help" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#52647d] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4" /> Club Guide & Help</Link>

        <section className="overflow-hidden rounded-[24px] border border-[#dbe6e8] bg-white shadow-[0_14px_40px_rgba(8,24,77,.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#dbe6e8] bg-white px-4 py-3 sm:px-5">
            <p className="text-sm font-bold text-[#07184c]">Approved RallyHub Directory Explainer</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#078e48] px-4 py-2 text-sm font-bold text-white hover:bg-[#067b3f]"><ExternalLink className="h-4 w-4" /> Open / print PDF</a>
          </div>
          <object data={PDF_URL} type="application/pdf" className="block h-[78vh] min-h-[720px] w-full bg-white" aria-label="RallyHub Directory Explainer PDF">
            <div className="p-8 text-center"><p className="text-[#52647d]">Your browser cannot display the PDF inline.</p><a href={PDF_URL} className="mt-4 inline-flex rounded-xl bg-[#078e48] px-5 py-3 font-bold text-white">Open the approved PDF</a></div>
          </object>
        </section>

        <section className="sr-only" aria-hidden="true">

          <div className="bg-gradient-to-br from-[#f7fbf9] via-white to-[#edf8f2] px-6 py-9 sm:px-10 lg:px-12">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#078e48]">RallyHub Directory</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.04em] text-[#07184c] sm:text-5xl">Helping players find your club, your venues and your sessions</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#52647d]">A simple way for players across Ireland to discover pickleball clubs, venues and sessions — and get to the right contact person.</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#078e48] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(7,142,72,.2)] hover:bg-[#067b3f]"><ExternalLink className="h-4 w-4" /> Open approved PDF</a>
          </div>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_8px_24px_rgba(8,24,77,.05)]">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Users /></span><h2 className="text-2xl font-black">Why I built this</h2></div>
            <p className="mt-4 leading-7 text-[#52647d]">I started this because I was away from home, wanted a game of pickleball, and discovered how awkward it could be to find the right club, the right session and the right contact person.</p>
            <p className="mt-3 leading-7 text-[#52647d]">RallyHub began as a father-and-son project to help me run Clare Pickleball. I realised the same platform could also do something useful for the wider pickleball community in Ireland.</p>
          </section>

          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_8px_24px_rgba(8,24,77,.05)]">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Gift /></span><h2 className="text-2xl font-black">What’s in it for your club?</h2></div>
            <div className="mt-4 space-y-3">{benefits.map(([text,Icon]) => <div key={text} className="flex gap-3 text-[#52647d]"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#078e48]" /><span>{text}</span></div>)}</div>
          </section>

          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_8px_24px_rgba(8,24,77,.05)]">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Info /></span><h2 className="text-2xl font-black">Important to know</h2></div>
            <div className="mt-4 space-y-3">{['Free to join the Directory','No subscription and no catch','This is Directory access only','RallyHub Club is still under development','Claiming a listing does not sign your club up to a future paid product'].map(x => <div key={x} className="flex gap-3 text-[#52647d]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#078e48]" /><span>{x}</span></div>)}</div>
          </section>

          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_8px_24px_rgba(8,24,77,.05)]">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Users /></span><h2 className="text-2xl font-black">A little about <span className="text-[#078e48]">RallyHub</span></h2></div>
            <p className="mt-4 leading-7 text-[#52647d]">RallyHub is a project my son and I started to help me run Clare Pickleball across three centres — members, sessions, King of the Court, inter-club challenges and competitions.</p>
            <p className="mt-3 leading-7 text-[#52647d]">It is not on general release yet. For now, the Directory is a separate free contribution to the Irish pickleball community.</p>
          </section>

          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_8px_24px_rgba(8,24,77,.05)] md:col-span-2">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Rocket /></span><h2 className="text-2xl font-black">Why you’re being asked now</h2></div>
            <p className="mt-4 max-w-4xl leading-7 text-[#52647d]">We’re inviting a small number of clubs to help test the Directory before wider rollout.</p>
            <p className="mt-2 max-w-4xl leading-7 text-[#52647d]">If you’re happy to be part of it, I’ll send your club’s private link so you can review or claim your listing, correct anything that is wrong and help shape the final experience.</p>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-[#b8dfc7] bg-[#eef9f3] p-6 sm:p-8">
          <blockquote className="text-2xl font-black tracking-[-.02em] text-[#07184c]">“Keep using what already works for your club.”</blockquote>
          <p className="mt-3 max-w-4xl leading-7 text-[#52647d]">RallyHub Directory is not replacing Spond, WhatsApp, Facebook or your website. It simply helps players discover your club and then direct them to the contact route you choose.</p>
        </section>

        </section>
        <footer className="mt-6 flex flex-col gap-3 border-t border-[#dbe6e8] py-6 text-sm text-[#52647d] sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-bold text-[#07184c]">Created by <span className="text-[#078e48]">Brian Moore</span> through RallyHub</p><p>Part of my contribution to the continued growth of pickleball in Ireland</p></div>
          <div className="sm:text-right"><p>rallyhub.ie</p><p>rallyhubapp@gmail.com</p><p>Brian Moore &nbsp; 087 810 0333</p></div>
        </footer>
      </main>
    </div>
  );
}
