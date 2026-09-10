# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-setup-seeding.spec.mjs >> desktop setup: visible seeding choice is the seeding order sent to the engine
- Location: e2e/kotc-setup-seeding.spec.mjs:8:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByText('Current starting order').locator('..').locator('..')
Expected substring: "Player 18"
Received string:    "Current starting orderMoving anyone manually changes the source to Manual ranking.Genuine DUPR"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByText('Current starting order').locator('..').locator('..') with timeout 3000ms
  - waiting for getByText('Current starting order').locator('..').locator('..')
    10 × locator resolved to <div data-dynamic-content="true" data-source-location="src/components/kotc/KotcSetupPanel.jsx:52:96" class="px-3 py-2 border-b bg-secondary/30 flex flex-wrap items-center justify-between gap-2">…</div>
       - unexpected value "Current starting orderMoving anyone manually changes the source to Manual ranking.Genuine DUPR"

```

```yaml
- paragraph: Current starting order
- paragraph: Moving anyone manually changes the source to Manual ranking.
- text: Genuine DUPR
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
  37 |   const orderPanel=page.getByText('Current starting order').locator('..').locator('..');
> 38 |   await expect(orderPanel).toContainText('Player 18');
     |                            ^ Error: expect(locator).toContainText(expected) failed
  39 | 
  40 |   await page.getByTestId('kotc-draw-method').click();
  41 |   await page.getByRole('option',{name:'Strict Ranking'}).click();
  42 |   await page.getByTestId('kotc-create-session').click();
  43 |   await expect.poll(()=>createBody!==null).toBe(true);
  44 |   expect(createBody.seedingMode).toBe('dupr');
  45 |   expect(createBody.drawMethod).toBe('strict');
  46 |   expect(createBody.playerOrder[0]).toBe('player-16');
  47 |   expect(createBody.playerOrder.slice(-2)).toEqual(['player-17','player-18']);
  48 | });
  49 | 
  50 | test('desktop setup: a manual arrow adjustment visibly changes the source to Manual ranking',async({page})=>{
  51 |   await page.route('**/api/apps/**',async route=>{
  52 |     const url=new URL(route.request().url()),marker=`/api/apps/${APP_ID}/functions/`;
  53 |     if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
  54 |     if(url.pathname.includes(marker))return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
  55 |     return json(route,[]);
  56 |   });
  57 |   await page.goto('/e2e/kotcHarness.html');
  58 |   await page.getByTestId('kotc-seeding-source').click();
  59 |   await page.getByRole('option',{name:'Genuine DUPR'}).click();
  60 |   await page.getByRole('button',{name:'Move Player 18 down'}).click();
  61 |   await expect(page.getByTestId('kotc-seeding-source')).toContainText('Manual ranking');
  62 | });
  63 | 
```