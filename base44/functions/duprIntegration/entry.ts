import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const UAT_BASE = 'https://uat.mydupr.com/api';
const API_VERSION = 'v1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || !(user.role === 'admin' || user.kotc_role === 'super_admin')) {
      return Response.json({ error: 'RallyHub Super Admin access required.' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'status');
    if (action === 'status') {
      return Response.json({ success: true, environment: 'uat', apiVersion: API_VERSION, baseUrl: UAT_BASE });
    }
    return Response.json({ error: 'Unknown DUPR integration action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'DUPR integration request failed.' }, { status: 500 });
  }
});
