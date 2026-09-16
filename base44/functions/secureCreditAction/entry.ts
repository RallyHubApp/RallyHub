import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

// Production endpoint retired after tenant-isolation testing. Security regression
// tests should run from controlled test tooling, not expose a callable self-test
// route to ordinary authenticated users.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
    return Response.json({ error: 'Tenant-isolation self-test endpoint retired' }, { status: 410 });
  } catch {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
});
