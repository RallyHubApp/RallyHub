import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

// Retired duplicate endpoint. RallyHub uses spondIntegrationWorking. Keeping
// this old route explicitly closed reduces the number of credential-handling
// code paths that need to be secured and maintained.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json({ error: 'Legacy Spond integration endpoint retired' }, { status: 410 });
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
});
