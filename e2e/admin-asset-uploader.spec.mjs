import { test, expect } from '@playwright/test';

const APP_ID='6a01dc00702b7dd2a2978c28';
const user={id:'super-admin-test',email:'admin@example.test',full_name:'Super Admin',role:'admin',approval_status:'approved',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_role:'club_admin',kotc_role:'super_admin'};
const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function installBackend(page){
  await page.addInitScript(()=>localStorage.setItem('base44_access_token','admin-assets-e2e-token'));
  await page.route('**/api/apps/**',async route=>{
    const req=route.request(),url=new URL(req.url()),path=url.pathname;
    if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
    if(path.includes('/analytics/'))return json(route,{});
    if(path.endsWith('/entities/User/me'))return json(route,user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
    if(fi>=0){
      const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
      if(name==='securityContext')return json(route,{success:true,context:null});
      if(name==='secureCreditAction')return json(route,{success:true,file_url:'https://files.example.test/rallyhub-events-guide.pdf'});
      return json(route,{success:true,rows:[],items:[]});
    }
    const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
    if(ei>=0){
      if(req.method()==='GET')return json(route,[]);
      return json(route,{});
    }
    return json(route,{});
  });
}

test('admin Asset Uploader accepts a PDF and gives visible selection/upload feedback',async({page})=>{
  await installBackend(page);
  await page.goto('/app/admin?tab=assets');
  await expect(page.getByText('RallyHub Asset Uploader',{exact:true})).toBeVisible();

  const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
  await page.locator('input[type=file]').setInputFiles({name:'RallyHub-Events-Quick-Start-Guide.pdf',mimeType:'application/pdf',buffer:pdf});

  await expect(page.getByText(/Selected: RallyHub-Events-Quick-Start-Guide\.pdf/)).toBeVisible();
  await expect(page.getByLabel('Asset name')).toHaveValue('RallyHub Events Quick Start Guide');
  await page.getByRole('button',{name:'Upload to RallyHub'}).click();
  await expect(page.getByText('Uploaded ✓ RallyHub-Events-Quick-Start-Guide.pdf')).toBeVisible();
  await expect(page.getByText('https://files.example.test/rallyhub-events-guide.pdf')).toBeVisible();
});
