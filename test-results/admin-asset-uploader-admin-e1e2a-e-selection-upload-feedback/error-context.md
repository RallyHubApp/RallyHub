# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-asset-uploader.spec.mjs >> admin Asset Uploader accepts a PDF and gives visible selection/upload feedback
- Location: e2e/admin-asset-uploader.spec.mjs:30:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Asset name')
Expected: "RallyHub Events Quick Start Guide"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Asset name') with timeout 3000ms
  - waiting for getByLabel('Asset name')

```

```yaml
- complementary:
  - link "RallyHub RallyHub":
    - /url: /app
    - img "RallyHub"
    - text: RallyHub
  - navigation:
    - link "Dashboard":
      - /url: /app
      - img
      - text: Dashboard
    - link "Member Messages":
      - /url: /app/messages
      - img
      - text: Member Messages
    - link "Membership":
      - /url: /app/membership
      - img
      - text: Membership
    - link "Waiting List":
      - /url: /app/waiting-list
      - img
      - text: Waiting List
    - link "Events":
      - /url: /app/events
      - img
      - text: Events
    - link "Players":
      - /url: /app/players
      - img
      - text: Players
    - link "Tournaments":
      - /url: /app/tournaments
      - img
      - text: Tournaments
    - link "Club Leaderboard":
      - /url: /app/leaderboard
      - img
      - text: Club Leaderboard
    - link "Analytics":
      - /url: /app/analytics
      - img
      - text: Analytics
  - link "Switch to Directory":
    - /url: /directory
    - img
    - text: Switch to Directory
  - link "Directory Admin":
    - /url: /app/admin?tab=directory
    - img
    - text: Directory Admin
  - link "Session Bookings":
    - /url: /app/guest-bookings
    - img
    - text: Session Bookings
  - link "My Profile":
    - /url: /app/my-profile
    - img
    - text: My Profile
  - link "Admin Panel":
    - /url: /app/admin
    - img
    - text: Admin Panel
  - paragraph: Super Admin
  - paragraph: Super Admin
- banner:
  - button "Current appearance Auto. Change appearance.":
    - img
    - text: Auto
  - button "SA Super Admin admin":
    - text: SA
    - paragraph: Super Admin
    - paragraph: admin
- main:
  - heading "Admin Panel" [level=1]
  - paragraph: Site owner control panel
  - img
  - text: Admin Only
  - button "0 Current Club Members 0 paid · 0 complimentary · 0 pending":
    - paragraph: "0"
    - paragraph: Current Club Members
    - paragraph: 0 paid · 0 complimentary · 0 pending
  - button "0 Linked RallyHub Accounts Tap to manage account links":
    - paragraph: "0"
    - paragraph: Linked RallyHub Accounts
    - paragraph: Tap to manage account links
  - button "0 Members Not Yet Linked Tap to review linking":
    - paragraph: "0"
    - paragraph: Members Not Yet Linked
    - paragraph: Tap to review linking
  - tablist:
    - tab "Club Access Approvals":
      - img
      - text: Club Access Approvals
    - tab "Member Preview":
      - img
      - text: Member Preview
    - tab "Announcements":
      - img
      - text: Announcements
    - tab "Directory Claims":
      - img
      - text: Directory Claims
    - tab "Directory Contacts":
      - img
      - text: Directory Contacts
    - tab "Player Network":
      - img
      - text: Player Network
    - tab "Directory Analytics":
      - img
      - text: Directory Analytics
    - tab "Feedback":
      - img
      - text: Feedback
    - tab "Asset Uploader" [selected]:
      - img
      - text: Asset Uploader
    - tab "Users & Roles":
      - img
      - text: Users & Roles
    - tab "Players":
      - img
      - text: Players
    - tab "Matches":
      - img
      - text: Matches
    - tab "Account Links":
      - img
      - text: Account Links
    - tab "Invite Users":
      - img
      - text: Invite Users
  - tabpanel "Asset Uploader":
    - heading "RallyHub Asset Uploader" [level=3]:
      - img
      - text: RallyHub Asset Uploader
    - paragraph: Securely upload approved production artwork and PDF guides to RallyHub. PNG, JPG, WEBP or PDF · up to 20 MB. This area is available only inside the platform Admin Panel.
    - text: Asset name
    - textbox "e.g. About page hero": RallyHub Events Quick Start Guide
    - button "Choose file":
      - img
      - text: Choose file
    - button "Upload to RallyHub":
      - img
      - text: Upload to RallyHub
    - text: "Selected: RallyHub-Events-Quick-Start-Guide.pdf · 0 KB"
- contentinfo "RallyHub copyright": © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID='6a01dc00702b7dd2a2978c28';
  4  | const user={id:'super-admin-test',email:'admin@example.test',full_name:'Super Admin',role:'admin',approval_status:'approved',active_tenant_id:'tenant-clare',active_club_id:'club-clare',active_club_role:'club_admin',kotc_role:'super_admin'};
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | async function installBackend(page){
  8  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','admin-assets-e2e-token'));
  9  |   await page.route('**/api/apps/**',async route=>{
  10 |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  11 |     if(path.includes('/public-settings/'))return json(route,{id:APP_ID,public_settings:{}});
  12 |     if(path.includes('/analytics/'))return json(route,{});
  13 |     if(path.endsWith('/entities/User/me'))return json(route,user);
  14 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;const fi=path.indexOf(fnMarker);
  15 |     if(fi>=0){
  16 |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
  17 |       if(name==='securityContext')return json(route,{success:true,context:null});
  18 |       if(name==='secureCreditAction')return json(route,{success:true,file_url:'https://files.example.test/rallyhub-events-guide.pdf'});
  19 |       return json(route,{success:true,rows:[],items:[]});
  20 |     }
  21 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;const ei=path.indexOf(entityMarker);
  22 |     if(ei>=0){
  23 |       if(req.method()==='GET')return json(route,[]);
  24 |       return json(route,{});
  25 |     }
  26 |     return json(route,{});
  27 |   });
  28 | }
  29 | 
  30 | test('admin Asset Uploader accepts a PDF and gives visible selection/upload feedback',async({page})=>{
  31 |   await installBackend(page);
  32 |   await page.goto('/app/admin?tab=assets');
  33 |   await expect(page.getByText('RallyHub Asset Uploader',{exact:true})).toBeVisible();
  34 | 
  35 |   const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
  36 |   await page.locator('input[type=file]').setInputFiles({name:'RallyHub-Events-Quick-Start-Guide.pdf',mimeType:'application/pdf',buffer:pdf});
  37 | 
  38 |   await expect(page.getByText(/Selected: RallyHub-Events-Quick-Start-Guide\.pdf/)).toBeVisible();
> 39 |   await expect(page.getByLabel('Asset name')).toHaveValue('RallyHub Events Quick Start Guide');
     |                                               ^ Error: expect(locator).toHaveValue(expected) failed
  40 |   await page.getByRole('button',{name:'Upload to RallyHub'}).click();
  41 |   await expect(page.getByText('Uploaded ✓ RallyHub-Events-Quick-Start-Guide.pdf')).toBeVisible();
  42 |   await expect(page.getByText('https://files.example.test/rallyhub-events-guide.pdf')).toBeVisible();
  43 | });
  44 | 
```