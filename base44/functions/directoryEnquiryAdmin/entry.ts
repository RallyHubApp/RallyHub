import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';

// Directory Command Centre domain boundary. Independent of club/tenant roles.
const DIRECTORY_SUPERADMINS = new Set([
  '6a0b5afd3f4b9681265a1398',
  '6a01dc00702b7dd2a2978c29',
]);
const clean = (value:any, limit=500) => String(value ?? '').trim().slice(0, limit);
const json = (value:any, status=200) => Response.json(value, {status,headers:{'Cache-Control':'no-store, max-age=0'}});
const directorySuperAdmin = (user:any) => !!user && user.role === 'admin' && DIRECTORY_SUPERADMINS.has(String(user.id || ''));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Check server-authenticated identity before any service-role entity access.
    const user = await base44.auth.me().catch(() => null);
    if (!directorySuperAdmin(user)) return json({error:'Directory super-admin access required.'},403);
    const body = await req.json().catch(() => ({}));
    const action = clean(body.action,80);
    if (action === 'admin_inbox') {
      const [enquiries, contactActions, followups] = await Promise.all([
        base44.asServiceRole.entities.DirectoryContactEnquiry.list('-sent_at',500),
        base44.asServiceRole.entities.DirectoryContactAction.list('-created_at',500),
        base44.asServiceRole.entities.DirectoryEnquiryFollowup.list('-updated_at',500),
      ]);
      const followupByEnquiry = new Map<string,any>((followups||[]).map((f:any)=>[String(f.enquiry_id||''),f]));
      const rows = (enquiries||[]).map((item:any)=>({
        id:String(item.id||''),kind:'enquiry',listingSlug:clean(item.listing_slug,180),
        listingName:clean(item.listing_name,240),senderName:clean(item.sender_name,160),
        senderEmail:clean(item.sender_email,240),message:clean(item.message,2000),
        sourcePath:clean(item.source_path,500),channel:'email',
        status:clean(item.delivery_status,40),deliveryProvider:clean(item.delivery_provider,80),
        createdAt:item.sent_at || item.created_date || '',
        followupStatus:clean(followupByEnquiry.get(String(item.id||''))?.status||'open',32),
        internalNote:clean(followupByEnquiry.get(String(item.id||''))?.internal_note,2000),
        followupUpdatedAt:followupByEnquiry.get(String(item.id||''))?.updated_at||'',
      }));
      const actions = (contactActions||[]).map((item:any)=>({
        id:String(item.id||''),kind:'contact_action',listingSlug:clean(item.listing_slug,180),
        listingName:clean(item.listing_name,240),channel:clean(item.channel,40),
        actionType:clean(item.action_type,40),status:clean(item.status,40),
        sourceSurface:clean(item.source_surface,120),createdAt:item.created_at || item.created_date || '',
      }));
      return json({success:true,enquiries:rows,contactActions:actions,limits:{enquiries:500,contactActions:500}});
    }
    if (action === 'admin_set_followup') {
      const enquiryId = clean(body.enquiryId,140);
      const status = clean(body.status,32);
      const internalNote = clean(body.internalNote,2000);
      if (!/^[a-zA-Z0-9_-]{8,140}$/.test(enquiryId)) return json({error:'Valid enquiry ID required.'},400);
      if (!['open','in_progress','resolved'].includes(status)) return json({error:'Invalid follow-up status.'},400);
      const original = await base44.asServiceRole.entities.DirectoryContactEnquiry.filter({id:enquiryId},'-sent_at',1);
      if (!original?.[0]) return json({error:'Directory enquiry not found.'},404);
      const existing = await base44.asServiceRole.entities.DirectoryEnquiryFollowup.filter({enquiry_id:enquiryId},'-updated_at',1);
      const payload = {enquiry_id:enquiryId,status,internal_note:internalNote,updated_by_user_id:user.id,updated_at:new Date().toISOString()};
      if (existing?.[0]) await base44.asServiceRole.entities.DirectoryEnquiryFollowup.update(existing[0].id,payload);
      else await base44.asServiceRole.entities.DirectoryEnquiryFollowup.create(payload);
      return json({success:true,enquiryId,status,updatedAt:payload.updated_at});
    }
    return json({error:'Unsupported Directory CRM action.'},400);
  } catch(error) {
    console.error('directoryEnquiryAdmin failed',error);
    return json({error:'Directory CRM request could not be completed.'},500);
  }
});
