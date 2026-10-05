import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import rallyHubLogoApprovedUrl from '@/assets/rallyhub-logo-approved.webp';

const footerLinks = [
  ['Directory','/directory'],
  ['Events','/events'],
  ['Club Guide','/directory/help'],
  ['About','/about'],
  ['Contact','/contact'],
];

export default function PublicCopyrightFooter({ className = '', maxWidthClass = 'max-w-[1380px]' }) {
  return (
    <footer aria-label="RallyHub footer" className={cn('w-full bg-transparent px-4 text-white sm:px-6 lg:px-10 xl:px-12', className)}>
      <div className={cn('mx-auto w-full overflow-hidden rounded-t-2xl bg-[#053c56]', maxWidthClass)}>
        <div className="flex min-h-[70px] flex-col items-center justify-center gap-4 px-4 py-5 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <Link to="/" className="shrink-0" aria-label="RallyHub home">
            <img src={rallyHubLogoApprovedUrl} alt="RallyHub · Play Connect Belong" className="h-11 w-auto object-contain sm:h-12" />
          </Link>
          <nav aria-label="Footer navigation" className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-bold text-white/85 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 md:justify-end">
            {footerLinks.map(([label,to]) => <Link key={label} to={to} className="rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white hover:underline">{label}</Link>)}
          </nav>
        </div>
        <div className="flex min-h-[36px] items-center justify-center border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium tracking-[.01em] text-white/70 sm:px-6 sm:text-[11px] lg:px-8">
          © 2026 RallyHub All rights reserved.
        </div>
      </div>
    </footer>
  );
}
