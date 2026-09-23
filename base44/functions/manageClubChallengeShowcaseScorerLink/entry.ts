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
function token() { return `ccs_${crypto.randomUUID().replaceAll('-','')}`; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId } = body;
    if (!eventId) return Response.json({ error:'eventId required' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a,event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a,event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const match = matches.find((m:any) => m.is_showcase);
    if (!match) return Response.json({ error:'Create the Showcase Final first.' }, { status:409 });

    const existing = await base44.asServiceRole.entities.ClubChallengeShowcaseScoreToken.filter({ challenge_event_id:event.id, match_id:match.id, active:true }, '-created_at', 20);
    const now = new Date().toISOString();
    const row = existing?.[0] || await base44.asServiceRole.entities.ClubChallengeShowcaseScoreToken.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, match_id:match.id, token:token(), active:true, created_at:now
    });
    return Response.json({ success:true, token:row.token, matchId:match.id });
  } catch (error) {
    return Response.json({ error:error?.message || 'Could not prepare Showcase scorer link' }, { status:500 });
  }
});