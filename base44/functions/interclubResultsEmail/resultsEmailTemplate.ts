// Reusable, email-client-safe Clare v Galway Interclub results template.
// Keep all presentation here so preview, test and live send always render the same approved design.

const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const first=(v:any)=>String(v??'').trim().split(/\s+/)[0]||'Player';

export function interclubResultsHtml({event,name,url,origin,alertsUrl}:any){
  const base=origin&&/^https?:\/\//i.test(origin)?String(origin).replace(/\/$/,''):'https://rallyhub.ie';
  const header=`${base}/email-templates/clare-interclub/header.png`;
  const footer=`${base}/email-templates/clare-interclub/footer.png`;
  const directory='https://rallyhub.ie/directory';
  const feedback='https://rallyhub.ie/contact';
  const share=`https://wa.me/?text=${encodeURIComponent('Have a look at RallyHub — find pickleball clubs, places to play, tournaments, coaching and events across Ireland: https://rallyhub.ie/directory')}`;
  const a=esc(event?.club_a_name||'Clare');
  const b=esc(event?.club_b_name||'Galway');
  const fn=esc(first(name));
  const resultUrl=esc(url);
  const alerts=esc(alertsUrl||'https://rallyhub.ie/directory');

  const action=(href:string,label:string,icon:string,accent='#0755a8')=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0"><tr><td><a href="${href}" style="display:block;border:2px solid #0b5bc0;border-radius:11px;padding:10px 14px;text-decoration:none;background:#ffffff;color:#0755a8;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1.25"><span style="display:inline-block;width:28px;color:${accent};font-size:20px;vertical-align:middle">${icon}</span><span style="vertical-align:middle">${label}</span><span style="float:right;font-size:22px;line-height:18px">›</span></a></td></tr></table>`;

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body style="margin:0;padding:0;background:#f3f3f3"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f3f3;margin:0;padding:0"><tr><td align="center" style="padding:0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;border-collapse:collapse">
  <tr><td style="padding:0"><img src="${esc(header)}" alt="${a} v ${b} Interclub" width="720" style="display:block;width:100%;max-width:720px;height:auto;border:0;margin:0"></td></tr>
  <tr><td style="padding:18px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#17347c;font-size:16px;line-height:1.48">
    <p style="margin:0 0 10px">Hi ${fn},</p>
    <p style="margin:0 0 12px">Thanks very much for taking part in the <strong>${a} v ${b} Interclub</strong>. We hope you enjoyed the games and the chance to meet and play with people from both clubs.</p>
    <p style="margin:0">Your individual results are now available below. You’ll be able to see your own games and scores, your overall performance, the final team result and both team podiums.</p>
  </td></tr>
  <tr><td style="padding:10px 28px 8px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef7ff;border-radius:14px"><tr><td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;color:#17347c">
      <table role="presentation" width="100%"><tr><td width="62" valign="top" style="font-size:42px;line-height:1;color:#f5b800">🏆</td><td><div style="font-size:19px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:6px">Your results are ready</div><div style="font-size:15px;line-height:1.45">To see all your matches and results, press the blue <strong>“View My Results”</strong> button below.</div></td></tr></table>
      <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin:16px auto 0"><tr><td bgcolor="#0755a8" style="border-radius:12px"><a href="${resultUrl}" style="display:inline-block;padding:14px 34px;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:800;letter-spacing:.1px">▥ &nbsp; View My Results &nbsp; ›</a></td></tr></table>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:8px 28px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f9ff;border-radius:14px"><tr><td style="padding:17px 20px;font-family:Arial,Helvetica,sans-serif;color:#17347c">
      <table role="presentation" width="100%"><tr><td width="62" valign="top" style="font-size:40px;line-height:1;color:#f5b800">🏆</td><td><div style="font-size:18px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">Looking forward to the return fixture</div><div style="font-size:15px;line-height:1.45">This is the start of what we hope will become a regular home-and-away Interclub fixture, with a perpetual trophy between ${a} and ${b}. The next meeting will be in Galway, and we’re already looking forward to playing you again.</div></td></tr></table>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:8px 28px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef7ff;border-radius:14px"><tr><td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;color:#17347c">
      <table role="presentation" width="100%"><tr><td width="62" valign="top" style="font-size:40px;line-height:1;color:#27b44a">▣</td><td><div style="font-size:19px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">More pickleball with RallyHub</div><div style="font-size:15px;line-height:1.45">Discover clubs, venues, sessions and events around Ireland. You can also choose the pickleball alerts you want to receive, and we’d love to hear any ideas from today that could make the next Interclub even better.</div></td></tr></table>
      ${action(directory,'Explore the RallyHub Directory','⌕','#28b54a')}
      ${action(alerts,'Choose my pickleball event alerts','●','#f4b400')}
      ${action(feedback,'Send us your feedback','●','#28b54a')}
      ${action(share,'Share RallyHub with a friend','●','#0755a8')}
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:4px 28px 18px;font-family:Arial,Helvetica,sans-serif;color:#17347c;font-size:16px;line-height:1.45">Thanks again for being part of the day. We look forward to welcoming you back on court and to the next ${a} v ${b} meeting in Galway.</td></tr>
  <tr><td style="padding:0"><img src="${esc(footer)}" alt="Brian Moore · Clare Pickleball · RallyHub" width="720" style="display:block;width:100%;max-width:720px;height:auto;border:0;margin:0"></td></tr>
  <tr><td style="padding:11px 20px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;color:#68758a;text-align:center;background:#ffffff"><a href="${resultUrl}" style="color:#0755a8;font-weight:700">View My Results</a> &nbsp;·&nbsp; <a href="${directory}" style="color:#0755a8">RallyHub Directory</a> &nbsp;·&nbsp; <a href="${alerts}" style="color:#0755a8">Event alerts</a> &nbsp;·&nbsp; <a href="${feedback}" style="color:#0755a8">Feedback</a> &nbsp;·&nbsp; <a href="https://rallyhub.ie" style="color:#0755a8">RallyHub.ie</a></td></tr>
</table></td></tr></table></body></html>`;
}

export function interclubResultsText({event,name,url,alertsUrl}:any){
  const a=event?.club_a_name||'Clare', b=event?.club_b_name||'Galway';
  return `Hi ${first(name)},\n\nThanks for taking part in the ${a} v ${b} Interclub. Your individual results are ready.\n\nTo see all your matches and results, open this link:\n${url}\n\nMore pickleball with RallyHub\nExplore clubs, venues, sessions and events around Ireland: https://rallyhub.ie/directory\nChoose your event alerts: ${alertsUrl||'https://rallyhub.ie/directory'}\nSend feedback: https://rallyhub.ie/contact\n\nThanks again for being part of the day.\n\nClare Pickleball\nPowered by RallyHub`;
}
