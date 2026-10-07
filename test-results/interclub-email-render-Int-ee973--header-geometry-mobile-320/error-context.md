# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interclub-email-render.spec.mjs >> Interclub approved header geometry mobile-320
- Location: e2e/interclub-email-render.spec.mjs:10:2

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 0.06
Received:   0.09843334005112592
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - img "Clare Pickleball logo" [ref=e2]
  - generic [ref=e3]:
    - generic [ref=e4]: Clare v Galway
    - generic [ref=e5]: INTERCLUB
  - generic [ref=e6]: Your Personal Results
  - img "Pickleball" [ref=e7]
  - paragraph [ref=e8]: Hi Mark,
  - paragraph [ref=e9]: Thanks very much for taking part in the Clare v Galway Interclub. We hope you enjoyed the games and the chance to meet and play with people from both clubs.
  - paragraph [ref=e10]: Your individual results are now available below. You can see your own games and scores, your overall performance, the final team result and both team podiums.
  - link "View My Results ›" [ref=e11] [cursor=pointer]:
    - /url: https://rallyhub.ie/interclub-results/qa-player
  - img "Trophy" [ref=e12]
  - generic [ref=e13]: Looking forward to the return fixture
  - generic [ref=e14]: This is the start of what we hope will become a regular home-and-away Interclub fixture, with a perpetual trophy between Clare and Galway. The next meeting will be in Galway, and we’re already looking forward to playing you again.
  - link [ref=e15] [cursor=pointer]:
    - /url: https://drive.google.com/drive/folders/1ynGB1ER2ipB2p_q0LB-c7DteAFxtVYXf?usp=sharing
    - img "Photos" [ref=e16]
  - link "Photos from today" [ref=e18] [cursor=pointer]:
    - /url: https://drive.google.com/drive/folders/1ynGB1ER2ipB2p_q0LB-c7DteAFxtVYXf?usp=sharing
  - link "Open the shared photo folder to view photographs from the day." [ref=e20] [cursor=pointer]:
    - /url: https://drive.google.com/drive/folders/1ynGB1ER2ipB2p_q0LB-c7DteAFxtVYXf?usp=sharing
  - img "More pickleball" [ref=e21]
  - generic [ref=e22]: More pickleball with RallyHub
  - generic [ref=e23]: Get alerts for upcoming tournaments and events, and discover more places to play around Ireland.
  - link "Never miss another pickleball tournament ›" [ref=e24] [cursor=pointer]:
    - /url: https://rallyhub.ie/directory?join=1&utm_source=interclub_results
    - text: Never miss another pickleball tournament
    - generic [ref=e25]: ›
  - link "Explore the RallyHub Directory ›" [ref=e26] [cursor=pointer]:
    - /url: http://127.0.0.1:4173/directory
    - text: Explore the RallyHub Directory
    - generic [ref=e27]: ›
  - link "Send us your feedback ›" [ref=e28] [cursor=pointer]:
    - /url: http://127.0.0.1:4173/contact
    - text: Send us your feedback
    - generic [ref=e29]: ›
  - text: Thanks again for being part of the day. We look forward to welcoming you back on court and to the next Clare v Galway meeting in Galway.
  - img "Brian Moore · Chairperson, Clare Pickleball · Founder, RallyHub.ie" [ref=e30]
  - link [ref=e32] [cursor=pointer]:
    - /url: tel:+353878100333
    - img "Call 087 810 0333" [ref=e33]
  - link [ref=e34] [cursor=pointer]:
    - /url: mailto:clarepb2025@gmail.com
    - img "Email Clare Pickleball" [ref=e35]
  - link [ref=e36] [cursor=pointer]:
    - /url: https://clarepickleball.ie/
    - img "ClarePickleball.ie" [ref=e37]
  - img "Clare Pickleball" [ref=e39]
  - link [ref=e40] [cursor=pointer]:
    - /url: https://www.facebook.com/ClarePickleball/
    - img "Facebook" [ref=e41]
  - link [ref=e42] [cursor=pointer]:
    - /url: https://www.instagram.com/clarepickleball/
    - img "Instagram" [ref=e43]
  - link [ref=e44] [cursor=pointer]:
    - /url: https://clarepickleball.ie/
    - img "Website" [ref=e45]
  - link [ref=e47] [cursor=pointer]:
    - /url: https://rallyhub.ie/
    - img "RallyHub.ie" [ref=e48]
  - link "View My Results" [ref=e49] [cursor=pointer]:
    - /url: https://rallyhub.ie/interclub-results/qa-player
  - text: "|"
  - link "Facebook" [ref=e50] [cursor=pointer]:
    - /url: https://www.facebook.com/ClarePickleball/
  - text: "|"
  - link "Instagram" [ref=e51] [cursor=pointer]:
    - /url: https://www.instagram.com/clarepickleball/
  - text: "|"
  - link "ClarePickleball.ie" [ref=e52] [cursor=pointer]:
    - /url: https://clarepickleball.ie/
  - text: "|"
  - link "RallyHub Directory" [ref=e53] [cursor=pointer]:
    - /url: http://127.0.0.1:4173/directory
  - text: "|"
  - link "Events" [ref=e54] [cursor=pointer]:
    - /url: http://127.0.0.1:4173/events
  - text: "|"
  - link "Feedback" [ref=e55] [cursor=pointer]:
    - /url: http://127.0.0.1:4173/contact
