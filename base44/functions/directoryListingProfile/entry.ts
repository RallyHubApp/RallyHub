import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';
import { geocodeDirectoryVenues } from './geocode.ts';
import { publicDirectoryFallbackSnapshot } from './publicFallbackSnapshot.ts';
import { protectedDirectoryList, protectedDirectoryState } from './protectedContract.ts';

const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const isRateLimit = (error:any) => /rate limit|too many requests|\b429\b|temporar(?:y|ily) busy/i.test(String(error?.message || error || ''));
const nullable = (value:any, max=500) => { const v = clean(value, max); return v || null; };
const safeUrl = (value:any) => {
  const v = clean(value, 500);
  if (!v) return null;
  try {
    const url = new URL(v);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const marker = '/files/mp/public/';
    if (url.hostname === 'base44.app' && url.pathname.includes(marker)) {
      const tail = url.pathname.split(marker)[1];
      if (tail) return `https://media.base44.com/images/public/${tail}`;
    }
    return url.toString();
  } catch { return null; }
};
const weekOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const sortSessions = (sessions:any[]) => [...sessions].sort((a:any,b:any) =>
  weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day) ||
  String(a.start || '').localeCompare(String(b.start || '')) ||
  String(a.level || '').localeCompare(String(b.level || ''))
);
const safeLogoUrl = (value:any) => {
  const v = clean(value, 500);
  if (!v) return null;
  // Curated seed listings may use app-hosted public assets such as
  // /limerick-city-pickleball.webp. Preserve those on editor save while
  // rejecting protocol-relative/external-looking paths.
  if (/^\/(?!\/)[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(v)) return v;
  return safeUrl(v);
};
const safeEmail = (value:any) => {
  const v = clean(value, 240).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
};
const safeNumber = (value:any, min:number, max:number) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
};
const idSafe = (value:any, fallback:string) => clean(value, 120).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
const phoneHref = (value:any) => {
  const raw = clean(value, 80);
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `353${digits.slice(1)}`;
  return `tel:+${digits}`;
};

const CONTACT_FEATURE_KEY = 'protected-contact-actions-v1';
const CONTACT_DEFAULT_DIRECTORY_KEY = 'protected-contact-default-directory';
const CONTACT_CONFIG_TTL_MS = 5 * 1000;
let contactConfigCache:any = null;

async function contactProtectionConfig(base44:any) {
  const now = Date.now();
  if (contactConfigCache && now - contactConfigCache.savedAt < CONTACT_CONFIG_TTL_MS) return contactConfigCache.value;
  const [settings, defaultSettings] = await Promise.all([
    base44.asServiceRole.entities.DirectorySettings.filter({ key:CONTACT_FEATURE_KEY }, '-updated_date', 5).catch(() => []),
    base44.asServiceRole.entities.DirectorySettings.filter({ key:CONTACT_DEFAULT_DIRECTORY_KEY }, '-updated_date', 5).catch(() => []),
  ]);
  const globalEnabled = !!settings?.find((row:any) => row.active === true);
  const defaultDirectoryEnabled = !!defaultSettings?.find((row:any) => row.active === true);
  if (!globalEnabled) {
    const value = { globalEnabled:false, defaultDirectoryEnabled:false, protectedSlugs:new Set<string>(), legacyHoldSlugs:new Set<string>(), hideNameSlugs:new Set<string>() };
    contactConfigCache = { savedAt:now, value };
    return value;
  }
  const [rollouts, claims] = await Promise.all([
    base44.asServiceRole.entities.DirectoryContactRollout.filter({}, '-updated_at', 500).catch(() => []),
    base44.asServiceRole.entities.DirectoryClaim.filter({}, '-reviewed_at', 500).catch(() => []),
  ]);
  const protectedSlugs = new Set<string>();
  const legacyHoldSlugs = new Set<string>();
  for (const row of rollouts || []) {
    if (!row?.listing_slug) continue;
    const mode = String(row?.mode || 'legacy');
    if (['protected_pilot','protected'].includes(mode)) protectedSlugs.add(String(row.listing_slug));
    if (mode === 'legacy') legacyHoldSlugs.add(String(row.listing_slug));
  }
  const hideNameSlugs = new Set<string>();
  const seenClaimSlugs = new Set<string>();
  for (const claim of claims || []) {
    const slug = String(claim?.listing_slug || '');
    if (!slug || seenClaimSlugs.has(slug)) continue;
    if (!['approved','auto_verified'].includes(String(claim?.status || ''))) continue;
    seenClaimSlugs.add(slug);
    if (claim?.public_name_opt_out === true) hideNameSlugs.add(slug);
  }
  const value = { globalEnabled:true, defaultDirectoryEnabled, protectedSlugs, legacyHoldSlugs, hideNameSlugs };
  contactConfigCache = { savedAt:now, value };
  return value;
}

