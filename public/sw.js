const CACHE_NAME = 'rallyhub-static-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

const NEVER_CACHE_PATTERNS = [
  '/src/',
  '/node_modules/.vite/',
  '/@vite',
  '/@react-refresh'
];

const isNeverCacheRequest = (request) => {
  const url = new URL(request.url);

  return (
    request.method !== 'GET' ||
    NEVER_CACHE_PATTERNS.some((pattern) => url.pathname.startsWith(pattern)) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/assets/')
  );
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (isNeverCacheRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
