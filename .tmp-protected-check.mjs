import { chromium } from 'playwright';
const [slug, expCall, expWhatsapp, expEmail, hiddenName, rawPhone, rawEmail] = process.argv.slice(2);
const expected = {call:expCall==='true', whatsapp:expWhatsapp==='true', email:expEmail==='true'};
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`https://rallyhub.ie/directory/${slug}?t=${Date.now()}`,{waitUntil:'networkidle',timeout:60000});
const body = (await page.locator('body').innerText()).toLowerCase();
const html = (await page.content()).toLowerCase();
const bundleSrc = await page.locator('script[src*="/assets/"]').last().getAttribute('src').catch(()=>null);
let bundle=''; if(bundleSrc) bundle=(await (await fetch(new URL(bundleSrc,'https://rallyhub.ie'))).text()).toLowerCase();
const out={
 slug,
 call:body.includes('call club'), whatsapp:body.includes('whatsapp club'), email:body.includes('email club'), expected,
 contactHeading:body.includes('contact '),
 hiddenNameAbsent:hiddenName==='true' ? !body.includes('contact ') || !body.includes('contact name') : true,
 rawPhoneAbsent:!rawPhone || (!html.includes(rawPhone.toLowerCase()) && !bundle.includes(rawPhone.toLowerCase())),
 rawEmailAbsent:!rawEmail || (!html.includes(rawEmail.toLowerCase()) && !bundle.includes(rawEmail.toLowerCase())),
 noDirectSchemes:!html.includes('tel:') && !html.includes('wa.me/') && !html.includes('mailto:'), errors
};
console.log(JSON.stringify(out));
await browser.close();
if(out.call!==expected.call||out.whatsapp!==expected.whatsapp||out.email!==expected.email||!out.rawPhoneAbsent||!out.rawEmailAbsent||!out.noDirectSchemes||errors.length) process.exit(2);
