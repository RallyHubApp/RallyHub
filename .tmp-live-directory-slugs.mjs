import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('https://rallyhub.ie/directory?t='+Date.now(),{waitUntil:'networkidle',timeout:60000});
await page.waitForTimeout(2000);
const hrefs=await page.locator('a[href^="/directory/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
const slugs=[...new Set(hrefs.map(h=>String(h||'').split('?')[0].replace(/^\/directory\//,'')).filter(s=>s&&!s.includes('/')))].sort();
console.log(JSON.stringify({count:slugs.length,slugs},null,2));
await browser.close();
