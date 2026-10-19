import { renderBasicBrandedEmail } from './communicationsBasicRenderer.ts';
const esc=(v:any)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const allowedUrl=(v:any)=>{const s=String(v||'');return /^https:\/\//i.test(s)?s:'';};
export async function membershipBasicHtml(base44:any,config:any,club:any,heading:string,bodyHtml:string){
 const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:config.tenant_id},'-updated_date',40);
 const kit=(kits||[]).find((k:any)=>k.status==='active'&&k.tenant_id===config.tenant_id&&(!k.club_id||k.club_id===config.club_id));
 if(!kit)throw Error('Active Communications Centre brand kit unavailable');
 return renderBasicBrandedEmail(bodyHtml,kit,club,club.name||'Clare Pickleball',heading);
}
export async function membershipComms(base44:any,config:any,club:any,purpose:string,fields:Record<string,any>){
 const tenantId=config.tenant_id,clubId=config.club_id;
 const templates=await base44.asServiceRole.entities.CommunicationTemplate.filter({tenant_id:tenantId,purpose},'-updated_date',30);
 const template=(templates||[]).find((t:any)=>t.status==='approved'&&(!t.club_id||t.club_id===clubId));
 if(!template?.plain_text_template||!template?.subject_template)throw Error(`Approved Communications Centre template missing: ${purpose}`);
 const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:tenantId},'-updated_date',40);
 const kit=(kits||[]).find((k:any)=>k.id===template.brand_kit_id&&k.status==='active'&&(!k.club_id||k.club_id===clubId));
 if(!kit)throw Error(`Active Communications Centre brand kit missing: ${purpose}`);
 const merge=(s:string)=>String(s||'').replace(/{{\s*([A-Za-z_]+)\s*}}/g,(_m,k)=>String(fields[k]??''));
 const textBody=merge(template.plain_text_template),subject=merge(template.subject_template);
 const ctaLink=allowedUrl(fields.PRIVATE_MEMBERSHIP_LINK||fields.PAYMENT_LINK);
 const buttonLabel=fields.PRIVATE_MEMBERSHIP_LINK?'Click here to complete your membership and payment':'Click the blue button to pay securely';
 const action=ctaLink?`<p style="margin:20px 0 9px;font-size:17px;font-weight:800;color:#10294c">ACTION REQUIRED: Please click the blue button below to ${fields.PRIVATE_MEMBERSHIP_LINK?'complete your membership and make your payment':'make your membership payment'}.</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td bgcolor="#2667F2" style="border-radius:9px"><a href="${esc(ctaLink)}" style="display:inline-block;padding:16px 22px;border-radius:9px;background:#2667F2;color:#ffffff;font-size:17px;font-weight:800;text-decoration:none">${buttonLabel}</a></td></tr></table><p style="font-size:14px">If the button does not work, copy this link into your browser: <a href="${esc(ctaLink)}">${esc(ctaLink)}</a></p>`:'';
 const plainWithoutLinks=textBody.split('\n').filter(l=>!l.includes('https://')&&!l.includes('PRIVATE_MEMBERSHIP_LINK')).join('\n');
 const blocks=plainWithoutLinks.split(/\n\s*\n/);
 const introduction=blocks.slice(0,2).join('\n\n');
 const rest=blocks.slice(2).join('\n\n');
 const htmlBody=renderBasicBrandedEmail(`<div style="white-space:pre-line;font-size:16px;line-height:1.7">${esc(introduction)}</div>${action}<div style="white-space:pre-line;font-size:16px;line-height:1.7">${esc(rest)}</div>`,kit,club,club.name||'Clare Pickleball',template.channel_templates?.email?.header_title||'Membership',template.channel_templates?.email?.header_subtitle||'');
 return {subject,textBody,htmlBody};
}
