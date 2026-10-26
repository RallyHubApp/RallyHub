import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ShieldCheck, Upload, CalendarDays, ArrowLeft, BookOpen, FileText, Heart } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import Seo from '@/components/public/Seo';

const categoryGuides = [
  { id:'clubs', name:'Clubs & places to play', summary:'Manage your club, venues and regular sessions.', items:['Open your personal invitation and sign in or create an account. Submit your claim and await verification.','Check your club description, venue, regular sessions and public contact details.','Preview and save your updates. Club administrators can add events and optional enhancements later.'], extra:'/directory/quick-start', extraLabel:'Club Quick Start Guide' },
  { id:'coaching', name:'Coaches & coaching', summary:'Take ownership of your coaching profile and keep your information current.', items:['Open your personal secure link, sign in or register and request ownership. Access is granted after verification.','Review your photograph, biography, qualifications, coaching services and areas covered.','Update your public website or social links, preview your profile and save. Return to Manage listing whenever details change.'], note:'Only add public contact information you are comfortable sharing. Enquiry forwarding should not be assumed active until verified.' },
  { id:'equipment', name:'Equipment & suppliers', summary:'Present your products, business and contact details.', items:['Sign in through your invitation or request ownership of your business listing.','Check the business name, description, products or services, geographical coverage, logo, website and public contact links.','Preview and save the listing; return whenever your range or contact information changes.'] },
  { id:'holidays', name:'Holidays & experiences', summary:'Help players understand your pickleball holiday or experience.', items:['Verify access to your provider listing.','Review the destination, itinerary or package details, imagery, contact and booking information.','If you are creating an associated event, check the dates, location, registration details and poster. Preview before publishing.'], extra:'/events/quick-start', extraLabel:'Events Quick Start Guide' },
  { id:'tournaments_events', name:'Tournaments & event organisers', summary:'Maintain your organiser listing and upcoming events.', items:['Claim and verify your organiser listing.','Check organiser contact details and add or update the event, including dates, venue, poster, registration and intended audience.','Preview the event before publishing and return to update details when arrangements change.'], extra:'/events/quick-start', extraLabel:'Events Quick Start Guide' },
  { id:'other', name:'Other pickleball services', summary:'Maintain your service information.', items:['Sign in and request verified ownership.','Check the service description, location or coverage, photograph or logo and public links.','Preview, save and revisit your listing when information changes.'] }
];

