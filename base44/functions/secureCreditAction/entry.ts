import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_BYTES = 12 * 1024 * 1024;
const HOUR = 60 * 60 * 1000;

function clean(value:any, max=300) { return String(value ?? '').trim().slice(0, max); }
function ageMs(value:any) { const t = Date.parse(String(value || '')); return Number.isFinite(t) ? Date.now() - t : Number.POSITIVE_INFINITY; }

async function bodyFromRequest(req:Request) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const body:any = {};
    for (const [key, value] of form.entries()) body[key] = value;
    return body;
  }
  return await req.json().catch(() => ({}));
}

async function consumeAllowance(base44:any, user:any, action:string, limit:number, windowHours:number, contextId:string) {
  const auditAction = `credit_guard_${action}`;
  const rows = await base44.asServiceRole.entities.AuditLog.filter({ user_id:user.id, action:auditAction }, '-created_date', Math.max(limit + 5, 20));
  const recent = (rows || []).filter((r:any) => ageMs(r.created_date) <= windowHours * HOUR);
  if (recent.length >= limit) {
    return { allowed:false, response:Response.json({ error:'This action has reached its temporary usage limit. Please try again later.' }, { status:429 }) };
  }
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id: clean(user.active_tenant_id || 'platform', 180),
      club_id: user.active_club_id || undefined,
      user_id: user.id,
      action: auditAction,
      entity_type: 'CreditUsageGuard',
      entity_id: clean(contextId || user.id, 220),
      scope_type: 'CreditAction',
      scope_id: clean(action, 120),
      after_state: JSON.stringify({ action, limit, windowHours }),
      reason: 'Reserved before a Base44 credit-consuming integration call to prevent automated abuse.'
    });
  } catch (error) {
    console.error('Credit guard audit failed', error);
    return { allowed:false, response:Response.json({ error:'Usage protection is temporarily unavailable. Please try again later.' }, { status:503 }) };
  }
  return { allowed:true, response:null };
}

async function hasDirectoryAccess(base44:any, user:any, listingSlug:string) {
  if (user.role === 'admin') return true;
  if (!listingSlug) return false;
  const rows = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug:listingSlug, user_id:user.id, status:'active' });
  return !!rows?.length;
}

async function canManageTournament(base44:any, user:any, tournamentId:string) {
  if (user.role === 'admin') return true;
  if (!tournamentId) return false;
  const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id:tournamentId });
  const tournament = tournaments?.[0];
  if (!tournament) return false;
  const sameClubAdmin = user.approval_status === 'approved' && user.active_club_role === 'club_admin' &&
    String(tournament.tenant_id || '') === String(user.active_tenant_id || '') &&
    (!tournament.host_club_id || String(tournament.host_club_id) === String(user.active_club_id || ''));
  if (sameClubAdmin) return true;
  const grants = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:tournamentId, user_id:user.id, status:'active' });
  const now = Date.now();
  return (grants || []).some((g:any) =>
    ['event_manager','event_host'].includes(g.role) &&
    (!g.starts_at || Date.parse(g.starts_at) <= now) &&
    (!g.ends_at || Date.parse(g.ends_at) >= now) &&
    (!tournament.tenant_id || String(g.tenant_id || '') === String(tournament.tenant_id || ''))
  );
}

function validateImage(file:any) {
  if (!(file instanceof File)) return 'Image file required.';
  if (!String(file.type || '').startsWith('image/')) return 'Only image files are allowed.';
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller.';
  return '';
}

function validateImport(file:any) {
  if (!(file instanceof File)) return 'Spreadsheet file required.';
  const name = String(file.name || '').toLowerCase();
  const allowed = ['.csv','.xlsx','.xls'].some(ext => name.endsWith(ext));
  if (!allowed) return 'Only CSV or Excel files are allowed.';
  if (file.size <= 0 || file.size > MAX_IMPORT_BYTES) return 'Spreadsheet must be 12 MB or smaller.';
  return '';
}

const pairsSchema = {
  type:'object',
  properties:{
    pairs:{type:'array',items:{type:'object',properties:{
      pair_name:{type:'string'}, player1_name:{type:'string'}, player2_name:{type:'string'}, club:{type:'string'}, seed:{type:'number'}
    }}}
  }
};

