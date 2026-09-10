import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function createModel({commitThenFailScore=false,commitThenFailPrepare=false,failPrepareBeforeCommit=false,stressProfile=null}={}) {
  const players = Array.from({ length: 18 }, (_, index) => ({
    id: `player-${String(index + 1).padStart(2, '0')}`,
    full_name: `Player ${String(index + 1).padStart(2, '0')}`,
  }));
  const participantByPlayer = new Map(players.map((player, index) => [player.id, {
    id: `participant-${String(index + 1).padStart(2, '0')}`,
    player_id: player.id,
    display_name: player.full_name,
    status: 'present',
    rounds_played: 0,
    fairness_benches: 0,
    consecutive_rounds_played: 0,
    consecutive_court1_rounds: 0,
    court1_rounds: 0,
  }]));

  const model = {
    players,
    session: null,
    participants: [],
    rounds: [],
    slots: [],
    matches: [],
    fixedPairs: [],
    timer: null,
    calls: [],
    commitThenFailScore,
    commitThenFailPrepare,
    failPrepareBeforeCommit,
    scoreFailureInjected:false,
    prepareFailureInjected:false,
    stressProfile,
    delayCounts:{},
  };

  const delayFor=async(name,base)=>{
    const profile=model.stressProfile;
    if(!profile)return sleep(base);
    const seq=profile[name]||[base];
    const index=model.delayCounts[name]||0;model.delayCounts[name]=index+1;
    const value=Number(seq[index%seq.length]??base);
    await sleep(value);
  };

  const currentRound = () => model.rounds.find(r => r.id === model.session?.current_round_id) || null;
  const currentSlots = () => model.slots.filter(s => s.round_id === model.session?.current_round_id);
  const currentMatches = () => model.matches.filter(m => m.round_id === model.session?.current_round_id);

  function arrangeActive(ids) {
    const active = [...ids];
    const lock = model.fixedPairs.find(pair => pair.status === 'active');
    if (lock && active.includes(lock.participant1_id) && active.includes(lock.participant2_id)) {
      const rest = active.filter(id => id !== lock.participant1_id && id !== lock.participant2_id);
      return [lock.participant1_id, lock.participant2_id, ...rest];
    }
    return active;
  }

  function makeRound(roundNumber, preferredBench = []) {
    const eligible = model.participants.filter(p => {
      if (['injured', 'left', 'no_show', 'withdrawn', 'replaced'].includes(p.status)) return false;
      if (p.status === 'voluntary_rest') return Number(p.available_again_from_round || 999) <= roundNumber;
      if (p.status === 'temporarily_unavailable') return p.available_again_from_round && Number(p.available_again_from_round) <= roundNumber;
      return ['registered', 'confirmed', 'present', 'leaving_early'].includes(p.status);
    });
    for (const p of model.participants) {
      if (['voluntary_rest', 'temporarily_unavailable'].includes(p.status) && Number(p.available_again_from_round || 999) <= roundNumber) {
        p.status = 'present';
        p.available_again_from_round = null;
        p.availability_effective_from_round = null;
      }
    }
    const refreshedEligible = model.participants.filter(p => ['registered', 'confirmed', 'present', 'leaving_early'].includes(p.status));
    const courtCount = Math.min(4, Math.floor(refreshedEligible.length / 4));
    const benchCount = refreshedEligible.length - courtCount * 4;
    const eligibleIds = refreshedEligible.map(p => p.id);
    const priorBench = preferredBench.filter(id => eligibleIds.includes(id));
    const benchIds = [];
    for (const id of priorBench) if (benchIds.length < benchCount && !benchIds.includes(id)) benchIds.push(id);
    for (const id of eligibleIds.slice().reverse()) if (benchIds.length < benchCount && !benchIds.includes(id)) benchIds.push(id);
    let activeIds = arrangeActive(eligibleIds.filter(id => !benchIds.includes(id))).slice(0, courtCount * 4);
    const roundId = `round-${roundNumber}`;
    const round = { id: roundId, session_id: model.session.id, round_number: roundNumber, status: 'proposed', proposal_revision: 1, active_court_count: courtCount, bench_count: benchCount };
    model.rounds.push(round);
    for (let court = 1; court <= courtCount; court++) {
      const four = activeIds.slice((court - 1) * 4, court * 4);
      const courtSlots = [
        { side: 'A', slot: 1, participant: four[0] },
        { side: 'A', slot: 2, participant: four[1] },
        { side: 'B', slot: 1, participant: four[2] },
        { side: 'B', slot: 2, participant: four[3] },
      ];
      for (const item of courtSlots) model.slots.push({
        id: `r${roundNumber}-c${court}-${item.side}-${item.slot}`,
        session_id: model.session.id,
        round_id: roundId,
        round_number: roundNumber,
        ladder_court_rank: court,
        team_side: item.side,
        slot_number: item.slot,
        participant_id: item.participant,
        assignment_type: 'sporting_movement',
        assignment_revision: 1,
      });
      model.matches.push({
        id: `match-r${roundNumber}-c${court}`,
        session_id: model.session.id,
        round_id: roundId,
        round_number: roundNumber,
        ladder_court_rank: court,
        team_a_participant_ids: four.slice(0, 2),
        team_b_participant_ids: four.slice(2, 4),
        status: 'scheduled',
        revision: 0,
        correction_count: 0,
      });
    }
    model.session.current_round_number = roundNumber;
    model.session.current_round_id = roundId;
    return round;
  }

  function syncMatchesFromSlots(roundId) {
    const slots = model.slots.filter(s => s.round_id === roundId);
    for (const match of model.matches.filter(m => m.round_id === roundId)) {
      const court = slots.filter(s => Number(s.ladder_court_rank) === Number(match.ladder_court_rank));
      match.team_a_participant_ids = court.filter(s => s.team_side === 'A').sort((a, b) => a.slot_number - b.slot_number).map(s => s.participant_id);
      match.team_b_participant_ids = court.filter(s => s.team_side === 'B').sort((a, b) => a.slot_number - b.slot_number).map(s => s.participant_id);
    }
  }

  model.handleFunction = async (name, body) => {
    model.calls.push({ name, body, at: Date.now() });
    if (name === 'getKotcV2State') {
      await delayFor('getKotcV2State',40);
      return {
        session: model.session,
        participants: model.participants,
        rounds: model.rounds,
        slots: model.slots,
        matches: model.matches,
        fixedPairs: model.fixedPairs,
        contactDirectory: {},
        currentAccessRole: 'admin',
        isAdmin: true,
      };
    }

    if (name === 'createKotcV2Session') {
      await delayFor('createKotcV2Session',450);
      model.participants = players.map(player => ({ ...participantByPlayer.get(player.id) }));
      model.session = {
        id: 'e2e-session', tournament_id: 'e2e-kotc-tournament', name: 'E2E 18 Player KOTC', status: 'ready',
        current_round_number: 1, current_round_id: null, revision: 0, play_minutes: Number(body.playMinutes || 8),
        scoring_mode: body.scoringMode || 'timed', score_target: Number(body.scoreTarget || 11), win_by_two: !!body.winByTwo,
        venue_court_limit: Number(body.venueCourtLimit || 4), available_court_limit: Number(body.venueCourtLimit || 4),
        actual_first_round_start: null, finish_after_current_round: false,
      };
      const benchPlayerIds = new Set(body.round1BenchIds || []);
      const participantOrder = (body.playerOrder || players.map(p => p.id)).map(id => participantByPlayer.get(id)?.id).filter(Boolean);
      const benchParticipantIds = [...benchPlayerIds].map(id => participantByPlayer.get(id)?.id).filter(Boolean);
      const activeIds = participantOrder.filter(id => !benchParticipantIds.includes(id));
      const orderedParticipants = [...activeIds, ...benchParticipantIds].map(id => model.participants.find(p => p.id === id));
      model.participants = orderedParticipants;
      makeRound(1, benchParticipantIds);
      return { success: true, session: model.session };
    }

    if (name === 'kotcTimer') {
      await delayFor('kotcTimer',80);
      const duration = Number(model.session?.play_minutes || 8) * 60;
      if (!model.timer || model.timer.roundId !== body.roundId) model.timer = { roundId: body.roundId, durationSeconds: duration, remainingSeconds: duration, running: false, deadlineAt: null, lastAction: 'reset' };
      if (body.action === 'get') return { state: model.timer };
      if (body.action === 'start' || body.action === 'resume') {
        const remaining = Number(body.remainingSeconds || duration);
        model.timer = { ...model.timer, remainingSeconds: remaining, running: true, deadlineAt: new Date(Date.now() + remaining * 1000).toISOString(), lastAction: body.action };
      } else if (body.action === 'pause') {
        model.timer = { ...model.timer, remainingSeconds: Number(body.remainingSeconds || model.timer.remainingSeconds), running: false, deadlineAt: null, lastAction: 'pause' };
      } else if (body.action === 'reset') {
        model.timer = { ...model.timer, remainingSeconds: duration, running: false, deadlineAt: null, lastAction: 'reset' };
      }
      return { success: true, state: model.timer };
    }

    if (name === 'setKotcPairLock') {
      await sleep(260);
      model.fixedPairs = model.fixedPairs.filter(pair => pair.status !== 'active');
      if (body.locked !== false) model.fixedPairs.push({ id: 'pair-lock-1', session_id: model.session.id, participant1_id: body.participant1Id, participant2_id: body.participant2Id, pair_name: 'Locked Pair', pair_source: 'host_selected', status: 'active' });
      model.session.revision += 1;
      return { success: true, session: model.session, pair: model.fixedPairs[0] || null, locked: body.locked !== false, runtimeVersion:'kotc-2026-09-10-r5' };
    }

    if (name === 'kotcCommand' || name === 'startKotcRound' || name === 'saveKotcScore' || name === 'prepareKotcNextRound') {
      if (body.commandType === 'host_claim_score') {
        const match = model.matches.find(m => m.id === body.matchId);
        if (!match) return { success: false, error: 'Match not found' };
        const displaced = !!match.scoring_lock_owner && match.scoring_lock_owner !== 'host:e2e';
        match.scoring_lock_owner = 'host:e2e';
        match.scoring_lock_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        return { success: true, hostAuthority: true, displacedScorer: displaced };
      }

      if (body.commandType === 'set_pair_lock') {
        await sleep(260);
        model.fixedPairs = model.fixedPairs.filter(pair => pair.status !== 'active');
        if (body.locked !== false) model.fixedPairs.push({ id: 'pair-lock-1', session_id: model.session.id, participant1_id: body.participant1Id, participant2_id: body.participant2Id, pair_name: 'Locked Pair', pair_source: 'host_selected', status: 'active' });
        model.session.revision += 1;
        return { success: true, session: model.session, pair: model.fixedPairs[0], locked: body.locked !== false };
      }

      if (body.commandType === 'start_proposed_round' || name === 'startKotcRound') {
        await delayFor(name==='startKotcRound'?'startKotcRound':'kotcCommand',600);
        const round = currentRound();
        for (const slot of currentSlots()) if (body.slotParticipantIds?.[slot.id]) slot.participant_id = body.slotParticipantIds[slot.id];
        syncMatchesFromSlots(round.id);
        round.status = 'started';
        round.started_at = new Date().toISOString();
        round.confirmed_at = round.started_at;
        model.session.status = 'in_progress';
        model.session.revision += 1;
        if (!model.session.actual_first_round_start) model.session.actual_first_round_start = round.started_at;
        return { success: true, session: model.session, round };
      }

      if (body.commandType === 'undo_start_round') {
        await sleep(800);
        const round = currentRound();
        round.status = 'proposed';
        round.started_at = null;
        round.confirmed_at = null;
        model.session.status = Number(round.round_number) === 1 ? 'ready' : 'in_progress';
        model.session.revision += 1;
        if (Number(round.round_number) === 1) model.session.actual_first_round_start = null;
        const duration = Number(model.session.play_minutes || 8) * 60;
        model.timer = { roundId: round.id, durationSeconds: duration, remainingSeconds: duration, running: false, deadlineAt: null, lastAction: 'reset' };
        return { success: true, session: model.session, round };
      }

      if (name === 'saveKotcScore' || body.commandType === 'complete_match' || body.commandType === 'correct_match') {
        await delayFor(name==='saveKotcScore'?'saveKotcScore':'kotcCommand',320);
        const match = model.matches.find(m => m.id === body.matchId);
        const correction = body.commandType === 'correct_match';
        match.team_a_score = Number(body.teamAScore);
        match.team_b_score = Number(body.teamBScore);
        match.winner_side = match.team_a_score >= match.team_b_score ? 'A' : 'B';
        match.status = 'completed';
        match.completed_at = match.completed_at || new Date().toISOString();
        match.scoring_lock_owner = null;
        match.scoring_lock_expires_at = null;
        if (correction) match.correction_count = Number(match.correction_count || 0) + 1;
        match.revision += 1;
        if(name==='saveKotcScore'&&model.commitThenFailScore&&!model.scoreFailureInjected){model.scoreFailureInjected=true;return {__status:503,error:'Base44 response lost after commit'};}
        return { success: true, match, correction };
      }

      if (name === 'prepareKotcNextRound' || body.commandType === 'generate_next_round') {
        await delayFor(name==='prepareKotcNextRound'?'prepareKotcNextRound':'kotcCommand',500);
        if(model.failPrepareBeforeCommit&&!model.prepareFailureInjected){model.prepareFailureInjected=true;return {__status:429,error:'Rate limit exceeded before sporting write'};}
        const prior = currentRound();
        prior.status = 'completed';
        prior.completed_at = new Date().toISOString();
        const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
        const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
        const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
        model.session.revision += 1;
        if(model.commitThenFailPrepare&&!model.prepareFailureInjected){model.prepareFailureInjected=true;return {__status:503,error:'Base44 response lost after Round 2 commit'};}
        return { success: true, session: model.session, round: next, slots:model.slots.filter(s=>s.round_id===next.id), matches:model.matches.filter(m=>m.round_id===next.id), participants:model.participants, runtimeVersion:'kotc-2026-09-10-r6' };
      }

      if (body.commandType === 'set_participant_status') {
        await sleep(300);
        const participant = model.participants.find(p => p.id === body.participantId);
        if (body.statusAction === 'voluntary_rest') {
          participant.status = 'voluntary_rest';
          participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
          participant.available_again_from_round = Number(model.session.current_round_number) + 2;
        } else if (body.statusAction === 'back_available') {
          participant.status = 'present';
          participant.availability_effective_from_round = null;
          participant.available_again_from_round = null;
        }
        model.session.revision += 1;
        return { success: true, session: model.session, participant };
      }

      if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
        await sleep(200);
        model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
        model.session.revision += 1;
        return { success: true, session: model.session };
      }
      return { success: true, session: model.session };
    }

    if (name === 'endKotcSession') {
      await delayFor('endKotcSession',450);
      if (body.action === 'finish') model.session.status = 'completed';
      if (body.action === 'abandon') model.session.status = 'abandoned';
      model.session.actual_session_end = new Date().toISOString();
      return { success: true, session: model.session };
    }

    if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
    return { success: true };
  };

  return model;
}

