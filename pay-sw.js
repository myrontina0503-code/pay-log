const CACHE = 'pay-log-v1';
const ASSETS = ['./款項記錄.html', './pay-manifest.webmanifest', './pay-icon-180.png', './pay-icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of ASSETS) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) await cache.put(url, res);
      } catch (err) {}
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(new Request(e.request.url, { cache: 'no-store' }));
      const cache = await caches.open(CACHE);
      cache.put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      throw err;
    }
  })());
});
