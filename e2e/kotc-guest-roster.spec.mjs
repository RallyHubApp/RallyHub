import { test, expect } from '@playwright/test';

const APP_ID=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

test.use({viewport:{width:390,height:844}});

test('17 members + 1 one-off guest creates event participant only',async({page})=>{
  const model={session:null,participants:[],rounds:[],slots:[],matches:[],createBody:null,playerWrites:0};
  await page.route('**/api/apps/**',async route=>{
    const req=route.request();const url=new URL(req.url());const path=url.pathname;
    if(path.includes('/entities/Player')&&req.method()!=='GET'){model.playerWrites++;return json(route,{})}
    if(path.includes('/entities/KotcPlayerAggregate'))return json(route,[]);
    const marker=`/api/apps/${APP_ID}/functions/`;const idx=path.indexOf(marker);
    if(idx>=0){
      const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{}}catch{}
      if(name==='getKotcV2State')return json(route,{session:model.session,participants:model.participants,rounds:model.rounds,slots:model.slots,matches:model.matches,fixedPairs:[],contactDirectory:{},currentAccessRole:'admin',isAdmin:true});
      if(name==='createKotcV2Session'){
        model.createBody=body;
        const order=body.playerOrder||[];const bench=new Set(body.round1BenchIds||[]);const active=order.filter(id=>!bench.has(id));
        model.session={id:'guest-session',name:'17 Members + 1 Guest',status:'ready',current_round_number:1,current_round_id:'round-1',revision:0,play_minutes:8,scoring_mode:'timed',venue_court_limit:4,available_court_limit:4};
        model.participants=order.map((id,i)=>id==='guest-e2e'?{id:'participant-guest',session_id:model.session.id,display_name:'Guest One',participant_type:'guest',source_type:'guest',status:'present',seed_rank:i+1}:{id:`participant-${id}`,session_id:model.session.id,player_id:id,display_name:id.replace('member-','Member '),participant_type:'member',source_type:'member',status:'present',seed_rank:i+1});
        const byRoster=Object.fromEntries(model.participants.map((p,i)=>[order[i],p.id]));
        model.rounds=[{id:'round-1',session_id:model.session.id,round_number:1,status:'proposed',proposal_revision:1,active_court_count:4,bench_count:2}];
        for(let court=1;court<=4;court++){
          const ids=active.slice((court-1)*4,court*4).map(id=>byRoster[id]);
          for(let i=0;i<4;i++)model.slots.push({id:`r1-c${court}-${i}`,session_id:model.session.id,round_id:'round-1',round_number:1,ladder_court_rank:court,team_side:i<2?'A':'B',slot_number:(i%2)+1,participant_id:ids[i]});
          model.matches.push({id:`match-${court}`,session_id:model.session.id,round_id:'round-1',round_number:1,ladder_court_rank:court,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:'scheduled',revision:0});
        }
        return json(route,{success:true,session:model.session});
      }
      return json(route,{success:true});
    }
    return json(route,[]);
  });

  await page.goto('/e2e/kotcGuestHarness.html');
  const setup=page.getByTestId('kotc-setup');
  await expect(setup).toContainText('18 players');
  await expect(setup).toContainText('4 courts');
  await expect(setup).toContainText('2 bench');
  await expect(page.getByRole('button',{name:'Guest One',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Member 16',exact:true}).click();
  await page.getByRole('button',{name:'Member 17',exact:true}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});

  expect(model.createBody.playerOrder).toContain('guest-e2e');
  const guest=model.participants.find(p=>p.participant_type==='guest');
  expect(guest).toBeTruthy();
  expect(guest.player_id).toBeUndefined();
  expect(model.playerWrites).toBe(0);
});