async function installMockBackend(page, model) {
  await page.route('**/api/apps/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
    const marker = `/api/apps/${APP_ID}/functions/`;
    const index = path.indexOf(marker);
    if (index >= 0) {
      const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
      let body = {};
      try { body = request.postDataJSON() || {}; } catch { body = {}; }
      const payload = await model.handleFunction(name, body);
      if(payload?.__status)return json(route,{error:payload.error},payload.__status);
      return json(route, payload);
    }
    return json(route, []);
  });
}

async function dismissTimerFullscreen(page) {
  const exit = page.getByTitle('Exit full screen timer');
  if (await exit.count()) await exit.first().click();
  const dock = page.getByTitle('Dock timer back in page');
  if (await dock.count()) await dock.first().click();
}

async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  const timings = [];
  for (let court = 1; court <= courtCount; court++) {
    await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
    await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
    const button = page.getByTestId(`kotc-complete-${court}`);
    const started = Date.now();
    await button.click();
    await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
    timings.push(Date.now() - started);
  }
  return timings;
}

function metric(report, name, value, max) {
  report[name] = value;
  expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
}

async function createAndStartRoundOne(page){
  await page.goto('/e2e/kotcHarness.html');
  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:2000});
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByText('Round 1 — LIVE')).toBeVisible({timeout:2000});
}

