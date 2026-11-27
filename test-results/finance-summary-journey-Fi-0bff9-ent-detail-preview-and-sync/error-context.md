# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: finance-summary-journey.spec.mjs >> Finance admin journey: Directory-style Spond group scan, assignment, detail preview and sync
- Location: e2e/finance-summary-journey.spec.mjs:114:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('finance-spond-status')
Expected substring: "Spond connected · Clare Pickleball Members"
Received string:    "Spond group linked · 245CFD5D9CF044B7B203A3182BD02721"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('finance-spond-status') with timeout 3000ms
  - waiting for getByTestId('finance-spond-status')
    10 × locator resolved to <div data-dynamic-content="true" data-testid="finance-spond-status" data-collection-item-id="binding1" data-collection-item-field="spond_group_id" data-source-location="src/pages/FinanceSummary.jsx:348:29" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">Spond group linked · 245CFD5D9CF044B7B203A3182BD0…</div>
       - unexpected value "Spond group linked · 245CFD5D9CF044B7B203A3182BD02721"

```

```yaml
- text: Spond group linked · 245CFD5D9CF044B7B203A3182BD02721
```

# Test source

```ts
  9   | const venues=[
  10  |   {id:'doora',tenant_id:tenantId,club_id:clubId,name:'St Joseph’s, Doora Barefield',address:'Gurteen, Quin Road, Co. Clare',hourly_hire_rate:30,finance_tracking_enabled:true,status:'active'},
  11  |   {id:'enn',tenant_id:tenantId,club_id:clubId,name:'Ennistymon',address:'Parliament Street, Ennistymon',hourly_hire_rate:45,finance_tracking_enabled:true,status:'active'},
  12  |   {id:'corofin',tenant_id:tenantId,club_id:clubId,name:'Corofin',address:'Corofin GAA Sports Hall',finance_tracking_enabled:false,status:'active'},
  13  |   {id:'clarecastle',tenant_id:tenantId,club_id:clubId,name:'Clarecastle',finance_tracking_enabled:false,status:'active'},
  14  |   {id:'shannon',tenant_id:tenantId,club_id:clubId,name:'Shannon',finance_tracking_enabled:false,status:'active'},
  15  | ];
  16  | const rules=[
  17  |   {id:'d1',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  18  |   {id:'d2',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Monday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  19  |   {id:'d3',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'19:00',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  20  |   {id:'d4',tenant_id:tenantId,club_id:clubId,venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'20:30',duration_minutes:90,cost_amount:30,income_source:'spond',active:true},
  21  |   {id:'e1',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'19:00',end_time:'20:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_pattern_key:'7pm ennistymon pickeball session|Wednesday|19:00|20:00|ennistymon community centre|parliament st ennistimon ennistymon',spond_heading:'7pm Ennistymon Pickeball Session',active:true},
  22  |   {id:'e2',tenant_id:tenantId,club_id:clubId,venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'20:00',end_time:'21:00',duration_minutes:60,cost_amount:45,income_source:'spond',default_fee_per_person:5.5,spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_pattern_key:'8pm ennistymon pickleball session|Wednesday|20:00|21:00|ennistymon community centre|parliament st ennistimon ennistymon',spond_heading:'8pm Ennistymon Pickleball Session',active:true},
  23  | ];
  24  | const settings=[{id:'settings',tenant_id:tenantId,club_id:clubId,currency:'EUR',financial_year_start_month:9,financial_year_start_day:1,tracking_start_date:'2026-09-01'}];
  25  | const bindings=[{id:'binding1',tenant_id:tenantId,club_id:clubId,listing_slug:'clare-pickleball',directory_session_key:'ennistymon-1',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_event_id:'4FA65CB24B154F4AADCDC1EE376BEBF2',active:true}];
  26  | const connections=[{id:'connection1',listing_slug:'clare-pickleball',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_group_name:'Clare Pickleball Members',status:'active',last_synced_at:'2026-09-28T12:15:46.487Z'}];
  27  | const spondGroups=[{id:'OTHER',name:'Other Group',memberCount:12},{id:'245CFD5D9CF044B7B203A3182BD02721',name:'Clare Pickleball Members',memberCount:130}];
  28  | const spondDirectoryPreview={
  29  |   venues:[
  30  |     {id:'spond-ennistymon-community-centre-1',name:'Ennistymon Community Centre',address:'Parliament St, Ennistimon, Ennistymon'},
  31  |     {id:'spond-doora-1',name:'St. Josephs Doora Barefield GAA Club',address:'Gurteen, Quin Road, Co. Clare'},
  32  |   ],
  33  |   sessions:[
  34  |     {id:'spond-session-banner',patternKey:'banner bash 7 10pm|Thursday|19:00|22:00|st josephs doora barefield club|gurteen quin road co clare',venueId:'spond-doora-1',spondVenueName:'St. Josephs Doora Barefield GAA Club',spondVenueAddress:'Gurteen, Quin Road, Co. Clare',day:'Thursday',start:'19:00',end:'22:00',level:'Banner Bash 7-10pm',occurrences:2,nextDate:'2026-09-24',source:'Spond'},
  35  |     {id:'spond-session-doora-19',patternKey:'1900 thurs social fun matchplay|Thursday|19:00|20:30|st josephs doora barefield club|gurteen quin road co clare',venueId:'spond-doora-1',spondVenueName:'St. Josephs Doora Barefield GAA Club',spondVenueAddress:'Gurteen, Quin Road, Co. Clare',day:'Thursday',start:'19:00',end:'20:30',level:'1900 Thurs Social Fun Matchplay',occurrences:17,nextDate:'2026-10-01',source:'Spond'},
  36  |     {id:'spond-session-doora-2030',patternKey:'2030 thurs social and improver matchplay|Thursday|20:30|22:00|st josephs doora barefield club|gurteen quin road co clare',venueId:'spond-doora-1',spondVenueName:'St. Josephs Doora Barefield GAA Club',spondVenueAddress:'Gurteen, Quin Road, Co. Clare',day:'Thursday',start:'20:30',end:'22:00',level:'2030 Thurs Social and Improver Matchplay',occurrences:17,nextDate:'2026-10-01',source:'Spond'},
  37  |     {id:'spond-session-1',patternKey:'7pm ennistymon pickeball session|Wednesday|19:00|20:00|ennistymon community centre|parliament st ennistimon ennistymon',venueId:'spond-ennistymon-community-centre-1',spondVenueName:'Ennistymon Community Centre',spondVenueAddress:'Parliament St, Ennistimon, Ennistymon',day:'Wednesday',start:'19:00',end:'20:00',level:'7pm Ennistymon Pickeball Session',occurrences:4,nextDate:'2026-09-09',source:'Spond'},
  38  |     {id:'spond-session-2',patternKey:'8pm ennistymon pickleball session|Wednesday|20:00|21:00|ennistymon community centre|parliament st ennistimon ennistymon',venueId:'spond-ennistymon-community-centre-1',spondVenueName:'Ennistymon Community Centre',spondVenueAddress:'Parliament St, Ennistimon, Ennistymon',day:'Wednesday',start:'20:00',end:'21:00',level:'8pm Ennistymon Pickleball Session',occurrences:4,nextDate:'2026-09-09',source:'Spond'},
  39  |   ]
  40  | };
  41  | const dates=['2026-09-09','2026-09-16','2026-09-23','2026-09-30'];
  42  | const syncedEntries=dates.flatMap((date,index)=>[
  43  |   {id:`e19-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'19:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'7:00–8:00 pm',source_type:'spond_session',paid_places:10+index,going_count:10+index,declined_paid_count:index===2?1:0,fee_per_person:5.5,income_amount:(10+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  44  |   {id:`e20-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'20:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'8:00–9:00 pm',source_type:'spond_session',paid_places:8+index,going_count:8+index,declined_paid_count:0,fee_per_person:5.5,income_amount:(8+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  45  | ]);
  46  | const previewCandidates=syncedEntries.map((row,index)=>({
  47  |   occurrenceKey:`occ-${index}`,
  48  |   activityDate:row.activity_date,
  49  |   startTime:row.activity_start_time,
  50  |   heading:row.activity_start_time==='19:00'?'7pm Ennistymon Pickleball Session':'8pm Ennistymon Pickleball Session',
  51  |   spondVenueName:'Ennistymon Community Centre',
  52  |   venueId:'enn',venueName:'Ennistymon',sessionLabel:row.session_label,
  53  |   goingCount:row.going_count,declinedPaidCount:row.declined_paid_count,paidPlaces:row.paid_places,
  54  |   feePerPerson:5.5,incomeAmount:row.income_amount,expectedCostAmount:45,netAmount:row.income_amount-45,ready:true,reason:'',matchMode:index>=6?'exact_event_id':'venue_day_time'
  55  | }));
  56  | 
  57  | async function installFinanceBackend(page,{zeroMatch=false}={}){
  58  |   let syncedRows=[];
  59  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','finance-e2e-token'));
  60  |   await page.route('**/api/apps/**',async route=>{
  61  |     const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
  62  |     if(path.includes('/analytics/')) return json(route,{});
  63  |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  64  |     if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
  65  |     const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
  66  |     if(fi>=0){
  67  |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
  68  |       let body={};try{body=req.postDataJSON()||{};}catch{}
  69  |       if(name==='securityContext') return json(route,{success:true,context:null});
  70  |       if(name==='spondIntegrationWorking'&&body.action==='directory_connection_status') return json(route,{connection:connections[0]});
  71  |       if(name==='spondIntegrationWorking'&&body.action==='directory_get_groups') return json(route,{groups:spondGroups,connectionMode:'platform_admin'});
  72  |       if(name==='spondIntegrationWorking'&&body.action==='directory_get_events'){
  73  |         if(body.fromDate!=='2026-09-01'||body.toDate!=='2026-09-30') return json(route,{error:`Finance scan must use selected September window, got ${body.fromDate||'none'} to ${body.toDate||'none'}`},400);
  74  |         return json(route,{preview:spondDirectoryPreview,rawCount:11,events:[],requestedFrom:body.fromDate,requestedTo:body.toDate});
  75  |       }
  76  |       if(name==='spondIntegrationWorking'&&body.action==='directory_save_connection') return json(route,{success:true,connection:connections[0]});
  77  |       if(name==='spondIntegrationWorking'&&body.action==='directory_finance_preview'){
  78  |         if(!Array.isArray(body.selectedVenueIds) || body.selectedVenueIds.length!==1 || body.selectedVenueIds[0]!=='enn') return json(route,{error:'Finance journey test expected Ennistymon-only preview'},400);
  79  |         if(zeroMatch) return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:[],fetchedCount:0,totalSpondEventsInRange:11,readyCount:0,diagnostics:{exactMatches:0,scheduleMatches:0,unmatchedRule:8,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
  80  |         return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:previewCandidates,fetchedCount:8,totalSpondEventsInRange:11,readyCount:8,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
  81  |       }
  82  |       if(name==='spondIntegrationWorking'&&body.action==='directory_finance_sync'){
  83  |         if(!Array.isArray(body.selectedOccurrenceKeys)||!body.selectedOccurrenceKeys.length) return json(route,{error:'Finance journey test expected selected Spond occurrences'},400);
  84  |         syncedRows=body.selectedOccurrenceKeys.map(key=>syncedEntries[previewCandidates.findIndex(row=>row.occurrenceKey===key)]).filter(Boolean);
  85  |         return json(route,{success:true,fromDate:body.fromDate,toDate:body.toDate,created:syncedRows.length,updated:0,skipped:0,fetchedCount:8,totalSpondEventsInRange:11,matchedCount:syncedRows.length,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3,ignoredNotChosen:8-syncedRows.length},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name},synced:syncedRows});
  86  |       }
  87  |       return json(route,{success:true,items:[],records:[],events:[],data:[]});
  88  |     }
  89  |     const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
  90  |     if(ei>=0){
  91  |       const entity=decodeURIComponent(path.slice(ei+entityMarker.length).split('/')[0]);
  92  |       if(entity==='ClubFinanceSettings') return json(route,settings);
  93  |       if(entity==='Venue') return json(route,venues);
  94  |       if(entity==='ClubFinanceVenueRule') return json(route,rules);
  95  |       if(entity==='ClubFinanceEntry') return json(route,syncedRows);
  96  |       if(entity==='SpondSessionBinding') return json(route,bindings);
  97  |       if(entity==='DirectorySpondConnection') return json(route,connections);
  98  |       return json(route,[]);
  99  |     }
  100 |     return json(route,{});
  101 |   });
  102 | }
  103 | 
  104 | async function openFinance(page){
  105 |   await page.goto('/app/finance',{waitUntil:'domcontentloaded'});
  106 |   await page.locator('main').waitFor({state:'attached',timeout:15000});
  107 |   await expect(page.getByRole('heading',{name:'Finance Summary'})).toBeVisible({timeout:15000});
  108 |   await expect(page.getByText('How to use this page')).toBeVisible();
> 109 |   await expect(page.getByTestId('finance-spond-status')).toContainText('Spond connected · Clare Pickleball Members');
      |                                                          ^ Error: expect(locator).toContainText(expected) failed
  110 |   await expect(page.getByText('2 Spond patterns linked to Finance')).toBeVisible();
  111 |   await expect(page.getByText('2 venues with finance tracking enabled')).toBeVisible();
  112 | }
  113 | 
  114 | test('Finance admin journey: Directory-style Spond group scan, assignment, detail preview and sync',async({page})=>{
  115 |   await installFinanceBackend(page);
  116 |   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  117 |   await openFinance(page);
  118 | 
  119 |   await expect(page.getByRole('heading',{name:'Spond session setup'})).toBeVisible();
  120 |   await expect(page.getByText('Clare Pickleball Members').first()).toBeVisible();
  121 |   await page.getByTestId('finance-venue-all').click();
  122 |   await page.getByTestId('finance-venue-enn').click();
  123 |   await expect(page.getByText(/Current scan: 2026-09-01 to 2026-09-30 · Ennistymon/)).toBeVisible();
  124 |   await page.getByRole('button',{name:'Scan selected period'}).click();
  125 |   await expect(page.getByText('7pm Ennistymon Pickeball Session')).toBeVisible();
  126 |   await expect(page.getByText('Banner Bash 7-10pm')).toHaveCount(0);
  127 |   await expect(page.getByText('1900 Thurs Social Fun Matchplay')).toHaveCount(0);
  128 |   await expect(page.getByText('2030 Thurs Social and Improver Matchplay')).toHaveCount(0);
  129 |   await expect(page.getByText('8pm Ennistymon Pickleball Session')).toBeVisible();
  130 |   await expect(page.getByText('Wednesday · 19:00–20:00').first()).toBeVisible();
  131 |   await expect(page.getByText('Wednesday · 20:00–21:00').first()).toBeVisible();
  132 |   await page.getByRole('button',{name:'Use 2 selected in Finance'}).click();
  133 |   await expect(page.getByTestId('finance-spond-assignment')).toBeVisible();
  134 |   await expect(page.getByTestId('finance-spond-pattern-spond-session-1').getByRole('combobox')).toContainText('Ennistymon · Wednesday 19:00');
  135 |   await expect(page.getByTestId('finance-spond-pattern-spond-session-2').getByRole('combobox')).toContainText('Ennistymon · Wednesday 20:00');
  136 |   await page.getByRole('button',{name:'Save Spond session assignments'}).click();
  137 | 
  138 |   await expect(page.getByTestId('finance-venue-enn').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');
  139 | 
  140 |   await page.getByTestId('finance-month-filter').click();
  141 |   await expect(page.getByTestId('finance-month-1')).toBeVisible();
  142 |   await expect(page.getByTestId('finance-month-12')).toBeVisible();
  143 |   await page.getByTestId('finance-month-9').click();
  144 |   await page.getByTestId('finance-month-10').click();
  145 |   await page.keyboard.press('Escape');
  146 |   await expect(page.getByTestId('finance-month-filter')).toContainText('2 months selected');
  147 | 
  148 |   await page.getByRole('button',{name:'Read Spond finance details'}).click();
  149 |   await expect(page.getByTestId('finance-sync-message')).toContainText('Found 8 matching sessions');
  150 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('8 found');
  151 |   await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
  152 |   await expect(page.getByText('2026-09-30 · 20:00 · 8pm Ennistymon Pickleball Session')).toBeVisible();
  153 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('€5.50');
  154 |   await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (8)');
  155 | 
  156 |   const firstOccurrence=page.locator('[data-testid^="finance-spond-occurrence-"]').first();
  157 |   await firstOccurrence.locator('[role="checkbox"]').click();
  158 |   await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (7)');
  159 |   await page.getByTestId('finance-sync-selected').click();
  160 |   await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 7 selected Spond sessions to Finance');
  161 |   await expect(page.getByRole('cell',{name:'2026-09-30 · 19:00'})).toBeVisible();
  162 |   await expect(page.getByText('Spond · 1 paid then declined')).toBeVisible();
  163 | 
  164 |   await expect(page.getByTestId('finance-recurring-section')).toContainText('You do not need to enter them again before each sync');
  165 |   expect(errors).toEqual([]);
  166 | });
  167 | 
  168 | test('Finance detail preview explains a zero-match result before any write',async({page})=>{
  169 |   await installFinanceBackend(page,{zeroMatch:true});
  170 |   await openFinance(page);
  171 |   await page.getByTestId('finance-venue-all').click();
  172 |   await page.getByTestId('finance-venue-enn').click();
  173 |   await page.getByRole('button',{name:'Read Spond finance details'}).click();
  174 |   await expect(page.getByTestId('finance-sync-message')).toContainText('returned 11 events in the date/month range, but none matched');
  175 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('0 found');
  176 |   await expect(page.getByTestId('finance-sync-selected')).toHaveCount(0);
  177 | });
  178 | 
  179 | test.describe('Finance mobile journey',()=>{
  180 |   test.use({viewport:{width:390,height:844}});
  181 |   test('Finance discovery and selected sync stay phone-width',async({page})=>{
  182 |     await installFinanceBackend(page);
  183 |     await openFinance(page);
  184 |     await page.getByTestId('finance-venue-all').click();
  185 |     await page.getByTestId('finance-venue-enn').click();
  186 |     await page.getByRole('button',{name:'Read Spond finance details'}).click();
  187 |     await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
  188 |     let widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  189 |     expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  190 |     expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  191 |     await page.getByTestId('finance-sync-selected').click();
  192 |     await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 8 selected Spond sessions');
  193 |     widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  194 |     expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  195 |     expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  196 |   });
  197 | });
  198 | 
```