import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
page.on('request',req=>{ if(req.url().includes('directoryContactAction')) console.log(JSON.stringify({url:req.url(),method:req.method(),postData:req.postData(),headers:req.headers()})); });
await page.goto('https://rallyhub.ie/directory/clare-pickleball?audit='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(4000);
await browser.close();
