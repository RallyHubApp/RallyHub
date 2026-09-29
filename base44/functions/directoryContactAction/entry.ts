import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';
import { importedContactEndpointFor } from './importedContactEndpoints.ts';

const FEATURE_KEY = 'protected-contact-actions-v1';
const DEFAULT_DIRECTORY_KEY = 'protected-contact-default-directory';
const resolveBuckets = new Map<string, { count:number; resetAt:number }>();
const emailBuckets = new Map<string, { count:number; resetAt:number }>();
const idempotencyCache = new Map<string, { expiresAt:number; payload:any; status:number }>();
const RALLYHUB_EMAIL_LOGO = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';
const RALLYHUB_NAVY = '#07184c';
const RALLYHUB_GREEN = '#078e48';
const RALLYHUB_SUPPORT_TEL = 'tel:+353878100333';
const RALLYHUB_SUPPORT_WHATSAPP = 'https://wa.me/353878100333';

const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const validEmail = (value:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeHtml = (value:any) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char] || char));
const digitsOnly = (value:any) => clean(value, 100).replace(/\D/g, '');

function telTarget(value:any) {
  let digits = digitsOnly(value);
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `353${digits.slice(1)}`;
  return `tel:+${digits}`;
}

function whatsappTarget(endpoint:any) {
  const configured = clean(endpoint?.whatsapp_url, 500);
  if (configured) {
    try {
      const url = new URL(configured);
      const allowed = ['wa.me','api.whatsapp.com','web.whatsapp.com'];
      if (url.protocol === 'https:' && allowed.includes(url.hostname.toLowerCase())) return url.toString();
    } catch {}
  }
  const digits = telTarget(endpoint?.phone).replace(/^tel:\+/, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function maskPhone(value:any) {
  const digits = digitsOnly(value);
  if (!digits) return 'Not configured';
  const tail = digits.slice(-3);
  return `•••••••${tail}`;
}

function maskEmail(value:any) {
  const email = clean(value, 240).toLowerCase();
  if (!validEmail(email)) return 'Not configured';
  const [local, domain] = email.split('@');
  const localMask = local.length <= 2 ? `${local[0] || ''}•` : `${local.slice(0, 2)}•••`;
  const parts = domain.split('.');
  const host = parts[0] || '';
  const suffix = parts.slice(1).join('.');
  return `${localMask}@${host.slice(0, 1)}•••${suffix ? `.${suffix}` : ''}`;
}

function clientKey(req:Request, body:any) {
  const forwarded = clean(req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || req.headers.get('fly-client-ip'), 160).split(',')[0].trim();
  return forwarded || clean(body?.visitorId || body?.sessionId, 160) || 'anonymous';
}

function consumeBucket(store:Map<string,{count:number;resetAt:number}>, key:string, limit:number, windowMs:number) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || now >= current.resetAt) {
    store.set(key, { count:1, resetAt:now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function requestIdFrom(body:any) {
  return clean(body?.requestId, 120).replace(/[^a-zA-Z0-9_.:-]/g, '');
}

function idempotencyKey(body:any, listingSlug:string, channel:string) {
  const requestId = requestIdFrom(body);
  return requestId ? `${listingSlug}:${channel}:${requestId}` : '';
}

function getIdempotent(key:string) {
  if (!key) return null;
  const row = idempotencyCache.get(key);
  if (!row) return null;
  if (Date.now() >= row.expiresAt) {
    idempotencyCache.delete(key);
    return null;
  }
  return row;
}

function setIdempotent(key:string, payload:any, status=200, ttlMs=2*60*1000) {
  if (!key) return;
  idempotencyCache.set(key, { expiresAt:Date.now()+ttlMs, payload, status });
  if (idempotencyCache.size > 1000) {
    const now = Date.now();
    for (const [cacheKey,row] of idempotencyCache) {
      if (now >= row.expiresAt) idempotencyCache.delete(cacheKey);
      if (idempotencyCache.size <= 800) break;
    }
  }
}

async function durableActionFor(base44:any, requestKey:string) {
  if (!requestKey) return null;
  const rows = await base44.asServiceRole.entities.DirectoryContactAction.filter({ request_key:requestKey }, '-created_at', 5).catch(() => []);
  const row = rows?.[0] || null;
  if (!row) return null;
  const expiresAt = row.expires_at ? Date.parse(row.expires_at) : 0;
  return expiresAt && Date.now() >= expiresAt ? null : row;
}

async function createDurableAction(base44:any, args:{
  requestKey:string; requestId:string; listingSlug:string; listingName:string; channel:string; actionType:'initiated'|'submitted'; status:'processing'|'acknowledged'|'sent'|'failed'; ttlMinutes:number;
}) {
  const now = new Date().toISOString();
  return await base44.asServiceRole.entities.DirectoryContactAction.create({
    request_key:args.requestKey,
    request_id:args.requestId,
    listing_slug:args.listingSlug,
    listing_name:args.listingName,
    channel:args.channel,
    action_type:args.actionType,
    status:args.status,
    source_surface:'protected_contact',
    created_at:now,
    updated_at:now,
    expires_at:new Date(Date.now() + args.ttlMinutes * 60 * 1000).toISOString(),
  });
}

async function setDurableActionStatus(base44:any, row:any, status:'processing'|'acknowledged'|'sent'|'failed') {
  if (!row?.id) return row;
  await base44.asServiceRole.entities.DirectoryContactAction.update(row.id, { status, updated_at:new Date().toISOString() });
  return { ...row, status };
}

async function featureEnabled(base44:any) {
  const rows = await base44.asServiceRole.entities.DirectorySettings.filter({ key:FEATURE_KEY }, '-updated_date', 5).catch(() => []);
  return !!rows?.find((row:any) => row.active === true);
}

async function defaultDirectoryEnabled(base44:any) {
  const rows = await base44.asServiceRole.entities.DirectorySettings.filter({ key:DEFAULT_DIRECTORY_KEY }, '-updated_date', 5).catch(() => []);
  return !!rows?.find((row:any) => row.active === true);
}

async function rolloutFor(base44:any, listingSlug:string) {
  const rows = await base44.asServiceRole.entities.DirectoryContactRollout.filter({ listing_slug:listingSlug }, '-updated_at', 5).catch(() => []);
  const row = rows?.[0] || null;
  return row || { listing_slug:listingSlug, mode:'legacy', fallback_enabled:true, fallback_reason:'No protected-contact rollout configured.' };
}

async function protectedState(base44:any, listingSlug:string) {
  const [globalEnabled, defaultEnabled, rollout] = await Promise.all([featureEnabled(base44), defaultDirectoryEnabled(base44), rolloutFor(base44, listingSlug)]);
  const explicitMode = String(rollout?.mode || 'legacy');
  const explicitLegacyHold = !!rollout?.id && explicitMode === 'legacy';
  return {
    globalEnabled,
    defaultEnabled,
    rollout,
    enabled:globalEnabled && (['protected_pilot','protected'].includes(explicitMode) || (defaultEnabled && !explicitLegacyHold)),
  };
}

function parseJson(value:any) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

async function latestApprovedClaim(base44:any, listingSlug:string) {
  const rows = await base44.asServiceRole.entities.DirectoryClaim.filter({ listing_slug:listingSlug }, '-reviewed_at', 20).catch(() => []);
  return (rows || []).find((row:any) => ['approved','auto_verified'].includes(String(row?.status || ''))) || null;
}

function normaliseWhatsapp(raw:any, phone:any) {
  const configured = clean(raw, 500);
  if (!configured) return '';
  try {
    const url = new URL(configured);
    if (url.protocol === 'https:' && ['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname.toLowerCase())) return url.toString();
  } catch {}
  const digits = configured.replace(/\D/g, '') || digitsOnly(phone);
  return digits ? `https://wa.me/${digits}` : '';
}

function derivedEndpoint(listingSlug:string, listingName:string, contact:any, claim:any) {
  const phoneOptOut = claim?.public_phone_opt_out === true;
  const nameOptOut = claim?.public_name_opt_out === true;
  const phone = phoneOptOut ? '' : clean(contact?.phone, 100);
  const email = clean(contact?.email, 240).toLowerCase();
  const explicitWhatsapp = phoneOptOut ? '' : clean(contact?.whatsapp, 500);
  return {
    listing_slug:listingSlug,
    listing_name_snapshot:clean(listingName || listingSlug, 240),
    contact_name:nameOptOut ? '' : clean(contact?.name, 160),
    contact_role:clean(claim?.claimant_role, 120),
    phone,
    email,
    whatsapp_url:normaliseWhatsapp(explicitWhatsapp, phone),
    allow_call:!!phone,
    allow_whatsapp:!!explicitWhatsapp,
    allow_email:validEmail(email),
    status:'active',
  };
}

async function endpointFor(base44:any, listingSlug:string) {
  const [rows, claim] = await Promise.all([
    base44.asServiceRole.entities.DirectoryContactEndpoint.filter({ listing_slug:listingSlug, status:'active' }, '-updated_at', 5).catch(() => []),
    latestApprovedClaim(base44, listingSlug),
  ]);
  if (rows?.[0]) {
    const row = rows[0];
    const derived = derivedEndpoint(listingSlug, row.listing_name_snapshot || listingSlug, {
      name:row.contact_name,
      phone:row.allow_call === true ? row.phone : '',
      email:row.allow_email === true ? row.email : '',
      whatsapp:row.allow_whatsapp === true ? row.whatsapp_url : '',
    }, claim);
    derived.contact_role = clean(row.contact_role || claim?.claimant_role, 120);
    return derived;
  }

  const profileRows = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug:listingSlug, status:'active' }, '-updated_at', 5).catch(() => []);
  if (profileRows?.[0]) {
    const profile = parseJson(profileRows[0].public_json) || {};
    return derivedEndpoint(listingSlug, profile?.name || claim?.listing_name_snapshot || listingSlug, profile?.contact || {}, claim);
  }

  const recordRows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug:listingSlug, status:'active' }, '-published_at', 5).catch(() => []);
  if (recordRows?.[0]) {
    const base = parseJson(recordRows[0].base_json) || {};
    return derivedEndpoint(listingSlug, base?.name || claim?.listing_name_snapshot || listingSlug, base?.contact || {}, claim);
  }

  const imported = importedContactEndpointFor(listingSlug);
  if (!imported) return null;
  const importedContact = {
    name:imported.contact_name,
    phone:imported.phone,
    email:imported.email,
    whatsapp:imported.whatsapp_url,
  };
  return derivedEndpoint(listingSlug, imported.listing_name_snapshot || listingSlug, importedContact, claim);
}

async function legacyProfileHasContact(base44:any, listingSlug:string) {
  const rows = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug:listingSlug, status:'active' }, '-updated_at', 1).catch(() => []);
  if (!rows?.[0]?.public_json) return false;
  try {
    const profile = JSON.parse(rows[0].public_json);
    return !!(profile?.contact?.phone || profile?.contact?.email || profile?.contact?.whatsapp || profile?.contact?.phoneHref);
  } catch { return false; }
}

