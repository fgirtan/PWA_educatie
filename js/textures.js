/* ============================================================
   TEXTURI PROCEDURALE
   Hărți de suprafață (zgomot 3D pe sferă, fără cusături), globuri
   care se rotesc cu adevărat (proiecție sferică precalculată),
   nebuloase și galaxii cu zgomot, praf întunecat și brațe spiralate.
   Totul e generat o singură dată, „pe bucăți" (câteva ms pe rând),
   ca animația să rămână fluidă. Fără imagini externe: merge offline.
   ============================================================ */

/* generator pseudo-aleator determinist (mulberry32) */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ---------- zgomot 3D (value noise) ---------- */
function makeNoise3(seed) {
  const rng = makeRng(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rng() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
  const perm = new Uint16Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const val = new Float32Array(256);
  for (let i = 0; i < 256; i++) val[i] = rng();
  return function (x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const A = perm[X] + Y, B = perm[X + 1] + Y;
    const AA = perm[A] + Z, AB = perm[A + 1] + Z, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    const x00 = val[perm[AA]] + (val[perm[BA]] - val[perm[AA]]) * u;
    const x10 = val[perm[AB]] + (val[perm[BB]] - val[perm[AB]]) * u;
    const x01 = val[perm[AA + 1]] + (val[perm[BA + 1]] - val[perm[AA + 1]]) * u;
    const x11 = val[perm[AB + 1]] + (val[perm[BB + 1]] - val[perm[AB + 1]]) * u;
    const y0 = x00 + (x10 - x00) * v, y1 = x01 + (x11 - x01) * v;
    return y0 + (y1 - y0) * w;
  };
}
function fbm(n, x, y, z, oct) {
  let s = 0, a = 0.5, t = 0;
  for (let i = 0; i < oct; i++) { s += a * n(x, y, z); t += a; x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; }
  return s / t;
}
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp01 = (x) => x < 0 ? 0 : (x > 1 ? 1 : x);
function mixInto(o, c1, c2, t) { o[0] = c1[0] + (c2[0] - c1[0]) * t; o[1] = c1[1] + (c2[1] - c1[1]) * t; o[2] = c1[2] + (c2[2] - c1[2]) * t; }
function blendInto(o, c, t) { o[0] += (c[0] - o[0]) * t; o[1] += (c[1] - o[1]) * t; o[2] += (c[2] - o[2]) * t; }
function mulInto(o, k) { o[0] *= k; o[1] *= k; o[2] *= k; }
const C3 = (h) => hexToRgb(h);

/* ---------- coada de lucru: generare pe bucăți, fără sacadări ---------- */
const TEX_JOBS = [];
let texPumping = false;
function texSchedule() {
  if (texPumping) return;
  texPumping = true;
  setTimeout(texPump, 0);
}
function texPump() {
  const end = performance.now() + 5;          // bucăți mici: cadrul rămâne sub 16 ms
  while (TEX_JOBS.length && performance.now() < end) {
    const j = TEX_JOBS[0];
    if (j.step(end)) TEX_JOBS.shift();
  }
  texPumping = false;
  if (TEX_JOBS.length) texSchedule();
}
function texQueue(job, urgent) {
  const i = TEX_JOBS.indexOf(job);
  if (i >= 0) { if (urgent && i > 0) { TEX_JOBS.splice(i, 1); TEX_JOBS.unshift(job); } return; }
  if (urgent) TEX_JOBS.unshift(job); else TEX_JOBS.push(job);
  texSchedule();
}
/* job care completează rânduri de pixeli; fn(x, y, out) scrie [r,g,b,a] (0..255) */
function rowJob(w, h, fn, finish) {
  const img = new ImageData(w, h), d = img.data, out = [0, 0, 0, 255];
  let y = 0;
  return {
    img: img,
    step(end) {
      while (y < h) {
        let k = y * w * 4;
        for (let x = 0; x < w; x++, k += 4) {
          out[3] = 255;
          fn(x, y, out);
          d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = out[3];
        }
        y++;
        if (performance.now() > end) break;
      }
      if (y < h) return false;
      finish(img);
      return true;
    }
  };
}

/* ============================================================
   HĂRȚI DE SUPRAFAȚĂ (echirectangulare, w = 2h)
   ============================================================ */
/* fiecare tip primește (rng, noise, body) și întoarce f(x,y,z,lat,lon,out) */
const MAP_KINDS = {
  sun(rng, n) {
    const hot = C3('#fff3c4'), mid = C3('#ffc23a'), low = C3('#f07a12'), spot = C3('#5a1a02');
    return function (x, y, z, lat, lon, o) {
      /* granulație fină și discretă; culoarea aproape uniformă, ca în fotografii */
      const g = fbm(n, x * 30, y * 30, z * 30, 2);
      const fine = n(x * 90 + 9, y * 90, z * 90);
      const t = clamp01(0.62 + (g - 0.5) * 0.55 + (fine - 0.5) * 0.3);
      if (t < 0.5) mixInto(o, low, mid, t * 2); else mixInto(o, mid, hot, (t - 0.5) * 2);
      /* pete solare: doar în benzile de latitudine medie */
      const al = Math.abs(lat);
      if (al > 0.12 && al < 0.62) {
        const s = fbm(n, x * 3.2 + 7, y * 3.2 + 1, z * 3.2, 3);
        if (s > 0.71) blendInto(o, spot, sstep(0.71, 0.75, s) * 0.85);
        else if (s > 0.68) blendInto(o, low, 0.4);
      }
    };
  },

  earth(rng, n) {
    const deep = C3('#08285e'), shallow = C3('#1d6fb4'), coast = C3('#3fa3c8');
    const forest = C3('#2b6a33'), grass = C3('#5f9443'), desert = C3('#cfae6e'), tundra = C3('#8d8c70'), rock = C3('#8a7a62'), ice = C3('#f3f8fc'), cloud = [255, 255, 255];
    return function (x, y, z, lat, lon, o) {
      const wx = fbm(n, x * 1.3 + 11, y * 1.3, z * 1.3, 3) - 0.5;
      const h = fbm(n, x * 1.6 + wx, y * 1.6 - wx, z * 1.6 + wx, 6);
      const al = Math.abs(lat) / (Math.PI / 2);
      const sea = 0.55;            // ~70% ocean, ca în realitate
      if (h < sea) {
        mixInto(o, deep, shallow, sstep(0.36, sea, h));
        blendInto(o, coast, sstep(sea - 0.025, sea, h) * 0.6);
      } else {
        const m = fbm(n, x * 2.4 + 31, y * 2.4, z * 2.4, 4);
        const e = sstep(sea, 0.72, h);
        /* zonele climatice se amestecă lin pe latitudine (fără margini drepte, vizibile pe hărțile mari) */
        mixInto(o, forest, grass, sstep(0.42, 0.6, m));
        const dk = sstep(0.05, 0.16, al) * sstep(0.56, 0.44, al);
        if (dk > 0 && m < 0.47) blendInto(o, desert, sstep(0.47, 0.4, m) * dk);
        if (al > 0.56) blendInto(o, tundra, sstep(0.58, 0.8, al));
        blendInto(o, rock, e * 0.7);
      }
      const ic = al + (n(x * 6, y * 6, z * 6) - 0.5) * 0.12;
      if (ic > 0.84) blendInto(o, ice, sstep(0.84, 0.88, ic));
      /* nori cu vârtejuri */
      const cw = fbm(n, x * 2 + 50, y * 2, z * 2, 3) - 0.5;
      const c = fbm(n, x * 3.4 + cw * 1.6 + 70, y * 3.4 - cw, z * 5 + cw, 5);
      const band = 0.9 + 0.25 * Math.cos(lat * 6);
      blendInto(o, cloud, sstep(0.52, 0.72, c * band) * 0.88);
    };
  },

  mars(rng, n) {
    const base = C3('#b9562c'), dark = C3('#6a2f1c'), light = C3('#e09a63'), cap = C3('#f6efe8'), canyon = C3('#4e2112');
    return function (x, y, z, lat, lon, o) {
      const d = fbm(n, x * 2.2, y * 2.2, z * 2.2, 5);
      mixInto(o, base, light, sstep(0.45, 0.3, d) * 0.7);
      blendInto(o, dark, sstep(0.55, 0.68, d) * 0.75);
      const g = n(x * 18, y * 18, z * 18);
      mulInto(o, 0.9 + g * 0.2);
      /* Valles Marineris — o cicatrice lungă lângă ecuator */
      const dl = (lat + 0.13 + 0.04 * Math.sin(lon * 3)) / 0.025;
      if (lon > -1.1 && lon < 0.6) blendInto(o, canyon, Math.exp(-dl * dl) * sstep(-1.1, -0.8, lon) * sstep(0.6, 0.3, lon) * 0.8);
      /* Olympus Mons */
      const ox = (lon + 1.4) / 0.12, oy = (lat - 0.32) / 0.12, od = ox * ox + oy * oy;
      if (od < 2) blendInto(o, od < 0.6 ? light : dark, 0.35);
      const al = Math.abs(lat) / (Math.PI / 2) + (n(x * 7, y * 7, z * 7) - 0.5) * 0.08;
      if (al > 0.86) blendInto(o, cap, sstep(0.86, 0.9, al));
    };
  },

  venus(rng, n) {
    const a = C3('#b98642'), b = C3('#f1dca6'), c = C3('#d8ac62');
    return function (x, y, z, lat, lon, o) {
      const w = fbm(n, x * 1.4, y * 1.4, z * 1.4, 3) - 0.5;
      const v = fbm(n, x * 1.3 + w * 2, y * 1.3 + w, z * 6 + w * 3, 5);
      mixInto(o, a, b, sstep(0.3, 0.68, v));
      blendInto(o, c, sstep(0.55, 0.45, Math.abs(Math.sin(lat * 3 + w * 4))) * 0.3);
    };
  },

  jupiter(rng, n) {
    const zone = C3('#efe3cc'), belt = C3('#a97852'), belt2 = C3('#cfa478'), pole = C3('#8f8478'), grs = C3('#c4553a'), grsHi = C3('#e48b62');
    return function (x, y, z, lat, lon, o) {
      const w = fbm(n, x * 2.2, y * 2.2, z * 2.2, 4) - 0.5;
      const s = fbm(n, x * 7, y * 7, z * 34, 5) - 0.5;
      const v = z * 13 + w * 0.55 + s * 0.6;
      const t = 0.5 + 0.5 * Math.sin(v);
      mixInto(o, belt, zone, sstep(0.3, 0.7, t));
      blendInto(o, belt2, sstep(0.6, 0.9, Math.sin(v * 0.5 + 1)) * 0.35);
      mulInto(o, 0.95 + s * 0.22);
      const al = Math.abs(lat);
      if (al > 1.0) blendInto(o, pole, sstep(1.0, 1.35, al) * 0.75);
      /* Marea Pată Roșie */
      let dlon = lon - 0.9; dlon = Math.atan2(Math.sin(dlon), Math.cos(dlon));
      const ex = dlon / 0.23, ey = (lat + 0.38) / 0.095, e = ex * ex + ey * ey;
      if (e < 2.2) {
        const sw = n(ex * 2 + 3, ey * 2, e * 3) - 0.5;
        if (e < 1) { mixInto(o, grs, grsHi, clamp01(0.5 + sw * 1.6 + (1 - e) * 0.2)); }
        else blendInto(o, zone, (1 - (e - 1) / 1.2) * 0.6);
      }
    };
  },

  saturn(rng, n) {
    const zone = C3('#f1e2bb'), belt = C3('#c8a46a'), pole = C3('#9eb2b8');
    return function (x, y, z, lat, lon, o) {
      /* benzi line, aproape paralele (Saturn are o atmosferă „cețoasă") */
      const w = fbm(n, x * 3, y * 3, z * 3, 3) - 0.5;
      const v = z * 9 + w * 0.18;
      const b1 = 0.5 + 0.5 * Math.sin(v), b2 = 0.5 + 0.5 * Math.sin(z * 23 + 1.3 + w * 0.3);
      mixInto(o, belt, zone, clamp01(0.25 + b1 * 0.55 + b2 * 0.2));
      mulInto(o, 0.97 + (n(x * 3, y * 3, z * 60) - 0.5) * 0.1);
      if (lat > 1.05) blendInto(o, pole, sstep(1.05, 1.4, lat) * 0.55);
    };
  },

  uranus(rng, n) {
    const a = C3('#8fd6dd'), b = C3('#c6f1f3');
    return function (x, y, z, lat, lon, o) {
      const w = fbm(n, x * 2, y * 2, z * 2, 3) - 0.5;
      mixInto(o, a, b, sstep(0.2, 0.9, 0.5 + 0.5 * Math.sin(z * 7 + w)) * 0.55 + sstep(0.9, 1.4, Math.abs(lat)) * 0.4);
    };
  },

  neptune(rng, n) {
    const deep = C3('#22409e'), mid = C3('#3e66d0'), hi = C3('#86a8f0'), spot = C3('#142565'), white = [245, 248, 255];
    return function (x, y, z, lat, lon, o) {
      const w = fbm(n, x * 2, y * 2, z * 2, 4) - 0.5;
      mixInto(o, deep, mid, sstep(0.1, 0.9, 0.5 + 0.5 * Math.sin(z * 9 + w * 2)));
      blendInto(o, hi, sstep(0.6, 0.8, fbm(n, x * 3, y * 3, z * 9, 4)) * 0.5);
      let dlon = lon - 0.4; dlon = Math.atan2(Math.sin(dlon), Math.cos(dlon));
      const ex = dlon / 0.2, ey = (lat + 0.36) / 0.1, e = ex * ex + ey * ey;
      if (e < 1) blendInto(o, spot, (1 - e) * 0.9);
      const st = fbm(n, x * 4 + 9, y * 4, z * 26, 4);
      const wb = Math.max(sstep(0.2, 0.14, Math.abs(lat + 0.25)), sstep(0.12, 0.08, Math.abs(lat - 0.5)));
      if (wb > 0) blendInto(o, white, sstep(0.62, 0.75, st) * 0.85 * wb);
    };
  },

  cratered: (rng, n, body) => rockyKind(rng, n, body, { craters: 90, maria: body.id === 'moon' ? 0.75 : (body.id === 'mercury' ? 0.25 : 0.4), rough: 0.18 }),
  rock: (rng, n, body) => rockyKind(rng, n, body, { craters: 50, maria: 0.35, rough: 0.3, lumpy: true }),
  comet: (rng, n, body) => rockyKind(rng, n, { color: '#4f565c' }, { craters: 26, maria: 0.5, rough: 0.35, bright: '#c9dbe6' }),

  ice(rng, n, body) {
    const base = C3(body.color || '#e9f3f8'), blue = C3('#a9cde3'), crack = C3('#7aa0bf');
    const crat = makeCraters(rng, 14, 0.04, 0.16);
    return function (x, y, z, lat, lon, o) {
      o[0] = base[0]; o[1] = base[1]; o[2] = base[2];
      blendInto(o, blue, sstep(0.5, 0.7, fbm(n, x * 2.5, y * 2.5, z * 2.5, 5)) * 0.55);
      const r = 1 - Math.abs(2 * fbm(n, x * 3.5 + 5, y * 3.5, z * 3.5, 4) - 1);
      blendInto(o, crack, sstep(0.9, 0.97, r) * 0.6);
      applyCraters(crat, x, y, z, o, 0.5);
    };
  },

  io(rng, n) {
    const base = C3('#e8d466'), orange = C3('#d98431'), pale = C3('#f7f1c4'), black = C3('#2a160a'), red = C3('#b8401c');
    const vents = [];
    for (let i = 0; i < 28; i++) vents.push(randUnit(rng).concat([0.02 + rng() * 0.05]));
    return function (x, y, z, lat, lon, o) {
      o[0] = base[0]; o[1] = base[1]; o[2] = base[2];
      const a = fbm(n, x * 2.6, y * 2.6, z * 2.6, 5);
      blendInto(o, orange, sstep(0.55, 0.7, a) * 0.7);
      blendInto(o, pale, sstep(0.42, 0.3, a) * 0.6);
      for (const v of vents) {
        const dd = (1 - (x * v[0] + y * v[1] + z * v[2])) / (v[3] * v[3]);
        if (dd < 6) {
          if (dd < 0.5) blendInto(o, black, 0.85);
          else blendInto(o, red, (1 - dd / 6) * 0.5);
        }
      }
    };
  },

  europa(rng, n) {
    const base = C3('#e6ddcd'), tan = C3('#c9a785'), line = C3('#8e5a3e');
    return function (x, y, z, lat, lon, o) {
      o[0] = base[0]; o[1] = base[1]; o[2] = base[2];
      blendInto(o, tan, sstep(0.5, 0.68, fbm(n, x * 2, y * 2, z * 2, 5)) * 0.6);
      const r1 = 1 - Math.abs(2 * fbm(n, x * 2.2, y * 2.2, z * 2.2, 3) - 1);
      const r2 = 1 - Math.abs(2 * fbm(n, x * 4.3 + 3, y * 4.3, z * 4.3, 3) - 1);
      blendInto(o, line, Math.max(sstep(0.93, 0.985, r1), sstep(0.95, 0.99, r2) * 0.7) * 0.8);
    };
  },

  titan(rng, n) {
    const base = C3('#d99442'), dark = C3('#8a5524'), light = C3('#efbb6e');
    return function (x, y, z, lat, lon, o) {
      const a = fbm(n, x * 2.2, y * 2.2, z * 2.2, 5);
      mixInto(o, base, dark, sstep(0.55, 0.7, a) * 0.6);
      blendInto(o, light, sstep(0.42, 0.3, a) * 0.5);
    };
  },

  pluto(rng, n) {
    const base = C3('#c9a98a'), dark = C3('#6e3f2c'), heart = C3('#f5ede0'), tan = C3('#ddc4a3');
    return function (x, y, z, lat, lon, o) {
      const a = fbm(n, x * 2.4, y * 2.4, z * 2.4, 5);
      mixInto(o, base, tan, sstep(0.4, 0.65, a) * 0.6);
      if (Math.abs(lat) < 0.45) blendInto(o, dark, sstep(0.45, 0.2, Math.abs(lat)) * sstep(0.42, 0.55, a) * 0.85);
      /* „inima" (Tombaugh Regio): două lobi și un vârf */
      let dl = lon; dl = Math.atan2(Math.sin(dl), Math.cos(dl));
      const hx = dl / 0.55, hy = (lat - 0.25) / 0.5;
      const l1 = (hx + 0.38) * (hx + 0.38) + (hy - 0.25) * (hy - 0.25);
      const l2 = (hx - 0.38) * (hx - 0.38) + (hy - 0.25) * (hy - 0.25);
      const tip = hy < 0.25 && Math.abs(hx) < (hy + 0.85) * 0.75 && hy > -0.85;
      if (l1 < 0.22 || l2 < 0.22 || tip) blendInto(o, heart, 0.85 + (a - 0.5) * 0.3);
    };
  }
};

function randUnit(rng) {
  const z = rng() * 2 - 1, t = rng() * Math.PI * 2, r = Math.sqrt(1 - z * z);
  return [r * Math.cos(t), r * Math.sin(t), z];
}
function makeCraters(rng, count, rMin, rMax) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const u = randUnit(rng), r = rMin + Math.pow(rng(), 2.2) * (rMax - rMin);
    list.push([u[0], u[1], u[2], r, 1 - Math.cos(r * 1.7)]);
  }
  return list;
}
/* craterele: fund mai întunecat, margine luminoasă, ejecta difuză */
function applyCraters(list, x, y, z, o, k) {
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    const dd = 1 - (x * c[0] + y * c[1] + z * c[2]);
    if (dd > c[4]) continue;
    const t = Math.sqrt(2 * dd) / c[3];
    if (t < 0.82) mulInto(o, 1 - 0.2 * k * (1 - t * 0.5));
    else if (t < 1.08) mulInto(o, 1 + 0.22 * k);
    else mulInto(o, 1 + 0.07 * k * (1.7 - t));
  }
}
function rockyKind(rng, n, body, opt) {
  const base = C3(body.color || '#8e867c');
  const dark = base.map((v) => v * 0.55), light = base.map((v) => Math.min(255, v * 1.18 + 12));
  const bright = opt.bright ? C3(opt.bright) : null;
  const crat = makeCraters(rng, opt.craters, 0.025, 0.24);
  return function (x, y, z, lat, lon, o) {
    const m = fbm(n, x * 1.6, y * 1.6, z * 1.6, 4);
    const r = fbm(n, x * 7, y * 7, z * 7, 4);
    o[0] = base[0]; o[1] = base[1]; o[2] = base[2];
    blendInto(o, dark, sstep(0.52, 0.64, m) * opt.maria);
    blendInto(o, light, sstep(0.42, 0.3, m) * 0.5);
    mulInto(o, 1 + (r - 0.5) * opt.rough * 2);
    if (bright) blendInto(o, bright, sstep(0.68, 0.78, r) * 0.6);
    applyCraters(crat, x, y, z, o, 1);
  };
}

