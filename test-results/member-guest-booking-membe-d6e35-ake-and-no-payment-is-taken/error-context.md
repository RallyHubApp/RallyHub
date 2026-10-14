# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: member-guest-booking.spec.mjs >> member or guest session booking mobile flow >> beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken
- Location: e2e/member-guest-booking.spec.mjs:124:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Beginner/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Current appearance Auto. Change appearance." [ref=e4] [cursor=pointer]
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e9]:
          - generic [ref=e10]: Clare Pickleball
          - generic [ref=e11]: Session Booking
        - generic [ref=e12]:
          - generic [ref=e13]: Powered by
          - generic [ref=e14]: RallyHub
      - heading "Book or request a session" [level=1] [ref=e15]
      - paragraph [ref=e16]: Choose a guest visit, an experienced-player visit, or pay for an additional session as an existing member.
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - heading "1. About you" [level=2] [ref=e21]
            - paragraph [ref=e22]: Guest requests are checked by the club before payment.
          - button "Change" [ref=e23] [cursor=pointer]
        - generic [ref=e24]:
          - text: Full name
          - textbox "Full name" [ref=e25]
        - generic [ref=e26]:
          - generic [ref=e27]:
            - text: Email
            - textbox "Email" [ref=e28]
          - generic [ref=e29]:
            - text: Mobile
            - textbox "Mobile" [ref=e30]
        - generic [ref=e31]:
          - checkbox "I confirm that I am 18 years of age or over." [ref=e32]
          - strong [ref=e34]: I confirm that I am 18 years of age or over.
      - generic [ref=e35]:
        - heading "2. Playing experience" [level=2] [ref=e36]
        - paragraph [ref=e37]:
          - text: "Selected:"
          - strong [ref=e38]: Guest / beginner
          - text: . Use Change above to choose a different route.
      - generic [ref=e39]:
        - generic [ref=e40]:
          - heading "3. Previous sporting experience" [level=2] [ref=e41]
          - paragraph [ref=e42]: Please indicate if you have ever played any of these sports previously, even if only briefly or at school. Tick all that apply.
        - generic [ref=e43]:
          - generic [ref=e44]:
            - checkbox "Tennis" [ref=e45]
            - generic [ref=e46]: Tennis
          - generic [ref=e47]:
            - checkbox "Badminton" [ref=e48]
            - generic [ref=e49]: Badminton
          - generic [ref=e50]:
            - checkbox "Squash" [ref=e51]
            - generic [ref=e52]: Squash
          - generic [ref=e53]:
            - checkbox "Racketball" [ref=e54]
            - generic [ref=e55]: Racketball
          - generic [ref=e56]:
            - checkbox "Padel" [ref=e57]
            - generic [ref=e58]: Padel
          - generic [ref=e59]:
            - checkbox "Table Tennis" [ref=e60]
            - generic [ref=e61]: Table Tennis
          - generic [ref=e62]:
            - checkbox "None of these" [ref=e63]
            - generic [ref=e64]: None of these
        - generic [ref=e65]:
          - generic [ref=e66]: Any other sporting history or background you think may be relevant? (optional)
          - textbox "Any other sporting history or background you think may be relevant? (optional)" [ref=e67]:
            - /placeholder: Anything else you would like us to know about your sporting experience.
      - generic [ref=e68]:
        - generic [ref=e69]:
          - heading "4. Health & medical information" [level=2] [ref=e70]
          - paragraph [ref=e71]: This information is only for authorised club/session organisers and helps the host support you safely.
        - generic [ref=e72]:
          - paragraph [ref=e73]:
            - strong [ref=e74]: Are you currently receiving medical treatment for any serious illness, or taking heart or blood pressure medication?
          - paragraph [ref=e75]:
            - strong [ref=e76]: Have you had surgery or sustained an injury through sport or another activity that required medical intervention or treatment in the last 3 years?
          - paragraph [ref=e77]:
            - strong [ref=e78]: Do you have balance, hearing, sight or other health issues that might be pertinent?
        - group "Does any of the above apply to you?" [ref=e79]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - radio "Yes" [ref=e83]
              - text: "Yes"
            - generic [ref=e84]:
              - radio "No" [ref=e85]
              - text: "No"
      - generic [ref=e86]:
        - heading "5. Choose your session" [level=2] [ref=e87]
        - paragraph [ref=e88]: Beginner guest places are available at Ennistymon, Corofin, Clarecastle and Shannon, subject to session availability.
        - generic [ref=e89]:
          - generic [ref=e91] [cursor=pointer]:
            - radio "Ennistymon Community Centre Wednesday · 19:00–20:00 Club Session · €5.50" [ref=e92]
            - generic [ref=e93]:
              - paragraph [ref=e95]: Ennistymon Community Centre
              - paragraph [ref=e96]: Wednesday · 19:00–20:00
              - paragraph [ref=e97]: Club Session · €5.50
          - generic [ref=e99] [cursor=pointer]:
            - radio "Ennistymon Community Centre Wednesday · 20:00–21:00 Club Session · €5.50" [ref=e100]
            - generic [ref=e101]:
              - paragraph [ref=e103]: Ennistymon Community Centre
              - paragraph [ref=e104]: Wednesday · 20:00–21:00
              - paragraph [ref=e105]: Club Session · €5.50
          - generic [ref=e107] [cursor=pointer]:
            - radio "Corofin GAA Sports Hall Wednesday · 11:30–13:30 Club Session · €5.00 · cash" [ref=e108]
            - generic [ref=e109]:
              - paragraph [ref=e111]: Corofin GAA Sports Hall
              - paragraph [ref=e112]: Wednesday · 11:30–13:30
              - paragraph [ref=e113]: Club Session · €5.00 · cash
      - generic [ref=e114]:
        - strong [ref=e118]: No payment is taken with this request.
        - text: If approved, Clare Pickleball will send you a private link to complete the guest booking and payment.
      - status [ref=e119]: "To continue: Enter your full name."
      - button "Send guest request" [ref=e120] [cursor=pointer]