async function protectedStateWithPrivacy(base44:any, listingSlug:string, state:any) {
  const config = await contactProtectionConfig(base44);
  return protectedDirectoryState(state, { hideContactName:config.hideNameSlugs.has(listingSlug) });
}

async function publicStateForRollout(base44:any, listingSlug:string, state:any) {
  const config = await contactProtectionConfig(base44);
  const protectedForListing = config.protectedSlugs.has(listingSlug) || (config.defaultDirectoryEnabled && !config.legacyHoldSlugs.has(listingSlug));
  return protectedForListing
    ? protectedDirectoryState(state, { hideContactName:config.hideNameSlugs.has(listingSlug) })
    : state;
}

async function protectedListWithPrivacy(base44:any, listings:any) {
  const config = await contactProtectionConfig(base44);
  const optionsBySlug:any = {};
  for (const slug of config.hideNameSlugs) optionsBySlug[slug] = { hideContactName:true };
  return protectedDirectoryList(listings, optionsBySlug);
}

async function publicListForRollout(base44:any, listings:any) {
  const config = await contactProtectionConfig(base44);
  if (!config.globalEnabled) return listings;
  if (!config.defaultDirectoryEnabled && !config.protectedSlugs.size) return listings;
  const out:any = { ...(listings || {}) };
  if (config.defaultDirectoryEnabled) {
    for (const slug of Object.keys(out)) {
      if (config.legacyHoldSlugs.has(slug)) continue;
      out[slug] = protectedDirectoryState(out[slug], { hideContactName:config.hideNameSlugs.has(slug) });
    }
    return out;
  }
  for (const slug of config.protectedSlugs) {
    if (out[slug]) out[slug] = protectedDirectoryState(out[slug], { hideContactName:config.hideNameSlugs.has(slug) });
  }
  return out;
}

// Public Directory reads are identical for every visitor. Keep one warm snapshot per
// function isolate and collapse simultaneous cold requests onto the same rebuild.
// This prevents a launch-day burst from multiplying into three Base44 entity reads
// per visitor. Writes invalidate the snapshot immediately.
const PUBLIC_LIST_CACHE_TTL_MS = 60 * 1000;
const PUBLIC_LIST_STALE_IF_BUSY_MS = 15 * 60 * 1000;
const PUBLIC_GET_CACHE_TTL_MS = 60 * 1000;
const PUBLIC_GET_STALE_IF_BUSY_MS = 15 * 60 * 1000;
let publicListCache:any = null;
let publicListInFlight:Promise<any> | null = null;
const publicGetCache = new Map<string, any>();
const publicGetInFlight = new Map<string, Promise<any>>();

function invalidatePublicListCache() {
  publicListCache = null;
}

function invalidatePublicGetCache(listingSlug:string) {
  publicGetCache.delete(listingSlug);
}