/* hărțile: { w, h, u32, ready } — întâi o versiune mică (instant), apoi detaliată */
const MAP_CACHE = new Map();
function mapKindOf(body, kindOverride) { return kindOverride || body.texture || 'rock'; }
function buildMapSync(fn, w, h) {
  const img = new ImageData(w, h), d = img.data, o = [0, 0, 0];
  const cl = new Float32Array(w), sl = new Float32Array(w);
  for (let x = 0; x < w; x++) { const lon = (x + 0.5) / w * Math.PI * 2 - Math.PI; cl[x] = Math.cos(lon); sl[x] = Math.sin(lon); }
  for (let y = 0; y < h; y++) {
    const lat = (0.5 - (y + 0.5) / h) * Math.PI, cz = Math.cos(lat), z = Math.sin(lat);
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      fn(cz * cl[x], cz * sl[x], z, lat, (x + 0.5) / w * Math.PI * 2 - Math.PI, o);
      d[k] = o[0]; d[k + 1] = o[1]; d[k + 2] = o[2]; d[k + 3] = 255;
    }
  }
  return new Uint32Array(d.buffer);
}
function mapJob(entry, fn, w, h) {
  const lonOf = (x) => (x + 0.5) / w * Math.PI * 2 - Math.PI;
  const cl = new Float32Array(w), sl = new Float32Array(w);
  for (let x = 0; x < w; x++) { cl[x] = Math.cos(lonOf(x)); sl[x] = Math.sin(lonOf(x)); }
  let lat = 0, cz = 1, z = 0, rowY = -1;
  const o = [0, 0, 0];
  return rowJob(w, h, function (x, y, out) {
    if (y !== rowY) { rowY = y; lat = (0.5 - (y + 0.5) / h) * Math.PI; cz = Math.cos(lat); z = Math.sin(lat); }
    fn(cz * cl[x], cz * sl[x], z, lat, lonOf(x), o);
    out[0] = o[0]; out[1] = o[1]; out[2] = o[2];
  }, function (img) {
    const u32 = new Uint32Array(img.data.buffer);
    entry.lv[w] = u32;
    if (w > entry.w) { entry.u32 = u32; entry.w = w; entry.h = h; }
    entry.level++;
  });
}
/* rezoluțiile hărților: 256 și 512 pentru toate corpurile; 1024 când corpul e mare pe ecran;
   2048 doar pentru Pământ, Jupiter și Saturn (cele mai bogate în detalii) */
