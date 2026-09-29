import { chromium } from 'playwright';

const PHONE_OPT_OUT = new Set([
  'killarney-pickleball-club',
  'carrickmacross-pickleball-club',
  'multyfarnham-pickleball-club',
  'stepaside-pickleball',
]);
const NAME_OPT_OUT = new Set([
  'west-cork-pickleball-club',
  'southside-pickleball-club',
  'multyfarnham-pickleball-club',
  'stepaside-pickleball',
  'kinvara-pickleball',
  'galway-county-pickleball',
]);
const LEGACY_HOLD = new Set(['eyva-s-invitational-series']);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let slugs = [];
for (let attempt = 1; attempt <= 5; attempt++) {
  await page.goto(`https://rallyhub.ie/directory?t=${Date.now()}&attempt=${attempt}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const hrefs = await page.locator('a[href^="/directory/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
  slugs = [...new Set(hrefs.map(h => String(h || '').split('?')[0].replace(/^\/directory\//, '')).filter(s => s && !s.includes('/') && !['add','help'].includes(s)))].sort();
  if (slugs.length >= 90) break;
  console.log(`directory list attempt ${attempt} saw only ${slugs.length}; retrying`);
}
const manifest = [];
for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  await page.goto(`https://rallyhub.ie/directory/${slug}?contactBaseline=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  const hasProtectedLoader = await page.locator('body').innerText().then(t => /Loading contact options/i.test(t)).catch(() => false);
  if (hasProtectedLoader) {
    await page.waitForFunction(() => !/Loading contact options/i.test(document.body?.innerText || ''), null, { timeout: 8000 }).catch(() => {});
  }
  await page.waitForTimeout(350);
  const result = await page.evaluate(() => {
    const text = (document.body?.innerText || '').toLowerCase();
    const hrefs = [...document.querySelectorAll('a[href]')].map(a => String(a.getAttribute('href') || '').toLowerCase());
    return {
      call: hrefs.some(h => h.startsWith('tel:')) || text.includes('call club') || text.includes('call opened'),
      whatsapp: hrefs.some(h => h.includes('wa.me/') && !h.includes('wa.me/?text=')) || text.includes('whatsapp club') || text.includes('whatsapp opened'),
      email: hrefs.some(h => h.startsWith('mailto:') && !h.includes('rallyhubapp@gmail.com')) || text.includes('email club') || text.includes('send through rallyhub'),
      protectedCard: text.includes('contact details are protected by rallyhub'),
      pageTitle: document.querySelector('h1')?.textContent?.trim() || '',
    };
  });
  if (PHONE_OPT_OUT.has(slug)) {
    result.call = false;
    result.whatsapp = false;
  }
  manifest.push({
    slug,
    expected: { call: !!result.call, whatsapp: !!result.whatsapp, email: !!result.email },
    hideContactName: NAME_OPT_OUT.has(slug),
    legacyHold: LEGACY_HOLD.has(slug),
    baselineProtected: !!result.protectedCard,
  });
  if ((i + 1) % 12 === 0) console.log(`captured ${i + 1}/${slugs.length}`);
}
await browser.close();
const fs = await import('node:fs');
fs.writeFileSync('scripts/directoryContactProtectionManifest.json', JSON.stringify({ generatedAt:new Date().toISOString(), count:manifest.length, listings:manifest }, null, 2) + '\n');
const counts = manifest.reduce((a,r) => { const k = `${+r.expected.call}${+r.expected.whatsapp}${+r.expected.email}`; a[k]=(a[k]||0)+1; return a; }, {});
console.log(JSON.stringify({ count:manifest.length, channelPatterns:counts, legacyHolds:manifest.filter(x=>x.legacyHold).map(x=>x.slug), hiddenNames:manifest.filter(x=>x.hideContactName).map(x=>x.slug) }, null, 2));
if (manifest.length < 90) process.exit(2);
