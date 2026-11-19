# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-delegated-host.spec.mjs >> mobile timed tie: named-team serving buttons preview the correct winner
- Location: e2e/kotc-delegated-host.spec.mjs:200:1

# Error details

```
Test timeout of 20000ms exceeded.
```

```
Error: locator.click: Test timeout of 20000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-start-round')

```

# Test source

```ts
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
  154 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:1800});
  155 |   expect(model.match.revision).toBe(1);
  156 | });
  157 | 
  158 | test('live host editor updates unscored court without rewinding and protects saved matches',async({page})=>{
  159 |   const model=createModel();
  160 |   const originalHandle=model.handle;
  161 |   model.handle=async(name,body)=>{
  162 |     if(name==='kotcCommand'&&body.commandType==='adjust_started_round'){
  163 |       model.calls.push({name,body});
  164 |       if(model.match.status!=='scheduled')return {__status:409,error:'Court 1 already has a score'};
  165 |       for(const slot of model.slots)if(body.slotParticipantIds?.[slot.id])slot.participant_id=body.slotParticipantIds[slot.id];
  166 |       model.match.team_a_participant_ids=model.slots.filter(s=>s.team_side==='A').map(s=>s.participant_id);
  167 |       model.match.team_b_participant_ids=model.slots.filter(s=>s.team_side==='B').map(s=>s.participant_id);
  168 |       model.match.revision++;model.round.proposal_revision++;model.session.revision++;
  169 |       return {success:true,session:model.session,round:model.round,affectedCourts:[1]};
  170 |     }
  171 |     return originalHandle(name,body);
  172 |   };
  173 |   await install(page,model);
  174 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
  175 |   await page.getByTestId('kotc-start-round').click();
  176 |   await expect(page.getByTestId('kotc-live-player-editor-toggle')).toBeVisible();
  177 |   await page.getByTestId('kotc-live-player-editor-toggle').click();
  178 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  179 |   await page.getByTestId('kotc-slot-slot-a1').click();
  180 |   await page.getByTestId('kotc-slot-slot-b1').click();
  181 |   await page.getByTestId('kotc-save-round-setup').click();
  182 |   await expect.poll(()=>model.calls.filter(c=>c.body?.commandType==='adjust_started_round').length).toBe(1);
  183 |   expect(model.round.status).toBe('started');
  184 |   expect(model.match.team_a_participant_ids).toContain('participant-3');
  185 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Host Player 3 & Host Player 2');
  186 |   await page.getByTestId('kotc-live-player-editor-toggle').click();
  187 |   const a=page.getByTestId('kotc-score-1-a'),b=page.getByTestId('kotc-score-1-b');
  188 |   await a.fill('8');await b.fill('5');await page.getByTestId('kotc-complete-1').click();
  189 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 8–5');
  190 |   await page.getByTestId('kotc-live-player-editor-toggle').click();
  191 |   await page.getByTestId('kotc-slot-slot-a1').click();
  192 |   await page.getByTestId('kotc-slot-slot-b1').click();
  193 |   await page.getByTestId('kotc-save-round-setup').click();
  194 |   await expect(page.getByTestId('kotc-save-round-status')).toContainText('Court 1 already has a score');
  195 |   expect(model.round.status).toBe('started');
  196 |   expect(model.match.team_a_participant_ids).toContain('participant-3');
  197 | });
  198 | 
  199 | 
  200 | test('mobile timed tie: named-team serving buttons preview the correct winner',async({page})=>{
  201 |   const model=createModel();await install(page,model);
  202 |   await page.goto('/e2e/kotcDelegatedHostHarness.html');
> 203 |   await page.getByTestId('kotc-start-round').click();
      |                                              ^ Error: locator.click: Test timeout of 20000ms exceeded.
  204 |   await page.getByTestId('kotc-score-1-a').fill('4');
  205 |   await page.getByTestId('kotc-score-1-b').fill('4');
  206 |   const choice=page.getByTestId('kotc-serving-choice-1');
  207 |   await expect(choice.getByRole('button',{name:/Host Player 3.*Host Player 4.*Team B/})).toBeVisible();
  208 |   await expect(page.getByTestId('kotc-complete-1')).toBeDisabled();
  209 |   await page.getByTestId('kotc-serving-1-b').click();
  210 |   await expect(page.getByTestId('kotc-winner-1')).toContainText('Host Player 3 & Host Player 4 win 4–4');
  211 |   await expect(page.getByTestId('kotc-complete-1')).toBeEnabled();
  212 | });
  213 | 
```