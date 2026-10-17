# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-host-full.spec.mjs >> Full Tournival host journey 390px
- Location: e2e/tournival-host-full.spec.mjs:3:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Confirm seed order' }) resolved to 2 elements:
    1) <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">…</button> aka getByRole('button', { name: 'Confirm seed order', exact: true })
    2) <button disabled class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12">…</button> aka getByRole('button', { name: 'Confirm seed order first' })

Call log:
  - waiting for getByRole('button', { name: 'Confirm seed order' })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - heading "Full Tournival host journey — simulated backend" [level=1] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "Players (16)" [ref=e7] [cursor=pointer]
      - button "Setup" [ref=e13] [cursor=pointer]
      - button "Rehearsal" [ref=e16] [cursor=pointer]
      - button "Check-in" [ref=e19] [cursor=pointer]
      - button "DUPR" [ref=e25] [cursor=pointer]
      - button "Announcements" [ref=e32] [cursor=pointer]
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e41]:
          - paragraph [ref=e42]: Tournival Setup
          - paragraph [ref=e43]: 16 players registered
        - generic [ref=e44]:
          - generic [ref=e45]:
            - paragraph [ref=e46]: "16"
            - paragraph [ref=e47]: Players
          - generic [ref=e48]:
            - paragraph [ref=e49]: "16"
            - paragraph [ref=e50]: Active
          - generic [ref=e51]:
            - paragraph [ref=e52]: "0"
            - paragraph [ref=e53]: Bench
          - generic [ref=e54]:
            - paragraph [ref=e55]: 2h 13m
            - paragraph [ref=e56]: Est. duration
      - generic [ref=e57]:
        - heading "Session Configuration" [level=3] [ref=e58]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - text: Number of Courts
            - spinbutton [ref=e61]: "4"
          - generic [ref=e62]:
            - text: Group Rounds
            - combobox [ref=e63] [cursor=pointer]:
              - generic: 4 rounds
        - generic [ref=e67]:
          - text: Knockout pairs
          - combobox [ref=e68] [cursor=pointer]:
            - generic: 4 pairs / 8 players
        - generic [ref=e71]:
          - generic [ref=e72]:
            - text: Venue booked (minutes)
            - combobox [ref=e73] [cursor=pointer]:
              - generic: 120 min
          - generic [ref=e76]:
            - text: Changeover (minutes)
            - spinbutton [ref=e77]: "3"
          - generic [ref=e78]:
            - text: Average points match (minutes)
            - spinbutton [ref=e79]: "18"
        - generic [ref=e80]:
          - generic [ref=e81]: Match Format
          - generic [ref=e82]:
            - generic [ref=e83] [cursor=pointer]:
              - radio "10-min timed Most points wins" [ref=e84]
              - generic [ref=e88]:
                - paragraph [ref=e89]: 10-min timed
                - paragraph [ref=e90]: Most points wins
            - generic [ref=e91] [cursor=pointer]:
              - radio "15-min timed Most points wins" [ref=e92]
              - generic [ref=e96]:
                - paragraph [ref=e97]: 15-min timed
                - paragraph [ref=e98]: Most points wins
            - generic [ref=e99] [cursor=pointer]:
              - radio "First to 11 Win by 1" [checked] [ref=e100]
              - generic [ref=e104]:
                - paragraph [ref=e105]: First to 11
                - paragraph [ref=e106]: Win by 1
            - generic [ref=e107] [cursor=pointer]:
              - radio "First to 11 Win by 2" [ref=e108]
              - generic [ref=e112]:
                - paragraph [ref=e113]: First to 11
                - paragraph [ref=e114]: Win by 2
      - generic [ref=e115]:
        - checkbox "Optional DUPR reporting review after this event. Does not prevent unrated or unlinked players participating." [ref=e116]
        - generic [ref=e117]: Optional DUPR reporting review after this event. Does not prevent unrated or unlinked players participating.
      - generic [ref=e118]:
        - generic [ref=e119]:
          - generic [ref=e120]:
            - generic [ref=e121]:
              - heading "Seed Order" [level=3] [ref=e122]
              - generic [ref=e123]: Not confirmed
            - paragraph [ref=e124]: Drag players into the exact Round 1 seed/ranking order.
          - generic [ref=e125]:
            - button "Sort by ranking" [ref=e126] [cursor=pointer]
            - button "Randomise" [ref=e127] [cursor=pointer]
            - button "Reset" [ref=e128] [cursor=pointer]
        - generic [ref=e129]:
          - generic [ref=e130]:
            - button [ref=e131]
            - generic [ref=e139]: "#1"
            - generic [ref=e140]: S
            - generic [ref=e141]:
              - paragraph [ref=e142]: Simulated Player 1
              - paragraph [ref=e143]: "Current ranking: 5"
            - generic [ref=e144]: Active
          - generic [ref=e145]:
            - button [ref=e146]
            - generic [ref=e154]: "#2"
            - generic [ref=e155]: S
            - generic [ref=e156]:
              - paragraph [ref=e157]: Simulated Player 2
              - paragraph [ref=e158]: "Current ranking: 4.9"
            - generic [ref=e159]: Active
          - generic [ref=e160]:
            - button [ref=e161]
            - generic [ref=e169]: "#3"
            - generic [ref=e170]: S
            - generic [ref=e171]:
              - paragraph [ref=e172]: Simulated Player 3
              - paragraph [ref=e173]: "Current ranking: 4.8"
            - generic [ref=e174]: Active
          - generic [ref=e175]:
            - button [ref=e176]
            - generic [ref=e184]: "#4"
            - generic [ref=e185]: S
            - generic [ref=e186]:
              - paragraph [ref=e187]: Simulated Player 4
              - paragraph [ref=e188]: "Current ranking: 4.7"
            - generic [ref=e189]: Active
          - generic [ref=e190]:
            - button [ref=e191]
            - generic [ref=e199]: "#5"
            - generic [ref=e200]: S
            - generic [ref=e201]:
              - paragraph [ref=e202]: Simulated Player 5
              - paragraph [ref=e203]: "Current ranking: 4.6"
            - generic [ref=e204]: Active
          - generic [ref=e205]:
            - button [ref=e206]
            - generic [ref=e214]: "#6"
            - generic [ref=e215]: S
            - generic [ref=e216]:
              - paragraph [ref=e217]: Simulated Player 6
              - paragraph [ref=e218]: "Current ranking: 4.5"
            - generic [ref=e219]: Active
          - generic [ref=e220]:
            - button [ref=e221]
            - generic [ref=e229]: "#7"
            - generic [ref=e230]: S
            - generic [ref=e231]:
              - paragraph [ref=e232]: Simulated Player 7
              - paragraph [ref=e233]: "Current ranking: 4.4"
            - generic [ref=e234]: Active
          - generic [ref=e235]:
            - button [ref=e236]
            - generic [ref=e244]: "#8"
            - generic [ref=e245]: S
            - generic [ref=e246]:
              - paragraph [ref=e247]: Simulated Player 8
              - paragraph [ref=e248]: "Current ranking: 4.3"
            - generic [ref=e249]: Active
          - generic [ref=e250]:
            - button [ref=e251]
            - generic [ref=e259]: "#9"
            - generic [ref=e260]: S
            - generic [ref=e261]:
              - paragraph [ref=e262]: Simulated Player 9
              - paragraph [ref=e263]: "Current ranking: 4.2"
            - generic [ref=e264]: Active
          - generic [ref=e265]:
            - button [ref=e266]
            - generic [ref=e274]: "#10"
            - generic [ref=e275]: S
            - generic [ref=e276]:
              - paragraph [ref=e277]: Simulated Player 10
              - paragraph [ref=e278]: "Current ranking: 4.1"
            - generic [ref=e279]: Active
          - generic [ref=e280]:
            - button [ref=e281]
            - generic [ref=e289]: "#11"
            - generic [ref=e290]: S
            - generic [ref=e291]:
              - paragraph [ref=e292]: Simulated Player 11
              - paragraph [ref=e293]: "Current ranking: 4"
            - generic [ref=e294]: Active
          - generic [ref=e295]:
            - button [ref=e296]
            - generic [ref=e304]: "#12"
            - generic [ref=e305]: S
            - generic [ref=e306]:
              - paragraph [ref=e307]: Simulated Player 12
              - paragraph [ref=e308]: "Current ranking: 3.9"
            - generic [ref=e309]: Active
          - generic [ref=e310]:
            - button [ref=e311]
            - generic [ref=e319]: "#13"
            - generic [ref=e320]: S
            - generic [ref=e321]:
              - paragraph [ref=e322]: Simulated Player 13
              - paragraph [ref=e323]: "Current ranking: 3.8"
            - generic [ref=e324]: Active
          - generic [ref=e325]:
            - button [ref=e326]
            - generic [ref=e334]: "#14"
            - generic [ref=e335]: S
            - generic [ref=e336]:
              - paragraph [ref=e337]: Simulated Player 14
              - paragraph [ref=e338]: "Current ranking: 3.7"
            - generic [ref=e339]: Active
          - generic [ref=e340]:
            - button [ref=e341]
            - generic [ref=e349]: "#15"
            - generic [ref=e350]: S
            - generic [ref=e351]:
              - paragraph [ref=e352]: Simulated Player 15
              - paragraph [ref=e353]: "Current ranking: 3.5999999999999996"
            - generic [ref=e354]: Active
          - generic [ref=e355]:
            - button [ref=e356]
            - generic [ref=e364]: "#16"
            - generic [ref=e365]: S
            - generic [ref=e366]:
              - paragraph [ref=e367]: Simulated Player 16
              - paragraph [ref=e368]: "Current ranking: 3.5"
            - generic [ref=e369]: Active
        - button "Confirm seed order" [ref=e371] [cursor=pointer]
      - generic [ref=e372]:
        - paragraph [ref=e373]: Estimated Timeline
        - generic [ref=e374]:
          - generic [ref=e375]:
            - generic [ref=e376]: Group stage (4 rounds)
            - generic [ref=e377]: 81min
          - generic [ref=e378]:
            - generic [ref=e379]: Knockout including final (4 pairs)
            - generic [ref=e380]: 39min
          - generic [ref=e381]:
            - generic [ref=e382]: Setup and changeover allowance
            - generic [ref=e383]: 13min
          - generic [ref=e385]:
            - generic [ref=e386]: Total
            - generic [ref=e387]: 2h 13m
          - alert [ref=e388]: "Warning: estimated overrun 13 min beyond 120-minute booking. Host can still proceed."
      - button "Confirm seed order first" [disabled]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const size of [{width:390,height:844},{width:1280,height:850}])
  3  | test(`Full Tournival host journey ${size.width}px`,async({page})=>{
  4  |  await page.setViewportSize(size);
  5  |  page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
  6  |  page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  7  |  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text())});
  8  |  await page.goto('/e2e/tournivalHostHarness.html');
  9  |  console.log('BODY:',(await page.locator('body').innerText()).slice(0,350));
  10 |  await expect(page.getByText('Tournival Setup')).toBeVisible();
  11 |  await expect(page.getByText('2 rounds').count()).resolves.toBeGreaterThanOrEqual(1).catch(()=>{});
> 12 |  await page.getByRole('button',{name:'Confirm seed order'}).click();
     |                                                             ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Confirm seed order' }) resolved to 2 elements:
  13 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  14 |  await page.getByText('Generate Fixtures & Start').click();
  15 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  16 |  const allocate=page.getByRole('button',{name:'Allocate free courts'});
  17 |  for(let i=0;i<8;i++){
  18 |   if(await allocate.isEnabled())await allocate.click();
  19 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  20 |   await expect(active).toBeVisible();
  21 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  22 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  23 |   await active.getByText('Save score').click();
  24 |  }
  25 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
  26 |  await page.getByRole('button',{name:'Standings'}).click();
  27 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  28 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  29 |  expect(overflow).toBeLessThanOrEqual(1);
  30 | });
  31 | 
```