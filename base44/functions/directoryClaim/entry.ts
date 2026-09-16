import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';
import { directoryVerificationIndex } from './contactIndex.ts';

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
  // Country-code tolerant comparison is evidence only; phone matches never auto-grant access.
  const tail = Math.min(9, aa.length, bb.length);
  return tail >= 8 && aa.slice(-tail) === bb.slice(-tail);
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
    created_date: request.created_date,
    reviewed_at: request.reviewed_at || null,
    review_notes: request.status === 'rejected' ? request.review_notes || null : null,
  };
}

async function grantAccess(base44, { listing, userId, claimId, grantedByUserId = null, notes = '' }) {
  const existing = await base44.asServiceRole.entities.DirectoryListingAccess.filter({
    listing_slug: listing.slug,
    user_id: userId,
  });
  const active = existing.find(x => x.status === 'active');
  if (active) return active;

  const revoked = existing.find(x => x.status === 'revoked');
  if (revoked) {
    await base44.asServiceRole.entities.DirectoryListingAccess.update(revoked.id, {
      status: 'active',
      verification_claim_id: claimId,
      granted_by_user_id: grantedByUserId,
      granted_at: new Date().toISOString(),
      revoked_by_user_id: null,
      revoked_at: null,
      notes,
    });
    const refreshed = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ id: revoked.id });
    return refreshed[0] || revoked;
  }

  return await base44.asServiceRole.entities.DirectoryListingAccess.create({
    listing_slug: listing.slug,
    listing_name_snapshot: listing.name,
    user_id: userId,
    role: 'editor',
    status: 'active',
    verification_claim_id: claimId,
    granted_by_user_id: grantedByUserId,
    granted_at: new Date().toISOString(),
    notes,
  });
}