```

# Test source

```ts
  28  |     calls.push({ name:'guestAccessJourney', body });
  29  |     if (body.action === 'public_get') return json(route, {
  30  |       success:true, club, minimumAge:18, adultsOnly:true,
  31  |       requireDuprForExperienced:true, requireHomeClubForExperienced:true,
  32  |       sessions:guestSessions,
  33  |     });
  34  |     if (body.action === 'public_submit') return json(route, { success:true, pending:true, message:'Thanks. Your guest request has been sent to Clare Pickleball for approval.' });
  35  |     return json(route, { error:'Unexpected guest action' }, 400);
  36  |   });
  37  |   await page.route('**/api/apps/**/functions/guestSessionBooking', async route => {
  38  |     let body={}; try { body=route.request().postDataJSON() || {}; } catch {}
  39  |     calls.push({ name:'guestSessionBooking', body });
  40  |     if (body.action === 'public_member_lookup') {
  41  |       if (memberLookup === 'not-found') return json(route, { error:'No membership record found. Please follow the guest booking process.', code:'MEMBERSHIP_NOT_FOUND', memberFound:false }, 404);
  42  |       return json(route, { success:true, memberFound:true, firstName:'Brian', verificationMethod:'name', message:'Membership found. Hi Brian, choose one of the Spond sessions you are invited to and go straight to payment.', sessions:memberSessions });
  43  |     }
  44  |     if (body.action === 'public_member_submit') {
  45  |       if (memberSubmit === 'payment') return json(route, { success:true, participantType:'member', bookingId:'booking-1', bookingStatus:'pending_payment', paymentStatus:'pending', paymentUrl:'http://127.0.0.1:5173/__test_payment' });
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
  100 |     await page.getByRole('button',{name:/I’m a guest/}).click();
  101 |     await page.getByRole('button',{name:/Experienced pickleball player/}).click();
  102 |     await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toHaveCount(0);
  103 |     await expect(page.getByRole('heading',{name:'3. Health & medical information'})).toBeVisible();
  104 |     await expect(page.getByText('Doora Barefield')).toBeVisible();
  105 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  106 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  107 |     await page.getByLabel('DUPR').fill('No DUPR');
  108 |     await page.getByLabel('Club you normally play with').fill('Galway Pickleball');
  109 |     await page.getByLabel('No',{exact:true}).check();
  110 |     await page.getByLabel('Full name').fill('Experienced Guest');
  111 |     await page.getByLabel('Email').fill('experienced@example.test');
  112 |     await page.getByLabel('Mobile').fill('0877654321');
  113 |     await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
  114 |     await page.getByText('Doora Barefield').click();
  115 |     await page.getByRole('button',{name:'Send guest request'}).click();
  116 |     await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
  117 |     const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
  118 |     expect(submit.body.experienceLevel).toBe('experienced');
  119 |     expect(submit.body.previousSports).toEqual([]);
  120 |     expect(submit.body.sportingBackgroundNote).toBe('');
  121 |     expect(submit.body.healthDeclarationApplies).toBe(false);
  122 |   });
  123 | 
  124 |   test('beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken', async ({ page }) => {
  125 |     const calls=await mockPublicApi(page);
  126 |     await page.goto('/guest/clare-pickleball');
  127 |     await page.getByRole('button',{name:/I’m a guest/}).click();
> 128 |     await page.getByRole('button',{name:/Beginner/}).click();
      |                                                      ^ Error: locator.click: Test timeout of 45000ms exceeded.
  129 |     await expect(page.getByText('Beginner guest places are currently available only at Ennistymon and Corofin, as Ennis is full at the moment.')).toBeVisible();
  130 |     await expect(page.getByText('Doora Barefield')).toHaveCount(0);
  131 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  132 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  133 |     await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toBeVisible();
  134 |     await page.getByRole('checkbox',{name:'Tennis',exact:true}).check();
  135 |     await page.getByRole('checkbox',{name:'Badminton',exact:true}).check();
  136 |     await page.getByLabel(/Any other sporting history/).fill('Played volleyball socially for several years.');
  137 |     await expect(page.getByRole('checkbox',{name:'Tennis',exact:true})).toBeChecked();
  138 |     await expect(page.getByRole('checkbox',{name:'Badminton',exact:true})).toBeChecked();
  139 |     await page.getByLabel('Yes',{exact:true}).check();
  140 |     await page.getByLabel('Please give brief details').fill('Previous knee surgery, fully recovered.');
  141 |     await page.getByLabel('Full name').fill('Guest Tester');
  142 |     await page.getByLabel('Email').fill('guest@example.test');
  143 |     await page.getByLabel('Mobile').fill('0871234567');
  144 |     await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
  145 |     await page.getByText('Ennistymon Community Centre').first().click();
  146 |     await expect(page.getByText(/No payment is taken with this request/)).toBeVisible();
  147 |     await page.getByRole('button',{name:'Send guest request'}).click();
  148 |     await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
  149 |     const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
  150 |     expect(submit.body.previousSports).toEqual(['Tennis','Badminton']);
  151 |     expect(submit.body.sportingBackgroundNote).toContain('volleyball');
  152 |     expect(submit.body.healthDeclarationApplies).toBe(true);
  153 |     expect(submit.body.medicalNote).toContain('knee surgery');
  154 |   });
  155 | });
  156 | 
```