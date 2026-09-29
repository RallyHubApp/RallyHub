import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({ viewport:{width:1440,height:1000} });
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{ if(m.type()==='error') errors.push('console:'+m.text()); });
await page.goto('https://rallyhub.ie/directory?audit='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(2500);
const hrefs=await page.locator('a[href^="/directory/"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(Boolean));
const slugs=[...new Set(hrefs.map(h=>h.split('?')[0].replace(/^\/directory\//,'').replace(/\/$/,'')).filter(s=>s && !s.includes('/') && !['help','admin'].includes(s)))].sort();
const results=[];
for (const slug of slugs){
  const p=await browser.newPage({viewport:{width:390,height:844}});
  const perr=[]; p.on('pageerror',e=>perr.push(String(e?.message||e))); p.on('console',m=>{if(m.type()==='error') perr.push('console:'+m.text())});
  let status=0;
  try {
    const r=await p.goto('https://rallyhub.ie/directory/'+slug+'?audit='+Date.now(),{waitUntil:'domcontentloaded',timeout:30000}); status=r?.status()||0;
    await p.waitForTimeout(650);
    const body=(await p.locator('body').innerText().catch(()=>''));
    const html=(await p.content()).toLowerCase();
    const protectedCard=body.includes('Contact details are protected by RallyHub.') || body.includes('No direct contact details have been supplied yet.');
    const call=body.includes('Call club');
    const wa=body.includes('WhatsApp club');
    const email=body.includes('Email club');
    const directTel=/href=["']tel:/i.test(html);
    const directMail=/href=["']mailto:[^"']*(?!rallyhubapp@gmail\.com)/i.test(html);
    const directWa=/href=["']https:\/\/(?:wa\.me|api\.whatsapp\.com)\/[0-9]/i.test(html);
    results.push({slug,status,protectedCard,call,wa,email,directTel,directMail,directWa,errors:perr.slice(0,3)});
  } catch(e){ results.push({slug,status,error:String(e?.message||e),errors:perr.slice(0,3)}); }
  await p.close();
  await new Promise(r=>setTimeout(r,120));
}
await browser.close();
const failures=results.filter(r=>r.slug!=='eyva-s-invitational-series' && (r.status!==200 || !r.protectedCard || r.directTel || r.directWa || r.error || r.errors?.length));
const eyva=results.find(r=>r.slug==='eyva-s-invitational-series');
console.log(JSON.stringify({count:results.length,slugs,failures,eyva,results},null,2));
process.exit(failures.length?2:0);
