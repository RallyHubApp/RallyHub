import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, HelpCircle, Mail, MapPin, Smartphone, UserCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const Step = ({ n, title, children }) => (
  <div className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm flex gap-4">
    <div className="w-10 h-10 rounded-full bg-green-600 text-white font-black flex items-center justify-center shrink-0">{n}</div>
    <div><h3 className="font-black text-slate-900">{title}</h3><div className="text-sm leading-6 text-slate-600 mt-1">{children}</div></div>
  </div>
);

const PageShell = React.forwardRef(({ page, children }, ref) => (
  <section ref={ref} className="bg-white text-slate-900 w-full max-w-[820px] mx-auto rounded-[28px] overflow-hidden border border-slate-200 shadow-xl">
    <div className="px-7 sm:px-10 pt-8 pb-6 bg-gradient-to-br from-white via-emerald-50/40 to-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="RallyHub" className="w-12 h-12 rounded-xl" crossOrigin="anonymous" />
          <div><div className="text-2xl font-black tracking-tight">Rally<span className="text-green-600">Hub</span></div><div className="text-[10px] tracking-[.28em] text-slate-500 font-semibold">PLAY · CONNECT · BELONG</div></div>
        </div>
        <div className="text-right"><p className="text-xs uppercase tracking-wider font-bold text-green-700">Quick Start Guide</p><p className="text-xs text-slate-500">Page {page} of 2</p></div>
      </div>
    </div>
    <div className="px-7 sm:px-10 pb-9">{children}</div>
    <div className="px-7 sm:px-10 py-4 border-t border-slate-200 flex justify-between text-[10px] tracking-[.2em] text-slate-500 font-semibold">
      <span>RALLYHUB.IE</span><span>PAGE {page} OF 2</span><span>PLAY · CONNECT · BELONG</span>
    </div>
  </section>
));
PageShell.displayName='PageShell';

export default function DirectoryQuickStart() {
  const page1 = useRef(null);
  const page2 = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress:true });
      const refs=[page1.current,page2.current];
      for(let i=0;i<refs.length;i++){
        const canvas=await html2canvas(refs[i],{scale:2,backgroundColor:'#ffffff',useCORS:true});
        const img=canvas.toDataURL('image/jpeg',0.92);
        const width=210;
        const height=(canvas.height*width)/canvas.width;
        if(i) pdf.addPage();
        pdf.addImage(img,'JPEG',0,0,width,Math.min(height,297),undefined,'FAST');
      }
      pdf.save('RallyHub_Directory_Quick_Start_Guide.pdf');
    } finally { setDownloading(false); }
  };

  return <div className="min-h-screen bg-background text-foreground">
    <Seo title="RallyHub Directory Quick Start Guide" description="Two-page guide for claiming and managing a RallyHub Directory club listing." path="/directory/quick-start" robots="index,follow" />
    <PublicDirectoryHeader />
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link to="/directory/help" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4"/> Club Guide & Help</Link>
        <Button onClick={downloadPdf} disabled={downloading} className="gap-2"><Download className="w-4 h-4"/>{downloading?'Creating PDF…':'Download 2-page PDF'}</Button>
      </div>
      <div className="space-y-7">
        <PageShell page={1} ref={page1}>
          <div className="grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center mb-6">
            <div><h1 className="text-4xl font-black leading-tight">RallyHub Directory</h1><p className="font-bold text-slate-700 mt-2">Claim & manage your existing club listing</p><p className="text-sm text-slate-600 mt-2">Use this guide if your club is already listed and you have received a claim link by WhatsApp or email.</p></div>
            <div className="rounded-2xl bg-slate-950 p-5 text-white"><Smartphone className="w-7 h-7 text-lime-300"/><p className="font-bold mt-2">Invited by WhatsApp?</p><p className="text-sm text-slate-300 mt-1">If you are new to RallyHub, create a Directory account first and use the same mobile number that received the invitation.</p></div>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 mb-5"><h2 className="font-black text-green-800">Before you start</h2><p className="text-sm text-slate-600 mt-1">Have your club logo, contact details, venue names/Eircodes, regular session days and times, website/social links and the mobile number used for your invitation.</p></div>
          <div className="space-y-3">
            <Step n="1" title="Find your club">Open the RallyHub Directory and find your club by name, county or town.</Step>
            <Step n="2" title="Open your secure claim link">If Brian has sent you a WhatsApp or email invitation, open that private link. It is single-use and valid for 72 hours.</Step>
            <Step n="3" title="Create your Directory account">New to RallyHub? Enter your name, the <strong>same mobile number</strong> your club already has, an email address you can access and a password. RallyHub emails a six-digit code to verify the account. Already have an account? Sign in instead.</Step>
            <Step n="4" title="Request Directory access">Return to the secure claim page, confirm your role and mobile number, and submit. If the trusted invitation matches your verified account/mobile, RallyHub can grant Directory access without giving you any RallyHub Club access.</Step>
          </div>
        </PageShell>

        <PageShell page={2} ref={page2}>
          <div className="mb-6"><h1 className="text-4xl font-black">Manage your listing</h1><p className="text-sm text-slate-600 mt-2">Once verified, you can keep the public information about your club accurate and useful.</p></div>
          <div className="space-y-3">
            <Step n="5" title="Verification"><div className="flex gap-2 items-start"><UserCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0"/><span>RallyHub checks the secure invitation and your account details. If anything does not match safely, the request goes to a RallyHub administrator for review.</span></div></Step>
            <Step n="6" title="Edit your listing">Update your club description, public contact, venues, sessions, logo and social links. You can keep using Spond, WhatsApp, Facebook, your website or your existing booking system.</Step>
            <Step n="7" title="Save and view">Save your changes and open the public listing to check what players will see. You can return later whenever information changes.</Step>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5"><CheckCircle2 className="w-6 h-6 text-green-600"/><h2 className="font-black mt-2">Helpful tips</h2><ul className="text-sm text-slate-600 mt-2 space-y-1"><li>• Use your final club logo if possible</li><li>• Double-check venue addresses and Eircodes</li><li>• Check session times before saving</li><li>• Optional details can be added later</li></ul></div>
            <div className="rounded-2xl bg-slate-950 p-5 text-white"><HelpCircle className="w-6 h-6 text-lime-300"/><h2 className="font-black mt-2">Need help?</h2><p className="text-sm text-slate-300 mt-2">Contact Brian Moore or email RallyHub.</p><p className="text-sm mt-3"><strong>Mobile:</strong> 087 810 0333</p><p className="text-sm"><strong>Email:</strong> rallyhubapp@gmail.com</p></div>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mt-6">
            <h2 className="font-black">Directory access only</h2><p className="text-sm text-slate-600 mt-1">Claiming or editing a listing does not give access to RallyHub Club, tournaments, players, matches, leaderboards, analytics or tenant administration.</p>
          </div>
        </PageShell>
      </div>
    </main>
  </div>;
}
