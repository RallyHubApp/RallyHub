import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ShieldCheck, Upload, CalendarDays, ArrowLeft } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';

const faqs = [
  {
    q: 'Can somebody from another club claim my listing?',
    a: 'They can submit a claim request, but that does not give them editing access. RallyHub grants access only when the signed-in identity matches a trusted club contact, when a valid one-time invitation issued by RallyHub is used, or when a RallyHub administrator manually approves the request. Once a listing is already claimed, an unrelated user cannot take it over.'
  },
  {
    q: 'What happens when I receive a RallyHub claim invitation?',
    a: 'Open the secure invitation link. If you need a new Directory account, RallyHub sends a six-digit code to verify your email. The trusted invitation is single-use and expires after 72 hours. If your verified email or mobile matches the invitation, you can continue without waiting for a second manual approval.'
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
      <Seo title="RallyHub Directory Help" description="Simple help for claiming, checking and maintaining a RallyHub club directory listing." path="/directory/help" robots="index,follow" />
      <div className="min-h-screen bg-background text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Club Directory</Link>

          <section className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><HelpCircle className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory help</p>
                <h1 className="text-3xl sm:text-4xl font-black mt-1">Getting your club listing right</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">You do not need to be technical and you do not need to complete everything. RallyHub is designed so you can check the essentials first and improve the listing later.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
              {[
                [ShieldCheck, '1. Claim safely', 'Use the invitation or request access. Claiming never gives access automatically unless your identity is trusted.'],
                [CheckCircle2, '2. Check basics', 'Confirm the description, public contact and main venue.'],
                [CalendarDays, '3. Check sessions', 'Add or duplicate regular sessions. RallyHub sorts them into weekly order.'],
                [Upload, '4. Enhance later', 'Logo, social links, prices, extra venues and Spond are optional enhancements.'],
              ].map(([Icon,title,copy]) => (
                <div key={title} className="rounded-xl border border-border bg-background/35 p-4">
                  <Icon className="w-5 h-5 text-primary" />
                  <h2 className="font-bold mt-3">{title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 glass rounded-2xl p-6 sm:p-8">
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
              <p className="text-sm text-muted-foreground mt-1">You can leave optional information blank. Save the basics first; nothing is lost by coming back later.</p>
            </div>
            <Link to="/directory?manage=1" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Manage a listing</Link>
          </section>
        </main>
      </div>
    </>
  );
}
