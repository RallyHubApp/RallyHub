import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Menu,
  Search,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import Seo, { SITE_URL } from '@/components/public/Seo';
import { RALLYHUB_BRAND } from '@/lib/rallyhubBrand';

const HERO_PHOTO = '/assets/rallyhub-home-hero.webp';
const FOOTER_PHOTO = '/assets/rallyhub-home-footer-pickleball.webp';

const features = [
  {
    icon: Search,
    title: 'Find Clubs',
    description: 'Discover clubs, venues and sessions near you.',
    action: 'Search Directory',
    to: '/directory',
  },
  {
    icon: CalendarDays,
    title: 'Join Events',
    description: 'See what’s on and get involved.',
    action: 'Browse Events',
    to: '/events',
  },
  {
    icon: Users,
    title: 'Manage Your Club',
    description: 'Create and edit your club listing.',
    action: 'Get Started',
    to: '/directory?manage=1',
  },
  {
    icon: BarChart3,
    title: 'Play, Track, Progress',
    description: 'Take part, record your games and be part of a growing community.',
    action: 'Learn More',
    to: '/about',
  },
];

function FeatureCard({ icon: Icon, title, description, action, to }) {
  return (
    <Link to={to} className="group block">
      <article className="h-full rounded-[15px] border border-[#dbe6e8] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(13,33,66,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(13,33,66,.08)]">
        <div className="flex items-start gap-4 lg:block">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#07964a] text-white lg:mb-3">
            <Icon className="h-6 w-6" strokeWidth={2.5}/>
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold tracking-[-0.02em] text-[#07184c] lg:text-[17px]">{title}</h2>
            <p className="mt-1 text-[13px] leading-[1.35] text-[#34466d]">{description}</p>
            <span className="mt-3 hidden items-center gap-1 text-[12px] font-bold text-[#077d43] lg:inline-flex">
              {action}<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"/>
            </span>
          </div>
          <ChevronRight className="ml-auto mt-2 h-5 w-5 shrink-0 text-[#078d48] lg:hidden"/>
        </div>
      </article>
    </Link>
  );
}

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerImageReady, setFooterImageReady] = useState(false);
  const loginTarget = isAuthenticated ? '/app' : '/login?returnTo=%2F';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RallyHub',
      url: SITE_URL,
      logo: LOGO_URL,
      email: 'rallyhubapp@gmail.com',
      description: 'RallyHub helps players find clubs, venues and events across Ireland and beyond.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RallyHub',
      url: SITE_URL,
      inLanguage: 'en-IE'
    }
  ];

  return (
    <>
      <Seo
        title="Pickleball Clubs, Events & Club Management | RallyHub Ireland"
        description="Find pickleball clubs, venues, sessions and events across Ireland. Discover where to play and connect with players. Run a club? Get discovered, grow membership and deliver better tournaments."
        socialTitle="RallyHub | Your Next Game Starts Here."
        socialDescription="Discover where to play, find your next event and connect with Ireland's growing pickleball community. Running a club? Get discovered, grow your membership and deliver better tournaments."
        path="/"
        structuredData={structuredData}
      />

      <div className="min-h-screen overflow-x-hidden bg-white text-[#07184c]">
        <header className="relative z-50 border-b border-[#e7edef] bg-white">
          <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={RALLYHUB_BRAND.withSignature} alt="RallyHub — Play Connect Belong" className="h-[56px] w-[205px] object-contain sm:w-[225px]" />
            </Link>

            <nav className="hidden items-center gap-[27px] text-[12px] font-semibold text-[#0d2258] lg:flex">
              <Link to="/" className="hover:text-[#078e48]">Home</Link>
              <Link to="/directory" className="hover:text-[#078e48]">Directory</Link>
              <Link to="/directory" className="hover:text-[#078e48]">Clubs</Link>
              <Link to="/events" className="hover:text-[#078e48]">Events</Link>
              <Link to="/about" className="hover:text-[#078e48]">About</Link>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/directory" className="mr-1 rounded-full p-2 text-[#0b2258]" aria-label="Search"><Search className="h-5 w-5"/></Link>
              <Link to={loginTarget}>
                <Button variant="outline" className="h-10 rounded-lg border-[#cbd7dc] bg-white px-5 text-[13px] font-bold text-[#0c2257] hover:bg-[#f7faf9]">
                  {isLoadingAuth ? 'Checking…' : isAuthenticated ? 'Open RallyHub' : 'Log in'}
                </Button>
              </Link>
              <Link to="/directory/add">
                <Button className="h-10 rounded-lg bg-[#078e48] px-5 text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(7,142,72,.18)] hover:bg-[#067b3f]">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMenuOpen(v => !v)}
              className="flex h-10 items-center gap-2 px-1 text-[#092152] lg:hidden"
            >
              <Search className="hidden h-5 w-5 sm:block"/>
              {menuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
              <span className="hidden text-sm font-semibold sm:inline">Menu</span>
            </button>
          </div>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full border-t border-[#e8edef] bg-white px-4 py-4 shadow-xl lg:hidden">
              <div className="mx-auto max-w-[1380px] space-y-1">
                {[['Home','/'],['Directory','/directory'],['Clubs','/directory'],['Events','/events'],['About','/about']].map(([label,to])=>(
                  <Link key={label} to={to} onClick={()=>setMenuOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-3 font-semibold text-[#0c2257] hover:bg-[#f4faf7]">
                    {label}<ChevronRight className="h-4 w-4 text-[#078e48]"/>
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to={loginTarget} onClick={()=>setMenuOpen(false)}><Button variant="outline" className="w-full">{isAuthenticated ? 'Open RallyHub' : 'Log in'}</Button></Link>
                  <Link to="/directory/add" onClick={()=>setMenuOpen(false)}><Button className="w-full bg-[#078e48] text-white hover:bg-[#067b3f]">Get Started</Button></Link>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
          <section className="relative overflow-hidden bg-[#f7fcfd]">
            <div className="relative mx-auto max-w-[1380px] lg:grid lg:grid-cols-[51%_49%] lg:items-stretch">
              <div className="relative z-20 flex min-h-[370px] items-start px-5 pb-8 pt-7 sm:min-h-[430px] sm:items-center sm:px-7 sm:py-10 lg:min-h-0 lg:px-10 lg:py-12 xl:px-12">
                <div className="max-w-[620px]">
                  <h1 className="max-w-[92%] text-[2.35rem] font-black leading-[.98] tracking-[-.047em] text-[#061545] min-[380px]:text-[2.55rem] sm:max-w-[620px] sm:text-[3.65rem] lg:text-[4.2rem] xl:text-[4.45rem]">
                    Find Pickleball.
                    <span className="block">Play <span className="text-[#078e48]">Pickleball.</span></span>
                    <span className="block text-[#0a5e5b]">Run Pickleball.</span>
                  </h1>
                  <p className="mt-3 text-[12px] font-bold uppercase tracking-[.08em] text-[#0a5e5b] sm:text-[13px]">Ireland's Pickleball Directory &amp; Club Management Platform</p>
                  <p className="mt-2 text-[13px] font-extrabold leading-snug text-[#07184c] sm:text-[15px]">Better Tournaments. Happier Players. Stronger Community.</p>
                  <p className="mt-4 max-w-[88%] text-[14px] font-medium leading-[1.5] text-[#172b5c] sm:max-w-[570px] sm:text-[16px]">
                    Discover where to play, find your next event and connect with Ireland's growing pickleball community. Running a club? Get discovered, grow your membership and deliver better tournaments.
                  </p>
                  <div className="mt-5 flex max-w-[94%] flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row">
                    <Link to="/directory">
                      <Button className="h-11 w-full rounded-lg bg-[#078f49] px-6 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(7,143,73,.2)] hover:bg-[#067c40] sm:w-auto">
                        <Search className="mr-2 h-5 w-5"/> Find a Club or Session
                      </Button>
                    </Link>
                    <Link to="/directory/add">
                      <Button variant="outline" className="h-11 w-full rounded-lg border-[#b9cbd3] bg-white/95 px-6 text-[13px] font-bold text-[#0a2152] hover:bg-white sm:w-auto">
                        Create Your Club Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <img
                  src={HERO_PHOTO}
                  alt="Pickleball paddle and ball with players on court"
                  className="block h-auto w-full"
                />
              </div>

              <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[58%] overflow-hidden sm:w-[55%] lg:hidden">
                <img src={HERO_PHOTO} alt="" className="h-full w-full object-cover object-center opacity-95" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7fcfd_0%,rgba(247,252,253,.98)_28%,rgba(247,252,253,.92)_48%,rgba(247,252,253,.58)_70%,rgba(247,252,253,0)_100%)] sm:bg-[linear-gradient(90deg,#f7fcfd_0%,rgba(247,252,253,.96)_24%,rgba(247,252,253,.78)_50%,rgba(247,252,253,.35)_72%,rgba(247,252,253,0)_100%)]"/>
              </div>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto grid max-w-[1380px] gap-3 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4 lg:px-10 xl:px-12">
              {features.map(feature => <FeatureCard key={feature.title} {...feature}/>)}
            </div>
          </section>

          <footer
            aria-label="RallyHub homepage footer"
            className={footerImageReady
              ? "bg-[#053c56] text-white opacity-100 transition-opacity duration-200"
              : "bg-[#053c56] text-white opacity-0 transition-opacity duration-200"}
          >
            <div className="mx-auto flex max-w-[1380px] flex-col px-5 sm:px-7 md:min-h-[188px] md:flex-row lg:px-10 xl:px-12">
              <div className="h-[118px] w-full overflow-hidden sm:h-[145px] md:h-auto md:w-[38%] md:shrink-0">
                <img
                  src={FOOTER_PHOTO}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setFooterImageReady(true)}
                  onError={() => setFooterImageReady(true)}
                  alt="Pickleball players enjoying time together on court"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between px-5 py-4 sm:px-7 md:px-9 md:py-5 lg:px-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <Link to="/" aria-label="RallyHub home" className="w-fit shrink-0">
                    <img src={RALLYHUB_BRAND.reversedWithSignature} alt="RallyHub · Play Connect Belong" className="h-[72px] w-[220px] max-w-full object-contain sm:w-[245px]" />
                  </Link>
                  <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold text-white/90">
                    <Link to="/directory" className="rounded-sm hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Directory</Link>
                    <Link to="/events" className="rounded-sm hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Events</Link>
                    <Link to="/directory/help" className="rounded-sm hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Club Guide</Link>
                    <Link to="/about" className="rounded-sm hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">About</Link>
                    <Link to="/contact" className="rounded-sm hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Contact</Link>
                  </nav>
                </div>
                <div className="mt-4 border-t border-white/15 pt-3 text-[11px] text-white/70">
                  © 2026 RallyHub. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
