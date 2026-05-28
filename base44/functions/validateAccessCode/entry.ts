import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ACCESS_CODE = Deno.env.get('RALLYHUB_ACCESS_CODE');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // ── VALIDATE AND STORE ACCESS CODE ─────────────────────────────────────────
    if (action === 'validate_and_store') {
      const { code } = body;
      if (!code) {
        return Response.json({ error: 'Access code required' }, { status: 400 });
      }
      if (!ACCESS_CODE) {
        return Response.json({ error: 'Access code is not configured' }, { status: 500 });
      }

      if (code.trim().toUpperCase() !== ACCESS_CODE.trim().toUpperCase()) {
        return Response.json({ error: 'Invalid access code' }, { status: 401 });
      }

      // Store the access code validation in User entity
      // Add a field to track access code validation
      await base44.entities.User.update(user.id, {
        access_code_validated: true,
        access_code_validated_date: new Date().toISOString()
      });

      return Response.json({ success: true, userEmail: user.email });
    }

    // ── CHECK IF USER HAS VALIDATED ACCESS CODE ────────────────────────────────
    if (action === 'check_validation') {
      // Check if user has the access_code_validated field set to true
      const users = await base44.entities.User.filter({ email: user.email });
      const currentUser = users[0];
      
      const hasValidated = currentUser?.access_code_validated === true;
      return Response.json({ validated: hasValidated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});