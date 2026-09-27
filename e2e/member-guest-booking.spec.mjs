import { test, expect } from '@playwright/test';

const club = {
  id: 'club-clare', name: 'Clare Pickleball', slug: 'clare-pickleball',
  logo_url: '', primary_colour: '#2667f2', secondary_colour: '#facc15'
};

const guestSessions = [
  { id:'db-mon-social', venueName:'Doora Barefield', day:'Monday', start:'19:00', end:'20:30', level:'Social & Recreational', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:false, experiencedEligible:true },
  { id:'ennistymon-1', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'19:00', end:'20:00', level:'Club Session', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:true, experiencedEligible:true },
  { id:'ennistymon-2', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'20:00', end:'21:00', level:'Club Session', price:5.5, paymentMethod:'Online guest booking', beginnerEligible:true, experiencedEligible:true },
  { id:'corofin-wed', venueName:'Corofin GAA Sports Hall', day:'Wednesday', start:'11:30', end:'13:30', level:'Club Session', price:5, paymentMethod:'Cash', beginnerEligible:true, experiencedEligible:true },
];

const memberSessions = [
  { id:'spond:1:2026-09-30T19:00:00Z', title:'1900 Wed Social', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'19:00', end:'20:00', nextDate:'2026-09-30', price:5.5, paymentMethod:'sumup', responseStatus:'unanswered' },
  { id:'spond:2:2026-09-30T20:00:00Z', title:'2000 Wed Club Session', venueName:'Ennistymon Community Centre', day:'Wednesday', start:'20:00', end:'21:00', nextDate:'2026-09-30', price:5.5, paymentMethod:'sumup', responseStatus:'accepted' },
];

function json(route, body, status=200) {
  return route.fulfill({ status, contentType:'application/json', body:JSON.stringify(body) });
}

async function mockPublicApi(page, { memberLookup='success', memberSubmit='payment' } = {}) {
  const calls=[];
  await page.route('**/api/apps/**/functions/guestAccessJourney', async route => {
    let body={}; try { body=route.request().postDataJSON() || {}; } catch {}
    calls.push({ name:'guestAccessJourney', body });
    if (body.action === 'public_get') return json(route, {
      success:true, club, minimumAge:18, adultsOnly:true,
      requireDuprForExperienced:true, requireHomeClubForExperienced:true,
      sessions:guestSessions,
    });
    if (body.action === 'public_submit') return json(route, { success:true, pending:true, message:'Thanks. Your guest request has been sent to Clare Pickleball for approval.' });
    return json(route, { error:'Unexpected guest action' }, 400);
  });
  await page.route('**/api/apps/**/functions/guestSessionBooking', async route => {
    let body={}; try { body=route.request().postDataJSON() || {}; } catch {}
    calls.push({ name:'guestSessionBooking', body });
    if (body.action === 'public_member_lookup') {
      if (memberLookup === 'not-found') return json(route, { error:'No membership record found. Please follow the guest booking process.', code:'MEMBERSHIP_NOT_FOUND', memberFound:false }, 404);
      return json(route, { success:true, memberFound:true, firstName:'Brian', verificationMethod:'name', message:'Membership found. Hi Brian, choose one of the Spond sessions you are invited to and go straight to payment.', sessions:memberSessions });
    }
    if (body.action === 'public_member_submit') {
      if (memberSubmit === 'payment') return json(route, { success:true, participantType:'member', bookingId:'booking-1', bookingStatus:'pending_payment', paymentStatus:'pending', paymentUrl:'http://127.0.0.1:5173/__test_payment' });
      return json(route, { success:true, participantType:'member', bookingId:'booking-1', bookingStatus:'confirmed', paymentStatus:'paid', paymentUrl:'', message:'Your booking is confirmed.', session:{ sessionDate:'2026-09-30', startTime:'20:00', endTime:'21:00', venueName:'Ennistymon Community Centre', venueAddress:'Parliament Street' } });
    }
    return json(route, { error:'Unexpected booking action' }, 400);
  });
  await page.route('**/__test_payment', route => route.fulfill({status:200, contentType:'text/html', body:'<title>Payment Test</title><h1>Payment handoff reached</h1>'}));
  return calls;
}

