import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const forbiddenTenantId = body.forbiddenTenantId;
    const forbiddenClubId = body.forbiddenClubId;
    const forbiddenPlayerId = body.forbiddenPlayerId;
    const results:any = { user: { id:user.id, email:user.email, role:user.role, active_tenant_id:user.active_tenant_id, active_club_id:user.active_club_id }, tests:{} };

    const probes = await base44.entities.SecurityTestProbe.list();
    results.tests.probe_list = { count: probes.length, labels: probes.map((p:any)=>p.label), pass: probes.every((p:any)=>p.tenant_id === user.active_tenant_id && p.club_id === user.active_club_id) };

    const players = await base44.entities.Player.list();
    results.tests.player_list = { count: players.length, testPlayers: players.filter((p:any)=>p.full_name?.includes('ISOLATION TEST')).map((p:any)=>({id:p.id,name:p.full_name,tenant_id:p.tenant_id,club_id:p.club_id})), pass: players.every((p:any)=>p.tenant_id === user.active_tenant_id && p.club_id === user.active_club_id) };

    if (forbiddenPlayerId) {
      try {
        const found = await base44.entities.Player.filter({ id: forbiddenPlayerId });
        results.tests.direct_forbidden_player_read = { returned: found.length, pass: found.length === 0 };
      } catch (e) { results.tests.direct_forbidden_player_read = { denied:true, pass:true, message:String(e) }; }
      try {
        await base44.entities.Player.update(forbiddenPlayerId, { notes: 'CROSS TENANT ATTACK SHOULD FAIL' });
        results.tests.direct_forbidden_player_update = { pass:false, unexpectedlyUpdated:true };
      } catch (e) { results.tests.direct_forbidden_player_update = { denied:true, pass:true, message:String(e) }; }
    }

    if (forbiddenTenantId && forbiddenClubId) {
      try {
        const created = await base44.entities.Player.create({ full_name:'CROSS TENANT SPOOF SHOULD FAIL', tenant_id:forbiddenTenantId, club_id:forbiddenClubId, status:'Active' });
        results.tests.creation_spoof = { pass:false, unexpectedlyCreated:created?.id };
      } catch (e) { results.tests.creation_spoof = { denied:true, pass:true, message:String(e) }; }
    }

    results.all_pass = Object.values(results.tests).every((t:any)=>t.pass === true);
    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});