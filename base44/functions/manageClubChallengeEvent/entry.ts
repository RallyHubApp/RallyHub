import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, action, round, label } = body;
    if (!eventId || !['archive','reopen','set_round_label'].includes(action)) return Response.json({ error:'Invalid Club Challenge event action.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' });
      const ca = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true });
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const now = new Date().toISOString();
    if (action === 'archive') {
      if (event.status !== 'completed') return Response.json({ error:'Only a completed Club Challenge can be archived.' }, { status:409 });
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'archived' });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_archived', user_id:user.id, occurred_at:now, old_value_json:JSON.stringify({status:'completed'}), new_value_json:JSON.stringify({status:'archived'}) });
      return Response.json({ success:true, event:updated });
    }

    if (action === 'reopen') {
      if (event.status !== 'archived') return Response.json({ error:'Only an archived Club Challenge can be reopened.' }, { status:409 });
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
    return Response.json({ error:error?.message || 'Unexpected Club Challenge event-management error' }, { status:500 });
  }
});