test.use({ viewport: { width: 1440, height: 900 } });

test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  const model = createModel();
  const report = {};
  await installMockBackend(page, model);
  page.on('dialog', dialog => dialog.accept());

  await page.goto('/e2e/kotcHarness.html');
  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  await expect(page.getByTestId('kotc-setup-summary')).toContainText('Create Round 1');

  await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  const create = page.getByTestId('kotc-create-session');
  const createAt = Date.now();
  await create.click();
  await expect(create).toContainText('Creating Round 1…');
  metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');

  // Real host adjustment: swap a court player with a bench player before Round 1.
  const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  const outgoingPlayer = (await firstSlot.innerText()).trim();
  await firstSlot.click();
  await page.getByTestId('kotc-bench-player-participant-17').click();
  await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);

  // Lock one pair. The host must get immediate acknowledgement, then a persistent locked state.
  const lockButton=page.getByRole('button', { name: 'Lock pair' }).first();
  await lockButton.click();
  await expect(page.getByRole('button', { name: 'Saving…' }).first()).toBeVisible({ timeout: 250 });
  await expect(page.getByRole('button', { name: /Locked ✓ · Unlock/ }).first()).toBeVisible({ timeout: 1500 });

  // START ROUND must acknowledge instantly and transition to LIVE promptly.
  let started = Date.now();
  const startRound = page.getByTestId('kotc-start-round');
  await startRound.click();
  await expect(startRound).toContainText('Starting…');
  metric(report, 'start_ack_ms', Date.now() - started, 250);
  await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);

  // Timer controls: pause → reset → explicit Start Timer.
  await page.getByTestId('kotc-timer-pause').click();
  await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  await page.getByTestId('kotc-timer-reset').click();
  await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  await page.getByTestId('kotc-timer-start').click();
  await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  await dismissTimerFullscreen(page);

  // Undo must keep accepted feedback visible for the entire backend delay.
  const undo = page.getByTestId('kotc-undo-start');
  await undo.scrollIntoViewIfNeeded();
  started = Date.now();
  await undo.evaluate(element => element.click());
  await expect(undo).toContainText('Returning to Round Setup…');
  await expect(undo).toHaveAttribute('aria-busy', 'true');
  metric(report, 'undo_ack_ms', Date.now() - started, 250);
  await sleep(350);
  await expect(undo).toContainText('Returning to Round Setup…');
  await expect(undo).toBeDisabled();
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  expect(model.timer?.running).toBe(false);
  expect(model.timer?.remainingSeconds).toBe(480);

  // Start again and complete Round 1.
  started = Date.now();
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  await dismissTimerFullscreen(page);
  // A player/scorer device has Court 1 locked. The host touching the score box must
  // take authority immediately without changing the match revision.
  const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  round1Court1.scoring_lock_owner='player-device-1';
  round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  await page.getByTestId('kotc-score-1-a').focus();
  await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
  report.host_displaced_player_scorer=true;
  report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);

  await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  started = Date.now();
  await page.getByTestId('kotc-prepare-next-round').click();
  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');

  // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  await dismissTimerFullscreen(page);
  await page.getByTestId('kotc-session-menu').click();
  await page.getByTestId('kotc-players-menu').click();
  await page.getByTestId('kotc-player-participant-03').click();
  await page.getByTestId('kotc-player-sit-out').click();
  await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');

  report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  await page.getByTestId('kotc-prepare-next-round').click();
  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);

  // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  await page.getByTestId('kotc-start-round').click();
  await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  await dismissTimerFullscreen(page);
  const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });

  const finishButton = page.getByTestId('kotc-finish-session');
  if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  await expect(finishButton).toBeVisible();
  started = Date.now();
  await finishButton.click();
  await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  await expect(page.getByText('Session complete')).toBeVisible();
  await expect(page.getByText('Gold')).toBeVisible();
  await expect(page.getByText('Silver')).toBeVisible();
  await expect(page.getByText('Bronze')).toBeVisible();

  // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  // confirm RallyHub stores it as a correction without rewriting later court assignments.
  await expect(page.getByText('Review & Correct Results')).toBeVisible();
  await page.getByRole('button',{name:'Round 1',exact:true}).click();
  const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  const reviewCard=page.getByTestId('kotc-score-card-1').first();
  await reviewCard.getByRole('button',{name:'Edit result'}).click();
  await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  expect(corrected.correction_count).toBe(1);
  expect(corrected.winner_side).toBe('B');
  expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  report.post_event_score_correction=true;

  report.rounds_created = model.rounds.length;
  report.function_calls = model.calls.length;
  console.log(`KOTC DESKTOP HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  await testInfo.attach('kotc-host-desktop-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
});

test('Base44 resilience: score committed but response fails is reconciled as Saved',async({page})=>{
  const model=createModel({commitThenFailScore:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  await createAndStartRoundOne(page);
  await page.getByTestId('kotc-score-1-a').fill('11');await page.getByTestId('kotc-score-1-b').fill('7');
  await page.getByTestId('kotc-complete-1').click();
  await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:2200});
  await expect(page.getByTestId('kotc-score-card-1')).not.toContainText('Retry Save');
  expect(model.scoreFailureInjected).toBe(true);expect(model.matches.find(m=>m.id==='match-r1-c1').revision).toBe(1);
});

test('Base44 resilience: next round committed but response fails is reconciled without duplicate generation',async({page})=>{
  const model=createModel({commitThenFailPrepare:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  await page.getByTestId('kotc-prepare-next-round').click();
  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:2500});
  expect(model.prepareFailureInjected).toBe(true);expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(1);
});

test('Base44 resilience: genuine prepare failure stays explicit and safely retryable',async({page})=>{
  const model=createModel({failPrepareBeforeCommit:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  await page.getByTestId('kotc-prepare-next-round').click();
  await expect(page.getByTestId('kotc-prepare-status')).toContainText('Could not prepare the next round',{timeout:2200});
  expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(0);
  await expect(page.getByTestId('kotc-prepare-next-round')).toBeEnabled();
});

test('desktop usability: long host screens expose mouse-click up/down navigation',async({page})=>{
  const model=createModel();await installMockBackend(page,model);
  await page.goto('/e2e/kotcHarness.html');
  await expect(page.getByTestId('kotc-scroll-controls')).toBeVisible({timeout:1800});
  const before=await page.evaluate(()=>window.scrollY);
  await page.getByRole('button',{name:'Scroll down'}).click();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(before+100);
  await expect(page.getByRole('button',{name:'Scroll up'})).toBeEnabled();
  await page.getByRole('button',{name:'Scroll up'}).click();
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(120);
});

test('desktop timer: full screen centres a dominant clock and exits back into the page',async({page})=>{
  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  await createAndStartRoundOne(page);
  await page.getByTitle('Full screen timer').click();
  await expect(page.getByTitle('Exit full screen timer')).toBeVisible({timeout:1500});
  const metrics=await page.evaluate(()=>{const timer=document.querySelector('[data-testid="kotc-timer"]')?.getBoundingClientRect();const value=document.querySelector('[data-testid="kotc-timer-value"]')?.getBoundingClientRect();const style=getComputedStyle(document.querySelector('[data-testid="kotc-timer-value"]'));return{timer,value,fontSize:parseFloat(style.fontSize),w:innerWidth,h:innerHeight};});
  expect(metrics.timer.width).toBeGreaterThan(metrics.w*0.9);expect(metrics.timer.height).toBeGreaterThan(metrics.h*0.9);expect(metrics.fontSize).toBeGreaterThan(140);
  const valueCenterY=metrics.value.y+metrics.value.height/2;expect(Math.abs(valueCenterY-metrics.h/2)).toBeLessThan(metrics.h*0.22);
  await page.getByTitle('Exit full screen timer').click();
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement===null),{timeout:2000}).toBe(true);
  await expect(page.getByTitle('Full screen timer')).toBeVisible({timeout:1500});
  await expect.poll(async()=>Math.round((await page.getByTestId('kotc-timer').boundingBox())?.height||9999),{timeout:2000}).toBeLessThan(520);
});

test('KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn',async({page},testInfo)=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:390,height:844});
  const stressProfile={
    getKotcV2State:[220,900,350],
    createKotcV2Session:[850],
    startKotcRound:[1250,420,1750,680,1100,510,1500,760],
    saveKotcScore:[900,1650,520,1250,700,1450,430,1050],
    prepareKotcNextRound:[1850,620,2250,880,1600,700],
    kotcTimer:[70,110,60],
    endKotcSession:[1450],
  };
  const model=createModel({stressProfile});
  const report={rounds:12,start_ack_ms:[],start_confirm_ms:[],score_ack_ms:[],score_burst_confirm_ms:[],prepare_ack_ms:[],prepare_confirm_ms:[]};
  await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  await page.goto('/e2e/kotcHarness.html');
  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  await page.getByTestId('kotc-create-session').click();
  await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:3000});

  for(let round=1;round<=12;round++){
    const start=page.getByTestId('kotc-start-round');
    await expect(start).toContainText(`START ROUND ${round}`);
    const startAt=Date.now();
    await start.click();
    await expect(start).toContainText('Starting…',{timeout:250});
    report.start_ack_ms.push(Date.now()-startAt);
    await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`,{timeout:300});
    await sleep(180);
    await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}));});
    await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`);
    await expect(start).toBeDisabled();
    await expect(page.getByText(`Round ${round} — LIVE`)).toBeVisible({timeout:3500});
    report.start_confirm_ms.push(Date.now()-startAt);

    const hostClaimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
    for(let court=1;court<=4;court++){
      await page.getByTestId(`kotc-score-${court}-a`).fill(String(8+((round+court)%6)));
      await page.getByTestId(`kotc-score-${court}-b`).fill(String(2+((round*2+court)%5)));
    }
    const burstAt=Date.now();
    for(let court=1;court<=4;court++){
      const button=page.getByTestId(`kotc-complete-${court}`);
      const ackAt=Date.now();
      await button.click();
      await expect(button).toContainText('Saving…',{timeout:250});
      report.score_ack_ms.push(Date.now()-ackAt);
    }
    await sleep(220);
    await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
    for(let court=1;court<=4;court++)await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved',{timeout:3000});
    report.score_burst_confirm_ms.push(Date.now()-burstAt);
    const hostClaimsAfter=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
    expect(hostClaimsAfter,`Round ${round} must not claim scorer leases when no player scorer owns a court`).toBe(hostClaimsBefore);
    await expect(page.getByText(`All scores saved for Round ${round}`)).toBeVisible();

    if(round<12){
      const prepare=page.getByTestId('kotc-prepare-next-round');
      const prepAt=Date.now();
      await prepare.click();
      await expect(prepare).toContainText('Preparing Round…',{timeout:250});
      report.prepare_ack_ms.push(Date.now()-prepAt);
      await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`,{timeout:300});
      await sleep(300);
      await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
      await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`);
      await expect(prepare).toBeDisabled();
      await expect(page.getByTestId('kotc-start-round')).toContainText(`START ROUND ${round+1}`,{timeout:4000});
      report.prepare_confirm_ms.push(Date.now()-prepAt);
    }
  }

  const roundsBeforeFinish=model.rounds.length;
  const finish=page.getByTestId('kotc-finish-after-scores');
  await expect(finish).toBeVisible();
  const finishAt=Date.now();
  await finish.click();
  await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session',{timeout:300});
  await sleep(250);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session');
  await expect(page.getByTestId('kotc-podium')).toBeVisible({timeout:3500});
  report.finish_to_podium_ms=Date.now()-finishAt;
  expect(model.rounds.length,'Finish after scores must not manufacture an unused next round').toBe(roundsBeforeFinish);
  expect(model.rounds.length).toBe(12);

  const callsByName=Object.fromEntries([...new Set(model.calls.map(c=>c.name))].map(name=>[name,model.calls.filter(c=>c.name===name).length]));
  report.calls_by_name=callsByName;
  report.total_function_calls=model.calls.length;
  report.full_state_reads=callsByName.getKotcV2State||0;
  report.host_claim_score_calls=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  report.max_start_ack_ms=Math.max(...report.start_ack_ms);
  report.max_start_confirm_ms=Math.max(...report.start_confirm_ms);
  report.max_score_ack_ms=Math.max(...report.score_ack_ms);
  report.max_score_burst_confirm_ms=Math.max(...report.score_burst_confirm_ms);
  report.max_prepare_ack_ms=Math.max(...report.prepare_ack_ms);
  report.max_prepare_confirm_ms=Math.max(...report.prepare_confirm_ms);

  expect(report.max_start_ack_ms).toBeLessThanOrEqual(250);
  expect(report.max_score_ack_ms).toBeLessThanOrEqual(250);
  expect(report.max_prepare_ack_ms).toBeLessThanOrEqual(250);
  expect(report.max_start_confirm_ms).toBeLessThanOrEqual(2300);
  expect(report.max_score_burst_confirm_ms).toBeLessThanOrEqual(2300);
  expect(report.max_prepare_confirm_ms).toBeLessThanOrEqual(3200);
  expect(report.full_state_reads,'Normal live play must not poll/reload heavyweight state after successful actions').toBeLessThanOrEqual(3);
  expect(report.host_claim_score_calls,'Typing host scores must not create empty scorer-takeover traffic').toBe(0);
  expect(callsByName.startKotcRound).toBe(12);
  expect(callsByName.saveKotcScore).toBe(48);
  expect(callsByName.prepareKotcNextRound).toBe(11);
  expect(callsByName.endKotcSession).toBe(1);
  expect(report.total_function_calls,'12-round host journey should remain inside a compact API-call budget').toBeLessThanOrEqual(95);

  console.log(`KOTC HALL-PRESSURE SIMULATOR REPORT\n${JSON.stringify(report,null,2)}`);
  await testInfo.attach('kotc-hall-pressure-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});
