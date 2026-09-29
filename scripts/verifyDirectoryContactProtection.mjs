import fs from 'node:fs';
import { chromium } from 'playwright';

const manifest = JSON.parse(fs.readFileSync('scripts/directoryContactProtectionManifest.json','utf8'));
const BLOCKED = new Set(['phone','phonehref','telephone','mobile','mobilenumber','email','emailaddress','whatsapp','whatsappurl','whatsapp_url','contactphone','contact_phone','contactemail','contact_email','publiccontactemail','public_contact_email']);
const normaliseKey = key => String(key).replace(/[^a-zA-Z0-9_]/g,'').toLowerCase();
function blockedPaths(value, path='root', out=[]) {
  if (Array.isArray(value)) { value.forEach((v,i)=>blockedPaths(v,`${path}[${i}]`,out)); return out; }
  if (!value || typeof value !== 'object') return out;
  for (const [key,child] of Object.entries(value)) {
    if (BLOCKED.has(normaliseKey(key))) out.push(`${path}.${key}`);
    else blockedPaths(child, `${path}.${key}`, out);
  }
  return out;
}

const browser = await chromium.launch({ headless:true });
const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
await page.addInitScript(() => {
  window.__rhCaptured = [];
  const XHR = window.XMLHttpRequest;
  const open = XHR.prototype.open;
  const send = XHR.prototype.send;
  XHR.prototype.open = function(method,url,...rest){ this.__rhUrl=String(url||''); return open.call(this,method,url,...rest); };
  XHR.prototype.send = function(...args){
    this.addEventListener('load',()=>{
      try {
        if (!String(this.__rhUrl||'').includes('/functions/directoryListingProfile')) return;
        const text=String(this.responseText||'');
        window.__rhCaptured.push({url:this.__rhUrl,status:this.status,text});
      } catch {}
    });
    return send.apply(this,args);
  };
});

let publicListings=null;
for(let attempt=1;attempt<=5 && !publicListings;attempt++){
  await page.goto(`https://rallyhub.ie/directory?apiContract=${Date.now()}&attempt=${attempt}`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(1200);
  const captured=await page.evaluate(()=>window.__rhCaptured||[]);
  for(const item of captured){
    try { const json=JSON.parse(item.text); if(json?.listings && Object.keys(json.listings).length>=90){ publicListings=json.listings; break; } } catch {}
  }
  if(!publicListings) await page.waitForTimeout(1200);
}
if(!publicListings) throw new Error('Could not capture a complete public Directory API response.');

const apiFailures=[];
for(const row of manifest.listings){
  const state=publicListings[row.slug];
  if(!state){ apiFailures.push({slug:row.slug,reason:'missing_from_public_api'}); continue; }
  if(row.legacyHold) continue;
  const paths=blockedPaths(state);
  if(state.contactProtection!=='protected-v1') apiFailures.push({slug:row.slug,reason:'not_protected_v1'});
  if(paths.length) apiFailures.push({slug:row.slug,reason:'blocked_contact_keys',paths:paths.slice(0,20)});
  if(row.hideContactName){
    const baseName=state?.base?.contact?.name;
    const profileName=state?.profile?.contact?.name;
    if(baseName||profileName) apiFailures.push({slug:row.slug,reason:'contact_name_opt_out_not_applied'});
  }
}
console.log(`API contract checked ${manifest.listings.length} listings; failures=${apiFailures.length}`);
if(apiFailures.length){ console.log(JSON.stringify(apiFailures,null,2)); await browser.close(); process.exit(2); }

const failures=[];
const results=[];
for (let i=0;i<manifest.listings.length;i++) {
  const row=manifest.listings[i];
  let actual=null;
  let pageErrors=[];
  for(let attempt=1;attempt<=3;attempt++){
    pageErrors=[];
    page.removeAllListeners('pageerror');
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(`https://rallyhub.ie/directory/${row.slug}?protectedVerify=${Date.now()}&attempt=${attempt}`, { waitUntil:'domcontentloaded', timeout:60000 });
    await page.waitForTimeout(450);
    const hasLoader=await page.locator('body').innerText().then(t=>/Loading contact options/i.test(t)).catch(()=>false);
    if(hasLoader) await page.waitForFunction(()=>!/Loading contact options/i.test(document.body?.innerText||''),null,{timeout:8000}).catch(()=>{});
    await page.waitForTimeout(300);
    actual=await page.evaluate(() => {
      const text=(document.body?.innerText||'').toLowerCase();
      const hrefs=[...document.querySelectorAll('a[href]')].map(a=>String(a.getAttribute('href')||'').toLowerCase());
      const h1=(document.querySelector('h1')?.textContent||'').trim().toLowerCase();
      const contactSection=[...document.querySelectorAll('section')].find(s=>(s.textContent||'').toLowerCase().includes('club contact'));
      const contactHeading=(contactSection?.querySelector('h2')?.textContent||'').trim().toLowerCase();
      return {
        call:text.includes('call club')||text.includes('call opened'),
        whatsapp:text.includes('whatsapp club')||text.includes('whatsapp opened'),
        email:text.includes('email club')||text.includes('send through rallyhub'),
        protectedCard:text.includes('contact details are protected by rallyhub'),
        noContact:text.includes('no direct contact details have been supplied yet'),
        temporarilyUnavailable:text.includes('club contact is temporarily unavailable'),
        directTel:hrefs.filter(h=>h.startsWith('tel:')),
        directWa:hrefs.filter(h=>/^https?:\/\/(?:www\.)?wa\.me\/\d/.test(h) || /^https?:\/\/api\.whatsapp\.com\//.test(h)),
        directMail:hrefs.filter(h=>/^mailto:[^?]/.test(h)),
        h1,contactHeading,
      };
    });
    if(row.legacyHold || (!actual.temporarilyUnavailable && actual.protectedCard)) break;
    await page.waitForTimeout(1400);
  }
  const channelOk=actual.call===row.expected.call && actual.whatsapp===row.expected.whatsapp && actual.email===row.expected.email;
  const protectedOk=row.legacyHold ? !actual.protectedCard : actual.protectedCard;
  const leakOk=row.legacyHold ? true : actual.directTel.length===0 && actual.directWa.length===0 && actual.directMail.length===0;
  const hiddenNameOk=!row.hideContactName || actual.contactHeading===`contact ${actual.h1}`;
  const noContactOk=(row.expected.call||row.expected.whatsapp||row.expected.email) ? true : (row.legacyHold || actual.noContact);
  const ok=channelOk && protectedOk && leakOk && hiddenNameOk && noContactOk && pageErrors.length===0;
  results.push({slug:row.slug,ok,channelOk,protectedOk,leakOk,hiddenNameOk,noContactOk,pageErrors});
  if(!ok) failures.push(results.at(-1));
  if((i+1)%12===0){ console.log(`UI verified ${i+1}/${manifest.listings.length}; failures=${failures.length}`); await page.waitForTimeout(2200); }
  else await page.waitForTimeout(250);
}
await browser.close();
console.log(JSON.stringify({apiPassed:manifest.listings.length,uiCount:results.length,uiPassed:results.length-failures.length,uiFailed:failures.length,failures},null,2));
if(failures.length) process.exit(2);
