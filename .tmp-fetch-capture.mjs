import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.addInitScript(()=>{
  window.__rhCaptured=[];
  const original=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const res=await original(...args);
    try {
      const clone=res.clone();
      const text=await clone.text();
      if(/contactProtection|protected-v1|listingSlug/.test(text)) window.__rhCaptured.push({url:String(args[0]?.url||args[0]||''),status:res.status,text:text.slice(0,10000)});
    } catch {}
    return res;
  };
});
await page.goto('https://rallyhub.ie/directory/clare-pickleball?x='+Date.now(),{waitUntil:'networkidle',timeout:60000});
const captured=await page.evaluate(()=>window.__rhCaptured||[]);
console.log(JSON.stringify(captured,null,2));
await browser.close();