async function buildPublicClub(base44:any, listingSlug:string) {
  const [rows, dynamicRows, waitingListConfigs] = await Promise.all([
    base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug: listingSlug, status: 'active' }, '-updated_at', 5),
    base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5),
    base44.asServiceRole.entities.ClubWaitingListConfig.filter({ public_slug:listingSlug, status:'active' }, '-updated_date', 5),
  ]);
  const row = rows?.[0] || null;
  const dynamic = dynamicRows?.[0] || null;
  if (dynamic?.visibility === 'preview_only') {
    return { success:true, listingSlug, verificationStatus:'unclaimed', profile:null, base:null };
  }
  const profile = parseJson(row?.public_json);
  const base = parseJson(dynamic?.base_json);
  const waitingListUrl = safeUrl(waitingListConfigs?.[0]?.public_entry_url);
  if (waitingListUrl) {
    if (profile) profile.waitingListUrl = waitingListUrl;
    if (base) base.waitingListUrl = waitingListUrl;
  }
  const verificationStatus = await verifiedStatus(base44, listingSlug);
  return { success:true, listingSlug, verificationStatus, profile, base };
}

async function getPublicClub(base44:any, listingSlug:string) {
  const now = Date.now();
  const cached = publicGetCache.get(listingSlug);
  if (cached && now - cached.savedAt < PUBLIC_GET_CACHE_TTL_MS) return cached.data;
  if (publicGetInFlight.has(listingSlug)) return publicGetInFlight.get(listingSlug);

  const request = buildPublicClub(base44, listingSlug)
    .then((data:any) => {
      publicGetCache.set(listingSlug, { savedAt: Date.now(), data });
      return data;
    })
    .catch((error:any) => {
      const stale = publicGetCache.get(listingSlug);
      if (stale && Date.now() - stale.savedAt < PUBLIC_GET_STALE_IF_BUSY_MS && isRateLimit(error)) return stale.data;
      if (isRateLimit(error)) {
        const fallback:any = publicDirectoryFallbackSnapshot[listingSlug] || {};
        const data = {
          success: true,
          listingSlug,
          verificationStatus: fallback.verificationStatus || 'unclaimed',
          profile: fallback.profile || null,
          base: fallback.base || null,
          degraded: true,
        };
        publicGetCache.set(listingSlug, { savedAt: Date.now(), data });
        return data;
      }
      throw error;
    })
    .finally(() => { publicGetInFlight.delete(listingSlug); });

  publicGetInFlight.set(listingSlug, request);
  return request;
}

async function buildPublicDirectoryList(base44:any) {
  const [rows, accesses, dynamicRows, waitingListConfigs] = await Promise.all([
    base44.asServiceRole.entities.DirectoryListingProfile.filter({ status: 'active' }, '-updated_at', 500),
    base44.asServiceRole.entities.DirectoryListingAccess.filter({ status: 'active' }, '-granted_at', 500),
    base44.asServiceRole.entities.DirectoryListingRecord.filter({ status: 'active' }, '-published_at', 500),
    base44.asServiceRole.entities.ClubWaitingListConfig.filter({ status:'active' }, '-updated_date', 500),
  ]);
  const hidden = new Set((dynamicRows || []).filter((x:any) => x.visibility === 'preview_only').map((x:any) => x.slug));
  const verified = new Set((accesses || []).filter((x:any) => !hidden.has(x.listing_slug)).map((x:any) => x.listing_slug));
  const result:any = {};
  for (const row of dynamicRows || []) {
    if (!row.slug || row.visibility === 'preview_only' || result[row.slug]) continue;
    result[row.slug] = { base: parseJson(row.base_json), profile: null, verificationStatus: verified.has(row.slug) ? 'verified' : 'unclaimed' };
  }
  for (const row of rows || []) {
    if (!row.listing_slug || hidden.has(row.listing_slug)) continue;
    const current = result[row.listing_slug] || { base: null, profile: null, verificationStatus: verified.has(row.listing_slug) ? 'verified' : 'unclaimed' };
    if (!current.profile) current.profile = parseJson(row.public_json);
    current.verificationStatus = verified.has(row.listing_slug) ? 'verified' : 'unclaimed';
    result[row.listing_slug] = current;
  }
  for (const slug of verified) {
    if (!result[slug]) result[slug] = { base: null, profile: null, verificationStatus: 'verified' };
  }
  for (const config of waitingListConfigs || []) {
    const slug = clean(config?.public_slug, 180);
    const url = safeUrl(config?.public_entry_url);
    const current = slug ? result[slug] : null;
    if (!current || !url) continue;
    if (current.profile) current.profile.waitingListUrl = url;
    if (current.base) current.base.waitingListUrl = url;
  }
  return result;
}

