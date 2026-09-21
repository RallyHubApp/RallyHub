import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarDays, MapPin, Menu, Rocket, Search, Trophy, Users } from 'lucide-react';
import Seo from '@/components/public/Seo';

const LOGO_URL='https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
const HERO='/assets/rallyhub-home-hero.webp';
const CLIFFS='/assets/rallyhub-home-cliffs.webp';
const FOUNDERS='/assets/rallyhub-founders.webp';

const featureCards=[
  [MapPin,'Directory & Discovery','Find clubs, venues, sessions and events across Ireland.',CLIFFS],
  [Users,'Club Management','Membership, profiles, communications and more.',HERO],
  [CalendarDays,'Play & Organise','Sessions, courts, attendance and player management.',HERO],
  [Trophy,'Competitions','King of the Court, Interclub and tournaments.',HERO],
  [BarChart3,'Live Event Experience','Scoring, timers, Hall Displays and event control.',HERO],
  [BarChart3,'Player Journey','Results, leaderboards and future DUPR integration.',HERO],
  [Rocket,'Built to Grow','Pickleball first in Ireland, with a pathway to more sports.',CLIFFS],
];

function Header(){
  return <header className="border-b border-[#e7edef] bg-white">
    <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12">
      <Link to="/" className="flex items-center gap-2.5">
        <img src={LOGO_URL} alt="RallyHub" className="h-[48px] w-[48px] object-contain sm:h-[52px] sm:w-[52px]"/>
        <div><div className="text-[1.7rem] font-black leading-[.88] tracking-[-.045em] text-[#081342] sm:text-[2rem]">Rally<span className="text-[#078e48]">Hub</span></div>
        <div className="mt-1.5 text-[7px] font-bold tracking-[.3em] text-[#0c1e53] sm:text-[8px]">PLAY <span className="text-[#0b914a]">•</span> CONNECT <span className="text-[#0b914a]">•</span> BELONG</div></div>
      </Link>
      <nav className="hidden items-center gap-[27px] text-[12px] font-semibold text-[#0d2258] lg:flex">
        <Link to="/">Home</Link><Link to="/directory">Directory</Link><Link to="/directory">Clubs</Link><Link to="/directory">Events</Link><Link className="border-b-2 border-[#078e48] pb-2 text-[#078e48]" to="/about">About</Link>
      </nav>
      <Link to="/directory/add" className="hidden rounded-lg bg-[#078e48] px-6 py-3 text-[13px] font-bold text-white lg:block">Get Started</Link>
      <Menu className="h-6 w-6 lg:hidden"/>
    </div>
  </header>
}

