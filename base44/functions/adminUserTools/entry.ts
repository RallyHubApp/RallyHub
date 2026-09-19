import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();

    // Secure user approval/listing for the Admin Panel. Built-in User listing is not
    // reliably available from the browser, so these operations run admin-only here.
    if (body.action === 'list_users') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      return Response.json({ users });
    }
    if (body.action === 'pending_approval_count') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const pendingCount = users.filter(u =>
        u.role !== 'admin' && (!u.approval_status || u.approval_status === 'pending')
      ).length;
      return Response.json({ pendingCount });
    }
    if (body.action === 'set_approval') {
      const { userId, status } = body;
      if (!userId || !['pending', 'approved', 'rejected'].includes(status)) {
        return Response.json({ error: 'Valid userId and status required' }, { status: 400 });
      }
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const target = users?.[0];
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      if (target.role === 'admin' && status !== 'approved') {
        return Response.json({ error: 'Platform admins cannot be rejected/revoked here' }, { status: 400 });
      }
      if (status === 'approved' && target.role !== 'admin') {
        const clubAccesses = await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: userId, status: 'active' });
        if (!clubAccesses?.length) {
          return Response.json({
            error: 'Cannot approve RallyHub Club access: this account has no active ClubUserAccess. Directory access is separate and must remain directory-only.'
          }, { status: 409 });
        }
      }
      await base44.asServiceRole.entities.User.update(userId, {
        approval_status: status,
        ...(status === 'approved' ? { account_scope: 'club' } : {})
      });
      return Response.json({ success: true, userId, status });
    }
    if (body.action === 'set_kotc_role') {
      const { userId, kotcRole } = body;
      if (!userId || !['super_admin', 'admin', 'host', 'player'].includes(kotcRole)) {
        return Response.json({ error: 'Valid userId and KOTC role required' }, { status: 400 });
      }
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const target = users?.[0];
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      const [directoryAccess, clubAccess] = await Promise.all([
        base44.asServiceRole.entities.DirectoryListingAccess.filter({ user_id: userId, status: 'active' }),
        base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: userId, status: 'active' }),
      ]);
      if (directoryAccess?.length && !clubAccess?.length) {
        return Response.json({
          error: 'Directory-only accounts cannot be assigned RallyHub Club/KOTC roles.'
        }, { status: 409 });
      }
      await base44.asServiceRole.entities.User.update(userId, { kotc_role: kotcRole });
      return Response.json({ success: true, userId, kotcRole });
    }
    const { action } = body;

    // ── PROMOTE TO ADMIN ───────────────────────────────────────────────────────
    if (action === 'promote_to_admin') {
      const { userEmail } = body;
      if (!userEmail) return Response.json({ error: 'Missing userEmail' }, { status: 400 });
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail.toLowerCase() });
      const targetUser = users[0];
      if (!targetUser) return Response.json({ error: 'No user account found for this email' }, { status: 404 });
      const [directoryAccess, clubAccess, tenantAccess] = await Promise.all([
        base44.asServiceRole.entities.DirectoryListingAccess.filter({ user_id: targetUser.id, status: 'active' }),
        base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: targetUser.id, status: 'active' }),
        base44.asServiceRole.entities.TenantUserAccess.filter({ user_id: targetUser.id, status: 'active' }),
      ]);
      if (directoryAccess?.length && !clubAccess?.length && !tenantAccess?.length) {
        return Response.json({
          error: 'This is a Directory-only account. Give explicit RallyHub Club/Tenant access before any platform-admin promotion.'
        }, { status: 409 });
      }
      await base44.asServiceRole.entities.User.update(targetUser.id, { role: 'admin', account_scope: 'platform', approval_status: 'approved' });
      return Response.json({ success: true, userId: targetUser.id, userName: targetUser.full_name });
    }

    // ── DEMOTE TO USER ─────────────────────────────────────────────────────────
    if (action === 'demote_to_user') {
      const { userEmail } = body;
      if (!userEmail) return Response.json({ error: 'Missing userEmail' }, { status: 400 });
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail.toLowerCase() });
      const targetUser = users[0];
      if (!targetUser) return Response.json({ error: 'No user account found for this email' }, { status: 404 });
      await base44.asServiceRole.entities.User.update(targetUser.id, { role: 'user' });
      return Response.json({ success: true, userId: targetUser.id, userName: targetUser.full_name });
    }

    // Direct admin password-setting is deliberately retired. Password recovery is
    // handled by the platform reset flow so administrators never receive or choose
    // another user's password.
    if (action === 'set_password') {
      return Response.json({ error: 'Direct password setting is retired. Use the password reset flow.' }, { status: 410 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});