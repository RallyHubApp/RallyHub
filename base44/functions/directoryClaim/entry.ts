import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';
import { directoryVerificationIndex } from './contactIndex.ts';
import { geocodeDirectoryVenue } from './geocode.ts';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

function normaliseEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normaliseName(value = '') {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function phoneDigits(value = '') {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  return digits;
}

function phoneLooksSame(a = '', b = '') {
  const aa = phoneDigits(a);
  const bb = phoneDigits(b);
  if (!aa || !bb) return false;
  if (aa === bb) return true;
  const tail = Math.min(9, aa.length, bb.length);
  return tail >= 8 && aa.slice(-tail) === bb.slice(-tail);
}

function randomInviteToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function hashInviteToken(token = '') {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(token || '')));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createTrustedClaimInvitation(base44, { listing, user, contactName = '', contactEmail = '', contactPhone = '', channel = 'email', accessRole = 'owner' }) {
  const token = randomInviteToken();
  const tokenHash = await hashInviteToken(token);
  const expiresAt = new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString();
  await base44.asServiceRole.entities.DirectoryClaimInvitation.create({
    listing_slug: listing.slug,
    listing_name_snapshot: listing.name,
    contact_name: String(contactName || '').trim().slice(0, 160) || null,
    contact_email: normaliseEmail(contactEmail || '').slice(0, 240) || null,
    contact_phone: String(contactPhone || '').trim().slice(0, 80) || null,
    channel,
    access_role: accessRole === 'editor' ? 'editor' : 'owner',
    token_hash: tokenHash,
    status: 'pending',
    created_by_user_id: user.id,
    expires_at: expiresAt,
  });
  return {
    token,
    expiresAt,
    claimUrl: `https://rallyhub.ie/directory/${encodeURIComponent(listing.slug)}/claim?invite=${encodeURIComponent(token)}`,
  };
}

function recentCount(rows:any[] = [], hours = 24) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  return rows.filter(row => {
    const t = Date.parse(String(row?.created_date || ''));
    return Number.isFinite(t) && t >= cutoff;
  }).length;
}

function publicClaim(claim) {
  if (!claim) return null;
  return {
    id: claim.id,
    listing_slug: claim.listing_slug,
    listing_name_snapshot: claim.listing_name_snapshot,
    claimant_name: claim.claimant_name,
    claimant_role: claim.claimant_role,
    status: claim.status,
    created_date: claim.created_date,
    reviewed_at: claim.reviewed_at,
    review_notes: claim.status === 'rejected' ? claim.review_notes || null : null,
  };
}

function publicListingRequest(request) {
  if (!request) return null;
  return {
    id: request.id,
    club_name: request.club_name,
    county: request.county,
    town: request.town || null,
    status: request.status,
    approved_listing_slug: request.approved_listing_slug || null,
    created_date: request.created_date,
    reviewed_at: request.reviewed_at || null,
    review_notes: request.status === 'rejected' ? request.review_notes || null : null,
  };
}

function slugify(value = '') {
  return normaliseName(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '') || 'club';
}

function safePublicUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}

async function resolveListing(base44, listingSlug) {
  const staticListing = directoryVerificationIndex.find(x => x.slug === listingSlug);
  if (staticListing) return staticListing;
  const rows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
  const row = rows?.[0];
  if (!row) return null;
  let contacts = [];
  try { contacts = row.trusted_contacts_json ? JSON.parse(row.trusted_contacts_json) : []; } catch { contacts = []; }
  return {
    slug: row.slug,
    name: row.name,
    county: row.county,
    verificationStatus: 'unclaimed',
    contacts: Array.isArray(contacts) ? contacts : [],
  };
}

async function uniqueListingSlug(base44, clubName) {
  const base = slugify(clubName);
  const staticSlugs = new Set(directoryVerificationIndex.map(x => x.slug));
  const rows = await base44.asServiceRole.entities.DirectoryListingRecord.list('-published_at', 500);
  const used = new Set([...(rows || []).map(x => x.slug), ...staticSlugs]);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

async function hardenDirectoryOnlyAccount(base44:any, userId:string) {
  const users = await base44.asServiceRole.entities.User.filter({ id:userId });
  const target = users?.[0];
  if (!target || target.role === 'admin') return;
  const [clubAccess, tenantAccess] = await Promise.all([
    base44.asServiceRole.entities.ClubUserAccess.filter({ user_id:userId, status:'active' }),
    base44.asServiceRole.entities.TenantUserAccess.filter({ user_id:userId, status:'active' }),
  ]);
  if ((clubAccess || []).length || (tenantAccess || []).length) return;
  await base44.asServiceRole.entities.User.update(userId, {
    account_scope: 'directory',
    approval_status: 'pending',
    active_tenant_id: null,
    active_club_id: null,
    active_tenant_role: null,
    active_club_role: null,
    security_context_updated_at: new Date().toISOString(),
  });
}

async function grantAccess(base44, { listing, userId, claimId, grantedByUserId = null, notes = '', role = 'editor' }) {
  const existing = await base44.asServiceRole.entities.DirectoryListingAccess.filter({
    listing_slug: listing.slug,
    user_id: userId,
  });
  const active = existing.find(x => x.status === 'active');
  if (active) {
    if (role === 'owner' && active.role !== 'owner') {
      await base44.asServiceRole.entities.DirectoryListingAccess.update(active.id, { role: 'owner' });
      await hardenDirectoryOnlyAccount(base44, userId);
      const refreshed = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ id: active.id });
      return refreshed[0] || { ...active, role: 'owner' };
    }
    await hardenDirectoryOnlyAccount(base44, userId);
    return active;
  }

  const revoked = existing.find(x => x.status === 'revoked');
  if (revoked) {
    await base44.asServiceRole.entities.DirectoryListingAccess.update(revoked.id, {
      status: 'active',
      role: role === 'owner' ? 'owner' : 'editor',
      verification_claim_id: claimId,
      granted_by_user_id: grantedByUserId,
      granted_at: new Date().toISOString(),
      revoked_by_user_id: null,
      revoked_at: null,
      notes,
    });
    await hardenDirectoryOnlyAccount(base44, userId);
    const refreshed = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ id: revoked.id });
    return refreshed[0] || revoked;
  }

  const created = await base44.asServiceRole.entities.DirectoryListingAccess.create({
    listing_slug: listing.slug,
    listing_name_snapshot: listing.name,
    user_id: userId,
    role: role === 'owner' ? 'owner' : 'editor',
    status: 'active',
    ...(claimId ? { verification_claim_id: claimId } : {}),
    ...(grantedByUserId ? { granted_by_user_id: grantedByUserId } : {}),
    granted_at: new Date().toISOString(),
    notes,
  });
  await hardenDirectoryOnlyAccount(base44, userId);
  return created;
}

