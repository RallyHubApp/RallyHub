import {test,expect} from "@playwright/test";

const cases=[
 {name:"desktop-600",width:600,height:900,minLogo:120},
 {name:"mobile-390",width:390,height:900,minLogo:90},
 {name:"mobile-320",width:320,height:900,minLogo:75}
];

for(const c of cases){
 test(`Interclub email header QA ${c.name}`,async({page})=>{
  await page.setViewportSize({width:c.width,height:c.height});
  await page.goto("http://127.0.0.1:4173/email-qa/interclub.html",{waitUntil:"networkidle"});
  const title=page.locator(".header-title");
  const spans=title.locator("span");
  await expect(spans).toHaveCount(2);
  await expect(spans.nth(0)).toHaveText(/Clare v Galway/i);
  await expect(spans.nth(1)).toHaveText("INTERCLUB");

  const metrics=await page.evaluate(()=>{
   const q=s=>document.querySelector(s);
   const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
   const logo=q(".header-logo"),art=q(".header-art"),title=q(".header-title"),rule=q(".header-lower-rule");
   const lineBoxes=[...title.querySelectorAll("span")].map(box);
   return {
    logo:box(logo),art:box(art),title:box(title),rule:box(rule),lineBoxes,
    titleClient:title.clientWidth,titleScroll:title.scrollWidth,
    bodyScroll:document.documentElement.scrollWidth,
    bodyClient:document.documentElement.clientWidth
   };
  });

  expect(metrics.logo.width).toBeGreaterThanOrEqual(c.minLogo);
  expect(Math.abs(metrics.art.bottom-metrics.rule.top)).toBeLessThanOrEqual(1.5);
  expect(metrics.art.height).toBeGreaterThanOrEqual(136);
  expect(metrics.title.right).toBeLessThanOrEqual(metrics.art.left+1);
  expect(metrics.lineBoxes[0].width).toBeLessThanOrEqual(metrics.titleClient+1);
  expect(metrics.lineBoxes[1].width).toBeLessThanOrEqual(metrics.titleClient+1);
  expect(metrics.bodyScroll).toBeLessThanOrEqual(metrics.bodyClient+1);
  await page.screenshot({path:`test-results/interclub-email-${c.name}.png`,fullPage:true});
 });
}