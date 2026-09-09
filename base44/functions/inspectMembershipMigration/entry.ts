import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MIGRATION_ID = 'clare-membership-2026-27-20260909';
const CONFIRM = 'INSPECT_CLARE_152_V2';

async function decodePayload(b64:string){
  let clean = String(b64 || '').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
  while (clean.length % 4) clean += '=';
  const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const decompressed = new Response(new Blob([bytes]).stream().pipeThrough(ds));
  return JSON.parse(await decompressed.text());
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== CONFIRM) return Response.json({ error:'confirmation required' }, { status:403 });
    const rows = (await base44.asServiceRole.entities.MembershipMigrationStaging.filter({ migration_id:MIGRATION_ID }))
      .sort((a:any,b:any)=>Number(a.batch_no)-Number(b.batch_no));
    const batches:any[] = [];
    let total = 0;
    for (const row of rows) {
      const raw = String(row.payload_base64 || '');
      const invalid = [...new Set((raw.match(/[^A-Za-z0-9+\/_=\-\s]/g) || []))].slice(0,20);
      if (invalid.length) {
        batches.push({batch_no:row.batch_no,payload_length:raw.length,invalid_chars:invalid,prefix:raw.slice(0,4),suffix:raw.slice(-4)});
        continue;
      }
      const eq:any[]=[]; for(let i=0;i<raw.length;i++) if(raw[i]==='=') eq.push(i);
      batches.push({batch_no:row.batch_no,payload_length:raw.length,mod4:raw.length%4,equals_count:eq.length,equals_first:eq.slice(0,10),equals_last:eq.slice(-10),prefix:raw.slice(0,4),suffix:raw.slice(-4)});
    }
    const summary = { success:true, staging_rows:rows.length, inferred_total:total, batches };
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