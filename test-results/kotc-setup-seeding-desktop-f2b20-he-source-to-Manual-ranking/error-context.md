# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-setup-seeding.spec.mjs >> desktop setup: drag and drop ranking visibly changes the source to Manual ranking
- Location: e2e/kotc-setup-seeding.spec.mjs:49:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-seeding-source')
Expected substring: "Manual ranking"
Received string:    "Genuine DUPR"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('kotc-seeding-source') with timeout 3000ms
  - waiting for getByTestId('kotc-seeding-source')
    10 × locator resolved to <button dir="ltr" type="button" role="combobox" data-state="closed" aria-expanded="false" aria-autocomplete="none" aria-controls="radix-:r3:" data-dynamic-content="false" data-testid="kotc-seeding-source" data-source-location="src/components/kotc/KotcSetupPanel.jsx:57:111" class="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus…>…</button>
       - unexpected value "Genuine DUPR"

```

```yaml
- combobox: Genuine DUPR
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
> 61 |   await expect(page.getByTestId('kotc-seeding-source')).toContainText('Manual ranking');
     |                                                         ^ Error: expect(locator).toContainText(expected) failed
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
  85 |   expect(createBody.playerOrder).toEqual([
  86 |     'player-1','player-8','player-9','player-16',
  87 |     'player-2','player-7','player-10','player-15',
  88 |     'player-3','player-6','player-11','player-14',
  89 |     'player-4','player-5','player-12','player-13',
  90 |     'player-17','player-18',
  91 |   ]);
  92 | });
  93 | 
```