/* Service worker — aplicația funcționează complet offline. */
const CACHE = 'univers-v36';
const ASSETS = [
  './',
  'index.html',
  'css/style.css?v=35',
  'js/data.js?v=35',
  'js/data-extra.js?v=35',
  'js/textures.js?v=35',
  'js/sky.js?v=35',
  'js/app.js?v=35',
  'js/core/ux.js?v=35',
  'js/core/creatures.js?v=35',
  'js/core/modules.js?v=35',
  'js/modules/body/brain.js?v=35',
  'js/modules/body/digestion.js?v=35',
  'js/modules/body/heart.js?v=35',
  'js/modules/body/lungs.js?v=35',
  'js/modules/body/skeleton.js?v=35',
  'js/modules/earth/civ.js?v=35',
  'js/modules/earth/earthtime.js?v=35',
  'js/modules/earth/human.js?v=35',
  'js/modules/earth/layers.js?v=35',
  'js/modules/earth/lifeevo.js?v=35',
  'js/modules/earth/ocean.js?v=35',
  'js/modules/earth/relief.js?v=35',
  'js/modules/earth/volcano.js?v=35',
  'js/modules/mechanics/engine.js?v=35',
  'js/modules/mechanics/mechanics.js?v=35',
  'js/modules/space/bigbang.js?v=35',
  'js/modules/space/blackhole.js?v=35',
  'js/modules/space/explosions.js?v=35',
  'js/modules/space/gravity.js?v=35',
  'js/modules/tech/binary.js?v=35',
  'js/modules/tech/camera.js?v=35',
  'js/modules/tech/circuit.js?v=35',
  'js/modules/tech/phone.js?v=35',
  'js/modules/tech/solar.js?v=35',
  'js/modules/vehicles/airplane.js?v=35',
  'js/modules/vehicles/car.js?v=35',
  'js/modules/vehicles/emotor.js?v=35',
  'js/modules/vehicles/train.js?v=35',
  'js/core/fx.js?v=35',
  'img/cards/solar.jpg',
  'img/cards/bigbang.jpg',
  'img/cards/blackhole.jpg',
  'img/cards/supernova.jpg',
  'img/hub/space.jpg',
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

/* pagina, scripturile și stilurile: întâi rețeaua (ca să vezi mereu versiunea nouă),
   cu cache ca rezervă când nu e internet. Pozele și iconițele: întâi cache. */
function isCode(req) {
  const u = new URL(req.url);
  return req.mode === 'navigate' || /\.(html|js|css|webmanifest|json)$/.test(u.pathname) || u.pathname.endsWith('/');
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (isCode(e.request)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }
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
