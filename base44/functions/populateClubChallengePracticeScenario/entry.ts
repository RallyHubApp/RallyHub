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
    const { eventId, mode = 'full_result' } = await req.json().catch(() => ({}));
    if (mode !== 'full_result') return Response.json({ error:'Unsupported practice scenario.' }, { status:400 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any)=>validTournamentEventGrant(a,event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any)=>validClubChallengeGrant(a,event.tenant_id));
      allowed = ta.some((a:any)=>['event_manager','event_host'].includes(a.role)) || ca.some((a:any)=>['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    if (participants.length < 8 || !participants.every((p:any)=>String(p.unique_identity_key || '').startsWith('gate3-'))) {
      return Response.json({ error:'Full practice population is restricted to the RallyHub dummy roster.' }, { status:409 });
    }
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const normal = matches.filter((m:any)=>!m.is_showcase).sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number)||Number(a.court_number)-Number(b.court_number));
    if (!normal.length) return Response.json({ error:'Generate and approve the practice draw first.' }, { status:409 });

    const now = new Date().toISOString();
    for (let i=0;i<normal.length;i++) {
      const m:any = normal[i];
      const clubAWins = i % 2 === 0;
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        status:'completed', score_a:clubAWins ? 11 : 8, score_b:clubAWins ? 8 : 11,
        winner:clubAWins ? 'club_a' : 'club_b', revision:Number(m.revision || 0) + 1,
        scored_by_user_id:user.id, scored_at:now,
      });
    }

    let showcase = matches.find((m:any)=>m.is_showcase) || null;
    if (event.showcase_enabled) {
      const a = participants.filter((p:any)=>p.side==='club_a' && ['active','late'].includes(p.status));
      const b = participants.filter((p:any)=>p.side==='club_b' && ['active','late'].includes(p.status));
      const aMale = a.find((p:any)=>String(p.gender||'').toLowerCase().startsWith('m')) || a[0];
      const aFemale = a.find((p:any)=>String(p.gender||'').toLowerCase().startsWith('f')) || a[1] || a[0];
      const bMale = b.find((p:any)=>String(p.gender||'').toLowerCase().startsWith('m')) || b[0];
      const bFemale = b.find((p:any)=>String(p.gender||'').toLowerCase().startsWith('f')) || b[1] || b[0];
      if (showcase) {
        await base44.asServiceRole.entities.ClubChallengeMatch.update(showcase.id, { status:'completed', score_a:15, score_b:13, winner:'club_a', revision:Number(showcase.revision||0)+1, scored_by_user_id:user.id, scored_at:now });
      } else {
        showcase = await base44.asServiceRole.entities.ClubChallengeMatch.create({
          tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, draw_version:Number(event.draw_version||1),
          round_number:Math.max(...normal.map((m:any)=>Number(m.round_number||0)))+1, court_number:1, match_number:normal.length+1,
          club_a_participant_ids:[aMale?.id,aFemale?.id].filter(Boolean), club_b_participant_ids:[bMale?.id,bFemale?.id].filter(Boolean),
          club_a_names:[aMale?.display_name,aFemale?.display_name].filter(Boolean), club_b_names:[bMale?.display_name,bFemale?.display_name].filter(Boolean),
          status:'completed', score_a:15, score_b:13, winner:'club_a', revision:1, correction_count:0, is_showcase:true, scored_by_user_id:user.id, scored_at:now,
        });
      }
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
        showcase_club_a_male_id:aMale?.id || '', showcase_club_a_female_id:aFemale?.id || '', showcase_club_b_male_id:bMale?.id || '', showcase_club_b_female_id:bFemale?.id || '',
      });
    }

    const existingVotes = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 200);
    for (const v of existingVotes) await base44.asServiceRole.entities.ClubChallengeVote.delete(v.id);
    let potWinnerId = '';
    let voteCount = 0;
    if (event.pot_enabled) {
      const eligible = participants.filter((p:any)=>['active','late'].includes(p.status));
      potWinnerId = eligible[0]?.id || '';
      const voters = eligible.filter((p:any)=>p.id !== potWinnerId).slice(0,8);
      for (const voter of voters) {
        await base44.asServiceRole.entities.ClubChallengeVote.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, voter_identity_key:`practice:${voter.id}`, voter_participant_id:voter.id, nominee_participant_id:potWinnerId, access_route:'guest', cast_at:now, valid:true });
        voteCount++;
      }
    }

    const maxRound = Math.max(...normal.map((m:any)=>Number(m.round_number||0)));
    const method = event.showcase_enabled ? 'showcase_final' : 'metrics';
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      status:'completed', current_round:maxRound, finalised_at:now,
      showcase_resolution_method:method, showcase_resolved_winner:'club_a',
      ...(event.pot_enabled ? { pot_status:'revealed', pot_winner_participant_ids:potWinnerId ? [potWinnerId] : [], pot_revealed_at:now } : {}),
      timer_state_json:JSON.stringify({ phase:'play', running:false, remaining_seconds:0, started_at:null, round:maxRound }), timer_revision:Number(event.timer_revision||0)+1,
    });
    await base44.asServiceRole.entities.Tournament.update(event.tournament_id, { status:'Completed', finalised_at:now });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'practice_full_result_populated', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({ normal_matches:normal.length, showcase:!!event.showcase_enabled, practice_votes:voteCount, winner:'club_a' }), note:'TEST MODE only — visual end-to-end population.' });
    return Response.json({ success:true, normalMatches:normal.length, showcase:!!event.showcase_enabled, practiceVotes:voteCount, winner:'club_a' });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected practice-scenario error' }, { status:500 });
  }
});
