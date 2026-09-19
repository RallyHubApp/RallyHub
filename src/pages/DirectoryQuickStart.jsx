import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, HelpCircle, Mail, MapPin, MessageCircle, Phone, Settings, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const StepBadge = ({ n }) => (
  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">{n}</div>
);

const CheckLine = ({ children }) => (
  <div className="flex gap-2 items-start text-sm text-slate-700">
    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
    <span>{children}</span>
  </div>
);

const GuidePage = React.forwardRef(({ page, children }, ref) => (
  <section ref={ref} className="bg-white text-slate-900 w-full max-w-[820px] mx-auto overflow-hidden rounded-[28px] border border-slate-200 shadow-xl">
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-sky-50 px-7 sm:px-9 pt-7 pb-5">
      <div className="absolute right-0 top-0 w-52 h-full bg-gradient-to-l from-emerald-100/80 to-transparent" />
      <div className="relative flex items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="RallyHub" className="w-14 h-14 rounded-2xl object-contain" crossOrigin="anonymous" />
          <div>
            <div className="text-3xl font-black tracking-tight text-slate-950">Rally<span className="text-emerald-600">Hub</span></div>
            <div className="text-[10px] tracking-[.28em] font-bold text-slate-500">PLAY · CONNECT · BELONG</div>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="font-semibold italic text-emerald-800">Stronger Pickleball</p>
          <p className="font-semibold italic text-emerald-800">Communities Together</p>
        </div>
      </div>
      <div className="relative mt-5">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950">RallyHub Directory</h1>
        <p className="text-xl font-black text-slate-900 mt-1">A quick start guide for clubs</p>
      </div>
    </div>
    <div className="px-6 sm:px-8 pb-5">{children}</div>
    <div className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-slate-950 px-6 sm:px-8 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold italic text-emerald-900">Cliffs of Moher · County Clare</p>
          <p className="text-xs text-slate-500">A healthier, happier Ireland</p>
        </div>
        <div className="text-right text-[10px] tracking-[.24em] font-bold text-white bg-slate-950 rounded-full px-5 py-2">PLAY · CONNECT · BELONG</div>
      </div>
      {page === 2 && <p className="absolute right-6 top-2 text-xs font-bold text-slate-600">Page 2 of 2</p>}
    </div>
  </section>
));
GuidePage.displayName = 'GuidePage';

