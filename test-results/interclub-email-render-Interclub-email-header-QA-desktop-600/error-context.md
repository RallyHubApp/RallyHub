# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interclub-email-render.spec.mjs >> Interclub email header QA desktop-600
- Location: e2e/interclub-email-render.spec.mjs:10:2

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.header-title').locator('span').first()
Expected: "CLARE V GALWAY"
Received: "Clare v Galway"
Timeout:  3000ms

Call log:
  - Expect "toHaveText" locator('.header-title').locator('span').first() with timeout 3000ms
  - waiting for locator('.header-title').locator('span').first()
    10 × locator resolved to <span>Clare v Galway</span>
       - unexpected value "Clare v Galway"

```

```yaml
- text: Clare v Galway
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | 
  3  | const cases=[
  4  |  {name:"desktop-600",width:600,height:900,minLogo:120},
  5  |  {name:"mobile-390",width:390,height:900,minLogo:90},
  6  |  {name:"mobile-320",width:320,height:900,minLogo:75}
  7  | ];
  8  | 
  9  | for(const c of cases){
  10 |  test(`Interclub email header QA ${c.name}`,async({page})=>{
  11 |   await page.setViewportSize({width:c.width,height:c.height});
  12 |   await page.goto("http://127.0.0.1:4173/email-qa/interclub.html",{waitUntil:"networkidle"});
  13 |   const title=page.locator(".header-title");
  14 |   const spans=title.locator("span");
  15 |   await expect(spans).toHaveCount(2);
> 16 |   await expect(spans.nth(0)).toHaveText("CLARE V GALWAY");
     |                              ^ Error: expect(locator).toHaveText(expected) failed
  17 |   await expect(spans.nth(1)).toHaveText("INTERCLUB");
  18 | 
  19 |   const metrics=await page.evaluate(()=>{
  20 |    const q=s=>document.querySelector(s);
  21 |    const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  22 |    const logo=q(".header-logo"),art=q(".header-art"),title=q(".header-title"),rule=q(".header-lower-rule");
  23 |    const lineBoxes=[...title.querySelectorAll("span")].map(box);
  24 |    return {
  25 |     logo:box(logo),art:box(art),title:box(title),rule:box(rule),lineBoxes,
  26 |     titleClient:title.clientWidth,titleScroll:title.scrollWidth,
  27 |     bodyScroll:document.documentElement.scrollWidth,
  28 |     bodyClient:document.documentElement.clientWidth
  29 |    };
  30 |   });
  31 | 
  32 |   expect(metrics.logo.width).toBeGreaterThanOrEqual(c.minLogo);
  33 |   expect(Math.abs(metrics.art.bottom-metrics.rule.top)).toBeLessThanOrEqual(1.5);
  34 |   expect(metrics.art.height).toBeGreaterThanOrEqual(136);
  35 |   expect(metrics.title.right).toBeLessThanOrEqual(metrics.art.left+1);
  36 |   expect(metrics.lineBoxes[0].width).toBeLessThanOrEqual(metrics.titleClient+1);
  37 |   expect(metrics.lineBoxes[1].width).toBeLessThanOrEqual(metrics.titleClient+1);
  38 |   expect(metrics.bodyScroll).toBeLessThanOrEqual(metrics.bodyClient+1);
  39 |   await page.screenshot({path:`test-results/interclub-email-${c.name}.png`,fullPage:true});
  40 |  });
  41 | }
```