const MAP_W = [256, 512, 1024, 2048];
const HUGE_MAPS = { earth: 1, jupiter: 1, saturn: 1 };
function mapCap(body) { return HUGE_MAPS[body.id] ? 2048 : 1024; }
function getMap(body, kindOverride, wantW) {
  const kind = mapKindOf(body, kindOverride);
  const key = kind + '|' + body.id;
  let e = MAP_CACHE.get(key);
  if (wantW === true) wantW = 512; else if (!wantW) wantW = 256;
  wantW = Math.min(wantW, mapCap(body));
  if (!e) {
    const seed = hashStr(key) || 12345;
    const make = () => (MAP_KINDS[kind] || MAP_KINDS.rock)(makeRng(seed), makeNoise3(seed), body);
    e = { w: 64, h: 32, u32: buildMapSync(make(), 64, 32), level: 0, jobs: {}, lv: {}, make: make };
    e.lv[64] = e.u32;
    MAP_CACHE.set(key, e);
    e.jobs[256] = mapJob(e, make(), 256, 128);
    texQueue(e.jobs[256], false);
  }
  /* cerem detaliul când e nevoie (urgent = pe ecran și mare), o treaptă pe rând */
  for (const w of MAP_W) {
    if (w > wantW) break;
    if (e.lv[w]) continue;
    if (!e.jobs[w]) e.jobs[w] = mapJob(e, e.make(), w, w / 2);   // treptele mari se creează doar la cerere
    texQueue(e.jobs[w], true);
    break;
  }
  return e;
}

