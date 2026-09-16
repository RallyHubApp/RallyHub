import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';
import { directoryVerificationIndex } from './contactIndex.ts';
import { geocodeDirectoryVenue } from '../_shared/directoryGeocode.ts';

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
    ...(claimId ? { verification_claim_id: claimId } : {}),
    ...(grantedByUserId ? { granted_by_user_id: grantedByUserId } : {}),
    granted_at: new Date().toISOString(),
    notes,
  });
}

async function sendAdminDirectoryEmail(base44, { subject, body }) {
  try {
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

    if (action === 'submit') {
      const listingSlug = String(body.listingSlug || '').trim();
      const listing = await resolveListing(base44, listingSlug);
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
      const anyExistingAccess = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' });
      const listingAlreadyVerified = listing.verificationStatus === 'verified' || !!anyExistingAccess?.length;
      const autoVerified = (emailMatch || adminIdentityMatch) && !listingAlreadyVerified;
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

      await sendAdminDirectoryEmail(base44, {
        subject: `[RallyHub Directory] Verification needed — ${listing.name}`,
        body: `A club representative needs manual verification.\n\nClub: ${listing.name}\nCounty: ${listing.county || '(not supplied)'}\nName: ${claimantName}\nRole: ${claimantRole}\nEmail: ${user.email}\nMobile: ${claimantPhone}\n\nVerification signals:\n• Trusted email match: ${emailMatch ? 'Yes' : 'No'}\n• Trusted name match: ${nameMatch ? 'Yes' : 'No'}\n• Trusted phone match: ${phoneMatch ? 'Yes' : 'No'}\n\nMessage: ${claimantMessage || '(none)'}\n\nReview this request in RallyHub Admin → Directory Claims.\nhttps://rallyhub.ie/app/admin?tab=directory`,
      });

      return Response.json({
        success: true,
        verified: false,
        status: 'pending',
        hasAccess: false,
        message: 'We could not verify your connection automatically. A verification request has been sent to RallyHub for review.',
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

      await sendAdminDirectoryEmail(base44, {
        subject: `[RallyHub Directory] New club submission — ${clubName}`,
        body: `A new club has been submitted for the RallyHub Directory.\n\nClub: ${clubName}\nCounty: ${county}\nTown / area: ${town || '(not supplied)'}\nPrimary venue: ${primaryVenue || '(not supplied)'}\nAddress / Eircode: ${address || '(not supplied)'}\n\nSubmitted by: ${claimantName}\nRole: ${claimantRole}\nEmail: ${user.email}\nMobile: ${claimantPhone}\nNetwork updates: ${networkUpdatesOptIn ? 'Opted in' : 'No'}\n\nWebsite: ${website || '(none)'}\nFacebook: ${facebook || '(none)'}\nInstagram: ${instagram || '(none)'}\n\nNotes: ${notes || '(none)'}\n\nReview this request in RallyHub Admin → Directory Claims.\nhttps://rallyhub.ie/app/admin?tab=directory`,
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
      const [claims, accesses, listingRequests, listingRecords] = await Promise.all([
        base44.asServiceRole.entities.DirectoryClaim.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingAccess.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingRequest.list('-created_date', 300),
        base44.asServiceRole.entities.DirectoryListingRecord.list('-published_at', 500),
      ]);
      return Response.json({ success: true, claims, accesses, listingRequests, listingRecords });
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
          eircode: null,
          indoor: null,
          courts: null,
          latitude: null,
          longitude: null,
          mapUrl: null,
          websiteUrl: null,
          playType: null,
        } : null;
        const geocodedVenue = submittedVenue ? await geocodeDirectoryVenue(submittedVenue) : null;
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
          contact: { name: null, phone: null, phoneHref: null, whatsapp: null, email: null },
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
        notes: reviewNotes || 'New directory listing approved and submitter verified as initial directory editor.',
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
