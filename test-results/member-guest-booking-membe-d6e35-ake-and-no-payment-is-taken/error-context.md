# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: member-guest-booking.spec.mjs >> member or guest session booking mobile flow >> beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken
- Location: e2e/member-guest-booking.spec.mjs:97:3

# Error details

```
Error: locator.check: Error: strict mode violation: getByLabel('Tennis') resolved to 2 elements:
    1) <input type="checkbox" data-arr-index="0" data-dynamic-content="true" data-source-location="src/pages/PublicGuestRequest.jsx:170:339"/> aka getByRole('checkbox', { name: 'Tennis', exact: true })
    2) <input type="checkbox" data-arr-index="5" data-dynamic-content="true" data-source-location="src/pages/PublicGuestRequest.jsx:170:339"/> aka getByRole('checkbox', { name: 'Table Tennis' })

Call log:
  - waiting for getByLabel('Tennis')

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
      - paragraph [ref=e16]: Existing club members can verify their membership and pay directly. Guests follow the normal guest request and approval process.
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
        - generic [ref=e37]:
          - button "Beginner I am new to pickleball or still learning the basics" [active] [ref=e38] [cursor=pointer]:
            - strong [ref=e39]: Beginner
            - generic [ref=e40]: I am new to pickleball or still learning the basics
          - button "Experienced pickleball player I already play pickleball regularly" [ref=e41] [cursor=pointer]:
            - strong [ref=e42]: Experienced pickleball player
            - generic [ref=e43]: I already play pickleball regularly
      - generic [ref=e44]:
        - generic [ref=e45]:
          - heading "3. Previous sporting experience" [level=2] [ref=e46]
          - paragraph [ref=e47]: Please indicate if you have ever played any of these sports previously, even if only briefly or at school. Tick all that apply.
        - generic [ref=e48]:
          - generic [ref=e49]:
            - checkbox "Tennis" [ref=e50]
            - generic [ref=e51]: Tennis
          - generic [ref=e52]:
            - checkbox "Badminton" [ref=e53]
            - generic [ref=e54]: Badminton
          - generic [ref=e55]:
            - checkbox "Squash" [ref=e56]
            - generic [ref=e57]: Squash
          - generic [ref=e58]:
            - checkbox "Racketball" [ref=e59]
            - generic [ref=e60]: Racketball
          - generic [ref=e61]:
            - checkbox "Padel" [ref=e62]
            - generic [ref=e63]: Padel
          - generic [ref=e64]:
            - checkbox "Table Tennis" [ref=e65]
            - generic [ref=e66]: Table Tennis
          - generic [ref=e67]:
            - checkbox "None of these" [ref=e68]
            - generic [ref=e69]: None of these
        - generic [ref=e70]:
          - generic [ref=e71]: Any other sporting history or background you think may be relevant? (optional)
          - textbox "Any other sporting history or background you think may be relevant? (optional)" [ref=e72]:
            - /placeholder: Anything else you would like us to know about your sporting experience.
      - generic [ref=e73]:
        - generic [ref=e74]:
          - heading "4. Health & medical information" [level=2] [ref=e75]
          - paragraph [ref=e76]: This information is only for authorised club/session organisers and helps the host support you safely.
        - generic [ref=e77]:
          - paragraph [ref=e78]:
            - strong [ref=e79]: Are you currently receiving medical treatment for any serious illness, or taking heart or blood pressure medication?
          - paragraph [ref=e80]:
            - strong [ref=e81]: Have you had surgery or sustained an injury through sport or another activity that required medical intervention or treatment in the last 3 years?
          - paragraph [ref=e82]:
            - strong [ref=e83]: Do you have balance, hearing, sight or other health issues that might be pertinent?
        - group "Does any of the above apply to you?" [ref=e84]:
          - generic [ref=e86]:
            - generic [ref=e87]:
              - radio "Yes" [ref=e88]
              - text: "Yes"
            - generic [ref=e89]:
              - radio "No" [ref=e90]
              - text: "No"
      - generic [ref=e91]:
        - heading "5. Choose your session" [level=2] [ref=e92]
        - paragraph [ref=e93]: Beginner guest places are currently available only at Ennistymon and Corofin.
        - generic [ref=e94]:
          - generic [ref=e96] [cursor=pointer]:
            - radio "Ennistymon Community Centre Wednesday · 19:00–20:00 Club Session · €5.50" [ref=e97]
            - generic [ref=e98]:
              - paragraph [ref=e99]: Ennistymon Community Centre
              - paragraph [ref=e100]: Wednesday · 19:00–20:00
              - paragraph [ref=e101]: Club Session · €5.50
          - generic [ref=e103] [cursor=pointer]:
            - radio "Ennistymon Community Centre Wednesday · 20:00–21:00 Club Session · €5.50" [ref=e104]
            - generic [ref=e105]:
              - paragraph [ref=e106]: Ennistymon Community Centre
              - paragraph [ref=e107]: Wednesday · 20:00–21:00
              - paragraph [ref=e108]: Club Session · €5.50
          - generic [ref=e110] [cursor=pointer]:
            - radio "Corofin GAA Sports Hall Wednesday · 11:30–13:30 Club Session · €5.00 · cash" [ref=e111]
            - generic [ref=e112]:
              - paragraph [ref=e113]: Corofin GAA Sports Hall
              - paragraph [ref=e114]: Wednesday · 11:30–13:30
              - paragraph [ref=e115]: Club Session · €5.00 · cash
      - generic [ref=e116]:
        - strong [ref=e120]: No payment is taken with this request.
        - text: If approved, Clare Pickleball will send you a private link to complete the guest booking and payment.
      - button "Send guest request" [disabled]
```

