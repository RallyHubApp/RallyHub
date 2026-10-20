# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> busy-hall recovery: failed score save preserves keystrokes and retries safely
- Location: e2e/kotc-delegated-host.spec.mjs:140:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-score-card-1')
Expected substring: "Saved 11–7"
Received string:    "Court 1SAVEDTeam AHost Player 1 & Host Player 2WINNERSTeam BHost Player 3 & Host Player 4✓ Saved · Host Player 1 & Host Player 2 win 11–7Edit result"
Timeout: 1800ms

Call log:
  - Expect "toContainText" getByTestId('kotc-score-card-1') with timeout 1800ms
  - waiting for getByTestId('kotc-score-card-1')
    2 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-score-card-1" data-source-location="src/components/kotc/KotcV2SessionView.jsx:86:9" class="glass rounded-xl p-3 sm:p-4 space-y-3 border border-amber-400/60">…</div>
      - unexpected value "Court 1LIVETeam AHost Player 1 & Host Player 2WINNERSTeam BHost Player 3 & Host Player 4Winner preview · Host Player 1 & Host Player 2 win 11–7Saving…Saving…"
    15 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-score-card-1" data-source-location="src/components/kotc/KotcV2SessionView.jsx:86:9" class="glass rounded-xl p-3 sm:p-4 space-y-3 border border-green-500/30">…</div>
       - unexpected value "Court 1SAVEDTeam AHost Player 1 & Host Player 2WINNERSTeam BHost Player 3 & Host Player 4✓ Saved · Host Player 1 & Host Player 2 win 11–7Edit result"

```

```yaml
- img
- text: Court 1 SAVED
- paragraph: Team A
- paragraph:
  - img
  - text: Host Player 1 & Host Player 2
- paragraph: WINNERS
- textbox [disabled]: "11"
- paragraph: Team B
- paragraph: Host Player 3 & Host Player 4
- textbox [disabled]: "7"
- text: ✓ Saved · Host Player 1 & Host Player 2 win 11–7
- button "Edit result":
  - img
  - text: Edit result