async function sendClaimInviteEmail(base44, { user, listing, contactEmail, contactName, claimUrl, accessRole = 'owner' }) {
  const to = normaliseEmail(contactEmail);
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { sent: 0, error: 'A valid club contact email is required.' };
  }
  const auditAction = 'credit_guard_directory_claim_invite';
  const [userRows, globalRows] = await Promise.all([
    base44.asServiceRole.entities.AuditLog.filter({ user_id: user.id, action: auditAction }, '-created_date', 30),
    base44.asServiceRole.entities.AuditLog.filter({ action: auditAction }, '-created_date', 120),
  ]);
  if (recentCount(userRows || [], 24) >= 20 || recentCount(globalRows || [], 24) >= 100) {
    return { sent: 0, limited: true, error: 'Claim-invitation email limit reached for today.' };
  }
  await base44.asServiceRole.entities.AuditLog.create({
    tenant_id: String(user.active_tenant_id || 'platform'),
    ...(user.active_club_id ? { club_id: user.active_club_id } : {}),
    user_id: user.id,
    action: auditAction,
    entity_type: 'DirectoryClaimInvitation',
    entity_id: String(listing.slug).slice(0, 220),
    scope_type: 'CreditAction',
    scope_id: to.slice(0, 120),
    after_state: JSON.stringify({ listingSlug: listing.slug, recipient: to, windowHours: 24 }),
    reason: 'Reserved before sending a RallyHub Directory claim invitation.',
  });
  const delegated = accessRole === 'editor';
  const recipientName = String(contactName || '').trim().split(/\s+/)[0] || 'there';
  const ownerBody = `Hi ${recipientName},\n\nI’ve set up the ${listing.name} listing in the RallyHub Club Directory and I’d love you to be one of the people who helps me test it before I roll it out more widely.\n\nThe Directory came from a simple idea: make it easier for people anywhere in Ireland to find a club, see where and when it plays, and know who to contact. I’ve built it as a contribution to the pickleball community, and there’s no charge to claim and maintain your listing.\n\nI’d really value your honest feedback from a user point of view — anything that feels confusing, awkward, unnecessary, missing, or that you think could simply be better.\n\nYour secure link:\n${claimUrl}\n\nOnce verified, you’ll become the Primary Directory Owner for ${listing.name} and can check or update the public information. This gives Directory access only; it does not sign your club up for RallyHub Club or any paid service.\n\nWhy the Directory exists:\nhttps://rallyhub.ie/directory/story\n\nClub Guide & Help:\nhttps://rallyhub.ie/directory/help\n\nQuick Start Guide:\nhttps://rallyhub.ie/directory/quick-start\n\nThe secure link is single-use and expires after 72 hours. If anything gives you trouble, just WhatsApp or call me.\n\nThanks for helping me get this right.\n\nYours in sport,\nBrian Moore\n087 810 0333`;
  const editorBody = `Hi ${recipientName},\n\nYou’ve been invited to help manage the ${listing.name} listing in the RallyHub Club Directory as a Directory Editor.\n\nI’d really value your feedback while you use it — anything that feels confusing, awkward, unnecessary, missing, or that you think could simply be better.\n\nYour secure editor link:\n${claimUrl}\n\nIf you need a Directory account, RallyHub will first verify your email with a six-digit code. Directory Editor access lets you update the public listing but does not let you transfer ownership or manage other editors. It also does not give access to RallyHub Club, tournaments, players or club administration.\n\nWhy the Directory exists:\nhttps://rallyhub.ie/directory/story\n\nClub Guide & Help:\nhttps://rallyhub.ie/directory/help\n\nQuick Start Guide:\nhttps://rallyhub.ie/directory/quick-start\n\nThe secure link is single-use and expires after 72 hours. If anything gives you trouble, just WhatsApp or call me.\n\nYours in sport,\nBrian Moore\n087 810 0333`;
  const subject = delegated
    ? `An invitation to help manage ${listing.name} on the RallyHub Directory`
    : `An invitation to review ${listing.name} on the RallyHub Directory`;
  const textBody = delegated ? editorBody : ownerBody;
  const actionLabel = delegated ? 'Open your editor invitation' : 'Open your secure invitation';
  const roleCopy = delegated
    ? `You’ve been invited to help manage the <strong>${listing.name}</strong> listing as a Directory Editor.`
    : `I’ve set up the <strong>${listing.name}</strong> listing and I’d love you to help me test the Directory before I roll it out more widely.`;
  const htmlBody = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f8f5;font-family:Arial,Helvetica,sans-serif;color:#0c1e35;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f8f5;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe9e2;">
          <tr>
            <td style="padding:28px 32px 18px;border-top:7px solid #159447;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.4px;">Rally<span style="color:#159447;">Hub</span></div>
              <div style="font-size:11px;letter-spacing:2.2px;color:#66737f;margin-top:3px;">PLAY • CONNECT • BELONG</div>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 32px 8px;">
              <p style="font-size:18px;margin:0 0 16px;">Hi ${recipientName},</p>
              <p style="font-size:16px;line-height:1.6;margin:0 0 14px;">${roleCopy}</p>
              <p style="font-size:15px;line-height:1.6;color:#55636f;margin:0 0 22px;">I’d really value your honest feedback — anything that feels confusing, awkward, unnecessary, missing, or that you think could simply be better.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;"><tr>
                <td bgcolor="#159447" style="border-radius:10px;">
                  <a href="${claimUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">${actionLabel}</a>
                </td>
              </tr></table>
              <div style="background:#eef9f1;border:1px solid #d7eadc;border-radius:14px;padding:16px 18px;margin-bottom:22px;">
                <div style="font-weight:700;margin-bottom:6px;">Directory access only</div>
                <div style="font-size:14px;line-height:1.55;color:#55636f;">This does not sign your club up for RallyHub Club or any paid service. The secure invitation is single-use and expires after 72 hours.</div>
              </div>
              <p style="font-size:14px;line-height:1.8;margin:0 0 18px;">
                <a href="https://rallyhub.ie/directory/story" style="color:#159447;font-weight:700;">Why the Directory exists</a><br>
                <a href="https://rallyhub.ie/directory/help" style="color:#159447;font-weight:700;">Club Guide &amp; Help</a><br>
                <a href="https://rallyhub.ie/directory/quick-start" style="color:#159447;font-weight:700;">Quick Start Guide</a>
              </p>
              <p style="font-size:15px;line-height:1.6;margin:0 0 8px;">Thanks for helping me get this right.</p>
              <p style="font-size:15px;line-height:1.5;margin:0 0 4px;">Yours in sport,</p>
              <p style="font-size:22px;font-style:italic;font-weight:700;margin:0 0 2px;">Brian Moore</p>
              <p style="font-size:13px;color:#66737f;margin:0 0 24px;">087 810 0333 · rallyhubapp@gmail.com</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  await sendWithConfiguredEmailTransport(
    base44,
    { scopeType: 'platform', purpose: 'directory' },
    { to, subject, textBody, htmlBody },
  );
  return { sent: 1, to, claimUrl };
}