test.describe('member or guest session booking mobile flow', () => {
  test.use({ viewport:{width:390,height:844} });

  test('member verifies, sees only personalised Spond sessions, note travels to checkout', async ({ page }) => {
    const calls=await mockPublicApi(page);
    await page.goto('/guest/clare-pickleball');
    await expect(page.getByRole('heading',{name:'Book or request a session'})).toBeVisible();
    await expect(page.getByRole('button',{name:/I’m an existing member/})).toBeVisible();
    await expect(page.getByRole('button',{name:/I’m a guest/})).toBeVisible();

    await page.getByRole('button',{name:/I’m an existing member/}).click();
    await page.getByLabel('Full name').fill('Brian Moore');
    await page.getByRole('button',{name:'Check my membership'}).click();

    await expect(page.getByText(/Membership found\. Hi Brian/)).toBeVisible();
    await expect(page.getByText('1900 Wed Social')).toBeVisible();
    await expect(page.getByText('2000 Wed Club Session')).toBeVisible();
    await expect(page.getByText(/Only upcoming Spond sessions you are invited to are shown/)).toBeVisible();

    await page.getByText('2000 Wed Club Session').click();
    await page.getByLabel(/Anything you want the session host to know/).fill("My phone was stolen so I couldn't book through Spond.");
    await expect(page.getByRole('button',{name:'Continue to payment · €5.50'})).toBeEnabled();
    await page.getByRole('button',{name:'Continue to payment · €5.50'}).click();
    await expect(page.getByRole('heading',{name:'Payment handoff reached'})).toBeVisible();

    const lookup=calls.find(x=>x.name==='guestSessionBooking'&&x.body.action==='public_member_lookup');
    const submit=calls.find(x=>x.name==='guestSessionBooking'&&x.body.action==='public_member_submit');
    expect(lookup.body.fullName).toBe('Brian Moore');
    expect(submit.body.sessionId).toContain('spond:2:');
    expect(submit.body.bookingNote).toContain('phone was stolen');
  });

  test('unknown member fails closed and can switch into guest journey', async ({ page }) => {
    await mockPublicApi(page,{memberLookup:'not-found'});
    await page.goto('/guest/clare-pickleball');
    await page.getByRole('button',{name:/I’m an existing member/}).click();
    await page.getByLabel('Full name').fill('Definitely Not A Member');
    await page.getByRole('button',{name:'Check my membership'}).click();
    await expect(page.getByText('No membership record found. Please follow the guest booking process.')).toBeVisible();
    await page.getByRole('button',{name:'Continue as a guest'}).click();
    await expect(page.getByRole('heading',{name:'1. About you'})).toBeVisible();
  });

  test('beginner guest sees only eligible sessions, records multi-sport and health intake, and no payment is taken', async ({ page }) => {
    const calls=await mockPublicApi(page);
    await page.goto('/guest/clare-pickleball');
    await page.getByRole('button',{name:/I’m a guest/}).click();
    await page.getByRole('button',{name:/Beginner/}).click();
    await expect(page.getByText(/Beginner guest places are currently available only at Ennistymon and Corofin/)).toBeVisible();
    await expect(page.getByText('Doora Barefield')).toHaveCount(0);
    await expect(page.getByText('Ennistymon Community Centre')).toHaveCount(2);
    await expect(page.getByText('Corofin GAA Sports Hall')).toBeVisible();
    await expect(page.getByRole('heading',{name:'3. Previous sporting experience'})).toBeVisible();
    await page.getByRole('checkbox',{name:'Tennis',exact:true}).check();
    await page.getByRole('checkbox',{name:'Badminton',exact:true}).check();
    await page.getByLabel(/Any other sporting history/).fill('Played volleyball socially for several years.');
    await expect(page.getByRole('checkbox',{name:'Tennis',exact:true})).toBeChecked();
    await expect(page.getByRole('checkbox',{name:'Badminton',exact:true})).toBeChecked();
    await page.getByLabel('Yes',{exact:true}).check();
    await page.getByLabel('Please give brief details').fill('Previous knee surgery, fully recovered.');
    await page.getByLabel('Full name').fill('Guest Tester');
    await page.getByLabel('Email').fill('guest@example.test');
    await page.getByLabel('Mobile').fill('0871234567');
    await page.getByLabel(/I confirm that I am 18 years of age or over/).check();
    await page.getByText('Ennistymon Community Centre').first().click();
    await expect(page.getByText(/No payment is taken with this request/)).toBeVisible();
    await page.getByRole('button',{name:'Send guest request'}).click();
    await expect(page.getByRole('heading',{name:'Request sent'})).toBeVisible();
    const submit=calls.find(x=>x.name==='guestAccessJourney'&&x.body.action==='public_submit');
    expect(submit.body.previousSports).toEqual(['Tennis','Badminton']);
    expect(submit.body.sportingBackgroundNote).toContain('volleyball');
    expect(submit.body.healthDeclarationApplies).toBe(true);
    expect(submit.body.medicalNote).toContain('knee surgery');
  });
});
