import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'rallyhub.publicDirectory.v1';
const FRESH_MS = 5 * 60 * 1000;

let memoryCache = null;
let inFlight = null;

function readStored() {
  if (memoryCache) return memoryCache;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.savedAt !== 'number' || typeof parsed.listings !== 'object') return null;
    memoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function store(listings) {
  const payload = { savedAt: Date.now(), listings: listings || {} };
  memoryCache = payload;
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch {}
  return payload.listings;
}

export function invalidatePublicDirectoryCache() {
  memoryCache = null;
  inFlight = null;
  try { window.localStorage.removeItem(CACHE_KEY); } catch {}
}

export async function loadPublicDirectoryState({ force = false } = {}) {
  const cached = readStored();
  if (!force && cached && Date.now() - cached.savedAt < FRESH_MS) return cached.listings;
  if (inFlight) return inFlight;

  inFlight = base44.functions.invoke('directoryListingProfile', { action: 'public_list' })
    .then(res => {
      if (res.data?.error) throw new Error(res.data.error);
      return store(res.data?.listings || {});
    })
    .finally(() => { inFlight = null; });

  return inFlight;
}
