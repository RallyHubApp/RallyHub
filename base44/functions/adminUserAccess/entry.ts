import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'list') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      return Response.json({ users });
    }

    if (action === 'set_approval') {
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
      await base44.asServiceRole.entities.User.update(userId, { approval_status: status });
      return Response.json({ success: true, userId, status });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
});