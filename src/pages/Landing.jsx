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
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { directoryClubs } from '@/data/directorySeed';
import Seo, { SITE_URL } from '@/components/public/Seo';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
const HERO_PHOTO = 'https://images.unsplash.com/photo-1761644563005-87071f6485a6?auto=format&fit=crop&fm=jpg&q=84&w=2200';
const CLIFFS_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/CliffsOfMoher_Panorama.jpg';

const featureCards = [
  {
    icon: Search,
    title: 'Find Clubs',
    copy: 'Discover clubs, venues and sessions near you.',
    action: 'Search Directory',
    to: '/directory',
  },
  {
    icon: CalendarDays,
    title: 'Join Events',
    copy: 'See what’s on and get involved.',
    action: 'Browse Events',
    to: '/directory',
  },
  {
    icon: Users,
    title: 'Manage Your Club',
    copy: 'Create and edit your club listing.',
    action: 'Get Started',
    to: '/directory?manage=1',
  },
  {
    icon: BarChart3,
    title: 'Play, Track, Progress',
    copy: 'Take part, record your games and be part of a growing community.',
    action: 'Learn More',
    to: '/about',
  },
];

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const loginTarget = isAuthenticated ? '/app' : '/login?returnTo=%2F';

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
      description: 'Find clubs, venues and sessions across Ireland and beyond.'
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

      <div className="min-h-screen bg-[#f8fbfb] text-[#08184d]">
        <header className="relative z-50 border-b border-[#e4ebed] bg-white">
          <div className="mx-auto flex h-[78px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="RallyHub" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
              <div className="leading-none">
                <div className="text-[1.65rem] font-black tracking-[-0.045em] text-[#08123f] sm:text-[2rem]">
                  Rally<span className="text-[#079247]">Hub</span>
                </div>
                <div className="mt-1.5 text-[8px] font-bold tracking-[.31em] text-[#13235a] sm:text-[9px]">
                  PLAY <span className="text-[#079247]">•</span> CONNECT <span className="text-[#079247]">•</span> BELONG
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#10235a] lg:flex">
              <Link to="/" className="text-[#079247]">Home</Link>
              <Link to="/directory" className="transition hover:text-[#079247]">Directory</Link>
              <Link to="/directory" className="transition hover:text-[#079247]">Clubs</Link>
              <a href="#events" className="transition hover:text-[#079247]">Events</a>
              <Link to="/about" className="transition hover:text-[#079247]">About</Link>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/directory" aria-label="Search directory" className="mr-1 rounded-full p-2.5 text-[#092052] transition hover:bg-slate-50">
                <Search className="h-5 w-5" />
              </Link>
              <Link to={loginTarget}>
                <Button variant="outline" className="h-10 rounded-lg border-[#cfd9df] bg-white px-5 font-bold text-[#0a2150] hover:bg-slate-50">
                  {isLoadingAuth ? 'Checking…' : isAuthenticated ? 'Open RallyHub' : 'Log in'}
                </Button>
              </Link>
              <Link to="/directory/add">
                <Button className="h-10 rounded-lg bg-[#078d48] px-5 font-bold text-white shadow-[0_7px_18px_rgba(7,141,72,.18)] hover:bg-[#067a3f]">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMenuOpen(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#092052] lg:hidden"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-[#e6ecef] bg-white px-4 py-4 lg:hidden">
              <div className="mx-auto max-w-[1380px] space-y-1">
                {[
                  ['Home','/'],
                  ['Directory','/directory'],
                  ['Clubs','/directory'],
                  ['About','/about'],
                ].map(([label,to]) => (
                  <Link key={label} to={to} onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 font-semibold text-[#0a2150] hover:bg-[#f4faf7]">
                    {label}<ChevronRight className="h-4 w-4 text-[#078d48]" />
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to={loginTarget} onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">{isAuthenticated ? 'Open RallyHub' : 'Log in'}</Button></Link>
                  <Link to="/directory/add" onClick={() => setMenuOpen(false)}><Button className="w-full bg-[#078d48] text-white hover:bg-[#067a3f]">Get Started</Button></Link>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
          <section className="relative overflow-hidden bg-white">
            <div className="mx-auto grid min-h-[510px] max-w-[1380px] lg:grid-cols-[52%_48%]">
              <div className="relative z-20 flex items-center px-5 py-12 sm:px-8 lg:px-12 lg:py-14 xl:px-16">
                <div className="max-w-[660px]">
                  <h1 className="text-[3rem] font-black leading-[.96] tracking-[-0.05em] text-[#071342] sm:text-[4.1rem] xl:text-[5rem]">
                    Play More
                    <span className="block">Connect <span className="text-[#078f49]">Deeper</span></span>
                    <span className="block text-[#0b5f5b]">Belong Together</span>
                  </h1>

                  <p className="mt-5 max-w-[610px] text-[1rem] font-medium leading-7 text-[#1e315f] sm:text-[1.08rem]">
                    RallyHub helps players find clubs, venues and events across Ireland and beyond — for every sport, at every level.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link to="/directory">
                      <Button className="h-12 w-full rounded-lg bg-[#079447] px-7 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(7,148,71,.22)] hover:bg-[#067f3d] sm:w-auto">
                        <Search className="mr-2 h-5 w-5" /> Find a Club or Session
                      </Button>
                    </Link>
                    <Link to="/directory/add">
                      <Button variant="outline" className="h-12 w-full rounded-lg border-[#b8c8d1] bg-white px-7 text-[15px] font-bold text-[#10235a] hover:bg-[#f8fbfb] sm:w-auto">
                        Create Your Club Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[390px] overflow-hidden lg:min-h-[510px]">
                <img
                  src={HERO_PHOTO}
                  alt="Players enjoying pickleball"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.96)_0%,rgba(255,255,255,.54)_14%,rgba(255,255,255,0)_38%)] lg:-left-1" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,18,46,.02)_0%,rgba(5,18,46,.08)_100%)]" />

                <div className="absolute right-[8%] top-[8%] h-[72%] w-[37%] rotate-[14deg] rounded-[42%_42%_30%_30%] border-[4px] border-[#99de55] bg-[linear-gradient(150deg,#26372f_0%,#101d18_72%)] shadow-[0_24px_38px_rgba(0,0,0,.38)] sm:right-[10%] sm:w-[34%] lg:right-[12%]">
                  <div className="absolute left-1/2 top-[27%] -translate-x-1/2 text-center">
                    <img src={LOGO_URL} alt="" className="mx-auto h-16 w-16 object-contain brightness-125 sm:h-20 sm:w-20" />
                    <div className="mt-3 text-[9px] font-semibold tracking-[.26em] text-white sm:text-[10px]">
                      PLAY<br/>CONNECT<br/>BELONG
                    </div>
                  </div>
                  <div className="absolute bottom-[-21%] left-1/2 h-[27%] w-[21%] -translate-x-1/2 rounded-b-[16px] bg-[linear-gradient(90deg,#12231d,#26362f,#0c1713)] shadow-lg" />
                </div>

                <div className="absolute bottom-[10%] left-[17%] h-[76px] w-[76px] rounded-full bg-[radial-gradient(circle_at_32%_26%,#efff52_0%,#d9ee28_52%,#adc914_100%)] shadow-[0_14px_26px_rgba(0,0,0,.25)] sm:h-[92px] sm:w-[92px]">
                  {[['24%','25%'],['62%','20%'],['42%','52%'],['68%','64%'],['25%','70%']].map(([l,t],i)=>(
                    <span key={i} className="absolute h-2.5 w-2.5 rounded-full bg-[#a2bc17]/75 shadow-inner" style={{left:l,top:t}} />
                  ))}
                </div>

                <div className="absolute bottom-[8%] right-[6%] -rotate-6 text-right text-[2.1rem] font-bold leading-[.9] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.7)] sm:text-[2.5rem]" style={{fontFamily:"'Caveat', cursive"}}>
                  Good People<br/>Great Games
                  <div className="ml-auto mt-2 h-1.5 w-32 -rotate-6 rounded-full bg-[#8fda39]" />
                </div>
              </div>
            </div>
          </section>

          <section id="events" className="bg-white">
            <div className="mx-auto grid max-w-[1380px] gap-4 px-5 pb-8 pt-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12 xl:px-16">
              {featureCards.map(({icon:Icon,title,copy,action,to}) => (
                <Link key={title} to={to} className="group rounded-2xl border border-[#dfe8ea] bg-white p-5 shadow-[0_10px_28px_rgba(8,24,77,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(8,24,77,.09)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#079447] text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-[1.05rem] font-extrabold text-[#08184d]">{title}</h2>
                      <p className="mt-1 text-sm leading-5 text-[#45567b]">{copy}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#087e45]">
                        {action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12 xl:px-16">
              <div className="relative h-[158px] overflow-hidden rounded-t-[8px]">
                <img src={CLIFFS_PHOTO} alt="Cliffs of Moher, County Clare" className="absolute inset-0 h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.08)_0%,rgba(255,255,255,.12)_58%,rgba(4,61,83,.6)_100%)]" />
                <div className="absolute left-[22%] top-4 -rotate-3 text-[2rem] font-bold leading-[.95] text-[#0b214e] drop-shadow-[0_1px_2px_rgba(255,255,255,.9)] sm:left-[26%] sm:text-[2.35rem]" style={{fontFamily:"'Caveat', cursive"}}>
                  Cliffs of Moher
                  <div className="text-[1rem] sm:text-[1.25rem]">County Clare, A Healthier, Happier Ireland</div>
                  <div className="mt-1.5 h-1.5 w-44 -rotate-3 rounded-full bg-[#91d83a]" />
                </div>
              </div>

              <div className="grid overflow-hidden rounded-b-[8px] bg-[#073b56] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [Users,'People','Build connections'],
                  [MapPin,'Places','Find your club'],
                  [CalendarDays,'Sessions','Play more'],
                  [Trophy,'Community','Belong together'],
                ].map(([Icon,title,copy])=>(
                  <div key={title} className="flex items-center justify-center gap-3 border-white/10 px-5 py-5 text-white sm:border-r">
                    <Icon className="h-6 w-6 shrink-0" />
                    <div>
                      <div className="font-bold">{title}</div>
                      <div className="text-xs text-white/70">{copy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
              <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#dfe8ea] bg-[#fbfdfc] px-6 py-7 text-center md:flex-row md:text-left">
                <div>
                  <div className="text-[2.1rem] font-bold leading-none text-[#0d2a55]" style={{fontFamily:"'Caveat', cursive"}}>Stronger Sporting Communities Together</div>
                  <div className="mt-2 h-1.5 w-44 -rotate-3 rounded-full bg-[#91d83a]" />
                </div>
                <div className="text-lg font-extrabold leading-6 text-[#0b1a50]">One Platform<br/>Many Sports<br/>Stronger Communities</div>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    ['●','Pickleball'],['◉','Tennis'],['✦','Badminton'],['◈','Padel'],['●●','And more']
                  ].map(([mark,label])=>(
                    <div key={label} className="text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#d9f2e4] text-base font-black text-[#078d48]">{mark}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#0b1a50]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#f7faf9] py-14">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-[#0b1a50]">RallyHub Directory FAQ</h2>
                <p className="mt-2 text-sm text-slate-600">Straight answers about finding, adding and managing club listings.</p>
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {faq.map(item => (
                  <article key={item.question} className="rounded-2xl border border-[#dfe8ea] bg-white p-5 shadow-[0_8px_20px_rgba(8,24,77,.04)]">
                    <h3 className="font-extrabold text-[#0b1a50]">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-5 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left lg:px-12 xl:px-16">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="RallyHub" className="h-10 w-10 object-contain" />
                <div>
                  <div className="font-black text-[#08184d]">RallyHub</div>
                  <div className="text-[8px] font-bold tracking-[.28em] text-[#485879]">PLAY • CONNECT • BELONG</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-[#0b1a50]">
                <Link to="/directory">Directory</Link>
                <Link to="/directory/story">Why RallyHub Directory</Link>
                <Link to="/directory/help">Club Guide</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
