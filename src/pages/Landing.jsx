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
const HERO_PHOTO = 'https://preview-assets-us-01.kc-usercontent.com/b3c539fb-5388-0052-9b2c-d05615ca0363/b4eb3039-3714-4632-8fb7-cb0256f4dc55/cru-pickleball-players-1920x1080.webp';
const CLIFFS_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/CliffsOfMoher_Panorama.jpg';

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

function PaddleGraphic() {
  return (
    <div className="absolute right-[5.2%] top-[7%] h-[78%] w-[38%] max-w-[340px] rotate-[13deg] sm:right-[8%] lg:right-[5%] xl:right-[7%]">
      <svg viewBox="0 0 280 450" className="h-full w-full overflow-visible drop-shadow-[0_18px_18px_rgba(0,0,0,.32)]" aria-hidden="true">
        <defs>
          <linearGradient id="paddleFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#27352f" />
            <stop offset="58%" stopColor="#17241f" />
            <stop offset="100%" stopColor="#0e1713" />
          </linearGradient>
          <linearGradient id="handle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a100d" />
            <stop offset="50%" stopColor="#29332e" />
            <stop offset="100%" stopColor="#090e0c" />
          </linearGradient>
        </defs>
        <path d="M76 20 C35 30 10 67 10 112 L10 265 C10 304 36 337 75 345 L110 352 L110 414 C110 434 122 447 140 447 C158 447 170 434 170 414 L170 352 L205 345 C244 337 270 304 270 265 L270 112 C270 67 245 30 204 20 C167 11 113 11 76 20 Z" fill="url(#paddleFace)" stroke="#9ADD55" strokeWidth="5"/>
        <rect x="114" y="344" width="52" height="80" rx="14" fill="url(#handle)" />
        <g transform="translate(140 150)">
          <circle r="48" fill="none" stroke="#aef23c" strokeWidth="6" opacity=".95"/>
          <circle r="34" fill="none" stroke="#aef23c" strokeWidth="5" opacity=".9"/>
          <circle r="20" fill="#aef23c" opacity=".95"/>
          <path d="M-33 34 L-55 58" stroke="#aef23c" strokeWidth="13" strokeLinecap="round"/>
          <path d="M-46 48 L-61 65" stroke="#aef23c" strokeWidth="13" strokeLinecap="round"/>
        </g>
        <text x="140" y="227" textAnchor="middle" fill="white" fontSize="15" fontWeight="600" letterSpacing="4">PLAY</text>
        <text x="140" y="251" textAnchor="middle" fill="white" fontSize="15" fontWeight="600" letterSpacing="4">CONNECT</text>
        <text x="140" y="275" textAnchor="middle" fill="white" fontSize="15" fontWeight="600" letterSpacing="4">BELONG</text>
      </svg>
    </div>
  );
}

