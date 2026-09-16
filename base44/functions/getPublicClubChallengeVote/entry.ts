import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function maskName(name:string, junior:boolean) {
  if (!junior) return name || '';
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

Deno.serve(async (req) => {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 2048) return Response.json({ error:'Request too large.' }, { status:413 });
    const base44 = createClientFromRequest(req);
    const { token } = await req.json().catch(() => ({}));
    const votingToken = String(token || '').trim();
    if (!/^ccv_[0-9a-f]{32}$/i.test(votingToken)) return Response.json({ error:'Voting link is invalid or inactive.' }, { status:404 });
    const rows = await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ token:votingToken, active:true }, '-created_at', 5);
    const link = rows?.[0];
    if (!link) return Response.json({ error:'Voting link is invalid or inactive.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:404 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    return Response.json({ success:true, event:{ id:event.id, club_a_name:event.club_a_name, club_b_name:event.club_b_name, pot_status:event.pot_status, junior_display_mode:!!event.junior_display_mode }, participants:participants.filter((p:any)=>p.status !== 'replaced').map((p:any)=>({ id:p.id, side:p.side, status:p.status, display_name:maskName(p.display_name, !!event.junior_display_mode), can_vote:['active','late'].includes(p.status) })) });
  } catch (error) {
    console.error('getPublicClubChallengeVote failed', error);
    return Response.json({ error:'Unable to load voting right now.' }, { status:500 });
  }
});