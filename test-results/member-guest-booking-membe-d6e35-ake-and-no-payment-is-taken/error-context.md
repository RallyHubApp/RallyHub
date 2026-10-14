# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: member-guest-booking.spec.mjs >> member or guest session booking mobile flow >> beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken
- Location: e2e/member-guest-booking.spec.mjs:123:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Request sent' })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Request sent' }) with timeout 3000ms
  - waiting for getByRole('heading', { name: 'Request sent' })

```

```yaml
- button "Current appearance Auto. Change appearance.":
  - img
- text: Clare Pickleball Guest Request Powered by RallyHub
- img
- heading "Request received — awaiting club approval" [level=1]
- paragraph: Thanks. Your guest request has been sent to Clare Pickleball for approval.
- link "Back to club directory page":
  - /url: /directory/clare-pickleball
```

# Test source

```ts
  46  |       return json(route, { success:true, participantType:'member', bookingId:'booking-1', bookingStatus:'confirmed', paymentStatus:'paid', paymentUrl:'', message:'Your booking is confirmed.', session:{ sessionDate:'2026-09-30', startTime:'20:00', endTime:'21:00', venueName:'Ennistymon Community Centre', venueAddress:'Parliament Street' } });
  47  |     }
  48  |     return json(route, { error:'Unexpected booking action' }, 400);
  49  |   });
  50  |   await page.route('**/__test_payment', route => route.fulfill({status:200, contentType:'text/html', body:'<title>Payment Test</title><h1>Payment handoff reached</h1>'}));
  51  |   return calls;
  52  | }
  53  | 
  54  | test.describe('member or guest session booking mobile flow', () => {
  55  |   test.use({ viewport:{width:390,height:844} });
  56  | 
  57  |   test('member verifies, sees only personalised Spond sessions, note travels to checkout', async ({ page }) => {
  58  |     const calls=await mockPublicApi(page);
  59  |     await page.goto('/guest/clare-pickleball');
  60  |     await expect(page.getByRole('heading',{name:'Book or request a session'})).toBeVisible();
  61  |     await expect(page.getByRole('button',{name:/I’m an existing member/})).toBeVisible();
  62  |     await expect(page.getByRole('button',{name:/I’m a guest/})).toBeVisible();
  63  | 
  64  |     await page.getByRole('button',{name:/I’m an existing member/}).click();
  65  |     await page.getByLabel('Full name').fill('Brian Moore');
  66  |     await page.getByRole('button',{name:'Check my membership'}).click();
  67  | 
  68  |     await expect(page.getByText(/Membership found\. Hi Brian/)).toBeVisible();
  69  |     await expect(page.getByText('1900 Wed Social')).toBeVisible();
  70  |     await expect(page.getByText('2000 Wed Club Session')).toBeVisible();
  71  |     await expect(page.getByText(/Only upcoming Spond sessions you are invited to are shown/)).toBeVisible();
  72  | 
  73  |     await page.getByText('2000 Wed Club Session').click();
  74  |     await page.getByLabel(/Anything you want the session host to know/).fill("My phone was stolen so I couldn't book through Spond.");
  75  |     await expect(page.getByRole('button',{name:'Continue to payment · €5.50'})).toBeEnabled();
  76  |     await page.getByRole('button',{name:'Continue to payment · €5.50'}).click();
  77  |     await expect(page.getByRole('heading',{name:'Payment handoff reached'})).toBeVisible();
  78  | 
  79  |     const lookup=calls.find(x=>x.name==='guestSessionBooking'&&x.body.action==='public_member_lookup');
  80  |     const submit=calls.find(x=>x.name==='guestSessionBooking'&&x.body.action==='public_member_submit');
  81  |     expect(lookup.body.fullName).toBe('Brian Moore');
  82  |     expect(submit.body.sessionId).toContain('spond:2:');
  83  |     expect(submit.body.bookingNote).toContain('phone was stolen');
  84  |   });
  85  | 
  86  |   test('unknown member fails closed and can switch into guest journey', async ({ page }) => {
  87  |     await mockPublicApi(page,{memberLookup:'not-found'});
  88  |     await page.goto('/guest/clare-pickleball');
  89  |     await page.getByRole('button',{name:/I’m an existing member/}).click();
  90  |     await page.getByLabel('Full name').fill('Definitely Not A Member');
  91  |     await page.getByRole('button',{name:'Check my membership'}).click();
  92  |     await expect(page.getByText('No membership record found. Please follow the guest booking process.')).toBeVisible();
  93  |     await page.getByRole('button',{name:'Continue as a guest'}).click();
  94  |     await expect(page.getByRole('heading',{name:'1. About you'})).toBeVisible();
  95  |   });
  96  | 
  97  |   test('experienced pickleball guest skips previous sports, keeps health screening, and sees all experienced sessions', async ({ page }) => {
  98  |     const calls=await mockPublicApi(page);
  99  |     await page.goto('/guest/clare-pickleball');
  100 |     await page.getByRole('button',{name:/I’m an experienced player/}).click();
  101 |     await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toHaveCount(0);
  102 |     await expect(page.getByRole('heading',{name:'3. Health & medical information'})).toBeVisible();
  103 |     await expect(page.getByText('Doora Barefield')).toBeVisible();
  104 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  105 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  106 |     await page.getByLabel('DUPR').fill('No DUPR');
  107 |     await page.getByLabel('Club you normally play with').fill('Galway Pickleball');
  108 |     await page.getByLabel('No',{exact:true}).check();
  109 |     await page.getByLabel('Full name').fill('Experienced Guest');
  110 |     await page.getByLabel('Email').fill('experienced@example.test');
  111 |     await page.getByLabel('Mobile').fill('0877654321');
  112 |     await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
  113 |     await page.getByText('Doora Barefield').click();
  114 |     await page.getByRole('button',{name:'Send guest request'}).click();
  115 |     await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
  116 |     const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
  117 |     expect(submit.body.experienceLevel).toBe('experienced');
  118 |     expect(submit.body.previousSports).toEqual([]);
  119 |     expect(submit.body.sportingBackgroundNote).toBe('');
  120 |     expect(submit.body.healthDeclarationApplies).toBe(false);
  121 |   });
  122 | 
  123 |   test('beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken', async ({ page }) => {
  124 |     const calls=await mockPublicApi(page);
  125 |     await page.goto('/guest/clare-pickleball');
  126 |     await page.getByRole('button',{name:/I’m a guest/}).click();
  127 |     await expect(page.getByText('Beginner guest places are available at Ennistymon, Corofin, Clarecastle and Shannon, subject to session availability.')).toBeVisible();
  128 |     await expect(page.getByText('Doora Barefield')).toHaveCount(0);
  129 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  130 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  131 |     await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toBeVisible();
  132 |     await page.getByRole('checkbox',{name:'Tennis',exact:true}).check();
  133 |     await page.getByRole('checkbox',{name:'Badminton',exact:true}).check();
  134 |     await page.getByLabel(/Any other sporting history/).fill('Played volleyball socially for several years.');
  135 |     await expect(page.getByRole('checkbox',{name:'Tennis',exact:true})).toBeChecked();
  136 |     await expect(page.getByRole('checkbox',{name:'Badminton',exact:true})).toBeChecked();
  137 |     await page.getByLabel('Yes',{exact:true}).check();
  138 |     await page.getByLabel('Please give brief details').fill('Previous knee surgery, fully recovered.');
  139 |     await page.getByLabel('Full name').fill('Guest Tester');
  140 |     await page.getByLabel('Email').fill('guest@example.test');
  141 |     await page.getByLabel('Mobile').fill('0871234567');
  142 |     await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
  143 |     await page.getByText('Ennistymon Community Centre').first().click();
  144 |     await expect(page.getByText(/No payment is taken with this request/)).toBeVisible();
  145 |     await page.getByRole('button',{name:'Send guest request'}).click();
> 146 |     await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  147 |     const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
  148 |     expect(submit.body.previousSports).toEqual(['Tennis','Badminton']);
  149 |     expect(submit.body.sportingBackgroundNote).toContain('volleyball');
  150 |     expect(submit.body.healthDeclarationApplies).toBe(true);
  151 |     expect(submit.body.medicalNote).toContain('knee surgery');
  152 |   });
  153 | });
  154 | 
```