import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const UAT_BASE = 'https://uat.mydupr.com/api';
const TOKEN_URL = `${UAT_BASE}/auth/v1/token`;
const API_VERSION = 'v1';
const TIMEOUT_MS = 10_000;

const safeFailure = (status: number, category: string, message: string, extra = {}) =>
  Response.json({ success: false, authenticated: false, environment: 'uat', apiVersion: API_VERSION, httpStatus: status, category, message, timestamp: new Date().toISOString(), ...extra }, { status: status >= 400 && status < 600 ? status : 502 });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || !(user.role === 'admin' || user.kotc_role === 'super_admin')) {
      return Response.json({ error: 'RallyHub Super Admin access required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'status');
    const clientId = Deno.env.get('DUPR_CLIENT_ID') || '';
    const clientKey = Deno.env.get('DUPR_CLIENT_KEY') || '';
    const clientSecret = Deno.env.get('DUPR_CLIENT_SECRET') || '';
    const configured = { clientId: !!clientId, clientKey: !!clientKey, clientSecret: !!clientSecret };

    if (action === 'status') {
      return Response.json({ success: true, environment: 'uat', apiVersion: API_VERSION, configured, ready: configured.clientId && configured.clientKey && configured.clientSecret });
    }
    if (action !== 'test_connection') {
      return Response.json({ error: 'Unknown DUPR integration action.' }, { status: 400 });
    }

    const missing = [
      !clientId && 'DUPR_CLIENT_ID',
      !clientKey && 'DUPR_CLIENT_KEY',
      !clientSecret && 'DUPR_CLIENT_SECRET',
    ].filter(Boolean);
    if (missing.length) return safeFailure(500, 'configuration', `Missing required Base44 secret(s): ${missing.join(', ')}`);

    const destination = new URL(TOKEN_URL);
    if (destination.protocol !== 'https:' || destination.hostname !== 'uat.mydupr.com' || destination.pathname !== '/api/auth/v1/token') {
      return safeFailure(500, 'configuration', 'Invalid DUPR UAT authentication destination.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let upstream: Response;
    try {
      const partnerAuth = btoa(`${clientKey}:${clientSecret}`);
      upstream = await fetch(destination.toString(), {
        method: 'POST',
        headers: { 'x-authorization': partnerAuth, 'Accept': 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      console.warn(`DUPR UAT authentication failed: ${timedOut ? 'timeout' : 'network error'}`);
      return safeFailure(502, timedOut ? 'timeout' : 'network', timedOut ? 'DUPR UAT authentication timed out.' : 'Unable to reach DUPR UAT authentication service.');
    } finally {
      clearTimeout(timer);
    }

    if (!upstream.ok) {
      console.warn(`DUPR UAT authentication failed: HTTP ${upstream.status}`);
      const category = upstream.status === 400 ? 'bad_request' : upstream.status === 401 ? 'unauthorized' : upstream.status === 403 ? 'forbidden' : upstream.status === 429 ? 'rate_limited' : upstream.status >= 500 ? 'upstream' : 'authentication';
      const retryAfter = upstream.status === 429 ? upstream.headers.get('retry-after') : null;
      return safeFailure(upstream.status, category, `DUPR UAT authentication failed (HTTP ${upstream.status}).`, retryAfter ? { retryAfter } : {});
    }

    let payload: any;
    try {
      payload = await upstream.json();
    } catch {
      console.warn('DUPR UAT authentication failed: malformed JSON');
      return safeFailure(502, 'invalid_response', 'DUPR UAT returned an invalid authentication response.');
    }
    // DUPR partner-token responses use a top-level token in the current Partner API,
    // but tolerate the documented wrapper shape used by other DUPR auth responses.
    const token = payload?.token ?? payload?.accessToken ?? payload?.access_token
      ?? payload?.result?.token ?? payload?.result?.accessToken ?? payload?.result?.access_token;
    if (typeof token !== 'string' || token.length < 1) {
      console.warn('DUPR UAT authentication failed: expected token missing');
      return safeFailure(502, 'invalid_response', 'DUPR UAT authentication response did not contain a usable access token.');
    }

    const expiresIn = Number(payload?.expiresIn ?? payload?.expires_in ?? payload?.result?.expiresIn ?? payload?.result?.expires_in);
    const expiry = Number.isFinite(expiresIn) && expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined;
    console.info('DUPR UAT authentication succeeded');
    return Response.json({ success: true, authenticated: true, environment: 'uat', apiVersion: API_VERSION, timestamp: new Date().toISOString(), ...(expiry ? { expiresAt: expiry } : {}) });
  } catch {
    console.warn('DUPR UAT integration request failed');
    return safeFailure(500, 'internal', 'DUPR integration request failed.');
  }
});
