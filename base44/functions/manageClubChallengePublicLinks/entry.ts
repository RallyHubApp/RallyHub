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

function token(prefix:string) { return `${prefix}_${crypto.randomUUID().replaceAll('-','')}`; }
function voterCode() { return crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase(); }

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
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const existingDisplay = await base44.asServiceRole.entities.ClubChallengeDisplayToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 20);
    const existingVoting = await base44.asServiceRole.entities.ClubChallengeVotingToken.filter({ challenge_event_id:event.id, active:true }, '-created_at', 20);
    const now = new Date().toISOString();
    const display = existingDisplay?.[0] || await base44.asServiceRole.entities.ClubChallengeDisplayToken.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, token:token('ccd'), active:true, created_at:now });
    const voting = existingVoting?.[0] || await base44.asServiceRole.entities.ClubChallengeVotingToken.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, token:token('ccv'), active:true, created_at:now });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const voterCodes:any[] = [];
    for (const p of participants) {
      if (!['active','late'].includes(p.status)) continue;
      let code = p.guest_access_token;
      if (!code) {
        code = voterCode();
        await base44.asServiceRole.entities.ClubChallengeParticipant.update(p.id, { guest_access_token:code });
      }
      voterCodes.push({ participantId:p.id, displayName:p.display_name, side:p.side, code });
    }

    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'public_links_issued', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({ display_token_id:display.id, voting_token_id:voting.id, voter_codes:voterCodes.length }), note:'Public Hall Display and POT voting links prepared.' });
    return Response.json({ success:true, displayToken:display.token, votingToken:voting.token, voterCodes });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected public-link error' }, { status:500 });
  }
});