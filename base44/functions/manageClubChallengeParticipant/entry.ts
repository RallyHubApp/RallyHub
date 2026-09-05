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
    const { eventId, action, outgoingParticipantId, incomingName, incomingGender, reason, withdrawalStatus, participantId, fromRound } = body;
    if (!eventId || !['replace','continue_short','late_arrival'].includes(action)) return Response.json({ error:'Invalid participant-management action.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });
    if (['completed','archived'].includes(event.status)) return Response.json({ error:'Finalised Club Challenge participants are read-only.' }, { status:409 });

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

    if (action === 'replace') {
      const outgoing = participants.find((p:any) => p.id === outgoingParticipantId);
      const cleanName = String(incomingName || '').trim();
      if (!outgoing || !cleanName) return Response.json({ error:'Outgoing participant and replacement name are required.' }, { status:400 });
      if (['withdrawn','injured','replaced'].includes(outgoing.status)) return Response.json({ error:'Outgoing participant is already inactive.' }, { status:409 });
      const identity = cleanName.toLowerCase().replace(/\s+/g,' ');
      if (participants.some((p:any) => p.id !== outgoing.id && ['active','late'].includes(p.status) && String(p.display_name||'').trim().toLowerCase().replace(/\s+/g,' ') === identity)) {
        return Response.json({ error:'That replacement name is already an active participant in this Club Challenge.' }, { status:409 });
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