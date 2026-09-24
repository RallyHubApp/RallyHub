// Product-facing naming for the Club Challenge engine.
// Keep the internal format key stable to protect existing data, tests, routes and backend contracts.
export const INTERCLUB_INTERNAL_FORMAT = 'Club Challenge';
export const INTERCLUB_MODULE_NAME = 'RallyHub Interclub';
export const INTERCLUB_EVENT_LABEL = 'Interclub Challenge';
export const INTERCLUB_SHORT_LABEL = 'Interclub';
export const RALLYHUB_PUBLIC_BASE_URL = 'https://rallyhub.ie';
export function interclubPublicUrl(path = '') {
  const clean = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
  return `${RALLYHUB_PUBLIC_BASE_URL}${clean}`;
}
