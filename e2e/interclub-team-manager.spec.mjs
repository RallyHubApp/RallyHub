import { test, expect } from '@playwright/test';

const TOKEN='cctm_0123456789abcdef0123456789abcdef';
const APP_ID=process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

function player(i){return {id:`galway-${i}`,displayName:`Galway Player ${String(i).padStart(2,'0')}`,gender:i%2?'Female':'Male',rank:i,playingCategory:'',rosterRole:'rotation',registered:true};}

test.use({viewport:{width:390,height:844}});

test('visiting team manager can repeatedly rank, grade and save an evolving Galway roster',async({page})=>{
  const model={players:Array.from({length:9},(_,i)=>player(i+1)),savedAt:null,saves:[]};
  page.on('console',msg=>console.log('BROWSER',msg.type(),msg.text()));
  page.on('request',req=>{if(req.url().includes('/api/'))console.log('REQUEST',req.method(),req.url());});
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.pathname.includes('/analytics/')) return json(route,{});
    const marker=`/api/apps/${APP_ID}/functions/interclubTeamManager`;
    if(url.pathname.includes(marker)){
      let body={};try{body=req.postDataJSON()||{};}catch{}
      expect(body.token).toBe(TOKEN);
      if((body.action||'get')==='save'){
        model.saves.push(body);
        const byId=new Map(model.players.map(p=>[p.id,p]));
        model.players=body.orderedParticipantIds.map((id,index)=>{
          const edit=(body.players||[]).find(x=>x.id===id)||{};
          return {...byId.get(id),rank:index+1,playingCategory:edit.playingCategory||'',rosterRole:edit.rosterRole||'rotation'};
        });
        model.savedAt=new Date().toISOString();
        return json(route,{success:true,savedAt:model.savedAt,changed:model.players.length,teamName:'Galway Pickleball'});
      }
      return json(route,{success:true,event:{id:'event-e2e',eventName:'Clare Pickleball v Galway Pickleball',teamName:'Galway Pickleball',side:'club_b',clubAName:'Clare Pickleball',clubBName:'Galway Pickleball',clubALogo:'',clubBLogo:'',clubAPrimary:'#2563eb',clubBPrimary:'#7f1d1d',date:'2026-10-04',venue:'St. Joseph’s Doora Barefield',savedAt:model.savedAt},players:model.players});
    }
    return json(route,{});
  });

  await page.goto('/e2e/interclubTeamManagerHarness.html');
  await expect(page.getByRole('heading',{name:'Galway Pickleball'})).toBeVisible();
  await expect(page.getByText('9 on roster')).toBeVisible();
  await expect(page.getByText('9 registered')).toBeVisible();
  await expect(page.getByText('Needs saving')).toBeVisible();

  const move9=page.getByRole('button',{name:'Move Galway Player 09'});
  await move9.focus();await move9.press('Space');await move9.press('ArrowUp');await move9.press('Space');
  const categorySelect=page.getByRole('combobox').first();
  await categorySelect.click();await page.getByRole('option',{name:'Improver'}).click();
  await page.getByRole('button',{name:'Save Team'}).click();
  await expect(page.getByText(/Saved 9 players/)).toBeVisible();
  expect(model.saves).toHaveLength(1);
  expect(model.saves[0].orderedParticipantIds.at(-2)).toBe('galway-9');
  expect(model.saves[0].players.find(p=>p.id==='galway-1')?.playingCategory).toBe('improver');

  model.players.push(player(10));
  model.savedAt=null;
  await page.getByRole('button',{name:'Refresh roster'}).click();
  await expect(page.getByText('10 on roster')).toBeVisible();
  await expect(page.getByText('Needs saving')).toBeVisible();
  await expect(page.getByText('Galway Player 10')).toBeVisible();
  const save=page.getByRole('button',{name:'Save Team'});
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText(/Saved 10 players/)).toBeVisible();
  expect(model.saves).toHaveLength(2);
  expect(model.saves[1].orderedParticipantIds).toHaveLength(10);
});