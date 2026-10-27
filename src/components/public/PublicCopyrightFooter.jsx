import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RALLYHUB_BRAND } from '@/lib/rallyhubBrand';

const legalLinks = [['Privacy Policy','/legal/privacy'],['Terms of Use','/legal/terms'],['Cookies','/legal/cookies']];
const footerLinks = [
  ['Directory','/directory'],
  ['Events','/events'],
  ['Club Guide','/directory/help'],
  ['About','/about'],
  ['Contact','/contact'],
];

export default function PublicCopyrightFooter({ className = '', maxWidthClass = 'max-w-[1380px]' }) {
  return (
    <footer aria-label="RallyHub footer" className={cn('w-full min-w-0 max-w-full bg-transparent px-4 text-white', className)}>
      <div className={cn('mx-auto w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-[#053c56]', maxWidthClass)}>
        <div className="flex min-h-[70px] flex-col items-center justify-center gap-4 px-4 py-5 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <Link to="/" className="shrink-0" aria-label="RallyHub home">
            <img src={RALLYHUB_BRAND.reversedWithSignature} alt="RallyHub" className="h-12 max-w-full w-[180px] object-contain sm:w-[205px]" />
          </Link>
          <nav aria-label="Footer navigation" className="grid w-full min-w-0 grid-cols-2 gap-x-2 gap-y-2 text-[11px] font-bold text-white/85 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-x-4 sm:gap-y-2 md:justify-end">
            {footerLinks.map(([label,to]) => <Link key={label} to={to} className="rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white hover:underline">{label}</Link>)}
          </nav>
        </div>
        <div className="flex min-h-[36px] flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium tracking-[.01em] text-white/70 sm:px-6 sm:text-[11px] lg:px-8">
          <span>© 2026 RallyHub. All rights reserved.</span>
          <nav aria-label="Legal information" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {legalLinks.map(([label,to])=><Link key={to} to={to} className="hover:text-white hover:underline">{label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  );
}
