const CACHE_NAME = 'wfp-sacco-v3';
const APP_FILES = [
  './', './index.html', './admin.html', './dashboard.html', './members.html',
  './records.html', './savings.html', './loans.html', './reports.html', './portal.html',
  './styles.css', './style.css', './access.js', './nav.js', './pwa.js', './module-sidebar.css', './module-sidebar.js', './manifest.webmanifest',
  './images/logo.jpeg', './images/icons/icon-192.png', './images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('wfp-sacco-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await caches.match(request, { ignoreSearch: true });
    const update = fetch(request).then((response) => {
      if (response.ok) return cache.put(request, response.clone()).then(() => response);
      return response;
    });
    if (cached) {
      event.waitUntil(update.then(() => undefined).catch(() => undefined));
      return cached;
    }
    try { return await update; }
    catch (error) {
      if (request.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
