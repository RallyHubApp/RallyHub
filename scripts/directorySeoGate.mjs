import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const primary=get('dist/directory-sitemap.xml');
const standard=get('dist/sitemap.xml');
assert.equal(primary,standard,'Old and new sitemap endpoints must have identical public URL inventory');
const urls=[...primary.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
assert.ok(urls.length>100,'Public sitemap unexpectedly small');
for(const url of urls){
 assert.ok(url.startsWith('https://rallyhub.ie/'),'Unexpected sitemap host');
 assert.doesNotMatch(new URL(url).pathname,/^\/(?:app|admin|login|register|forgot-password|reset-password|test-club-entry|directory\/add|directory\/player-updates)(?:\/|$)/,'Private or non-indexable route in public sitemap');
}
for(const [slug,label,schema] of [
 ['michael-mcdaid','Pickleball coach','Person'],
 ['ava-battles','Pickleball coach','Person'],
 ['pickleballeire','Pickleball equipment supplier','Organization'],
 ['celtic-pickleball','Pickleball equipment supplier','Organization']
]) {
 const route=`/directory/${slug}`;
 assert.ok(urls.includes('https://rallyhub.ie'+route),`Public provider missing from sitemap: ${slug}`);
 const html=get(`dist/directory/${slug}/index.html`);
 assert.match(html,new RegExp(`<title>[^<]*${label}[^<]*<\\/title>`,'i'),`${slug} wrong title`);
 assert.match(html,new RegExp(`"@type":"${schema}"`),`${slug} wrong schema`);
 assert.match(html,new RegExp(`rel="canonical" href="https://rallyhub.ie${route}"`),`${slug} wrong canonical`);
 assert.match(html,/<h1>/,`${slug} has no indexable body`);
}
assert.match(get('src/lib/PageNotFound.jsx'),/robots="noindex,nofollow"/);
assert.match(get('src/pages/AddDirectoryClub.jsx'),/robots="noindex,follow"/);
console.log(`Directory SEO gate passed: ${urls.length} public URLs, two identical clean sitemaps, coach/supplier SSR titles, canonical, schema, missing-page noindex.`);
