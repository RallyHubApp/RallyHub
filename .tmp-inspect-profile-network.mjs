import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
page.on('response', async r=>{
 const u=r.url();
 if(/directoryListingProfile|functions\/invoke|api\/apps/.test(u)){
  let t=''; try{t=await r.text();}catch{}
  if(/contactProtection|protected-v1|listingSlug/i.test(t)) console.log('URL',u,'STATUS',r.status(),'BODY',t.slice(0,1200));
 }
});
await page.goto('https://rallyhub.ie/directory/clare-pickleball?x='+Date.now(),{waitUntil:'networkidle',timeout:60000});
await browser.close();
