import { validateTournivalStateTransition } from './tournivalStateValidation.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function activeNow(access:any) {
  if (!access || access.status !== 'active') return false;
  const now = Date.now();
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}

function clean(value:any, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

async function canManageTournament(base44:any, user:any, tournament:any) {
  if (user?.role === 'admin') return true;
  if (!user || user.approval_status !== 'approved') return false;

  const grants = await base44.asServiceRole.entities.TournamentUserAccess.filter({
    tournament_id: tournament.id,
    user_id: user.id,
    status: 'active',
  });
  if ((grants || []).some((g:any) => activeNow(g) && ['event_manager', 'event_host'].includes(g.role))) {
    return true;
  }

  const tenantAccess = await base44.asServiceRole.entities.TenantUserAccess.filter({
    tenant_id: tournament.tenant_id,
    user_id: user.id,
    status: 'active',
  });
  if ((tenantAccess || []).some((g:any) => activeNow(g) && ['owner', 'admin'].includes(g.role))) {
    return true;
  }

  if (tournament.host_club_id) {
    const clubAccess = await base44.asServiceRole.entities.ClubUserAccess.filter({
      tenant_id: tournament.tenant_id,
      club_id: tournament.host_club_id,
      user_id: user.id,
      status: 'active',
    });
    if ((clubAccess || []).some((g:any) => activeNow(g) && g.permission_bundle === 'club_admin')) {
      return true;
    }
  }

  return false;
}

async function audit(base44:any, user:any, tournament:any, action:string, after:any) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id: tournament.tenant_id || 'platform',
      club_id: tournament.host_club_id || undefined,
      user_id: user.id,
      action,
      entity_type: 'Tournament',
      entity_id: tournament.id,
      scope_type: 'tournament',
      scope_id: tournament.id,
      after_state: JSON.stringify(after),
      reason: 'legacy_tournament_manager',
    });
  } catch (error) {
    console.warn('legacyTournamentManager audit failed', (error as any)?.message || error);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tournamentId = clean(body.tournamentId, 100);
    const action = clean(body.action, 40);
    if (!tournamentId || !action) {
      return Response.json({ error: 'tournamentId and action are required' }, { status: 400 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments?.[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });

    if (!(await canManageTournament(base44, user, tournament))) {
      return Response.json({ error: 'Forbidden: tournament management access required' }, { status: 403 });
    }

    if (action === 'get_state' && String(tournament.format).toLowerCase()==='tournival') {
      const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
        tournament_id:tournament.id,tenant_id:tournament.tenant_id
      },'-created_at',5);
      if(sessions?.length>1)return Response.json({error:'Multiple Tournival sessions detected; administrator reconciliation required'},{status:409});
      const session=sessions?.[0];
      const playerIds=Array.isArray(tournament.player_ids)?tournament.player_ids:[];
      const players=playerIds.length?await base44.asServiceRole.entities.Player.filter({
        tenant_id:tournament.tenant_id
      },'-created_date',500):[];
      return Response.json({success:true,tournament:{
        ...tournament,tournival_state:session?.state_json||tournament.tournival_state
      },players:(players||[]).filter((p:any)=>playerIds.includes(p.id)).map((p:any)=>({
        id:p.id,full_name:p.full_name,skill_rating:p.skill_rating,avatar_url:p.avatar_url
      }))});
    }

    if (action === 'get_state') {
      const playerIds = Array.isArray(tournament.player_ids) ? tournament.player_ids : [];
      const clubs = tournament.host_club_id ? await base44.asServiceRole.entities.Club.filter({ id:tournament.host_club_id }) : [];
      const club = clubs?.[0] || null;
      const clubBrand = club ? { id:club.id, name:club.name, logo_url:club.logo_url || '', primary_colour:club.primary_colour || '', secondary_colour:club.secondary_colour || '' } : null;
      let players:any[] = [];
      if (playerIds.length) {
        const tenantPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id: tournament.tenant_id });
        players = (tenantPlayers || [])
          .filter((p:any) => playerIds.includes(p.id))
          .map((p:any) => ({ id: p.id, full_name: p.full_name, skill_rating: p.skill_rating, avatar_url: p.avatar_url }));
      }
      return Response.json({ success: true, tournament, players, club_brand:clubBrand });
    }

    if (action === 'tournival_registrations') {
      if (String(tournament.format).toLowerCase() !== 'tournival')
        return Response.json({error:'Not a Tournival tournament'},{status:400});
      const registrations=await base44.asServiceRole.entities.TournivalRegistration.filter({
        tournament_id:tournament.id,tenant_id:tournament.tenant_id
      },'-registered_at',500);
      return Response.json({success:true,registrations:(registrations||[]).map((r:any)=>({
        id:r.id,playerId:r.player_id,name:r.full_name,email:r.email,mobile:r.mobile,
        status:r.registration_status,paymentStatus:r.payment_status,
        amountDue:r.amount_due,waitlistPosition:r.waitlist_position||null,
        checkedIn:!!r.checked_in_at,registeredAt:r.registered_at
      }))});
    }
    if (action === 'tournival_check_in') {
      if (String(tournament.format).toLowerCase() !== 'tournival')
        return Response.json({error:'Not a Tournival tournament'},{status:400});
      const registrationId=clean(body.registrationId,120);
      const rows=await base44.asServiceRole.entities.TournivalRegistration.filter({
        id:registrationId,tournament_id:tournament.id,tenant_id:tournament.tenant_id
      },'-registered_at',5);
      const row=rows?.[0];
      if(!row||row.registration_status!=='confirmed'||
        !['paid','not_required','simulated'].includes(row.payment_status))
        return Response.json({error:'Check-in requires a confirmed, payment-complete registration'},{status:409});
      const checkedIn=body.checkedIn!==false;
      await base44.asServiceRole.entities.TournivalRegistration.update(row.id,{
        checked_in_at:checkedIn?new Date().toISOString():''
      });
      await audit(base44,user,tournament,'tournival_check_in',{registrationId,checkedIn});
      return Response.json({success:true,checkedIn});
    }
    if (action === 'tournival_withdraw') {
      if (String(tournament.format).toLowerCase() !== 'tournival')
        return Response.json({error:'Not a Tournival tournament'},{status:400});
      const registrationId=clean(body.registrationId,120),reason=clean(body.reason,240);
      if(reason.length<3)return Response.json({error:'Withdrawal reason is required'},{status:400});
      const rows=await base44.asServiceRole.entities.TournivalRegistration.filter({
        id:registrationId,tournament_id:tournament.id,tenant_id:tournament.tenant_id
      },'-registered_at',5);
      const row=rows?.[0];
      if(!row)return Response.json({error:'Registration not found'},{status:404});
      if(row.registration_status==='withdrawn')return Response.json({success:true,duplicate:true});
      const withdrew=await base44.asServiceRole.entities.TournivalRegistration.updateMany({
        id:row.id,tenant_id:tournament.tenant_id,
        registration_status:row.registration_status
      },{$set:{registration_status:'withdrawn',checked_in_at:'',
        withdrawn_at:new Date().toISOString()}});
      if(withdrew.updated!==1)return Response.json({
        error:'Registration changed during withdrawal. Refresh before retrying.'
      },{status:409});
      // Release exactly one reserved capacity unit for a previously confirmed
      // or pending-payment registration, never for a waitlisted entry.
      if(['confirmed','pending_payment'].includes(row.registration_status)){
        const released=await base44.asServiceRole.entities.Tournament.updateMany({
          id:tournament.id,tenant_id:tournament.tenant_id,
          tournival_reserved_count:{$gt:0}
        },{$inc:{tournival_reserved_count:-1}});
        if(released.updated!==1)console.error('Tournival capacity counter requires reconciliation',tournament.id);
      }
      // Played matches are NEVER redrawn or deleted as a consequence.
      const raw=tournament.tournival_state;
      let state:any=null;
      try{state=typeof raw==='string'?JSON.parse(raw):raw}catch{}
      if(!state?.rounds?.length){
        await base44.asServiceRole.entities.Tournament.updateMany({
          id:tournament.id,tenant_id:tournament.tenant_id
        },{$pull:{player_ids:row.player_id}});
      }
      await audit(base44,user,tournament,'tournival_withdrawal',{
        registrationId,playerId:row.player_id,reason,requiresRefund:row.payment_status==='paid'
      });
      return Response.json({success:true,requiresRefund:row.payment_status==='paid',
        message:'Registration withdrawn. Any payment refund must be reviewed separately.'});
    }

    if (action === 'register_player') {
      const fullName = clean(body.full_name, 120);
      const email = clean(body.email, 200).toLowerCase();
      const phone = clean(body.phone, 50);
      if (!fullName) return Response.json({ error: 'Player name is required' }, { status: 400 });

      let player:any = null;
      if (email) {
        const existing = await base44.asServiceRole.entities.Player.filter({ email, tenant_id: tournament.tenant_id });
        player = existing?.[0] || null;
      }
      if (!player) {
        player = await base44.asServiceRole.entities.Player.create({
          full_name: fullName,
          email: email || undefined,
          phone: phone || undefined,
          status: 'Active',
          tenant_id: tournament.tenant_id,
          club_id: tournament.host_club_id || undefined,
          relationship_type: 'guest',
          relationship_status: 'active',
        });
      }

      const current = Array.isArray(tournament.player_ids) ? tournament.player_ids : [];
      if (!current.includes(player.id)) {
        const next = [...current, player.id];
        if (next.length > 200) return Response.json({ error: 'Tournament roster limit reached' }, { status: 400 });
        await base44.asServiceRole.entities.Tournament.update(tournament.id, { player_ids: next });
        await audit(base44, user, tournament, 'legacy_tournament_player_added', { player_id: player.id, player_count: next.length });
      }
      return Response.json({ success: true, player: { id: player.id, full_name: player.full_name } });
    }

    if (action === 'create_tournival_host_link') {
      if (String(tournament.format).toLowerCase() !== 'tournival')
        return Response.json({error:'Not a Tournival tournament'},{status:400});
      const random=crypto.getRandomValues(new Uint8Array(24));
      const token='th_'+Array.from(random,b=>b.toString(16).padStart(2,'0')).join('');
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
      const tokenHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      const expiresAt=new Date(Date.now()+72*60*60*1000).toISOString();
      await base44.asServiceRole.entities.TournivalAccessToken.create({
        tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
        tournament_id:tournament.id,token_hash:tokenHash,token_type:'host',
        created_at:new Date().toISOString(),expires_at:expiresAt,created_by_user_id:user.id
      });
      await audit(base44,user,tournament,'tournival_delegated_host_link_created',{expiresAt});
      return Response.json({success:true,path:`/tournival/host/${token}`,expiresAt});
    }
    if (action === 'revoke_tournival_host_links') {
      if(String(tournament.format).toLowerCase()!=='tournival')
        return Response.json({error:'Not a Tournival tournament'},{status:400});
      const links=await base44.asServiceRole.entities.TournivalAccessToken.filter({
        tournament_id:tournament.id,tenant_id:tournament.tenant_id,token_type:'host'
      },'-created_at',100);
      const now=new Date().toISOString();
      for(const link of links||[])if(!link.revoked_at)
        await base44.asServiceRole.entities.TournivalAccessToken.update(link.id,{revoked_at:now});
      await audit(base44,user,tournament,'tournival_delegated_host_links_revoked',{count:(links||[]).length});
      return Response.json({success:true,revoked:(links||[]).length});
    }

    // Issue an opaque, revocable registration link. Only the SHA-256 digest is stored.
    if (action === 'create_tournival_registration_link') {
      if (String(tournament.format).toLowerCase() !== 'tournival')
        return Response.json({ error:'Not a Tournival tournament' }, { status:400 });
      const random = crypto.getRandomValues(new Uint8Array(24));
      const token='trn_'+Array.from(random,b=>b.toString(16).padStart(2,'0')).join('');
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
      const tokenHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      const expiresAt=new Date(Date.now()+1000*60*60*24*30).toISOString();
      await base44.asServiceRole.entities.TournivalAccessToken.create({
        tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
        tournament_id:tournament.id,token_hash:tokenHash,token_type:'registration',
        created_at:new Date().toISOString(),expires_at:expiresAt,created_by_user_id:user.id
      });
      await audit(base44,user,tournament,'tournival_registration_link_created',{expiresAt});
      return Response.json({success:true,path:`/tournival/register/${token}`,expiresAt});
    }

    // Independent Tournival transport; never writes the KOTC sporting state.
    // The existing manager's authenticated access checks apply above.
    if (action === 'update_tournival') {
      if (String(tournament.format).toLowerCase() !== 'tournival') {
        return Response.json({ error: 'Not a Tournival tournament' }, { status: 400 });
      }
      if (typeof body.tournival_state !== 'string' || body.tournival_state.length > 1_000_000) {
        return Response.json({ error: 'Invalid Tournival state payload' }, { status: 400 });
      }
      let next:any;
      try { next = JSON.parse(body.tournival_state); }
      catch { return Response.json({ error: 'Invalid Tournival JSON' }, { status: 400 }); }
      if (!next || typeof next !== 'object' || !Array.isArray(next.rounds) ||
          !Number.isInteger(next.numRounds) || next.numRounds < 2 || next.numRounds > 6 ||
          !Number.isInteger(next.numCourts) || next.numCourts < 1 || next.numCourts > 16) {
        return Response.json({ error: 'Invalid Tournival sporting configuration' }, { status: 400 });
      }
      const sessions=await base44.asServiceRole.entities.TournivalSession.filter({
        tournament_id:tournament.id,tenant_id:tournament.tenant_id
      },'-created_at',5);
      if(sessions?.length>1)return Response.json({error:'Multiple Tournival sessions; no updates accepted'},{status:409});
      const session=sessions?.[0];
      const currentRaw = session?.state_json || tournament.tournival_state;
      const current = currentRaw ? (typeof currentRaw === 'string' ? JSON.parse(currentRaw) : currentRaw) : null;
      const expectedRevision = Number(body.expectedRevision);
      const operationId = clean(body.operationId,120);
      if (!Number.isInteger(expectedRevision) || expectedRevision < 0 || !operationId) {
        return Response.json({ error: 'Tournival revision and operation ID required' }, { status: 400 });
      }
      if (current?.lastOperationId === operationId) {
        if(tournament.tournival_state!==JSON.stringify(current)){
          await base44.asServiceRole.entities.Tournament.update(tournament.id,{
            tournival_state:JSON.stringify(current)
          });
        }
        return Response.json({ success: true, duplicate: true, revision: current.revision || 0 });
      }
      if (Number(current?.revision || 0) !== expectedRevision) {
        return Response.json({ error: 'Stale Tournival state. Refresh and reconcile before retrying.', currentRevision: current?.revision || 0 }, { status: 409 });
      }
      const transition=validateTournivalStateTransition(current,next,{
        playerIds:Array.isArray(tournament.player_ids)?tournament.player_ids:[],
        correctionReason:clean(body.correctionReason,500)
      });
      if(!transition.valid)return Response.json({error:(transition as any).error},{status:409});
      next.revision = expectedRevision + 1;
      next.lastOperationId = operationId;

      if (current?.rounds?.length && JSON.stringify(next.rounds) !== JSON.stringify(current.rounds)) {
        const recorded = Object.values(current.results || {}).some((round:any) => Object.keys(round || {}).length);
        if (recorded) return Response.json({ error: 'Draw cannot be replaced after results are recorded' }, { status: 409 });
      }
      const permittedStatus = ['Draft', 'Registration Open', 'In Progress', 'Completed', 'Cancelled'];
      const mappedStatus = body.status === 'Group Complete' ? 'In Progress' : body.status;
      if (mappedStatus !== undefined && !permittedStatus.includes(mappedStatus)) {
        return Response.json({ error: 'Invalid tournament status' }, { status: 400 });
      }
      const now=new Date().toISOString();
      if(session){
        const saved=await base44.asServiceRole.entities.TournivalSession.updateMany({
          id:session.id,tenant_id:tournament.tenant_id,state_revision:expectedRevision
        },{$set:{
          state_json:JSON.stringify(next),state_revision:next.revision,
          last_operation_id:operationId,updated_at:now,
          status:mappedStatus||session.status||'draft'
        }});
        if(saved.updated!==1)return Response.json({
          error:'Another host saved this revision first; refresh and retry',
          currentRevision:expectedRevision
        },{status:409});
      }else{
        await base44.asServiceRole.entities.TournivalSession.create({
          tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
          tournament_id:tournament.id,status:mappedStatus||'draft',rehearsal:false,
          num_courts:next.numCourts,qualification_rounds:next.numRounds,
          scoring_format:next.matchFormat,venue_minutes:next.venueMinutes||120,
          match_minutes:next.matchMinutes||18,changeover_minutes:next.changeoverMinutes||3,
          capacity:tournament.max_players||32,registration_fee:tournament.event_fee_amount||0,
          dupr_enabled:!!next.duprEnabled,
          state_json:JSON.stringify(next),state_revision:next.revision,
          last_operation_id:operationId,created_at:now,updated_at:now
        });
      }
      // Backwards-compatible projection only. TournivalSession is the
      // authoritative sporting record; a failed projection can be repaired.
      await base44.asServiceRole.entities.Tournament.update(tournament.id, {
        tournival_state: JSON.stringify(next),
        ...(mappedStatus === undefined ? {} : { status: mappedStatus }),
      });
      await audit(base44, user, tournament, 'tournival_state_updated', {
        correctionReason:clean(body.correctionReason,500)||undefined,
        rounds: next.numRounds, courts: next.numCourts, currentRound: next.currentRound,
        status: mappedStatus || tournament.status,
      });
      return Response.json({ success: true });
    }

    if (action === 'update_kotc' || action === 'start_kotc') {
      const updateData:any = {};

      if (body.kotc_state !== undefined) {
        const state = String(body.kotc_state);
        if (state.length > 1_000_000) return Response.json({ error: 'Session state is too large' }, { status: 400 });
        try { JSON.parse(state); } catch { return Response.json({ error: 'Invalid session state' }, { status: 400 }); }
        updateData.kotc_state = state;
      }
      if (body.kotc_current_round !== undefined) {
        const value = Number(body.kotc_current_round);
        if (!Number.isInteger(value) || value < 0 || value > 200) return Response.json({ error: 'Invalid current round' }, { status: 400 });
        updateData.kotc_current_round = value;
      }
      if (body.kotc_num_courts !== undefined) {
        const value = Number(body.kotc_num_courts);
        if (!Number.isInteger(value) || value < 1 || value > 16) return Response.json({ error: 'Invalid number of courts' }, { status: 400 });
        updateData.kotc_num_courts = value;
      }
      if (body.kotc_num_rounds !== undefined) {
        const value = Number(body.kotc_num_rounds);
        if (!Number.isInteger(value) || value < 1 || value > 100) return Response.json({ error: 'Invalid number of rounds' }, { status: 400 });
        updateData.kotc_num_rounds = value;
      }
      if (body.kotc_score_format !== undefined) {
        updateData.kotc_score_format = clean(body.kotc_score_format, 50);
      }
      if (body.status !== undefined) {
        const requested = clean(body.status, 40);
        const mapped = requested === 'Group Complete' ? 'In Progress' : requested;
        if (!['Draft', 'Registration Open', 'In Progress', 'Completed', 'Cancelled'].includes(mapped)) {
          return Response.json({ error: 'Invalid tournament status' }, { status: 400 });
        }
        updateData.status = mapped;
      }
      if (body.player_ids !== undefined) {
        if (!Array.isArray(body.player_ids) || body.player_ids.length > 200 || body.player_ids.some((id:any) => typeof id !== 'string')) {
          return Response.json({ error: 'Invalid player roster' }, { status: 400 });
        }
        const tenantPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id: tournament.tenant_id });
        const validIds = new Set((tenantPlayers || []).map((p:any) => p.id));
        const guestIds = new Set((tournament.kotc_guest_roster || []).map((g:any) => g.guest_id));
        if (body.player_ids.some((id:string) => !validIds.has(id) && !guestIds.has(id))) {
          return Response.json({ error: 'Roster contains a player outside this tournament tenant' }, { status: 400 });
        }
        updateData.player_ids = [...new Set(body.player_ids)];
      }

      if (!Object.keys(updateData).length) {
        return Response.json({ error: 'No permitted tournament fields supplied' }, { status: 400 });
      }

      await base44.asServiceRole.entities.Tournament.update(tournament.id, updateData);
      await audit(base44, user, tournament, action === 'start_kotc' ? 'legacy_tournament_started' : 'legacy_tournament_updated', updateData);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('legacyTournamentManager error', (error as any)?.message || error);
    return Response.json({ error: 'Unable to process the tournament request right now.' }, { status: 500 });
  }
});
