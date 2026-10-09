import { test, expect } from '@playwright/test';
const APP_ID='6a01dc00702b7dd2a2978c28';
test('mobile guided and direct modes', async ({page}) => {
 await page.setViewportSize({width:390,height:844});
 const user={id:'e2e',email:'editor@example.test',full_name:'Editor',role:'admin',approval_status:'approved'};
 let saves=0;
 await page.route('**/api/apps/**',async route=>{
  const url=new URL(route.request().url()), path=url.pathname;
  const reply=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  if(path.endsWith('/entities/User/me'))return reply(user);
  if(path.includes('/analytics/'))return reply({});
  const marker=`/api/apps/${APP_ID}/functions/`;
  if(path.includes(marker)){
   const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
   if(name==='securityContext')return reply({success:true,context:null});
   if(name==='directoryClaim')return reply({success:true,hasAccess:true,status:'verified'});
   if(name==='directoryListingProfile'){
    if(body.action==='save'){saves++;return reply({success:true,profile:body.profile,id:'saved'})}
    return reply({success:true,profile:null,base:null});
   }
  }
  return reply({success:true});
 });
 await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
 await expect(page.getByTestId('directory-editor-mode')).toBeVisible();
 await page.getByRole('button',{name:'Guided setup'}).click();
 await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5');
 await expect(page.locator('#basics')).toBeVisible();
 await expect(page.locator('#sessions')).toBeHidden();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 2 of 5');
 await expect(page.locator('#contact')).toBeVisible();
 await page.getByRole('button',{name:'Previous'}).click();
 await expect(page.locator('#basics')).toBeVisible();
 await page.getByRole('button',{name:'Edit directly'}).click();
 await expect(page.locator('#sessions')).toBeVisible();
 await page.getByRole('button',{name:'Guided setup'}).click();
 await expect(page.getByTestId('directory-guided-progress')).toContainText('Step 1 of 5');
 expect(saves).toBe(0);
});

