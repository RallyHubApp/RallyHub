import { chromium } from 'playwright';
const [slug, expectCall, expectWhatsApp, expectEmail, rawPhone, rawEmail] = process.argv.slice(2);
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1365,height:900}});
const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
const responses=[]; page.on('response',r=>{ if(r.url().includes('directoryContactAction')||r.url().includes('directoryListingProfile')) responses.push(r.status()); });
await page.goto(`https://rallyhub.ie/directory/${slug}?cb=${Date.now()}`,{waitUntil:'networkidle',timeout:30000});
const html=(await page.content()).toLowerCase();
const body=(await page.locator('body').innerText()).toLowerCase();
const out={
  call:body.includes('call club'),
  whatsapp:body.includes('whatsapp club'),
  email:body.includes('email club'),
  expected:{call:expectCall==='true',whatsapp:expectWhatsApp==='true',email:expectEmail==='true'},
  rawPhoneAbsent:!html.replace(/\D/g,'').includes(String(rawPhone||'').replace(/\D/g,'')),
  rawEmailAbsent:!html.includes(String(rawEmail||'').toLowerCase()),
  noDirectSchemes:!html.includes('tel:')&&!html.includes('wa.me/')&&!html.includes('mailto:'),
  errors,responses
};
console.log(JSON.stringify(out));
await browser.close();
