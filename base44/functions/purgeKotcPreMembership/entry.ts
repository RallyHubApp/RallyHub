import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const CONFIRM = 'PURGE_KOTC_PRE_MEMBERSHIP_2026_09_09';
const DEMO_TOURNAMENT_ID = '6aa12cca606d16d7c30ed875';
const DEMO_SESSION_ID = '6aa12cd55ae3f45d235c19f2';
const CLARE_TENANT_ID = '6a9b7790bc4a8d299938bda9';
const CLARE_CLUB_ID = '6a9b779684daba85b3ffdeb5';
const TEST_TENANT_ID = '6a9bd98d3a71d8edbb25e28d';
const TEST_CLUB_ID = '6a9bd993c94bd0932833673d';
const PROTECTED_PLAYER_IDS = new Set([
  '6a04a79505e56587cfe9d6ca', // Brian Moore
  '6a01dda4702b7dd2a2978c80', // Conall Moore
  '6a0f274b20ce2992f5f000cd', // Marie Moore
]);

const KOTC_SESSION_CHILDREN = [
  'KotcSessionCourt',
  'KotcSessionAccess',
  'KotcHostLease',
  'KotcTimerState',
  'KotcSessionParticipant',
  'KotcCommandLog',
  'KotcMatch',
  'KotcRound',
  'KotcRoundSlot',
  'KotcFixedPair',
  'KotcParticipationEvent',
  'KotcPartnershipPhase',
  'KotcRecoveryCheckpoint',
  'KotcSessionShare',
  'KotcSessionShareRecipient',
  'KotcTimerCommand',
  'KotcPublicResultView',
];

