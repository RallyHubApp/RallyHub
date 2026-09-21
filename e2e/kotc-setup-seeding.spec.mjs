import {test,expect} from '@playwright/test';

const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

test.use({viewport:{width:1440,height:900}});

test('desktop setup: visible seeding choice is the seeding order sent to the engine',async({page})=>{
  let createBody=null;
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
    if(url.pathname.includes(marker)){
      const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
      let body={};try{body=req.postDataJSON()||{};}catch{}
      if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
      if(name==='createKotcV2Session'){createBody=body;return json(route,{success:true,session:{id:'created'}});}
    }
    return json(route,[]);
  });

  await page.goto('/e2e/kotcHarness.html');
  const setup=page.getByTestId('kotc-setup');
  await expect(setup).toBeVisible();
  await expect(page.getByTestId('kotc-seeding-source')).toContainText('Roster order');

  // Choose the required Round 1 bench.
  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  await page.getByRole('button',{name:'Player 18',exact:true}).click();

  // Select DUPR, confirm the visible order changes, then use strict draw so the request
  // proves the exact selected ranking reached the engine.
  await page.getByTestId('kotc-seeding-source').click();
  await page.getByRole('option',{name:'Genuine DUPR'}).click();
  await expect(page.getByTestId('kotc-seeding-source')).toContainText('Genuine DUPR');
  await expect(page.getByText('Current starting order')).toBeVisible();
  await expect(page.getByTestId('kotc-player-order-1')).toContainText('Player 18');

  await page.getByTestId('kotc-draw-method').click();
  await page.getByRole('option',{name:'Strict Ranking'}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect.poll(()=>createBody!==null).toBe(true);
  expect(createBody.seedingMode).toBe('dupr');
  expect(createBody.drawMethod).toBe('strict');
  expect(createBody.playerOrder[0]).toBe('player-16');
  expect(createBody.playerOrder.slice(-2)).toEqual(['player-17','player-18']);
});

test('desktop setup: drag and drop ranking visibly changes the source to Manual ranking',async({page})=>{
  await page.route('**/api/apps/**',async route=>{
    const url=new URL(route.request().url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
    if(url.pathname.includes(marker))return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
    return json(route,[]);
  });
  await page.goto('/e2e/kotcHarness.html');
  await page.getByTestId('kotc-seeding-source').click();
  await page.getByRole('option',{name:'Genuine DUPR'}).click();
  const handle=page.getByTestId('kotc-ranking-drag-player-18');
  await handle.focus();await handle.press('Space');await handle.press('ArrowDown');await handle.press('Space');
  await expect(page.getByTestId('kotc-seeding-source')).toContainText('Manual ranking');
  await expect(page.getByTestId('kotc-player-order-1')).toContainText('Player 17');
});

test('desktop setup: Balanced Ranking spreads ranked strength evenly across four courts',async({page})=>{
  let createBody=null;
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
    if(url.pathname.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
    if(url.pathname.includes(marker)){
      const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
      let body={};try{body=req.postDataJSON()||{};}catch{}
      if(name==='getKotcV2State')return json(route,{session:null,participants:[],rounds:[],slots:[],matches:[],fixedPairs:[]});
      if(name==='createKotcV2Session'){createBody=body;return json(route,{success:true,session:{id:'created'}});}
    }
    return json(route,[]);
  });
  await page.goto('/e2e/kotcHarness.html');
  await expect(page.getByTestId('kotc-draw-method')).toContainText('Balanced Ranking');
  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect.poll(()=>createBody!==null).toBe(true);
  expect(createBody.drawMethod).toBe('balanced');
  expect(createBody.rankingOrder).toEqual(Array.from({length:18},(_,i)=>`player-${String(i+1).padStart(2,'0')}`));
  expect(createBody.playerOrder).toEqual([
    'player-01','player-08','player-09','player-16',
    'player-02','player-07','player-10','player-15',
    'player-03','player-06','player-11','player-14',
    'player-04','player-05','player-12','player-13',
    'player-17','player-18',
  ]);
});