function cardFor(endpoint:any) {
  return {
    listingSlug: clean(endpoint?.listing_slug, 180),
    listingName: clean(endpoint?.listing_name_snapshot, 240),
    contact: {
      displayName: clean(endpoint?.contact_name, 160),
      role: clean(endpoint?.contact_role, 120),
    },
    actions: {
      call: endpoint?.allow_call === true && !!telTarget(endpoint?.phone),
      whatsapp: endpoint?.allow_whatsapp === true && !!whatsappTarget(endpoint),
      email: endpoint?.allow_email === true && validEmail(clean(endpoint?.email, 240).toLowerCase()),
    },
    privacyCopy: 'Contact details are protected by RallyHub. Choose an action to contact the club.',
  };
}

function privacyChecks(card:any, endpoint:any) {
  const serialised = JSON.stringify(card).toLowerCase();
  const phoneDigits = digitsOnly(endpoint?.phone);
  const email = clean(endpoint?.email, 240).toLowerCase();
  const whatsapp = clean(endpoint?.whatsapp_url, 500).toLowerCase();
  return {
    rawPhoneAbsent: !phoneDigits || !serialised.replace(/\D/g, '').includes(phoneDigits),
    rawEmailAbsent: !email || !serialised.includes(email),
    directDestinationAbsent: !serialised.includes('tel:') && !serialised.includes('wa.me/') && !serialised.includes('mailto:') && (!whatsapp || !serialised.includes(whatsapp)),
  };
}

