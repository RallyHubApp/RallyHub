import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MessageCircle, UserRoundPlus, ClipboardCheck, Users, Settings, CircleHelp, CheckCircle2 } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';

const PDF_URL = '/downloads/RallyHub_Directory_Quick_Start_Guide.pdf';

const steps = [
  { n:'1', icon:MessageCircle, title:'Receive your invitation', body:<><p>You’ll get a secure invite link from <strong>RallyHub</strong>, usually by WhatsApp (and sometimes by email).</p><p>Click the link on your phone or computer to get started. This link is unique to your club and is valid for <strong>72 hours</strong>.</p></> },
  { n:'2', icon:UserRoundPlus, title:'Create your RallyHub account', body:<><p>If you don’t already have an account, you’ll be asked to create one.</p><ul><li>Use the same mobile number that received the WhatsApp invite (or the same email if invited by email)</li><li>Provide an email address you can access</li><li>Enter the 6-digit verification code we send to your email</li><li>Once verified, you’ll be taken back to your club claim page automatically</li></ul></> },
  { n:'3', icon:ClipboardCheck, title:'Claim your club listing', body:<><p>Your club details will be ready for you to review. Check the information and add or update anything that’s missing.</p><ul><li>Confirm your role (e.g. Club Contact, Chairperson)</li><li>Add a contact mobile number</li><li>Make updates to sessions, venues or descriptions</li><li>When you’re happy, click <strong>Submit for review</strong></li></ul></> },
  { n:'4', icon:Users, title:'We review and approve', body:<><p>Our team will review your listing to make sure everything is accurate and in line with our guidelines.</p><p>You’ll receive a confirmation message once your listing is approved (usually within a few days).</p></> },
  { n:'5', icon:Settings, title:'Manage your listing anytime', body:<><p>Once approved, you can log in at any time to:</p><ul><li>Update session times, venues or contact details</li><li>Add news, photos or links</li><li>Keep your information up to date</li></ul></> },
];

export default function DirectoryQuickStart() {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#07184c]">
      <Seo title="RallyHub Directory Quick Start Guide" description="A quick start guide for clubs claiming and managing a RallyHub Directory listing." path="/directory/quick-start" robots="index,follow" />
      <PublicDirectoryHeader />
      <main className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 lg:px-10">
        <Link to="/directory/help" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#52647d] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4" /> Club Guide & Help</Link>

        <section className="rounded-[28px] border border-[#dbe6e8] bg-gradient-to-br from-white to-[#edf8f2] px-6 py-9 shadow-[0_14px_40px_rgba(8,24,77,.07)] sm:px-10">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#078e48]">RallyHub Directory</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">A quick start guide for clubs</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#52647d]">Follow these simple steps to claim and manage your club listing on the RallyHub Directory. It only takes a few minutes.</p>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#078e48] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(7,142,72,.2)] hover:bg-[#067b3f]"><ExternalLink className="h-4 w-4" /> Open approved two-page PDF</a>
        </section>

        <div className="mt-6 space-y-4">
          {steps.map(({n,icon:Icon,title,body}) => (
            <section key={n} className="rounded-2xl border border-[#dbe6e8] bg-white p-5 shadow-[0_8px_24px_rgba(8,24,77,.05)] sm:p-7">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex shrink-0 flex-col items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#078e48] text-xl font-black text-white">{n}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf8f0] text-[#078e48]"><Icon className="h-5 w-5" /></span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black">{title}</h2>
                  <div className="mt-3 space-y-3 leading-7 text-[#52647d] [&_strong]:font-bold [&_strong]:text-[#07184c] [&_ul]:space-y-2 [&_li]:relative [&_li]:pl-7 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[7px] [&_li]:before:content-['✓'] [&_li]:before:font-black [&_li]:before:text-[#078e48]">{body}</div>
                </div>
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-[#b8dfc7] bg-[#eef9f3] p-5 sm:p-7">
            <div className="flex gap-4 sm:gap-6">
              <div className="flex shrink-0 flex-col items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#078e48] text-xl font-black text-white">6</span><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#078e48]"><CircleHelp className="h-5 w-5" /></span></div>
              <div><h2 className="text-2xl font-black">Need help?</h2><p className="mt-3 leading-7 text-[#52647d]">If you have any questions or need a hand, visit our Help & FAQs page:</p><Link to="/directory/help" className="mt-4 inline-flex rounded-xl border border-[#b8dfc7] bg-white px-4 py-2 font-bold text-[#078e48] hover:border-[#078e48]">rallyhub.ie/directory/help</Link><p className="mt-3 text-[#52647d]">You’ll find guides, answers to common questions and details on how to get in touch.</p></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dbe6e8] bg-white p-6 sm:p-7">
            <div className="flex gap-4"><CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-[#078e48]" /><div><h2 className="text-2xl font-black">Thank you!</h2><p className="mt-2 leading-7 text-[#52647d]">By keeping your listing up to date, you’re helping players across Ireland find places to play and be part of a growing pickleball community.</p></div></div>
          </section>
        </div>

        <footer className="mt-6 flex flex-col gap-3 border-t border-[#dbe6e8] py-6 text-sm text-[#52647d] sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-bold text-[#07184c]">Created by <span className="text-[#078e48]">Brian Moore</span> through RallyHub</p><p>Part of my contribution to the continued growth of pickleball in Ireland</p></div>
          <div className="sm:text-right"><p>rallyhub.ie</p><p>rallyhubapp@gmail.com</p><p>Brian Moore &nbsp; 087 810 0333</p></div>
        </footer>
      </main>
    </div>
  );
}
