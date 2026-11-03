import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));
test('CCC UAT build never requests public production Directory feed or prerenders its pages',()=>{assert.equal(pkg.scripts['build:ccc'],'vite build');assert.doesNotMatch(pkg.scripts['build:ccc'],/Seo|directory|prerender|generate|rallyhub\.ie/)});
test('public Directory production build remains unchanged',()=>assert.equal(pkg.scripts.build,'node scripts/generateSeoSitemap.mjs && vite build && node scripts/prerenderSeoPages.mjs'));
