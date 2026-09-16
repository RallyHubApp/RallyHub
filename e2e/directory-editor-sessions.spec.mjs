import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'directory-editor-e2e',email:'editor@example.test',full_name:'Directory Editor',role:'admin',approval_status:'approved'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function installDirectoryBackend(page){
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
    if(path.endsWith('/entities/User/me')) return json(route,user);
    if(path.includes('/analytics/')) return json(route,{});
    const marker=`/api/apps/${APP_ID}/functions/`;
    const i=path.indexOf(marker);
    if(i>=0){
      const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);
      let body={};try{body=req.postDataJSON()||{};}catch{}
      if(name==='securityContext') return json(route,{success:true,context:null});
      if(name==='directoryListingProfile'){
        if(body.action==='public_get') return json(route,{success:true,listingSlug:'clare-pickleball',verificationStatus:'verified',profile:null,base:null});
        if(body.action==='save') return json(route,{success:true,profile:body.profile,updatedAt:new Date().toISOString(),id:'profile-e2e'});
      }
      if(name==='directoryClaim'&&body.action==='status') return json(route,{success:true,hasAccess:true,status:'verified'});
      return json(route,{success:true});
    }
    return json(route,{});
  });
}

test('directory editor: Add session is visible, adds a card, and Duplicate clones it',async({page})=>{
  await installDirectoryBackend(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  await page.getByRole('heading',{name:'Weekly sessions'}).scrollIntoViewIfNeeded();

  const cards=page.getByTestId('directory-session-card');
  await expect(cards).toHaveCount(7);
  await expect(page.getByText('Wednesday · 11:30 · Club Session')).toBeVisible();

  await page.getByTestId('directory-add-session').click();
  await expect(cards).toHaveCount(8);
  await expect(page.getByTestId('directory-session-notice')).toContainText('New blank session added');

  const newCard=cards.nth(7);
  await expect(newCard).toBeVisible();
  await expect(newCard).toHaveClass(/ring-primary/);

  const beforeCloneCount=await cards.count();
  await cards.first().getByTestId('directory-clone-session').click();
  await expect(cards).toHaveCount(beforeCloneCount+1);
  await expect(page.getByTestId('directory-session-notice')).toContainText('Session duplicated');

  const original=cards.nth(0);
  const duplicate=cards.nth(1);
  const originalSelects=original.locator('select');
  const duplicateSelects=duplicate.locator('select');
  expect(await originalSelects.nth(0).inputValue()).toBe(await duplicateSelects.nth(0).inputValue());
  expect(await originalSelects.nth(1).inputValue()).toBe(await duplicateSelects.nth(1).inputValue());
  const originalTimes=original.locator('input[type="time"]');
  const duplicateTimes=duplicate.locator('input[type="time"]');
  expect(await originalTimes.nth(1).inputValue()).toBe(await duplicateTimes.nth(1).inputValue());
  expect(await originalTimes.nth(2).inputValue()).toBe(await duplicateTimes.nth(2).inputValue());
  expect(errors).toEqual([]);
});

test('Clare public listing shows Corofin Wednesday session with €5 cash',async({page})=>{
  await installDirectoryBackend(page);
  await page.goto('/directory/clare-pickleball');
  await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  const session=page.getByText('11:30–13:30').locator('..').locator('..');
  await expect(session).toContainText('Corofin GAA Sports Hall');
  await expect(session).toContainText('€5');
  await expect(session).toContainText('Cash');
});
