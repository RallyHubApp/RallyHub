import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const onePixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlW9qsAAAAASUVORK5CYII=';
const user={id:'events-e2e-admin',email:'admin@example.test',full_name:'Events Admin',role:'admin',approval_status:'approved',active_club_role:'club_admin',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_name:'Clare Pickleball'};
const host={id:'club-pbi',name:'Pickleball Ireland',slug:'pickleball-ireland',logo_url:onePixel,primary_colour:'#075b31',secondary_colour:'#d0ef42'};
const event={
  id:'event-kukri',name:'Kukri Irish Nationals 2026',start_date:'2026-11-19',end_date:'2026-11-22',location:'Lagan Valley LeisurePlex',event_county:'Lisburn',event_country:'Northern Ireland',
  event_slug:'kukri-irish-nationals-2026',event_category:'tournament',event_start_time:'09:30',event_end_time:'18:00',event_image_url:onePixel,event_card_image_url:onePixel,event_card_position_x:50,event_card_position_y:44,event_card_zoom:1.2,
  event_public_summary:'Four days of national pickleball competition.',event_registration_mode:'external',event_registration_url:'https://register.example.test/kukri',event_registration_open_at:'2026-09-01T18:00:00.000Z',event_registration_close_at:'2026-11-10T23:00:00.000Z',event_fee_text:'€45 per event',event_levels:['Competition'],event_age_groups:['18+','50+','60+','70+'],event_disciplines:['Singles','Gender Doubles','Mixed Doubles'],event_indoor_outdoor:'indoor',event_featured_public:true,event_verified_organiser:true,event_publish_status:'published',event_public_visible:true,event_latitude:null,event_longitude:null,event_schedule:[{day:'Thu 19 Nov',time:'09:30–15:00',title:'70+ Gender Doubles'},{day:'Fri 20 Nov',time:'09:30–18:00',title:'60+ competition'}],event_eligibility:'Age-group competition.',event_player_info:'Minimum four matches.',event_fees_cancellation:'See organiser policy.',event_contact:'events@example.test',host
};
const second={...event,id:'event-clare',name:'Clare v Galway Interclub',event_slug:'clare-v-galway-interclub',start_date:'2026-10-04',end_date:'2026-10-04',location:"St Joseph's, Doora Barefield",event_county:'Clare',event_country:'Ireland',event_category:'interclub',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'none',event_registration_url:'',event_levels:['Social','Improver'],event_age_groups:['All ages'],event_disciplines:['Team'],event_public_summary:'Clare and Galway meet in a social interclub fixture.',host:{id:'club-clare',name:'Clare Pickleball',slug:'clare-pickleball',logo_url:onePixel}};
const opening={...event,id:'event-opening',name:'Opening Soon Test',event_slug:'opening-soon-test',start_date:'2026-12-01',end_date:'2026-12-01',event_featured_public:false,event_registration_open_at:'2099-01-01T00:00:00.000Z',event_registration_close_at:'2099-02-01T00:00:00.000Z'};
const eyva={...event,id:'event-eyva',name:"Eyva's Invitational Series – Autumn Classic 2026",event_slug:'eyva-autumn-classic-2026',start_date:'2026-10-17',end_date:'2026-10-17',location:"The Dome, Our Lady's School, Terenure, Dublin 6",event_county:'Dublin',event_country:'Ireland',event_featured_public:false,event_registration_open_at:null,event_registration_close_at:null,event_registration_mode:'contact',event_registration_url:'',event_contact:'eyvainvitationalseries@gmail.com',event_levels:['3.0-','3.5-'],event_age_groups:['18+'],event_disciplines:['Gender Doubles','Mixed Doubles'],event_tags:['DUPR Rated','Invitation only','Limited spaces'],event_public_summary:'Invitation-only DUPR-rated Autumn Classic.',host:{id:'club-eyva',name:"Eyva's Invitational Series",slug:'eyva-s-invitational-series'}};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function installPublicBackend(page,{listFailures=0}={}){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','events-e2e-token'));
  const calls=[];
  let remainingListFailures=listFailures;
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
    if(path.includes('/analytics/'))return json(route,{});
    if(path.endsWith('/entities/User/me'))return json(route,user);
    if(path.includes('/entities/EventSavedItem'))return json(route,[]);
    const marker=`/api/apps/${APP_ID}/functions/`;
    const i=path.indexOf(marker);
    if(i>=0){
      const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}
      calls.push({name,body});
      if(name==='publicEvents'){
        if(body.action==='detail'){const found=[event,second,opening,eyva].find(e=>e.event_slug===body.slug);return found?json(route,{success:true,event:found}):json(route,{error:'Public event not found'},404)}
        if(remainingListFailures>0){remainingListFailures--;return json(route,{error:'Temporary events service error'},500)}
        return json(route,{success:true,events:[second,event,opening,eyva]});
      }
      if(name==='eventEngagement')return json(route,{success:true,saved:{id:'saved-1'},share:{id:'share-1'},items:[]});
      if(name==='securityContext')return json(route,{success:true,context:null});
      return json(route,{success:true});
    }
    return json(route,[]);
  });
  return calls;
}

