import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const TERMINAL = new Set(['completed','draw','retired','forfeit','abandoned','not_played']);

function inWindow(access:any) {
  const now = Date.now();
  if (!access || access.status !== 'active') return false;
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, action, outgoingParticipantId, incomingName, incomingGender, incomingSourcePlayerId, incomingParticipantType, reason, withdrawalStatus, participantId, fromRound, side, displayName, players, orderedParticipantIds, poolParticipantIds, clubAParticipantIds, clubBParticipantIds, clubAName, clubBName, rosterRole, reserveParticipantId, coverParticipantId } = body;
    if (!eventId || !['replace','activate_reserve','cover_existing','continue_short','late_arrival','add_manual','bulk_add_manual','reorder','organise_teams','replacement_candidates','set_roster_role'].includes(action)) return Response.json({ error:'Invalid participant-management action.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });
    if (['completed','archived'].includes(event.status)) return Response.json({ error:'Finalised Interclub Challenge participants are read-only.' }, { status:409 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, tenant_id:event.tenant_id, user_id:user.id, status:'active' })).filter(inWindow);
      const ca = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, tenant_id:event.tenant_id, user_id:user.id, active:true });
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);

    if (action === 'replacement_candidates') {
      const normalise = (value:any) => String(value || '').trim().toLowerCase().replace(/\s+/g,' ');
      const clubA = normalise(event.club_a_name), clubB = normalise(event.club_b_name);
      const registered = await base44.asServiceRole.entities.TournamentParticipant.filter({ tournament_id:event.tournament_id }, 'display_name', 500);
      const candidates = registered
        .filter((tp:any) => tp.status === 'active')
        .map((tp:any) => {
          const club = normalise(tp.club_name_snapshot);
          const candidateSide = club === clubA ? 'club_a' : club === clubB ? 'club_b' : '';
          return { tp, candidateSide };
        })
        .filter(({ tp, candidateSide }:any) => {
          if (!candidateSide) return false;
          return !participants.some((p:any) => {
            if (p.side !== candidateSide) return false;
            if (tp.source_player_id && p.source_player_id && String(tp.source_player_id) === String(p.source_player_id)) return true;
            return normalise(p.display_name) === normalise(tp.display_name);
          });
        })
        .map(({ tp, candidateSide }:any) => ({
          id:tp.id,
          side:candidateSide,
          displayName:tp.display_name,
          gender:tp.gender_snapshot || '',
          sourcePlayerId:tp.source_player_id || '',
          participantType:tp.participant_type || 'member',
          clubName:tp.club_name_snapshot || (candidateSide === 'club_a' ? event.club_a_name : event.club_b_name),
        }));
      return Response.json({ success:true, candidates });
    }

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const currentRound = Math.max(1, Number(event.current_round || 1));
    const now = new Date().toISOString();

    if (action === 'add_manual') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Players can only be added before the draw is approved.' }, { status:409 });
      if (!['pool','club_a','club_b'].includes(side)) return Response.json({ error:'Valid player group required.' }, { status:400 });
      const cleanName = String(displayName || '').trim().replace(/\s+/g,' ').slice(0,120);
      if (!cleanName) return Response.json({ error:'Player name required.' }, { status:400 });
      const identity = cleanName.toLowerCase();
      if (participants.some((p:any) => ['active','late'].includes(p.status) && String(p.display_name||'').trim().toLowerCase().replace(/\s+/g,' ') === identity)) return Response.json({ error:'That player name is already active in this Interclub Challenge.' }, { status:409 });
      const sidePlayers = participants.filter((p:any) => p.side === side && !['replaced'].includes(p.status));
      const created = await base44.asServiceRole.entities.ClubChallengeParticipant.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, side, display_name:cleanName, event_rank:sidePlayers.length + 1, roster_role:'rotation', status:'active', available_from_round:1, unique_identity_key:`manual-${side}-${crypto.randomUUID().slice(0,12)}` });
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { fairness_json:'', status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_added_manual', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({participant_id:created.id,side,name:cleanName}) });
      return Response.json({ success:true, participant:created });
    }

    if (action === 'bulk_add_manual') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Players can only be imported before the draw is approved.' }, { status:409 });
      if (!['club_a','club_b'].includes(side)) return Response.json({ error:'Choose Clare or Galway as the import destination.' }, { status:400 });
      const rows = Array.isArray(players) ? players.slice(0,200) : [];
      if (!rows.length) return Response.json({ error:'No CSV players were supplied.' }, { status:400 });
      const normalise = (value:any) => String(value || '').trim().toLowerCase().replace(/\s+/g,' ');
      const existing = new Set(participants.filter((p:any) => ['active','late'].includes(p.status)).map((p:any) => normalise(p.display_name)));
      const sidePlayers = participants.filter((p:any) => p.side === side && !['replaced'].includes(p.status));
      const created:any[] = [];
      const skipped:string[] = [];
      for (const row of rows) {
        const cleanName = String(row?.displayName || row?.name || '').trim().replace(/\s+/g,' ').slice(0,120);
        const identity = normalise(cleanName);
        if (!cleanName || existing.has(identity)) { if (cleanName) skipped.push(cleanName); continue; }
        const rawGender = String(row?.gender || '').trim();
        const gender = /^(f|female|woman|women)$/i.test(rawGender) ? 'Female' : /^(m|male|man|men)$/i.test(rawGender) ? 'Male' : rawGender.slice(0,40);
        const participant = await base44.asServiceRole.entities.ClubChallengeParticipant.create({
          tenant_id:event.tenant_id,
          challenge_event_id:event.id,
          tournament_id:event.tournament_id,
          side,
          display_name:cleanName,
          gender:gender || undefined,
          event_rank:sidePlayers.length + created.length + 1,
          roster_role:'rotation',
          status:'active',
          available_from_round:1,
          unique_identity_key:`csv-${side}-${crypto.randomUUID().slice(0,12)}`,
        });
        created.push(participant);
        existing.add(identity);
      }
      if (created.length) {
        await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { fairness_json:'', status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true });
        await base44.asServiceRole.entities.ClubChallengeAudit.create({
          tenant_id:event.tenant_id,
          challenge_event_id:event.id,
          action:'participants_imported_csv',
          user_id:user.id,
          occurred_at:now,
          new_value_json:JSON.stringify({side,created:created.map((p:any)=>({id:p.id,name:p.display_name})),skipped}),
        });
      }
      return Response.json({ success:true, created:created.length, skipped:skipped.length, skippedNames:skipped });
    }

    if (action === 'set_roster_role') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Rotation and Reserve roles can only be changed before the draw is approved.' }, { status:409 });
      const p = participants.find((x:any) => x.id === participantId);
      if (!p || !['club_a','club_b'].includes(p.side)) return Response.json({ error:'Choose a player already assigned to a team.' }, { status:400 });
      const role = rosterRole === 'reserve' ? 'reserve' : rosterRole === 'rotation' ? 'rotation' : '';
      if (!role) return Response.json({ error:'Roster role must be Rotation or Reserve.' }, { status:400 });
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { roster_role:role, reserve_activated:false });
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { fairness_json:'', status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_roster_role_changed', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({participant_id:p.id,roster_role:p.roster_role || 'rotation'}), new_value_json:JSON.stringify({participant_id:p.id,roster_role:role}) });
      return Response.json({ success:true, participantId:p.id, participantName:p.display_name, rosterRole:role });
    }

    if (action === 'organise_teams') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Teams can only be organised before the draw is approved.' }, { status:409 });
      const poolIds = Array.isArray(poolParticipantIds) ? poolParticipantIds.map(String) : [];
      const aIds = Array.isArray(clubAParticipantIds) ? clubAParticipantIds.map(String) : [];
      const bIds = Array.isArray(clubBParticipantIds) ? clubBParticipantIds.map(String) : [];
      const activePlayers = participants.filter((p:any) => !['replaced','withdrawn','injured'].includes(p.status));
      const activeIds = activePlayers.map((p:any) => String(p.id)).sort();
      const requested = [...poolIds, ...aIds, ...bIds];
      if (requested.length !== activeIds.length || new Set(requested).size !== requested.length || [...requested].sort().join('|') !== activeIds.join('|')) {
        return Response.json({ error:'Every current player must appear exactly once in the Player Pool, Team A or Team B.' }, { status:409 });
      }
      const cleanAName = String(clubAName || event.club_a_name || 'Team A').trim().replace(/\s+/g,' ').slice(0,120);
      const cleanBName = String(clubBName || event.club_b_name || 'Team B').trim().replace(/\s+/g,' ').slice(0,120);
      if (!cleanAName || !cleanBName) return Response.json({ error:'Both team names are required.' }, { status:400 });
      const byId = new Map(activePlayers.map((p:any) => [String(p.id), p]));
      let changed = 0;
      const applyGroup = async (ids:string[], nextSide:'pool'|'club_a'|'club_b') => {
        for (let i=0;i<ids.length;i++) {
          const p:any = byId.get(ids[i]);
          if (!p) continue;
          const nextRank = nextSide === 'pool' ? i + 1 : i + 1;
          if (p.side !== nextSide || Number(p.event_rank || 0) !== nextRank) {
            await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { side:nextSide, event_rank:nextRank });
            changed++;
          }
        }
      };
      await applyGroup(poolIds, 'pool');
      await applyGroup(aIds, 'club_a');
      await applyGroup(bIds, 'club_b');
      const updatedEvent = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
        club_a_name:cleanAName, club_b_name:cleanBName, fairness_json:'',
        status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true,
      });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({
        tenant_id:event.tenant_id, challenge_event_id:event.id, action:'teams_organised', user_id:user.id, occurred_at:now,
        new_value_json:JSON.stringify({ pool:poolIds, club_a:aIds, club_b:bIds, club_a_name:cleanAName, club_b_name:cleanBName, changed }),
        note:'Host organised the Interclub player pool into ranked teams.',
      });
      return Response.json({ success:true, event:updatedEvent, poolCount:poolIds.length, clubACount:aIds.length, clubBCount:bIds.length, changed });
    }

    if (action === 'reorder') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Ranking can only be changed before the draw is approved.' }, { status:409 });
      if (!['club_a','club_b'].includes(side) || !Array.isArray(orderedParticipantIds)) return Response.json({ error:'Valid side and ordered participant list required.' }, { status:400 });
      const sidePlayers = participants.filter((p:any) => p.side === side && !['replaced'].includes(p.status));
      const currentIds = sidePlayers.map((p:any) => String(p.id)).sort();
      const requested = orderedParticipantIds.map(String);
      if (requested.length !== sidePlayers.length || new Set(requested).size !== requested.length || [...requested].sort().join('|') !== currentIds.join('|')) return Response.json({ error:'Ranking list must contain every current player on that club exactly once.' }, { status:409 });
      const byId = new Map(sidePlayers.map((p:any) => [String(p.id), p]));
      let changed = 0;
      for (let i=0;i<requested.length;i++) {
        const p:any = byId.get(requested[i]);
        const rank = i + 1;
        if (Number(p?.event_rank || 0) !== rank) { await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { event_rank:rank }); changed++; }
      }
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { fairness_json:'', status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_ranking_changed', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({side,ordered_participant_ids:requested,changed}) });
      return Response.json({ success:true, side, changed });
    }

    if (action === 'replace') {
      const outgoing = participants.find((p:any) => p.id === outgoingParticipantId);
      const cleanName = String(incomingName || '').trim();
      if (!outgoing || !cleanName) return Response.json({ error:'Outgoing participant and replacement name are required.' }, { status:400 });
      if (['withdrawn','injured','replaced'].includes(outgoing.status)) return Response.json({ error:'Outgoing participant is already inactive.' }, { status:409 });
      const identity = cleanName.toLowerCase().replace(/\s+/g,' ');
      if (participants.some((p:any) => p.id !== outgoing.id && ['active','late'].includes(p.status) && String(p.display_name||'').trim().toLowerCase().replace(/\s+/g,' ') === identity)) {
        return Response.json({ error:'That replacement name is already an active participant in this Interclub Challenge.' }, { status:409 });
      }
      const status = ['withdrawn','injured'].includes(withdrawalStatus) ? withdrawalStatus : 'withdrawn';
      const incoming = await base44.asServiceRole.entities.ClubChallengeParticipant.create({
        tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id,
        side:outgoing.side, display_name:cleanName, gender:String(incomingGender || outgoing.gender || ''),
        source_player_id:String(incomingSourcePlayerId || ''), participant_type:String(incomingParticipantType || outgoing.participant_type || 'member'),
        event_rank:outgoing.event_rank, roster_role:'rotation', status:'active', available_from_round:currentRound,
        replacement_for_participant_id:outgoing.id, replacement_effective_round:currentRound,
        unique_identity_key:`replacement-${outgoing.side}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${crypto.randomUUID().slice(0,8)}`,
      });
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(outgoing.id, { status, replaced_by_participant_id:incoming.id, withdrawn_at:now, withdrawal_reason:String(reason || status) });
      const affected = normal.filter((m:any) => Number(m.round_number) >= currentRound && !TERMINAL.has(m.status) && ([...(m.club_a_participant_ids||[]), ...(m.club_b_participant_ids||[])].includes(outgoing.id)));
      for (const m of affected) {
        const side = outgoing.side === 'club_a' ? 'club_a' : 'club_b';
        const idsKey = `${side}_participant_ids`, namesKey = `${side}_names`;
        const ids = [...(m[idsKey] || [])], names = [...(m[namesKey] || [])];
        const idx = ids.indexOf(outgoing.id);
        if (idx >= 0) { ids[idx] = incoming.id; names[idx] = incoming.display_name; }
        await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, { [idsKey]:ids, [namesKey]:names, revision:Number(m.revision||0)+1 });
      }
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_replaced', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({participant_id:outgoing.id,name:outgoing.display_name,status:outgoing.status}), new_value_json:JSON.stringify({participant_id:incoming.id,name:incoming.display_name,effective_round:currentRound,fixtures_changed:affected.length}), note:String(reason || `${status} replacement`) });
      return Response.json({ success:true, outgoingName:outgoing.display_name, incomingName:incoming.display_name, effectiveRound:currentRound, affected:affected.length });
    }

    if (action === 'activate_reserve') {
      const outgoing = participants.find((p:any) => p.id === outgoingParticipantId);
      const reserve = participants.find((p:any) => p.id === reserveParticipantId);
      if (!outgoing || !reserve) return Response.json({ error:'Outgoing player and team reserve are required.' }, { status:400 });
      if (['withdrawn','injured','replaced'].includes(outgoing.status)) return Response.json({ error:'Outgoing participant is already inactive.' }, { status:409 });
      if (reserve.side !== outgoing.side || (reserve.roster_role || 'rotation') !== 'reserve') return Response.json({ error:'The selected replacement is not a reserve for the same team.' }, { status:409 });
      if (['withdrawn','injured','replaced'].includes(reserve.status) || reserve.reserve_activated || Number(reserve.available_from_round || 1) > currentRound) return Response.json({ error:'That reserve is not currently available.' }, { status:409 });
      const sideKey = outgoing.side === 'club_a' ? 'club_a' : 'club_b';
      const idsKey = `${sideKey}_participant_ids`, namesKey = `${sideKey}_names`;
      const affected = normal.filter((m:any) => Number(m.round_number) >= currentRound && !TERMINAL.has(m.status) && (m[idsKey] || []).includes(outgoing.id));
      const conflict = normal.find((m:any) => Number(m.round_number) >= currentRound && !TERMINAL.has(m.status) && (m[idsKey] || []).includes(reserve.id));
      if (conflict) return Response.json({ error:`${reserve.display_name} already has a future fixture and cannot be activated as an unused reserve.` }, { status:409 });
      const status = ['withdrawn','injured'].includes(withdrawalStatus) ? withdrawalStatus : 'withdrawn';
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(outgoing.id, { status, replaced_by_participant_id:reserve.id, withdrawn_at:now, withdrawal_reason:String(reason || status) });
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(reserve.id, { reserve_activated:true, status:'active', available_from_round:currentRound, replacement_for_participant_id:outgoing.id, replacement_effective_round:currentRound });
      for (const m of affected) {
        const ids = [...(m[idsKey] || [])], names = [...(m[namesKey] || [])];
        const idx = ids.indexOf(outgoing.id);
        if (idx >= 0) { ids[idx] = reserve.id; names[idx] = reserve.display_name; }
        await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, { [idsKey]:ids, [namesKey]:names, revision:Number(m.revision||0)+1 });
      }
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'reserve_activated', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({participant_id:outgoing.id,name:outgoing.display_name}), new_value_json:JSON.stringify({reserve_participant_id:reserve.id,reserve_name:reserve.display_name,effective_round:currentRound,fixtures_changed:affected.length}), note:String(reason || 'Team reserve activated.') });
      return Response.json({ success:true, outgoingName:outgoing.display_name, incomingName:reserve.display_name, effectiveRound:currentRound, affected:affected.length, mode:'reserve' });
    }

    if (action === 'cover_existing') {
      const outgoing = participants.find((p:any) => p.id === outgoingParticipantId);
      const cover = participants.find((p:any) => p.id === coverParticipantId);
      if (!outgoing || !cover) return Response.json({ error:'Outgoing player and cover player are required.' }, { status:400 });
      if (outgoing.id === cover.id || outgoing.side !== cover.side) return Response.json({ error:'Cover must be a different player from the same team.' }, { status:409 });
      if (['withdrawn','injured','replaced'].includes(outgoing.status)) return Response.json({ error:'Outgoing participant is already inactive.' }, { status:409 });
      if (!['active','late'].includes(cover.status) || Number(cover.available_from_round || 1) > currentRound || ((cover.roster_role || 'rotation') === 'reserve' && !cover.reserve_activated)) return Response.json({ error:'Choose a rotation player who is available from the current round.' }, { status:409 });
      const sideKey = outgoing.side === 'club_a' ? 'club_a' : 'club_b';
      const idsKey = `${sideKey}_participant_ids`, namesKey = `${sideKey}_names`;
      const future = normal.filter((m:any) => Number(m.round_number) >= currentRound && !TERMINAL.has(m.status));
      const affected = future.filter((m:any) => (m[idsKey] || []).includes(outgoing.id)).sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number)||Number(a.court_number)-Number(b.court_number));
      const eligible = participants.filter((p:any) => p.side === outgoing.side && p.id !== outgoing.id && ['active','late'].includes(p.status) && ((p.roster_role || 'rotation') !== 'reserve' || p.reserve_activated));
      const assignmentCounts:any = {};
      for (const m of future) for (const id of (m[idsKey] || [])) assignmentCounts[id] = Number(assignmentCounts[id] || 0) + 1;
      const plan:any[] = [];
      for (const target of affected) {
        const round = Number(target.round_number);
        const roundMatches = future.filter((m:any) => Number(m.round_number) === round);
        const scheduled = new Set(roundMatches.flatMap((m:any) => m[idsKey] || []));
        let chosen:any = null;
        if (!scheduled.has(cover.id)) chosen = cover;
        else {
          const candidates = eligible.filter((p:any) => p.id !== cover.id && !scheduled.has(p.id) && Number(p.available_from_round || 1) <= round);
          candidates.sort((a:any,b:any) => Number(assignmentCounts[a.id] || 0) - Number(assignmentCounts[b.id] || 0) || Math.abs(Number(a.event_rank||999)-Number(outgoing.event_rank||999)) - Math.abs(Number(b.event_rank||999)-Number(outgoing.event_rank||999)) || String(a.display_name).localeCompare(String(b.display_name)));
          chosen = candidates[0] || null;
        }
        if (!chosen) return Response.json({ error:`No conflict-free cover arrangement is available for Round ${round}. Use a reserve or Continue Short for this situation.`, conflictRound:round }, { status:409 });
        plan.push({ match:target, chosen, primaryCover:chosen.id === cover.id });
        assignmentCounts[outgoing.id] = Math.max(0, Number(assignmentCounts[outgoing.id] || 0) - 1);
        assignmentCounts[chosen.id] = Number(assignmentCounts[chosen.id] || 0) + 1;
      }
      const status = ['withdrawn','injured'].includes(withdrawalStatus) ? withdrawalStatus : 'withdrawn';
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(outgoing.id, { status, covered_by_participant_id:cover.id, withdrawn_at:now, withdrawal_reason:String(reason || status) });
      const covering = Array.isArray(cover.covering_for_participant_ids) ? cover.covering_for_participant_ids.map(String) : [];
      if (!covering.includes(String(outgoing.id))) covering.push(String(outgoing.id));
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(cover.id, { covering_for_participant_ids:covering });
      for (const item of plan) {
        const m = item.match, ids = [...(m[idsKey] || [])], names = [...(m[namesKey] || [])];
        const idx = ids.indexOf(outgoing.id);
        if (idx >= 0) { ids[idx] = item.chosen.id; names[idx] = item.chosen.display_name; }
        await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, { [idsKey]:ids, [namesKey]:names, revision:Number(m.revision||0)+1 });
      }
      const primaryGames = plan.filter(x=>x.primaryCover).length;
      const rebalanced = plan.length - primaryGames;
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'existing_player_cover_applied', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({participant_id:outgoing.id,name:outgoing.display_name}), new_value_json:JSON.stringify({cover_participant_id:cover.id,cover_name:cover.display_name,effective_round:currentRound,fixtures_changed:plan.length,cover_games:primaryGames,rebalanced_conflicts:rebalanced}), note:String(reason || 'Existing rotation player used as cover with conflict-safe rebalance.') });
      return Response.json({ success:true, outgoingName:outgoing.display_name, incomingName:cover.display_name, effectiveRound:currentRound, affected:plan.length, coverGames:primaryGames, rebalanced, mode:'cover' });
    }

    if (action === 'continue_short') {
      const outgoing = participants.find((p:any) => p.id === outgoingParticipantId);
      if (!outgoing) return Response.json({ error:'Outgoing participant is required.' }, { status:400 });
      if (['withdrawn','injured','replaced'].includes(outgoing.status)) return Response.json({ error:'Participant is already inactive.' }, { status:409 });
      const status = ['withdrawn','injured'].includes(withdrawalStatus) ? withdrawalStatus : 'withdrawn';
      const affected = normal.filter((m:any) => Number(m.round_number) >= currentRound && !TERMINAL.has(m.status) && ([...(m.club_a_participant_ids||[]), ...(m.club_b_participant_ids||[])].includes(outgoing.id)));
      for (const m of affected) await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, { status:'not_played', winner:'none', revision:Number(m.revision||0)+1 });
      await base44.asServiceRole.entities.ClubChallengeParticipant.update(outgoing.id, { status, withdrawn_at:now, withdrawal_reason:String(reason || 'Continued short without replacement') });
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_withdrawn_no_replacement', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({participant_id:outgoing.id,name:outgoing.display_name}), new_value_json:JSON.stringify({effective_round:currentRound,matches_not_played:affected.length}), note:String(reason || 'Organiser chose to continue short.') });
      return Response.json({ success:true, outgoingName:outgoing.display_name, effectiveRound:currentRound, affected:affected.length });
    }

    const p = participants.find((x:any) => x.id === participantId);
    if (!p) return Response.json({ error:'Participant is required.' }, { status:400 });
    if (['withdrawn','injured','replaced'].includes(p.status)) return Response.json({ error:'Inactive participant cannot be marked as a late arrival.' }, { status:409 });
    const round = Math.max(currentRound, Number(fromRound || currentRound));
    if (!Number.isInteger(round) || round < 1) return Response.json({ error:'Valid available-from round required.' }, { status:400 });

    // A late-arrival flag must be reflected in the generated fixtures immediately.
    // Any unresolved match before the player's available round is impossible to play,
    // so remove it from playable status rather than leaving the host able to score it.
    // Historical/terminal results are never rewritten here.
    const unavailableFixtures = normal.filter((m:any) =>
      Number(m.round_number) >= currentRound
      && Number(m.round_number) < round
      && !TERMINAL.has(m.status)
      && ([...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])].includes(p.id))
    );
    for (const m of unavailableFixtures) {
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        status:'not_played',
        winner:'none',
        revision:Number(m.revision || 0) + 1,
      });
    }

    await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { status:'late', available_from_round:round });
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'late_arrival_set',
      user_id:user.id,
      occurred_at:now,
      new_value_json:JSON.stringify({participant_id:p.id,available_from_round:round,fixtures_not_played:unavailableFixtures.length}),
      note:unavailableFixtures.length
        ? `Late arrival enforced: ${unavailableFixtures.length} pre-arrival fixture${unavailableFixtures.length === 1 ? '' : 's'} marked not played.`
        : 'Late arrival recorded; no unresolved pre-arrival fixtures required changing.',
    });
    return Response.json({ success:true, participantName:p.display_name, fromRound:round, affected:unavailableFixtures.length });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected participant-management error' }, { status:500 });
  }
});