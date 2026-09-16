import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const seed = fs.readFileSync(path.join(root, 'src/data/directorySeed.js'), 'utf8');
const imported = fs.readFileSync(path.join(root, 'src/data/directoryImported.js'), 'utf8');
const source = `${seed}\n${imported}`;
const site = 'https://rallyhub.ie';
const lastmod = new Date().toISOString().slice(0, 10);

const unique = values => [...new Set(values)];
const slugs = unique([...source.matchAll(/["']?slug["']?\s*:\s*["']([^"']+)["']/g)].map(match => match[1]));
const counties = unique([...source.matchAll(/["']?county["']?\s*:\s*["']([^"']+)["']/g)].map(match => match[1]));
const countySlug = county => county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const urls = [
  `${site}/`,
  `${site}/directory`,
  `${site}/directory/add`,
  `${site}/about`,
  `${site}/contact`,
  ...counties.map(county => `${site}/pickleball-clubs/${countySlug(county)}`),
  ...slugs.map(slug => `${site}/directory/${slug}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  unique(urls).map(url => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/directory-sitemap.xml'), xml);
console.log(`SEO sitemap generated: ${unique(urls).length} URLs (${slugs.length} clubs, ${counties.length} counties with listings).`);
