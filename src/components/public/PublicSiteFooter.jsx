import React from 'react';
import { Link } from 'react-router-dom';
import { RALLYHUB_BRAND } from '@/lib/rallyhubBrand';

const FOOTER_PHOTO = '/assets/about/card-play.webp';
const footerLinks = [
  ['Directory', '/directory'], ['Events', '/events'],
  ['Club Guide', '/directory/help'], ['About', '/about'], ['Contact', '/contact'],
];

/** Shared public-site footer: the approved compact photo + navy band design. */
export default function PublicSiteFooter({ photoSrc = FOOTER_PHOTO, photoAlt = "Pickleball players enjoying time together" }) {
  return (
    <footer aria-label="RallyHub public footer" className="w-full min-w-0 px-5 pb-4 sm:px-7 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1380px] min-w-0 flex-col overflow-hidden rounded-xl bg-[#053c56] text-white md:min-h-[188px] md:flex-row">
        <div className="h-[155px] w-full shrink-0 overflow-hidden sm:h-[185px] md:h-auto md:w-[38%]">
          <img src={photoSrc} alt={photoAlt} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 px-5 py-5 sm:px-7 md:px-8 lg:px-10">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <Link to="/" className="shrink-0" aria-label="RallyHub home">
              <img src={RALLYHUB_BRAND.reversedWithSignature} alt="RallyHub" className="h-[70px] w-[220px] max-w-full object-contain" />
            </Link>
            <nav aria-label="Footer navigation" className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-semibold text-white/90 sm:justify-end">
              {footerLinks.map(([label, href]) => <Link key={href} to={href} className="rounded-sm hover:text-white hover:underline">{label}</Link>)}
            </nav>
          </div>
          <div className="border-t border-white/15 pt-3 text-center text-[11px] text-white/70 sm:text-left">© 2026 RallyHub. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
