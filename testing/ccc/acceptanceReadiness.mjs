/** Conservative source-level release inventory. Presence is evidence of a component, never end-to-end completion. */
import {existsSync,readFileSync} from 'node:fs';
const root=new URL('../../',import.meta.url);
const read=p=>{const u=new URL(p,root);return existsSync(u)?readFileSync(u,'utf8'):''};
const check=(name,path,pattern)=>({name,source:path,present:pattern?pattern.test(read(path)):!!read(path)});
export function block4AcceptanceInventory(){
 const journeys=[
  {id:'A03-A07',name:'Activity → registration → approval → payment',checks:[check('frontend','src/components/ccc/ClubActivityPlanner.jsx'),check('backend','base44/functions/eventRegistration/entry.ts',/admin_approve/),check('model','base44/entities/EventRegistration.jsonc'),check('permissions','base44/functions/cccActivity/accessGate.mjs',/cccAccessDecision/),check('connected workflow','base44/functions/paymentGatewayWebhook/entry.ts',/EventRegistration/)]},
  {id:'A08-A10',name:'Host attendance → cancellation → closure',checks:[check('frontend','src/components/ccc/ClubHostWorkspace.jsx'),check('backend','base44/functions/cccActivity/entry.ts',/host_checkin/),check('model','base44/entities/ClubActivity.jsonc'),check('permissions','base44/functions/cccActivity/hostPolicy.mjs'),check('connected workflow','base44/functions/cccActivity/closureGate.mjs')]},
  {id:'A12',name:'Two-way email → CRM inbox → reply',checks:[check('frontend','src/pages/CommunicationsCentre.jsx'),check('backend outbound','base44/functions/communicationsEngine/entry.ts',/test_email/),check('conversation model','base44/entities/CommunicationConversation.jsonc'),check('message model','base44/entities/CommunicationMessage.jsonc'),check('inbound email endpoint','base44/functions/communicationsInboundEmail/entry.ts'),check('reply API','base44/functions/communicationsInbox/entry.ts'),check('inbox UI','src/components/communications/ConversationInbox.jsx')]},
  {id:'A18',name:'Centre/club finance → refunds → exceptions',checks:[check('frontend','src/components/ccc/ClubFinanceConsolidation.jsx'),check('backend','base44/functions/cccActivity/financeConsolidation.mjs'),check('model','base44/entities/PaymentRefund.jsonc'),check('permissions','base44/functions/cccActivity/accessGate.mjs'),check('connected workflow','base44/functions/cccActivity/refundRecovery.mjs')]}
 ];
 return {journeys:journeys.map(j=>({...j,sourceComponentsPresent:j.checks.every(c=>c.present),status:'requires_integrated_uat',journeyBuilt:false})),releaseApproved:false,productionVerified:false,reason:'Source presence and automated tests cannot establish permissions, deployed runtime, provider delivery or complete journeys'};
}