function nowIso() { return new Date().toISOString(); }

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin execution required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== CONFIRM) {
      return Response.json({ error: 'Confirmation phrase mismatch' }, { status: 400 });
    }

    const E:any = base44.asServiceRole.entities;

    // Hard safety gates: refuse to purge unless the intended retained demo and linked identities exist.
    const [demoSessions, demoRounds, demoMatches, allPlayers, members, kotcSessions, kotcTournaments] = await Promise.all([
      E.KotcSession.filter({ id: DEMO_SESSION_ID }),
      E.KotcRound.filter({ session_id: DEMO_SESSION_ID, status: 'completed' }),
      E.KotcMatch.filter({ session_id: DEMO_SESSION_ID, status: 'completed' }),
      E.Player.list(),
      E.Member.list(),
      E.KotcSession.list(),
      E.Tournament.filter({ format: 'King of the Court' }),
    ]);

    const demo = demoSessions?.[0];
    if (!demo || demo.tournament_id !== DEMO_TOURNAMENT_ID || !['completed','finalised'].includes(demo.status)) {
      return Response.json({ error: 'Safety gate failed: retained demo session is not the expected completed session.' }, { status: 409 });
    }
    if ((demoRounds || []).length !== 3 || (demoMatches || []).length !== 12) {
      return Response.json({ error: 'Safety gate failed: retained demo must contain exactly 3 completed rounds and 12 completed matches.' }, { status: 409 });
    }

    const playerIds = new Set((allPlayers || []).map((p:any) => String(p.id)));
    for (const id of PROTECTED_PLAYER_IDS) {
      if (!playerIds.has(id)) return Response.json({ error: `Safety gate failed: protected linked player ${id} is missing.` }, { status: 409 });
    }

    const testPlayers = (allPlayers || []).filter((p:any) =>
      String(p.tenant_id || '') === TEST_TENANT_ID &&
      String(p.club_id || '') === TEST_CLUB_ID &&
      /^KOTC TEST \d{2}$/.test(String(p.full_name || '')) &&
      String(p.notes || '').includes('DO NOT IMPORT OR MERGE')
    );
    if (testPlayers.length !== 18) {
      return Response.json({ error: `Safety gate failed: expected 18 isolated fictitious test players, found ${testPlayers.length}.` }, { status: 409 });
    }

    const keepPlayerIds = new Set([...PROTECTED_PLAYER_IDS, ...testPlayers.map((p:any) => String(p.id))]);
    const deletePlayerIds = (allPlayers || []).map((p:any) => String(p.id)).filter((id:string) => !keepPlayerIds.has(id));
    const oldSessions = (kotcSessions || []).filter((s:any) => String(s.id) !== DEMO_SESSION_ID);
    const oldSessionIds = oldSessions.map((s:any) => String(s.id));
    const oldKotcTournaments = (kotcTournaments || []).filter((t:any) => String(t.id) !== DEMO_TOURNAMENT_ID);
    const oldTournamentIds = oldKotcTournaments.map((t:any) => String(t.id));

    const plan = {
      retained_demo: { tournament_id: DEMO_TOURNAMENT_ID, session_id: DEMO_SESSION_ID, rounds: 3, matches: 12 },
      protected_linked_players: [...PROTECTED_PLAYER_IDS],
      isolated_test_players: testPlayers.length,
      delete_kotc_sessions: oldSessionIds.length,
      delete_kotc_tournaments: oldTournamentIds.length,
      delete_players: deletePlayerIds.length,
      delete_partial_members: (members || []).length,
    };

    if (body.dryRun === true) return Response.json({ success: true, dryRun: true, plan });

    // Freeze and detach the retained demonstration snapshot from the live player/member roster.
    await Promise.all([
      E.KotcSession.update(DEMO_SESSION_ID, {
        name: 'KOTC Demo – 9 Sep 2026',
        demo_mode: true,
        exclude_from_aggregates: true,
        status: 'completed',
      }),
      E.Tournament.update(DEMO_TOURNAMENT_ID, {
        name: 'KOTC Demo – 9 Sep 2026',
        status: 'Completed',
        player_ids: [],
        description: 'Read-only RallyHub KOTC demonstration. Retained for player/organiser training; excluded from live statistics.',
      }),
    ]);
    const demoParticipants = await E.KotcSessionParticipant.filter({ session_id: DEMO_SESSION_ID });
    for (const p of demoParticipants || []) {
      await E.KotcSessionParticipant.update(p.id, { player_id: null, source_type: 'imported', notes: 'Read-only demo snapshot; detached from live membership roster.' });
    }

    const deleted:any = {};
    const errors:any[] = [];
    async function purge(entityName:string, query:any) {
      try {
        if (!query || (Array.isArray(query?.id?.$in) && query.id.$in.length === 0) || (Array.isArray(query?.session_id?.$in) && query.session_id.$in.length === 0) || (Array.isArray(query?.tournament_id?.$in) && query.tournament_id.$in.length === 0)) {
          deleted[entityName] = 0;
          return;
        }
        const before = query.session_id?.$in ? await E[entityName].list() : await E[entityName].list();
        const expected = (before || []).filter((r:any) => {
          if (query.id?.$in) return query.id.$in.includes(String(r.id));
          if (query.session_id?.$in) return query.session_id.$in.includes(String(r.session_id));
          if (query.tournament_id?.$in) return query.tournament_id.$in.includes(String(r.tournament_id));
          return Object.keys(query).length === 0;
        }).length;
        await E[entityName].deleteMany(query);
        deleted[entityName] = expected;
      } catch (e) {
        errors.push({ entity: entityName, message: e?.message || String(e) });
      }
    }

    // Delete old KOTC V2 transactional history while retaining the single demo snapshot.
    for (const entityName of KOTC_SESSION_CHILDREN) await purge(entityName, { session_id: { $in: oldSessionIds } });
    await purge('KotcSpondDraft', { tournament_id: { $in: oldTournamentIds } });
    await purge('KotcEngineTestRun', {});
    await purge('KotcPlayerAggregate', {});
    await purge('KotcSession', { id: { $in: oldSessionIds } });

    // Delete legacy wrapper dependencies for old KOTC tournaments only.
    await purge('Match', { tournament_id: { $in: oldTournamentIds } });
    await purge('TournamentParticipant', { tournament_id: { $in: oldTournamentIds } });
    await purge('TournamentUserAccess', { tournament_id: { $in: oldTournamentIds } });
    await purge('Tournament', { id: { $in: oldTournamentIds } });

    // Remove the partial membership migration and stale player roster. User/access linkage is untouched.
    await purge('Member', {});
    await purge('ClubMembership', {});
    await purge('SpondIdentity', {});
    await purge('Player', { id: { $in: deletePlayerIds } });

    const [remainingSessions, remainingKotcTournaments, remainingPlayers, remainingMembers, remainingDemoRounds, remainingDemoMatches] = await Promise.all([
      E.KotcSession.list(),
      E.Tournament.filter({ format: 'King of the Court' }),
      E.Player.list(),
      E.Member.list(),
      E.KotcRound.filter({ session_id: DEMO_SESSION_ID }),
      E.KotcMatch.filter({ session_id: DEMO_SESSION_ID }),
    ]);

    const verification = {
      kotc_sessions: (remainingSessions || []).map((s:any) => ({ id:s.id, name:s.name, status:s.status, demo_mode:s.demo_mode })),
      kotc_tournaments: (remainingKotcTournaments || []).map((t:any) => ({ id:t.id, name:t.name, status:t.status })),
      player_count: (remainingPlayers || []).length,
      protected_players_present: [...PROTECTED_PLAYER_IDS].every(id => (remainingPlayers || []).some((p:any) => String(p.id) === id)),
      isolated_test_player_count: (remainingPlayers || []).filter((p:any) => /^KOTC TEST \d{2}$/.test(String(p.full_name || ''))).length,
      member_count: (remainingMembers || []).length,
      demo_rounds: (remainingDemoRounds || []).length,
      demo_matches: (remainingDemoMatches || []).length,
    };

    const verified = errors.length === 0 &&
      verification.kotc_sessions.length === 1 && verification.kotc_sessions[0]?.id === DEMO_SESSION_ID &&
      verification.kotc_tournaments.length === 1 && verification.kotc_tournaments[0]?.id === DEMO_TOURNAMENT_ID &&
      verification.player_count === 21 && verification.protected_players_present === true &&
      verification.isolated_test_player_count === 18 && verification.member_count === 0 &&
      verification.demo_rounds === 3 && verification.demo_matches === 12;

    await E.AuditLog.create({
      tenant_id: CLARE_TENANT_ID,
      club_id: CLARE_CLUB_ID,
      user_id: user.id,
      action: verified ? 'pre_membership_bulk_purge_completed' : 'pre_membership_bulk_purge_incomplete',
      entity_type: 'RallyHubMaintenance',
      entity_id: DEMO_SESSION_ID,
      scope_type: 'KOTCPreMembershipPurge',
      scope_id: CLARE_TENANT_ID,
      after_state: JSON.stringify({ plan, deleted, errors, verification }),
      reason: 'One-time controlled cleanup before importing the Clare Pickleball membership master.',
    });

    return Response.json({ success: verified, executed_at: nowIso(), plan, deleted, errors, verification }, { status: verified ? 200 : 500 });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});
