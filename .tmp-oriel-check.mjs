import { chromium } from 'playwright';
const slug = 'oriel-pickleball-dundalk';
const url = `https://rallyhub.ie/directory/${slug}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
const responses = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => {
  if (r.url().includes('directoryContactAction') || r.url().includes('directoryListingProfile')) responses.push(r.status());
});
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
const html = await page.content();
const scripts = await page.locator('script[src]').evaluateAll(els => els.map(e => e.src));
let bundle = '';
for (const src of scripts) {
  if (src.includes('/assets/index-')) {
    bundle = await (await fetch(src)).text();
    break;
  }
}
console.log(JSON.stringify({
  title: body.includes('Oriel Pickleball Dundalk'),
  contactHeading: /Contact Oriel Pickleball Dundalk/i.test(body),
  email: body.includes('Email club'),
  call: body.includes('Call club'),
  whatsapp: body.includes('WhatsApp club'),
  rawEmailInHtml: html.toLowerCase().includes('orielpickleballdundalk@gmail.com'),
  rawEmailInBundle: bundle.toLowerCase().includes('orielpickleballdundalk@gmail.com'),
  directScheme: /mailto:|tel:|wa\.me\//i.test(html),
  errors,
  responses
}, null, 2));
await browser.close();
