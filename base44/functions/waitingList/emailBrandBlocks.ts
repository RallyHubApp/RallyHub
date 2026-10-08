export type EmailBrandContact = {
  signoff?: string;
  name?: string;
  role?: string;
  organisation?: string;
  phone_whatsapp?: string;
  phone_href?: string;
  whatsapp_href?: string;
  email?: string;
  email_href?: string;
  website?: string;
  website_label?: string;
};

export type EmailUtilityLink = {
  label: string;
  url: string;
  accent?: boolean;
};

const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);

export function emailSignatureBlockHtml({
  contact,
  primary='#07184c',
  secondary='#078e48',
}:{
  contact:EmailBrandContact;
  primary?:string;
  secondary?:string;
}){
  if(!contact?.name)return '';
  const websiteLabel=contact.website_label||String(contact.website||'').replace(/^https?:\/\//,'').replace(/\/$/,'');
  const icon=(glyph:string)=>`<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:${esc(primary)};color:#fff;font-size:11px;font-weight:800;margin-right:8px;">${glyph}</span>`;
  return `<div style="margin-top:26px;padding-top:20px;border-top:1px solid #e2e8f0;">
    <p style="margin:0 0 7px;font-size:15px;line-height:1.5;color:#334155;">${esc(contact.signoff||'Yours in sport,')}</p>
    <p style="margin:0;font-size:20px;font-weight:800;line-height:1.25;color:${esc(primary)};">${esc(contact.name)}</p>
    ${contact.role?`<p style="margin:4px 0 0;font-size:13px;font-weight:800;line-height:1.35;color:${esc(secondary)};">${esc(contact.role)}</p>`:''}
    ${contact.organisation?`<p style="margin:2px 0 0;font-size:13px;font-weight:700;line-height:1.35;color:#475569;">${esc(contact.organisation)}</p>`:''}
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:12px;font-size:12px;line-height:1.6;color:#64748b;">
      ${(contact.phone_href||contact.whatsapp_href)?`<tr><td style="padding:3px 0;vertical-align:middle;">${icon('☎')}</td><td style="padding:3px 0;vertical-align:middle;">${contact.phone_href?`<a href="${esc(contact.phone_href)}" style="color:${esc(primary)};text-decoration:none;font-weight:700;">${esc(contact.phone_whatsapp||'Phone')}</a>`:''}${contact.whatsapp_href?` <span style="color:#cbd5e1;padding:0 5px;">·</span><a href="${esc(contact.whatsapp_href)}" style="color:${esc(secondary)};text-decoration:none;font-weight:800;">WhatsApp</a>`:''}</td></tr>`:''}
      ${contact.email_href?`<tr><td style="padding:3px 0;vertical-align:middle;">${icon('✉')}</td><td style="padding:3px 0;vertical-align:middle;"><a href="${esc(contact.email_href)}" style="color:${esc(primary)};text-decoration:none;">${esc(contact.email||'Email')}</a></td></tr>`:''}
      ${contact.website?`<tr><td style="padding:3px 0;vertical-align:middle;">${icon('↗')}</td><td style="padding:3px 0;vertical-align:middle;"><a href="${esc(contact.website)}" style="color:${esc(primary)};text-decoration:none;font-weight:700;">${esc(websiteLabel)}</a></td></tr>`:''}
    </table>
  </div>`;
}

export function emailUtilityMenuHtml({
  links=[],
  primary='#07184c',
  secondary='#078e48',
}:{
  links?:EmailUtilityLink[];
  primary?:string;
  secondary?:string;
}){
  const valid=(links||[]).filter(x=>x?.label&&x?.url);
  if(!valid.length)return '';
  return `<div style="padding:14px 24px;border-top:1px solid #e7eeec;background:#ffffff;text-align:center;font-size:11px;line-height:1.7;color:#64748b;">${valid.map((item,index)=>`${index?'<span style="color:#cbd5e1;padding:0 7px;">·</span>':''}<a href="${esc(item.url)}" style="color:${esc(item.accent?secondary:primary)};font-weight:${item.accent?'800':'700'};text-decoration:none;">${esc(item.label)}</a>`).join('')}</div>`;
}
