import {strict as assert} from 'node:assert';import {reviewMembershipActivationReconciliation as review} from './activationReconciliation.ts';
const m={id:'m',tenant_id:'t',club_id:'c',person_id:'p',membership_status:'pending_payment',payment_status:'pending'};
const paid={id:'x',tenant_id:'t',club_id:'c',person_id:'p',club_membership_id:'m',purpose_type:'membership',payment_status:'paid'};
const run=(extra:any={})=>review({membership:m,payments:[paid],tenantId:'t',clubId:'c',personId:'p',...extra});
Deno.test('one scoped paid record permits membership activation',()=>assert.equal(run().allowed,true));
Deno.test('duplicate settled payments prevent activation',()=>assert.ok(run({payments:[paid,{...paid,id:'y'}]}).issues.includes('single_settled_payment_required')));
Deno.test('foreign club ledger prevents activation',()=>assert.ok(run({payments:[{...paid,club_id:'foreign'}]}).issues.includes('ledger_scope')));
Deno.test('refunded payment prevents activation',()=>assert.ok(run({payments:[paid,{...paid,id:'y',payment_status:'refunded'}]}).issues.includes('refund_or_dispute')));
Deno.test('already active membership cannot be activated twice',()=>assert.equal(run({membership:{...m,membership_status:'paid_active',payment_status:'paid'}}).alreadyActive,true));
