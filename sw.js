/* Service worker — aplicația funcționează complet offline. */
const CACHE = 'univers-v5';
const ASSETS = [
  './',
  'index.html',
  'css/style.css?v=3',
  'js/data.js?v=3',
  'js/data-extra.js?v=3',
  'js/textures.js?v=3',
  'js/sky.js?v=3',
  'js/app.js?v=3',
  'manifest.webmanifest',
  'photos/credits.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable.png'
];

/* fotografiile sunt luate din photos/credits.json, ca să nu le listăm aici */
async function cacheEverything() {
  const c = await caches.open(CACHE);
  await c.addAll(ASSETS);
  try {
    const res = await fetch('photos/credits.json', { cache: 'reload' });
    const list = Object.values(await res.json()).map((x) => 'photos/' + x.file);
    await Promise.all(list.map((u) => c.add(u).catch(() => { })));
  } catch (e) { /* fără poze, aplicația merge mai departe */ }
}

self.addEventListener('install', (e) => {
  e.waitUntil(cacheEverything().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first: pornește instant și fără internet */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
