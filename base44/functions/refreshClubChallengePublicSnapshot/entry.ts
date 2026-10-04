import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

function maskName(name:string, junior:boolean) {
  if (!junior) return name || '';
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
function validTournamentEventGrant(a:any, tenantId:string) {
  if (!a || a.status !== 'active' || String(a.tenant_id || '') !== String(tenantId || '')) return false;
  const now = Date.now();
  if (a.starts_at && Date.parse(a.starts_at) > now) return false;
  if (a.ends_at && Date.parse(a.ends_at) < now) return false;
  return true;
}
function validClubChallengeGrant(a:any, tenantId:string) {
  return !!a && a.active === true && String(a.tenant_id || '') === String(tenantId || '');
}
function updateVisible(update:any, event:any) {
  if (!update || update.status !== 'published') return false;
  const expiryMode = update.expiry_mode || 'event_start';
  if (expiryMode === 'event_start' && ['in_progress','paused','completed','archived'].includes(event.status)) return false;
  if (update.expires_at) {
    const expires = Date.parse(update.expires_at);
    if (Number.isFinite(expires) && expires <= Date.now()) return false;
  }
  return true;
}

async function buildPayload(base44:any, event:any) {
  const [participants, matches, hostClubRows, tournamentRows, spotPrizeRows, updateRows, displayTokens] = await Promise.all([
    base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 150),
    base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300),
    event.host_club_id ? base44.asServiceRole.entities.Club.filter({ id:event.host_club_id, tenant_id:event.tenant_id }) : Promise.resolve([]),
    base44.asServiceRole.entities.Tournament.filter({ id:event.tournament_id }),
    base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.filter({ challenge_event_id:event.id }, '-updated_date', 5),
    base44.asServiceRole.entities.InterclubTournamentUpdate.filter({ challenge_event_id:event.id, status:'published' }, '-published_at', 10),
    base44.asServiceRole.entities.ClubChallengeDisplayToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 5),
  ]);
  const hostClub = hostClubRows?.[0] || null;
  const tournament = tournamentRows?.[0] || null;
  const spotPrizeDraw = spotPrizeRows?.[0] || null;
  const displayToken = displayTokens?.[0]?.token || '';
  let spotPrizeWinners:any[] = [];
  try { spotPrizeWinners = spotPrizeDraw?.winners_json ? JSON.parse(spotPrizeDraw.winners_json) : []; } catch { spotPrizeWinners = []; }
  if (!Array.isArray(spotPrizeWinners)) spotPrizeWinners = [];
  const votingTokens = event.pot_enabled
    ? await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 5)
    : [];
  const votingToken = votingTokens?.[0]?.token || null;
  const pmap = new Map(participants.map((p:any) => [p.id, maskName(p.display_name, !!event.junior_display_mode)]));
  const potWinnerIds = event.pot_status === 'revealed' ? (event.pot_winner_participant_ids || []) : [];
  let publicVoteResults:any[] = [];
  let publicBallotCount = 0;
  if (event.pot_status === 'revealed' && event.pot_method === 'vote') {
    const votes = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id, valid:true }, '-cast_at', 500);
    const counts = new Map<string,number>();
    const voters = new Set<string>();
    for (const vote of votes || []) {
      if (vote.voter_identity_key) voters.add(String(vote.voter_identity_key));
      if (vote.nominee_participant_id) counts.set(String(vote.nominee_participant_id),(counts.get(String(vote.nominee_participant_id))||0)+1);
    }
    publicBallotCount = voters.size;
    publicVoteResults = participants
      .filter((p:any) => ['club_a','club_b'].includes(p.side) && Number(counts.get(String(p.id))||0) > 0)
      .map((p:any) => ({id:p.id,side:p.side,display_name:maskName(p.display_name,!!event.junior_display_mode),votes:Number(counts.get(String(p.id))||0)}))
      .sort((a:any,b:any) => a.side.localeCompare(b.side) || b.votes-a.votes || a.display_name.localeCompare(b.display_name));
  }
  const individualStats:any = {};
  if (event.pot_method === 'points') {
    const ensure = (id:string, side:string) => individualStats[id] || (individualStats[id] = { side, games_played:0, points_for:0, points_against:0, wins:0, point_diff:0 });
    for (const m of matches) {
      if (m.is_showcase || !['completed','draw','retired','forfeit'].includes(m.status)) continue;
      const a=Number(m.score_a||0), b=Number(m.score_b||0);
      for (const id of (m.club_a_participant_ids||[])) { const s=ensure(id,'club_a'); s.games_played++; s.points_for+=a; s.points_against+=b; if(m.winner==='club_a')s.wins++; }
      for (const id of (m.club_b_participant_ids||[])) { const s=ensure(id,'club_b'); s.games_played++; s.points_for+=b; s.points_against+=a; if(m.winner==='club_b')s.wins++; }
    }
    Object.values(individualStats).forEach((s:any) => { s.point_diff=s.points_for-s.points_against; });
  }
  const potWinners = potWinnerIds.map((id:string) => participants.find((p:any) => p.id === id)).filter(Boolean).map((p:any) => ({
    id:p.id, side:p.side, display_name:maskName(p.display_name, !!event.junior_display_mode), ...(event.pot_method === 'points' ? individualStats[p.id] || {} : {}),
  }));
  const participantById = new Map(participants.map((p:any) => [p.id, p]));
  const safeParticipants = participants.filter((p:any) => ['club_a','club_b'].includes(p.side)).map((p:any) => {
    const incoming:any = p.replaced_by_participant_id ? participantById.get(p.replaced_by_participant_id) : null;
    return {
      id:p.id, display_name:pmap.get(p.id) || 'Player', side:p.side, event_rank:p.event_rank,
      roster_role:p.roster_role || 'rotation', reserve_activated:!!p.reserve_activated, status:p.status,
      available_from_round:p.available_from_round, replaced_by_participant_id:p.replaced_by_participant_id || null,
      replacement_for_participant_id:p.replacement_for_participant_id || null,
      replacement_effective_round:p.replacement_effective_round || incoming?.replacement_effective_round || null
    };
  });
  const preEvent = ['draft','draw_generated'].includes(event.status);
  const drawApprovedPreview = event.status === 'draw_approved';
  const safeMatches = preEvent ? [] : matches.map((m:any) => ({
    id:m.id, round_number:m.round_number, court_number:m.court_number, status:drawApprovedPreview ? 'scheduled' : m.status, winner:drawApprovedPreview ? 'none' : m.winner,
    score_a:drawApprovedPreview ? null : m.score_a, score_b:drawApprovedPreview ? null : m.score_b, is_showcase:!!m.is_showcase,
    showcase_mode:m.showcase_mode, showcase_target_points:m.showcase_target_points, showcase_win_by:m.showcase_win_by,
    side_change_at:m.side_change_at || null,
    club_a_participant_ids:m.club_a_participant_ids || [], club_b_participant_ids:m.club_b_participant_ids || [],
    club_a_names:(m.club_a_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
    club_b_names:(m.club_b_participant_ids || []).map((id:string) => pmap.get(id) || 'Player'),
  }));
  const latestUpdate = (updateRows || []).find((row:any) => updateVisible(row,event)) || null;
  return {
    success:true,
    event:{
      id:event.id, status:event.status, host_club_id:event.host_club_id || null,
      host_club:hostClub ? { id:hostClub.id, name:hostClub.name || null, logo_url:hostClub.logo_url || null, primary_colour:hostClub.primary_colour || null, secondary_colour:hostClub.secondary_colour || null } : null,
      club_a_name:event.club_a_name, club_b_name:event.club_b_name,
      club_a_logo_url:event.club_a_logo_url, club_b_logo_url:event.club_b_logo_url,
      club_a_primary_colour:event.club_a_primary_colour, club_b_primary_colour:event.club_b_primary_colour,
      club_a_secondary_colour:event.club_a_secondary_colour, club_b_secondary_colour:event.club_b_secondary_colour,
      current_round:preEvent ? 0 : (drawApprovedPreview ? 1 : event.current_round), planned_rounds:event.planned_rounds, courts:event.courts,
      timer_state_json:(preEvent || drawApprovedPreview) ? null : event.timer_state_json, timer_revision:event.timer_revision,
      event_date:tournament?.start_date || null,
      event_start_time:tournament?.event_start_time || event.scheduled_start_time || null,
      event_end_time:tournament?.event_end_time || null,
      event_venue:tournament?.location || null,
      event_map_url:tournament?.event_map_url || null,
      event_contact_phone:tournament?.event_contact_phone || null,
      event_player_info:tournament?.event_player_info || null,
      event_slug:tournament?.event_slug || null,
      play_minutes:event.play_minutes, changeover_minutes:event.changeover_minutes,
      normal_match_type:event.normal_match_type, normal_target_points:event.normal_target_points, normal_win_by:event.normal_win_by,
      timed_draws_allowed:event.timed_draws_allowed !== false, showcase_enabled:!!event.showcase_enabled,
      include_break:!!event.include_break, break_minutes:event.break_minutes, break_after_round:event.break_after_round,
      junior_display_mode:!!event.junior_display_mode,
      pot_enabled:!!event.pot_enabled, pot_method:event.pot_method || 'none', pot_status:preEvent ? 'closed' : event.pot_status,
      pot_vote_closes_at:preEvent ? null : (event.pot_vote_closes_at || null), pot_voting_token:preEvent ? null : votingToken,
      pot_winners:preEvent ? [] : potWinners, pot_ballot_count:publicBallotCount, pot_vote_results:publicVoteResults,
      spot_prize_enabled:!!spotPrizeDraw?.enabled, spot_prize_mode:spotPrizeDraw?.mode || 'all_players',
      spot_prize_count:Number(spotPrizeDraw?.prize_count || 0), spot_prize_status:spotPrizeDraw?.status || 'ready',
      spot_prize_draw_count:Number(spotPrizeDraw?.draw_count || 0),
      spot_prize_winners:spotPrizeWinners.map((w:any)=>({ pull:Number(w.pull||0), participant_id:w.participant_id, display_name:maskName(w.display_name,!!event.junior_display_mode), side:w.side, team_name:w.team_name, number:Number(w.number||0), drawn_at:w.drawn_at || null })),
      win_points:event.win_points, draw_points:event.draw_points, loss_points:event.loss_points,
      tournament_update:latestUpdate ? { title:latestUpdate.title || 'Tournament Update', message:latestUpdate.message || '', published_at:latestUpdate.published_at || null, expires_at:latestUpdate.expires_at || null, expiry_mode:latestUpdate.expiry_mode || 'manual' } : null,
    },
    participants:safeParticipants,
    matches:safeMatches,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.eventId || '').trim();
    if (!eventId) return Response.json({ error:'eventId required' }, { status:400 });
    const event = (await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId }))?.[0];
    if (!event) return Response.json({ error:'Interclub event not found.' }, { status:404 });
    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a,event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a,event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required.' }, { status:403 });
    const now = new Date().toISOString();
    let displayTokenRow = (await base44.asServiceRole.entities.ClubChallengeDisplayToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 5))?.[0] || null;
    if (!displayTokenRow) displayTokenRow = await base44.asServiceRole.entities.ClubChallengeDisplayToken.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, token:`ccd_${crypto.randomUUID().replaceAll('-','')}`, active:true, created_at:now });
    let votingTokenRow:any = null;
    if (event.pot_enabled) {
      votingTokenRow = (await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 5))?.[0] || null;
      if (!votingTokenRow) votingTokenRow = await base44.asServiceRole.entities.ClubChallengeVotingToken.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, token:`ccv_${crypto.randomUUID().replaceAll('-','')}`, active:true, created_at:now });
    }
    const payload = await buildPayload(base44,event);
    const displayToken = displayTokenRow?.token || '';
    const votingToken = votingTokenRow?.token || '';
    const rows = await base44.asServiceRole.entities.ClubChallengePublicSnapshot.filter({ challenge_event_id:event.id }, '-updated_at', 5);
    const current = rows?.[0] || null;
    const data = { tenant_id:event.tenant_id, challenge_event_id:event.id, display_token:displayToken, voting_token:votingToken, display_payload_json:JSON.stringify(payload), voting_payload_json:'', updated_at:now, active:true };
    const snapshot = current
      ? await base44.asServiceRole.entities.ClubChallengePublicSnapshot.update(current.id,data)
      : await base44.asServiceRole.entities.ClubChallengePublicSnapshot.create(data);
    return Response.json({ success:true, snapshotId:snapshot.id, updatedAt:now, displayToken });
  } catch (error) {
    console.error('refreshClubChallengePublicSnapshot failed', error);
    return Response.json({ error:error?.message || 'Unable to refresh public snapshot.' }, { status:500 });
  }
});
