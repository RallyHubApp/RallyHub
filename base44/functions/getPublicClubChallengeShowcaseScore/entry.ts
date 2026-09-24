import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { token } = body;
    if (!token) return Response.json({ error:'Scorer token required' }, { status:400 });
    const rows = await base44.asServiceRole.entities.ClubChallengeShowcaseScoreToken.filter({ token, active:true }, '-created_at', 5);
    const access = rows?.[0];
    if (!access) return Response.json({ error:'Showcase scorer link is invalid or inactive.' }, { status:404 });
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ id:access.match_id });
    const match = matches?.[0];
    if (!match || !match.is_showcase) return Response.json({ error:'Showcase Final not found.' }, { status:404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:access.challenge_event_id });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub event not found.' }, { status:404 });
    return Response.json({
      success:true,
      event:{
        id:event.id,
        status:event.status,
        club_a_name:event.club_a_name,
        club_a_logo_url:event.club_a_logo_url || '',
        club_a_primary_colour:event.club_a_primary_colour || '',
        club_a_secondary_colour:event.club_a_secondary_colour || '',
        club_b_name:event.club_b_name,
        club_b_logo_url:event.club_b_logo_url || '',
        club_b_primary_colour:event.club_b_primary_colour || '',
        club_b_secondary_colour:event.club_b_secondary_colour || ''
      },
      match:{
        id:match.id, club_a_names:match.club_a_names, club_b_names:match.club_b_names,
        score_a:Number(match.score_a || 0), score_b:Number(match.score_b || 0), status:match.status,
        winner:match.winner, revision:Number(match.revision || 0), showcase_mode:match.showcase_mode || 'tiebreak',
        showcase_target_points:Number(match.showcase_target_points || 11), showcase_win_by:Number(match.showcase_win_by || 1),
        side_change_at:match.side_change_at || null
      }
    });
  } catch (error) {
    return Response.json({ error:error?.message || 'Could not load Showcase score' }, { status:500 });
  }
});