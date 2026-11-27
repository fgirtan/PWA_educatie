/* Service worker — aplicația funcționează complet offline. */
const CACHE = 'univers-v50';
const ASSETS = [
  './',
  'index.html',
  'css/style.css?v=46',
  'js/data.js?v=46',
  'js/data-extra.js?v=46',
  'js/textures.js?v=46',
  'js/sky.js?v=46',
  'js/app.js?v=46',
  'js/core/art.js?v=46',
  'js/core/creatures.js?v=46',
  'js/core/fit.js?v=46',
  'js/core/modules.js?v=46',
  'js/core/ux.js?v=46',
  'js/modules/body/brain.js?v=46',
  'js/modules/body/digestion.js?v=46',
  'js/modules/body/heart.js?v=46',
  'js/modules/body/lungs.js?v=46',
  'js/modules/body/skeleton.js?v=46',
  'js/modules/earth/civ.js?v=46',
  'js/modules/earth/earthtime.js?v=46',
  'js/modules/earth/human.js?v=46',
  'js/modules/earth/layers.js?v=46',
  'js/modules/earth/lifeevo.js?v=46',
  'js/modules/earth/ocean.js?v=46',
  'js/modules/earth/relief.js?v=46',
  'js/modules/earth/volcano.js?v=46',
  'js/modules/mechanics/engine.js?v=46',
  'js/modules/mechanics/mechanics.js?v=46',
  'js/modules/space/bigbang.js?v=46',
  'js/modules/space/blackhole.js?v=46',
  'js/modules/space/explosions.js?v=46',
  'js/modules/space/gravity.js?v=46',
  'js/modules/tech/binary.js?v=46',
  'js/modules/tech/camera.js?v=46',
  'js/modules/tech/circuit.js?v=46',
  'js/modules/tech/phone.js?v=46',
  'js/modules/tech/solar.js?v=46',
  'js/modules/vehicles/aeroengine.js?v=46',
  'js/modules/vehicles/airplane.js?v=46',
  'js/modules/vehicles/car.js?v=46',
  'js/modules/vehicles/emotor.js?v=46',
  'js/modules/vehicles/train.js?v=46',
  'js/modules/space/seasons.js?v=46',
  'js/modules/space/moon.js?v=46',
  'js/modules/space/moontrip.js?v=46',
  'js/modules/space/isslife.js?v=46',
  'js/modules/space/constellations.js?v=46',
  'js/modules/space/scale.js?v=46',
  'js/modules/body/senses.js?v=46',
  'js/modules/body/muscles.js?v=46',
  'js/modules/body/blood.js?v=46',
  'js/modules/body/immune.js?v=46',
  'js/modules/body/teeth.js?v=46',
  'js/modules/body/growth.js?v=46',
  'js/modules/vehicles/helicopter.js?v=46',
  'js/modules/vehicles/boat.js?v=46',
  'js/modules/vehicles/rocketphys.js?v=46',
  'js/modules/vehicles/bicycle.js?v=46',
  'js/modules/mechanics/levers.js?v=46',
  'js/modules/tech/light.js?v=46',
  'js/modules/mechanics/magnets.js?v=46',
  'js/modules/tech/fridge.js?v=46',
  'js/modules/tech/internet.js?v=46',
  'js/modules/earth/dinosaurs.js?v=46',
  'js/modules/earth/watercycle.js?v=46',
  'js/modules/earth/weather.js?v=46',
  'js/modules/earth/plants.js?v=46',
  'js/modules/earth/habitats.js?v=46',
  'js/modules/earth/lifecycle.js?v=46',
  'js/modules/earth/worldmap.js?v=46',
  'js/modules/earth/tectonics.js?v=46',
  'img/cards/solar.jpg',
  'img/cards/bigbang.jpg',
  'img/cards/blackhole.jpg',
  'img/cards/supernova.jpg',
  'img/hub/space.jpg',
  'img/cards/m-aeroengine.jpg',
  'img/cards/m-airplane.jpg',
  'img/cards/m-binary.jpg',
  'img/cards/m-brain.jpg',
  'img/cards/m-camera.jpg',
  'img/cards/m-car.jpg',
  'img/cards/m-circuit.jpg',
  'img/cards/m-civ.jpg',
  'img/cards/m-digestion.jpg',
  'img/cards/m-earthtime.jpg',
  'img/cards/m-emotor.jpg',
  'img/cards/m-engine.jpg',
  'img/cards/m-gravity.jpg',
  'img/cards/m-heart.jpg',
  'img/cards/m-human.jpg',
  'img/cards/m-layers.jpg',
  'img/cards/m-lifeevo.jpg',
  'img/cards/m-lungs.jpg',
  'img/cards/m-mechanics.jpg',
  'img/cards/m-ocean.jpg',
  'img/cards/m-phone.jpg',
  'img/cards/m-relief.jpg',
  'img/cards/m-skeleton.jpg',
  'img/cards/m-solar.jpg',
  'img/cards/m-train.jpg',
  'img/cards/m-volcano.jpg',
  'img/cards/m-seasons.jpg',
  'img/cards/m-moon.jpg',
  'img/cards/m-moontrip.jpg',
  'img/cards/m-isslife.jpg',
  'img/cards/m-constellations.jpg',
  'img/cards/m-scale.jpg',
  'img/cards/m-senses.jpg',
  'img/cards/m-muscles.jpg',
  'img/cards/m-blood.jpg',
  'img/cards/m-immune.jpg',
  'img/cards/m-teeth.jpg',
  'img/cards/m-growth.jpg',
  'img/cards/m-helicopter.jpg',
  'img/cards/m-boat.jpg',
  'img/cards/m-rocketphys.jpg',
  'img/cards/m-bicycle.jpg',
  'img/cards/m-levers.jpg',
  'img/cards/m-light.jpg',
  'img/cards/m-magnets.jpg',
  'img/cards/m-fridge.jpg',
  'img/cards/m-internet.jpg',
  'img/cards/m-dinosaurs.jpg',
  'img/cards/m-watercycle.jpg',
  'img/cards/m-weather.jpg',
  'img/cards/m-plants.jpg',
  'img/cards/m-habitats.jpg',
  'img/cards/m-lifecycle.jpg',
  'img/cards/m-worldmap.jpg',
  'img/cards/m-tectonics.jpg',
  'manifest.webmanifest',
  'photos/credits.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable.png',
  'icons/apple-touch-icon.png'
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
