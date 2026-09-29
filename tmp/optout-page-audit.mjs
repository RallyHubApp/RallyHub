import { chromium } from 'playwright';
const cases=[
 ['killarney-pickleball-club',true,true],
 ['carrickmacross-pickleball-club',true,false],
 ['multyfarnham-pickleball-club',true,true],
 ['stepaside-pickleball',true,true],
 ['kinvara-pickleball',false,true],
 ['galway-county-pickleball',false,true],
 ['southside-pickleball-club',false,true],
 ['west-cork-pickleball-club',false,true]
];
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const out=[];
for(const [slug,phoneOptOut,nameOptOut] of cases){
 await page.goto('https://rallyhub.ie/directory/'+slug+'?audit='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForTimeout(1000);
 const body=await page.locator('body').innerText();
 const heading=await page.locator('section[aria-label^="Contact "] h2').first().innerText().catch(()=> '');
 out.push({slug,phoneOptOut,nameOptOut,call:body.includes('Call club'),whatsapp:body.includes('WhatsApp club'),email:body.includes('Email club'),heading,phonePreserved:phoneOptOut?(!body.includes('Call club')&&!body.includes('WhatsApp club')):true,namePreserved:nameOptOut?heading.toLowerCase().includes(slug.split('-').filter(x=>!['pickleball','club'].includes(x)).join(' ').split(' ')[0]):true});
 await new Promise(r=>setTimeout(r,900));
}
await browser.close();
console.log(JSON.stringify(out,null,2));