/* ---------- globul: proiecție sferică precalculată ----------
   tabelele (ce pixel din hartă ajunge în fiecare pixel al discului) depind de mărimea globului (S)
   și de lățimea hărții; cele mari (S > 512) se calculează pe bucăți, în fundal */
const PROJ_CACHE = new Map();
function projJob(S, mw, mh) {
  const c = S / 2, cap = Math.ceil(Math.PI * (c + 2) * (c + 2)) + 8;
  const idx = new Int32Array(cap), lon = new Int32Array(cap), row = new Int32Array(cap), a = new Uint32Array(cap);
  let j = 0, n = 0;
  const p = { ready: false, idx: null, lon: null, row: null, a: null };
  p.step = function (end) {
    while (j < S) {
      for (let i = 0; i < S; i++) {
        const dx = (i + 0.5 - c) / c, dy = (j + 0.5 - c) / c;
        const rr = Math.sqrt(dx * dx + dy * dy);
        if (rr > 1 + 1.2 / c) continue;
        const k = Math.min(1, rr);
        const z = Math.sqrt(Math.max(0, 1 - k * k));
        const ddx = rr > 1 ? dx / rr : dx, ddy = rr > 1 ? dy / rr : dy;
        const la = Math.asin(Math.max(-1, Math.min(1, -ddy)));
        const lo = Math.atan2(ddx, z);
        idx[n] = j * S + i;
        lon[n] = Math.floor((lo / (Math.PI * 2) + 0.5) * mw) & (mw - 1);
        row[n] = Math.min(mh - 1, Math.floor((0.5 - la / Math.PI) * mh)) * mw;
        const cov = Math.max(0, Math.min(1, (1 - rr) * c + 0.5));
        a[n] = (Math.round(cov * 255) << 24) >>> 0;
        n++;
      }
      j++;
      if (end && performance.now() > end) return false;
    }
    p.idx = idx.subarray(0, n); p.lon = lon.subarray(0, n); p.row = row.subarray(0, n); p.a = a.subarray(0, n);
    p.ready = true;
    return true;
  };
  return p;
}
function projTables(S, mw, mh) {
  const key = S + '|' + mw;
  let p = PROJ_CACHE.get(key);
  if (!p) {
    p = projJob(S, mw, mh); PROJ_CACHE.set(key, p);
    if (S <= 512) p.step(0);                 // globurile mici: imediat, ca înainte
    else texQueue(p, true);                  // cele mari: pe bucăți
  } else if (!p.ready) texQueue(p, true);
  return p;
}

