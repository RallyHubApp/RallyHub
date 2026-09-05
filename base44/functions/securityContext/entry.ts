import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function isCurrentlyValid(access) {
  if (!access || access.status !== 'active') return false;
  const now = Date.now();
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.approval_status !== 'approved') {
      return Response.json({ error: 'Account approval required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action = 'resolve_default', tenantId, clubId } = body;

    const clubAccesses = (await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: user.id }))
      .filter(isCurrentlyValid);
    const tenantAccesses = (await base44.asServiceRole.entities.TenantUserAccess.filter({ user_id: user.id }))
      .filter(isCurrentlyValid);

    if (action === 'clear') {
      await base44.asServiceRole.entities.User.update(user.id, {
        active_tenant_id: null,
        active_club_id: null,
        active_tenant_role: null,
        active_club_role: null,
        security_context_updated_at: new Date().toISOString(),
      });
      return Response.json({ success: true, cleared: true });
    }

    let selectedClubAccess = null;
    if (action === 'activate') {
      if (!tenantId || !clubId) return Response.json({ error: 'tenantId and clubId required' }, { status: 400 });
      selectedClubAccess = clubAccesses.find(a => a.tenant_id === tenantId && a.club_id === clubId) || null;
      if (!selectedClubAccess) return Response.json({ error: 'No active access to requested club' }, { status: 403 });
    } else {
      const current = clubAccesses.find(a => a.tenant_id === user.active_tenant_id && a.club_id === user.active_club_id);
      selectedClubAccess = current || (clubAccesses.length === 1 ? clubAccesses[0] : null);
      if (!selectedClubAccess) {
        return Response.json({
          success: true,
          requires_selection: clubAccesses.length > 1,
          options: clubAccesses.map(a => ({ tenant_id: a.tenant_id, club_id: a.club_id, permission_bundle: a.permission_bundle })),
        });
      }
    }

    const [clubs, tenants] = await Promise.all([
      base44.asServiceRole.entities.Club.filter({ id: selectedClubAccess.club_id }),
      base44.asServiceRole.entities.Tenant.filter({ id: selectedClubAccess.tenant_id }),
    ]);
    const club = clubs[0];
    const tenant = tenants[0];
    if (!club || club.status !== 'active' || !tenant || tenant.status !== 'active' || club.tenant_id !== tenant.id) {
      return Response.json({ error: 'Tenant or club is not active' }, { status: 403 });
    }

    const tenantAccess = tenantAccesses.find(a => a.tenant_id === selectedClubAccess.tenant_id) || null;
    const context = {
      active_tenant_id: selectedClubAccess.tenant_id,
      active_club_id: selectedClubAccess.club_id,
      active_tenant_role: tenantAccess?.role || null,
      active_club_role: selectedClubAccess.permission_bundle,
      security_context_updated_at: new Date().toISOString(),
    };
    await base44.asServiceRole.entities.User.update(user.id, context);

    return Response.json({ success: true, context });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
});