async function noHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(1)}

test('public Events desktop: discover, filter, open detail, save, calendar and club share',async({page})=>{
  const calls=await installPublicBackend(page);
  await page.goto('/events');
  await expect(page.getByRole('heading',{name:/Find your next event/i})).toBeVisible();
  await expect(page.getByRole('link',{name:'RallyHub home'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
  await expect(page.getByText('© 2026 RallyHub All rights reserved.')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  await expect(page.getByText('Open for booking').first()).toBeVisible();
  await expect(page.getByText(/Closes in \d+ days/).first()).toBeVisible();
  await expect(page.getByText('Clare v Galway Interclub')).toBeVisible();
  await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  await expect(page.getByText('Invitation only').first()).toBeVisible();
  await page.getByRole('button',{name:'Invitation only'}).click();
  await expect(page.getByText("Eyva's Invitational Series – Autumn Classic 2026")).toBeVisible();
  await expect(page.getByRole('button',{name:'Request invitation'})).toBeVisible();
  await expect(page.getByText('Kukri Irish Nationals 2026')).toHaveCount(0);
  await page.getByRole('button',{name:'All upcoming'}).click();
  await page.getByLabel('Country').selectOption({label:'Northern Ireland'});
  await page.getByLabel('Discipline').selectOption({label:'Singles'});
  await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
  await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  await page.getByLabel('Country').selectOption('all');
  await page.getByLabel('Discipline').selectOption('all');
  await page.getByRole('button',{name:'Opening soon'}).click();
  await expect(page.getByText('Opening Soon Test')).toBeVisible();
  await expect(page.getByText('Clare v Galway Interclub')).toHaveCount(0);
  await page.getByRole('button',{name:'All upcoming'}).click();
  await page.getByRole('link',{name:'View event'}).first().click();
  await expect(page).toHaveURL(/\/events\/kukri-irish-nationals-2026/);
  await expect(page.getByRole('heading',{name:'Kukri Irish Nationals 2026'})).toBeVisible();
  await expect(page.getByRole('link',{name:/View original poster/i})).toBeVisible();
  await expect(page.locator('.leaflet-container')).toHaveCount(0);
  await page.getByRole('button',{name:'Save event'}).click();
  await expect(page.getByRole('button',{name:'Saved'})).toBeVisible();
  expect(calls.some(c=>c.name==='eventEngagement'&&c.body.action==='save'&&c.body.eventId==='event-kukri')).toBe(true);
  await page.getByRole('button',{name:/Add to calendar/i}).click();
  await expect(page.getByRole('heading',{name:'Add to calendar'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Apple \/ iCal/})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Share'}).click();
  await expect(page.getByRole('heading',{name:'Share this event'})).toBeVisible();
  await expect(page.getByRole('button',{name:'WhatsApp'})).toBeVisible();
  await page.getByRole('button',{name:/Share to my club/i}).click();
  await expect.poll(()=>calls.filter(c=>c.name==='eventEngagement'&&c.body.action==='share_to_club').length).toBe(1);
  await noHorizontalOverflow(page);
});

test('public Events: transient 500s give a clear retry and recover without losing the journey',async({page})=>{
  const calls=await installPublicBackend(page,{listFailures:2});
  await page.goto('/events');
  const retry=page.getByRole('button',{name:'Try again'});
  await expect(retry).toBeVisible({timeout:10000});
  await retry.click();
  await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible({timeout:5000});
  expect(calls.filter(call=>call.name==='publicEvents'&&call.body.action==='list').length).toBeGreaterThanOrEqual(3);
  await expect(retry).toHaveCount(0);
});

test.describe('public Events mobile',()=>{
  test.use({viewport:{width:390,height:844}});
  test('mobile layout has working menu, filter drawer, cards and no body overflow',async({page})=>{
    await installPublicBackend(page);
    await page.goto('/events');
    await expect(page.getByRole('button',{name:'Menu'})).toBeVisible();
    await page.getByRole('button',{name:'Menu'}).click();
    await expect(page.getByRole('link',{name:'Events',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Menu'}).click();
    await expect(page.getByText('More filters')).toBeVisible();
    await page.getByText('More filters').click();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.getByText('Kukri Irish Nationals 2026').first()).toBeVisible();
    await noHorizontalOverflow(page);
  });
});