const GLOBE_CACHE = new Map();
function globeCanvas(key, S) {
  let g = GLOBE_CACHE.get(key);
  if (!g) {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const cx = cv.getContext('2d');
    const img = cx.createImageData(S, S);
    g = { cv: cv, cx: cx, img: img, u32: new Uint32Array(img.data.buffer), off: -1, mw: 0 };
    GLOBE_CACHE.set(key, g);
  }
  return g;
}
/* întoarce un canvas S×S cu globul rotit cu `turns` (rotații); dacă tabelele sau harta mare
   nu sunt încă gata, întoarce temporar un glob mai mic (se desenează scalat, fără sacadare) */
function getGlobe(body, S, turns, kindOverride) {
  const cap = mapCap(body);
  const wantW = S <= 128 ? 256 : S <= 288 ? 512 : S <= 512 ? 1024 : cap;
  const map = getMap(body, kindOverride, wantW);
  let mw = map.w, P = projTables(S, mw, mw / 2), useS = S;
  if (!P.ready) {
    /* aceeași mărime cu o hartă mai mică, sau un glob de 512 */
    let found = false;
    for (const w of [1024, 512, 256]) if (w < mw && map.lv[w]) { const q = PROJ_CACHE.get(S + '|' + w); if (q && q.ready) { mw = w; P = q; found = true; break; } }
    if (!found) { useS = Math.min(S, 512); mw = Math.min(map.w, 1024); P = projTables(useS, mw, mw / 2); }
  }
  const src = map.lv[mw] || map.u32;
  const key = mapKindOf(body, kindOverride) + '|' + body.id + '|' + useS;
  const g = globeCanvas(key, useS);
  const fr = turns - Math.floor(turns);
  const off = Math.floor(fr * mw) & (mw - 1);
  if (off !== g.off || g.mw !== mw) {
    const dst = g.u32, mw1 = mw - 1;
    const idx = P.idx, lon = P.lon, row = P.row, a = P.a, n = idx.length;
    for (let i = 0; i < n; i++) dst[idx[i]] = (src[row[i] + ((lon[i] + off) & mw1)] & 0x00ffffff) | a[i];
    g.cx.putImageData(g.img, 0, 0);
    g.off = off; g.mw = mw;
  }
  return g.cv;
}

/* ============================================================
   INELE, SPRITE-URI
   ============================================================ */
const bigCache = new Map();
function cachedCanvas(key, w, h, draw) {
  let c = bigCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  bigCache.set(key, c);
  return c;
}

