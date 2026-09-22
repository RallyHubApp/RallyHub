import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarDays, MapPin, Menu, Monitor, Rocket, Trophy, Users } from 'lucide-react';
import Seo from '@/components/public/Seo';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';

const LOGO='https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
const CARD='/assets/about/';
// About page imagery is locked to the signed-off About artwork, not the Home page imagery.
const APPROVED_MASTER='/assets/about-locked/about-master-approved.png?v=20260921-locked';

const cards=[
 [MapPin,'Directory & Discovery','Find clubs, venues, sessions and events across Ireland.',CARD+'card-directory.webp'],
 [Users,'Club Management','Membership, profiles, communications and more.',CARD+'card-club.webp'],
 [CalendarDays,'Play & Organise','Sessions, courts, attendance and player management.',CARD+'card-play.webp'],
 [Trophy,'Competitions','King of the Court, Interclub and tournaments.',CARD+'card-competitions.webp'],
 [Monitor,'Live Event Experience','Scoring, timers, Hall Displays and event control.',CARD+'card-live.webp'],
 [BarChart3,'Player Journey','Results, leaderboards and future DUPR integration.',CARD+'card-player.webp'],
 [Rocket,'Built to Grow','Pickleball first in Ireland, with a pathway to more sports in the future.',CARD+'card-grow.webp'],
];

function Header(){
 return <header className="h-[63px] border-b border-[#e5ecef] bg-white"><div className="mx-auto flex h-full max-w-[1024px] items-center px-[37px]">
  <Link to="/" className="flex items-center gap-2"><img src={LOGO} alt="RallyHub logo" className="h-[51px] w-[51px] object-contain"/><div><div className="text-[27px] font-black leading-[.9] tracking-[-.045em] text-[#07184c]">Rally<span className="text-[#078e48]">Hub</span></div><div className="mt-[7px] text-[7px] font-bold tracking-[.29em] text-[#07184c]">PLAY <span className="text-[#078e48]">•</span> CONNECT <span className="text-[#078e48]">•</span> BELONG</div></div></Link>
  <nav className="ml-auto hidden items-center gap-[28px] text-[11px] text-[#07184c] md:flex"><Link to="/">Home</Link><Link to="/directory">Directory</Link><Link to="/directory">Clubs</Link><Link to="/directory">Events</Link><Link to="/about" className="border-b-2 border-[#078e48] pb-[10px] text-[#078e48]">About</Link></nav>
  <Link to="/directory/add" className="ml-[30px] hidden rounded-[6px] bg-[#078e48] px-[29px] py-[11px] text-[11px] font-bold text-white md:block">Get Started</Link><Menu className="ml-auto h-6 w-6 md:hidden"/>
 </div></header>
}