```

# Test source

```ts
  1  | import {test,expect} from "@playwright/test";
  2  | 
  3  | const cases=[
  4  |  {name:"desktop-600",width:600,height:900},
  5  |  {name:"mobile-390",width:390,height:900},
  6  |  {name:"mobile-320",width:320,height:900}
  7  | ];
  8  | 
  9  | for(const c of cases){
  10 |  test(`Interclub approved header geometry ${c.name}`,async({page})=>{
  11 |   await page.setViewportSize({width:c.width,height:c.height});
  12 |   await page.goto("http://127.0.0.1:4173/email-qa/interclub.html",{waitUntil:"networkidle"});
  13 |   const title=page.locator(".header-title");
  14 |   const spans=title.locator("span");
  15 |   await expect(spans).toHaveCount(2);
  16 |   await expect(spans.nth(0)).toHaveText(/Clare v Galway/i);
  17 |   await expect(spans.nth(1)).toHaveText(/Interclub/i);
  18 | 
  19 |   const m=await page.evaluate(()=>{
  20 |    const q=s=>document.querySelector(s);
  21 |    const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  22 |    const logo=q(".header-logo"),art=q(".header-art"),title=q(".header-title"),rule=q(".header-lower-rule");
  23 |    const logoCell=logo.closest("td"),titleCell=title.closest("td"),artCell=art.closest("td");
  24 |    const lineBoxes=[...title.querySelectorAll("span")].map(box);
  25 |    return {
  26 |     logo:box(logo),art:box(art),title:box(title),rule:box(rule),
  27 |     logoCell:box(logoCell),titleCell:box(titleCell),artCell:box(artCell),
  28 |     lineBoxes,
  29 |     bodyScroll:document.documentElement.scrollWidth,
  30 |     bodyClient:document.documentElement.clientWidth
  31 |    };
  32 |   });
  33 | 
  34 |   const shellWidth=m.logoCell.width+m.titleCell.width+m.artCell.width;
  35 |   expect(Math.abs(m.logoCell.width/shellWidth-.24)).toBeLessThan(.025);
  36 |   expect(Math.abs(m.titleCell.width/shellWidth-.46)).toBeLessThan(.025);
  37 |   expect(Math.abs(m.artCell.width/shellWidth-.30)).toBeLessThan(.025);
  38 | 
  39 |   expect(m.logo.width/m.logoCell.width).toBeGreaterThan(.9);
> 40 |   expect(Math.abs((m.art.width/m.art.height)-(180/138))).toBeLessThan(.06);
     |                                                          ^ Error: expect(received).toBeLessThan(expected)
  41 |   expect(Math.abs(m.art.bottom-m.rule.top)).toBeLessThanOrEqual(1.5);
  42 |   expect(m.title.left).toBeGreaterThanOrEqual(m.titleCell.left-1);
  43 |   expect(m.title.right).toBeLessThanOrEqual(m.titleCell.right+1);
  44 |   expect(m.lineBoxes[0].width).toBeLessThanOrEqual(m.titleCell.width-4);
  45 |   expect(m.lineBoxes[1].width).toBeLessThanOrEqual(m.titleCell.width-4);
  46 |   expect(m.bodyScroll).toBeLessThanOrEqual(m.bodyClient+1);
  47 |   await page.screenshot({path:`test-results/interclub-approved-header-${c.name}.png`,fullPage:false});
  48 |  });
  49 | }
```