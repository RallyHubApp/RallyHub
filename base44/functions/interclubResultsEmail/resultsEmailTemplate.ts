// Clare Pickleball Interclub results email.
// Production standard: protected Clare enriched shell + purpose-specific Interclub body.
// Header/footer/utility shell is shared across Clare enriched email. Body may change by purpose.
// Preview, test and live send must all use this file.

const esc=(v:any)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const first=(v:any)=>String(v??'').trim().split(/\s+/)[0]||'Player';

function utilityLinks(playerLink:string,root:string){
  const items=[
    playerLink?['View My Results',playerLink]:null,
    ['Facebook','https://www.facebook.com/ClarePickleball/'],
    ['Instagram','https://www.instagram.com/clarepickleball/'],
    ['ClarePickleball.ie','https://clarepickleball.ie/'],
    ['RallyHub Directory',`${root}/directory`],
    ['Events',`${root}/events`],
    ['Feedback',`${root}/contact`]
  ].filter(Boolean) as string[][];
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#ffffff"><tr><td align="center" style="padding:8px 12px 13px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:15px;color:#5d6b82">${items.map(([label,url],i)=>`${i?'&nbsp;&nbsp;|&nbsp;&nbsp;':''}<a href="${esc(url)}" target="_blank" style="color:#253c84;text-decoration:underline;font-weight:${label==='View My Results'?'700':'500'}">${esc(label)}</a>`).join('')}</td></tr></table>`;
}

function action(href:string,label:string){
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0;border-collapse:separate">
  <tr><td bgcolor="#ffffff" style="background:#ffffff;border:1.5px solid #0b5bc0;border-radius:8px">
    <a href="${href}" target="_blank" style="display:block;padding:8px 11px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;color:#0755a8;font-size:13px;font-weight:700;line-height:1.2">
      <span style="vertical-align:middle">${label}</span><span style="float:right;font-size:20px;line-height:14px;color:#0755a8">›</span>
    </a>
  </td></tr></table>`;
}

function featureIcon(symbol:string,bg:string,fg:string){
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="42" height="42" align="center" valign="middle" bgcolor="${bg}" style="width:42px;height:42px;background:${bg};border-radius:9px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:42px;font-weight:800;color:${fg}">${symbol}</td></tr></table>`;
}

