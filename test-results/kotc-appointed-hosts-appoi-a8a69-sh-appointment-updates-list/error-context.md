# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-appointed-hosts.spec.mjs >> appointed hosts: names and emails persist on refresh; appointment updates list
- Location: e2e/kotc-appointed-hosts.spec.mjs:16:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.fill: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-event-host-search').locator('input')

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - generic [ref=f1e8]:
    - paragraph [ref=f1e9]: Restricted Host Access
    - paragraph [ref=f1e10]: Appoint tonight’s host before Round 1. The host can refresh Spond, manage the roster and set up the session.
  - generic [ref=f1e11]:
    - paragraph [ref=f1e12]: Pre-session Host Link
    - paragraph [ref=f1e13]: http://127.0.0.1:5173/kotc-event-host/host-access-test-event
    - generic [ref=f1e14]:
      - button "Copy Host Link" [ref=f1e15] [cursor=pointer]
      - button "Preview" [ref=f1e16] [cursor=pointer]
  - generic [ref=f1e17]:
    - text: Find a host by name
    - textbox "Find a host by name" [ref=f1e22]:
      - /placeholder: Search club members or tonight’s roster…
    - paragraph [ref=f1e23]: Select one or more members. Search another name without losing your selection.
    - button "Appoint Hosts" [disabled]
  - generic [ref=f1e24]:
    - paragraph [ref=f1e25]: Appointed hosts (3)
    - list [ref=f1e26]:
      - listitem [ref=f1e27]:
        - paragraph [ref=f1e28]: Host One
        - paragraph [ref=f1e29]: one@example.test
      - listitem [ref=f1e30]:
        - paragraph [ref=f1e31]: Host Two
        - paragraph [ref=f1e32]: two@example.test
      - listitem [ref=f1e33]:
        - paragraph [ref=f1e34]: Host Three
        - paragraph [ref=f1e35]: three@example.test
    - paragraph [ref=f1e36]: Only authorised, signed-in hosts can use this link.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | const appId=process.env.VITE_BASE44_APP_ID||'6a01dc00702b7dd2a2978c28';
  3  | const initial=[{id:'grant1',user_id:'u1',name:'Host One',email:'one@example.test'},{id:'grant2',user_id:'u2',name:'Host Two',email:'two@example.test'},{id:'grant3',user_id:'u3',name:'Host Three',email:'three@example.test'}];
  4  | const fourth={id:'grant4',user_id:'u4',name:'Host Four',email:'four@example.test'};
  5  | async function mock(page,hosts){
  6  |  await page.route(`**/api/apps/${appId}/functions/manageKotcEventHost`,async route=>{
  7  |   const b=route.request().postDataJSON()||{};
  8  |   let data;
  9  |   if(b.action==='state')data={hosts};
  10 |   else if(b.action==='search_hosts')data={people:[{id:'p4',name:fourth.name,email:fourth.email,isMember:true}]};
  11 |   else if(b.action==='grant'){hosts.push(fourth);data={success:true};}
  12 |   else data={error:'Unexpected action'};
  13 |   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  14 |  });
  15 | }
  16 | test('appointed hosts: names and emails persist on refresh; appointment updates list',async({page})=>{
  17 |  const hosts=initial.map(x=>({...x}));await mock(page,hosts);
  18 |  await page.goto('/e2e/kotcHostAccessHarness.html');
  19 |  const list=page.getByTestId('kotc-appointed-host-list');
  20 |  await expect(list).toContainText('Appointed hosts (3)');
  21 |  for(const h of initial){await expect(list.getByText(h.name,{exact:true})).toBeVisible();await expect(list.getByText(h.email,{exact:true})).toBeVisible();}
  22 |  await page.reload();await expect(list).toContainText('Appointed hosts (3)');
  23 |  for(const h of initial)await expect(list.getByText(h.name,{exact:true})).toBeVisible();
> 24 |  await page.getByTestId('kotc-event-host-search').locator('input').fill('Host Four');
     |                                                                    ^ Error: locator.fill: Test timeout of 45000ms exceeded.
  25 |  await expect(page.getByRole('checkbox',{name:'Select Host Four as host'})).toBeVisible();
  26 |  await page.getByRole('checkbox',{name:'Select Host Four as host'}).check();
  27 |  await page.getByRole('button',{name:'Appoint 1 Host'}).click();
  28 |  await expect(list).toContainText('Appointed hosts (4)');
  29 |  await expect(list.getByText(fourth.name,{exact:true})).toBeVisible();
  30 |  await expect(list.getByText(fourth.email,{exact:true})).toBeVisible();
  31 | });
  32 | 
```