import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, action, round, label } = body;
    if (!eventId || !['archive','reopen','set_round_label','approve_draw','start'].includes(action)) return Response.json({ error:'Invalid Interclub Challenge event action.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const now = new Date().toISOString();

    if (action === 'approve_draw') {
      if (event.status !== 'draw_generated') return Response.json({ error:'Only a generated draw can be approved.' }, { status:409 });
      const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
      if (!matches.length) return Response.json({ error:'No fixtures exist to approve.' }, { status:409 });
      let fairness:any = null;
      try { fairness = event.fairness_json ? JSON.parse(event.fairness_json) : null; } catch { fairness = null; }
      if (!fairness || fairness.duplicatePlayerRoundIssues || fairness.sameClubIntegrityIssues || fairness.equalGames !== true) return Response.json({ error:'Hard fairness checks must pass before approval.' }, { status:409 });
      const nextVersion = Number(event.draw_version || 0) + 1;
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'draw_approved', draw_version:nextVersion, draw_approved_at:now, draw_approved_by:user.id, event_pack_stale:false, event_pack_version:nextVersion, event_pack_generated_at:now });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'draw_approved', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({draw_version:nextVersion,match_count:matches.length}) });
      return Response.json({ success:true, event:updated });
    }

    if (action === 'start') {
      if (event.status !== 'draw_approved') return Response.json({ error:'Interclub Challenge draw must be approved before starting.' }, { status:409 });
      const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
      if (!matches.length) return Response.json({ error:'No approved fixtures found.' }, { status:409 });
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'in_progress', current_round:1 });
      await base44.asServiceRole.entities.Tournament.update(event.tournament_id, { status:'In Progress' });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_started', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({current_round:1,match_count:matches.length}) });
      return Response.json({ success:true, event:updated });
    }

    if (action === 'archive') {
      if (event.status !== 'completed') return Response.json({ error:'Only a completed Interclub Challenge can be archived.' }, { status:409 });
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'archived' });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_archived', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({status:'completed'}), new_value_json:JSON.stringify({status:'archived'}) });
      return Response.json({ success:true, event:updated });
    }

    if (action === 'reopen') {
      if (event.status !== 'archived') return Response.json({ error:'Only an archived Interclub Challenge can be reopened.' }, { status:409 });
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'completed' });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_reopened', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({status:'archived'}), new_value_json:JSON.stringify({status:'completed'}) });
      return Response.json({ success:true, event:updated });
    }

    const roundNumber = Number(round);
    if (!Number.isInteger(roundNumber) || roundNumber < 1) return Response.json({ error:'Valid round required.' }, { status:400 });
    const labels = (() => { try { return event.round_labels_json ? JSON.parse(event.round_labels_json) : {}; } catch { return {}; } })();
    const clean = String(label || '').trim().slice(0, 80);
    if (clean) labels[String(roundNumber)] = clean; else delete labels[String(roundNumber)];
    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { round_labels_json:JSON.stringify(labels) });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'round_label_updated', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({round:roundNumber,label:clean}) });
    return Response.json({ success:true, event:updated, round:roundNumber, label:clean });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected Interclub Challenge event-management error' }, { status:500 });
  }
});