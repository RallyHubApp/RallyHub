import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    if (!/^ccc_[0-9a-f]{32}$/i.test(token)) {
      return Response.json({ error: 'Committee link is invalid.' }, { status: 404 });
    }

    const tokenRows = await base44.asServiceRole.entities.InterclubCommitteeToken.filter({ token, active: true }, '-created_at', 5);
    const access = tokenRows?.[0];
    if (!access) return Response.json({ error: 'Committee link is invalid or inactive.' }, { status: 404 });

    const [eventRows, tournamentRows, briefingRows] = await Promise.all([
      base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: access.challenge_event_id }),
      base44.asServiceRole.entities.Tournament.filter({ id: access.tournament_id }),
      base44.asServiceRole.entities.InterclubCommitteeBriefing.filter({ challenge_event_id: access.challenge_event_id }, '-updated_at', 10),
    ]);

    const event = eventRows?.[0];
    const tournament = tournamentRows?.[0];
    const briefing = briefingRows?.[0];
    if (!event || !tournament || !briefing) {
      return Response.json({ error: 'Committee briefing is unavailable.' }, { status: 404 });
    }

    let sections = [];
    try {
      const parsed = JSON.parse(briefing.sections_json || '[]');
      sections = Array.isArray(parsed) ? parsed : [];
    } catch {
      sections = [];
    }

    try {
      await base44.asServiceRole.entities.InterclubCommitteeToken.update(access.id, { last_used_at: new Date().toISOString() });
    } catch {}

    return Response.json({
      success: true,
      event: {
        id: event.id,
        clubA: event.club_a_name,
        clubB: event.club_b_name,
        date: tournament.start_date || tournament.end_date || '',
        startTime: tournament.event_start_time || event.scheduled_start_time || '',
        endTime: tournament.event_end_time || '',
        venue: tournament.location || tournament.event_player_info || '',
      },
      briefing: {
        title: briefing.title || 'Interclub Committee Briefing',
        intro: briefing.intro || '',
        sections,
      },
    });
  } catch (error) {
    console.error('getInterclubCommitteeBriefing failed', error);
    return Response.json({ error: 'Unable to load the committee briefing right now.' }, { status: 500 });
  }
});