export default function About(){
 return <><Seo title="About RallyHub | Built Around Sport. Built Around People." description="RallyHub connects players, clubs, organisers and competitions — built from real club experience in Ireland and designed to grow." path="/about"/>
 <div className="min-h-screen bg-white font-sans text-[#07184c]"><Header/><main>
  <section className="bg-white"><div className="mx-auto grid max-w-[1024px] md:grid-cols-[42%_58%]">
   <div className="flex min-h-[382px] items-center px-[39px] py-8"><div><div className="inline-flex rounded-full bg-[#e6f5ec] px-[12px] py-[6px] text-[10px] font-black tracking-[.08em] text-[#078e48]">PICKLEBALL FIRST • BUILT IN IRELAND</div>
    <h1 className="mt-[18px] text-[42px] font-black leading-[.98] tracking-[-.045em]">Built around sport.<br/>Built around <span className="text-[#078e48]">people.</span></h1>
    <p className="mt-[15px] max-w-[335px] text-[14px] leading-[1.45] text-[#263d6b]">RallyHub brings players, clubs, organisers and competitions together — making it easier to find somewhere to play, run a thriving club and create great sporting experiences.</p>
    <div className="mt-[17px] flex flex-wrap gap-[10px]"><Link to="/directory" className="rounded-full bg-[#07528a] px-[18px] py-[10px] text-[11px] font-bold text-white">Explore the Directory&nbsp; →</Link><a href="#capabilities" className="rounded-full border border-[#174578] bg-white px-[18px] py-[10px] text-[11px] font-bold">See What RallyHub Does</a></div>
    <div className="mt-[23px] grid grid-cols-3 gap-4 text-[10px] font-semibold text-[#10275a]"><div className="flex gap-2"><Users className="h-7 w-7 text-[#09a55a]"/><span>Players<br/>Welcome</span></div><div className="flex gap-2"><MapPin className="h-7 w-7 text-[#09a55a]"/><span>Clubs<br/>Grow</span></div><div className="flex gap-2"><CalendarDays className="h-7 w-7 text-[#09a55a]"/><span>Communities<br/>Thrive</span></div></div>
   </div></div>
   <div className="relative min-h-[437px] overflow-hidden bg-[#dce8e8] max-md:aspect-[1.36] max-md:min-h-0"><img src={APPROVED_MASTER} alt="Pickleball players on court" className="absolute right-0 top-[-63px] w-[172.4%] max-w-none max-md:top-[-10.6%]"/></div>
  </div></section>

  <section className="mx-auto max-w-[1024px] px-[29px] py-[14px]"><div className="grid grid-cols-2 rounded-[8px] bg-[#eff8fb] px-[55px] py-[13px] sm:grid-cols-4">
   {[[Users,'155+','Members (and growing)'],[MapPin,'3','Club venues in Clare'],[CalendarDays,'Weekly','Club sessions'],[Users,'A growing','Irish community']].map(([I,a,b],i)=><div key={b} className={"flex items-center gap-[13px] px-[17px] py-[3px] "+(i<3?'sm:border-r sm:border-[#c7dbe3]':'')}><I className="h-7 w-7 shrink-0 text-[#0b5793]"/><div><div className="text-[20px] font-black leading-none">{a}</div><div className="mt-[4px] whitespace-nowrap text-[9px]">{b}</div></div></div>)}
  </div></section>

  <section className="mx-auto grid max-w-[1024px] gap-[28px] px-[30px] pb-[19px] md:grid-cols-[47%_53%]">
   <div className="relative h-[295px] overflow-hidden rounded-[5px] bg-[#e9eef0]"><img src="/assets/rallyhub-founders-original.png?v=20260921-locked" alt="Conall and Brian Moore" className="absolute inset-0 h-full w-full object-cover object-top [image-rendering:auto]"/><div className="absolute bottom-0 left-[10px] rounded-t-[5px] bg-[#075287] px-[12px] py-[8px] text-white"><div className="text-[11px] font-bold">Conall and Brian Moore</div><div className="text-[9px]">Founders, RallyHub</div></div></div>
   <div className="flex flex-col justify-center"><div className="text-[9px] font-black tracking-[.1em] text-[#078e48]">OUR STORY</div><h2 className="mt-[5px] text-[25px] font-black leading-tight tracking-[-.03em]">From our court to a bigger community</h2><p className="mt-[9px] text-[12px] leading-[1.45] text-[#2e4570]">RallyHub grew from our own experience in Clare Pickleball — the joy of playing, the challenge of organising, and the brilliant people we’ve met along the way. Conall and Brian created RallyHub to make it easier for clubs, players and organisers to connect, play and grow — not just in Clare, but across Ireland and beyond.</p>
    <div className="mt-[12px] rounded-[6px] bg-[#edf8f4] px-[15px] py-[11px] text-[11px] italic leading-[1.45] text-[#24416c]"><span className="mr-2 text-[25px] font-black leading-none text-[#08a158]">“</span>Pickleball has given us so much — great games, great people and a real sense of community. RallyHub is our way of giving something back and helping the sport grow.<div className="mt-[5px] ml-[34px] font-bold not-italic text-[#07184c]">Brian Moore</div><div className="ml-[34px] mt-[3px] h-[2px] w-[36px] bg-[#08a158]"/></div>
   </div>
  </section>

  <section id="capabilities" className="mx-auto max-w-[1024px] px-[30px] pb-[18px] pt-[2px]"><div className="text-[9px] font-black tracking-[.1em] text-[#078e48]">WHAT RALLYHUB BRINGS TOGETHER</div><div className="flex items-end justify-between"><h2 className="mt-[6px] text-[26px] font-black tracking-[-.035em]">A complete platform for clubs, players and organisers</h2><span className="mb-[5px] hidden text-[9px] md:block">See all features&nbsp; →</span></div>
   <div className="mt-[10px] grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-12">{cards.map(([I,title,copy,img],index)=><article key={title} className={(index<4?'md:col-span-3':'md:col-span-4')+" overflow-hidden rounded-[6px] border border-[#dce6e8] bg-white shadow-[0_4px_12px_rgba(12,34,65,.10)]"}><div className="h-[89px] overflow-hidden"><img src={img} alt="" className="h-full w-full object-cover"/></div><div className="relative min-h-[68px] px-[13px] pb-[9px] pt-[13px]"><div className="absolute -top-[24px] left-[9px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#09a957] text-white ring-[3px] ring-white"><I className="h-[20px] w-[20px]"/></div><h3 className="ml-[47px] text-[11px] font-black leading-tight">{title}</h3><p className="ml-[47px] mt-[3px] text-[9px] leading-[1.3] text-[#344a72]">{copy}</p></div></article>)}</div>
  </section>

  <section className="relative mx-auto aspect-[1024/224] max-w-[1024px] overflow-hidden bg-[#06365f]"><img src={APPROVED_MASTER} alt="Join the RallyHub journey — let’s grow the game together" className="absolute bottom-0 left-0 w-full max-w-none"/><Link to="/contact" aria-label="Get in Touch" className="absolute bottom-[17%] left-[35%] h-[18%] w-[13%]"/><a href="https://wa.me/353878100333" target="_blank" rel="noopener noreferrer" aria-label="Contact Brian on WhatsApp" className="absolute bottom-[17%] left-[50%] h-[18%] w-[24%]"/></section>
  <PublicCopyrightFooter maxWidthClass="max-w-[1024px]" />
 </main></div></>;
}