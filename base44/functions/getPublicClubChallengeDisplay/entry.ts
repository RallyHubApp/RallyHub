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
    const displayToken = String(token || '').trim();
    if (!/^ccd_[0-9a-f]{32}$/i.test(displayToken)) return Response.json({ error:'Display link is invalid or inactive.' }, { status:404 });
    const rows = await base44.asServiceRole.entities.ClubChallengeDisplayToken.filter({ token:displayToken, active:true }, '-created_at', 5);
    const link = rows?.[0];
    if (!link) return Response.json({ error:'Display link is invalid or inactive.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !['draw_approved','in_progress','paused','completed','archived'].includes(event.status)) return Response.json({ error:'Interclub Challenge display is not available.' }, { status:404 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const votingTokens = event.pot_enabled
      ? await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 5)
      : [];
    const votingToken = votingTokens?.[0]?.token || null;
    const pmap = new Map(participants.map((p:any) => [p.id, maskName(p.display_name, !!event.junior_display_mode)]));
    const potWinnerIds = event.pot_status === 'revealed' ? (event.pot_winner_participant_ids || []) : [];
    const potWinners = potWinnerIds.map((id:string) => participants.find((p:any) => p.id === id)).filter(Boolean).map((p:any) => ({
      id:p.id, side:p.side, display_name:maskName(p.display_name, !!event.junior_display_mode),
    }));
    const safeParticipants = participants.filter((p:any) => ['active','late'].includes(p.status)).map((p:any) => ({
      id:p.id,
      display_name:pmap.get(p.id) || 'Player',
      side:p.side,
      event_rank:p.event_rank,
      roster_role:p.roster_role || 'rotation',
      reserve_activated:!!p.reserve_activated,
      status:p.status,
      available_from_round:p.available_from_round
    }));
    const safeMatches = matches.map((m:any) => ({
      id:m.id, round_number:m.round_number, court_number:m.court_number, status:m.status, winner:m.winner,
      score_a:m.score_a, score_b:m.score_b, is_showcase:!!m.is_showcase,
      showcase_mode:m.showcase_mode, showcase_target_points:m.showcase_target_points, showcase_win_by:m.showcase_win_by,
      side_change_at:m.side_change_at || null,
      club_a_participant_ids:m.club_a_participant_ids || [], club_b_participant_ids:m.club_b_participant_ids || [],
      club_a_names:(m.club_a_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
      club_b_names:(m.club_b_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
    }));
    return Response.json({ success:true, server_now:new Date().toISOString(), event:{
      id:event.id, status:event.status, club_a_name:event.club_a_name, club_b_name:event.club_b_name,
      club_a_logo_url:event.club_a_logo_url, club_b_logo_url:event.club_b_logo_url,
      club_a_primary_colour:event.club_a_primary_colour, club_b_primary_colour:event.club_b_primary_colour,
      current_round:event.current_round, planned_rounds:event.planned_rounds, timer_state_json:event.timer_state_json, timer_revision:event.timer_revision,
      play_minutes:event.play_minutes, changeover_minutes:event.changeover_minutes,
      include_break:!!event.include_break, break_minutes:event.break_minutes, break_after_round:event.break_after_round,
      junior_display_mode:!!event.junior_display_mode,
      pot_enabled:!!event.pot_enabled, pot_status:event.pot_status, pot_vote_closes_at:event.pot_vote_closes_at || null,
      pot_voting_token:event.pot_status === 'open' ? votingToken : null, pot_winners:potWinners,
      win_points:event.win_points, draw_points:event.draw_points, loss_points:event.loss_points,
    }, participants:safeParticipants, matches:safeMatches });
  } catch (error) {
    console.error('getPublicClubChallengeDisplay failed', error);
    return Response.json({ error:'Unable to load the public display right now.' }, { status:500 });
  }
});