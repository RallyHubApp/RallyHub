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
function secureRandomIndex(length:number) {
  if (length <= 1) return 0;
  const range = 0x100000000;
  const limit = Math.floor(range / length) * length;
  const values = new Uint32Array(1);
  let value = range;
  while (value >= limit) { crypto.getRandomValues(values); value = values[0]; }
  return value % length;
}
function parseWinners(raw:any) {
  try { const v = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? v : []; } catch { return []; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.eventId || '');
    const action = String(body.action || '');
    if (!eventId || !['configure','begin_draw','complete_draw','reset'].includes(action)) return Response.json({ error:'Invalid spot-prize request.' }, { status:400 });

    const event = (await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId }))?.[0];
    if (!event) return Response.json({ error:'Interclub event not found.' }, { status:404 });
    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a,event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a,event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required.' }, { status:403 });
    if (event.status === 'archived') return Response.json({ error:'Archived events cannot change the spot-prize draw.' }, { status:409 });

    const rows = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.filter({ challenge_event_id:event.id }, '-updated_date', 5);
    let draw = rows?.[0] || null;
    const nowIso = new Date().toISOString();

    if (action === 'configure') {
      const enabled = body.enabled === true;
      const mode = body.mode === 'per_team' ? 'per_team' : 'all_players';
      const max = mode === 'per_team' ? 8 : 16;
      const prizeCount = Math.max(1, Math.min(max, Math.floor(Number(body.prizeCount || 2))));
      if (enabled && event.pot_status === 'open') return Response.json({ error:'Close Player Vote before switching this event to a Spot Prize Draw.' }, { status:409 });
      const payload:any = {
        tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id,
        enabled, mode, prize_count:prizeCount, updated_by_user_id:user.id,
      };
      if (!draw) {
        draw = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.create({ ...payload, status:'ready', winners_json:'[]', pending_winner_json:null, draw_started_at:null, draw_count:0, revision:0, created_by_user_id:user.id, last_drawn_at:null });
      } else {
        const winners = parseWinners(draw.winners_json);
        const configChanged = draw.mode !== mode || Number(draw.prize_count || 0) !== prizeCount || !!draw.enabled !== enabled;
        if (configChanged && winners.length) {
          payload.status='ready'; payload.winners_json='[]'; payload.pending_winner_json=null; payload.draw_started_at=null; payload.draw_count=0; payload.last_drawn_at=null;
        }
        payload.revision=Number(draw.revision||0)+1;
        draw = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.update(draw.id,payload);
      }
      if (enabled) await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id,{ pot_enabled:false, pot_method:'none', pot_status:'disabled', pot_winner_participant_ids:[], pot_revealed_at:null, pot_vote_opened_at:null, pot_vote_closes_at:null, pot_vote_duration_minutes:null });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'spot_prize_configured', user_id:user.id, occurred_at:nowIso, new_value_json:JSON.stringify({enabled,mode,prize_count:prizeCount}), note:'Spot-prize draw is independent of sporting results and uses the eligible event roster only.' });
      return Response.json({ success:true, draw });
    }

    if (!draw || !draw.enabled) return Response.json({ error:'Spot-prize draw is not enabled.' }, { status:409 });
    if (action === 'reset') {
      draw = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.update(draw.id,{ status:'ready', winners_json:'[]', pending_winner_json:null, draw_started_at:null, draw_count:0, revision:Number(draw.revision||0)+1, updated_by_user_id:user.id, last_drawn_at:null });
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'spot_prize_reset', user_id:user.id, occurred_at:nowIso, note:'Spot-prize winners cleared by host.' });
      return Response.json({ success:true, draw, winners:[] });
    }

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 150);
    const eligible = participants.filter((p:any) => ['club_a','club_b'].includes(p.side) && ['active','late'].includes(p.status) && ((p.roster_role || 'rotation') !== 'reserve' || p.reserve_activated));
    const sortSide = (side:string) => eligible.filter((p:any)=>p.side===side).sort((a:any,b:any)=>Number(a.event_rank||999)-Number(b.event_rank||999)||String(a.display_name||'').localeCompare(String(b.display_name||'')));
    const teamA = sortSide('club_a'), teamB = sortSide('club_b');
    const all = [...teamA,...teamB];
    const winners = parseWinners(draw.winners_json);
    const maxPulls = draw.mode === 'per_team' ? Number(draw.prize_count||1)*2 : Number(draw.prize_count||1);

    if (action === 'begin_draw') {
      if (winners.length >= maxPulls || draw.status === 'completed') return Response.json({ error:'Spot Prize Draw is complete.', complete:true, draw, winners }, { status:409 });
      if (draw.status === 'drawing' && draw.pending_winner_json) return Response.json({ success:true, draw, drawing:true, pending:true, maxPulls });
      const targetSide = draw.mode === 'per_team' ? (winners.length % 2 === 0 ? 'club_a' : 'club_b') : null;
      const poolBase = targetSide === 'club_a' ? teamA : targetSide === 'club_b' ? teamB : all;
      const usedIds = new Set(winners.map((w:any)=>String(w.participant_id)));
      const pool = poolBase.filter((p:any)=>!usedIds.has(String(p.id)));
      if (!pool.length) return Response.json({ error:'No eligible players remain in this draw pool.' }, { status:409 });
      const selected:any = pool[secureRandomIndex(pool.length)];
      const teamList = selected.side === 'club_a' ? teamA : teamB;
      const teamNumber = Math.max(1, teamList.findIndex((p:any)=>p.id===selected.id)+1);
      const allNumber = Math.max(1, all.findIndex((p:any)=>p.id===selected.id)+1);
      const pendingWinner = {
        pull:winners.length+1,
        participant_id:selected.id,
        display_name:selected.display_name,
        side:selected.side,
        team_name:selected.side==='club_a'?event.club_a_name:event.club_b_name,
        number:draw.mode==='per_team'?teamNumber:allNumber,
        drawn_at:nowIso,
      };
      draw = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.update(draw.id,{ status:'drawing', pending_winner_json:JSON.stringify(pendingWinner), draw_started_at:nowIso, revision:Number(draw.revision||0)+1, updated_by_user_id:user.id });
      return Response.json({ success:true, draw, drawing:true, maxPulls });
    }

    if (draw.status !== 'drawing' || !draw.pending_winner_json) return Response.json({ error:'No spot-prize draw is currently in progress.' }, { status:409 });
    const winner = parseWinners(`[${draw.pending_winner_json}]`)[0];
    if (!winner) return Response.json({ error:'Pending spot-prize winner is invalid. Reset the draw and try again.' }, { status:409 });
    const nextWinners = [...winners,winner];
    const complete = nextWinners.length >= maxPulls;
    draw = await base44.asServiceRole.entities.ClubChallengeSpotPrizeDraw.update(draw.id,{ status:complete?'completed':'in_progress', winners_json:JSON.stringify(nextWinners), pending_winner_json:null, draw_started_at:null, draw_count:nextWinners.length, revision:Number(draw.revision||0)+1, updated_by_user_id:user.id, last_drawn_at:nowIso });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'spot_prize_drawn', user_id:user.id, occurred_at:nowIso, new_value_json:JSON.stringify(winner), note:`Spot Prize ${winner.pull} drawn server-side from the eligible event roster.` });
    return Response.json({ success:true, draw, winner, winners:nextWinners, complete, maxPulls });
  } catch (error) {
    console.error('manageClubChallengeSpotPrizeDraw failed', error);
    return Response.json({ error:error?.message || 'Unable to manage spot-prize draw.' }, { status:500 });
  }
});