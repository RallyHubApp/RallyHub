import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function token() { return `ccr_${crypto.randomUUID().replaceAll('-','')}`; }

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
    const eventId = String(body.eventId || '').trim();
    const side = String(body.side || '').trim();
    if (!eventId || !['club_a','club_b'].includes(side)) {
      return Response.json({ error:'eventId and team side are required.' }, { status:400 });
    }

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub event not found.' }, { status:404 });
    if (['completed','archived'].includes(event.status)) return Response.json({ error:'Registration links are closed for this event.' }, { status:409 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({
        tournament_id:event.tournament_id, user_id:user.id, status:'active'
      })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({
        challenge_event_id:event.id, user_id:user.id, active:true
      })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) ||
        ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required.' }, { status:403 });

    const existing = await base44.asServiceRole.entities.InterclubRegistrationToken.filter({
      challenge_event_id:event.id, side, active:true
    }, '-created_at', 10);
    const now = new Date().toISOString();
    const row = existing?.[0] || await base44.asServiceRole.entities.InterclubRegistrationToken.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      tournament_id:event.tournament_id,
      side,
      token:token(),
      active:true,
      created_by_user_id:user.id,
      created_at:now,
    });

    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'guest_registration_link_issued',
      user_id:user.id,
      occurred_at:now,
      new_value_json:JSON.stringify({ registration_token_id:row.id, side }),
      note:`Guest player registration link prepared for ${side === 'club_a' ? event.club_a_name : event.club_b_name}.`,
    });

    return Response.json({
      success:true,
      token:row.token,
      side,
      teamName:side === 'club_a' ? event.club_a_name : event.club_b_name,
    });
  } catch (error) {
    console.error('manageInterclubRegistrationLink failed', error?.message || error);
    return Response.json({ error:error?.message || 'Could not prepare the registration link.' }, { status:500 });
  }
});
