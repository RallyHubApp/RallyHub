import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function clean(value:any, max=200) { return String(value ?? '').trim().replace(/\s+/g,' ').slice(0,max); }
function validToken(value:string) { return /^cctm_[0-9a-f]{32}$/i.test(value); }

Deno.serve(async (req) => {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 60000) return Response.json({ error:'Request too large.' }, { status:413 });

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const tokenValue = clean(body.token, 80);
    const action = clean(body.action || 'get', 20).toLowerCase();
    if (!validToken(tokenValue)) return Response.json({ error:'Team manager link is invalid or inactive.' }, { status:404 });

    const tokenRows = await base44.asServiceRole.entities.InterclubTeamManagerToken.filter({ token:tokenValue, active:true }, '-created_at', 5);
    const link = tokenRows?.[0];
    if (!link) return Response.json({ error:'Team manager link is invalid or inactive.' }, { status:404 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:link.challenge_event_id });
    const event = events?.[0];
    if (!event || !['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Team editing is closed for this Interclub event.' }, { status:409 });

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id:event.tournament_id });
    const tournament = tournaments?.[0] || null;
    const allParticipants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 200);
    const teamPlayers = allParticipants
      .filter((p:any) => p.side === link.side && !['replaced','withdrawn','injured'].includes(p.status))
      .sort((a:any,b:any) => Number(a.event_rank || 999) - Number(b.event_rank || 999));
    const registrations = await base44.asServiceRole.entities.InterclubGuestRegistration.filter({ challenge_event_id:event.id, side:link.side, status:'active' }, '-registered_at', 200);
    const registrationByParticipant = new Map(registrations.map((r:any) => [String(r.participant_id || ''), r]));
    const teamName = link.side === 'club_a' ? event.club_a_name : event.club_b_name;
    const savedAt = link.side === 'club_a' ? event.club_a_roster_saved_at : event.club_b_roster_saved_at;

    const safeData = () => ({
      event:{
        id:event.id,
        eventName:`${event.club_a_name} v ${event.club_b_name}`,
        teamName,
        side:link.side,
        clubAName:event.club_a_name,
        clubBName:event.club_b_name,
        clubALogo:event.club_a_logo_url || '',
        clubBLogo:event.club_b_logo_url || '',
        clubAPrimary:event.club_a_primary_colour || '',
        clubBPrimary:event.club_b_primary_colour || '',
        date:tournament?.start_date || '',
        venue:tournament?.location || '',
        savedAt:savedAt || null,
      },
      players:teamPlayers.map((p:any, index:number) => ({
        id:p.id,
        displayName:p.display_name,
        gender:p.gender || '',
        rank:index + 1,
        playingCategory:p.playing_category || '',
        rosterRole:p.roster_role || 'rotation',
        registered:!!registrationByParticipant.get(String(p.id)),
      })),
    });

    if (action === 'get') {
      await base44.asServiceRole.entities.InterclubTeamManagerToken.update(link.id, { last_used_at:new Date().toISOString() });
      return Response.json({ success:true, ...safeData() });
    }
    if (action !== 'save') return Response.json({ error:'Invalid team manager action.' }, { status:400 });

    const ordered = Array.isArray(body.orderedParticipantIds) ? body.orderedParticipantIds.map(String) : [];
    const edits = Array.isArray(body.players) ? body.players : [];
    const currentIds = teamPlayers.map((p:any) => String(p.id)).sort();
    if (ordered.length !== currentIds.length || new Set(ordered).size !== ordered.length || [...ordered].sort().join('|') !== currentIds.join('|')) {
      return Response.json({ error:'The team changed while you were editing. Refresh to include the latest registrations, then save again.', conflict:true }, { status:409 });
    }
    const editsById = new Map(edits.map((row:any) => [String(row?.id || ''), row]));
    const byId = new Map(teamPlayers.map((p:any) => [String(p.id), p]));
    let changed = 0;
    for (let i=0;i<ordered.length;i++) {
      const id = ordered[i];
      const p:any = byId.get(id);
      if (!p) continue;
      const edit:any = editsById.get(id) || {};
      const category = ['social','improver'].includes(String(edit.playingCategory || '').toLowerCase()) ? String(edit.playingCategory).toLowerCase() : (p.playing_category || null);
      const role = String(edit.rosterRole || '').toLowerCase() === 'reserve' ? 'reserve' : 'rotation';
      const rank = i + 1;
      const patch:any = {};
      if (Number(p.event_rank || 0) !== rank) patch.event_rank = rank;
      if ((p.playing_category || null) !== category) patch.playing_category = category;
      if ((p.roster_role || 'rotation') !== role) { patch.roster_role = role; patch.reserve_activated = false; }
      if (Object.keys(patch).length) {
        await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, patch);
        Object.assign(p, patch);
        changed++;
      }
    }

    const now = new Date().toISOString();
    const savedField = link.side === 'club_a' ? 'club_a_roster_saved_at' : 'club_b_roster_saved_at';
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      [savedField]:now,
      fairness_json:'',
      status:event.status === 'draw_generated' ? 'draft' : event.status,
      event_pack_stale:true,
    });
    await base44.asServiceRole.entities.InterclubTeamManagerToken.update(link.id, { last_used_at:now });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'visiting_team_roster_saved',
      occurred_at:now,
      new_value_json:JSON.stringify({ side:link.side, ordered_participant_ids:ordered, changed, token_id:link.id }),
      note:`${teamName} team manager saved the current roster, categories and ranking.`,
    });

    return Response.json({ success:true, savedAt:now, changed, teamName });
  } catch (error:any) {
    console.error('interclubTeamManager failed', error?.message || error);
    return Response.json({ error:'Unable to load or save this team right now. Please refresh and try again.' }, { status:500 });
  }
});