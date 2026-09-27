import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean = (value:any, max=1000) => String(value ?? '').trim().slice(0, max);

function renderTemplate(text:string, vars:Record<string, any> = {}) {
  return String(text || '').replace(/\{([a-z0-9_]+)\}/gi, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Authentication required' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const action = clean(body.action, 80) || 'resolved';

    if (action === 'resolved') {
      if (user.role !== 'admin' && user.approval_status !== 'approved') {
        return Response.json({ error:'Approved RallyHub access required' }, { status:403 });
      }
      const moduleName = clean(body.module, 80);
      if (!moduleName) return Response.json({ error:'module required' }, { status:400 });
      const tenantId = clean(body.tenantId || user.active_tenant_id, 180);
      const rows = await base44.asServiceRole.entities.AnnouncementTemplate.filter({}, 'sort_order', 500);
      const relevant = (rows || []).filter((row:any) => row.module === moduleName && (row.scope_type === 'platform' || (row.scope_type === 'tenant' && tenantId && row.tenant_id === tenantId)));
      const merged = new Map<string, any>();
      relevant.filter((r:any) => r.scope_type === 'platform').forEach((r:any) => merged.set(r.key, r));
      relevant.filter((r:any) => r.scope_type === 'tenant').forEach((r:any) => merged.set(r.key, r));
      const variables = body.variables && typeof body.variables === 'object' ? body.variables : {};
      const templates = [...merged.values()].sort((a:any,b:any) => Number(a.sort_order || 0) - Number(b.sort_order || 0)).map((row:any) => {
        const selected = row.mode === 'custom' && clean(row.custom_text) ? row.custom_text : row.default_text;
        return {
          id:row.id,
          key:row.key,
          module:row.module,
          label:row.label,
          enabled:row.enabled !== false,
          mode:row.mode || 'default',
          defaultText:row.default_text || '',
          customText:row.custom_text || '',
          text:row.enabled === false ? '' : renderTemplate(selected, variables),
        };
      });
      return Response.json({ success:true, templates, byKey:Object.fromEntries(templates.map((t:any) => [t.key, t])) });
    }

    if (user.role !== 'admin') return Response.json({ error:'Super Admin access required' }, { status:403 });

    if (action === 'admin_list') {
      const rows = await base44.asServiceRole.entities.AnnouncementTemplate.filter({}, 'sort_order', 500);
      return Response.json({ success:true, templates:rows || [] });
    }

    if (action === 'admin_update') {
      const id = clean(body.id, 180);
      if (!id) return Response.json({ error:'id required' }, { status:400 });
      const patch:any = {};
      if (body.mode !== undefined) patch.mode = ['default','custom'].includes(body.mode) ? body.mode : 'default';
      if (body.customText !== undefined) patch.custom_text = clean(body.customText, 1000);
      if (body.enabled !== undefined) patch.enabled = !!body.enabled;
      await base44.asServiceRole.entities.AnnouncementTemplate.update(id, patch);
      return Response.json({ success:true });
    }

    if (action === 'admin_reset') {
      const id = clean(body.id, 180);
      if (!id) return Response.json({ error:'id required' }, { status:400 });
      const row = await base44.asServiceRole.entities.AnnouncementTemplate.get(id);
      if (!row) return Response.json({ error:'Announcement not found' }, { status:404 });
      await base44.asServiceRole.entities.AnnouncementTemplate.update(id, {
        mode:'default',
        custom_text:'',
        enabled:row.default_enabled !== false,
      });
      return Response.json({ success:true });
    }

    return Response.json({ error:'Unknown action' }, { status:400 });
  } catch (error:any) {
    console.error('announcementSettings error', error);
    return Response.json({ error:error?.message || 'Announcement settings failed' }, { status:500 });
  }
});