const faqs = [
  {
    q: 'Why did RallyHub create the Directory?',
    a: 'RallyHub started as a practical, enjoyable project helping pickleball players find clubs and places to play. Feedback from players and club members encouraged a broader directory: clubs, coaches, events, suppliers, holidays and other useful pickleball services together in one place.'
  },
  {
    q: 'Is there a charge to be listed?',
    a: 'There is currently no charge to claim and maintain a standard Directory listing. Directory access is separate from RallyHub Club and does not enrol you in paid club management services. Any separately priced offering should be clearly presented before you choose it.'
  },
  {
    q: 'Does claiming my listing give me RallyHub Club access?',
    a: 'No. RallyHub uses one account, but permissions are separate. Directory ownership or editing does not automatically give access to RallyHub Club, tournaments, players, matches, leaderboards, analytics or tenant administration. Those permissions require their own approval or onboarding.'
  },
  {
    q: 'Can somebody else claim my listing?',
    a: 'Anyone may request access, but that does not itself grant editing permission. RallyHub checks trusted contact information and personal invitations, and access is granted only after review. An unrelated person cannot simply take over an existing claimed listing.'
  },
  {
    q: 'What happens when I receive a RallyHub claim invitation?',
    a: 'Open the secure invitation link. Sign in with your RallyHub account, or create one if this is your first time. RallyHub sends a six-digit code to verify a new account email. The trusted invitation is single-use and expires after 72 hours. If your verified email or mobile matches the invitation, RallyHub verifies that the secure link was issued to you and sends your Directory access request for review. The link itself does not grant club-management or Directory access.'
  },
  {
    q: 'Can more than one person maintain a Directory listing?',
    a: 'A verified Primary Owner may invite Directory Editors where supported. Editors maintain the listing but cannot transfer ownership or administer unrelated RallyHub services. Invitations are personal, single-use and time-limited.'
  },
  {
    q: 'Do I have to complete every field in my listing?',
    a: 'No. Check the information already present, then correct the essentials for your category. Clubs should review venues and sessions; coaches their experience and services; suppliers their products and links; organisers their events; and holiday providers their destinations and booking details. Return later to add optional information.'
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
    q: 'How do I add or manage an event?',
    a: (
      <div className="space-y-3">
        <p>If you manage a claimed Directory listing, open <strong>Manage listing</strong> and choose <strong>Manage events</strong>. The event editor uses the same seven steps as RallyHub Club: Basics, Artwork, Registration, Who is it for?, Event information, Audience, and Preview & publish.</p>
        <p>Upload the real event poster once, adjust the separate public-card crop, add registration opening and closing dates if applicable, then preview before publishing. RallyHub automatically calculates Opening soon, Open, Closing soon and Registration closed.</p>
        <Link to="/events/quick-start" className="inline-flex font-semibold text-primary hover:underline">Open the RallyHub Events Quick Start Guide →</Link>
      </div>
    )
  },
  {
    q: 'Will the Events editor change if my club later uses RallyHub Club?',
    a: 'No. The Directory and RallyHub Club use the same event editor and the same canonical event record. RallyHub Club adds member-only audience options in the same place, rather than replacing the workflow with a different one.'
  },
  {
    q: 'What is Spond connection for?',
    a: 'It is optional. Clubs using Spond can connect their club group, scan upcoming Spond events and import regular venues and session times into the RallyHub Directory. You can ignore it completely if your club does not use Spond.'
  },
  {
    q: 'How do I connect my club to Spond?',
    a: (
      <div className="space-y-3">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open <strong>Manage listing</strong> and choose <strong>Enhanced listing</strong>.</li>
          <li>Go to <strong>Spond connection</strong>.</li>
          <li>Enter the email address and password for the club’s Spond account and press <strong>Connect Spond</strong>. RallyHub uses the password only to establish a temporary Spond session in your browser and does not save it.</li>
          <li>Choose the correct <strong>Spond club group</strong>. RallyHub will try to match the group automatically.</li>
          <li>Press <strong>Scan upcoming events</strong>.</li>
          <li>Review the sessions RallyHub finds. Repeating sessions are selected automatically, and you can change the selection before importing.</li>
          <li>Press <strong>Import selected sessions</strong>.</li>
          <li>Review the imported venues and sessions, then press <strong>Save changes</strong> to publish them to the Directory.</li>
        </ol>
        <p>You can disconnect Spond at any time. Disconnecting does not remove venues or sessions you have already published.</p>
      </div>
    )
  }
];

