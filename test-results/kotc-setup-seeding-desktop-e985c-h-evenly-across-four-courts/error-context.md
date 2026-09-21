# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-setup-seeding.spec.mjs >> desktop setup: Balanced Ranking spreads ranked strength evenly across four courts
- Location: e2e/kotc-setup-seeding.spec.mjs:65:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 9
+ Received  + 9

  Array [
-   "player-1",
-   "player-8",
-   "player-9",
+   "player-01",
+   "player-08",
+   "player-09",
    "player-16",
-   "player-2",
-   "player-7",
+   "player-02",
+   "player-07",
    "player-10",
    "player-15",
-   "player-3",
-   "player-6",
+   "player-03",
+   "player-06",
    "player-11",
    "player-14",
-   "player-4",
-   "player-5",
+   "player-04",
+   "player-05",
    "player-12",
    "player-13",
    "player-17",
    "player-18",
  ]
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e11]:
        - paragraph [ref=e12]: King of the Court
        - heading "Set up tonight’s session" [level=2] [ref=e13]
        - paragraph [ref=e14]: Confirm the hall settings, decide the Round 1 draw and choose the bench. You can review the actual courts before anything starts.
      - generic [ref=e15]:
        - generic [ref=e16]: 18 players
        - generic [ref=e17]: 4 courts
        - generic [ref=e18]: 2 bench
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e27]:
            - paragraph [ref=e28]: 1 · Session settings
            - paragraph [ref=e29]: The essentials for this hall and tonight’s scoring.
          - generic [ref=e30]:
            - generic [ref=e31]:
              - text: Venue courts
              - spinbutton [ref=e32]: "4"
            - generic [ref=e33]:
              - text: Hall / session duration
              - generic [ref=e34]:
                - spinbutton [ref=e35]: "90"
                - generic [ref=e36]: min
            - generic [ref=e37]:
              - text: Scoring
              - combobox [ref=e38] [cursor=pointer]:
                - generic: Timed rounds
            - generic [ref=e41]:
              - text: Round duration
              - generic [ref=e42]:
                - spinbutton [ref=e43]: "8"
                - generic [ref=e44]: min
          - generic [ref=e45] [cursor=pointer]:
            - checkbox "Counts toward club leaderboard Turn this on only for an official club competition. Test mode is always excluded." [checked] [ref=e46]
            - generic [ref=e47]:
              - text: Counts toward club leaderboard
              - generic [ref=e48]: Turn this on only for an official club competition. Test mode is always excluded.
        - generic [ref=e49]:
          - generic [ref=e55]:
            - paragraph [ref=e56]: 2 · Round 1 setup
            - paragraph [ref=e57]: Choose how the starting order is built and how that order is distributed across courts.
          - generic [ref=e58]:
            - generic [ref=e59]:
              - text: Starting order
              - combobox [ref=e60] [cursor=pointer]:
                - generic: Roster order
              - paragraph [ref=e63]: This sets the starting order only. RallyHub does not invent ratings.
            - generic [ref=e64]:
              - text: Round 1 draw
              - combobox [ref=e65] [cursor=pointer]:
                - generic: Balanced Ranking
              - paragraph [ref=e68]: Balanced Ranking uses your 1-to-N order to spread strength across the courts and, where possible, pairs the strongest player with the weakest in that court. Strict Ranking keeps the strongest four together, then the next four, and so on.
          - button "Review player order (18) Show" [ref=e69] [cursor=pointer]:
            - generic [ref=e70]:
              - text: Review player order
              - generic [ref=e71]: (18)
            - generic [ref=e72]: Show
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e82]:
              - paragraph [ref=e83]: 3 · Choose Round 1 bench
              - paragraph [ref=e84]: Choose exactly 2. You can still swap the proposed Round 1 courts before starting.
            - generic [ref=e85]: 2/2
          - generic [ref=e86]:
            - button "Player 01" [ref=e87] [cursor=pointer]
            - button "Player 02" [ref=e90] [cursor=pointer]
            - button "Player 03" [ref=e93] [cursor=pointer]
            - button "Player 04" [ref=e96] [cursor=pointer]
            - button "Player 05" [ref=e99] [cursor=pointer]
            - button "Player 06" [ref=e102] [cursor=pointer]
            - button "Player 07" [ref=e105] [cursor=pointer]
            - button "Player 08" [ref=e108] [cursor=pointer]
            - button "Player 09" [ref=e111] [cursor=pointer]
            - button "Player 10" [ref=e114] [cursor=pointer]
            - button "Player 11" [ref=e117] [cursor=pointer]
            - button "Player 12" [ref=e120] [cursor=pointer]
            - button "Player 13" [ref=e123] [cursor=pointer]
            - button "Player 14" [ref=e126] [cursor=pointer]
            - button "Player 15" [ref=e129] [cursor=pointer]
            - button "Player 16" [ref=e132] [cursor=pointer]
            - button "Player 17 ✓" [pressed] [ref=e135] [cursor=pointer]:
              - generic [ref=e136]:
                - generic [ref=e137]: Player 17
                - generic [ref=e138]: ✓
            - button "Player 18 ✓" [pressed] [ref=e139] [cursor=pointer]:
              - generic [ref=e140]:
                - generic [ref=e141]: Player 18
                - generic [ref=e142]: ✓
      - complementary [ref=e143]:
        - generic [ref=e144]:
          - generic [ref=e145]:
            - paragraph [ref=e146]: Ready check
            - heading "Create Round 1" [level=3] [ref=e147]
            - paragraph [ref=e148]: RallyHub will generate the proposed courts next. You will review them before the timer starts.
          - generic [ref=e149]:
            - generic [ref=e150]:
              - generic [ref=e151]: Players
              - strong [ref=e152]: "18"
            - generic [ref=e153]:
              - generic [ref=e154]: Active courts
              - strong [ref=e155]: "4"
            - generic [ref=e156]:
              - generic [ref=e157]: Bench
              - strong [ref=e158]: "2"
            - generic [ref=e159]:
              - generic [ref=e160]: Scoring
              - strong [ref=e161]: 8 min timed rounds
            - generic [ref=e162]:
              - generic [ref=e163]: Starting order
              - strong [ref=e164]: Roster order
            - generic [ref=e165]:
              - generic [ref=e166]: Draw
              - strong [ref=e167]: Balanced Ranking
          - generic [ref=e172]:
            - paragraph [ref=e173]: Ready to create the draw
            - paragraph [ref=e174]: Nothing starts until you review Round 1 and press Start Round 1.
          - button "Create Round 1" [ref=e175] [cursor=pointer]
  - generic [ref=e176]:
    - button "Scroll up" [ref=e177] [cursor=pointer]
    - button "Scroll down" [disabled]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | 
  3  | const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  4  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  5  | 
  6  | test.use({viewport:{width:1440,height:900}});
  7  | 
  8  | test('desktop setup: visible seeding choice is the seeding order sent to the engine',async({page})=>{
  9  |   let createBody=null;
  10 |   await page.route('**/api/apps/**',async route=>{
  11 |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  12 |     if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
  13 |     if(url.pathname.includes(marker)){
  14 |       const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  15 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  16 |       if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
  17 |       if(name==='createKotcV2Session'){createBody=body;return json(route,{success:true,session:{id:'created'}});}
  18 |     }
  19 |     return json(route,[]);
  20 |   });
  21 | 
  22 |   await page.goto('/e2e/kotcHarness.html');
  23 |   const setup=page.getByTestId('kotc-setup');
  24 |   await expect(setup).toBeVisible();
  25 |   await expect(page.getByTestId('kotc-seeding-source')).toContainText('Roster order');
  26 | 
  27 |   // Choose the required Round 1 bench.
  28 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  29 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  30 | 
  31 |   // Select DUPR, confirm the visible order changes, then use strict draw so the request
  32 |   // proves the exact selected ranking reached the engine.
  33 |   await page.getByTestId('kotc-seeding-source').click();
  34 |   await page.getByRole('option',{name:'Genuine DUPR'}).click();
  35 |   await expect(page.getByTestId('kotc-seeding-source')).toContainText('Genuine DUPR');
  36 |   await expect(page.getByText('Current starting order')).toBeVisible();
  37 |   await expect(page.getByTestId('kotc-player-order-1')).toContainText('Player 18');
  38 | 
  39 |   await page.getByTestId('kotc-draw-method').click();
  40 |   await page.getByRole('option',{name:'Strict Ranking'}).click();
  41 |   await page.getByTestId('kotc-create-session').click();
  42 |   await expect.poll(()=>createBody!==null).toBe(true);
  43 |   expect(createBody.seedingMode).toBe('dupr');
  44 |   expect(createBody.drawMethod).toBe('strict');
  45 |   expect(createBody.playerOrder[0]).toBe('player-16');
  46 |   expect(createBody.playerOrder.slice(-2)).toEqual(['player-17','player-18']);
  47 | });
  48 | 
  49 | test('desktop setup: drag and drop ranking visibly changes the source to Manual ranking',async({page})=>{
  50 |   await page.route('**/api/apps/**',async route=>{
  51 |     const url=new URL(route.request().url()),marker=`/api/apps/${APP_ID}/functions/`;
  52 |     if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
  53 |     if(url.pathname.includes(marker))return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
  54 |     return json(route,[]);
  55 |   });
  56 |   await page.goto('/e2e/kotcHarness.html');
  57 |   await page.getByTestId('kotc-seeding-source').click();
  58 |   await page.getByRole('option',{name:'Genuine DUPR'}).click();
  59 |   const handle=page.getByTestId('kotc-ranking-drag-player-18');
  60 |   await handle.focus();await handle.press('Space');await handle.press('ArrowDown');await handle.press('Space');
  61 |   await expect(page.getByTestId('kotc-seeding-source')).toContainText('Manual ranking');
  62 |   await expect(page.getByTestId('kotc-player-order-1')).toContainText('Player 17');
  63 | });
  64 | 
  65 | test('desktop setup: Balanced Ranking spreads ranked strength evenly across four courts',async({page})=>{
  66 |   let createBody=null;
  67 |   await page.route('**/api/apps/**',async route=>{
  68 |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  69 |     if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
  70 |     if(url.pathname.includes(marker)){
  71 |       const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  72 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  73 |       if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
  74 |       if(name==='createKotcV2Session'){createBody=body;return json(route,{success:true,session:{id:'created'}});}
  75 |     }
  76 |     return json(route,[]);
  77 |   });
  78 |   await page.goto('/e2e/kotcHarness.html');
  79 |   await expect(page.getByTestId('kotc-draw-method')).toContainText('Balanced Ranking');
  80 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  81 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  82 |   await page.getByTestId('kotc-create-session').click();
  83 |   await expect.poll(()=>createBody!==null).toBe(true);
  84 |   expect(createBody.drawMethod).toBe('balanced');
> 85 |   expect(createBody.playerOrder).toEqual([
     |                                  ^ Error: expect(received).toEqual(expected) // deep equality
  86 |     'player-1','player-8','player-9','player-16',
  87 |     'player-2','player-7','player-10','player-15',
  88 |     'player-3','player-6','player-11','player-14',
  89 |     'player-4','player-5','player-12','player-13',
  90 |     'player-17','player-18',
  91 |   ]);
  92 | });
  93 | 
```