export default function About(){
 return <>
  <Seo title="About RallyHub | Built Around Sport. Built Around People." description="RallyHub connects players, clubs, organisers and competitions — built from real club experience in Ireland and designed to grow." path="/about"/>
  <div className="min-h-screen overflow-x-hidden bg-white text-[#07184c]">
   <Header/>
   <main>
    <section className="bg-[#f7fcfd]">
      <div className="mx-auto grid max-w-[1380px] lg:grid-cols-[43%_57%]">
        <div className="flex items-center px-5 py-10 sm:px-7 lg:px-10 lg:py-12 xl:px-12">
          <div>
            <span className="inline-flex rounded-full bg-[#e6f5ec] px-4 py-2 text-[11px] font-black tracking-[.11em] text-[#078e48]">PICKLEBALL FIRST • BUILT IN IRELAND</span>
            <h1 className="mt-5 text-[2.7rem] font-black leading-[.96] tracking-[-.05em] sm:text-[3.7rem] lg:text-[4rem]">Built around sport.<br/>Built around <span className="text-[#078e48]">people.</span></h1>
            <p className="mt-5 max-w-[520px] text-[16px] leading-[1.5] text-[#243964]">RallyHub brings players, clubs, organisers and competitions together — making it easier to find somewhere to play, run a thriving club and create great sporting experiences.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/directory" className="rounded-full bg-[#07447b] px-6 py-3 text-[13px] font-bold text-white">Explore the Directory →</Link><a href="#capabilities" className="rounded-full border border-[#174578] bg-white px-6 py-3 text-[13px] font-bold text-[#07184c]">See What RallyHub Does</a></div>
            <div className="mt-7 flex gap-7 text-[12px] font-bold"><span>👥 Players<br/>Welcome</span><span>📍 Clubs<br/>Grow</span><span>▣ Communities<br/>Thrive</span></div>
          </div>
        </div>
        <div className="relative min-h-[360px] lg:min-h-[560px]"><img src={HERO} alt="Pickleball players on court" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute bottom-6 right-5 rotate-[-5deg] bg-[#07184c]/90 px-6 py-4 text-right text-[22px] italic text-white shadow-xl">Good People.<br/>Great Games.<div className="mt-2 h-1 w-28 bg-[#8dd33f]"/></div></div>
      </div>
    </section>

    <section className="bg-white py-4"><div className="mx-auto grid max-w-[1320px] grid-cols-2 rounded-xl bg-[#f0f8fb] px-5 py-5 sm:grid-cols-4">
      {[[Users,'155+','Members (and growing)'],[MapPin,'3','Club venues in Clare'],[CalendarDays,'Weekly','Club sessions'],[Users,'A growing','Irish community']].map(([I,n,t])=><div key={t} className="flex items-center gap-3 border-[#cbdce3] px-4 py-2 sm:border-r sm:last:border-0"><I className="h-7 w-7 text-[#0b4c8c]"/><div><div className="text-[22px] font-black">{n}</div><div className="text-[11px]">{t}</div></div></div>)}
    </div></section>

    <section className="mx-auto grid max-w-[1380px] gap-7 px-5 py-5 sm:px-7 lg:grid-cols-[47%_53%] lg:px-10 xl:px-12">
      <div className="relative overflow-hidden rounded-xl bg-[#eef3f4]"><img src={FOUNDERS} alt="Conall and Brian Moore, RallyHub founders" className="h-full min-h-[360px] w-full object-cover"/><div className="absolute bottom-4 left-4 rounded-md bg-[#064b78] px-4 py-2 text-white"><div className="text-[13px] font-bold">Conall and Brian Moore</div><div className="text-[11px]">Founders, RallyHub</div></div></div>
      <div className="flex flex-col justify-center lg:pl-3"><div className="text-[11px] font-black tracking-[.12em] text-[#078e48]">OUR STORY</div><h2 className="mt-2 text-[2rem] font-black tracking-[-.035em] lg:text-[2.4rem]">From our court to a bigger community</h2><p className="mt-3 max-w-[700px] text-[15px] leading-[1.5] text-[#30456f]">RallyHub grew from our own experience in Clare Pickleball — the joy of playing, the challenge of organising, and the brilliant people we've met along the way. Conall and Brian created RallyHub to make it easier for clubs, players and organisers to connect, play and grow — not just in Clare, but across Ireland and beyond.</p>
      <div className="mt-5 rounded-xl bg-[#eef8f3] p-5 text-[14px] italic leading-[1.45] text-[#173765]"><span className="mr-2 text-3xl font-black text-[#0aa15b]">“</span>Pickleball has given us so much — great games, great people and a real sense of community. RallyHub is our way of giving something back and helping the sport grow.”<div className="mt-3 font-bold not-italic">Brian Moore</div></div></div>
    </section>

    <section id="capabilities" className="mx-auto max-w-[1380px] px-5 py-8 sm:px-7 lg:px-10 xl:px-12">
      <div className="text-[11px] font-black tracking-[.12em] text-[#078e48]">WHAT RALLYHUB BRINGS TOGETHER</div>
      <div className="flex items-end justify-between"><h2 className="mt-2 text-[2rem] font-black tracking-[-.035em] lg:text-[2.45rem]">A complete platform for clubs, players and organisers</h2><span className="hidden text-[12px] font-semibold lg:block">See all features →</span></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
       {featureCards.map(([I,title,copy,img],idx)=><article key={title} className={"group overflow-hidden rounded-xl border border-[#dbe6e8] bg-white shadow-[0_8px_20px_rgba(13,33,66,.07)] "+(idx>3?'lg:col-span-1':'')}>
          <div className="relative h-[118px] overflow-hidden"><img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#07184c]/25 to-transparent"/></div>
          <div className="relative p-4 pt-5"><div className="absolute -top-7 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#08a153] text-white ring-4 ring-white"><I className="h-6 w-6"/></div><h3 className="mt-1 text-[15px] font-black">{title}</h3><p className="mt-1 text-[12px] leading-[1.35] text-[#344b75]">{copy}</p></div>
        </article>)}
      </div>
    </section>

    <section className="mt-3 bg-[#073a62] text-white"><div className="mx-auto grid max-w-[1380px] lg:grid-cols-[32%_68%]">
      <div className="min-h-[270px]"><img src={HERO} alt="Pickleball community" className="h-full w-full object-cover"/></div>
      <div className="relative flex items-center px-6 py-10 sm:px-10"><div><div className="text-[11px] font-black tracking-[.13em] text-[#78d88f]">JOIN THE JOURNEY</div><h2 className="mt-2 text-[2rem] font-black">Let's grow the game together</h2><p className="mt-2 max-w-[620px] text-[15px] text-white/90">Whether you're a player, club, organiser or just curious about pickleball, we'd love to hear from you.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/contact" className="rounded-lg bg-[#08a153] px-7 py-3 text-[13px] font-bold">Get in Touch</Link><Link to="/contact" className="rounded-lg border border-white px-7 py-3 text-[13px] font-bold">Contact Brian on WhatsApp</Link></div></div>
      <div className="ml-auto hidden h-44 w-44 rotate-[-6deg] items-center justify-center rounded-full border-4 border-white/80 text-center text-[22px] italic leading-tight lg:flex">More<br/>People<br/>More Places<br/><span className="text-[#b6e841]">Brighter Futures</span></div></div>
    </div></section>
   </main>
  </div>
 </>;
}