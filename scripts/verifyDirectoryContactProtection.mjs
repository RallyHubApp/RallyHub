import fs from 'node:fs';
import { chromium } from 'playwright';

const manifest = JSON.parse(fs.readFileSync('scripts/directoryContactProtectionManifest.json','utf8'));
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
const failures=[];
const results=[];
for (let i=0;i<manifest.listings.length;i++) {
  const row=manifest.listings[i];
  const pageErrors=[];
  page.removeAllListeners('pageerror');
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(`https://rallyhub.ie/directory/${row.slug}?protectedVerify=${Date.now()}`, { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForTimeout(700);
  const actual=await page.evaluate(() => {
    const text=(document.body?.innerText||'').toLowerCase();
    const hrefs=[...document.querySelectorAll('a[href]')].map(a=>String(a.getAttribute('href')||'').toLowerCase());
    const directTel=hrefs.filter(h=>h.startsWith('tel:'));
    const directWa=hrefs.filter(h=>/^https?:\/\/(?:www\.)?wa\.me\/\d/.test(h) || /^https?:\/\/api\.whatsapp\.com\//.test(h));
    const directMail=hrefs.filter(h=>/^mailto:[^?]/.test(h));
    return {
      call:text.includes('call club')||text.includes('call opened'),
      whatsapp:text.includes('whatsapp club')||text.includes('whatsapp opened'),
      email:text.includes('email club')||text.includes('send through rallyhub'),
      protectedCard:text.includes('contact details are protected by rallyhub'),
      noContact:text.includes('no direct contact details have been supplied yet'),
      directTel,directWa,directMail,
    };
  });
  const channelOk=actual.call===row.expected.call && actual.whatsapp===row.expected.whatsapp && actual.email===row.expected.email;
  const protectedOk=row.legacyHold ? !actual.protectedCard : actual.protectedCard;
  const leakOk=row.legacyHold ? true : actual.directTel.length===0 && actual.directWa.length===0 && actual.directMail.length===0;
  const ok=channelOk && protectedOk && leakOk && pageErrors.length===0;
  results.push({slug:row.slug,ok,channelOk,protectedOk,leakOk,pageErrors});
  if(!ok) failures.push(results.at(-1));
  if((i+1)%12===0) console.log(`verified ${i+1}/${manifest.listings.length}; failures=${failures.length}`);
}
await browser.close();
console.log(JSON.stringify({count:results.length,passed:results.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length) process.exit(2);