# Test source

```ts
  7   | 
  8   | const guestSessions = [
  9   |   { id:'db-mon-social', venueName:'Doora Barefield', day:'Monday', start:'19:00', end:'20:30', level:'Social & Recreational', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:false, experiencedEligible:true },
  10  |   { id:'ennistymon-1', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'19:00', end:'20:00', level:'Club Session', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:true, experiencedEligible:true },
  11  |   { id:'ennistymon-2', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'20:00', end:'21:00', level:'Club Session', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:true, experiencedEligible:true },
  12  |   { id:'corofin-wed', venueName:'Corofin GAA Sports Hall', day:'Wednesday', start:'11:30', end:'13:30', level:'Club Session', price:5, paymentMethod:'Cash', beginnerEligible:true, experiencedEligible:true },
  13  | ];
  14  | 
  15  | const memberSessions = [
  16  |   { id:'spond:1:2026-09-30T19:00:00Z', title:'1900 Wed Social', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'19:00', end:'20:00', nextDate:'2026-09-30', price:5.5, paymentMethod:'sumup', responseStatus:'unanswered' },
  17  |   { id:'spond:2:2026-09-30T20:00:00Z', title:'2000 Wed Club Session', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'20:00', end:'21:00', nextDate:'2026-09-30', price:5.5, paymentMethod:'sumup', responseStatus:'accepted' },
  18  | ];
  19  | 
  20  | function json(route, body, status=200) {
  21  |   return route.fulfill({ status, contentType:'application/json', body:JSON.stringify(body) });
  22  | }
  23  | 
  24  | async function mockPublicApi(page, { memberLookup='success', memberSubmit='payment' } = {}) {
  25  |   const calls=[];
  26  |   await page.route('**/api/apps/**/functions/guestAccessJourney', async route => {
  27  |     let body={}; try { body=route.request().postDataJSON() || {}; } catch {}
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
  97  |   test('beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken', async ({ page }) => {
  98  |     const calls=await mockPublicApi(page);
  99  |     await page.goto('/guest/clare-pickleball');
  100 |     await page.getByRole('button',{name:/I’m a guest/}).click();
  101 |     await page.getByRole('button',{name:/Beginner/}).click();
  102 |     await expect(page.getByText(/Beginner guest places are currently available only at Ennistymon and Corofin/)).toBeVisible();
  103 |     await expect(page.getByText('Doora Barefield')).toHaveCount(0);
  104 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  105 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  106 |     await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toBeVisible();
> 107 |     await page.getByLabel('Tennis').check();
      |                                     ^ Error: locator.check: Error: strict mode violation: getByLabel('Tennis') resolved to 2 elements:
  108 |     await page.getByLabel('Badminton').check();
  109 |     await page.getByLabel(/Any other sporting history/).fill('Played volleyball socially for several years.');
  110 |     await expect(page.getByLabel('Tennis')).toBeChecked();
  111 |     await expect(page.getByLabel('Badminton')).toBeChecked();
  112 |     await page.getByLabel('Yes',{exact:true}).check();
  113 |     await page.getByLabel('Please give brief details').fill('Previous knee surgery, fully recovered.');
  114 |     await page.getByLabel('Full name').fill('Guest Tester');
  115 |     await page.getByLabel('Email').fill('guest@example.test');
  116 |     await page.getByLabel('Mobile').fill('0871234567');
  117 |     await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
  118 |     await page.getByText('Ennistymon Community Centre').first().click();
  119 |     await expect(page.getByText(/No payment is taken with this request/)).toBeVisible();
  120 |     await page.getByRole('button',{name:'Send guest request'}).click();
  121 |     await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
  122 |     const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
  123 |     expect(submit.body.previousSports).toEqual(['Tennis','Badminton']);
  124 |     expect(submit.body.sportingBackgroundNote).toContain('volleyball');
  125 |     expect(submit.body.healthDeclarationApplies).toBe(true);
  126 |     expect(submit.body.medicalNote).toContain('knee surgery');
  127 |   });
  128 | });
  129 | 
```