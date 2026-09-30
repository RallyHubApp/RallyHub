import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const tenantId='6a9b7790bc4a8d299938bda9';
const clubId='6a9b779684daba85b3ffdeb5';
const user={id:'finance-admin-e2e',email:'admin@example.test',full_name:'RallyHub Admin',role:'admin',approval_status:'approved',active_tenant_id:tenantId,active_club_id:clubId,active_club_role:'club_admin',active_club_name:'Clare Pickleball',kotc_role:'super_admin'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

const venues=[
  {id:'doora',tenant_id:tenantId,club_id:clubId,name:'St Joseph’s, Doora Barefield',address:'Gurteen, Quin Road, Co. Clare',hourly_hire_rate:30,finance_tracking_enabled:true,status:'active'},
  {id:'enn',tenant_id:tenantId,club_id:clubId,name:'Ennistymon',address:'Parliament Street, Ennistymon',hourly_hire_rate:45,finance_tracking_enabled:true,status:'active'},
  {id:'corofin',tenant_id:tenantId,club_id:clubId,name:'Corofin',address:'Corofin GAA Sports Hall',finance_tracking_enabled:false,status:'active'},
  {id:'clarecastle',tenant_id:tenantId,club_id:clubId,name:'Clarecastle',finance_tracking_enabled:false,status:'active'},
  {id:'shannon',tenant_id:tenantId,club_id:clubId,name:'Shannon',finance_tracking_enabled:false,status:'active'},
];
const rules=[
  {id:'d1',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  {id:'d2',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  {id:'d3',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  {id:'d4',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  {id:'e1',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'19:00',end_time:'20:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_pattern_key:'7pm ennistymon pickeball session|Wednesday|19:00|20:00|ennistymon community centre|parliament st ennistimon ennistymon',spond_heading:'7pm Ennistymon Pickeball Session',active:true},
  {id:'e2',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'20:00',end_time:'21:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_pattern_key:'8pm ennistymon pickleball session|Wednesday|20:00|21:00|ennistymon community centre|parliament st ennistimon ennistymon',spond_heading:'8pm Ennistymon Pickleball Session',active:true},
];
const settings=[{id:'settings',tenant_id:tenantId,club_id:clubId,currency:'EUR',financial_year_start_month:9,financial_year_start_day:1,tracking_start_date:'2026-09-01'}];
const bindings=[{id:'binding1',tenant_id:tenantId,club_id:clubId,listing_slug:'clare-pickleball',directory_session_key:'ennistymon-1',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_event_id:'4FA65CB24B154F4AADCDC1EE376BEBF2',active:true}];
const connections=[{id:'connection1',listing_slug:'clare-pickleball',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_group_name:'Clare Pickleball Members',status:'active',last_synced_at:'2026-09-28T12:15:46.487Z'}];
const dates=['2026-09-09','2026-09-16','2026-09-23','2026-09-30'];
const syncedEntries=dates.flatMap((date,index)=>[
  {id:`e19-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'19:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'7:00–8:00 pm',source_type:'spond_session',paid_places:10+index,going_count:10+index,declined_paid_count:index===2?1:0,fee_per_person:5.5,income_amount:(10+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  {id:`e20-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'20:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'8:00–9:00 pm',source_type:'spond_session',paid_places:8+index,going_count:8+index,declined_paid_count:0,fee_per_person:5.5,income_amount:(8+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
]);
const previewCandidates=syncedEntries.map((row,index)=>({
  occurrenceKey:`occ-${index}`,
  activityDate:row.activity_date,
  startTime:row.activity_start_time,
  heading:row.activity_start_time==='19:00'?'7pm Ennistymon Pickleball Session':'8pm Ennistymon Pickleball Session',
  spondVenueName:'Ennistymon Community Centre',
  venueId:'enn',venueName:'Ennistymon',sessionLabel:row.session_label,
  goingCount:row.going_count,declinedPaidCount:row.declined_paid_count,paidPlaces:row.paid_places,
  feePerPerson:5.5,incomeAmount:row.income_amount,expectedCostAmount:45,netAmount:row.income_amount-45,ready:true,reason:'',matchMode:index>=6?'exact_event_id':'venue_day_time'
}));

async function installFinanceBackend(page,{zeroMatch=false}={}){
  let syncedRows=[];
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','finance-e2e-token'));
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
    if(path.includes('/analytics/')) return json(route,{});
    if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
    if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
    if(fi>=0){
      const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
      let body={};try{body=req.postDataJSON()||{};}catch{}
      if(name==='securityContext') return json(route,{success:true,context:null});
      if(name==='spondIntegrationWorking'&&body.action==='directory_finance_preview'){
        if(!Array.isArray(body.selectedVenueIds) || body.selectedVenueIds.length!==1 || body.selectedVenueIds[0]!=='enn') return json(route,{error:'Finance journey test expected Ennistymon-only preview'},400);
        if(zeroMatch) return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:[],fetchedCount:0,totalSpondEventsInRange:11,readyCount:0,diagnostics:{exactMatches:0,scheduleMatches:0,unmatchedRule:8,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
        return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:previewCandidates,fetchedCount:8,totalSpondEventsInRange:11,readyCount:8,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
      }
      if(name==='spondIntegrationWorking'&&body.action==='directory_finance_sync'){
        if(!Array.isArray(body.selectedOccurrenceKeys)||!body.selectedOccurrenceKeys.length) return json(route,{error:'Finance journey test expected selected Spond occurrences'},400);
        syncedRows=body.selectedOccurrenceKeys.map(key=>syncedEntries[previewCandidates.findIndex(row=>row.occurrenceKey===key)]).filter(Boolean);
        return json(route,{success:true,fromDate:body.fromDate,toDate:body.toDate,created:syncedRows.length,updated:0,skipped:0,fetchedCount:8,totalSpondEventsInRange:11,matchedCount:syncedRows.length,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3,ignoredNotChosen:8-syncedRows.length},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name},synced:syncedRows});
      }
      return json(route,{success:true,items:[],records:[],events:[],data:[]});
    }
    const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
    if(ei>=0){
      const entity=decodeURIComponent(path.slice(ei+entityMarker.length).split('/')[0]);
      if(entity==='ClubFinanceSettings') return json(route,settings);
      if(entity==='Venue') return json(route,venues);
      if(entity==='ClubFinanceVenueRule') return json(route,rules);
      if(entity==='ClubFinanceEntry') return json(route,syncedRows);
      if(entity==='SpondSessionBinding') return json(route,bindings);
      if(entity==='DirectorySpondConnection') return json(route,connections);
      return json(route,[]);
    }
    return json(route,{});
  });
}

async function openFinance(page){
  await page.goto('/app/finance',{waitUntil:'domcontentloaded'});
  await page.locator('main').waitFor({state:'attached',timeout:15000});
  await expect(page.getByRole('heading',{name:'Finance Summary'})).toBeVisible({timeout:15000});
  await expect(page.getByText('How to use this page')).toBeVisible();
  await expect(page.getByTestId('finance-spond-status')).toContainText('Spond connected · Clare Pickleball Members');
  await expect(page.getByText('6 recurring finance sessions configured')).toBeVisible();
  await expect(page.getByText('2 venues with finance tracking enabled')).toBeVisible();
}

test('Finance admin journey: month popover, session discovery, selection and sync',async({page})=>{
  await installFinanceBackend(page);
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await openFinance(page);

  await page.getByTestId('finance-venue-all').click();
  await page.getByTestId('finance-venue-enn').click();
  await expect(page.getByTestId('finance-venue-enn').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');

  await page.getByTestId('finance-month-filter').click();
  await expect(page.getByTestId('finance-month-1')).toBeVisible();
  await expect(page.getByTestId('finance-month-12')).toBeVisible();
  await page.getByTestId('finance-month-9').click();
  await page.getByTestId('finance-month-10').click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('finance-month-filter')).toContainText('2 months selected');

  await page.getByRole('button',{name:'Find Spond sessions'}).click();
  await expect(page.getByTestId('finance-sync-message')).toContainText('Found 8 matching sessions');
  await expect(page.getByTestId('finance-spond-preview')).toContainText('8 found');
  await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
  await expect(page.getByText('2026-09-30 · 20:00 · 8pm Ennistymon Pickleball Session')).toBeVisible();
  await expect(page.getByTestId('finance-spond-preview')).toContainText('€5.50');
  await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (8)');

  const firstOccurrence=page.locator('[data-testid^="finance-spond-occurrence-"]').first();
  await firstOccurrence.locator('[role="checkbox"]').click();
  await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (7)');
  await page.getByTestId('finance-sync-selected').click();
  await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 7 selected Spond sessions to Finance');
  await expect(page.getByRole('cell',{name:'2026-09-30 · 19:00'})).toBeVisible();
  await expect(page.getByText('Spond · 1 paid then declined')).toBeVisible();

  await expect(page.getByTestId('finance-recurring-section')).toContainText('You do not need to enter them again before each sync');
  expect(errors).toEqual([]);
});

test('Finance discovery explains a zero-match result before any write',async({page})=>{
  await installFinanceBackend(page,{zeroMatch:true});
  await openFinance(page);
  await page.getByTestId('finance-venue-all').click();
  await page.getByTestId('finance-venue-enn').click();
  await page.getByRole('button',{name:'Find Spond sessions'}).click();
  await expect(page.getByTestId('finance-sync-message')).toContainText('returned 11 events in the date/month range, but none matched');
  await expect(page.getByTestId('finance-spond-preview')).toContainText('0 found');
  await expect(page.getByTestId('finance-sync-selected')).toHaveCount(0);
});

test.describe('Finance mobile journey',()=>{
  test.use({viewport:{width:390,height:844}});
  test('Finance discovery and selected sync stay phone-width',async({page})=>{
    await installFinanceBackend(page);
    await openFinance(page);
    await page.getByTestId('finance-venue-all').click();
    await page.getByTestId('finance-venue-enn').click();
    await page.getByRole('button',{name:'Find Spond sessions'}).click();
    await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
    let widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
    expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
    await page.getByTestId('finance-sync-selected').click();
    await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 8 selected Spond sessions');
    widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
    expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  });
});
