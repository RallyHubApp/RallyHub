import React from 'react';
import { CalendarDays, MapPin, Trophy, Users } from 'lucide-react';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';

const FOOTER_PHOTO = '/assets/rallyhub-home-footer-pickleball.webp';

export default function PublicSiteFooter() {
  const items = [
    [Users,'People','Build connections'],
    [MapPin,'Places','Find your club'],
    [CalendarDays,'Sessions','Play more'],
    [Trophy,'Community','Belong together'],
  ];

  return (
    <>
      <section className="relative bg-white">
        <div className="mx-auto max-w-[1380px] px-0">
          <div className="relative hidden aspect-[6.15/1] overflow-hidden md:block">
            <div className="h-full w-[43.5%]">
              <img src={FOOTER_PHOTO} alt="Pickleball players enjoying time together on court" className="h-full w-full object-cover object-center" />
            </div>
            <div className="absolute inset-y-0 right-0 w-[58.5%] rounded-tl-[54px] bg-[#053c56]">
              <div className="grid h-full grid-cols-4 items-center text-center text-white">
                {items.map(([Icon,title,copy]) => (
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
            <img src={FOOTER_PHOTO} alt="Pickleball players enjoying time together on court" className="block h-[210px] w-full object-cover object-center sm:h-[250px]" />
            <div className="relative -mt-9 rounded-tl-[48px] bg-[#053c56] pt-9 text-white">
              <div className="grid grid-cols-2 text-center sm:grid-cols-4">
                {items.map(([Icon,title,copy]) => (
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
      <PublicCopyrightFooter />
    </>
  );
}