/* inelele: textură văzută de sus (cerc), cu benzi, diviziunea Cassini, gol Encke */
function getRingTexture(id) {
  return cachedCanvas('ring|' + id, 512, 512, function (c, S) {
    const img = c.createImageData(S, S), d = img.data, rng = makeRng(hashStr('ring' + id));
    const prof = new Float32Array(256), tint = [];
    const uranus = id === 'uranus';
    /* profilul radial (0 = interior, 1 = exterior al texturii) */
    for (let i = 0; i < 256; i++) {
      const r = i / 255;
      let a = 0;
      if (uranus) {
        for (const q of [0.62, 0.68, 0.72, 0.78, 0.84, 0.9, 0.97]) a = Math.max(a, Math.exp(-Math.pow((r - q) / 0.006, 2)) * (q > 0.95 ? 0.9 : 0.5));
      } else {
        /* raza internă 1.28/2.25 ≈ 0.57 */
        if (r > 0.57 && r < 0.66) a = 0.18 + 0.1 * rng();                 // inelul C, palid
        else if (r >= 0.66 && r < 0.84) a = 0.7 + 0.25 * Math.sin(r * 90) * 0.4 + rng() * 0.15; // inelul B, dens
        else if (r >= 0.84 && r < 0.865) a = 0.05;                        // diviziunea Cassini
        else if (r >= 0.865 && r < 0.985) a = 0.55 + rng() * 0.12;        // inelul A
        if (r > 0.955 && r < 0.962) a = 0.08;                             // golul Encke
        a *= 0.85 + 0.15 * Math.sin(r * 400 + rng());
      }
      prof[i] = Math.max(0, Math.min(1, a));
      const warm = uranus ? [170, 200, 210] : (r < 0.66 ? [170, 150, 125] : (r < 0.84 ? [236, 214, 170] : [214, 196, 160]));
      tint.push(warm);
    }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
      if (r >= 1) continue;
      const f = r * 255, i0 = Math.min(254, f | 0), t = f - i0;
      const a = prof[i0] * (1 - t) + prof[i0 + 1] * t, col = tint[i0];
      const k = (y * S + x) * 4;
      d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = a * 255;
    }
    c.putImageData(img, 0, 0);
  });
}

/* sprite-uri mici (stele, halouri), puse în cache după culoare */
function getGlowSprite(color, hard) {
  return cachedCanvas('glow|' + color + '|' + (hard ? 1 : 0), 64, 64, function (c, S) {
    const rgb = hexToRgb(color), g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    if (hard) {
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.12, 'rgba(' + rgb + ',0.95)');
      g.addColorStop(0.32, 'rgba(' + rgb + ',0.32)');
    } else {
      g.addColorStop(0, 'rgba(' + rgb + ',0.9)');
      g.addColorStop(0.35, 'rgba(' + rgb + ',0.3)');
    }
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
  });
}
/* stea cu raze de difracție */
function getStarSprite(color) {
  return cachedCanvas('star|' + color, 96, 96, function (c, S) {
    const rgb = hexToRgb(color), h = S / 2;
    c.globalCompositeOperation = 'lighter';
    let g = c.createRadialGradient(h, h, 0, h, h, h * 0.6);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.1, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.2, 'rgba(' + rgb + ',0.7)');
    g.addColorStop(0.5, 'rgba(' + rgb + ',0.16)');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    for (const [w, l, a] of [[1.6, 1, 0.55], [3.2, 0.55, 0.25]]) {
      for (let k = 0; k < 2; k++) {
        c.save(); c.translate(h, h); c.rotate(k * Math.PI / 2);
        g = c.createLinearGradient(-h * l, 0, h * l, 0);
        g.addColorStop(0, 'rgba(' + rgb + ',0)'); g.addColorStop(0.5, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
        c.fillStyle = g; c.fillRect(-h * l, -w / 2, h * l * 2, w);
        c.restore();
      }
    }
  });
}
/* rocă neregulată pentru centura de asteroizi (lumina vine din stânga, -x) */
function getRockSprite(color, v) {
  return cachedCanvas('rockspr|' + color + '|' + v, 32, 32, function (c, S) {
    const rng = makeRng(hashStr(color + v)), h = S / 2, pts = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, r = h * (0.62 + rng() * 0.3);
      pts.push([h + Math.cos(a) * r, h + Math.sin(a) * r * (0.72 + rng() * 0.2)]);
    }
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      if (i === 0) c.moveTo(mx, my); else c.quadraticCurveTo(p0[0], p0[1], mx, my);
    }
    c.quadraticCurveTo(pts[0][0], pts[0][1], (pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
    c.closePath();
    const rgb = hexToRgb(color);
    const g = c.createRadialGradient(h * 0.62, h * 0.85, 1, h, h, h);
    g.addColorStop(0, 'rgb(' + rgb.map((x) => Math.min(255, x * 1.25 + 20) | 0) + ')');
    g.addColorStop(0.5, 'rgb(' + rgb.map((x) => x * 0.8 | 0) + ')');
    g.addColorStop(1, 'rgb(' + rgb.map((x) => x * 0.28 | 0) + ')');
    c.fillStyle = g; c.fill();
    /* câteva gropițe */
    for (let i = 0; i < 4; i++) {
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.beginPath(); c.arc(h * (0.6 + rng() * 0.8), h * (0.6 + rng() * 0.8), 1 + rng() * 2.2, 0, 7); c.fill();
    }
  });
}

/* ============================================================
   FUNDALUL: stele de culori diferite, liniștite (fără sclipire)
   ============================================================ */
const STAR_COLORS = ['#9bb7ff', '#c4d4ff', '#ffffff', '#fff3dc', '#ffd9a8', '#ffb98a'];
let STAR_TILE = null;
/* o „țiglă" de stele pre-randată (T pixeli CSS), desenată o singură dată */
function getStarTile(dpr) {
  const T = 900, k = Math.min(2, Math.max(1, dpr || 1));
  if (STAR_TILE && STAR_TILE.k === k) return STAR_TILE;
  const cv = document.createElement('canvas');
  cv.width = Math.round(T * k); cv.height = Math.round(T * k);
  const c = cv.getContext('2d');
  c.scale(k, k);
  const rng = makeRng(20261126);
  for (let i = 0; i < 1100; i++) {
    const x = rng() * T, y = rng() * T;
    const m = Math.pow(rng(), 3);                    // majoritatea stelelor sunt slabe
    const ci = Math.min(5, Math.floor(rng() * 6));
    const r = 0.4 + m * 1.1, a = 0.22 + m * 0.7;
    c.globalAlpha = a;
    c.fillStyle = STAR_COLORS[ci];
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  STAR_TILE = { cv: cv, T: T, k: k };
  return STAR_TILE;
}

/* ============================================================
   NEBULOASE, ROIURI, GAURA NEAGRĂ, GALAXII
   ============================================================ */
function placeholderGlow(color) {
  return cachedCanvas('ph|' + color, 64, 64, function (c, S) {
    const rgb = hexToRgb(color), g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(' + rgb + ',0.45)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
  });
}

/* stele „presărate" peste o textură (finisaj după generarea pe pixeli) */
function sprinkleStars(c, S, rng, count, tint, spread, fn) {
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const p = fn ? fn(rng) : [S / 2 + (rng() - 0.5) * S * spread, S / 2 + (rng() - 0.5) * S * spread];
    const r = 0.5 + Math.pow(rng(), 4) * 2.6;
    const col = rng() > 0.7 ? tint : (rng() > 0.5 ? '#ffffff' : '#cfe0ff');
    c.globalAlpha = 0.35 + rng() * 0.45;
    const spr = r > 2.4 ? getStarSprite(col) : getGlowSprite(col, true);
    const k = r > 2.4 ? 5 : 4;
    c.drawImage(spr, p[0] - r * k, p[1] - r * k, r * k * 2, r * k * 2);
  }
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
}

