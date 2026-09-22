import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import Seo, { SITE_URL } from '@/components/public/Seo';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
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
    to: '/directory',
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
        title="RallyHub | Play More. Connect Deeper. Belong Together."
        description="RallyHub helps players find clubs, venues and events across Ireland and beyond — for every sport, at every level."
        path="/"
        structuredData={structuredData}
      />

      <div className="min-h-screen overflow-x-hidden bg-white text-[#07184c]">
        <header className="relative z-50 border-b border-[#e7edef] bg-white">
          <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="RallyHub" className="h-[48px] w-[48px] object-contain sm:h-[52px] sm:w-[52px]" />
              <div>
                <div className="text-[1.7rem] font-black leading-[.88] tracking-[-.045em] text-[#081342] sm:text-[2rem]">
                  Rally<span className="text-[#078e48]">Hub</span>
                </div>
                <div className="mt-1.5 text-[7px] font-bold tracking-[.3em] text-[#0c1e53] sm:text-[8px]">
                  PLAY <span className="text-[#0b914a]">•</span> CONNECT <span className="text-[#0b914a]">•</span> BELONG
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-[27px] text-[12px] font-semibold text-[#0d2258] lg:flex">
              <Link to="/" className="hover:text-[#078e48]">Home</Link>
              <Link to="/directory" className="hover:text-[#078e48]">Directory</Link>
              <Link to="/directory" className="hover:text-[#078e48]">Clubs</Link>
              <Link to="/directory" className="hover:text-[#078e48]">Events</Link>
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
                {[['Home','/'],['Directory','/directory'],['Clubs','/directory'],['Events','/directory'],['About','/about']].map(([label,to])=>(
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
                    Play More
                    <span className="block">Connect <span className="text-[#078e48]">Deeper</span></span>
                    <span className="block text-[#0a5e5b]">Belong Together</span>
                  </h1>
                  <p className="mt-4 max-w-[88%] text-[14px] font-medium leading-[1.5] text-[#172b5c] sm:max-w-[570px] sm:text-[16px]">
                    RallyHub helps players find clubs, venues and events across Ireland and beyond — for every sport, at every level.
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

          <section className="relative bg-white">
            <div className="mx-auto max-w-[1380px] px-0">
              <div className="relative hidden aspect-[6.15/1] overflow-hidden md:block">
                <div className="h-full w-[41%]">
                  <img
                    src={FOOTER_PHOTO}
                    alt="Pickleball players enjoying time together on court"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="absolute inset-y-0 right-0 w-[61.5%] rounded-tl-[54px] bg-[#053c56]">
                  <div className="grid h-full grid-cols-4 items-center text-center text-white">
                    {[
                      [Users,'People','Build connections'],
                      [MapPin,'Places','Find your club'],
                      [CalendarDays,'Sessions','Play more'],
                      [Trophy,'Community','Belong together'],
                    ].map(([Icon,title,copy])=>(
                      <div key={title} className="px-2">
                        <Icon className="mx-auto h-6 w-6"/>
                        <div className="mt-1 text-[13px] font-bold">{title}</div>
                        <div className="text-[10px] text-white/75">{copy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden md:hidden">
                <img
                  src={FOOTER_PHOTO}
                  alt="Pickleball players enjoying time together on court"
                  className="block h-[210px] w-full object-cover object-center sm:h-[250px]"
                />
                <div className="relative -mt-9 rounded-tl-[48px] bg-[#053c56] pt-9 text-white">
                  <div className="grid grid-cols-2 text-center sm:grid-cols-4">
                    {[
                      [Users,'People','Build connections'],
                      [MapPin,'Places','Find your club'],
                      [CalendarDays,'Sessions','Play more'],
                      [Trophy,'Community','Belong together'],
                    ].map(([Icon,title,copy])=>(
                      <div key={title} className="px-3 py-5 sm:px-2 sm:py-6">
                        <Icon className="mx-auto h-6 w-6"/>
                        <div className="mt-1 text-[13px] font-bold">{title}</div>
                        <div className="text-[10px] text-white/75">{copy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
