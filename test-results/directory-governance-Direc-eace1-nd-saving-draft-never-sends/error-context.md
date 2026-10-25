# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-governance.spec.mjs >> Directory super-admin campaign UI is separate, and saving draft never sends
- Location: e2e/directory-governance.spec.mjs:35:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Matcher error: received value must be a number or bigint

Received has value: undefined
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - generic [ref=f1e3]:
    - complementary [ref=f1e4]:
      - link "RallyHub RallyHub SUPER ADMIN" [ref=f1e6] [cursor=pointer]:
        - /url: /app
        - img "RallyHub" [ref=f1e7]
        - generic [ref=f1e8]:
          - generic [ref=f1e9]: RallyHub
          - generic [ref=f1e10]: SUPER ADMIN
      - navigation [ref=f1e11]:
        - generic [ref=f1e12]: DIRECTORY COMMAND CENTRE
        - link "Directory Overview" [ref=f1e13] [cursor=pointer]:
          - /url: /app/admin?tab=directory-command
        - link "People & CRM" [ref=f1e20] [cursor=pointer]:
          - /url: /app/admin?tab=directory-crm
        - link "Listings & Claims" [ref=f1e26] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Owners & Editors" [ref=f1e31] [cursor=pointer]:
          - /url: /app/admin?tab=directory-contacts
        - link "Player Network" [ref=f1e38] [cursor=pointer]:
          - /url: /app/admin?tab=directory-players
        - link "Directory Analytics" [ref=f1e45] [cursor=pointer]:
          - /url: /app/admin?tab=directory-analytics
        - link "Campaigns & Consent" [ref=f1e49] [cursor=pointer]:
          - /url: /app/admin?tab=directory-campaigns
        - link "Governance & Export" [ref=f1e54] [cursor=pointer]:
          - /url: /app/admin?tab=directory-governance
      - generic [ref=f1e60]:
        - link "Switch to RallyHub / Club Admin" [ref=f1e61] [cursor=pointer]:
          - /url: /app/admin?tab=linking
        - link "View public Directory" [ref=f1e64] [cursor=pointer]:
          - /url: /directory
      - generic [ref=f1e70]:
        - paragraph [ref=f1e71]: Directory test admin
        - paragraph [ref=f1e72]: Super Admin
    - generic [ref=f1e73]:
      - banner [ref=f1e74]:
        - generic [ref=f1e75]:
          - button "Current appearance Auto. Change appearance." [ref=f1e76] [cursor=pointer]:
            - generic [ref=f1e77]: Auto
          - button "DT Directory test admin admin" [ref=f1e78] [cursor=pointer]:
            - generic [ref=f1e79]: DT
            - generic [ref=f1e80]:
              - paragraph [ref=f1e81]: Directory test admin
              - paragraph [ref=f1e82]: admin
      - main [ref=f1e83]:
        - generic [ref=f1e84]:
          - generic [ref=f1e85]:
            - generic [ref=f1e86]:
              - heading "Directory Command Centre" [level=1] [ref=f1e87]
              - paragraph [ref=f1e88]: Independent Directory administration · people, listings, consent and analytics
            - generic [ref=f1e89]: Admin Only
          - generic "Administration workspace switch" [ref=f1e93]:
            - button "Directory Command Centre" [ref=f1e94] [cursor=pointer]
            - button "RallyHub / Clare Pickleball Admin" [ref=f1e95] [cursor=pointer]
            - generic [ref=f1e96]: Directory-only data and controls
          - button "Open Directory enquiries inbox" [ref=f1e97] [cursor=pointer]:
            - generic [ref=f1e98]:
              - paragraph [ref=f1e99]: Directory enquiries requiring follow-up
              - paragraph [ref=f1e100]: No outstanding enquiries
            - generic [ref=f1e101]: "0"
          - generic [ref=f1e102]:
            - tablist "Directory Command Centre navigation" [ref=f1e103]:
              - tab "Overview" [ref=f1e104] [cursor=pointer]
              - tab "People & CRM" [ref=f1e107] [cursor=pointer]
              - tab "Listings & Claims" [ref=f1e113] [cursor=pointer]
              - tab "Owners & Editors" [ref=f1e118] [cursor=pointer]
              - tab "Player Network" [ref=f1e124] [cursor=pointer]
              - tab "Analytics" [ref=f1e130] [cursor=pointer]
              - tab "Campaigns & Consent" [ref=f1e134] [cursor=pointer]
              - tab "Governance & Export" [selected] [ref=f1e138] [cursor=pointer]
            - tabpanel "Governance & Export" [ref=f1e141]:
              - generic [ref=f1e143]:
                - heading "Directory governance & portability" [level=2] [ref=f1e144]
                - paragraph [ref=f1e145]: Directory profiles, subscriptions and tenant memberships have independent consent and permissions. Proposed identity links are only references; they never merge records, grant club roles or activate syncing.
                - generic [ref=f1e146]:
                  - heading "Explicit cross-domain identity-link proposals" [level=3] [ref=f1e147]
                  - paragraph [ref=f1e148]: The tenant-side consent evidence must be independently verified before a proposed link can ever be activated. Activation is deliberately not available in this phase of the interface.
                  - generic [ref=f1e149]:
                    - text: Directory identity type
                    - combobox "Directory identity type" [ref=f1e150]:
                      - option "Directory subscriber" [selected]
                      - option "Directory listing owner/editor access"
                  - generic [ref=f1e151]:
                    - generic [ref=f1e152]:
                      - text: Directory record ID
                      - textbox "Directory record ID" [ref=f1e153]:
                        - /placeholder: ""
                    - generic [ref=f1e154]:
                      - text: Tenant ID
                      - textbox "Tenant ID" [ref=f1e155]:
                        - /placeholder: ""
                    - generic [ref=f1e156]:
                      - text: Tenant person ID
                      - textbox "Tenant person ID" [ref=f1e157]:
                        - /placeholder: ""
                    - generic [ref=f1e158]:
                      - text: Link purpose
                      - textbox "Link purpose" [ref=f1e159]:
                        - /placeholder: ""
                    - generic [ref=f1e160]:
                      - text: Directory consent evidence ID
                      - textbox "Directory consent evidence ID" [ref=f1e161]:
                        - /placeholder: ""
                    - generic [ref=f1e162]:
                      - text: Tenant consent evidence ID
                      - textbox "Tenant consent evidence ID" [ref=f1e163]:
                        - /placeholder: ""
                  - generic [ref=f1e164]:
                    - text: Source and verification provenance
                    - textbox "Source and verification provenance" [ref=f1e165]:
                      - /placeholder: ""
                  - button "Record link proposal (no sync)" [ref=f1e166] [cursor=pointer]
                - generic [ref=f1e167]:
                  - heading "Standalone Directory export" [level=3] [ref=f1e168]
                  - paragraph [ref=f1e169]: Private super-admin-only snapshot of all Directory entities using cursor pagination. Authentication secrets and unsubscribe tokens are excluded and must be reissued in a restored environment; adapters are listed in the manifest.
                  - generic [ref=f1e170]:
                    - button "Reconcile export inventory" [ref=f1e171] [cursor=pointer]
                    - button "Download protected snapshot" [disabled]
  - contentinfo "RallyHub copyright" [ref=f1e172]:
    - generic [ref=f1e173]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const APP_ID='6a01dc00702b7dd2a2978c28';
  3  | const base={success:true,campaigns:[],links:[],suppressionCounts:{active:0,total:0},limits:{campaigns:250,links:250,suppressions:500}};
  4  | async function mockGovernance(page,{authorised=true}={}){
  5  |  let calls=0;
  6  |  await page.addInitScript(()=>localStorage.setItem('base44_access_token','directory-governance-fixture-token'));
  7  |  await page.route('**/api/apps/**',async route=>{
  8  |   const url=new URL(route.request().url()),path=url.pathname;
  9  |   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  10 |   if(path.includes('/public-settings/'))return reply({id:APP_ID,public_settings:{}});
  11 |   if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me'))return reply({id:authorised?'6a0b5afd3f4b9681265a1398':'unrelated-admin-id',role:'admin',email:'test@example.test',full_name:'Directory test admin',approval_status:'approved'});
  12 |   if(path.includes('/analytics/'))return reply({});
  13 |   if(path.includes('/entities/'))return reply([]);
  14 |   const marker=`/api/apps/${APP_ID}/functions/`;
  15 |   if(path.includes(marker)){
  16 |    const name=path.split(marker)[1].split('/')[0];let body={};try{body=route.request().postDataJSON()||{}}catch{}
  17 |    if(name==='securityContext')return reply({success:true,context:{}});
  18 |    if(name==='directoryAdminAccess')return reply({authorised});
  19 |    if(name==='directoryGovernance'){
  20 |     calls++;
  21 |     if(!authorised)return reply({error:'Directory super-admin access required'},403);
  22 |     if(body.action==='admin_overview')return reply(base);
  23 |     if(body.action==='admin_save_draft')return reply({success:true,campaign:{id:'campaign_00000001',name:body.name,purpose:body.purpose,channel:'email',status:'draft'}});
  24 |     return reply({error:'Unsupported test action'},400);
  25 |    }
  26 |    if(name==='directoryClaim')return reply({success:true,pendingAdminCount:0});
  27 |    if(name==='directoryPlayerNetwork')return reply({success:true,subscribers:[],counts:{total:0}});
  28 |    if(name==='directoryEnquiryAdmin')return reply({success:true,enquiries:[],contactActions:[]});
  29 |    return reply({success:true});
  30 |   }
  31 |   return reply({success:true});
  32 |  });
  33 |  return ()=>calls;
  34 | }
  35 | test('Directory super-admin campaign UI is separate, and saving draft never sends',async({page})=>{
  36 |  const count=await mockGovernance(page);
  37 |  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  38 |  await page.goto('/app/admin?tab=directory-campaigns');
  39 |  await expect(page.getByText('Directory campaigns & consent')).toBeVisible({timeout:12000});
  40 |  await expect(page.getByText('Campaign drafts and approvals')).toBeVisible();
  41 |  await page.getByLabel('Campaign name').fill('Autumn Directory updates');
  42 |  await page.getByLabel('Email subject').fill('Autumn pickleball events');
  43 |  await page.getByLabel('Plain-text email content').fill('Here are the upcoming pickleball events in your area.');
  44 |  await page.getByRole('button',{name:'Save draft'}).click();
  45 |  await expect(page.getByRole('button',{name:'Preview eligible audience'})).toBeEnabled();
  46 |  await page.goto('/app/admin?tab=directory-governance');
  47 |  await expect(page.getByText('Directory governance & portability')).toBeVisible();
  48 |  await expect(page.getByText('Standalone Directory export')).toBeVisible();
> 49 |  expect(count().governanceCalls).toBeGreaterThanOrEqual(2);
     |                                  ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  50 |  expect(count().requests.some(path=>path.includes('/functions/membershipRecord')||path.includes('/entities/ClubRelationship')||path.endsWith('/entities/Player'))).toBe(false);
  51 |  expect(errors).toEqual([]);
  52 | });
  53 | test('unrelated admin cannot enter protected Directory governance',async({page})=>{
  54 |  const count=await mockGovernance(page,{authorised:false});
  55 |  await page.goto('/app/admin?tab=directory-governance');
  56 |  await expect(page.getByText('Directory governance & portability')).toHaveCount(0,{timeout:12000});
  57 |  expect(count().governanceCalls).toBe(0);
  58 | });
  59 | 
```