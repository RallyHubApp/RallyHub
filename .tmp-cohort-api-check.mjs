import { chromium } from 'playwright';
const clubs = [
  {slug:'oriel-pickleball-dundalk', needles:['orielpickleballdundalk@gmail.com']},
  {slug:'southside-pickleball-club', needles:['086 233 5075','0862335075','richard lombard']},
  {slug:'carrickmacross-pickleball-club', needles:['+353876254202','876254202','carrickmacrosspickleballclub@gmail.com']},
];
const browser = await chromium.launch({ headless:true });
const results=[];
for (const club of clubs) {
  const page=await browser.newPage();
  const payloads=[];
  page.on('response', async r => {
    if (r.url().includes('directoryListingProfile')) {
      try { payloads.push(await r.text()); } catch {}
    }
  });
  await page.goto(`https://rallyhub.ie/directory/${club.slug}`, {waitUntil:'networkidle', timeout:60000});
  const combined=payloads.join('\n').toLowerCase();
  results.push({slug:club.slug, profileResponses:payloads.length, leaks:club.needles.filter(n=>combined.includes(n.toLowerCase()))});
  await page.close();
}
console.log(JSON.stringify(results,null,2));
await browser.close();
