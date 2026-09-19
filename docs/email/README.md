# Clare Pickleball tenant mail gateway

Purpose: keep Clare Pickleball tenant email completely separate from RallyHub platform/Directory email.

## Google Apps Script deployment

1. Sign in to Google as **clarepb2025@gmail.com**.
2. Create a new Apps Script project and paste the contents of `clare-pickleball-mail-gateway.gs`.
3. In **Project Settings > Script properties**, create:
   - `RALLYHUB_MAIL_GATEWAY_SECRET` = a long random secret.
4. Deploy as **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web app URL.
6. In RallyHub's `EmailTransportConfig` for Clare Pickleball, set:
   - provider: `google_apps_script`
   - status: `configured`
   - gateway_url: the Web app URL
   - secret_env_var: `CLARE_PICKLEBALL_MAIL_GATEWAY_SECRET`
7. Store the same secret in the Base44 backend environment as `CLARE_PICKLEBALL_MAIL_GATEWAY_SECRET`.
8. Send a test email from RallyHub and confirm it arrives from **clarepb2025@gmail.com**.
9. Only after that test succeeds should the shared Base44 Gmail connector be re-authorised as **rallyhubapp@gmail.com** for platform/Directory mail.

The secret value must never be stored in an entity, frontend bundle, source code or public URL.