// Directory verification notifications are intentionally kept inside RallyHub for now.
// Email delivery will be added only after the dedicated RallyHub contact mailbox is configured.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'submit';

    if (action === 'submit') {
      const listingSlug = String(body.listingSlug || '').trim();
      const listing = directoryVerificationIndex.find(x => x.slug === listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      if (!user.email) return Response.json({ error: 'A verified account email is required' }, { status: 400 });

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
      if (pending) {
        return Response.json({ success: true, verified: false, status: 'pending', claim: publicClaim(pending), hasAccess: false });
      }

      const claimantName = String(body.claimantName || user.full_name || user.display_name || '').trim().slice(0, 160);
      const claimantRole = String(body.claimantRole || '').trim().slice(0, 160);
      const claimantPhone = String(body.claimantPhone || '').trim().slice(0, 80);
      const claimantMessage = String(body.claimantMessage || '').trim().slice(0, 1500);
      const networkUpdatesOptIn = body.networkUpdatesOptIn === true;
      if (!claimantName) return Response.json({ error: 'Your name is required' }, { status: 400 });
      if (!claimantRole) return Response.json({ error: 'Your role or connection to the club is required' }, { status: 400 });
      if (!claimantPhone) return Response.json({ error: 'Your mobile number is required' }, { status: 400 });

      const userEmail = normaliseEmail(user.email);
      const trustedContacts = listing.contacts || [];
      const emailMatch = trustedContacts.some(c => normaliseEmail(c.email) && normaliseEmail(c.email) === userEmail);
      const nameMatch = trustedContacts.some(c => normaliseName(c.name) && normaliseName(c.name) === normaliseName(claimantName));
      const phoneMatch = claimantPhone
        ? trustedContacts.some(c => c.phone && phoneLooksSame(c.phone, claimantPhone))
        : false;

      // Normal users auto-verify only when their authenticated account email exactly matches a trusted club email.
      // A RallyHub platform admin may also auto-verify when BOTH trusted name and trusted phone match the claim.
      // This recognises a known platform identity without weakening the rule for external claimants.
      // Once a listing is already verified, additional editors always require manual review.
      const adminIdentityMatch = user.role === 'admin' && nameMatch && phoneMatch;
      const autoVerified = (emailMatch || adminIdentityMatch) && listing.verificationStatus !== 'verified';
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
        match_method: autoVerified ? (emailMatch ? 'authenticated_email' : 'platform_admin_identity') : 'manual_review',
        email_match: emailMatch,
        phone_match: phoneMatch,
        name_match: nameMatch,
        network_updates_opt_in: networkUpdatesOptIn,
        network_updates_opted_in_at: networkUpdatesOptIn ? now : null,
        auto_verified_at: autoVerified ? now : null,
      });

      if (autoVerified) {
        await grantAccess(base44, {
          listing,
          userId: user.id,
          claimId: claim.id,
          grantedByUserId: null,
          notes: emailMatch
            ? 'Automatically verified by exact match to authenticated account email.'
            : 'Automatically verified for a known RallyHub platform admin whose trusted name and phone both matched.',
        });
        return Response.json({
          success: true,
          verified: true,
          status: 'auto_verified',
          hasAccess: true,
          message: 'Your connection to this club has been verified.',
        });
      }

      return Response.json({
        success: true,
        verified: false,
        status: 'pending',
        hasAccess: false,
        message: 'We could not verify your connection automatically. Your request has been sent to RallyHub for review.',
      });
    }

    if (action === 'submit_new') {
      if (!user.email) return Response.json({ error: 'A verified account email is required' }, { status: 400 });

      const clubName = String(body.clubName || '').trim().slice(0, 180);
      const county = String(body.county || '').trim().slice(0, 100);
      const town = String(body.town || '').trim().slice(0, 120);
      const primaryVenue = String(body.primaryVenue || '').trim().slice(0, 220);
      const address = String(body.address || '').trim().slice(0, 320);
      const website = String(body.website || '').trim().slice(0, 320);
      const facebook = String(body.facebook || '').trim().slice(0, 320);
      const instagram = String(body.instagram || '').trim().slice(0, 320);
      const claimantName = String(body.claimantName || user.full_name || user.display_name || '').trim().slice(0, 160);
      const claimantRole = String(body.claimantRole || '').trim().slice(0, 160);
      const claimantPhone = String(body.claimantPhone || '').trim().slice(0, 80);
      const networkUpdatesOptIn = body.networkUpdatesOptIn === true;
      const notes = String(body.notes || '').trim().slice(0, 1500);

      if (!clubName) return Response.json({ error: 'Club name is required' }, { status: 400 });
      if (!county) return Response.json({ error: 'County is required' }, { status: 400 });
      if (!claimantName) return Response.json({ error: 'Your name is required' }, { status: 400 });
      if (!claimantRole) return Response.json({ error: 'Your role or connection to the club is required' }, { status: 400 });
      if (!claimantPhone) return Response.json({ error: 'Your mobile number is required' }, { status: 400 });

      const duplicate = directoryVerificationIndex.find(x =>
        normaliseName(x.name) === normaliseName(clubName) &&
        normaliseName(x.county || '') === normaliseName(county)
      );
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

      const request = await base44.asServiceRole.entities.DirectoryListingRequest.create({
        club_name: clubName,
        county,
        town: town || null,
        primary_venue: primaryVenue || null,
        address: address || null,
        website: website || null,
        facebook: facebook || null,
        instagram: instagram || null,
        claimant_user_id: user.id,
        claimant_name: claimantName,
        claimant_role: claimantRole,
        claimant_email: user.email,
        claimant_phone: claimantPhone,
        network_updates_opt_in: networkUpdatesOptIn,
        network_updates_opted_in_at: networkUpdatesOptIn ? new Date().toISOString() : null,
        notes: notes || null,
        status: 'pending',
      });

      return Response.json({ success: true, status: 'pending', request: publicListingRequest(request) });
    }

    if (action === 'new_status') {
      const requests = await base44.asServiceRole.entities.DirectoryListingRequest.filter({ claimant_user_id: user.id });
      const latest = [...requests].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')))[0] || null;
      return Response.json({ success: true, request: publicListingRequest(latest) });
    }

    if (action === 'status') {
      const listingSlug = String(body.listingSlug || '').trim();
      const listing = directoryVerificationIndex.find(x => x.slug === listingSlug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });
      const [claims, accesses] = await Promise.all([
        base44.asServiceRole.entities.DirectoryClaim.filter({ listing_slug: listingSlug, claimant_user_id: user.id }),
        base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, user_id: user.id }),
      ]);
      const latest = [...claims].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')))[0] || null;
      const access = accesses.find(x => x.status === 'active') || null;
      return Response.json({
        success: true,
        listing: { slug: listing.slug, name: listing.name, verificationStatus: listing.verificationStatus },
        claim: publicClaim(latest),
        hasAccess: !!access,
      });
    }

    if (action === 'list_admin') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const [claims, accesses, listingRequests] = await Promise.all([
        base44.asServiceRole.entities.DirectoryClaim.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingAccess.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingRequest.list('-created_date', 300),
      ]);
      return Response.json({ success: true, claims, accesses, listingRequests });
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
      const listing = directoryVerificationIndex.find(x => x.slug === claim.listing_slug);
      if (!listing) return Response.json({ error: 'Directory listing not found' }, { status: 404 });

      await base44.asServiceRole.entities.DirectoryClaim.update(claim.id, {
        status: decision,
        match_method: decision === 'approved' ? 'admin_approved' : claim.match_method,
        reviewed_by_user_id: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
      });

      if (decision === 'approved') {
        await grantAccess(base44, {
          listing,
          userId: claim.claimant_user_id,
          claimId: claim.id,
          grantedByUserId: user.id,
          notes: reviewNotes || 'Manually verified by RallyHub administrator.',
        });
      }
      return Response.json({ success: true, status: decision });
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
      await base44.asServiceRole.entities.DirectoryListingRequest.update(request.id, {
        status: decision,
        reviewed_by_user_id: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
      });
      return Response.json({ success: true, status: decision });
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