export function interclubResultsHtml({event,name,url,origin,alertsUrl}:any){
  const root=origin&&/^https?:\/\//i.test(origin)?String(origin).replace(/\/$/,''):'https://rallyhub.ie';
  const asset=(name:string)=>`${root}/email-templates/clare-interclub/${name}`;
  const directory=`${root}/directory`;
  const feedback=`${root}/contact`;
  const a=esc(event?.club_a_name||'Clare');
  const b=esc(event?.club_b_name||'Galway');
  const fn=esc(first(name));
  const resultUrl=esc(url);
  const alerts=esc(alertsUrl||directory);
  const headerTitle=`${a} v ${b}<br>INTERCLUB`;

  const clickableFooter=`
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:0;line-height:0">
    <tr><td colspan="4"><img src="${asset('footer-top.png')}" width="720" alt="Brian Moore · Chairperson, Clare Pickleball · Founder, RallyHub.ie" style="display:block;width:100%;height:auto;border:0"></td></tr>
    <tr>
      <td width="17.09%"><img src="${asset('contact-left.png')}" style="display:block;width:100%;height:auto;border:0"></td>
      <td width="20.02%"><a href="tel:+353878100333"><img src="${asset('contact-phone.png')}" alt="Call 087 810 0333" style="display:block;width:100%;height:auto;border:0"></a></td>
      <td width="29.79%"><a href="mailto:clarepb2025@gmail.com"><img src="${asset('contact-email.png')}" alt="Email Clare Pickleball" style="display:block;width:100%;height:auto;border:0"></a></td>
      <td width="33.10%"><a href="https://clarepickleball.ie/" target="_blank"><img src="${asset('contact-web.png')}" alt="ClarePickleball.ie" style="display:block;width:100%;height:auto;border:0"></a></td>
    </tr>
    <tr><td colspan="4" valign="top" bgcolor="#f2cf33" style="background:#f2cf33;font-size:0;line-height:0;vertical-align:top"><img src="${asset('footer-mid.png')}" style="display:block;width:100%;height:auto;border:0;vertical-align:top"></td></tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0755a8" style="border-collapse:collapse;border-spacing:0;background:#0755a8;font-size:0;line-height:0;mso-table-lspace:0pt;mso-table-rspace:0pt">
    <tr>
      <td width="41.02%"><img src="${asset('social-left.png')}" alt="Clare Pickleball" style="display:block;width:100%;height:auto;border:0"></td>
      <td width="7.81%"><a href="https://www.facebook.com/ClarePickleball/" target="_blank"><img src="${asset('social-facebook.png')}" alt="Facebook" style="display:block;width:100%;height:auto;border:0"></a></td>
      <td width="7.81%"><a href="https://www.instagram.com/clarepickleball/" target="_blank"><img src="${asset('social-instagram.png')}" alt="Instagram" style="display:block;width:100%;height:auto;border:0"></a></td>
      <td width="7.81%"><a href="https://clarepickleball.ie/" target="_blank"><img src="${asset('social-web.png')}" alt="Website" style="display:block;width:100%;height:auto;border:0"></a></td>
      <td width="3.91%"><img src="${asset('social-gap.png')}" style="display:block;width:100%;height:auto;border:0"></td>
      <td width="31.64%"><a href="https://rallyhub.ie/" target="_blank"><img src="${asset('social-rallyhub.png')}" alt="RallyHub.ie" style="display:block;width:100%;height:auto;border:0"></a></td>
    </tr>
  </table>`;

  return `<!doctype html><html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
  <style>
    html,body{margin:0!important;padding:0!important;width:100%!important}
    table{border-spacing:0}
    img{max-width:100%;height:auto}
    @media only screen and (max-width:600px){
      .email-shell{width:100%!important;max-width:100%!important}
      .email-pad{padding-left:18px!important;padding-right:18px!important}
      .header-title{font-size:27px!important;line-height:.9!important}
      .header-sub{font-size:11px!important;margin-top:5px!important}
      .header-logo{width:128px!important}
      .header-art{width:100%!important;max-width:none!important;height:112px!important;object-fit:cover!important}
      .stack-col{display:block!important;width:100%!important}
      .stack-gap{display:block!important;height:10px!important;width:100%!important}
    }
  </style></head>
  <body bgcolor="#f3f3f3" style="margin:0;background:#f3f3f3;color:#253c84">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f3f3">
  <tr><td align="center">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:100%;max-width:600px;background:#fff;border-collapse:collapse">

  <!-- APPROVED CLARE HEADER -->
  <tr><td style="height:6px;background:#0755a8;border-bottom:2px solid #f2cf33;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:0;background:#fff">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed">
      <tr>
        <td width="27%" align="left" valign="middle" style="width:27%;padding:0 2px 0 4px;background:#fff"><img class="header-logo" src="${asset('clare-logo-transparent.png')}" width="185" alt="Clare Pickleball logo" style="display:block;width:185px;max-width:100%;height:auto;border:0;margin:0 auto"></td>
        <td width="43%" align="center" valign="middle" style="width:43%;padding:4px 0 3px;font-family:Arial,Helvetica,sans-serif;background:#fff">
          <div class="header-title" style="font-size:39px;line-height:.89;letter-spacing:-1.2px;font-weight:900;color:#0755a8;text-transform:uppercase">${headerTitle}</div>
          <div class="header-sub" style="margin-top:9px;font-size:14px;line-height:1;font-weight:900;letter-spacing:1.9px;color:#253c84">Your Personal Results</div>
        </td>
        <td width="30%" height="138" align="right" valign="top" style="width:30%;height:138px;padding:0;overflow:hidden;line-height:0;background:#fff"><img class="header-art" src="${asset('header-right-clean.png')}" width="180" height="138" alt="Pickleball" style="display:block;width:180px;max-width:none;height:138px;border:0;margin:0;object-fit:cover"></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="height:6px;background:#0755a8;border-bottom:2px solid #f2cf33;font-size:0;line-height:0">&nbsp;</td></tr>

  <!-- INTERCLUB BODY -->
  <tr><td class="email-pad" style="padding:20px 25px 8px;font-family:Arial,Helvetica,sans-serif;color:#253c84;font-size:15px;line-height:1.5;font-weight:500">
    <p style="margin:0 0 10px">Hi ${fn},</p>
    <p style="margin:0 0 12px">Thanks very much for taking part in the <strong>${a} v ${b} Interclub</strong>. We hope you enjoyed the games and the chance to meet and play with people from both clubs.</p>
    <p style="margin:0">Your individual results are now available below. You can see your own games and scores, your overall performance, the final team result and both team podiums.</p>
  </td></tr>

  <tr><td align="center" style="padding:10px 25px 18px">
    <table role="presentation" width="360" cellspacing="0" cellpadding="0" border="0" style="width:360px;max-width:100%;border-collapse:separate">
      <tr><td bgcolor="#0755a8" style="background:#0755a8;border-radius:11px;box-shadow:0 6px 14px rgba(10,42,89,.15)">
        <a href="${resultUrl}" target="_blank" style="display:block;text-decoration:none;color:#fff">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td width="62" align="center" valign="middle" style="width:62px;padding:11px 0"><div style="font-family:Arial,Helvetica,sans-serif;color:#ffd400;font-size:22px;line-height:22px;font-weight:900;letter-spacing:1px">▮▮▮</div></td>
            <td valign="middle" style="padding:11px 8px;font-family:Arial,Helvetica,sans-serif;color:#fff;font-size:17px;line-height:20px;font-weight:800">View My Results</td>
            <td width="34" align="center" valign="middle" style="width:34px;padding-right:9px;font-family:Arial,Helvetica,sans-serif;color:#fff;font-size:28px;line-height:28px;font-weight:300">›</td>
          </tr></table>
        </a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 17px 10px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eef7ff" style="background:#eef7ff;border-radius:11px;border-collapse:separate">
      <tr>
        <td width="64" valign="middle" align="center" style="width:64px;padding:13px 0 13px 10px">${featureIcon('★','#ffffff','#f2b800')}</td>
        <td style="padding:13px 16px 13px 13px;font-family:Arial,Helvetica,sans-serif;color:#253c84">
          <div style="font-size:16px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:4px">Looking forward to the return fixture</div>
          <div style="font-size:13px;line-height:1.45;font-weight:500">This is the start of what we hope will become a regular home-and-away Interclub fixture, with a perpetual trophy between ${a} and ${b}. The next meeting will be in Galway, and we’re already looking forward to playing you again.</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 17px 11px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
      <td class="stack-col" width="49%" valign="top" style="width:49%">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eef7ff" style="background:#eef7ff;border-radius:11px;border-collapse:separate">
          <tr>
            <td width="54" valign="top" align="center" style="width:54px;padding:14px 0 14px 8px">${featureIcon('●','#0755a8','#ffffff')}</td>
            <td style="padding:13px 13px 14px 10px;font-family:Arial,Helvetica,sans-serif;color:#253c84">
              <div style="font-size:15px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">Photos from today</div>
              <div style="font-size:12px;line-height:1.45;font-weight:500">Photographs from the day will be shared via Clare Pickleball social media. We may share photographs we receive, and may also send a separate gallery link afterwards.</div>
            </td>
          </tr>
        </table>
      </td>
      <td class="stack-gap" width="2%" style="width:2%;font-size:0;line-height:0">&nbsp;</td>
      <td class="stack-col" width="49%" valign="top" style="width:49%">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eef7ff" style="background:#eef7ff;border-radius:11px;border-collapse:separate">
          <tr>
            <td width="54" valign="top" align="center" style="width:54px;padding:14px 0 14px 8px">${featureIcon('R','#20a766','#ffffff')}</td>
            <td style="padding:13px 13px 14px 10px;font-family:Arial,Helvetica,sans-serif;color:#253c84">
              <div style="font-size:15px;line-height:1.2;font-weight:800;color:#0755a8;margin-bottom:5px">More pickleball with RallyHub</div>
              <div style="font-size:12px;line-height:1.45;font-weight:500">Discover clubs, venues, sessions and events around Ireland, and keep up with the pickleball alerts that interest you.</div>
              ${action(directory,'Explore the RallyHub Directory')}
              ${action(alerts,'Get pickleball event alerts')}
              ${action(feedback,'Send us your feedback')}
            </td>
          </tr>
        </table>
      </td>
    </tr></table>
  </td></tr>

  <tr><td class="email-pad" style="padding:3px 25px 19px;font-family:Arial,Helvetica,sans-serif;color:#253c84;font-size:14px;line-height:1.48;font-weight:500">
    Thanks again for being part of the day. We look forward to welcoming you back on court and to the next ${a} v ${b} meeting in Galway.
  </td></tr>

  <!-- APPROVED CLARE FOOTER -->
  <tr><td>${clickableFooter}</td></tr>
  <tr><td>${utilityLinks(resultUrl,root)}</td></tr>

  </table></td></tr></table></body></html>`;
}

export function interclubResultsText({event,name,url,alertsUrl}:any){
  const a=event?.club_a_name||'Clare', b=event?.club_b_name||'Galway';
  return `Hi ${first(name)},

Thanks very much for taking part in the ${a} v ${b} Interclub.

Your individual results are ready:
${url}

Looking forward to the return fixture
We hope this becomes a regular home-and-away fixture between ${a} and ${b}.

Photos from today
Photographs from the day will be shared via Clare Pickleball social media and may also be shared by gallery link.

More pickleball with RallyHub
Explore the RallyHub Directory: https://rallyhub.ie/directory
Get pickleball event alerts: ${alertsUrl||'https://rallyhub.ie/directory'}
Send us feedback: https://rallyhub.ie/contact

Thanks again for being part of the day.

Clare Pickleball
Powered by RallyHub`;
}
