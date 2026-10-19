/* সমাধান service worker: app shell + data cached for offline use. */
const VERSION = 'shomadhan-v1.0.0';
const FONTS = 'shomadhan-fonts-v1';
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'data.json', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS).then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  if (url.origin !== location.origin) return; // external sites are not cached

  // Pages: network first so updates arrive, cache when offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => { caches.open(VERSION).then((c) => c.put('index.html', r.clone())); return r; })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Static files: cache first, refresh in background
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r.ok) caches.open(VERSION).then((c) => c.put(req, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
