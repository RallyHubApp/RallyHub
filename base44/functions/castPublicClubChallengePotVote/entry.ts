import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

async function deviceKey(eventId:string, rawDeviceId:string) {
  const input = new TextEncoder().encode(`${eventId}:${rawDeviceId}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return 'device:' + Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token, clubANomineeParticipantId, clubBNomineeParticipantId, voterDeviceId } = body;
    if (!token || !voterDeviceId || (!clubANomineeParticipantId && !clubBNomineeParticipantId)) {
      return Response.json({ error:'Voting link, device and at least one team choice are required.' }, { status:400 });
    }
    const rawDeviceId = String(voterDeviceId || '').trim();
    if (rawDeviceId.length < 8 || rawDeviceId.length > 160) return Response.json({ error:'Voting device identifier is invalid.' }, { status:400 });

    const links = await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ token, active:true }, '-created_at', 5);
    const link = links?.[0];
    if (!link) return Response.json({ error:'Voting link is invalid or inactive.' }, { status:404 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:404 });

    const nowMs = Date.now();
    const closesAtMs = event.pot_vote_closes_at ? Date.parse(event.pot_vote_closes_at) : NaN;
    if (event.pot_status === 'open' && Number.isFinite(closesAtMs) && closesAtMs <= nowMs) {
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { pot_status:'closed' });
      return Response.json({ error:'Player of Tournament voting has closed.' }, { status:409 });
    }
    if (event.pot_status !== 'open') return Response.json({ error:'Player of Tournament voting is not open.' }, { status:409 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const byId = new Map(participants.map((p:any) => [p.id, p]));
    const requested:any[] = [];
    if (clubANomineeParticipantId) requested.push({ side:'club_a', id:clubANomineeParticipantId });
    if (clubBNomineeParticipantId) requested.push({ side:'club_b', id:clubBNomineeParticipantId });

    for (const choice of requested) {
      const nominee:any = byId.get(choice.id);
      if (!nominee || nominee.side !== choice.side) return Response.json({ error:'That player is not eligible for this team award.' }, { status:409 });
      const isUnusedReserve = (nominee.roster_role || 'rotation') === 'reserve' && !nominee.reserve_activated;
      if (isUnusedReserve) return Response.json({ error:'That player did not enter the active team and is not eligible for voting.' }, { status:409 });
    }

    const voterIdentityKey = await deviceKey(event.id, rawDeviceId);
    const existing = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id, voter_identity_key:voterIdentityKey }, '-cast_at', 20);
    const usedSides = new Set(existing.filter((v:any) => v.valid !== false).map((v:any) => {
      if (v.ballot_side) return v.ballot_side;
      return byId.get(v.nominee_participant_id)?.side || '';
    }).filter(Boolean));

    const toCreate = requested.filter(choice => !usedSides.has(choice.side));
    if (!toCreate.length) return Response.json({ error:'This device has already voted for the selected team award(s).' }, { status:409 });

    const now = new Date().toISOString();
    const created:any[] = [];
    for (const choice of toCreate) {
      const vote = await base44.asServiceRole.entities.ClubChallengeVote.create({
        tenant_id:event.tenant_id,
        challenge_event_id:event.id,
        voter_identity_key:voterIdentityKey,
        nominee_participant_id:choice.id,
        ballot_side:choice.side,
        access_route:'qr',
        cast_at:now,
        valid:true
      });
      created.push(vote);
    }

    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'pot_ballot_cast',
      user_id:'public_qr',
      occurred_at:now,
      new_value_json:JSON.stringify({ sides:toCreate.map(x => x.side), votes_recorded:created.length, access_route:'qr' }),
      note:'Anonymous public ballot recorded; nominee identities intentionally omitted from audit to preserve ballot privacy.'
    });

    return Response.json({ success:true, votesRecorded:created.length, sides:toCreate.map(x => x.side) });
  } catch (error) {
    console.error('castPublicClubChallengePotVote failed', error);
    return Response.json({ error:'Unable to record the vote right now.' }, { status:500 });
  }
});