function Pickleball() {
  const holes = [
    [25, 24],[52, 18],[72, 33],[32, 50],[60, 55],[78, 69],[22, 76],[49, 82]
  ];
  return (
    <div className="absolute bottom-[7%] right-[38%] h-[86px] w-[86px] rounded-full bg-[radial-gradient(circle_at_31%_24%,#f4ff5a_0%,#def02d_52%,#aec710_100%)] shadow-[0_15px_25px_rgba(0,0,0,.28)] sm:h-[96px] sm:w-[96px]">
      {holes.map(([l,t],i)=><span key={i} className="absolute h-[10px] w-[10px] rounded-full bg-[#9db516]/70 shadow-inner" style={{left:`${l}%`,top:`${t}%`}} />)}
    </div>
  );
}

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

      <div className="min-h-screen bg-white text-[#07184c]">
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
            <div className="absolute inset-0">
              <img src={HERO_PHOTO} alt="" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#f8fcfd_0%,#f8fcfd_35%,rgba(248,252,253,.92)_45%,rgba(248,252,253,.56)_58%,rgba(248,252,253,.08)_74%,rgba(248,252,253,0)_100%)]"/>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.03)_0%,rgba(7,45,62,.05)_100%)]"/>
            </div>

            <div className="relative mx-auto min-h-[405px] max-w-[1380px] px-5 py-9 sm:px-7 sm:py-10 lg:min-h-[425px] lg:px-10 xl:px-12">
              <div className="relative z-20 max-w-[620px]">
                <h1 className="text-[2.8rem] font-black leading-[.98] tracking-[-.047em] text-[#061545] sm:text-[3.65rem] lg:text-[4.2rem] xl:text-[4.45rem]">
                  Play More
                  <span className="block">Connect <span className="text-[#078e48]">Deeper</span></span>
                  <span className="block text-[#0a5e5b]">Belong Together</span>
                </h1>
                <p className="mt-4 max-w-[570px] text-[15px] font-medium leading-[1.55] text-[#172b5c] sm:text-[16px]">
                  RallyHub helps players find clubs, venues and events across Ireland and beyond — for every sport, at every level.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

              <PaddleGraphic/>
              <Pickleball/>
              <div className="absolute bottom-[7%] right-[2.5%] z-20 -rotate-6 text-right text-[1.8rem] font-bold leading-[.9] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,.75)] sm:right-[4%] sm:text-[2.2rem]" style={{fontFamily:"'Caveat', cursive"}}>
                Good<br/>People<br/>Great Games
                <div className="ml-auto mt-2 h-1.5 w-28 -rotate-6 rounded-full bg-[#91d83a]"/>
              </div>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto grid max-w-[1380px] gap-3 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4 lg:px-10 xl:px-12">
              {features.map(feature => <FeatureCard key={feature.title} {...feature}/>)}
            </div>
          </section>

          <section className="relative bg-white">
            <div className="mx-auto max-w-[1380px] px-0 sm:px-7 lg:px-10 xl:px-12">
              <div className="relative h-[132px] overflow-hidden sm:h-[142px]">
                <img src={CLIFFS_PHOTO} alt="Cliffs of Moher, County Clare" className="absolute inset-0 h-full w-full object-cover object-center"/>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.04)_0%,rgba(255,255,255,.05)_48%,rgba(4,54,76,.1)_100%)]"/>
                <div className="absolute left-[28%] top-[8px] -rotate-3 text-[1.7rem] font-bold leading-[.88] text-[#0a2754] drop-shadow-[0_1px_2px_rgba(255,255,255,.95)] sm:left-[24%] sm:text-[2rem] lg:left-[22%]" style={{fontFamily:"'Caveat', cursive"}}>
                  Cliffs of Moher
                  <div className="mt-1 text-[.82rem] sm:text-[1rem]">County Clare, A Healthier, Happier Ireland</div>
                  <div className="ml-14 mt-1 h-[4px] w-28 -rotate-3 rounded-full bg-[#8fd837] sm:w-36"/>
                </div>

                <div className="absolute bottom-0 right-0 hidden h-[98px] w-[61%] rounded-tl-[92px] bg-[#053c56] lg:block">
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

              <div className="grid bg-[#053c56] text-white sm:grid-cols-4 lg:hidden">
                {[
                  [Users,'People','Build connections'],
                  [MapPin,'Places','Find your club'],
                  [CalendarDays,'Sessions','Play more'],
                  [Trophy,'Community','Belong together'],
                ].map(([Icon,title,copy])=>(
                  <div key={title} className="flex items-center gap-3 border-white/10 px-5 py-4 sm:block sm:border-r sm:text-center">
                    <Icon className="h-5 w-5 shrink-0 sm:mx-auto"/>
                    <div>
                      <div className="text-[13px] font-bold">{title}</div>
                      <div className="text-[10px] text-white/75">{copy}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center bg-[#053c56] py-3 text-[9px] font-semibold tracking-[.38em] text-white sm:hidden">
                PLAY <span className="mx-2 text-[#9ade42]">•</span> CONNECT <span className="mx-2 text-[#9ade42]">•</span> BELONG
                <span className="ml-4 h-7 w-7 rounded-full bg-[#d9ef30]"/>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