function responseJson(payload:any, status=200) {
  return Response.json(payload, { status, headers:{ 'Cache-Control':'no-store, max-age=0' } });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = clean(body.action || 'public_card', 80);
    const listingSlug = clean(body.listingSlug, 180);

    if (action === 'admin_preview' || action === 'admin_test_resolve' || action === 'admin_set_rollout') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return responseJson({ error:'Admin access required' }, 403);
      if (!listingSlug) return responseJson({ error:'listingSlug required' }, 400);

      if (action === 'admin_set_rollout') {
        const mode = clean(body.mode, 40);
        if (!['legacy','protected_pilot','protected'].includes(mode)) return responseJson({ error:'Invalid rollout mode.' }, 400);
        const fallbackEnabled = body.fallbackEnabled !== false;
        const now = new Date().toISOString();
        const rows = await base44.asServiceRole.entities.DirectoryContactRollout.filter({ listing_slug:listingSlug }, '-updated_at', 5).catch(() => []);
        const payload = {
          listing_slug:listingSlug,
          mode,
          fallback_enabled:fallbackEnabled,
          fallback_reason:clean(body.reason, 500) || (mode === 'legacy' ? 'Returned to legacy contact path.' : 'Protected contact pilot enabled.'),
          updated_by_user_id:user.id,
          updated_at:now,
        };
        if (rows?.[0]) await base44.asServiceRole.entities.DirectoryContactRollout.update(rows[0].id, payload);
        else await base44.asServiceRole.entities.DirectoryContactRollout.create(payload);
        return responseJson({ success:true, listingSlug, mode, fallbackEnabled, updatedAt:now });
      }

      const endpoint = await endpointFor(base44, listingSlug);
      if (!endpoint) return responseJson({ error:'Protected contact endpoint not configured for this listing.' }, 404);
      const card = cardFor(endpoint);
      const state = await protectedState(base44, listingSlug);
      if (action === 'admin_preview') {
        return responseJson({
          success:true,
          preview:true,
          featureFlagKey:FEATURE_KEY,
          featureFlagEnabled:state.globalEnabled,
          rolloutMode:state.rollout?.mode || 'legacy',
          fallbackEnabled:state.rollout?.fallback_enabled !== false,
          fallbackReason:state.rollout?.fallback_reason || '',
          protectedLiveEnabled:state.enabled,
          liveDirectoryWired:false,
          legacyPublicContactStillPresent:await legacyProfileHasContact(base44, listingSlug),
          card,
          privateEndpointMasked:{
            phone:maskPhone(endpoint.phone),
            email:maskEmail(endpoint.email),
            whatsappConfigured:!!whatsappTarget(endpoint),
          },
          checks:privacyChecks(card, endpoint),
        });
      }
      const channel = clean(body.channel, 40).toLowerCase();
      if (!['call','whatsapp'].includes(channel)) return responseJson({ error:'Preview resolver supports call or whatsapp.' }, 400);
      const target = channel === 'call' ? telTarget(endpoint.phone) : whatsappTarget(endpoint);
      const allowed = channel === 'call' ? endpoint.allow_call === true : endpoint.allow_whatsapp === true;
      if (!allowed || !target) return responseJson({ success:true, preview:true, channel, available:false });
      return responseJson({
        success:true,
        preview:true,
        channel,
        available:true,
        targetKind:channel === 'call' ? 'telephone' : 'whatsapp',
        destinationMasked:channel === 'call' ? maskPhone(endpoint.phone) : `WhatsApp ${maskPhone(endpoint.phone)}`,
        rawDestinationReturned:false,
      });
    }

    if (!listingSlug) return responseJson({ error:'listingSlug required' }, 400);
    const state = await protectedState(base44, listingSlug);
    if (!state.enabled) return responseJson({ error:'Protected contact actions are not enabled for this listing.', featureDisabled:true, rolloutMode:state.rollout?.mode || 'legacy' }, 404);
    const endpoint = await endpointFor(base44, listingSlug);
    if (!endpoint) return responseJson({ error:'Club contact is not configured.' }, 404);

    if (action === 'public_card') {
      return responseJson({ success:true, card:cardFor(endpoint) });
    }

    if (action === 'resolve') {
      const channel = clean(body.channel, 40).toLowerCase();
      if (!['call','whatsapp'].includes(channel)) return responseJson({ error:'Unsupported contact action.' }, 400);
      const requestId = requestIdFrom(body);
      if (!requestId) return responseJson({ error:'requestId required for protected contact actions.' }, 400);
      const idemKey = idempotencyKey(body, listingSlug, channel);
      const allowed = channel === 'call' ? endpoint.allow_call === true : endpoint.allow_whatsapp === true;
      const target = channel === 'call' ? telTarget(endpoint.phone) : whatsappTarget(endpoint);
      if (!allowed || !target) return responseJson({ error:'That contact action is not available.' }, 404);
      const payload = { success:true, channel, actionUrl:target, singleAction:true, acknowledged:true };
      const prior = getIdempotent(idemKey);
      if (prior) return responseJson({ ...prior.payload, duplicate:true }, prior.status);
      const durablePrior = await durableActionFor(base44, idemKey);
      if (durablePrior) {
        setIdempotent(idemKey, payload, 200, 60*1000);
        return responseJson({ ...payload, duplicate:true }, 200);
      }
      const rateKey = `${clientKey(req, body)}:${listingSlug}:${channel}`;
      if (!consumeBucket(resolveBuckets, rateKey, 6, 5 * 60 * 1000)) return responseJson({ error:'Too many contact requests. Please try again shortly.' }, 429);
      await createDurableAction(base44, {
        requestKey:idemKey,
        requestId,
        listingSlug,
        listingName:clean(endpoint.listing_name_snapshot, 240) || 'Club',
        channel,
        actionType:'initiated',
        status:'acknowledged',
        ttlMinutes:10,
      });
      setIdempotent(idemKey, payload, 200, 60*1000);
      return responseJson(payload);
    }

    if (action === 'send_email') {
      if (clean(body.website, 200)) return responseJson({ success:true });
      const requestId = requestIdFrom(body);
      if (!requestId) return responseJson({ error:'requestId required for protected contact actions.' }, 400);
      const idemKey = idempotencyKey(body, listingSlug, 'email');
      const prior = getIdempotent(idemKey);
      if (prior) return responseJson({ ...prior.payload, duplicate:true }, prior.status);
      if (endpoint.allow_email !== true || !validEmail(clean(endpoint.email, 240).toLowerCase())) return responseJson({ error:'Email contact is not available for this club.' }, 404);
      const senderName = clean(body.name, 160);
      const senderEmail = clean(body.email, 240).toLowerCase();
      const message = clean(body.message, 2000);
      const sourcePath = clean(body.sourcePath || `/directory/${listingSlug}`, 500);
      if (!validEmail(senderEmail)) return responseJson({ error:'Enter a valid email address.' }, 400);
      if (message.length < 5) return responseJson({ error:'Please enter a short message.' }, 400);

      const listingName = clean(endpoint.listing_name_snapshot, 240) || 'Club';
      let actionRow = await durableActionFor(base44, idemKey);
      if (actionRow?.status === 'sent' || actionRow?.status === 'acknowledged') {
        const payload = { success:true, verifiedEnquiry:true, acknowledged:true, message:'Email sent through RallyHub.', duplicate:true };
        setIdempotent(idemKey, payload, 200, 10*60*1000);
        return responseJson(payload);
      }
      if (actionRow?.status === 'processing') return responseJson({ error:'This enquiry is already being processed. Please wait.' }, 409);
      const key = `${clientKey(req, body)}:${listingSlug}:email`;
      if (!consumeBucket(emailBuckets, key, 3, 30 * 60 * 1000)) return responseJson({ error:'Too many email enquiries. Please try again later.' }, 429);
      if (actionRow?.status === 'failed') actionRow = await setDurableActionStatus(base44, actionRow, 'processing');
      else actionRow = await createDurableAction(base44, {
        requestKey:idemKey,
        requestId,
        listingSlug,
        listingName,
        channel:'email',
        actionType:'submitted',
        status:'processing',
        ttlMinutes:30,
      });
      const displayName = senderName || 'A RallyHub visitor';
      const subject = `RallyHub enquiry – ${listingName}`;
      const textBody = [
        `A visitor has contacted ${listingName} through RallyHub.`,
        '',
        `Name: ${displayName}`,
        `Email: ${senderEmail}`,
        '',
        message,
        '',
        `Source: https://rallyhub.ie${sourcePath.startsWith('/') ? sourcePath : `/directory/${listingSlug}`}`,
        '',
        'This enquiry was generated through RallyHub. Replying to this email will reply to the visitor when the configured mail provider supports Reply-To.',
      ].join('\n');
      const htmlBody = `<!doctype html><html><body style="margin:0;padding:0;background:#eef3f2;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">New enquiry for ${escapeHtml(listingName)} through the RallyHub Directory.</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f2;padding:24px 10px;"><tr><td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #d8e3df;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(7,24,76,.08);">
            <tr><td style="height:7px;background:${RALLYHUB_GREEN};"></td></tr>
            <tr><td style="padding:24px 24px 18px;background:#ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;"><tr>
                <td style="padding-right:12px;vertical-align:middle;"><img src="${RALLYHUB_EMAIL_LOGO}" width="58" height="58" alt="RallyHub" style="display:block;width:58px;height:58px;object-fit:contain;border:0;"></td>
                <td style="vertical-align:middle;text-align:left;">
                  <div style="font-size:30px;line-height:1;font-weight:900;letter-spacing:-1.4px;color:${RALLYHUB_NAVY};">Rally<span style="color:${RALLYHUB_GREEN};">Hub</span></div>
                  <div style="margin-top:7px;font-size:9px;line-height:1;font-weight:800;letter-spacing:2.3px;color:${RALLYHUB_NAVY};">PLAY <span style="color:${RALLYHUB_GREEN};">•</span> CONNECT <span style="color:${RALLYHUB_GREEN};">•</span> BELONG</div>
                </td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:0 24px 28px;">
              <div style="height:1px;background:#e7eeec;margin:0 0 24px;"></div>
              <div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:${RALLYHUB_GREEN};">RALLYHUB DIRECTORY</div>
              <h1 style="margin:8px 0 12px;font-size:24px;line-height:1.25;color:${RALLYHUB_NAVY};font-weight:850;">New club enquiry</h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155;">A visitor has contacted <strong>${escapeHtml(listingName)}</strong> through your RallyHub Directory listing.</p>
              <div style="margin:18px 0;padding:18px;border-radius:14px;background:#fbfdfd;border:1px solid #dbe6e8;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#334155;"><strong style="color:${RALLYHUB_NAVY};">Name</strong><br>${escapeHtml(displayName)}</p>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#334155;"><strong style="color:${RALLYHUB_NAVY};">Email</strong><br><a href="mailto:${escapeHtml(senderEmail)}" style="color:${RALLYHUB_GREEN};font-weight:700;text-decoration:underline;">${escapeHtml(senderEmail)}</a></p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;"><strong style="color:${RALLYHUB_NAVY};">Message</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px auto 20px;"><tr><td bgcolor="${RALLYHUB_GREEN}" style="border-radius:12px;">
                <a href="mailto:${escapeHtml(senderEmail)}" style="display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">Reply to ${escapeHtml(displayName)}</a>
              </td></tr></table>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">This enquiry relates to your ${escapeHtml(listingName)} listing on the RallyHub Directory.</p>
            </td></tr>
            <tr><td style="padding:16px 24px;background:${RALLYHUB_NAVY};text-align:center;">
              <div style="font-size:11px;line-height:1.7;color:#dfe8ff;">Need help? <a href="${RALLYHUB_SUPPORT_TEL}" style="color:#ffffff;font-weight:800;text-decoration:underline;">Call</a> or <a href="${RALLYHUB_SUPPORT_WHATSAPP}" style="color:#ffffff;font-weight:800;text-decoration:underline;">WhatsApp Brian</a></div>
              <div style="margin-top:5px;font-size:10px;line-height:1.6;"><a href="https://rallyhub.ie" style="color:#83d1a0;font-weight:800;text-decoration:none;">Powered by RallyHub</a></div>
            </td></tr>
          </table>
        </td></tr></table>
      </body></html>`;
      const now = new Date().toISOString();
      try {
        const delivery = await sendWithConfiguredEmailTransport(base44, { scopeType:'platform', purpose:'directory' }, {
          to:clean(endpoint.email, 240).toLowerCase(),
          replyTo:senderEmail,
          senderName:'RallyHub Directory',
          subject,
          textBody,
          htmlBody,
        });
        await base44.asServiceRole.entities.DirectoryContactEnquiry.create({
          listing_slug:listingSlug,
          listing_name:listingName,
          enquiry_type:'email',
          sender_name:senderName,
          sender_email:senderEmail,
          message,
          source_path:sourcePath,
          delivery_status:'sent',
          delivery_provider:delivery?.provider || '',
          sent_at:now,
        });
        await setDurableActionStatus(base44, actionRow, 'sent');
        const payload = { success:true, verifiedEnquiry:true, acknowledged:true, message:'Email sent through RallyHub.' };
        setIdempotent(idemKey, payload, 200, 10*60*1000);
        return responseJson(payload);
      } catch (error) {
        await base44.asServiceRole.entities.DirectoryContactEnquiry.create({
          listing_slug:listingSlug,
          listing_name:listingName,
          enquiry_type:'email',
          sender_name:senderName,
          sender_email:senderEmail,
          message,
          source_path:sourcePath,
          delivery_status:'failed',
          delivery_provider:'',
          sent_at:now,
        }).catch(() => {});
        await setDurableActionStatus(base44, actionRow, 'failed').catch(() => {});
        console.error('directory contact email failed', error);
        const payload = { error:'Could not send the enquiry right now.' };
        setIdempotent(idemKey, payload, 500, 15*1000);
        return responseJson(payload, 500);
      }
    }

    return responseJson({ error:'Unknown protected contact action.' }, 400);
  } catch (error) {
    console.error('directoryContactAction failed', error);
    return responseJson({ error:'Unable to process the club contact action right now.' }, 500);
  }
});
