const MAIL_SECRET_PROPERTY = 'RALLYHUB_MAIL_GATEWAY_SECRET';

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty(MAIL_SECRET_PROPERTY);
    if (!expected || body.secret !== expected) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
    }

    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim();
    const textBody = String(body.textBody || '');
    const htmlBody = String(body.htmlBody || '');
    const senderName = String(body.senderName || 'Clare Pickleball').trim();
    const replyTo = String(body.replyTo || Session.getActiveUser().getEmail() || '').trim();

    if (!to || !subject || !textBody) {
      return jsonResponse({ ok: false, error: 'Missing to, subject or textBody' }, 400);
    }

    GmailApp.sendEmail(to, subject, textBody, {
      htmlBody: htmlBody || undefined,
      name: senderName,
      replyTo: replyTo || undefined,
    });

    return jsonResponse({
      ok: true,
      sender: Session.getActiveUser().getEmail(),
      to,
      subject,
      sentAt: new Date().toISOString(),
    }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message || err) }, 500);
  }
}

function jsonResponse(payload, statusCode) {
  // Apps Script ContentService does not expose arbitrary HTTP status codes reliably,
  // so callers must inspect payload.ok as well as the HTTP response.
  return ContentService
    .createTextOutput(JSON.stringify({ ...payload, statusCode }))
    .setMimeType(ContentService.MimeType.JSON);
}
