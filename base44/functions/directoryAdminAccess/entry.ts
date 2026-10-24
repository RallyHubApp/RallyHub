import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
import { authorisedDirectorySuperAdmin } from '../../shared/directorySuperAdmin.ts';

// Read-only capability probe. Never disclose configured identity IDs or private Directory records.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    return Response.json({ authorised: authorisedDirectorySuperAdmin(user) }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch {
    return Response.json({ authorised: false }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  }
});
