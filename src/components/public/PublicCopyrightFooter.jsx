import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const footerLinks = [
  ['Directory','/directory'],
  ['Events','/events'],
  ['Club Guide','/directory/help'],
  ['About','/about'],
  ['Contact','/contact'],
];

export default function PublicCopyrightFooter({ className = '', maxWidthClass = 'max-w-[1380px]' }) {
  return (
    <footer aria-label="RallyHub footer" className={cn('w-full bg-[#053c56] text-white', className)}>
      <div className={cn('mx-auto w-full', maxWidthClass)}>
        <div className="flex min-h-[70px] flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-10 xl:px-12">
          <Link to="/" className="shrink-0" aria-label="RallyHub home">
            <div className="font-black">RallyHub</div>
            <div className="mt-1 text-[8px] font-bold tracking-[.30em] text-white/90">PLAY • CONNECT • BELONG</div>
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/85">
            {footerLinks.map(([label,to]) => <Link key={label} to={to} className="transition hover:text-white hover:underline">{label}</Link>)}
          </nav>
        </div>
        <div className="flex min-h-[36px] items-center justify-center border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium tracking-[.01em] text-white/70 sm:px-6 sm:text-[11px] lg:px-10 xl:px-12">
          © 2026 RallyHub All rights reserved.
        </div>
      </div>
    </footer>
  );
}
