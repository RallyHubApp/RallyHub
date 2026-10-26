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
  const rawHtml=approved.html_template?merge(approved.html_template,true):escape(textBody).replace(/\n/g,'<br>');
  const htmlBody=approved.html_template?rawHtml:`<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:24px"><table role="presentation" width="100%" style="max-width:640px;margin:auto;background:white;border-collapse:collapse"><tr><td style="height:7px;background:${escape(club.primary_colour||'#10294c')};border-bottom:3px solid ${escape(club.secondary_colour||'#facc15')}"></td></tr><tr><td style="padding:24px"><h2>${escape(club.name||'Membership')}</h2><div style="line-height:1.7">${rawHtml}</div></td></tr><tr><td style="padding:18px;background:#f7f9fc;text-align:center;font-size:12px">Powered by RallyHub</td></tr></table></body></html>`;
  return {subject,textBody,htmlBody};
}