export default function DirectoryHelp() {
  return (
    <>
      <Seo title="RallyHub Directory Help Centre" description="Why the RallyHub Directory exists, how to claim and manage club, coaching, supplier, holiday and organiser listings, and answers to common questions." path="/directory/help" robots="index,follow" />
      <div className="min-h-screen bg-background text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Directory</Link>

          <section className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><HelpCircle className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory help centre</p>
                <h1 className="text-3xl sm:text-4xl font-black mt-1">Everything you need for the RallyHub Directory</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">Choose your listing type below for relevant guidance. Clubs remain our main focus, with dedicated help for coaches, suppliers, holidays and event organisers.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
              <Link to="/directory/story" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">1. Why the Directory exists</h2>
                <p className="text-sm text-muted-foreground mt-1">How a club-finding project grew into a broader pickleball Directory, and what RallyHub does today.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Open Directory Explainer →</span>
              </Link>
              <Link to="/directory/quick-start" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">2. Club Quick Start Guide</h2>
                <p className="text-sm text-muted-foreground mt-1">For clubs: a phone-friendly two-page guide covering WhatsApp invitations, account creation, verification and managing your listing.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Open Quick Start Guide →</span>
              </Link>
              <Link to="/events/quick-start" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <CalendarDays className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">3. Events Quick Start</h2>
                <p className="text-sm text-muted-foreground mt-1">The same seven-step event editor used in the Directory and RallyHub Club, including posters, registration dates, previews and publishing.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Open Events Guide →</span>
              </Link>
              <a href="#faqs" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="font-black text-lg mt-3">4. Frequently asked questions</h2>
                <p className="text-sm text-muted-foreground mt-1">Security, ownership, events, Spond, cost, Directory-only access, sessions and common sign-in questions.</p>
                <span className="inline-flex mt-4 text-sm font-semibold text-primary">Browse the FAQs ↓</span>
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {(/** @type {[import('lucide-react').LucideIcon,string,React.ReactNode][]} */ ([
                [ShieldCheck, 'Claim safely', 'Use the invitation or request access. Directory access is verified separately from RallyHub Club.'],
                [CheckCircle2, 'Check basics', 'Confirm your listing description and the details relevant to your category.'],
                [CalendarDays, 'Check details', 'Clubs can review sessions; event organisers and holiday providers can review their events.'],
                [Upload, 'Enhance later', 'Photos, logos, links and additional information can be added after the basics are correct.'],
              ])).map(([Icon,title,copy]) => (
                <div key={title} className="rounded-xl border border-border bg-background/35 p-4">
                  <Icon className="w-5 h-5 text-primary" />
                  <h2 className="font-bold mt-3">{title}</h2>
                  <div className="text-sm text-muted-foreground mt-1">{copy}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="by-category" className="mt-6 glass rounded-2xl p-6 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl font-black">Help for your type of listing</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your Directory account is separate from club-management permissions. All ownership requests are verified before editing access is granted.</p>
            <nav aria-label="Choose listing guidance" className="mt-5 flex flex-wrap gap-2">{categoryGuides.map(guide => <a key={guide.id} href={'#'+guide.id} className="rounded-full border border-primary/30 px-3 py-2 text-sm font-semibold hover:bg-primary/10">{guide.name}</a>)}</nav>
            <div className="mt-5 space-y-4">{categoryGuides.map(guide => <article key={guide.id} id={guide.id} className="rounded-2xl border border-border bg-background/40 p-5 scroll-mt-24">
              <h3 className="text-lg font-bold">{guide.name}</h3><p className="text-sm text-muted-foreground mt-1">{guide.summary}</p>
              <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm leading-6">{guide.items.map(item=><li key={item}>{item}</li>)}</ol>
              {guide.note&&<p className="mt-3 text-sm text-muted-foreground">{guide.note}</p>}
              {guide.extra&&<Link to={guide.extra} className="mt-3 inline-block text-sm font-semibold text-primary underline">{guide.extraLabel}</Link>}
            </article>)}</div>
            <p className="mt-5 text-sm text-muted-foreground">Your secure invitation is personal and expires after 72 hours. If it has expired, request a fresh invitation from RallyHub at <a className="underline" href="mailto:rallyhubapp@gmail.com">rallyhubapp@gmail.com</a>. Never forward your personal claim link to somebody else.</p>
          </section>

          <section id="faqs" className="mt-6 glass rounded-2xl p-6 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl font-black">Frequently asked questions</h2><p className="mt-2 text-sm text-muted-foreground">General questions first, followed by club-specific details for venues, sessions and Spond.</p>
            <div className="mt-5 divide-y divide-border">
              {faqs.map(item => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="mt-3 pr-8 text-sm leading-6 text-muted-foreground">{item.a}</div>
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