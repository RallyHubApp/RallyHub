import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Mode: notifyAllPending — called by admin to blast notifications for all pending users
    if (payload.notifyAllPending) {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const pendingUsers = allUsers.filter(u => u.role !== 'admin' && (!u.approval_status || u.approval_status === 'pending'));
      const admins = allUsers.filter(u => u.role === 'admin' && u.email);

      if (pendingUsers.length === 0) {
        return Response.json({ success: true, message: 'No pending users found' });
      }

      const userList = pendingUsers.map(u => `• ${u.full_name || 'Unknown'} (${u.email})`).join('\n');

      const emailPromises = admins.map(admin =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          from_name: 'RallyHub',
          subject: `[RallyHub] ${pendingUsers.length} User(s) Awaiting Approval`,
          body: `Hi ${admin.full_name || 'Admin'},

The following user(s) are currently awaiting approval on RallyHub:

${userList}

Please log in to the Admin Panel to approve or reject them:
https://rallyhub.ie/app/admin

Thanks,
RallyHub`.trim()
        })
      );

      await Promise.all(emailPromises);
      return Response.json({ success: true, notified: admins.length, pendingCount: pendingUsers.length });
    }

    // Mode: notifyUserApproval — called when admin approves/rejects a user
    if (payload.notifyUserApproval) {
      const { userEmail, userName, status } = payload;
      if (!userEmail) return Response.json({ error: 'No userEmail provided' }, { status: 400 });

      const isApproved = status === 'approved';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        from_name: 'RallyHub',
        subject: isApproved ? '[RallyHub] Your account has been approved!' : '[RallyHub] Account access update',
        body: isApproved
          ? `Hi ${userName || 'there'},

Great news! Your RallyHub account has been approved. You can now log in and access the app:

https://rallyhub.ie/app

Welcome to the community!

RallyHub`.trim()
          : `Hi ${userName || 'there'},

Unfortunately your RallyHub account access request has not been approved at this time.

If you think this is a mistake, please contact your club admin.

RallyHub`.trim()
      });

      return Response.json({ success: true });
    }

    // Normal mode: single user hit the pending screen
    const newUser = payload.user || payload.data;
    if (!newUser) return Response.json({ error: 'No user data in payload' }, { status: 400 });
    if (newUser.role === 'admin') return Response.json({ skipped: true, reason: 'admin user' });

    const allUsers = await base44.asServiceRole.entities.User.list();
    const admins = allUsers.filter(u => u.role === 'admin' && u.email);
    if (admins.length === 0) return Response.json({ skipped: true, reason: 'no admins found' });

    const userName = newUser.full_name || newUser.email || 'Unknown User';
    const userEmail = newUser.email || 'No email';
    const signupDate = new Date().toLocaleDateString('en-IE', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const emailPromises = admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        from_name: 'RallyHub',
        subject: `[RallyHub] New Sign-Up: ${userName} — Approval Required`,
        body: `Hi ${admin.full_name || 'Admin'},

A new user has signed up for RallyHub and is awaiting your approval.

Name: ${userName}
Email: ${userEmail}
Signed up: ${signupDate}

Approve or reject them here:
https://rallyhub.ie/app/admin

RallyHub`.trim()
      })
    );

    await Promise.all(emailPromises);
    return Response.json({ success: true, notified: admins.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});