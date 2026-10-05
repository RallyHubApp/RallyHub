// Clare v Galway Interclub results email.
// Source of truth: the approved Clare Pickleball artwork and layout already signed off for this event.
// Do not redesign this template. Preview, test and live send must all use this file.

const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const first=(v:any)=>String(v??'').trim().split(/\s+/)[0]||'Player';

export function interclubResultsHtml({event,name,url,origin,alertsUrl}:any){
  const base=origin&&/^https?:\/\//i.test(origin)?String(origin).replace(/\/$/,''):'https://rallyhub.ie';
  const asset=(name:string)=>`${base}/email-templates/clare-interclub/${name}`;
  const directory='https://rallyhub.ie/directory';
  const feedback='https://rallyhub.ie/contact';
  const shareTarget='https://rallyhub.ie/directory?utm_source=interclub_share&utm_medium=referral&utm_campaign=clare_galway_2026';
  const share=`https://wa.me/?text=${encodeURIComponent('Have a look at RallyHub — it brings together pickleball clubs, places to play, tournaments, coaching and events across Ireland. You can join free here: '+shareTarget)}`;
  const a=esc(event?.club_a_name||'Clare');
  const b=esc(event?.club_b_name||'Galway');
  const fn=esc(first(name));
  const resultUrl=esc(url);
  const alerts=esc(alertsUrl||directory);

  const action=(href:string,label:string,accent:string)=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0;border-collapse:separate"><tr><td style="border:2px solid #0b5bc0;border-radius:10px;background:#ffffff"><a href="${href}" target="_blank" style="display:block;padding:10px 14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;color:#0755a8;font-size:15px;font-weight:700;line-height:1.25"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${accent};margin:0 10px 0 2px;vertical-align:middle"></span><span style="vertical-align:middle">${label}</span><span style="float:right;font-size:22px;line-height:17px;color:#0755a8">›</span></a></td></tr></table>`;

  const clickableFooter=`
  <tr><td style="padding:0">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-spacing:0;font-size:0;line-height:0">
      <tr><td colspan="4" style="padding:0"><img src="${esc(asset('footer-top.png'))}" width="720" alt="Brian Moore · Chairperson, Clare Pickleball · Founder, RallyHub.ie" style="display:block;width:100%;height:auto;border:0"></td></tr>
      <tr>
        <td width="17.09%" style="padding:0"><img src="${esc(asset('contact-left.png'))}" width="123" alt="" style="display:block;width:100%;height:auto;border:0"></td>
        <td width="20.02%" style="padding:0"><a href="tel:+353878100333" style="display:block;text-decoration:none"><img src="${esc(asset('contact-phone.png'))}" width="144" alt="Call 087 810 0333" style="display:block;width:100%;height:auto;border:0"></a></td>
        <td width="29.79%" style="padding:0"><a href="mailto:clarepb2025@gmail.com" style="display:block;text-decoration:none"><img src="${esc(asset('contact-email.png'))}" width="214" alt="Email clarepb2025@gmail.com" style="display:block;width:100%;height:auto;border:0"></a></td>
        <td width="33.10%" style="padding:0"><a href="https://clarepickleball.ie/" target="_blank" style="display:block;text-decoration:none"><img src="${esc(asset('contact-web.png'))}" width="238" alt="ClarePickleball.ie" style="display:block;width:100%;height:auto;border:0"></a></td>
      </tr>
      <tr><td colspan="4" style="padding:0"><img src="${esc(asset('footer-mid.png'))}" width="720" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-spacing:0;font-size:0;line-height:0">
      <tr>
        <td width="41.02%" style="padding:0"><img src="${esc(asset('social-left.png'))}" width="295" alt="Clare Pickleball" style="display:block;width:100%;height:auto;border:0"></td>
        <td width="7.81%" style="padding:0"><a href="https://www.facebook.com/ClarePickleball/" target="_blank" style="display:block;text-decoration:none"><img src="${esc(asset('social-facebook.png'))}" width="56" alt="Facebook" style="display:block;width:100%;height:auto;border:0"></a></td>
        <td width="7.81%" style="padding:0"><a href="https://www.instagram.com/clarepickleball/" target="_blank" style="display:block;text-decoration:none"><img src="${esc(asset('social-instagram.png'))}" width="56" alt="Instagram" style="display:block;width:100%;height:auto;border:0"></a></td>
        <td width="7.81%" style="padding:0"><a href="https://clarepickleball.ie/" target="_blank" style="display:block;text-decoration:none"><img src="${esc(asset('social-web.png'))}" width="56" alt="ClarePickleball.ie" style="display:block;width:100%;height:auto;border:0"></a></td>
        <td width="3.91%" style="padding:0"><img src="${esc(asset('social-gap.png'))}" width="28" alt="" style="display:block;width:100%;height:auto;border:0"></td>
        <td width="31.64%" style="padding:0"><a href="https://rallyhub.ie/" target="_blank" style="display:block;text-decoration:none"><img src="${esc(asset('social-rallyhub.png'))}" width="228" alt="RallyHub.ie" style="display:block;width:100%;height:auto;border:0"></a></td>
      </tr>
    </table>
  </td></tr>`;

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body style="margin:0;padding:0;background:#f3f3f3"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f3f3;margin:0;padding:0"><tr><td align="center" style="padding:0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;border-collapse:collapse">
  <tr><td style="padding:0"><img src="${esc(asset('header.png'))}" alt="${a} v ${b} Interclub · Sunday 4 October 2026" width="720" style="display:block;width:100%;max-width:720px;height:auto;border:0;margin:0"></td></tr>

  <tr><td style="padding:10px 28px 4px;font-family:Arial,Helvetica,sans-serif;color:#253c84;font-size:16px;line-height:1.48">
    <p style="margin:0 0 9px">Hi ${fn},</p>
    <p style="margin:0 0 11px">Thanks very much for taking part in the <strong>${a} v ${b} Interclub</strong>. We hope you enjoyed the games and the chance to meet and play with people from both clubs.</p>
    <p style="margin:0 0 8px">Your individual results are now available below. You’ll be able to see your own games and scores, your overall performance, the final team result and both team podiums.</p>
    <p style="margin:10px 0 0;font-weight:700;color:#17347c">To see your results, press the blue “View My Results” button below.</p>
  </td></tr>

  <tr><td align="center" style="padding:10px 28px 18px">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#0755a8" style="border-radius:12px;border-bottom:4px solid #00498e"><a href="${resultUrl}" target="_blank" style="display:block;padding:14px 31px;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:800;line-height:1.15"><span style="color:#ffcc19;letter-spacing:1px">▮▮▮</span>&nbsp;&nbsp; View My Results &nbsp;›</a></td></tr></table>
  </td></tr>

  <tr><td style="padding:0 18px 8px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f8ff;border-radius:13px;border-collapse:separate"><tr>
      <td width="76" valign="middle" align="center" style="padding:16px 0 16px 10px;border-right:2px solid #f4b400"><div style="font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:1;color:#f4b400">★</div></td>
      <td style="padding:15px 18px;font-family:Arial,Helvetica,sans-serif;color:#253c84"><div style="font-size:18px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">Looking forward to the return fixture</div><div style="font-size:15px;line-height:1.45">This is the start of what we hope will become a regular home-and-away Interclub fixture, with a perpetual trophy between ${a} and ${b}. The next meeting will be in Galway, and we’re already looking forward to playing you again.</div></td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:0 18px 10px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef7ff;border-radius:13px;border-collapse:separate"><tr>
      <td width="76" valign="top" align="center" style="padding:18px 0 18px 10px;border-right:2px solid #20a766"><div style="width:42px;height:42px;border-radius:10px;background:#20a766;color:#fff;font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:24px;line-height:42px">R</div></td>
      <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;color:#253c84"><div style="font-size:19px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">More pickleball with RallyHub</div><div style="font-size:15px;line-height:1.45">Discover clubs, venues, sessions and events around Ireland. Join free for the pickleball alerts that interest you, and help us make the next Interclub even better.</div>
        ${action(directory,'Explore the RallyHub Directory','#20a766')}
        ${action(alerts,'Never miss a pickleball event again','#f4b400')}
        ${action(feedback,'Send us your feedback','#20a766')}
        ${action(share,'Share RallyHub with a friend','#0755a8')}
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:5px 28px 16px;font-family:Arial,Helvetica,sans-serif;color:#253c84;font-size:16px;line-height:1.45">Thanks again for being part of the day. We look forward to welcoming you back on court and to the next ${a} v ${b} meeting in Galway.</td></tr>
  ${clickableFooter}
</table></td></tr></table></body></html>`;
}

export function interclubResultsText({event,name,url,alertsUrl}:any){
  const a=event?.club_a_name||'Clare', b=event?.club_b_name||'Galway';
  return `Hi ${first(name)},\n\nThanks very much for taking part in the ${a} v ${b} Interclub.\n\nYour individual results are ready. To see your own games, scores, overall performance, final team result and both team podiums, open this link:\n${url}\n\nLooking forward to the return fixture\nWe hope this becomes a regular home-and-away fixture between ${a} and ${b}.\n\nMore pickleball with RallyHub\nExplore the RallyHub Directory: https://rallyhub.ie/directory\nNever miss a pickleball event again: ${alertsUrl||'https://rallyhub.ie/directory'}\nSend us feedback: https://rallyhub.ie/contact\nShare RallyHub with a friend: https://rallyhub.ie/directory\n\nThanks again for being part of the day.\n\nClare Pickleball\nPowered by RallyHub`;
}
