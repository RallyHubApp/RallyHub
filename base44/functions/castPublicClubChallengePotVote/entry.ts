import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token, voterParticipantId, nomineeParticipantId, voterCode } = body;
    if (!token || !voterParticipantId || !nomineeParticipantId || !voterCode) return Response.json({ error:'Voting link, voter, nominee and access code are required.' }, { status:400 });
    if (voterParticipantId === nomineeParticipantId) return Response.json({ error:'Players cannot vote for themselves.' }, { status:409 });

    const links = await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ token, active:true }, '-created_at', 5);
    const link = links?.[0];
    if (!link) return Response.json({ error:'Voting link is invalid or inactive.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:404 });
    if (event.pot_status !== 'open') return Response.json({ error:'Player of Tournament voting is not open.' }, { status:409 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const voter = participants.find((p:any)=>p.id === voterParticipantId);
    const nominee = participants.find((p:any)=>p.id === nomineeParticipantId);
    if (!voter || !nominee) return Response.json({ error:'Voter and nominee must belong to this Club Challenge.' }, { status:409 });
    if (!['active','late'].includes(voter.status)) return Response.json({ error:'This participant is not eligible to vote.' }, { status:409 });
    if (nominee.status === 'replaced') return Response.json({ error:'That nominee is not eligible.' }, { status:409 });
    if (String(voter.guest_access_token || '').toUpperCase() !== String(voterCode || '').trim().toUpperCase()) return Response.json({ error:'Participant access code is incorrect.' }, { status:403 });

    const existing = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id, voter_participant_id:voter.id }, '-cast_at', 20);
    if (existing.some((v:any)=>v.valid !== false)) return Response.json({ error:'This player has already voted.' }, { status:409 });

    const now = new Date().toISOString();
    const vote = await base44.asServiceRole.entities.ClubChallengeVote.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, voter_identity_key:voter.unique_identity_key || `participant:${voter.id}`, voter_participant_id:voter.id, nominee_participant_id:nominee.id, access_route:'qr', cast_at:now, valid:true });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'pot_vote_cast', user_id:'public_qr', occurred_at:now, new_value_json:JSON.stringify({ voter_participant_id:voter.id, access_route:'qr' }), note:'Public QR vote recorded; nominee intentionally omitted from audit to preserve ballot privacy.' });
    return Response.json({ success:true, voteId:vote.id });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected public POT vote error' }, { status:500 });
  }
});