// Shared Communications Centre renderer for membership paid confirmations.
// Draft templates are deliberately excluded from automatic sending.
const escape=(v:any)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function membershipPaidTemplate(base44:any,config:any,club:any,app:any,legacy:{subject:string,textBody:string,htmlBody:string}){
  const tenantId=app.tenant_id||config.tenant_id;
  const clubId=app.club_id||config.club_id;
  const templates=await base44.asServiceRole.entities.CommunicationTemplate.filter({tenant_id:tenantId,purpose:'membership_paid_welcome'},'-updated_date',30);
  const approved=(templates||[]).find((t:any)=>t.status==='approved'&&(!t.club_id||t.club_id===clubId));
  if(!approved)return legacy;
  const first=String(app.full_name||'').trim().split(/\s+/)[0]||'Member';
  const amount=Number(app.membership_fee||0);
  const currency=app.currency||config.currency||'EUR';
  const fee=new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(amount);
  const fields:Record<string,string>={
    FIRST_NAME:first,FULL_NAME:String(app.full_name||''),CLUB_NAME:String(club.name||''),
    MEMBERSHIP_SEASON:String(app.membership_season||''),MEMBERSHIP_REFERENCE:String(app.confirmation_code||''),
    MEMBERSHIP_FEE:fee,PAYMENT_DATE:String(app.paid_at||'').slice(0,10),
    PAYMENT_STATUS:'Paid',MEMBERSHIP_STATUS:'Confirmed',
    HALL_CONTRIBUTION:String(config.hall_contribution||config.spond_hall_contribution||'€5.50'),
    APPROVED_SIGNATURE:[config.signatory_name,config.signatory_title].filter(Boolean).join(' · ')||String(club.name||'Club team')
  };
  const merge=(s:string,html=false)=>String(s||'').replace(/{{\s*([A-Za-z_]+)\s*}}/g,(_m,k)=>html?escape(fields[k]??''):fields[k]??'');
  const subject=merge(approved.subject_template||legacy.subject);
  const textBody=merge(approved.plain_text_template||legacy.textBody);
  const rawHtml=approved.html_template?merge(approved.html_template.replace(/<p[^>]*>\s*{{APPROVED_SIGNATURE}}\s*<\/p>/gi,''),true):escape(textBody).replace(/\n/g,'<br>');
  // The saved template is body content only. Presentation is always sourced
  // from the active Communications Centre brand kit, never from ad-hoc colours.
  const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:tenantId},'-updated_date',50);
  const brand=(kits||[]).find((k:any)=>k.id===approved.brand_kit_id&&k.status==='active'&&(!k.club_id||k.club_id===clubId));
  if(!brand)throw new Error('Approved membership email brand kit is missing or inactive');
  const primary=escape(brand.colours?.primary||'#2667F2');
  const secondary=escape(brand.colours?.secondary||'#FACC15');
  const contact=brand.contact||{};
  const logo=brand.logos?.primary;
  const footer=brand.compliance_footer?.powered_by_html||'';
  const signature=\`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;background:#f8fafc;border:1px solid #dbe5f1;border-collapse:separate;border-radius:12px"><tr><td width="5" bgcolor="${secondary}" style="width:5px;background:${secondary}">&nbsp;</td><td style="padding:17px 20px"><div style="font-size:14px;color:#475569">${escape(contact.signoff||'Yours in sport,')}</div><div style="margin-top:6px;font-size:17px;font-weight:800;color:${primary}">${escape(contact.name||'')}</div><div style="font-size:13px;font-weight:bold">${escape(contact.role||'')}</div><div style="font-size:13px;font-weight:bold;color:${primary}">${escape(contact.organisation||'')}</div><div style="margin-top:10px;font-size:12px;line-height:1.8"><a href="${escape(contact.phone_href||'')}" style="color:${primary}">${escape(contact.phone_whatsapp||'')}</a><br><a href="${escape(contact.email_href||'')}" style="color:${primary}">${escape(contact.email||'')}</a><br><a href="${escape(contact.website||'')}" style="color:${primary}">${escape(contact.website||'')}</a></div></td></tr></table>\`;
  const utility=\`<div style="text-align:center;padding:14px;font-size:12px;line-height:1.8"><a href="https://clarepickleball.ie/" style="color:${primary}">Website</a> &nbsp;·&nbsp; <a href="https://www.facebook.com/ClarePickleball/" style="color:${primary}">Facebook</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/clarepickleball/" style="color:${primary}">Instagram</a></div>\`;
  const bodyContent=rawHtml.replace(/<p[^>]*>\s*{{APPROVED_SIGNATURE}}\s*<\/p>/gi,'').replace(/<p[^>]*>\s*(?:Yours in sport[^<]*|Brian Moore[^<]*)<\/p>\s*$/i,'');
  // The placeholder has already been merged; remove only its trailing standalone paragraph.
  const signedContent=bodyContent.replace(/<p[^>]*>\s*<strong>[^<]*Brian Moore[^<]*<\/strong>\s*<\/p>\s*$/i,'');
  const htmlBody=\`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head><body bgcolor="${escape(brand.colours?.page_background||'#f4f7fb')}" style="margin:0;padding:0;background:${escape(brand.colours?.page_background||'#f4f7fb')};font-family:Arial,Helvetica,sans-serif;color:#172033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:20px 8px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${Number(brand.layout?.email_max_width||640)}px;background:white;border:1px solid #d9e1ec;border-radius:16px;overflow:hidden"><tr><td style="height:7px;background:${primary};border-bottom:3px solid ${secondary}"></td></tr><tr><td align="center" style="padding:25px 20px 14px">${logo?\`<img src="${escape(logo)}" alt="${escape(club.name||'Clare Pickleball')} logo" width="95" style="display:block;width:95px;height:auto;max-width:100%;border:0;margin:auto">\`:''}</td></tr><tr><td style="padding:12px 26px 26px"><h1 style="margin:0 0 20px;font-size:23px;color:${primary}">Welcome to ${escape(club.name||'Clare Pickleball')}</h1>${signedContent}${signature}</td></tr><tr><td>${utility}</td></tr><tr><td style="padding:14px;background:#f4f7fb">${footer}</td></tr><tr><td style="height:6px;background:${primary};border-top:3px solid ${secondary}"></td></tr></table></td></tr></table></body></html>\`;
  return {subject,textBody,htmlBody};
}