const playersSchema = {
  type:'object',
  properties:{
    headers:{type:'array',items:{type:'string'}},
    rows:{type:'array',items:{type:'object',properties:{
      full_name:{type:'string'}, email:{type:'string'}, phone:{type:'string'}, gender:{type:'string'}, skill_rating:{type:'number'},
      age_group:{type:'string'}, club:{type:'string'}, preferred_position:{type:'string'}, partner_name:{type:'string'}, emergency_contact:{type:'string'}, notes:{type:'string'}
    }}}
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Authentication required.' }, { status:401 });
    const body = await bodyFromRequest(req);
    const action = clean(body.action, 80);

    if (action === 'upload_image') {
      const purpose = clean(body.purpose, 80);
      const file = body.file;
      const imageError = validateImage(file);
      if (imageError) return Response.json({ error:imageError }, { status:400 });

      let allowed = false;
      let contextId = user.id;
      if (purpose === 'directory_logo') {
        const listingSlug = clean(body.listingSlug, 180);
        allowed = await hasDirectoryAccess(base44, user, listingSlug);
        contextId = listingSlug || user.id;
      } else if (purpose === 'profile_avatar') {
        allowed = user.role === 'admin' || user.approval_status === 'approved';
      } else if (purpose === 'club_challenge_logo') {
        const tournamentId = clean(body.tournamentId, 180);
        allowed = await canManageTournament(base44, user, tournamentId);
        contextId = tournamentId || user.id;
      }
      if (!allowed) return Response.json({ error:'You do not have permission to upload this image.' }, { status:403 });

      const guard = await consumeAllowance(base44, user, `upload_${purpose}`, 12, 24, contextId);
      if (!guard.allowed) return guard.response;
      const result = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      return Response.json({ success:true, file_url:result?.file_url || null });
    }

    if (action === 'extract_pairs' || action === 'extract_players') {
      if (user.role !== 'admin') return Response.json({ error:'Administrator access required for spreadsheet extraction.' }, { status:403 });
      const file = body.file;
      const fileError = validateImport(file);
      if (fileError) return Response.json({ error:fileError }, { status:400 });
      const guard = await consumeAllowance(base44, user, action, 8, 24, user.id);
      if (!guard.allowed) return guard.response;
      const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      if (!uploaded?.file_url) return Response.json({ error:'File upload failed.' }, { status:502 });
      const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url:uploaded.file_url,
        json_schema: action === 'extract_pairs' ? pairsSchema : playersSchema,
      });
      return Response.json({ success:true, result });
    }

    if (action === 'dupr_lookup') {
      const playerId = clean(body.playerId, 180);
      const duprId = clean(body.duprId, 120);
      if (!playerId || !duprId) return Response.json({ error:'Player and DUPR ID are required.' }, { status:400 });
      const players = await base44.asServiceRole.entities.Player.filter({ id:playerId });
      const player = players?.[0];
      const ownsPlayer = player && (String(player.user_id || '') === String(user.id) || String(player.linked_user_email || '').toLowerCase() === String(user.email || '').toLowerCase());
      if (user.role !== 'admin' && (!ownsPlayer || user.approval_status !== 'approved')) return Response.json({ error:'You may only sync your own linked player profile.' }, { status:403 });
      const guard = await consumeAllowance(base44, user, 'dupr_lookup', 5, 24, playerId);
      if (!guard.allowed) return guard.response;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:`Look up the current DUPR pickleball rating for DUPR ID: ${duprId}. Use reliable current public information. Return whether a rating was found and the numeric rating only.`,
        add_context_from_internet:true,
        response_json_schema:{type:'object',properties:{rating:{type:'number'},found:{type:'boolean'}}}
      });
      return Response.json({ success:true, result });
    }

    return Response.json({ error:'Unknown protected integration action.' }, { status:400 });
  } catch (error) {
    console.error('secureCreditAction failed', error);
    return Response.json({ error:'The protected integration action could not be completed.' }, { status:500 });
  }
});