function getNebulaTexture(id, color, kind) {
  const key = 'neb|' + id;
  const e = bigCache.get(key);
  if (e && e.ready) return e.cv;
  if (e) { texQueue(e.job, true); return placeholderGlow(color); }
  const S = kind === 'blackhole' ? 512 : 384;
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const ent = { cv: cv, ready: false };
  bigCache.set(key, ent);
  const seed = hashStr(key), rng = makeRng(seed), n = makeNoise3(seed);
  const tint = hexToRgb(color);

  if (kind === 'cluster') {
    /* roi de stele: puțin praf albăstrui (lumină reflectată) + stele de culori diferite */
    ent.job = rowJob(S, S, function (x, y, o) {
      const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
      const f = fbm(n, dx * 3, dy * 3, 0.5, 5);
      const wisp = 1 - Math.abs(2 * fbm(n, dx * 4 + 2, dy * 6, 1.7, 4) - 1);
      const lum = sstep(1, 0.1, r) * (0.12 + 0.3 * sstep(0.45, 0.7, f) + 0.25 * Math.pow(wisp, 6));
      o[0] = tint[0] * 0.6 + 60; o[1] = tint[1] * 0.6 + 70; o[2] = 255; o[3] = clamp01(lum * 0.55) * 255;
    }, function (img) {
      const c = cv.getContext('2d'); c.putImageData(img, 0, 0);
      sprinkleStars(c, S, rng, 360, color, 1, (q) => {
        const a = q() * Math.PI * 2, rr = Math.pow(q(), 1.9) * S * 0.44;
        return [S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr];
      });
      ent.ready = true;
    });
  } else if (kind === 'blackhole') {
    /* disc de acreție înclinat, mai luminos pe partea care vine spre noi,
       inel de fotoni și partea din spate a discului curbată deasupra umbrei */
    ent.job = rowJob(S, S, function (x, y, o) {
      const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
      const sh = 0.2;
      const yd = dy / 0.3, rd = Math.sqrt(dx * dx + yd * yd), th = Math.atan2(yd, dx);
      let lum = 0;
      if (rd > 0.24 && rd < 0.95) {
        const prof = sstep(0.24, 0.34, rd) * sstep(0.95, 0.45, rd);
        const streak = fbm(n, Math.cos(th) * 3 + rd * 9, Math.sin(th) * 3, rd * 14, 4);
        const dop = 1 + 0.75 * Math.cos(th - Math.PI);
        lum = prof * (0.45 + streak * 0.9) * dop * 0.75;
        if (dy < 0 && r < sh * 1.02) lum = 0;            // în fața umbrei nu e disc deasupra
      }
      /* partea din spate a discului, îndoită de gravitație deasupra umbrei */
      const arc = Math.exp(-Math.pow((r - sh * 1.35) / 0.05, 2)) * sstep(0.1, -0.12, dy) * 0.9;
      const ring = Math.exp(-Math.pow((r - sh * 1.08) / 0.012, 2)) * 0.95;
      lum += arc + ring;
      const glow = Math.exp(-r / 0.25) * 0.25;
      lum = clamp01(lum + glow);
      if (r < sh) { o[0] = 0; o[1] = 0; o[2] = 0; o[3] = 255 * sstep(sh, sh * 0.92, r) + lum * 0; return; }
      const hot = clamp01(lum * 1.2);
      o[0] = 255; o[1] = 120 + 120 * hot; o[2] = 40 + 170 * hot * hot; o[3] = lum * 255;
    }, function (img) {
      const c = cv.getContext('2d'); c.putImageData(img, 0, 0);
      /* umbra peste tot ce e în spatele ei */
      c.fillStyle = '#000'; c.beginPath(); c.arc(S / 2, S / 2, S * 0.1 * 0.97, 0, Math.PI * 2); c.fill();
      ent.ready = true;
    });
  } else {
    /* nor de gaz: zgomot deformat, filamente luminoase, praf întunecat, stele tinere */
    const second = kind === 'nebula' ? [110, 150, 255] : [255, 160, 200];
    const pink = [255, 110, 160];
    const ell = 0.75 + rng() * 0.35, rot = rng() * Math.PI;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    ent.job = rowJob(S, S, function (x, y, o) {
      let dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1;
      const qx = dx * cr - dy * sr, qy = (dx * sr + dy * cr) / ell;
      const r = Math.sqrt(qx * qx + qy * qy);
      if (r > 1.05) { o[3] = 0; return; }
      const wx = fbm(n, dx * 2, dy * 2, 1.1, 3) - 0.5, wy = fbm(n, dx * 2 + 5.2, dy * 2 + 1.3, 2.4, 3) - 0.5;
      const ux = dx * 2.6 + wx * 1.9, uy = dy * 2.6 + wy * 1.9;
      const dens = fbm(n, ux, uy, 3.7, 5);
      const edge = fbm(n, dx * 1.5 + 9, dy * 1.5, 0.3, 3);
      const shape = sstep(1.0, 0.2, r * (0.75 + edge * 0.6));
      const fil = 1 - Math.abs(2 * fbm(n, ux * 1.9 + 3, uy * 1.9, 5.1, 4) - 1);
      const dust = sstep(0.56, 0.72, fbm(n, ux * 1.4 + 11, uy * 1.4, 8.3, 4));
      const core = Math.exp(-r * r / 0.12);
      let lum = (clamp01((dens - 0.36) * 2.3) * 0.75 + Math.pow(fil, 7) * 0.75 + core * 0.35) * shape;
      lum *= 1 - dust * 0.82 * sstep(0.1, 0.5, r + 0.25);
      const cm = sstep(0.35, 0.7, fbm(n, dx * 1.8 + 21, dy * 1.8, 6.6, 3));
      mixInto(o, tint, second, cm * 0.8);
      blendInto(o, pink, sstep(0.68, 0.82, fil) * 0.3);
      blendInto(o, [255, 244, 232], clamp01(core * 0.8 + Math.pow(clamp01(lum), 3) * 0.5));
      o[3] = clamp01(lum * 0.9) * 255;
    }, function (img) {
      const c = cv.getContext('2d'); c.putImageData(img, 0, 0);
      sprinkleStars(c, S, rng, 90, color, 0.62);
      /* câteva stele tinere, strălucitoare, în miez */
      sprinkleStars(c, S, rng, 5, '#cfe0ff', 0.25);
      ent.ready = true;
    });
  }
  texQueue(ent.job, true);
  return placeholderGlow(color);
}

