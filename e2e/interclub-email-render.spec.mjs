import {test,expect} from "@playwright/test";

const cases=[
 {name:"desktop-600",width:600,height:900},
 {name:"mobile-390",width:390,height:900},
 {name:"mobile-320",width:320,height:900}
];

for(const c of cases){
 test(`Interclub approved header geometry ${c.name}`,async({page})=>{
  await page.setViewportSize({width:c.width,height:c.height});
  await page.goto("http://127.0.0.1:4173/email-qa/interclub.html",{waitUntil:"networkidle"});
  const title=page.locator(".header-title");
  const spans=title.locator("span");
  await expect(spans).toHaveCount(2);
  await expect(spans.nth(0)).toHaveText(/Clare v Galway/i);
  await expect(spans.nth(1)).toHaveText(/Interclub/i);

  const m=await page.evaluate(()=>{
   const q=s=>document.querySelector(s);
   const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
   const logo=q(".header-logo"),art=q(".header-art"),title=q(".header-title"),rule=q(".header-lower-rule");
   const logoCell=logo.closest("td"),titleCell=title.closest("td"),artCell=art.closest("td");
   const lineBoxes=[...title.querySelectorAll("span")].map(box);
   return {
    logo:box(logo),art:box(art),title:box(title),rule:box(rule),
    logoCell:box(logoCell),titleCell:box(titleCell),artCell:box(artCell),
    lineBoxes,
    bodyScroll:document.documentElement.scrollWidth,
    bodyClient:document.documentElement.clientWidth
   };
  });

  const shellWidth=m.logoCell.width+m.titleCell.width+m.artCell.width;
  expect(Math.abs(m.logoCell.width/shellWidth-.24)).toBeLessThan(.025);
  expect(Math.abs(m.titleCell.width/shellWidth-.46)).toBeLessThan(.025);
  expect(Math.abs(m.artCell.width/shellWidth-.30)).toBeLessThan(.025);

  // Approved outer geometry: logo fills its cell; artwork keeps its native ratio,
  // is cropped horizontally only, and touches both top and lower header edges.
  expect(m.logo.width/m.logoCell.width).toBeGreaterThan(.9);
  expect(Math.abs((m.art.width/m.art.height)-(324/231))).toBeLessThan(.02);
  expect(Math.abs(m.art.top-m.artCell.top)).toBeLessThanOrEqual(1);
  expect(Math.abs(m.art.bottom-m.rule.top)).toBeLessThanOrEqual(1.5);

  // Dynamic centre text must never bleed into either approved sibling.
  expect(m.title.left).toBeGreaterThanOrEqual(m.titleCell.left-1);
  expect(m.title.right).toBeLessThanOrEqual(m.titleCell.right+1);
  expect(m.lineBoxes[0].width).toBeLessThanOrEqual(m.titleCell.width-4);
  expect(m.lineBoxes[1].width).toBeLessThanOrEqual(m.titleCell.width-4);
  expect(m.bodyScroll).toBeLessThanOrEqual(m.bodyClient+1);
  await page.screenshot({path:`test-results/interclub-approved-header-${c.name}.png`,fullPage:false});
 });
}