export default function DirectoryQuickStart() {
  const page1 = useRef(null);
  const page2 = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      for (const [i, ref] of [page1.current, page2.current].entries()) {
        const canvas = await html2canvas(ref, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        const img = canvas.toDataURL('image/jpeg', 0.94);
        const width = 210;
        const height = Math.min((canvas.height * width) / canvas.width, 297);
        if (i) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, width, height, undefined, 'FAST');
      }
      pdf.save('RallyHub_Directory_Quick_Start_Guide.pdf');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="RallyHub Directory Quick Start Guide" description="Two-page visual guide for claiming and managing a RallyHub Directory club listing." path="/directory/quick-start" robots="index,follow" />
      <PublicDirectoryHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link to="/directory/help" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Club Guide & Help</Link>
          <Button onClick={downloadPdf} disabled={downloading} className="gap-2"><Download className="w-4 h-4" />{downloading ? 'Creating PDF…' : 'Download 2-page PDF'}</Button>
        </div>

        <div className="space-y-8">
          <GuidePage page={1} ref={page1}>
            <p className="text-sm sm:text-base text-slate-600 mt-5 mb-5">Follow these simple steps to claim and manage your club listing on the RallyHub Directory. It only takes a few minutes.</p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="1" />
                  <div>
                    <h2 className="text-xl font-black">Receive your invitation</h2>
                    <p className="text-sm text-slate-600 mt-2">You’ll get a secure invite link from RallyHub, usually by <strong>WhatsApp</strong> and sometimes by email.</p>
                    <p className="text-sm text-slate-600 mt-2">Tap the link on your phone or computer to get started. The link is unique to your club and is valid for <strong>72 hours</strong>.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp</div>
                  <div className="rounded-xl bg-white border border-slate-200 p-3 mt-3 text-sm text-slate-700">You’re invited to claim your club listing on RallyHub Directory.<div className="text-emerald-700 font-semibold mt-2">Secure club claim link</div></div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="2" />
                  <div>
                    <h2 className="text-xl font-black">Create your RallyHub account</h2>
                    <p className="text-sm text-slate-600 mt-2 mb-3">If you don’t already have an account, you’ll be asked to create one.</p>
                    <div className="space-y-2">
                      <CheckLine>Use the same mobile number that received the WhatsApp invite, or the same email address if invited by email</CheckLine>
                      <CheckLine>Provide an email address you can access</CheckLine>
                      <CheckLine>Enter the 6-digit verification code sent to your email</CheckLine>
                      <CheckLine>Once verified, RallyHub takes you back to your club claim page automatically</CheckLine>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="font-black text-center">Create your account</div>
                  <div className="space-y-2 mt-3">
                    {['Full name','Mobile number','Email address'].map(x => <div key={x} className="h-8 rounded-md border border-slate-200 bg-slate-50 text-[11px] text-slate-500 px-2 flex items-center">{x}</div>)}
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">Send verification code</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="3" />
                  <div>
                    <h2 className="text-xl font-black">Claim your club listing</h2>
                    <p className="text-sm text-slate-600 mt-2 mb-3">Your club details will be ready for you to review. Check the information and add or update anything that’s missing.</p>
                    <div className="space-y-2">
                      <CheckLine>Confirm your role or connection to the club</CheckLine>
                      <CheckLine>Confirm your contact mobile number</CheckLine>
                      <CheckLine>Make updates to sessions, venues or descriptions</CheckLine>
                      <CheckLine>When you’re happy, verify and continue</CheckLine>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-black">Claim Your Club Listing</div>
                  <div className="space-y-2 mt-3">
                    {['Your Club Name','Club contact name','Phone number','Email address'].map(x => <div key={x} className="h-7 rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-500 px-2 flex items-center">{x}</div>)}
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">Verify & continue</div>
                  </div>
                </div>
              </div>
            </div>
          </GuidePage>

          <GuidePage page={2} ref={page2}>
            <p className="text-sm sm:text-base text-slate-600 mt-5 mb-5">Complete the final steps and get the most from your listing.</p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="4" />
                  <div>
                    <h2 className="text-xl font-black">Verification</h2>
                    <p className="text-sm text-slate-600 mt-2">RallyHub checks the secure invitation against the mobile number or email linked to it. If the details match, Directory access can be granted straight away. If they do not, the request is held for administrator review.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-center text-center">
                  <div><div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto"><Check className="w-6 h-6" /></div><div className="font-black mt-3">Directory access verified</div><div className="text-xs text-slate-500 mt-1">You can now manage your listing</div></div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="5" />
                  <div>
                    <h2 className="text-xl font-black">Manage your listing anytime</h2>
                    <p className="text-sm text-slate-600 mt-2">Once verified, you can return whenever needed to:</p>
                    <ul className="mt-3 text-sm text-slate-700 space-y-1 list-disc pl-5">
                      <li>Update session times, venues or contact details</li>
                      <li>Add news, photos or links where available</li>
                      <li>Keep your information up to date</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-black text-sm"><Settings className="w-4 h-4 text-emerald-600" /> Your Club</div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mt-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div className="font-bold mt-2">Club listing</div>
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-3">Edit listing</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-sky-50 shadow-sm p-5 grid sm:grid-cols-[1fr_270px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="6" />
                  <div>
                    <h2 className="text-xl font-black">Need help?</h2>
                    <p className="text-sm text-slate-600 mt-2">If you have any questions or need a hand, visit our Club Guide & Help page:</p>
                    <Link to="/directory/help" className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-900 font-black px-4 py-3 mt-3 text-sm"><HelpCircle className="w-5 h-5" /> rallyhub.ie/directory/help</Link>
                    <p className="text-sm text-slate-600 mt-3">You’ll find guides, answers to common questions and details on how to get in touch.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 text-white p-5 flex flex-col justify-center">
                  <p className="text-2xl font-semibold italic">Same Game</p>
                  <p className="text-2xl font-semibold italic">More People</p>
                  <p className="text-2xl font-semibold italic">Brighter Days</p>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><Users className="w-6 h-6" /></div>
                <div><h2 className="text-xl font-black">Thank you!</h2><p className="text-sm text-slate-600 mt-1">By keeping your listing up to date, you’re helping players across Ireland find places to play and be part of a growing pickleball community.</p></div>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end border-t border-slate-200 pt-5">
                <div>
                  <p className="font-black">Created by <span className="text-emerald-600">Brian Moore</span> through RallyHub</p>
                  <p className="text-xs text-slate-500 mt-1">Part of my contribution to the continued growth of pickleball in Ireland</p>
                  <p className="text-2xl italic font-semibold mt-3">Brian Moore</p>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex items-center gap-2"><span className="font-semibold">rallyhub.ie</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> rallyhubapp@gmail.com</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> 087 810 0333</div>
                </div>
              </div>
            </div>
          </GuidePage>
        </div>
      </main>
    </div>
  );
}
