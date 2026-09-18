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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isBusyError = error => Number(error?.response?.status) === 503 || /temporarily busy|rate limit|too many requests|\b429\b/i.test(String(error?.response?.data?.error || error?.message || ''));

async function fetchDirectoryList() {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await base44.functions.invoke('directoryListingProfile', { action: 'public_list' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.listings || {};
    } catch (error) {
      lastError = error;
      if (!isBusyError(error) || attempt === 2) throw error;
      await sleep(600 * (2 ** attempt) + Math.floor(Math.random() * 500));
    }
  }
  throw lastError;
}

export async function loadPublicDirectoryState({ force = false } = {}) {
  const cached = readStored();
  if (!force && cached && Date.now() - cached.savedAt < FRESH_MS) return cached.listings;
  if (inFlight) return inFlight;

  inFlight = fetchDirectoryList()
    .then(listings => store(listings))
    .catch(error => {
      // If Base44 is briefly busy, a previously cached public snapshot is preferable
      // to a blank Directory. Authoritative edits still go through the live backend.
      if (cached?.listings) return cached.listings;
      throw error;
    })
    .finally(() => { inFlight = null; });

  return inFlight;
}