```

# Test source

```ts
  54  |     if(out?.__status)return json(route,{error:out.error},out.__status);
  55  |     return json(route,out);
  56  |   });
  57  | }
  58  | 
  59  | test.use({viewport:{width:390,height:844}});
  60  | 
  61  | test('delegated host: session-only controls, attendee contacts, links and keyboard scoring',async({page})=>{
  62  |   const model=createModel();await install(page,model);
  63  |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  64  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 ready');
  65  |   await expect(page.getByTestId('kotc-next-action')).toContainText('check the 1 court assignments');
  66  | 
  67  |   // Session-only contact access: four attendees are visible, a non-roster record is not.
  68  |   await page.getByTestId('kotc-session-menu').click();
  69  |   await page.getByRole('button',{name:'Contacts'}).click();
  70  |   await page.getByTestId('kotc-contact-search').fill('Host Player 1');
  71  |   const contacts=page.getByTestId('kotc-contact-directory');
  72  |   await expect(contacts.getByText('Host Player 1',{exact:true})).toBeVisible();
  73  |   await expect(contacts.getByText('Host Player 2',{exact:true})).toHaveCount(0);
  74  |   const memberCall=page.locator('a[href="tel:0850000001"]');const emergencyCall=page.locator('a[href="tel:0860000001"]');
  75  |   await expect(memberCall).toBeVisible();await expect(emergencyCall).toBeVisible();
  76  |   expect((await memberCall.boundingBox())?.height||0).toBeGreaterThanOrEqual(40);
  77  |   await expect(contacts.getByText('Emergency One')).toBeVisible();
  78  |   await expect(contacts.getByText('SHOULD NOT APPEAR')).toHaveCount(0);
  79  |   await page.getByTestId('kotc-contact-search').fill('');
  80  | 
  81  |   // Delegated host can prepare player/public links but cannot appoint another host.
  82  |   await page.getByText('Player Link, Broadcasts & Access').click();
  83  |   await expect(page.getByText('KOTC Player Link',{exact:true})).toBeVisible();
  84  |   await expect(page.getByText('Player Link scoring — one scorer per court')).toHaveCount(0);
  85  |   await expect(page.getByText('Player scoring',{exact:true})).toBeVisible();
  86  |   await expect(page.getByText('Restricted Host Link')).toHaveCount(0);
  87  |   await expect(page.getByRole('button',{name:/Grant Host Access/i})).toHaveCount(0);
  88  |   expect(model.calls.some(c=>c.name==='manageKotcSessionAccess')).toBe(false);
  89  | 
  90  |   // Close the menu and run the sporting action as a host.
  91  |   await page.getByTestId('kotc-session-menu').click();
  92  |   await page.getByTestId('kotc-start-round').click();
  93  |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live · 0/1 scores saved',{timeout:1800});
  94  | 
  95  |   // Simulate real keyboard entry rather than programmatic value injection.
  96  |   // KOTC pickleball score boxes are physically limited to two digits.
  97  |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  98  |   await a.focus();await page.keyboard.type('123');await expect(a).toHaveValue('12');
  99  |   await a.fill('');await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  100 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  101 |   const save=page.getByTestId('kotc-complete-1');
  102 |   const box=await save.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  103 |   await save.click();
  104 |   await expect(page.getByTestId('kotc-next-action')).toContainText('scores complete',{timeout:1800});
  105 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Review/correct anything now');
  106 | 
  107 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  108 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  109 | });
  110 | 
  111 | test('super admin test-mode tools stay local until the real sporting save',async({page})=>{
  112 |   const model=createModel({isAdmin:true});model.session.exclude_from_aggregates=true;await install(page,model);
  113 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  114 |   await expect(page.getByTestId('kotc-sound-check')).toBeVisible();
  115 |   const callsBeforeSound=model.calls.length;
  116 |   await page.getByTestId('kotc-sound-check').getByRole('button',{name:'Test Full Announcement'}).click();
  117 |   await page.waitForTimeout(120);
  118 |   expect(model.calls.length,'Sound check must be device-local and make no Base44 call').toBe(callsBeforeSound);
  119 | 
  120 |   await page.getByTestId('kotc-start-round').click();
  121 |   await expect(page.getByTestId('kotc-fill-test-scores')).toBeVisible({timeout:1800});
  122 |   const savesBefore=model.calls.filter(c=>c.name==='saveKotcScore').length;
  123 |   await page.getByTestId('kotc-fill-test-scores').click();
  124 |   await expect(page.getByTestId('kotc-score-1-a')).toHaveValue('11');
  125 |   await expect(page.getByTestId('kotc-score-1-b')).toHaveValue('6');
  126 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length,'Fill Test Scores must not save anything itself').toBe(savesBefore);
  127 |   await page.getByTestId('kotc-complete-1').click();
  128 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–6',{timeout:1800});
  129 |   expect(model.calls.filter(c=>c.name==='saveKotcScore').length).toBe(savesBefore+1);
  130 | });
  131 | 
  132 | test('session host never sees Super Admin test tools even on a test-flagged session',async({page})=>{
  133 |   const model=createModel();model.session.exclude_from_aggregates=true;model.session.demo_mode=true;await install(page,model);
  134 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  135 |   await page.getByTestId('kotc-start-round').click();
  136 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  137 |   await expect(page.getByTestId('kotc-fill-test-scores')).toHaveCount(0);
  138 | });
  139 | 
  140 | test('busy-hall recovery: failed score save preserves keystrokes and retries safely',async({page})=>{
  141 |   const model=createModel({failFirstScore:true});await install(page,model);
  142 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  143 |   await page.getByTestId('kotc-start-round').click();
  144 |   await expect(page.getByTestId('kotc-next-action')).toContainText('Round 1 live',{timeout:1800});
  145 | 
  146 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  147 |   await a.focus();await page.keyboard.type('11');await page.keyboard.press('Tab');await page.keyboard.type('7');
  148 |   await page.getByTestId('kotc-complete-1').click();
  149 | 
  150 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Save failed — your score is still on screen',{timeout:1800});
  151 |   await expect(a).toHaveValue('11');await expect(b).toHaveValue('7');
  152 |   await expect(page.getByTestId('kotc-complete-1')).toContainText('Retry Save');
  153 |   await page.getByTestId('kotc-complete-1').click();
> 154 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
      |                                                       ^ Error: expect(locator).toContainText(expected) failed
  155 |   expect(model.match.revision).toBe(1);
  156 | });
  157 | 
```