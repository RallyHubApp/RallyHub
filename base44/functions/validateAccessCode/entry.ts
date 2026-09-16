import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

// Legacy access-code gate retired. RallyHub now uses account approval plus
// tenant/club/role grants. Keeping the endpoint explicitly closed avoids an old
// authentication path being accidentally re-enabled later.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json({ error: 'Legacy access-code gate retired' }, { status: 410 });
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
});
