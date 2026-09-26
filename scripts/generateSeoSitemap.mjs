import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const site='https://rallyhub.ie';
const lastmod=new Date().toISOString().slice(0,10);
const { directoryClubs=[] }=await import(pathToFileURL(path.join(root,'src/data/directorySeed.js')).href);
const unique=values=>[...new Set(values.filter(Boolean))];
const countySlug=county=>String(county||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const enc=value=>encodeURIComponent(String(value||''));

const listedCounties=unique(directoryClubs.map(club=>club.county));
const venueUrls=directoryClubs.flatMap(club=>(club.venues||[]).filter(v=>v?.id).map(v=>`${site}/pickleball-venues/${enc(club.slug)}/${enc(v.id)}`));
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
  ...directoryClubs.map(club=>`${site}/directory/${club.slug}`),
  ...venueUrls,
]);

const xml=`<?xml version="1.0" encoding="UTF-8"?>\n`+
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  urls.map(url=>`  <url><loc>${url.replace(/&/g,'&amp;')}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')+
  `\n</urlset>\n`;

fs.mkdirSync(path.join(root,'public'),{recursive:true});
fs.writeFileSync(path.join(root,'public/directory-sitemap.xml'),xml);
console.log(`SEO sitemap generated: ${urls.length} URLs (${directoryClubs.length} clubs, ${listedCounties.length} counties, ${venueUrls.length} venues).`);