async function getPublicDirectoryList(base44:any) {
  const now = Date.now();
  if (publicListCache && now - publicListCache.savedAt < PUBLIC_LIST_CACHE_TTL_MS) return publicListCache.listings;
  if (publicListInFlight) return publicListInFlight;

  const stale = publicListCache;
  publicListInFlight = buildPublicDirectoryList(base44)
    .then((listings:any) => {
      publicListCache = { savedAt: Date.now(), listings };
      return listings;
    })
    .catch((error:any) => {
      if (stale && Date.now() - stale.savedAt < PUBLIC_LIST_STALE_IF_BUSY_MS && isRateLimit(error)) {
        return stale.listings;
      }
      if (isRateLimit(error)) {
        // Last-resort launch resilience: return the last known-good public snapshot
        // rather than failing a first-time visitor with a 503 during a traffic burst.
        publicListCache = { savedAt: Date.now(), listings: publicDirectoryFallbackSnapshot, degraded: true };
        return publicDirectoryFallbackSnapshot;
      }
      throw error;
    })
    .finally(() => { publicListInFlight = null; });

  return publicListInFlight;
}

function parseJson(value:any) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function sanitiseProfile(input:any) {
  const venuesIn = Array.isArray(input?.venues) ? input.venues.slice(0, 20) : [];
  const venues = venuesIn.map((v:any, i:number) => ({
    id: idSafe(v?.id, `venue-${i+1}`),
    name: clean(v?.name, 220),
    shortName: nullable(v?.shortName, 120),
    address: nullable(v?.address, 320),
    eircode: nullable(v?.eircode, 40),
    indoor: typeof v?.indoor === 'boolean' ? v.indoor : null,
    courts: safeNumber(v?.courts, 1, 100),
    latitude: safeNumber(v?.latitude, -90, 90),
    longitude: safeNumber(v?.longitude, -180, 180),
    mapUrl: safeUrl(v?.mapUrl),
    websiteUrl: safeUrl(v?.websiteUrl),
    playType: nullable(v?.playType, 120),
    source: clean(v?.source, 40) === 'Spond' ? 'Spond' : null,
  })).filter((v:any) => v.name);

  const venueIds = new Set(venues.map((v:any) => v.id));
  const sessionsIn = Array.isArray(input?.sessions) ? input.sessions.slice(0, 80) : [];
  const sessions = sortSessions(sessionsIn.map((s:any, i:number) => ({
    id: idSafe(s?.id, `session-${i+1}`),
    venueId: venueIds.has(clean(s?.venueId, 120)) ? clean(s?.venueId, 120) : (venues[0]?.id || null),
    day: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].includes(clean(s?.day, 20)) ? clean(s?.day, 20) : 'Monday',
    start: nullable(s?.start, 10),
    end: nullable(s?.end, 10),
    meetTime: nullable(s?.meetTime, 10),
    level: clean(s?.level, 180) || 'Club Session',
    price: safeNumber(s?.price, 0, 10000),
    paymentMethod: ['Cash','Online','Pay at venue','Included in membership','Contact club'].includes(clean(s?.paymentMethod, 80)) ? clean(s?.paymentMethod, 80) : null,
    capacity: safeNumber(s?.capacity, 1, 10000),
    host: nullable(s?.host, 180),
    showPublicJoinLink: s?.showPublicJoinLink === true,
    publicJoinUrl: safeUrl(s?.publicJoinUrl),
    source: clean(s?.source, 40) === 'Spond' ? 'Spond' : null,
  })).filter((s:any) => s.venueId && s.start));

  return {
    name: nullable(input?.name, 220),
    description: nullable(input?.description, 1600),
    membershipStatus: nullable(input?.membershipStatus, 240),
    guestPolicy: nullable(input?.guestPolicy, 1800),
    policyLabel: nullable(input?.policyLabel, 120),
    website: safeUrl(input?.website),
    facebook: safeUrl(input?.facebook),
    instagram: safeUrl(input?.instagram),
    waitingListUrl: safeUrl(input?.waitingListUrl),
    joiningCtaLabel: nullable(input?.joiningCtaLabel, 120),
    logoUrl: safeLogoUrl(input?.logoUrl),
    contact: {
      name: nullable(input?.contact?.name, 180),
      phone: nullable(input?.contact?.phone, 80),
      phoneHref: phoneHref(input?.contact?.phone),
      email: safeEmail(input?.contact?.email),
      whatsapp: safeUrl(input?.contact?.whatsapp),
    },
    venues,
    sessions,
  };
}

