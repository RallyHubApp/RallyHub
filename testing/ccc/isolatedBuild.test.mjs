import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));
test('isolated CCC build, if configured, does not prerender the production Directory',()=>{if(!pkg.scripts['build:ccc'])return assert.equal(pkg.scripts.build,'node scripts/generateSeoSitemap.mjs && vite build && node scripts/prerenderSeoPages.mjs');assert.equal(pkg.scripts['build:ccc'],'vite build')});
test('public Directory production build remains unchanged',()=>assert.equal(pkg.scripts.build,'node scripts/generateSeoSitemap.mjs && vite build && node scripts/prerenderSeoPages.mjs'));
