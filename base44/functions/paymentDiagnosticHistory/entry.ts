import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { historyScope } from './diagnostics.mjs';
Deno.serve(async req=>{
  try {
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me().catch(()=>null);
    const scope=historyScope(user);
    if(!scope)return Response.json({error:'Forbidden'},{status:403});
    const body=await req.json().catch(()=>({}));
    const query={...scope};
    if(typeof body.checkout_id==='string'&&body.checkout_id)Object.assign(query,{checkout_id:body.checkout_id.slice(0,180)});
    const rows=await base44.asServiceRole.entities.PaymentDiagnosticEvent.filter(query,'-created_date',100);
    return Response.json({events:rows.filter((r:any)=>r.scope===scope.scope&&r.tenant_id===scope.tenant_id&&r.club_id===scope.club_id)});
  } catch {return Response.json({error:'Diagnostic history unavailable'},{status:503});}
});