/* ce formă are o galaxie cu nume (folosit și la desen, și la pre-generare) */
function galaxyShapeFor(o) {
  if (o.id === 'andromeda' || o.id === 'whirlpool') return 'twoarm';
  if (o.id === 'sombrero') return 'elliptical';
  return 'fourarm';
}

function getGalaxyTexture(id, color, shape) {
  const key = 'gal|' + id + '|' + shape;
  const e = bigCache.get(key);
  if (e && e.ready) return e.cv;
  if (e) { texQueue(e.job, true); return placeholderGlow(color); }
  const S = id.indexOf('bg') === 0 ? 192 : 512;
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const ent = { cv: cv, ready: false };
  bigCache.set(key, ent);
  const seed = hashStr(key), rng = makeRng(seed), n = makeNoise3(seed);
  const tint = hexToRgb(color);
  const warm = [255, 226, 178], blue = [150, 185, 255], pink = [255, 120, 170];
  const arms = shape === 'twoarm' ? 2 : 4;
  const pitch = 3.2 + rng() * 1.6;          // cât de strâns se răsucesc brațele
  const barred = id === 'milkyway';
  const sombrero = id === 'sombrero';

  ent.job = rowJob(S, S, function (x, y, o) {
    const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
    if (r > 1) { o[3] = 0; return; }
    let lum, ck;
    if (shape === 'elliptical') {
      const f = fbm(n, dx * 4, dy * 4, 0.5, 3);
      lum = Math.exp(-r / 0.13) * 1.1 + Math.exp(-r / 0.36) * 0.28 * (0.8 + f * 0.4);
      mixInto(o, warm, tint, 0.35 + r * 0.4);
      if (sombrero) {
        const ax = Math.abs(dx);
        lum += 0.5 * Math.exp(-Math.pow(dy / 0.07, 2)) * sstep(1, 0.55, ax);
        lum *= 1 - 0.9 * Math.exp(-Math.pow((dy + 0.02) / 0.035, 2)) * sstep(0.98, 0.35, ax) * (0.7 + 0.3 * f);
      }
    } else {
      const th = Math.atan2(dy, dx) + (fbm(n, dx * 3, dy * 3, 1.3, 3) - 0.5) * 0.9;
      const lr = Math.log(r + 0.03);
      const ph = arms * (th - pitch * lr);
      const armS = Math.pow(0.5 + 0.5 * Math.cos(ph), 1.6 + r * 1.8);
      const dustS = Math.pow(0.5 + 0.5 * Math.cos(ph - 0.75), 10) * sstep(0.08, 0.25, r);
      const clump = fbm(n, dx * 9, dy * 9, 2.9, 4);
      const disk = Math.exp(-r / 0.3);
      const bulge = Math.exp(-Math.pow(r / 0.09, 1.3)) * 1.3;
      let bar = 0;
      if (barred) { const bx = dx * 0.82 + dy * 0.57, by = -dx * 0.57 + dy * 0.82; bar = Math.exp(-(bx * bx / 0.06 + by * by / 0.004)) * 0.7; }
      lum = bulge + bar + disk * (0.28 + 1.2 * armS * (0.5 + 0.8 * clump));
      lum *= 1 - 0.72 * dustS * (0.5 + clump);
      ck = clamp01(armS * 1.1 + r * 0.6 - bulge * 0.6);
      mixInto(o, warm, blue, ck);
      blendInto(o, tint, 0.3);
      if (armS > 0.6 && clump > 0.62) blendInto(o, pink, sstep(0.62, 0.72, clump) * 0.7);
    }
    lum *= sstep(1, 0.72, r);
    o[3] = clamp01(lum) * 255;
  }, function (img) {
    const c = cv.getContext('2d'); c.putImageData(img, 0, 0);
    if (shape !== 'elliptical' && S >= 256) {
      /* stele tinere strălucitoare de-a lungul brațelor */
      sprinkleStars(c, S, rng, 70, '#bcd4ff', 1, (q) => {
        const t = 0.15 + Math.pow(q(), 0.7) * 0.8, arm = Math.floor(q() * arms);
        const th = (arm / arms) * Math.PI * 2 / 1 + pitch * Math.log(t + 0.03) + (q() - 0.5) * 0.35;
        return [S / 2 + Math.cos(th) * t * S / 2, S / 2 + Math.sin(th) * t * S / 2];
      });
    }
    ent.ready = true;
  });
  texQueue(ent.job, !id.startsWith('bg'));
  return placeholderGlow(color);
}

/* ---------- pre-generare în fundal (cât timp copilul e pe ecranul de start) ---------- */
window.addEventListener('load', function () {
  setTimeout(function () {
    try {
      const bodies = [SUN].concat(PLANETS, DWARFS, ASTEROIDS, COMETS);
      for (const b of bodies) {
        getMap(b, b === SUN ? 'sun' : null, false);
        if (b.moons) for (const m of b.moons) getMap(m, null, false);
      }
      for (const o of GALACTIC) getNebulaTexture(o.id, o.color, o.kind);
      getGalaxyTexture('milkyway', '#cfd8ff', 'fourarm');
      for (const o of DEEPSPACE) {
        if (o.id === 'milkyway' || o.kind === 'web') continue;
        if (o.kind === 'galaxy') getGalaxyTexture(o.id, o.color, galaxyShapeFor(o));
        else getNebulaTexture(o.id, o.color, o.kind);
      }
      /* urgent = false pentru toate, ca să nu blocheze ce e pe ecran */
    } catch (e) { /* datele lipsesc? nu e grav, se generează la cerere */ }
  }, 600);
});
