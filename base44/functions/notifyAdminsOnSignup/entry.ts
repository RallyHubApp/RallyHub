import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Supports both direct invocation { user } and entity automation { data }
    const newUser = payload.user || payload.data;

    if (!newUser) {
      return Response.json({ error: 'No user data in payload' }, { status: 400 });
    }

    // Only notify for non-admin users (admins don't need approval)
    if (newUser.role === 'admin') {
      return Response.json({ skipped: true, reason: 'admin user' });
    }

    // Get all admin users
    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === 'admin' && u.email);

    if (admins.length === 0) {
      return Response.json({ skipped: true, reason: 'no admins found' });
    }

    const userName = newUser.full_name || newUser.email || 'Unknown User';
    const userEmail = newUser.email || 'No email';
    const signupDate = new Date().toLocaleDateString('en-IE', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Send email to each admin
    const emailPromises = admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        from_name: 'RallyHub',
        subject: `New User Sign-Up: ${userName} — Approval Required`,
        body: `
Hi ${admin.full_name || 'Admin'},

A new user has signed up for RallyHub and is awaiting your approval.

User Details:
• Name: ${userName}
• Email: ${userEmail}
• Signed up: ${signupDate}

Please log in to the Admin Panel to approve or reject this user:
https://rallyhub.ie/app/admin

Thanks,
The RallyHub Platform
        `.trim()
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ success: true, notified: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});