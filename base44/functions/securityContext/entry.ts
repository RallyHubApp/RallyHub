import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function isCurrentlyValid(access) {
  if (!access || access.status !== 'active') return false;
  const now = Date.now();
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}
function isTemporaryTestClub(club) {
  const slug = String(club?.slug || '').toLowerCase();
  const name = String(club?.name || '').toLowerCase();
  return slug.startsWith('rallyhub-test-club-') || name === 'rallyhub test club';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action = 'resolve_default', tenantId, clubId, allowTestContext = false } = body;

    const clubAccesses = (await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: user.id }))
      .filter(isCurrentlyValid);
    const tenantAccesses = (await base44.asServiceRole.entities.TenantUserAccess.filter({ user_id: user.id }))
      .filter(isCurrentlyValid);

    if (user.role !== 'admin') {
      if (user.approval_status !== 'approved') {
        await base44.asServiceRole.entities.User.update(user.id, {
          active_tenant_id: null,
          active_club_id: null,
          active_tenant_role: null,
          active_club_role: null,
          security_context_updated_at: new Date().toISOString(),
        });
        return Response.json({ error: 'RallyHub Club approval required' }, { status: 403 });
      }
      if (clubAccesses.length === 0) {
        // A revoked or Directory-only user may still have an old active club cached
        // on their User record. Clear it before denying Club access so the public UI
        // never suggests they can still switch into a club they no longer belong to.
        await base44.asServiceRole.entities.User.update(user.id, {
          active_tenant_id: null,
          active_club_id: null,
          active_tenant_role: null,
          active_club_role: null,
          security_context_updated_at: new Date().toISOString(),
        });
        return Response.json({
          error: 'No RallyHub Club access. Directory ownership or editing does not grant access to RallyHub Club features.'
        }, { status: 403 });
      }
    }

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
    if (action !== 'activate' && !allowTestContext && user.active_club_id) {
      const currentClub = (await base44.asServiceRole.entities.Club.filter({ id: user.active_club_id }))?.[0] || null;
      if (isTemporaryTestClub(currentClub)) {
        const ids = clubAccesses.map(a => a.club_id).filter(Boolean);
        const accessibleClubs = ids.length ? await base44.asServiceRole.entities.Club.filter({ id: { $in: ids }, status: 'active' }) : [];
        const productionClubs = (accessibleClubs || []).filter(c => !isTemporaryTestClub(c));
        if (productionClubs.length === 1) {
          const target = productionClubs[0];
          selectedClubAccess = clubAccesses.find(a => a.club_id === target.id && a.tenant_id === target.tenant_id) || null;
        } else if (productionClubs.length > 1) {
          return Response.json({
            success: true,
            requires_selection: true,
            test_context_cleared: true,
            options: clubAccesses.filter(a => productionClubs.some(c => c.id === a.club_id)).map(a => ({ tenant_id: a.tenant_id, club_id: a.club_id, permission_bundle: a.permission_bundle })),
          });
        }
      }
    }
    if (action === 'activate') {
      if (!tenantId || !clubId) return Response.json({ error: 'tenantId and clubId required' }, { status: 400 });
      selectedClubAccess = clubAccesses.find(a => a.tenant_id === tenantId && a.club_id === clubId) || null;
      if (!selectedClubAccess) return Response.json({ error: 'No active access to requested club' }, { status: 403 });
    } else if (!selectedClubAccess) {
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