async function sendAdminDirectoryEmail(base44, { user, subject, body, kind, contextId }) {
  try {
    const auditAction = 'credit_guard_directory_email';
    const [userRows, globalRows] = await Promise.all([
      base44.asServiceRole.entities.AuditLog.filter({ user_id: user.id, action: auditAction }, '-created_date', 20),
      base44.asServiceRole.entities.AuditLog.filter({ action: auditAction }, '-created_date', 70),
    ]);
    if (recentCount(userRows || [], 24) >= 10 || recentCount(globalRows || [], 24) >= 50) {
      console.warn('Directory notification email suppressed by usage protection', { kind, userId: user.id });
      return { sent: 0, limited: true };
    }

    // Reserve the allowance before the credit-consuming email call. If the audit
    // cannot be written, fail closed: the directory request remains in Admin review.
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id: String(user.active_tenant_id || 'platform'),
      ...(user.active_club_id ? { club_id: user.active_club_id } : {}),
      user_id: user.id,
      action: auditAction,
      entity_type: 'DirectoryNotification',
      entity_id: String(contextId || user.id).slice(0, 220),
      scope_type: 'CreditAction',
      scope_id: String(kind || 'directory_review').slice(0, 120),
      after_state: JSON.stringify({ perUserLimit: 10, globalLimit: 50, windowHours: 24 }),
      reason: 'Reserved before a directory review email to protect Base44 usage credits.',
    });

    // The review destination is stored in an admin-only settings entity so the real
    // mailbox is never exposed in public UI or bundled frontend code.
    const settings = await base44.asServiceRole.entities.DirectorySettings.filter({
      key: 'directory-review',
      active: true,
    });
    const to = String(settings?.[0]?.review_email || '').trim().toLowerCase();
    if (!to) return { sent: 0 };

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      from_name: 'RallyHub Directory',
      subject,
      body,
    });
    return { sent: 1 };
  } catch (error) {
    // A notification failure must never lose the underlying claim/request; it remains
    // visible in the RallyHub Admin panel for review.
    console.warn('Directory admin email notification failed', error?.message || error);
    return { sent: 0, error: error?.message || String(error) };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'submit';

    if (action === 'test_clare_mail_gateway') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const to = normaliseEmail(String(body.to || user.email || ''));
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return Response.json({ error: 'A valid test email address is required.' }, { status: 400 });
      }
      const sent = await sendWithConfiguredEmailTransport(
        base44,
        {
          scopeType: 'tenant',
          purpose: 'club_comms',
          tenantId: '6a9b7790bc4a8d299938bda9',
          clubId: '6a9b779684daba85b3ffdeb5',
        },
        {
          to,
          subject: 'Clare Pickleball — RallyHub mail gateway test',
          textBody: 'This is a test from RallyHub confirming that Clare Pickleball tenant email is being sent through the Clare Pickleball mail gateway.',
          htmlBody: '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #d9e2ec;border-radius:16px;overflow:hidden"><div style="background:#0b2a4a;color:white;padding:24px 28px"><div style="font-size:26px;font-weight:800">Clare Pickleball</div><div style="color:#f3c623;font-weight:700;margin-top:4px">RallyHub tenant mail test</div></div><div style="padding:28px"><p style="font-size:16px;line-height:1.6">This test confirms that Clare Pickleball email is now routed separately from RallyHub platform and Directory email.</p><p style="font-size:15px;line-height:1.6">If you are reading this, the Clare Pickleball tenant mail gateway is working correctly.</p><div style="margin-top:24px;padding:14px 16px;background:#fff8d8;border-left:5px solid #f3c623;border-radius:8px"><strong>Sender:</strong> clarepb2025@gmail.com</div><p style="margin-top:26px">Regards,<br><strong>Clare Pickleball</strong><br><span style="color:#667085">Powered by RallyHub</span></p></div></div>',
        }
      );
      return Response.json({ success: true, to, provider: sent?.provider || null, senderEmail: sent?.senderEmail || null });
    }

    if (action === 'save_directory_identity') {
      const fullName = String(body.fullName || '').trim().slice(0, 160);
      const mobile = String(body.mobile || '').trim().slice(0, 80);
      if (!fullName) return Response.json({ error: 'Your name is required' }, { status: 400 });
      if (!mobile) return Response.json({ error: 'Your mobile number is required' }, { status: 400 });
      const existingClubAccess = await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id:user.id, status:'active' });
      await base44.asServiceRole.entities.User.update(user.id, {
        full_name: fullName,
        directory_mobile: mobile,
        ...(user.role === 'admin' || existingClubAccess?.length ? {} : { account_scope: 'directory', approval_status: 'pending' }),
      });
      return Response.json({ success: true, fullName, mobile });
    }

    if (action === 'submit') {
      const listingSlug = String(body.listingSlug || '').trim();
      const listing = await resolveListing(base44, listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      if (!user.email) return Response.json({ error: 'A verified account email is required' }, { status: 400 });
      const inviteToken = String(body.inviteToken || '').trim().slice(0, 200);

      const existingAccess = (await base44.asServiceRole.entities.DirectoryListingAccess.filter({
        listing_slug: listingSlug,
        user_id: user.id,
      })).find(x => x.status === 'active');
      if (existingAccess) {
        return Response.json({ success: true, verified: true, status: 'approved', hasAccess: true });
      }

      const existingClaims = await base44.asServiceRole.entities.DirectoryClaim.filter({
        listing_slug: listingSlug,
        claimant_user_id: user.id,
      });
      const pending = existingClaims.find(x => x.status === 'pending');
      if (pending && !inviteToken) {
        return Response.json({ success: true, verified: false, status: 'pending', claim: publicClaim(pending), hasAccess: false });
      }

      // Prevent a signed-in account from using the verification workflow as a
      // high-volume email/database spam surface. Platform admins are exempt for testing/support.
      if (user.role !== 'admin') {
        const recentClaims = await base44.asServiceRole.entities.DirectoryClaim.filter({ claimant_user_id: user.id }, '-created_date', 100);
        if (recentCount(recentClaims, 24) >= 10) {
          return Response.json({ error: 'Too many directory verification requests. Please try again later.' }, { status: 429 });
        }
      }

      const claimantName = String(body.claimantName || user.full_name || user.display_name || '').trim().slice(0, 160);
      const claimantRole = String(body.claimantRole || '').trim().slice(0, 160);
      const claimantPhone = String(body.claimantPhone || '').trim().slice(0, 80);
      const claimantMessage = String(body.claimantMessage || '').trim().slice(0, 1500);
      const networkUpdatesOptIn = body.networkUpdatesOptIn === true;
      if (!claimantName) return Response.json({ error: 'Your name is required' }, { status: 400 });
      if (!claimantRole) return Response.json({ error: 'Your role or connection to the club is required' }, { status: 400 });
      if (!claimantPhone) return Response.json({ error: 'Your mobile number is required' }, { status: 400 });

      // Keep the Directory identity on the account for future claims. This does not
      // create any RallyHub Club, tenant, player or tournament access.
      const existingClubAccessForClaimant = await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id:user.id, status:'active' });
      await base44.asServiceRole.entities.User.update(user.id, {
        full_name: claimantName,
        directory_mobile: claimantPhone,
        ...(user.role === 'admin' || existingClubAccessForClaimant?.length ? {} : { account_scope: 'directory', approval_status: 'pending' }),
      });

      const userEmail = normaliseEmail(user.email);
      let trustedInvitation:any = null;
      if (inviteToken) {
        const tokenHash = await hashInviteToken(inviteToken);
        const invitations = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({
          listing_slug: listingSlug,
          token_hash: tokenHash,
          status: 'pending',
        });
        const invitation = invitations?.[0] || null;
        if (!invitation) return Response.json({ error: 'This claim invitation is invalid or has already been used.' }, { status: 403 });
        if (!invitation.expires_at || Date.parse(invitation.expires_at) < Date.now()) {
          await base44.asServiceRole.entities.DirectoryClaimInvitation.update(invitation.id, { status: 'expired' });
          return Response.json({ error: 'This claim invitation has expired. Ask the club administrator for a new invitation.' }, { status: 403 });
        }
        const inviteEmailMatch = invitation.contact_email && normaliseEmail(invitation.contact_email) === userEmail;
        const invitePhoneMatch = invitation.contact_phone && phoneLooksSame(invitation.contact_phone, claimantPhone);
        const invitationIdentityMatch = invitation.channel === 'email'
          ? !!inviteEmailMatch
          : invitation.channel === 'whatsapp'
            ? !!invitePhoneMatch
            : !!(inviteEmailMatch || invitePhoneMatch);
        if (!invitationIdentityMatch) {
          return Response.json({ error: invitation.channel === 'email' ? 'This secure invitation was issued to a different email address.' : 'This secure invitation was issued to a different mobile number.' }, { status: 403 });
        }
        trustedInvitation = invitation;
      }

      const trustedContacts = listing.contacts || [];
      const emailMatch = trustedContacts.some(c => normaliseEmail(c.email) && normaliseEmail(c.email) === userEmail);
      const nameMatch = trustedContacts.some(c => normaliseName(c.name) && normaliseName(c.name) === normaliseName(claimantName));
      const phoneMatch = claimantPhone
        ? trustedContacts.some(c => c.phone && phoneLooksSame(c.phone, claimantPhone))
        : false;

      // Directory claims require RallyHub review before access is granted.
      // A secure invitation verifies that the claimant received the intended email/phone link,
      // but it does not itself approve Directory ownership. This preserves the agreed beta
      // journey: invitation -> sign in/verify -> submit claim -> RallyHub review -> access.
      // The only exception is a platform admin whose trusted name and phone both match.
      const adminIdentityMatch = user.role === 'admin' && nameMatch && phoneMatch;
      const anyExistingAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' });
      const listingAlreadyVerified = listing.verificationStatus === 'verified' || !!anyExistingAccess?.length;
      const autoVerified = adminIdentityMatch && !listingAlreadyVerified;
      const now = new Date().toISOString();
      const claim = await base44.asServiceRole.entities.DirectoryClaim.create({
        listing_slug: listing.slug,
        listing_name_snapshot: listing.name,
        claimant_user_id: user.id,
        claimant_name: claimantName,
        claimant_role: claimantRole,
        claimant_email: user.email,
        claimant_phone: claimantPhone || null,
        claimant_message: claimantMessage || null,
        status: autoVerified ? 'auto_verified' : 'pending',
        match_method: autoVerified ? 'platform_admin_identity' : 'manual_review',
        email_match: emailMatch,
        phone_match: phoneMatch,
        name_match: nameMatch,
        network_updates_opt_in: networkUpdatesOptIn,
        network_updates_opted_in_at: networkUpdatesOptIn ? now : null,
        auto_verified_at: autoVerified ? now : null,
      });

      if (autoVerified) {
        const grantedRole = listingAlreadyVerified ? 'editor' : 'owner';
        await grantAccess(base44, {
          listing,
          userId: user.id,
          claimId: claim.id,
          grantedByUserId: null,
          role: grantedRole,
          notes: 'Automatically verified for a known RallyHub platform admin whose trusted name and phone both matched.',
        });
        await base44.asServiceRole.entities.DirectoryListingAudit.create({
          listing_slug: listingSlug,
          user_id: user.id,
          action: grantedRole === 'owner' ? 'owner_assigned' : 'access_granted',
          occurred_at: now,
          after_json: JSON.stringify({ role: grantedRole, source: 'platform_admin_identity' }),
        });
        return Response.json({
          success: true,
          verified: true,
          status: 'auto_verified',
          hasAccess: true,
          message: 'Your connection to this club has been verified.',
        });
      }

      if (trustedInvitation) {
        await base44.asServiceRole.entities.DirectoryClaimInvitation.update(trustedInvitation.id, {
          status: 'used',
          used_by_user_id: user.id,
          used_at: now,
        });
        await base44.asServiceRole.entities.DirectoryListingAudit.create({
          listing_slug: listingSlug,
          user_id: user.id,
          action: 'claim_invitation_accepted',
          occurred_at: now,
          after_json: JSON.stringify({
            invitationId: trustedInvitation.id,
            channel: trustedInvitation.channel,
            requestedRole: trustedInvitation.access_role || 'owner',
            claimId: claim.id,
            outcome: 'pending_admin_review',
          }),
        });
      }

      await sendAdminDirectoryEmail(base44, {
        user,
        kind: 'claim_review',
        contextId: claim.id,
        subject: `[RallyHub Directory] Verification needed — ${listing.name}`,
        body: `A club representative needs manual verification.\n\nClub: ${listing.name}\nCounty: ${listing.county || '(not supplied)'}\nName: ${claimantName}\nRole: ${claimantRole}\nEmail: ${user.email}\nMobile: ${claimantPhone}\n\nVerification signals:\n• Trusted email match: ${emailMatch ? 'Yes' : 'No'}\n• Trusted name match: ${nameMatch ? 'Yes' : 'No'}\n• Trusted phone match: ${phoneMatch ? 'Yes' : 'No'}\n\nMessage: ${claimantMessage || '(none)'}\n\nReview this request in RallyHub Admin → Directory Claims.\nhttps://rallyhub.ie/app/admin?tab=directory`,
      });

      return Response.json({
        success: true,
        verified: false,
        status: 'pending',
        hasAccess: false,
        message: trustedInvitation
          ? 'Your secure invitation has been verified. Your Directory access request is now with RallyHub for review.'
          : 'Your Directory access request has been sent to RallyHub for review.',
      });
    }

    if (action === 'admin_create_unclaimed') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const clubName = String(body.clubName || '').trim().slice(0, 180);
      const county = String(body.county || '').trim().slice(0, 100);
      const town = String(body.town || '').trim().slice(0, 120);
      const primaryVenue = String(body.primaryVenue || '').trim().slice(0, 220);
      const address = String(body.address || '').trim().slice(0, 320);
      const venuePostcode = String(body.venuePostcode || '').trim().slice(0, 40);
      const website = String(body.website || '').trim().slice(0, 320);
      const facebook = String(body.facebook || '').trim().slice(0, 320);
      const instagram = String(body.instagram || '').trim().slice(0, 320);
      const contactName = String(body.contactName || '').trim().slice(0, 160);
      const contactRole = String(body.contactRole || '').trim().slice(0, 160);
      const contactEmail = normaliseEmail(body.contactEmail || '').slice(0, 240);
      const contactPhone = String(body.contactPhone || '').trim().slice(0, 80);
      const publishContact = body.publishContact !== false;
      const notes = String(body.notes || '').trim().slice(0, 1500);

      if (!clubName) return Response.json({ error: 'Club name is required' }, { status: 400 });
      if (!county) return Response.json({ error: 'County is required' }, { status: 400 });
      if (!contactName) return Response.json({ error: 'Club contact name is required' }, { status: 400 });
      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return Response.json({ error: 'The club contact email is not valid' }, { status: 400 });
      if (!contactPhone) return Response.json({ error: 'Club contact mobile number is required' }, { status: 400 });

      const staticDuplicate = directoryVerificationIndex.find(x =>
        normaliseName(x.name) === normaliseName(clubName) &&
        normaliseName(x.county || '') === normaliseName(county)
      );
      const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ status: 'active' }, '-published_at', 500);
      const dynamicDuplicate = (dynamicRows || []).find(x => normaliseName(x.name) === normaliseName(clubName) && normaliseName(x.county || '') === normaliseName(county));
      const duplicate = staticDuplicate || dynamicDuplicate;
      if (duplicate) {
        return Response.json({ error: 'This club already appears to be in the RallyHub directory.', existingSlug: duplicate.slug, existingName: duplicate.name }, { status: 409 });
      }

      const now = new Date().toISOString();
      const listingSlug = await uniqueListingSlug(base44, clubName);
      const venueId = primaryVenue ? `venue-${slugify(primaryVenue)}` : null;
      const submittedVenue = venueId ? {
        id: venueId,
        name: primaryVenue,
        shortName: primaryVenue,
        address: address || town || null,
        eircode: venuePostcode || null,
        indoor: null,
        courts: null,
        latitude: null,
        longitude: null,
        mapUrl: null,
        websiteUrl: null,
        playType: null,
      } : null;
      const geocodedVenue = submittedVenue ? await geocodeDirectoryVenue(submittedVenue, { town, county }) : null;
      const publicContact = publishContact ? {
        name: contactName || null,
        phone: contactPhone || null,
        phoneHref: contactPhone ? `tel:${String(contactPhone).replace(/[^+\d]/g, '')}` : null,
        whatsapp: null,
        email: contactEmail || null,
      } : { name: null, phone: null, phoneHref: null, whatsapp: null, email: null };
      const baseListing = {
        id: listingSlug,
        slug: listingSlug,
        name: clubName,
        sport: 'Pickleball',
        county,
        town: town || null,
        region: null,
        status: 'active',
        membershipStatus: 'Contact the club for joining information',
        affiliation: null,
        logoUrl: null,
        website: safePublicUrl(website),
        facebook: safePublicUrl(facebook),
        instagram: safePublicUrl(instagram),
        waitingListUrl: null,
        joiningCtaLabel: 'Contact club',
        policyLabel: 'Club information',
        description: `${clubName} is listed in the RallyHub Club Directory for County ${county}. This listing has not yet been claimed and can be updated by an authorised club representative.`,
        guestPolicy: 'Contact the club before attending a session.',
        contact: publicContact,
        venues: submittedVenue ? [{ ...submittedVenue, latitude: geocodedVenue?.latitude ?? null, longitude: geocodedVenue?.longitude ?? null }] : [],
        sessions: [],
        source: 'RallyHub admin-curated directory listing',
        sourceCheckedAt: now.slice(0, 10),
      };

      await base44.asServiceRole.entities.DirectoryListingRecord.create({
        slug: listingSlug,
        name: clubName,
        county,
        sport: 'Pickleball',
        status: 'active',
        base_json: JSON.stringify(baseListing),
        trusted_contacts_json: JSON.stringify([{ name: contactName, role: contactRole || null, email: contactEmail || null, phone: contactPhone }]),
        created_by_user_id: user.id,
        published_at: now,
      });

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          tenant_id: String(user.active_tenant_id || 'platform'),
          ...(user.active_club_id ? { club_id: user.active_club_id } : {}),
          user_id: user.id,
          action: 'directory_admin_created_unclaimed',
          entity_type: 'DirectoryListingRecord',
          entity_id: listingSlug,
          scope_type: 'Directory',
          scope_id: listingSlug,
          after_state: JSON.stringify({ clubName, county, contactEmail, contactPhone, notes: notes || null }),
          reason: 'Super Admin pre-populated an unclaimed directory listing for later club representative claim.',
        });
      } catch (auditError) {
        console.warn('Directory admin-create audit failed', auditError?.message || auditError);
      }

      return Response.json({ success: true, status: 'unclaimed', listingSlug });
    }

    if (action === 'submit_new') {
      if (!user.email) return Response.json({ error: 'A verified account email is required' }, { status: 400 });

      const clubName = String(body.clubName || '').trim().slice(0, 180);
      const county = String(body.county || '').trim().slice(0, 100);
      const town = String(body.town || '').trim().slice(0, 120);
      const primaryVenue = String(body.primaryVenue || '').trim().slice(0, 220);
      const address = String(body.address || '').trim().slice(0, 320);
      const venuePostcode = String(body.venuePostcode || '').trim().slice(0, 40);
      const website = String(body.website || '').trim().slice(0, 320);
      const facebook = String(body.facebook || '').trim().slice(0, 320);
      const instagram = String(body.instagram || '').trim().slice(0, 320);
      const claimantName = String(body.claimantName || user.full_name || user.display_name || '').trim().slice(0, 160);
      const claimantRole = String(body.claimantRole || '').trim().slice(0, 160);
      const claimantPhone = String(body.claimantPhone || '').trim().slice(0, 80);
      const publishContact = body.publishContact !== false;
      const networkUpdatesOptIn = body.networkUpdatesOptIn === true;
      const notes = String(body.notes || '').trim().slice(0, 1500);

      if (!clubName) return Response.json({ error: 'Club name is required' }, { status: 400 });
      if (!county) return Response.json({ error: 'County is required' }, { status: 400 });
      if (!claimantName) return Response.json({ error: 'Your name is required' }, { status: 400 });
      if (!claimantRole) return Response.json({ error: 'Your role or connection to the club is required' }, { status: 400 });
      if (!claimantPhone) return Response.json({ error: 'Your mobile number is required' }, { status: 400 });

      const staticDuplicate = directoryVerificationIndex.find(x =>
        normaliseName(x.name) === normaliseName(clubName) &&
        normaliseName(x.county || '') === normaliseName(county)
      );
      const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ status: 'active' }, '-published_at', 500);
      const dynamicDuplicate = (dynamicRows || []).find(x => normaliseName(x.name) === normaliseName(clubName) && normaliseName(x.county || '') === normaliseName(county));
      const duplicate = staticDuplicate || dynamicDuplicate;
      if (duplicate) {
        return Response.json({
          error: 'This club already appears to be in the RallyHub directory.',
          existingSlug: duplicate.slug,
          existingName: duplicate.name,
        }, { status: 409 });
      }

      const existingRequests = await base44.asServiceRole.entities.DirectoryListingRequest.filter({ claimant_user_id: user.id });
      const samePending = existingRequests.find(x => x.status === 'pending' && normaliseName(x.club_name) === normaliseName(clubName));
      if (samePending) {
        return Response.json({ success: true, status: 'pending', request: publicListingRequest(samePending) });
      }
      if (user.role !== 'admin' && recentCount(existingRequests, 24) >= 5) {
        return Response.json({ error: 'Too many new-club submissions. Please try again later.' }, { status: 429 });
      }

      const request = await base44.asServiceRole.entities.DirectoryListingRequest.create({
        club_name: clubName,
        county,
        town: town || null,
        primary_venue: primaryVenue || null,
        address: address || null,
        venue_postcode: venuePostcode || null,
        website: website || null,
        facebook: facebook || null,
        instagram: instagram || null,
        claimant_user_id: user.id,
        claimant_name: claimantName,
        claimant_role: claimantRole,
        claimant_email: user.email,
        claimant_phone: claimantPhone,
        publish_contact: publishContact,
        network_updates_opt_in: networkUpdatesOptIn,
        network_updates_opted_in_at: networkUpdatesOptIn ? new Date().toISOString() : null,
        notes: notes || null,
        status: 'pending',
      });

      await sendAdminDirectoryEmail(base44, {
        user,
        kind: 'new_club_review',
        contextId: request.id,
        subject: `[RallyHub Directory] New club submission — ${clubName}`,
        body: `A new club has been submitted for the RallyHub Directory.\n\nClub: ${clubName}\nCounty: ${county}\nTown / area: ${town || '(not supplied)'}\nPrimary venue: ${primaryVenue || '(not supplied)'}\nAddress: ${address || '(not supplied)'}\nEircode / postcode: ${venuePostcode || '(not supplied)'}\n\nSubmitted by: ${claimantName}\nRole: ${claimantRole}\nEmail: ${user.email}\nMobile: ${claimantPhone}\nUse submitted details as public club contact: ${publishContact ? 'Yes' : 'No'}\nNetwork updates: ${networkUpdatesOptIn ? 'Opted in' : 'No'}\n\nWebsite: ${website || '(none)'}\nFacebook: ${facebook || '(none)'}\nInstagram: ${instagram || '(none)'}\n\nNotes: ${notes || '(none)'}\n\nReview this request in RallyHub Admin → Directory Claims.\nhttps://rallyhub.ie/app/admin?tab=directory`,
      });

      return Response.json({ success: true, status: 'pending', request: publicListingRequest(request) });
    }

    if (action === 'new_status') {
      const requests = await base44.asServiceRole.entities.DirectoryListingRequest.filter({ claimant_user_id: user.id });
      const latest = [...requests].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')))[0] || null;
      const publicRequest = publicListingRequest(latest);
      if (latest?.status === 'approved' && latest?.approved_listing_slug) {
        const stillPublished = await resolveListing(base44, latest.approved_listing_slug);
        if (!stillPublished) return Response.json({ success: true, request: { ...publicRequest, status: 'removed' } });
      }
      return Response.json({ success: true, request: publicRequest });
    }

    if (action === 'status') {
      const listingSlug = String(body.listingSlug || '').trim();
      const listing = await resolveListing(base44, listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      const [claims, accesses, allListingAccesses] = await Promise.all([
        base44.asServiceRole.entities.DirectoryClaim.filter({ listing_slug: listingSlug, claimant_user_id: user.id }),
        base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, user_id: user.id }),
        base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' }),
      ]);
      const latest = [...claims].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')))[0] || null;
      const access = accesses.find(x => x.status === 'active') || null;
      return Response.json({
        success: true,
        listing: { slug: listing.slug, name: listing.name, verificationStatus: allListingAccesses?.length ? 'verified' : 'unclaimed' },
        claim: publicClaim(latest),
        hasAccess: !!access,
        accessRole: access?.role || null,
        canManageAccess: user.role === 'admin' || access?.role === 'owner',
      });
    }

    if (action === 'send_claim_invite') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const listingSlug = String(body.listingSlug || '').trim();
      const contactEmail = normaliseEmail(body.contactEmail || '').slice(0, 240);
      const contactName = String(body.contactName || '').trim().slice(0, 160);
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      const listing = await resolveListing(base44, listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      const anyAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' });
      if (anyAccess?.length) return Response.json({ error: 'This listing has already been claimed.' }, { status: 409 });
      if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return Response.json({ error: 'A valid club contact email is required' }, { status: 400 });

      const records = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
      const record = records?.[0];
      if (record) {
        let trusted:any[] = [];
        try { trusted = record.trusted_contacts_json ? JSON.parse(record.trusted_contacts_json) : []; } catch { trusted = []; }
        const currentPhone = String(body.contactPhone || '').trim().slice(0, 80);
        const retained = (Array.isArray(trusted) ? trusted : []).filter((item:any) => normaliseEmail(item?.email) !== contactEmail);
        retained.unshift({ name: contactName || null, email: contactEmail, phone: currentPhone || null });
        await base44.asServiceRole.entities.DirectoryListingRecord.update(record.id, { trusted_contacts_json: JSON.stringify(retained.slice(0, 10)) });
      }

      try {
        const contactPhone = String(body.contactPhone || '').trim().slice(0, 80);
        const previousInvites = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({ listing_slug: listingSlug, status: 'pending' }, '-created_date', 50);
        for (const row of previousInvites || []) {
          const sameEmail = contactEmail && normaliseEmail(row.contact_email) === contactEmail;
          const samePhone = contactPhone && row.contact_phone && phoneLooksSame(row.contact_phone, contactPhone);
          if (row.access_role === 'owner' && (sameEmail || samePhone)) {
            await base44.asServiceRole.entities.DirectoryClaimInvitation.update(row.id, { status: 'revoked' });
          }
        }
        const invitation = await createTrustedClaimInvitation(base44, {
          listing,
          user,
          contactName,
          contactEmail,
          contactPhone,
          channel: 'email',
          accessRole: 'owner',
        });
        const result = await sendClaimInviteEmail(base44, { user, listing, contactEmail, contactName, claimUrl: invitation.claimUrl });
        if (!result.sent) return Response.json({ error: result.error || 'Could not send claim invitation.' }, { status: result.limited ? 429 : 502 });
        return Response.json({ success: true, sent: true, email: result.to, claimUrl: result.claimUrl, expiresAt: invitation.expiresAt });
      } catch (emailError) {
        console.warn('Directory claim invitation failed', emailError?.message || emailError);
        return Response.json({ error: 'Could not send the claim invitation right now.' }, { status: 502 });
      }
    }

    if (action === 'create_claim_invite') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const listingSlug = String(body.listingSlug || '').trim();
      const contactName = String(body.contactName || '').trim().slice(0, 160);
      const contactEmail = normaliseEmail(body.contactEmail || '').slice(0, 240);
      const contactPhone = String(body.contactPhone || '').trim().slice(0, 80);
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      if (!contactPhone && !contactEmail) return Response.json({ error: 'A trusted email or mobile number is required' }, { status: 400 });
      const listing = await resolveListing(base44, listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      const anyAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' });
      if (anyAccess?.length) return Response.json({ error: 'This listing has already been claimed.' }, { status: 409 });

      const records = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
      const record = records?.[0];
      if (record) {
        let trusted:any[] = [];
        try { trusted = record.trusted_contacts_json ? JSON.parse(record.trusted_contacts_json) : []; } catch { trusted = []; }
        const retained = (Array.isArray(trusted) ? trusted : []).filter((item:any) =>
          !(contactEmail && normaliseEmail(item?.email) === contactEmail) &&
          !(contactPhone && item?.phone && phoneLooksSame(item.phone, contactPhone))
        );
        retained.unshift({ name: contactName || null, email: contactEmail || null, phone: contactPhone || null });
        await base44.asServiceRole.entities.DirectoryListingRecord.update(record.id, { trusted_contacts_json: JSON.stringify(retained.slice(0, 10)) });
      }

      const inviteChannel = String(body.channel || 'whatsapp') === 'email' ? 'email' : 'whatsapp';
      const previousInvites = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({ listing_slug: listingSlug, status: 'pending' }, '-created_date', 50);
      for (const row of previousInvites || []) {
        const sameEmail = contactEmail && normaliseEmail(row.contact_email) === contactEmail;
        const samePhone = contactPhone && row.contact_phone && phoneLooksSame(row.contact_phone, contactPhone);
        if (row.access_role === 'owner' && (sameEmail || samePhone)) {
          await base44.asServiceRole.entities.DirectoryClaimInvitation.update(row.id, { status: 'revoked' });
        }
      }

      const invitation = await createTrustedClaimInvitation(base44, {
        listing,
        user,
        contactName,
        contactEmail,
        contactPhone,
        channel: inviteChannel,
        accessRole: 'owner',
      });
      try {
        await base44.asServiceRole.entities.DirectoryListingAudit.create({
          listing_slug: listingSlug,
          user_id: user.id,
          action: 'access_invited',
          occurred_at: new Date().toISOString(),
          after_json: JSON.stringify({ role: 'owner', channel: inviteChannel, email: contactEmail || null, phone: contactPhone || null, expiresAt: invitation.expiresAt }),
        });
      } catch (auditError) {
        console.warn('Directory owner invitation audit write failed', auditError?.message || auditError);
      }
      return Response.json({ success: true, channel: inviteChannel, claimUrl: invitation.claimUrl, expiresAt: invitation.expiresAt });
    }


    if (action === 'access_list') {
      const listingSlug = String(body.listingSlug || '').trim();
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      const ownAccess = user.role === 'admin' ? null : (await base44.asServiceRole.entities.DirectoryListingAccess.filter({
        listing_slug: listingSlug, user_id: user.id, status: 'active'
      }))[0] || null;
      if (user.role !== 'admin' && !ownAccess) return Response.json({ error: 'Directory access required' }, { status: 403 });

      const accesses = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' }, 'granted_at', 50);
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const userMap = new Map((users || []).map((row:any) => [String(row.id), row]));
      const canManageAccess = user.role === 'admin' || ownAccess?.role === 'owner';
      const people = (accesses || []).map((row:any) => {
        const person = userMap.get(String(row.user_id));
        const isCurrentUser = String(row.user_id) === String(user.id);
        return {
          id: row.id,
          userId: row.user_id,
          role: row.role === 'owner' ? 'owner' : 'editor',
          name: person?.full_name || person?.display_name || person?.email || 'Directory user',
          email: canManageAccess || isCurrentUser ? (person?.email || null) : null,
          grantedAt: row.granted_at || null,
          isCurrentUser,
        };
      });
      let pendingInvitations:any[] = [];
      if (canManageAccess) {
        const invitations = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({ listing_slug: listingSlug, status: 'pending' }, '-created_date', 30);
        pendingInvitations = (invitations || [])
          .filter((row:any) => row.access_role === 'editor' && (!row.expires_at || Date.parse(row.expires_at) >= Date.now()))
          .map((row:any) => ({
            id: row.id,
            name: row.contact_name || null,
            email: row.contact_email || null,
            phone: row.contact_phone || null,
            expiresAt: row.expires_at || null,
          }));
      }
      return Response.json({ success: true, people, pendingInvitations, canManageAccess });
    }

    if (action === 'invite_editor') {
      const listingSlug = String(body.listingSlug || '').trim();
      const contactName = String(body.contactName || '').trim().slice(0, 160);
      const contactEmail = normaliseEmail(body.contactEmail || '').slice(0, 240);
      const contactPhone = String(body.contactPhone || '').trim().slice(0, 80);
      const inviteChannel = String(body.channel || 'email') === 'whatsapp' ? 'whatsapp' : 'email';
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      if (inviteChannel === 'email' && (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))) return Response.json({ error: 'A valid email address is required for an email invitation.' }, { status: 400 });
      if (inviteChannel === 'whatsapp' && !contactPhone) return Response.json({ error: 'A mobile number is required for a WhatsApp invitation.' }, { status: 400 });

      const ownerAccess = user.role === 'admin' ? null : (await base44.asServiceRole.entities.DirectoryListingAccess.filter({
        listing_slug: listingSlug, user_id: user.id, status: 'active'
      }))[0] || null;
      if (user.role !== 'admin' && ownerAccess?.role !== 'owner') return Response.json({ error: 'Only the Primary Owner can invite Directory Editors.' }, { status: 403 });

      const listing = await resolveListing(base44, listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });

      if (contactEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ email: contactEmail });
        const targetUser = users?.[0] || null;
        if (targetUser) {
          const existing = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, user_id: targetUser.id, status: 'active' });
          if (existing?.length) return Response.json({ error: 'That person already has access to this listing.' }, { status: 409 });
        }
      }

      const previousInvites = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({ listing_slug: listingSlug, status: 'pending' }, '-created_date', 50);
      for (const row of previousInvites || []) {
        const sameEmail = contactEmail && normaliseEmail(row.contact_email) === contactEmail;
        const samePhone = contactPhone && row.contact_phone && phoneLooksSame(row.contact_phone, contactPhone);
        if (row.access_role === 'editor' && (sameEmail || samePhone)) {
          await base44.asServiceRole.entities.DirectoryClaimInvitation.update(row.id, { status: 'revoked' });
        }
      }

      const invitation = await createTrustedClaimInvitation(base44, {
        listing, user, contactName, contactEmail, contactPhone, channel: inviteChannel, accessRole: 'editor'
      });
      if (inviteChannel === 'email') {
        const result = await sendClaimInviteEmail(base44, {
          user, listing, contactEmail, contactName, claimUrl: invitation.claimUrl, accessRole: 'editor'
        });
        if (!result.sent) return Response.json({ error: result.error || 'Could not send editor invitation.' }, { status: result.limited ? 429 : 502 });
      }

      await base44.asServiceRole.entities.DirectoryListingAudit.create({
        listing_slug: listingSlug,
        user_id: user.id,
        action: 'access_invited',
        occurred_at: new Date().toISOString(),
        after_json: JSON.stringify({ role: 'editor', channel: inviteChannel, email: contactEmail || null, phone: contactPhone || null, expiresAt: invitation.expiresAt }),
      });
      return Response.json({ success: true, channel: inviteChannel, email: contactEmail || null, phone: contactPhone || null, claimUrl: invitation.claimUrl, expiresAt: invitation.expiresAt });
    }

    if (action === 'revoke_editor') {
      const listingSlug = String(body.listingSlug || '').trim();
      const accessId = String(body.accessId || '').trim();
      if (!listingSlug || !accessId) return Response.json({ error: 'listingSlug and accessId required' }, { status: 400 });

      const ownerAccess = user.role === 'admin' ? null : (await base44.asServiceRole.entities.DirectoryListingAccess.filter({
        listing_slug: listingSlug, user_id: user.id, status: 'active'
      }))[0] || null;
      if (user.role !== 'admin' && ownerAccess?.role !== 'owner') return Response.json({ error: 'Only the Primary Owner can remove Directory Editors.' }, { status: 403 });

      const matches = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ id: accessId });
      const target = matches?.[0];
      if (!target || target.listing_slug !== listingSlug || target.status !== 'active') return Response.json({ error: 'Active access record not found.' }, { status: 404 });
      if (target.role === 'owner') return Response.json({ error: 'The Primary Owner cannot be removed through the editor-management screen.' }, { status: 409 });

      const now = new Date().toISOString();
      await base44.asServiceRole.entities.DirectoryListingAccess.update(target.id, {
        status: 'revoked', revoked_by_user_id: user.id, revoked_at: now,
        notes: [target.notes, 'Delegated Directory Editor access revoked by Primary Owner or RallyHub Super Admin.'].filter(Boolean).join(' '),
      });
      await base44.asServiceRole.entities.DirectoryListingAudit.create({
        listing_slug: listingSlug,
        user_id: user.id,
        action: 'access_revoked',
        occurred_at: now,
        before_json: JSON.stringify({ accessId: target.id, userId: target.user_id, role: target.role }),
        after_json: JSON.stringify({ status: 'revoked' }),
      });
      return Response.json({ success: true, status: 'revoked' });
    }

    if (action === 'list_admin') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const [claims, accesses, listingRequests, listingRecords, invitations] = await Promise.all([
        base44.asServiceRole.entities.DirectoryClaim.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingAccess.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingRequest.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingRecord.list('-published_at', 500),
        base44.asServiceRole.entities.DirectoryClaimInvitation.list('-created_date', 300),
      ]);
      const directoryUserIds = [...new Set((accesses || []).filter((a:any) => a.status === 'active' && a.user_id).map((a:any) => String(a.user_id)))];
      await Promise.all(directoryUserIds.map((id:string) => hardenDirectoryOnlyAccount(base44, id)));
      return Response.json({ success: true, claims, accesses, listingRequests, listingRecords, invitations });
    }

    if (action === 'review') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const claimId = String(body.claimId || '').trim();
      const decision = String(body.decision || '').trim();
      const reviewNotes = String(body.reviewNotes || '').trim().slice(0, 1500);
      if (!claimId || !['approved', 'rejected'].includes(decision)) {
        return Response.json({ error: 'Valid claimId and decision required' }, { status: 400 });
      }
      const claims = await base44.asServiceRole.entities.DirectoryClaim.filter({ id: claimId });
      const claim = claims[0];
      if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });
      const listing = await resolveListing(base44, claim.listing_slug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });

      await base44.asServiceRole.entities.DirectoryClaim.update(claim.id, {
        status: decision,
        match_method: decision === 'approved' ? 'admin_approved' : claim.match_method,
        reviewed_by_user_id: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
      });

      if (decision === 'approved') {
        const existingListingAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: claim.listing_slug, status: 'active' });
        await grantAccess(base44, {
          listing,
          userId: claim.claimant_user_id,
          claimId: claim.id,
          grantedByUserId: user.id,
          role: existingListingAccess?.length ? 'editor' : 'owner',
          notes: reviewNotes || 'Manually verified by RallyHub administrator.',
        });
      }
      return Response.json({ success: true, status: decision });
    }

    if (action === 'approve_invitation') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const invitationId = String(body.invitationId || '').trim();
      if (!invitationId) return Response.json({ error: 'invitationId required' }, { status: 400 });
      const invitations = await base44.asServiceRole.entities.DirectoryClaimInvitation.filter({ id: invitationId });
      const invitation = invitations?.[0];
      if (!invitation || invitation.status !== 'pending') return Response.json({ error: 'Pending invitation not found' }, { status: 404 });
      const listing = await resolveListing(base44, invitation.listing_slug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });

      const claims = await base44.asServiceRole.entities.DirectoryClaim.filter({ listing_slug: invitation.listing_slug }, '-created_date', 100);
      const matchingClaim = (claims || []).find(claim =>
        claim.status === 'pending' &&
        (String(claim.claimant_user_id || '') === String(invitation.used_by_user_id || '') ||
          (invitation.contact_email && normaliseEmail(claim.claimant_email) === normaliseEmail(invitation.contact_email)) ||
          (invitation.contact_phone && phoneLooksSame(claim.claimant_phone, invitation.contact_phone)) ||
          (invitation.contact_name && normaliseName(claim.claimant_name) === normaliseName(invitation.contact_name)))
      ) || null;

      let targetUserId = invitation.used_by_user_id || matchingClaim?.claimant_user_id || null;
      if (!targetUserId && invitation.contact_email) {
        const users = await base44.asServiceRole.entities.User.filter({ email: normaliseEmail(invitation.contact_email) });
        targetUserId = users?.[0]?.id || null;
      }
      if (!targetUserId) {
        return Response.json({ error: 'This person needs to open the secure claim link and sign in once before you can approve owner access.' }, { status: 409 });
      }

      const now = new Date().toISOString();
      const existingListingAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: invitation.listing_slug, status: 'active' });
      const grantedRole = invitation.access_role === 'editor' || existingListingAccess?.length ? 'editor' : 'owner';
      const access = await grantAccess(base44, {
        listing,
        userId: targetUserId,
        claimId: matchingClaim?.id || null,
        grantedByUserId: user.id,
        role: grantedRole,
        notes: `Manually approved from pending ${grantedRole === 'owner' ? 'owner' : 'editor'} invitation by RallyHub administrator.`,
      });
      if (matchingClaim) {
        await base44.asServiceRole.entities.DirectoryClaim.update(matchingClaim.id, {
          status: 'approved',
          match_method: 'admin_approved_invitation',
          reviewed_by_user_id: user.id,
          reviewed_at: now,
          review_notes: 'Approved from pending directory invitation.',
        });
      }
      await base44.asServiceRole.entities.DirectoryClaimInvitation.update(invitation.id, {
        status: 'used',
        used_by_user_id: targetUserId,
        used_at: now,
      });
      await base44.asServiceRole.entities.DirectoryListingAudit.create({
        listing_slug: invitation.listing_slug,
        user_id: user.id,
        action: grantedRole === 'owner' ? 'owner_assigned' : 'access_granted',
        occurred_at: now,
        after_json: JSON.stringify({ role: grantedRole, source: 'admin_approved_invitation', accessId: access?.id || null, targetUserId }),
      });
      return Response.json({ success: true, status: 'approved', role: grantedRole, accessId: access?.id || null });
    }

    if (action === 'review_new') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const requestId = String(body.requestId || '').trim();
      const decision = String(body.decision || '').trim();
      const reviewNotes = String(body.reviewNotes || '').trim().slice(0, 1500);
      if (!requestId || !['approved', 'rejected'].includes(decision)) {
        return Response.json({ error: 'Valid requestId and decision required' }, { status: 400 });
      }
      const requests = await base44.asServiceRole.entities.DirectoryListingRequest.filter({ id: requestId });
      const request = requests[0];
      if (!request) return Response.json({ error: 'Directory listing request not found' }, { status: 404 });
      const now = new Date().toISOString();

      if (decision === 'rejected') {
        await base44.asServiceRole.entities.DirectoryListingRequest.update(request.id, {
          status: 'rejected',
          reviewed_by_user_id: user.id,
          reviewed_at: now,
          review_notes: reviewNotes || null,
        });
        return Response.json({ success: true, status: 'rejected' });
      }

      if (request.status === 'approved' && request.approved_listing_slug) {
        return Response.json({ success: true, status: 'approved', listingSlug: request.approved_listing_slug });
      }

      const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ status: 'active' }, '-published_at', 500);
      const duplicate = (dynamicRows || []).find(x => normaliseName(x.name) === normaliseName(request.club_name) && normaliseName(x.county || '') === normaliseName(request.county || ''));
      const listingSlug = duplicate?.slug || await uniqueListingSlug(base44, request.club_name);
      const listing = { slug: listingSlug, name: request.club_name, county: request.county };

      if (!duplicate) {
        const venueId = request.primary_venue ? `venue-${slugify(request.primary_venue)}` : null;
        const submittedVenue = venueId ? {
          id: venueId,
          name: request.primary_venue,
          shortName: request.primary_venue,
          address: request.address || request.town || null,
          eircode: request.venue_postcode || null,
          indoor: null,
          courts: null,
          latitude: null,
          longitude: null,
          mapUrl: null,
          websiteUrl: null,
          playType: null,
        } : null;
        const geocodedVenue = submittedVenue ? await geocodeDirectoryVenue(submittedVenue, { town: request.town, county: request.county }) : null;
        const baseListing = {
          id: listingSlug,
          slug: listingSlug,
          name: request.club_name,
          sport: 'Pickleball',
          county: request.county,
          town: request.town || null,
          region: null,
          status: 'active',
          membershipStatus: 'Contact the club for joining information',
          affiliation: null,
          logoUrl: null,
          website: safePublicUrl(request.website),
          facebook: safePublicUrl(request.facebook),
          instagram: safePublicUrl(request.instagram),
          waitingListUrl: null,
          joiningCtaLabel: 'Contact club',
          policyLabel: 'Club information',
          description: `${request.club_name} is a pickleball club or group in County ${request.county}. The verified club representative is completing this listing.`,
          guestPolicy: 'Contact the club before attending a session.',
          contact: request.publish_contact === true ? {
            name: request.claimant_name || null,
            phone: request.claimant_phone || null,
            phoneHref: request.claimant_phone ? `tel:${String(request.claimant_phone).replace(/[^+\d]/g, '')}` : null,
            whatsapp: null,
            email: request.claimant_email || null,
          } : { name: null, phone: null, phoneHref: null, whatsapp: null, email: null },
          venues: submittedVenue ? [{
            ...submittedVenue,
            latitude: geocodedVenue?.latitude ?? null,
            longitude: geocodedVenue?.longitude ?? null,
          }] : [],
          sessions: [],
          source: 'Submitted to RallyHub Directory',
          sourceCheckedAt: now.slice(0, 10),
        };
        await base44.asServiceRole.entities.DirectoryListingRecord.create({
          slug: listingSlug,
          name: request.club_name,
          county: request.county,
          sport: 'Pickleball',
          status: 'active',
          base_json: JSON.stringify(baseListing),
          trusted_contacts_json: JSON.stringify([{ name: request.claimant_name, email: request.claimant_email, phone: request.claimant_phone }]),
          source_request_id: request.id,
          created_by_user_id: request.claimant_user_id,
          published_at: now,
        });
      }

      const access = await grantAccess(base44, {
        listing,
        userId: request.claimant_user_id,
        claimId: null,
        grantedByUserId: user.id,
        role: 'owner',
        notes: reviewNotes || 'New directory listing approved and submitter verified as Primary Directory Owner.',
      });

      await base44.asServiceRole.entities.DirectoryListingRequest.update(request.id, {
        status: 'approved',
        approved_listing_slug: listingSlug,
        reviewed_by_user_id: user.id,
        reviewed_at: now,
        review_notes: reviewNotes || null,
      });
      return Response.json({ success: true, status: 'approved', listingSlug, accessId: access?.id || null });
    }

    if (action === 'archive_listing') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const listingSlug = String(body.listingSlug || '').trim();
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });

      // Only database-backed listings can be removed here. Curated seed listings are
      // deliberately protected from accidental deletion through this admin workflow.
      const records = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
      const record = records?.[0];
      if (!record) return Response.json({ error: 'Published directory listing not found or cannot be removed here' }, { status: 404 });

      const now = new Date().toISOString();
      await base44.asServiceRole.entities.DirectoryListingRecord.update(record.id, { status: 'archived' });

      const profiles = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug: listingSlug, status: 'active' }, '-updated_at', 20);
      for (const profile of profiles || []) {
        await base44.asServiceRole.entities.DirectoryListingProfile.update(profile.id, { status: 'archived', updated_at: now, updated_by_user_id: user.id });
      }

      const accesses = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' });
      for (const access of accesses || []) {
        await base44.asServiceRole.entities.DirectoryListingAccess.update(access.id, {
          status: 'revoked', revoked_by_user_id: user.id, revoked_at: now,
          notes: [access.notes, 'Directory listing removed by RallyHub administrator.'].filter(Boolean).join(' '),
        });
      }

      try {
        await base44.asServiceRole.entities.DirectoryListingAudit.create({
          listing_slug: listingSlug,
          user_id: user.id,
          action: 'listing_archived',
          occurred_at: now,
          before_json: record.base_json || JSON.stringify({ name: record.name, county: record.county }),
          after_json: JSON.stringify({ status: 'archived', removed_at: now }),
        });
      } catch (auditError) {
        console.warn('Directory listing archive audit write failed', auditError?.message || auditError);
      }

      return Response.json({ success: true, status: 'archived', listingSlug });
    }

    if (action === 'revoke') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const accessId = String(body.accessId || '').trim();
      if (!accessId) return Response.json({ error: 'accessId required' }, { status: 400 });
      const matches = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ id: accessId });
      const access = matches[0];
      if (!access) return Response.json({ error: 'Access record not found' }, { status: 404 });
      await base44.asServiceRole.entities.DirectoryListingAccess.update(access.id, {
        status: 'revoked',
        revoked_by_user_id: user.id,
        revoked_at: new Date().toISOString(),
      });
      return Response.json({ success: true, status: 'revoked' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('directoryClaim error', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
});