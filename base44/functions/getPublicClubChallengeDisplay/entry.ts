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
    const base44 = createClientFromRequest(req);
    const { token } = await req.json().catch(() => ({}));
    if (!token) return Response.json({ error:'Display token required' }, { status:400 });
    const rows = await base44.asServiceRole.entities.ClubChallengeDisplayToken.filter({ token, active:true }, '-created_at', 5);
    const link = rows?.[0];
    if (!link) return Response.json({ error:'Display link is invalid or inactive.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || event.status === 'draft') return Response.json({ error:'Club Challenge display is not available.' }, { status:404 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const pmap = new Map(participants.map((p:any) => [p.id, maskName(p.display_name, !!event.junior_display_mode)]));
    const safeMatches = matches.map((m:any) => ({
      id:m.id, round_number:m.round_number, court_number:m.court_number, status:m.status, winner:m.winner,
      score_a:m.score_a, score_b:m.score_b, is_showcase:!!m.is_showcase,
      club_a_names:(m.club_a_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
      club_b_names:(m.club_b_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
    }));
    return Response.json({ success:true, server_now:new Date().toISOString(), event:{
      id:event.id, status:event.status, club_a_name:event.club_a_name, club_b_name:event.club_b_name,
      club_a_logo_url:event.club_a_logo_url, club_b_logo_url:event.club_b_logo_url,
      club_a_primary_colour:event.club_a_primary_colour, club_b_primary_colour:event.club_b_primary_colour,
      current_round:event.current_round, timer_state_json:event.timer_state_json, timer_revision:event.timer_revision,
      play_minutes:event.play_minutes, changeover_minutes:event.changeover_minutes, junior_display_mode:!!event.junior_display_mode,
      win_points:event.win_points, draw_points:event.draw_points, loss_points:event.loss_points,
    }, matches:safeMatches });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected public display error' }, { status:500 });
  }
});