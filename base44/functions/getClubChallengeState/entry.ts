import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { tournamentId } = body;
    if (!tournamentId) return Response.json({ error: 'tournamentId required' }, { status: 400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ tournament_id: tournamentId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Club Challenge event not found' }, { status: 404 });

    let accessRole = user.role === 'admin' ? 'admin' : '';
    let permissions = { canManage:false, canScore:false, canCorrectScore:false, canFinalise:false, displayOnly:false };
    if (accessRole === 'admin') permissions = { canManage:true, canScore:true, canCorrectScore:true, canFinalise:true, displayOnly:false };
    if (!accessRole) {
      const tournamentAccess = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: tournamentId, user_id: user.id, status: 'active' });
      const ccAccess = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true });
      const tournamentGrant = tournamentAccess.find((a:any) => ['event_manager','event_host','scorer'].includes(a.role));
      const ccGrant = ccAccess.find((a:any) => ['owner','organiser','scorer','display'].includes(a.role));
      accessRole = tournamentGrant?.role || ccGrant?.role || '';
      if (tournamentGrant) {
        permissions = {
          canManage:['event_manager','event_host'].includes(tournamentGrant.role),
          canScore:['event_manager','event_host','scorer'].includes(tournamentGrant.role),
          canCorrectScore:['event_manager','event_host'].includes(tournamentGrant.role),
          canFinalise:['event_manager','event_host'].includes(tournamentGrant.role),
          displayOnly:false,
        };
      } else if (ccGrant) {
        permissions = {
          canManage:['owner','organiser'].includes(ccGrant.role),
          canScore:!!ccGrant.can_score && ['owner','organiser','scorer'].includes(ccGrant.role),
          canCorrectScore:!!ccGrant.can_correct_score,
          canFinalise:!!ccGrant.can_finalise || ['owner','organiser'].includes(ccGrant.role),
          displayOnly:ccGrant.role === 'display',
        };
      }
    }
    if (!accessRole) return Response.json({ error: 'No Club Challenge access for this event' }, { status: 403 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id: event.id }, 'event_rank', 100);
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200);
    const scorerRows = user.role === 'admin' ? await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id }, 'role', 100) : [];

    // Never expose participant contact details through scorer/display state.
    const safeParticipants = participants.map((p:any) => ({
      id:p.id, tenant_id:p.tenant_id, challenge_event_id:p.challenge_event_id, tournament_id:p.tournament_id,
      side:p.side, display_name:p.display_name, gender:p.gender, age_category:p.age_category, event_rank:p.event_rank,
      status:p.status, available_from_round:p.available_from_round, replaced_by_participant_id:p.replaced_by_participant_id,
      replacement_for_participant_id:p.replacement_for_participant_id, replacement_effective_round:p.replacement_effective_round,
      withdrawn_at:p.withdrawn_at, withdrawal_reason:p.withdrawal_reason,
    }));

    return Response.json({ success:true, accessRole, permissions, event, participants:safeParticipants, matches, scorers:scorerRows });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected Club Challenge state error' }, { status: 500 });
  }
});
