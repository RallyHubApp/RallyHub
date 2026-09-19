export type EmailScope =
  | { scopeType: 'platform'; purpose: string }
  | { scopeType: 'tenant'; purpose: string; tenantId: string; clubId?: string | null };

export async function resolveEmailTransport(base44: any, scope: EmailScope) {
  const filter: any = {
    scope_type: scope.scopeType,
    purpose: scope.purpose,
  };
  if (scope.scopeType === 'tenant') {
    filter.tenant_id = scope.tenantId;
    if (scope.clubId) filter.club_id = scope.clubId;
  }
  const rows = await base44.asServiceRole.entities.EmailTransportConfig.filter(filter, '-updated_date', 20);
  const config = (rows || []).find((row: any) => row.status !== 'disabled') || null;
  if (!config) {
    throw new Error(`No email transport is configured for ${scope.scopeType}:${scope.purpose}.`);
  }
  return config;
}

export async function requireConfiguredEmailTransport(base44: any, scope: EmailScope) {
  const config = await resolveEmailTransport(base44, scope);
  if (config.status !== 'configured') {
    throw new Error(
      `Email transport for ${scope.scopeType}:${scope.purpose} is not active yet (${config.sender_email || 'sender pending'}).`
    );
  }
  return config;
}

function utf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function mimeHeader(value: string) {
  return `=?UTF-8?B?${utf8Base64(value)}?=`;
}

function gmailRawEmail({
  to,
  senderEmail,
  senderName,
  replyTo,
  subject,
  textBody,
  htmlBody,
}: {
  to: string;
  senderEmail: string;
  senderName: string;
  replyTo?: string | null;
  subject: string;
  textBody: string;
  htmlBody?: string | null;
}) {
  const boundary = `rallyhub_${crypto.randomUUID().replace(/-/g, '')}`;
  const headers = [
    `From: ${mimeHeader(senderName)} <${senderEmail}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo || senderEmail}`,
    `Subject: ${mimeHeader(subject)}`,
    'MIME-Version: 1.0',
  ];
  let mime: string;
  if (htmlBody) {
    mime = [
      ...headers,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      textBody,
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      htmlBody,
      `--${boundary}--`,
      '',
    ].join('\r\n');
  } else {
    mime = [
      ...headers,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      textBody,
    ].join('\r\n');
  }
  return utf8Base64(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function sendWithConfiguredEmailTransport(
  base44: any,
  scope: EmailScope,
  message: { to: string; subject: string; textBody: string; htmlBody?: string | null },
) {
  const config = await requireConfiguredEmailTransport(base44, scope);

  if (config.provider === 'gmail_connector') {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) throw new Error('The Gmail connector is not authorised.');
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: gmailRawEmail({
          to: message.to,
          senderEmail: config.sender_email,
          senderName: config.sender_name,
          replyTo: config.reply_to,
          subject: message.subject,
          textBody: message.textBody,
          htmlBody: message.htmlBody,
        }),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || `Gmail send failed (${response.status})`);
    return { provider: config.provider, senderEmail: config.sender_email, payload };
  }

  if (config.provider === 'base44_core') {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: message.to,
      from_name: config.sender_name,
      subject: message.subject,
      body: message.textBody,
    });
    return { provider: config.provider, senderEmail: config.sender_email };
  }

  throw new Error(
    `Email provider ${config.provider} is configured for ${scope.scopeType}:${scope.purpose}, but its secure transport endpoint is not connected yet.`
  );
}