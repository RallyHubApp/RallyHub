import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@base44/sdk';

const root=process.cwd();
const site='https://rallyhub.ie';
const lastmod=new Date().toISOString().slice(0,10);
const { directoryClubs=[] }=await import(pathToFileURL(path.join(root,'src/data/directorySeed.js')).href);

// Use the same public directory feed as the website. Fail the build instead of
// silently publishing an incomplete sitemap when that feed is unavailable.
const appId='6a01dc00702b7dd2a2978c28';
const base44=createClient({appId});
const response=await base44.functions.invoke('directoryListingProfile',{action:'public_list'});
if(response?.data?.error) throw new Error(`Public directory unavailable: ${response.data.error}`);
const publicState=response?.data?.listings;
if(!publicState || typeof publicState!=='object' || Array.isArray(publicState)) throw new Error('Public directory feed is missing');

const baseSlugs=new Set(directoryClubs.map(club=>club.slug));
const baseClubs=directoryClubs.map(club=>{
  const profile=publicState[club.slug]?.profile;
  return profile ? {...club,...profile,slug:club.slug,venues:Array.isArray(profile.venues)?profile.venues:club.venues} : club;
});
const dynamicClubs=Object.entries(publicState)
  .filter(([slug,state])=>!baseSlugs.has(slug) && state?.base)
  .map(([slug,state])=>({
    ...state.base,...(state.profile||{}),slug,
    venues:Array.isArray(state.profile?.venues)?state.profile.venues:(state.base.venues||[]),
  }));
const publicClubs=[...baseClubs,...dynamicClubs];
const unique=values=>[...new Set(values.filter(Boolean))];
const countySlug=county=>String(county||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const enc=value=>encodeURIComponent(String(value||''));

const listedCounties=unique(publicClubs.map(club=>club.county));
const venueUrls=publicClubs.flatMap(club=>(club.venues||[]).filter(v=>v?.id).map(v=>`${site}/pickleball-venues/${enc(club.slug)}/${enc(v.id)}`));
const urls=unique([
  `${site}/`,
  `${site}/directory`,
  `${site}/directory/add`,
  `${site}/directory/story`,
  `${site}/directory/help`,
  `${site}/directory/quick-start`,
  `${site}/directory/player-updates`,
  `${site}/events`,
  `${site}/about`,
  `${site}/contact`,
  ...listedCounties.map(county=>`${site}/pickleball-clubs/${countySlug(county)}`),
  ...publicClubs.map(club=>`${site}/directory/${enc(club.slug)}`),
  ...venueUrls,
]);

const xml=`<?xml version="1.0" encoding="UTF-8"?>\n`+
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  urls.map(url=>`  <url><loc>${url.replace(/&/g,'&amp;')}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')+
  `\n</urlset>\n`;

fs.mkdirSync(path.join(root,'public'),{recursive:true});
fs.writeFileSync(path.join(root,'public/directory-sitemap.xml'),xml);
console.log(`SEO sitemap generated: ${urls.length} URLs (${publicClubs.length} public listings, ${listedCounties.length} counties, ${venueUrls.length} venues; ${dynamicClubs.length} dynamic listings).`);