async function verifiedStatus(base44:any, slug:string) {
  const access = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: slug, status: 'active' });
  return access?.length ? 'verified' : 'unclaimed';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'public_get');

    if (action === 'public_get' || action === 'protected_public_get') {
      const listingSlug = clean(body.listingSlug, 180);
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      const data = await getPublicClub(base44, listingSlug);
      const payload = action === 'protected_public_get'
        ? { ...(await protectedStateWithPrivacy(base44, listingSlug, data)), contractVersion:'protected-v1' }
        : await publicStateForRollout(base44, listingSlug, data);
      return Response.json(
        payload,
        { headers: { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=30' } }
      );
    }

    if (action === 'public_list' || action === 'protected_public_list') {
      const result = await getPublicDirectoryList(base44);
      const listings = action === 'protected_public_list'
        ? await protectedListWithPrivacy(base44, result)
        : await publicListForRollout(base44, result);
      return Response.json(
        { success: true, listings, ...(action === 'protected_public_list' ? { contractVersion:'protected-v1' } : {}) },
        { headers: { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=30' } }
      );
    }

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    if (action === 'private_get') {
      const listingSlug = clean(body.listingSlug, 180);
      if (!listingSlug) return Response.json({ error:'listingSlug required' }, { status:400 });
      let allowed = user.role === 'admin';
      if (!allowed) {
        const access = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug:listingSlug, user_id:user.id, status:'active' });
        allowed = !!access?.length;
      }
      if (!allowed) return Response.json({ error:'Directory editor access required' }, { status:403 });
      const rows = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug: listingSlug, status:'active' }, '-updated_at', 5);
      const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug:listingSlug, status:'active' }, '-published_at', 5);
      const row = rows?.[0] || null;
      const dynamic = dynamicRows?.[0] || null;
      const profile = parseJson(row?.public_json);
      const base = parseJson(dynamic?.base_json);
      return Response.json({ success:true, listingSlug, visibility:dynamic?.visibility || 'public', verificationStatus:await verifiedStatus(base44, listingSlug), profile, base });
    }

    if (action === 'save') {
      const listingSlug = clean(body.listingSlug, 180);
      if (!listingSlug) return Response.json({ error: 'listingSlug required' }, { status: 400 });
      let allowed = user.role === 'admin';
      if (!allowed) {
        const access = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, user_id: user.id, status: 'active' });
        allowed = !!access?.length;
      }
      if (!allowed) return Response.json({ error: 'Verified directory editor access required' }, { status: 403 });

      const publicProfile = sanitiseProfile(body.profile || {});
      publicProfile.venues = await geocodeDirectoryVenues(publicProfile.venues || [], { town: clean(body.town, 120), county: clean(body.county, 120) });
      const publicJson = JSON.stringify(publicProfile);
      const now = new Date().toISOString();
      const existing = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug: listingSlug, status: 'active' }, '-updated_at', 5);
      const beforeJson = existing?.[0]?.public_json || null;
      let record;
      if (existing?.[0]) {
        record = await base44.asServiceRole.entities.DirectoryListingProfile.update(existing[0].id, {
          public_json: publicJson, updated_by_user_id: user.id, updated_at: now,
        });
      } else {
        record = await base44.asServiceRole.entities.DirectoryListingProfile.create({
          listing_slug: listingSlug, public_json: publicJson, status: 'active', updated_by_user_id: user.id, updated_at: now,
        });
      }

      // Keep the editable display name aligned with database-backed listings while
      // deliberately preserving the stable listing slug / URL.
      if (publicProfile?.name) {
        try {
          const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
          const dynamic = dynamicRows?.[0];
          if (dynamic) {
            const base = parseJson(dynamic.base_json) || {};
            await base44.asServiceRole.entities.DirectoryListingRecord.update(dynamic.id, {
              name: publicProfile.name,
              base_json: JSON.stringify({ ...base, name: publicProfile.name }),
            });
          }
          const accesses = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, status: 'active' }, '-granted_at', 100);
          for (const access of accesses || []) {
            if (access.listing_name_snapshot !== publicProfile.name) {
              await base44.asServiceRole.entities.DirectoryListingAccess.update(access.id, { listing_name_snapshot: publicProfile.name });
            }
          }
        } catch (nameSyncError) {
          console.warn('Directory display-name sync failed', nameSyncError?.message || nameSyncError);
        }
      }

      // For database-backed listings curated by a RallyHub Super Admin, keep the
      // trusted claim contact aligned with the contact shown in the editor. This is
      // what allows an invited representative to auto-verify with the same email.
      if (user.role === 'admin' && publicProfile?.contact?.email) {
        try {
          const dynamicRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug: listingSlug, status: 'active' }, '-published_at', 5);
          const dynamic = dynamicRows?.[0];
          if (dynamic) {
            const trusted = [{
              name: publicProfile.contact?.name || null,
              email: publicProfile.contact?.email || null,
              phone: publicProfile.contact?.phone || null,
            }];
            await base44.asServiceRole.entities.DirectoryListingRecord.update(dynamic.id, { trusted_contacts_json: JSON.stringify(trusted) });
          }
        } catch (contactSyncError) {
          console.warn('Directory trusted-contact sync failed', contactSyncError?.message || contactSyncError);
        }
      }
      try {
        await base44.asServiceRole.entities.DirectoryListingAudit.create({
          listing_slug: listingSlug,
          user_id: user.id,
          action: beforeJson ? 'profile_updated' : 'profile_created',
          occurred_at: now,
          ...(beforeJson ? { before_json: beforeJson } : {}),
          after_json: publicJson,
        });
      } catch (auditError) {
        console.warn('Directory listing audit write failed', auditError?.message || auditError);
      }
      invalidatePublicListCache();
      invalidatePublicGetCache(listingSlug);
      return Response.json({ success: true, profile: publicProfile, updatedAt: now, id: record?.id || existing?.[0]?.id || null });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('directoryListingProfile error', error);
    if (isRateLimit(error)) {
      return Response.json(
        { error: 'RallyHub is temporarily busy. Please try again shortly.', retryAfterSeconds: 3 },
        { status: 503, headers: { 'Retry-After': '3' } }
      );
    }
    return Response.json({ error: 'Unable to process the directory profile request right now.' }, { status: 500 });
  }
});
