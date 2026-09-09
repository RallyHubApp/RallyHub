import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { ungzip } from 'npm:pako@2.1.0';

const MIGRATION_ID = 'clare-membership-2026-27-20260909';
const CONFIRM = 'INSPECT_CLARE_152_V2';

async function decodePayload(b64:string){
  let clean = String(b64 || '').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
  while (clean.length % 4) clean += '=';
  const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
  const text = new TextDecoder().decode(ungzip(bytes));
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== CONFIRM) return Response.json({ error:'confirmation required' }, { status:403 });
    const rows = (await base44.asServiceRole.entities.MembershipMigrationStaging.filter({ migration_id:MIGRATION_ID }))
      .sort((a:any,b:any)=>Number(a.batch_no)-Number(b.batch_no));
    const batches:any[] = rows.map((row:any)=>({batch_no:row.batch_no,payload_length:String(row.payload_base64||'').length}));
    const joined = rows.map((r:any)=>String(r.payload_base64||'')).join('');
    const decoded = await decodePayload(joined);
    const items = Array.isArray(decoded) ? decoded : (decoded.records || decoded.people || decoded.members || decoded.items || []);
    const sample = Array.isArray(items) && items.length ? items[0] : decoded;
    const summary = {
      success:true, staging_rows:rows.length, joined_length:joined.length,
      inferred_total:Array.isArray(items)?items.length:null,
      top_level_type:Array.isArray(decoded)?'array':typeof decoded,
      top_level_keys:decoded && !Array.isArray(decoded) && typeof decoded==='object'?Object.keys(decoded).sort():[],
      item_keys:sample && typeof sample==='object'?Object.keys(sample).sort():[],
      nested_shapes:sample && typeof sample==='object'?Object.fromEntries(Object.entries(sample).filter(([_,v])=>v&&typeof v==='object').map(([k,v]:any)=>[k,Array.isArray(v)?`array:${v.length}`:`object:${Object.keys(v).sort().join(',')}`])):{},
      batches
    };
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id:'6a9b7790bc4a8d299938bda9', club_id:'6a9b779684daba85b3ffdeb5',
      user_id:'system-membership-import', action:'membership_migration_staging_inspected', entity_type:'MembershipMigrationStaging',
      entity_id:rows?.[0]?.id || MIGRATION_ID, scope_type:'Club', scope_id:'6a9b779684daba85b3ffdeb5', after_state:JSON.stringify(summary),
      reason:'One-time structure-only inspection before 152-member import'
    });
    return Response.json(summary);
  } catch (e) {
    return Response.json({ success:false, error:String((e as any)?.message || e) }, { status:500 });
  }
});