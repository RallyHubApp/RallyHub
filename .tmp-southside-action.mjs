import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
await page.goto('https://rallyhub.ie/directory/southside-pickleball-club',{waitUntil:'networkidle',timeout:60000});
const call=page.getByRole('button',{name:/Call club/i});
await call.click();
await page.getByText(/Call opened/i).waitFor({timeout:15000});
console.log(JSON.stringify({callOpened:true, currentUrl:page.url(), noRealExternalNavigation:page.url().startsWith('https://rallyhub.ie/')}));
await browser.close();
