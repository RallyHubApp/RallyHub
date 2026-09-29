import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.addInitScript(()=>{
  window.__rhCaptured=[];
  const originalFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const res=await originalFetch(...args);
    try { const t=await res.clone().text(); if(/contactProtection|protected-v1|listingSlug/.test(t)) window.__rhCaptured.push({kind:'fetch',url:String(args[0]?.url||args[0]||''),status:res.status,text:t.slice(0,10000)}); } catch {}
    return res;
  };
  const OriginalXHR=window.XMLHttpRequest;
  const open=OriginalXHR.prototype.open;
  const send=OriginalXHR.prototype.send;
  OriginalXHR.prototype.open=function(method,url,...rest){ this.__rhUrl=String(url||''); return open.call(this,method,url,...rest); };
  OriginalXHR.prototype.send=function(...args){ this.addEventListener('load',()=>{ try{ const t=String(this.responseText||''); if(/contactProtection|protected-v1|listingSlug/.test(t)) window.__rhCaptured.push({kind:'xhr',url:this.__rhUrl,status:this.status,text:t.slice(0,10000)}); }catch{} }); return send.apply(this,args); };
});
await page.goto('https://rallyhub.ie/directory/clare-pickleball?x='+Date.now(),{waitUntil:'networkidle',timeout:60000});
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(()=>window.__rhCaptured||[]),null,2));
await browser.close();
