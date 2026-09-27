# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: member-guest-booking.spec.mjs >> member or guest session booking mobile flow >> member verifies, sees only personalised Spond sessions, note travels to checkout
- Location: e2e/member-guest-booking.spec.mjs:57:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.fill: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByLabel('Full name')

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
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - heading "Existing member" [level=2] [ref=e21]
          - paragraph [ref=e22]: Enter any one or more of the details held by the club. RallyHub checks name, email and mobile against the membership database.
        - button "Change" [ref=e23] [cursor=pointer]
      - generic [ref=e24]:
        - text: Full name
        - textbox [ref=e25]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - text: Email
          - textbox [ref=e28]
        - generic [ref=e29]:
          - text: Mobile
          - textbox [ref=e30]
      - button "Check my membership" [ref=e31] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const club = {
  4   |   id: 'club-clare', name: 'Clare Pickleball', slug: 'clare-pickleball',
  5   |   logo_url: '', primary_colour: '#2667f2', secondary_colour: '#facc15'
  6   | };
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
> 65  |     await page.getByLabel('Full name').fill('Brian Moore');
      |                                        ^ Error: locator.fill: Test timeout of 45000ms exceeded.
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
  97  |   test('beginner guest sees only beginner-eligible sessions and no payment is taken', async ({ page }) => {
  98  |     await mockPublicApi(page);
  99  |     await page.goto('/guest/clare-pickleball');
  100 |     await page.getByRole('button',{name:/I’m a guest/}).click();
  101 |     await page.getByRole('button',{name:/Beginner/}).click();
  102 |     await expect(page.getByText(/Beginner guest places are currently available only at Ennistymon and Corofin/)).toBeVisible();
  103 |     await expect(page.getByText('Doora Barefield')).toHaveCount(0);
  104 |     await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
  105 |     await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
  106 |     await expect(page.getByText(/No payment is taken with this request/)).toBeVisible();
  107 |   });
  108 | });
  109 | 
```