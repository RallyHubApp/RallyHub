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

const Signature = () => (
  <div>
    <p className="text-xs text-slate-500">Yours in sport,</p>
    <p className="text-3xl text-slate-900 leading-none mt-1" style={{fontFamily:'cursive', transform:'rotate(-3deg)', transformOrigin:'left center'}}>Brian Moore</p>
  </div>
);

const GuidePage = React.forwardRef(({ page, children }, ref) => (
  <section ref={ref} className="bg-white text-slate-950 w-full max-w-[820px] mx-auto overflow-hidden rounded-[28px] border border-slate-200 shadow-xl">
    <div className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f0faf4_58%,#e9f4ef_100%)] px-7 sm:px-9 pt-7 pb-6">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/35" />
      <div className="relative flex items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="RallyHub" className="w-14 h-14 object-contain" crossOrigin="anonymous" />
          <div>
            <div className="text-3xl font-black tracking-tight text-[#0d2142]">Rally<span className="text-emerald-600">Hub</span></div>
            <div className="text-[10px] tracking-[.28em] font-bold text-slate-500">PLAY • CONNECT • BELONG</div>
          </div>
        </div>
        <div className="hidden sm:block text-right text-[#0d2142]" style={{fontFamily:'cursive', transform:'rotate(-2deg)'}}>
          <p className="text-xl leading-tight">Good people.</p>
          <p className="text-xl leading-tight">Great games.</p>
        </div>
      </div>
      <div className="relative mt-5">
        <p className="text-[10px] uppercase tracking-[.22em] font-black text-emerald-700">RallyHub Directory · Irish pickleball launch</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0d2142] mt-1">Quick Start Guide</h1>
        <p className="text-lg font-bold text-slate-700 mt-1">Claim and manage your club listing</p>
      </div>
    </div>

    <div className="px-6 sm:px-8 pb-6">{children}</div>

    <div className="border-t border-slate-200 bg-[linear-gradient(90deg,#eef9f2_0%,#ffffff_65%,#eef4f7_100%)] px-6 sm:px-8 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-black text-[#0d2142]">RallyHub Directory</p>
          <p className="text-xs text-slate-500">Clear, verified club information for players.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[.22em] font-bold text-emerald-700">PLAY • CONNECT • BELONG</p>
          <p className="text-xs text-slate-500 mt-1">Page {page} of 2</p>
        </div>
      </div>
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
            <p className="text-sm sm:text-base text-slate-600 mt-5 mb-5">If Brian has sent you a secure WhatsApp or email invitation, these are the exact steps to get Directory access.</p>

            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="1" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">Open your secure invitation</h2>
                    <p className="text-sm text-slate-600 mt-2">You’ll usually receive the link by <strong>WhatsApp</strong>, and sometimes by email.</p>
                    <p className="text-sm text-slate-600 mt-2">Tap the secure link. It is unique to your club, can only be used once and expires after <strong>72 hours</strong>.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0d2142]"><MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp invitation</div>
                  <div className="rounded-xl bg-white border border-slate-200 p-3 mt-3 text-xs text-slate-600">Hi Sarah, you’ve been invited to manage your club listing…<div className="text-emerald-700 font-bold mt-2">Open secure Directory link →</div></div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="2" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">Sign in or create your RallyHub account</h2>
                    <p className="text-sm text-slate-600 mt-2 mb-3">RallyHub uses one account. If you already have one, sign in. If not, choose <strong>Create account</strong>.</p>
                    <div className="space-y-2">
                      <CheckLine>WhatsApp invite: use the same mobile number that received it</CheckLine>
                      <CheckLine>Email invite: use the same invited email address</CheckLine>
                      <CheckLine>Use an email address you can access for the 6-digit verification code</CheckLine>
                      <CheckLine>After verification, RallyHub returns you to the claim page automatically</CheckLine>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="font-black text-center text-[#0d2142]">Create your RallyHub account</div>
                  <div className="space-y-2 mt-3">
                    {['Your name','Mobile number','Email address','Password'].map(x => <div key={x} className="h-8 rounded-md border border-slate-200 bg-slate-50 text-[11px] text-slate-500 px-2 flex items-center">{x}</div>)}
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">Create account</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="3" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">Confirm your details</h2>
                    <p className="text-sm text-slate-600 mt-2 mb-3">Back on the claim page, review the details RallyHub uses to verify you.</p>
                    <div className="space-y-2">
                      <CheckLine>Check your name</CheckLine>
                      <CheckLine>Add your role or connection to the club</CheckLine>
                      <CheckLine>Confirm your mobile number</CheckLine>
                      <CheckLine>Choose <strong>Submit for review</strong></CheckLine>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-black text-[#0d2142]">Directory verification</div>
                  <div className="space-y-2 mt-3">
                    {['Your name','Role / connection','Signed-in email','Mobile number'].map(x => <div key={x} className="h-7 rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-500 px-2 flex items-center">{x}</div>)}
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">Submit for review</div>
                  </div>
                </div>
              </div>
            </div>
          </GuidePage>

          <GuidePage page={2} ref={page2}>
            <p className="text-sm sm:text-base text-slate-600 mt-5 mb-5">Once RallyHub has checked the invitation, you can open and maintain the public listing.</p>

            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="4" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">We review and approve</h2>
                    <p className="text-sm text-slate-600 mt-2">RallyHub checks the secure invitation and the details you supplied, then reviews the request before Directory access is granted. You’ll see confirmation once your listing access is approved.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5 flex items-center justify-center text-center">
                  <div><div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto"><Check className="w-6 h-6" /></div><div className="font-black mt-3 text-[#0d2142]">Listing submitted for review</div><div className="text-xs text-slate-500 mt-1">We’ll let you know when it is approved</div></div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 grid sm:grid-cols-[1fr_250px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="5" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">Edit your public listing</h2>
                    <p className="text-sm text-slate-600 mt-2">Choose <strong>Edit your listing</strong>. This is where you can now review and update:</p>
                    <ul className="mt-3 text-sm text-slate-700 space-y-1 list-disc pl-5">
                      <li>Club description and public contact details</li>
                      <li>Venues and regular session times</li>
                      <li>Visitor information, levels, links and logo</li>
                      <li>Optional extras such as prices or Spond connection</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-black text-sm text-[#0d2142]"><Settings className="w-4 h-4 text-emerald-600" /> Your club listing</div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mt-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div className="font-bold mt-2">Public listing</div>
                    <div className="h-9 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-3">Edit your listing</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f0faf4_72%,#eef4f7_100%)] shadow-sm p-5 grid sm:grid-cols-[1fr_270px] gap-5">
                <div className="flex gap-4">
                  <StepBadge n="6" />
                  <div>
                    <h2 className="text-xl font-black text-[#0d2142]">Need help?</h2>
                    <p className="text-sm text-slate-600 mt-2">The Club Guide & Help page explains the process, security and common editing questions.</p>
                    <Link to="/directory/help" className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-900 font-black px-4 py-3 mt-3 text-sm"><HelpCircle className="w-5 h-5" /> rallyhub.ie/directory/help</Link>
                    <p className="text-sm text-slate-600 mt-3">Or WhatsApp or call Brian if you get stuck.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#0d2142] text-white p-5 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-[.2em] text-lime-300 font-black">Directory only</p>
                  <p className="text-lg font-bold mt-2">One RallyHub account, separate permissions. Claiming a listing lets you manage that Directory listing only; it does not automatically give RallyHub Club, tournament, player-record or club-administration access.</p>
                </div>
              </div>

              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><Users className="w-6 h-6" /></div>
                <div><h2 className="text-xl font-black text-[#0d2142]">Thank you</h2><p className="text-sm text-slate-600 mt-1">Keeping your club information current makes it easier for players to find the right place, session and contact person.</p></div>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end border-t border-slate-200 pt-5">
                <div>
                  <p className="font-black text-[#0d2142]">Created by Brian Moore through RallyHub</p>
                  <p className="text-xs text-slate-500 mt-1">Part of my contribution to helping more people find and enjoy pickleball.</p>
                  <Signature/>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex items-center gap-2"><span className="font-semibold">rallyhub.ie</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> rallyhubapp@gmail.com</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> 087 810 0333</div>
                  <div className="text-[10px] tracking-[.22em] font-bold text-emerald-700 pt-2">PLAY • CONNECT • BELONG</div>
                </div>
              </div>
            </div>
          </GuidePage>
        </div>
      </main>
    </div>
  );
}