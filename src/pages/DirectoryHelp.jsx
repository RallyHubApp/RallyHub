import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ShieldCheck, Upload, CalendarDays, ArrowLeft, BookOpen, FileText, Heart } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import Seo from '@/components/public/Seo';

const faqs = [
  {
    q: 'Why did RallyHub create the Directory?',
    a: 'The idea came from a real player problem: finding a club was only the first step, then came finding the right venue, session and contact person. RallyHub Directory brings those pieces together in one place and is being built as a practical contribution to the Irish pickleball community.'
  },
  {
    q: 'Is there a charge to be listed?',
    a: 'No. There is no charge to use the RallyHub Directory or to claim and maintain your club listing. Your Directory listing is separate from RallyHub Club and does not commit you to a future paid product.'
  },
  {
    q: 'Does claiming my listing give me RallyHub Club access?',
    a: 'No. RallyHub uses one account, but permissions are separate. Directory ownership or editing does not automatically give access to RallyHub Club, tournaments, players, matches, leaderboards, analytics or tenant administration. Those permissions require their own approval or onboarding.'
  },
  {
    q: 'Can somebody from another club claim my listing?',
    a: 'They can submit a claim request, but that does not give them editing access. RallyHub grants access only when the signed-in identity matches a trusted club contact, when a valid one-time invitation issued by RallyHub is used, or when a RallyHub administrator manually approves the request. Once a listing is already claimed, an unrelated user cannot take it over.'
  },
  {
    q: 'What happens when I receive a RallyHub claim invitation?',
    a: 'Open the secure invitation link. Sign in with your RallyHub account, or create one if this is your first time. RallyHub sends a six-digit code to verify a new account email. The trusted invitation is single-use and expires after 72 hours. If your verified email or mobile matches the invitation, you can continue without waiting for a second manual approval.'
  },
  {
    q: 'Can more than one person manage a club listing?',
    a: 'Yes. A claimed listing has one Primary Owner and can have multiple Directory Editors. The Primary Owner can invite or remove editors by email or WhatsApp. Editors can update the public listing but cannot transfer ownership or manage other editors. Secure editor invitations are single-use, expire after 72 hours and are tied to the invited email address or mobile number.'
  },
  {
    q: 'Do I have to complete every field?',
    a: 'No. Start with the basics: check the club description, public contact, main venue and regular sessions. Your listing can be useful without prices, social links, extra venues or integrations. Optional details can be added later.'
  },
  {
    q: 'How are sessions ordered?',
    a: 'RallyHub automatically orders regular sessions Monday through Sunday and then by start time. If you duplicate a Wednesday session and change it to Monday, it will move into the correct weekly position automatically.'
  },
  {
    q: 'How do I place a venue on the map?',
    a: 'Enter the venue name, address and Eircode or postcode first. RallyHub will try to position it automatically. If the pin is not exact, use Set / adjust pin and click the correct place on the map. A Google Maps link is optional.'
  },
  {
    q: 'Why does my logo look different in the editor and public listing?',
    a: 'The same processed logo is used for both. RallyHub keeps the logo proportions, centres it on a white square and serves the saved public image. If a saved logo still looks wrong, replace it in the editor and save again.'
  },
  {
    q: 'What happens to the “unclaimed” wording after I claim the club?',
    a: 'Claim status is controlled by RallyHub, not by the club description. Once the listing is verified, RallyHub removes the unclaimed status wording automatically. You do not need to find and delete that system wording yourself.'
  },
  {
    q: 'What is Spond connection for?',
    a: 'It is optional. Clubs using Spond can connect their group and use upcoming Spond events to help populate venues and regular session times. You can ignore it completely if your club does not use Spond.'
  }
];

export default function DirectoryHelp() {
  return (
    <>
      <Seo title="RallyHub Directory Club Guide & Help" description="Why the RallyHub Directory exists, how to claim and manage your club listing, and answers to common questions." path="/directory/help" robots="index,follow" />
      <div className="min-h-screen bg-background text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Club Directory</Link>

          <section className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><HelpCircle className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Club guide & help</p>
                <h1 className="text-3xl sm:text-4xl font-black mt-1">Everything you need for the RallyHub Directory</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">Start with the story behind the Directory, follow the two-page Quick Start Guide, or jump straight to the frequently asked questions.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-7">
              <Link to="/directory/story" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">1. Why the Directory exists</h2>
                <p className="text-sm text-muted-foreground mt-1">Brian's story, why the Directory is free, what clubs gain and what RallyHub is - and is not - offering right now.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Open Directory Explainer →</span>
              </Link>
              <Link to="/directory/quick-start" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">2. Quick Start Guide</h2>
                <p className="text-sm text-muted-foreground mt-1">A phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Open Quick Start Guide →</span>
              </Link>
              <a href="#faqs" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">3. Frequently asked questions</h2>
                <p className="text-sm text-muted-foreground mt-1">Security, ownership, Spond, cost, Directory-only access, sessions and common sign-in questions.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Browse the FAQs ↓</span>
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                [ShieldCheck, 'Claim safely', 'Use the invitation or request access. Directory access is verified separately from RallyHub Club.'],
                [CheckCircle2, 'Check basics', 'Confirm the description, public contact and main venue.'],
                [CalendarDays, 'Check sessions', 'Add or duplicate regular sessions. RallyHub sorts them into weekly order.'],
                [Upload, 'Enhance later', 'Logo, social links, prices, extra venues and Spond are optional enhancements.'],
              ].map(([Icon,title,copy]) => (
                <div key={title} className="rounded-xl border border-border bg-background/35 p-4">
                  <Icon className="w-5 h-5 text-primary" />
                  <h2 className="font-bold mt-3">{title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="faqs" className="mt-6 glass rounded-2xl p-6 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl font-black">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-border">
              {faqs.map(item => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-6 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-primary/25 bg-primary/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Still unsure?</h2>
              <p className="text-sm text-muted-foreground mt-1">Start with the explainer or Quick Start Guide above. You can leave optional information blank and come back to improve the listing later.</p>
            </div>
            <Link to="/directory?manage=1" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Manage a listing</Link>
          </section>
        </main>
        <div className="px-4 pb-4"><PublicCopyrightFooter maxWidthClass="max-w-6xl" /></div>
      </div>
    </>
  );
}