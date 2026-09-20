import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  MapPin,
  Menu,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { directoryClubs } from '@/data/directorySeed';
import Seo, { SITE_URL } from '@/components/public/Seo';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

const FeatureCard = ({ icon: Icon, title, copy, action, to, muted = false }) => (
  <article className={`rounded-2xl border border-[#dce7e3] bg-white p-5 shadow-[0_10px_28px_rgba(13,33,66,0.06)] ${muted ? 'opacity-90' : ''}`}>
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#079447] text-white shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-extrabold tracking-tight text-[#0b1a50]">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-600">{copy}</p>
        {to ? (
          <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#087f45] hover:underline">
            {action} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#087f45]">{action}</span>
        )}
      </div>
    </div>
  </article>
);

export default function Landing() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const loginHref = '/login?returnTo=%2F';
  const appHref = '/app';

  const faq = [
    {
      question: 'Do I need an account to use the RallyHub Club Directory?',
      answer: 'No. Anyone can browse public club listings, venues and contact information without creating a RallyHub account.'
    },
    {
      question: 'How do I add a club that is missing from the directory?',
      answer: 'Choose Create Your Club Listing, sign in so RallyHub can identify the submitter, and send the club details for review. Adding a directory listing does not create RallyHub Club access.'
    },
    {
      question: 'How can a club update its directory listing?',
      answer: 'Find the club, open its profile and choose Claim this listing. RallyHub reviews the representative before granting permission to edit that public listing.'
    },
    {
      question: 'Does RallyHub cover the whole island of Ireland?',
      answer: 'Yes. The directory is designed around all 32 counties of Ireland and supports club listings throughout the island.'
    }
  ];

  const seoData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RallyHub',
      url: SITE_URL,
      logo: LOGO_URL,
      email: 'rallyhubapp@gmail.com',
      areaServed: { '@type': 'Place', name: 'Ireland' },
      description: 'RallyHub helps players discover clubs, venues and sessions and gives authorised club representatives tools to maintain their public listing.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RallyHub',
      url: SITE_URL,
      inLanguage: 'en-IE',
      description: 'Find clubs and places to play across Ireland and beyond.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    }
  ];

  return (
    <>
      <Seo
        title="RallyHub | Play More. Connect Deeper. Belong Together."
        description="Find clubs, venues and sessions across Ireland and beyond. RallyHub helps stronger sporting communities connect."
        path="/"
        structuredData={seoData}
      />

      <div className="min-h-screen bg-white text-[#0b1a50]">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="RallyHub" className="h-11 w-11 object-contain sm:h-12 sm:w-12" />
              <div>
                <div className="text-[1.45rem] font-black leading-none tracking-tight sm:text-[1.65rem]">
                  Rally<span className="text-[#078a47]">Hub</span>
                </div>
                <div className="mt-1 text-[8px] font-bold tracking-[.25em] text-slate-600 sm:text-[9px]">PLAY • CONNECT • BELONG</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-semibold text-[#0b1a50] lg:flex">
              <Link to="/" className="hover:text-[#078a47]">Home</Link>
              <Link to="/directory" className="hover:text-[#078a47]">Directory</Link>
              <Link to="/directory" className="hover:text-[#078a47]">Clubs</Link>
              <Link to="/about" className="hover:text-[#078a47]">About</Link>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link to={isAuthenticated ? appHref : loginHref}>
                <Button variant="outline" className="border-slate-300 bg-white text-[#0b1a50] hover:bg-slate-50">
                  {isLoadingAuth ? 'Checking…' : isAuthenticated ? 'Open RallyHub' : 'Log in'}
                </Button>
              </Link>
              <Link to="/directory/add">
                <Button className="bg-[#078a47] text-white hover:bg-[#06763d]">Get Started</Button>
              </Link>
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#0b1a50] lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
              <div className="mx-auto flex max-w-7xl flex-col gap-1">
                <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-semibold hover:bg-slate-50">Home</Link>
                <Link to="/directory" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-semibold hover:bg-slate-50">Directory</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-semibold hover:bg-slate-50">About</Link>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link to={isAuthenticated ? appHref : loginHref} onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{isAuthenticated ? 'Open RallyHub' : 'Log in'}</Button>
                  </Link>
                  <Link to="/directory/add" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full bg-[#078a47] text-white hover:bg-[#06763d]">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-[#dce8e4] bg-[linear-gradient(120deg,#f7fcfb_0%,#eef9f4_45%,#e7f5fb_100%)]">
            <div className="absolute -right-32 top-8 h-96 w-96 rounded-full bg-[#b9ead1]/35 blur-3xl" />
            <div className="absolute left-[45%] top-12 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-16">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center rounded-full border border-[#bfe2d0] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#087f45] shadow-sm">
                  {directoryClubs.length} clubs listed in the RallyHub Directory
                </div>

                <h1 className="text-[2.75rem] font-black leading-[.98] tracking-[-0.045em] text-[#09184b] sm:text-6xl lg:text-[4.8rem]">
                  Play More
                  <span className="block">Connect <span className="text-[#087f45]">Deeper</span></span>
                  <span className="block text-[#0b5b59]">Belong Together</span>
                </h1>

                <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[#26385f] sm:text-lg">
                  RallyHub helps players find clubs, venues and sessions across Ireland and beyond — for every sport, at every level.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/directory">
                    <Button size="lg" className="w-full rounded-xl bg-[#079447] px-7 text-white hover:bg-[#067f3d] sm:w-auto">
                      <Search className="mr-2 h-5 w-5" /> Find a Club or Session
                    </Button>
                  </Link>
                  <Link to="/directory/add">
                    <Button size="lg" variant="outline" className="w-full rounded-xl border-slate-300 bg-white px-7 text-[#0b1a50] hover:bg-slate-50 sm:w-auto">
                      Create Your Club Listing
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Browse without signing in. One RallyHub account is used only when you need to manage an authorised listing or access an approved club area.
                </p>
              </div>

              <div className="relative min-h-[340px] overflow-hidden rounded-[2.2rem] border border-white/80 bg-[linear-gradient(135deg,#d8eef5_0%,#b9dfd0_45%,#72b4a1_100%)] shadow-[0_25px_70px_rgba(13,33,66,0.18)] sm:min-h-[420px]">
                <div className="absolute inset-0 opacity-55">
                  <div className="absolute left-[-5%] top-[20%] h-[2px] w-[110%] rotate-[-8deg] bg-white/80" />
                  <div className="absolute left-[14%] top-[-10%] h-[120%] w-[2px] rotate-[11deg] bg-white/60" />
                  <div className="absolute bottom-0 left-0 h-[46%] w-full bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(11,85,69,.42)_100%)]" />
                  <div className="absolute bottom-16 left-10 h-16 w-16 rounded-full bg-slate-200/90 blur-[1px]" />
                  <div className="absolute bottom-24 left-28 h-20 w-20 rounded-full bg-slate-200/70 blur-[1px]" />
                  <div className="absolute bottom-20 right-16 h-16 w-16 rounded-full bg-slate-200/80 blur-[1px]" />
                </div>

                <div className="absolute right-[17%] top-[10%] h-[70%] w-[33%] rotate-[13deg] rounded-[42%_42%_30%_30%] border-[3px] border-[#9be35b] bg-[#15251f] shadow-2xl">
                  <div className="absolute left-1/2 top-[28%] -translate-x-1/2 text-center">
                    <img src={LOGO_URL} alt="" className="mx-auto h-16 w-16 object-contain brightness-125 sm:h-20 sm:w-20" />
                    <div className="mt-2 text-[9px] font-semibold tracking-[.28em] text-white sm:text-[10px]">PLAY<br/>CONNECT<br/>BELONG</div>
                  </div>
                  <div className="absolute bottom-[-23%] left-1/2 h-[28%] w-[22%] -translate-x-1/2 rounded-b-3xl bg-[#13221d]" />
                </div>

                <div className="absolute bottom-[12%] right-[47%] h-16 w-16 rounded-full bg-[#d7ef35] shadow-[inset_-8px_-8px_0_rgba(111,142,0,.17),0_12px_20px_rgba(20,40,30,.2)] sm:h-20 sm:w-20">
                  <div className="absolute left-[22%] top-[24%] h-2 w-2 rounded-full bg-[#a9c81b]" />
                  <div className="absolute right-[22%] top-[40%] h-2 w-2 rounded-full bg-[#a9c81b]" />
                  <div className="absolute bottom-[23%] left-[42%] h-2 w-2 rounded-full bg-[#a9c81b]" />
                </div>

                <div className="absolute bottom-9 right-7 rotate-[-8deg] text-right font-[cursive] text-2xl font-bold leading-none text-white drop-shadow sm:text-3xl">
                  Good People<br/>Great Games
                  <div className="ml-auto mt-2 h-1.5 w-28 rotate-[-5deg] rounded-full bg-[#91d83a]" />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureCard
                icon={Search}
                title="Find Clubs"
                copy="Discover clubs, venues and sessions near you."
                action="Search Directory"
                to="/directory"
              />
              <FeatureCard
                icon={CalendarDays}
                title="Join Events"
                copy="See what clubs are running and find the right place to play."
                action="Browse Clubs"
                to="/directory"
              />
              <FeatureCard
                icon={Users}
                title="Manage Your Club"
                copy="Claim or create your public club listing and keep it current."
                action="Get Started"
                to="/directory?manage=1"
              />
              <FeatureCard
                icon={BarChart3}
                title="Play, Track, Progress"
                copy="RallyHub Club is still under development and will be released separately."
                action="In development"
                muted
              />
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-0 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-t-[2rem] bg-[linear-gradient(145deg,#d8eee4_0%,#8dc6b3_35%,#176b73_68%,#0c4c68_100%)] px-6 py-9 text-white sm:px-10 sm:py-11">
              <div className="absolute -bottom-16 left-[-4%] h-40 w-[58%] rounded-[50%] bg-[#3d7f52]/70" />
              <div className="absolute -bottom-10 left-[30%] h-32 w-[45%] rounded-[50%] bg-[#7aa66b]/55" />
              <div className="absolute right-[-6%] top-[14%] h-36 w-[42%] rounded-[48%] bg-[#d8eadb]/45" />
              <div className="relative grid items-end gap-6 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="font-[cursive] text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl">Cliffs of Moher</div>
                  <div className="mt-1 text-sm font-semibold">County Clare, A Healthier, Happier Ireland</div>
                  <div className="mt-3 h-1.5 w-40 rotate-[-3deg] rounded-full bg-[#92d83b]" />
                </div>
                <div className="font-[cursive] text-3xl font-bold sm:text-4xl">People · Places · Play</div>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-b-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Users, 'People', 'Build connections'],
                [MapPin, 'Places', 'Find your club'],
                [CalendarDays, 'Sessions', 'Play more'],
                [Users, 'Community', 'Belong together']
              ].map(([Icon,title,copy]) => (
                <div key={title} className="bg-[#063a56] px-5 py-5 text-center text-white">
                  <Icon className="mx-auto h-6 w-6" />
                  <div className="mt-2 font-bold">{title}</div>
                  <div className="text-xs text-white/75">{copy}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 rounded-[2rem] border border-[#dce8e4] bg-[#f8fcfa] p-7 sm:p-10 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <div className="font-[cursive] text-3xl font-bold text-[#0b1a50]">Stronger Sporting Communities Together</div>
                <div className="mt-3 h-1.5 w-44 rotate-[-3deg] rounded-full bg-[#91d83a]" />
                <h2 className="mt-7 text-3xl font-black tracking-tight text-[#0b1a50]">One platform. Many sports. One community.</h2>
                <p className="mt-4 leading-7 text-slate-600">
                  RallyHub is being designed to support clubs and communities across pickleball, tennis, badminton, padel and more, while keeping the public Directory simple and useful today.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  ['●','Pickleball'],
                  ['◉','Tennis'],
                  ['✦','Badminton'],
                  ['◈','Padel'],
                  ['●●','And more']
                ].map(([mark,label]) => (
                  <div key={label} className="rounded-2xl border border-[#dce8e4] bg-white px-3 py-4 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d9f2e4] text-xl font-black text-[#078a47]">{mark}</div>
                    <div className="mt-2 text-xs font-bold text-[#0b1a50]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#0b1a50] sm:text-4xl">RallyHub Directory FAQ</h2>
              <p className="mt-3 text-slate-600">Straight answers about finding, adding and managing club listings.</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faq.map(item => (
                <article key={item.question} className="rounded-2xl border border-[#dce8e4] bg-white p-5 shadow-[0_10px_28px_rgba(13,33,66,0.05)]">
                  <h3 className="font-extrabold text-[#0b1a50]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 bg-[#f7faf9]">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="RallyHub" className="h-11 w-11 object-contain" />
                <div>
                  <div className="font-black text-[#0b1a50]">RallyHub</div>
                  <div className="text-[9px] font-bold tracking-[.23em] text-slate-500">PLAY • CONNECT • BELONG</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-[#0b1a50]">
                <Link to="/directory" className="hover:text-[#078a47]">Directory</Link>
                <Link to="/directory/story" className="hover:text-[#078a47]">Why RallyHub Directory</Link>
                <Link to="/directory/help" className="hover:text-[#078a47]">Club Guide</Link>
                <Link to="/about" className="hover:text-[#078a47]">About</Link>
                <Link to="/contact" className="hover:text-[#078a47]">Contact</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
