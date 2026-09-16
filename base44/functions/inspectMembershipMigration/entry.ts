import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// Retired one-time membership migration inspection endpoint.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    return Response.json({ error: 'This migration inspection endpoint has been retired.' }, { status: 410 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
});
