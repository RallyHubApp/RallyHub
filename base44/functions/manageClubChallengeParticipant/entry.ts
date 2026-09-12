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
    const { eventId, action, outgoingParticipantId, incomingName, incomingGender, reason, withdrawalStatus, participantId, fromRound, side, displayName, orderedParticipantIds } = body;
    if (!eventId || !['replace','continue_short','late_arrival','add_manual','reorder'].includes(action)) return Response.json({ error:'Invalid participant-management action.' }, { status:400 });

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
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const currentRound = Math.max(1, Number(event.current_round || 1));
    const now = new Date().toISOString();

    if (action === 'add_manual') {
      if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Players can only be added before the draw is approved.' }, { status:409 });
      if (!['club_a','club_b'].includes(side)) return Response.json({ error:'Valid club side required.' }, { status:400 });
      const cleanName = String(displayName || '').trim().replace(/\s+/g,' ').slice(0,120);
      if (!cleanName) return Response.json({ error:'Player name required.' }, { status:400 });
      const identity = cleanName.toLowerCase();
      if (participants.some((p:any) => ['active','late'].includes(p.status) && String(p.display_name||'').trim().toLowerCase().replace(/\s+/g,' ') === identity)) return Response.json({ error:'That player name is already active in this Interclub Challenge.' }, { status:409 });
      const sidePlayers = participants.filter((p:any) => p.side === side && !['replaced'].includes(p.status));
      const created = await base44.asServiceRole.entities.ClubChallengeParticipant.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, side, display_name:cleanName, event_rank:sidePlayers.length + 1, status:'active', available_from_round:1, unique_identity_key:`manual-${side}-${crypto.randomUUID().slice(0,12)}` });
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { fairness_json:'', status:event.status === 'draw_generated' ? 'draft' : event.status, event_pack_stale:true });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'participant_added_manual', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({participant_id:created.id,side,name:cleanName}) });
      return Response.json({ success:true, participant:created });
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
        event_rank:outgoing.event_rank, status:'active', available_from_round:currentRound,
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
    await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { status:'late', available_from_round:round });
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { event_pack_stale:true });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'late_arrival_set', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({participant_id:p.id,available_from_round:round}) });
    return Response.json({ success:true, participantName:p.display_name, fromRound:round });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected participant-management error' }, { status:500 });
  }
});