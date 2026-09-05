import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, voterParticipantId, nomineeParticipantId } = body;
    if (!eventId || !voterParticipantId || !nomineeParticipantId) return Response.json({ error:'Event, voter and nominee are required.' }, { status:400 });
    if (voterParticipantId === nomineeParticipantId) return Response.json({ error:'Players cannot vote for themselves.' }, { status:409 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event || !event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:404 });
    if (event.pot_status !== 'open') return Response.json({ error:'Player of Tournament voting is not open.' }, { status:409 });

    const rows = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const voter = rows.find((p:any) => p.id === voterParticipantId);
    const nominee = rows.find((p:any) => p.id === nomineeParticipantId);
    if (!voter || !nominee) return Response.json({ error:'Voter and nominee must belong to this Club Challenge.' }, { status:409 });
    if (!['active','late'].includes(voter.status)) return Response.json({ error:'This participant is not eligible to vote.' }, { status:409 });
    if (['replaced'].includes(nominee.status)) return Response.json({ error:'That nominee is not eligible.' }, { status:409 });

    let voterOwnedByUser = String(voter.email || '').toLowerCase() === String(user.email || '').toLowerCase();
    if (!voterOwnedByUser && voter.source_player_id) {
      const players = await base44.asServiceRole.entities.Player.filter({ id:voter.source_player_id });
      const player = players?.[0];
      voterOwnedByUser = !!player && (player.user_id === user.id || String(player.linked_user_email || '').toLowerCase() === String(user.email || '').toLowerCase());
    }
    if (!voterOwnedByUser) return Response.json({ error:'You can only cast a vote as your own linked participant record.' }, { status:403 });

    const existing = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id, voter_participant_id:voter.id }, '-cast_at', 20);
    if (existing.some((v:any) => v.valid !== false)) return Response.json({ error:'This player has already voted.' }, { status:409 });

    const now = new Date().toISOString();
    const vote = await base44.asServiceRole.entities.ClubChallengeVote.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      voter_identity_key:voter.unique_identity_key || `participant:${voter.id}`,
      voter_participant_id:voter.id,
      nominee_participant_id:nominee.id,
      access_route:'logged_in',
      cast_at:now,
      valid:true,
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, action:'pot_vote_cast', user_id:user.id,
      occurred_at:now, new_value_json:JSON.stringify({ voter_participant_id:voter.id, access_route:'logged_in' }),
      note:'Vote recorded; nominee intentionally omitted from audit to preserve ballot privacy.',
    });
    return Response.json({ success:true, voteId:vote.id });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected POT vote error' }, { status:500 });
  }
});