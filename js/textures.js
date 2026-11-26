/* ============================================================
   TEXTURI PROCEDURALE
   Fiecare corp cosmic este desenat o singură dată într-un canvas
   ascuns, apoi reutilizat. Nu există imagini externe: aplicația
   funcționează complet offline.
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

const TEX_SIZE = 256;
const texCache = new Map();

function newTexCanvas() {
  const c = document.createElement('canvas');
  c.width = TEX_SIZE; c.height = TEX_SIZE;
  return c;
}

function clipCircle(ctx) {
  ctx.beginPath();
  ctx.arc(TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE / 2 - 1, 0, Math.PI * 2);
  ctx.clip();
}

/* umbrire sferică: lumina vine din stânga-sus */
function shadeSphere(ctx, strength) {
  const S = TEX_SIZE, c = S / 2;
  const g = ctx.createRadialGradient(c * 0.62, c * 0.58, S * 0.04, c, c, c);
  g.addColorStop(0, 'rgba(255,255,255,' + (0.26 * strength) + ')');
  g.addColorStop(0.42, 'rgba(255,255,255,0)');
  g.addColorStop(0.72, 'rgba(0,0,0,' + (0.18 * strength) + ')');
  g.addColorStop(1, 'rgba(0,0,0,' + (0.78 * strength) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  /* lumină slabă pe margine (lumină reflectată) */
  const r = ctx.createRadialGradient(c, c, S * 0.44, c, c, c * 0.995);
  r.addColorStop(0, 'rgba(255,255,255,0)');
  r.addColorStop(1, 'rgba(160,190,255,' + (0.12 * strength) + ')');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, S, S);
}

function fillBase(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
}

function blob(ctx, rng, x, y, r, color, wob) {
  ctx.beginPath();
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r * (1 + (rng() - 0.5) * (wob === undefined ? 0.5 : wob));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function craters(ctx, rng, count, baseLight, baseDark) {
  const S = TEX_SIZE;
  for (let i = 0; i < count; i++) {
    const x = rng() * S, y = rng() * S;
    const r = 2 + rng() * rng() * S * 0.1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + baseDark + ',' + (0.10 + rng() * 0.22) + ')';
    ctx.fill();
    ctx.beginPath(); ctx.arc(x - r * 0.12, y - r * 0.12, r * 0.86, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(' + baseLight + ',' + (0.10 + rng() * 0.2) + ')';
    ctx.lineWidth = Math.max(0.7, r * 0.12);
    ctx.stroke();
  }
}

function bands(ctx, rng, colors, count, turbulence) {
  const S = TEX_SIZE;
  let y = 0;
  while (y < S) {
    const h = S * (0.025 + rng() * 0.085);
    const col = colors[(Math.random() * 0 + Math.floor(rng() * colors.length)) | 0];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const seg = 8;
    for (let i = 0; i <= seg; i++) {
      ctx.lineTo((i / seg) * S, y + (rng() - 0.5) * turbulence);
    }
    for (let i = seg; i >= 0; i--) {
      ctx.lineTo((i / seg) * S, y + h + (rng() - 0.5) * turbulence);
    }
    ctx.closePath();
    ctx.fill();
    y += h * 0.92;
  }
}

/* --- generatoarele pentru fiecare tip --- */
const TEX_BUILDERS = {

  sun(ctx, rng) {
    const S = TEX_SIZE, c = S / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, '#fffdf0');
    g.addColorStop(0.45, '#ffe680');
    g.addColorStop(0.78, '#ffb52e');
    g.addColorStop(1, '#ff7a18');
    fillBase(ctx, '#000'); ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 420; i++) {
      const x = rng() * S, y = rng() * S, r = 1.5 + rng() * 6;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rng() > 0.5 ? 'rgba(255,255,220,0.10)' : 'rgba(210,90,0,0.10)';
      ctx.fill();
    }
    /* pete solare */
    for (let i = 0; i < 5; i++) {
      blob(ctx, rng, 40 + rng() * (S - 80), 40 + rng() * (S - 80), 4 + rng() * 9, 'rgba(120,40,0,0.45)');
    }
  },

  earth(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#1b4f86');
    for (let i = 0; i < 26; i++) {
      blob(ctx, rng, rng() * S, 30 + rng() * (S - 60), 10 + rng() * 34,
        rng() > 0.72 ? '#8a7a4a' : (rng() > 0.4 ? '#2f7a43' : '#3f8f4e'), 0.75);
    }
    /* calote polare */
    ctx.fillStyle = '#f2f7fb';
    ctx.fillRect(0, 0, S, S * 0.085);
    ctx.fillRect(0, S * 0.93, S, S * 0.075);
    /* nori */
    for (let i = 0; i < 34; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 7 + rng() * 22, 'rgba(255,255,255,0.4)', 0.8);
    }
  },

  mars(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#c0552f');
    for (let i = 0; i < 30; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 8 + rng() * 30,
        rng() > 0.5 ? 'rgba(120,52,30,0.5)' : 'rgba(224,140,90,0.4)', 0.7);
    }
    craters(ctx, rng, 60, '255,200,170', '70,25,10');
    /* Valles Marineris */
    ctx.strokeStyle = 'rgba(80,32,16,0.55)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(S * 0.18, S * 0.56);
    ctx.bezierCurveTo(S * 0.4, S * 0.5, S * 0.6, S * 0.62, S * 0.84, S * 0.54);
    ctx.stroke();
    ctx.fillStyle = '#f6f2ee';
    ctx.beginPath(); ctx.ellipse(S / 2, 6, S * 0.3, S * 0.06, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S / 2, S - 6, S * 0.22, S * 0.05, 0, 0, 7); ctx.fill();
  },

  venus(ctx, rng) {
    fillBase(ctx, '#d9b46a');
    bands(ctx, rng, ['rgba(255,235,180,0.5)', 'rgba(200,150,70,0.45)', 'rgba(240,210,150,0.4)'], 0, 16);
    for (let i = 0; i < 20; i++) {
      blob(ctx, rng, rng() * TEX_SIZE, rng() * TEX_SIZE, 12 + rng() * 30, 'rgba(255,240,200,0.18)', 0.9);
    }
  },

  jupiter(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#caa877');
    bands(ctx, rng, ['#e3cfa8', '#b98f61', '#d9bd92', '#9c7149', '#efe0c4', '#c09a6b'], 0, 9);
    for (let i = 0; i < 26; i++) {
      const y = rng() * S;
      ctx.beginPath();
      ctx.ellipse(rng() * S, y, 6 + rng() * 22, 3 + rng() * 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = rng() > 0.5 ? 'rgba(255,245,225,0.3)' : 'rgba(130,85,50,0.3)';
      ctx.fill();
    }
    /* Marea Pată Roșie */
    ctx.beginPath();
    ctx.ellipse(S * 0.33, S * 0.63, S * 0.14, S * 0.072, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c1523a'; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(S * 0.33, S * 0.63, S * 0.09, S * 0.042, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224,120,80,0.75)'; ctx.fill();
  },

  saturn(ctx, rng) {
    fillBase(ctx, '#ded0a6');
    bands(ctx, rng, ['#f0e5c4', '#d4c091', '#e8d9b0', '#c2ab7c'], 0, 7);
  },

  uranus(ctx, rng) {
    fillBase(ctx, '#a6e4e8');
    bands(ctx, rng, ['rgba(255,255,255,0.14)', 'rgba(120,200,210,0.3)', 'rgba(190,240,245,0.2)'], 0, 5);
  },

  neptune(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#3f63c9');
    bands(ctx, rng, ['rgba(255,255,255,0.10)', 'rgba(30,55,150,0.35)', 'rgba(120,160,240,0.22)'], 0, 6);
    ctx.beginPath();
    ctx.ellipse(S * 0.62, S * 0.42, S * 0.11, S * 0.065, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,30,90,0.75)'; ctx.fill();
    for (let i = 0; i < 8; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 5 + rng() * 10, 'rgba(255,255,255,0.3)', 0.8);
    }
  },

  cratered(ctx, rng) {
    fillBase(ctx, '#b4ada3');
    for (let i = 0; i < 18; i++) {
      blob(ctx, rng, rng() * TEX_SIZE, rng() * TEX_SIZE, 14 + rng() * 40,
        rng() > 0.5 ? 'rgba(120,114,104,0.45)' : 'rgba(210,205,196,0.35)', 0.6);
    }
    craters(ctx, rng, 130, '255,255,250', '40,36,32');
  },

  rock(ctx, rng) {
    fillBase(ctx, '#8e867c');
    for (let i = 0; i < 16; i++) {
      blob(ctx, rng, rng() * TEX_SIZE, rng() * TEX_SIZE, 12 + rng() * 36,
        rng() > 0.5 ? 'rgba(60,55,48,0.4)' : 'rgba(180,172,160,0.3)', 0.7);
    }
    craters(ctx, rng, 90, '240,236,228', '30,26,22');
  },

  ice(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#e9f3f8');
    for (let i = 0; i < 16; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 14 + rng() * 36, 'rgba(176,214,235,0.45)', 0.7);
    }
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = 'rgba(120,170,205,' + (0.2 + rng() * 0.3) + ')';
      ctx.beginPath();
      let x = rng() * S, y = rng() * S;
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (rng() - 0.5) * 70; y += (rng() - 0.5) * 70; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  },

  io(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#e8d96a');
    for (let i = 0; i < 24; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 10 + rng() * 26,
        rng() > 0.6 ? 'rgba(214,120,40,0.5)' : 'rgba(250,240,170,0.5)', 0.8);
    }
    for (let i = 0; i < 22; i++) {
      const x = rng() * S, y = rng() * S, r = 3 + rng() * 9;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(90,30,10,0.6)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,90,30,0.18)'; ctx.fill();
    }
  },

  europa(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#ded5c6');
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = 'rgba(150,100,70,' + (0.25 + rng() * 0.35) + ')';
      ctx.beginPath();
      let x = rng() * S, y = rng() * S;
      ctx.moveTo(x, y);
      for (let k = 0; k < 3; k++) {
        x += (rng() - 0.5) * 140; y += (rng() - 0.5) * 100;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  },

  titan(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#d89a4c');
    for (let i = 0; i < 20; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 16 + rng() * 34,
        rng() > 0.5 ? 'rgba(240,190,110,0.4)' : 'rgba(150,95,30,0.35)', 0.8);
    }
    /* lacuri de metan */
    for (let i = 0; i < 5; i++) {
      blob(ctx, rng, rng() * S, rng() * S * 0.4, 7 + rng() * 14, 'rgba(50,45,60,0.55)', 0.9);
    }
  },

  pluto(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#c6ab8d');
    for (let i = 0; i < 18; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 12 + rng() * 30,
        rng() > 0.5 ? 'rgba(120,88,64,0.45)' : 'rgba(232,216,196,0.4)', 0.7);
    }
    /* „inima" Sputnik Planitia */
    ctx.beginPath();
    ctx.moveTo(S * 0.5, S * 0.78);
    ctx.bezierCurveTo(S * 0.18, S * 0.62, S * 0.3, S * 0.3, S * 0.5, S * 0.46);
    ctx.bezierCurveTo(S * 0.7, S * 0.3, S * 0.82, S * 0.62, S * 0.5, S * 0.78);
    ctx.closePath();
    ctx.fillStyle = 'rgba(248,242,228,0.85)'; ctx.fill();
  },

  comet(ctx, rng) {
    const S = TEX_SIZE;
    fillBase(ctx, '#5c6670');
    for (let i = 0; i < 20; i++) {
      blob(ctx, rng, rng() * S, rng() * S, 14 + rng() * 34,
        rng() > 0.5 ? 'rgba(30,36,44,0.5)' : 'rgba(190,215,230,0.35)', 0.8);
    }
    craters(ctx, rng, 70, '220,240,255', '10,14,20');
  }
};

/* returnează canvasul texturii pentru un corp */
function getTexture(kind, seedKey) {
  const key = kind + '|' + seedKey;
  if (texCache.has(key)) return texCache.get(key);
  const cv = newTexCanvas();
  const ctx = cv.getContext('2d');
  const rng = makeRng(hashStr(key) || 12345);
  ctx.save();
  clipCircle(ctx);
  const builder = TEX_BUILDERS[kind] || TEX_BUILDERS.rock;
  builder(ctx, rng);
  if (kind !== 'sun') shadeSphere(ctx, 1);
  else shadeSphere(ctx, 0.12);
  ctx.restore();
  texCache.set(key, cv);
  return cv;
}

/* ---------- textură pentru nebuloase / galaxii / roiuri ---------- */
const bigCache = new Map();

function getNebulaTexture(id, color, kind) {
  const key = 'neb|' + id;
  if (bigCache.has(key)) return bigCache.get(key);
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const ctx = cv.getContext('2d');
  const rng = makeRng(hashStr(key));
  ctx.globalCompositeOperation = 'lighter';

  const tint = hexToRgb(color);
  const second = kind === 'cluster' ? [255, 240, 210] : [120, 150, 255];

  if (kind === 'cluster') {
    /* roi de stele */
    const n = 520;
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const rr = Math.pow(rng(), 2.1) * S * 0.46;
      const x = S / 2 + Math.cos(a) * rr, y = S / 2 + Math.sin(a) * rr;
      const r = 0.8 + rng() * 2.2;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.3, 'rgba(' + tint.join(',') + ',0.5)');
      g.addColorStop(1, 'rgba(' + tint.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
    }
    const halo = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
    halo.addColorStop(0, 'rgba(' + tint.join(',') + ',0.28)');
    halo.addColorStop(1, 'rgba(' + tint.join(',') + ',0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, S, S);
  } else if (kind === 'blackhole') {
    /* disc de acreție */
    for (let i = 0; i < 160; i++) {
      const a = rng() * Math.PI * 2;
      const rr = S * (0.14 + rng() * 0.3);
      ctx.strokeStyle = 'rgba(255,' + (140 + rng() * 90 | 0) + ',60,' + (0.04 + rng() * 0.08) + ')';
      ctx.lineWidth = 1 + rng() * 6;
      ctx.beginPath();
      ctx.ellipse(S / 2, S / 2, rr, rr * 0.34, a * 0.1, a, a + 1.6 + rng());
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.2);
    g.addColorStop(0, 'rgba(255,220,160,0.75)');
    g.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    /* umbra */
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.075, 0, Math.PI * 2);
    ctx.fillStyle = '#000'; ctx.fill();
  } else {
    /* nor de gaz: multe pete luminoase suprapuse */
    for (let i = 0; i < 230; i++) {
      const a = rng() * Math.PI * 2;
      const rr = Math.pow(rng(), 0.7) * S * 0.42;
      const x = S / 2 + Math.cos(a) * rr * (1 + rng() * 0.4);
      const y = S / 2 + Math.sin(a) * rr * 0.78;
      const r = S * (0.03 + rng() * 0.13);
      const col = rng() > 0.6 ? second : tint;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + col.join(',') + ',' + (0.05 + rng() * 0.09) + ')');
      g.addColorStop(1, 'rgba(' + col.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    /* stele tinere în interior */
    for (let i = 0; i < 110; i++) {
      const x = S * (0.2 + rng() * 0.6), y = S * (0.25 + rng() * 0.5);
      const r = 0.5 + rng() * 1.1;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  maskRound(ctx, S, 0.42);
  bigCache.set(key, cv);
  return cv;
}

/* taie marginile pătrate ale texturii, ca să nu se vadă dreptunghiul */
function maskRound(ctx, S, solidUpTo) {
  ctx.globalCompositeOperation = 'destination-in';
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(solidUpTo, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = 'source-over';
}

/* textură pentru o galaxie spirală / eliptică */
function getGalaxyTexture(id, color, shape) {
  const key = 'gal|' + id + '|' + shape;
  if (bigCache.has(key)) return bigCache.get(key);
  const S = 512, cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const ctx = cv.getContext('2d');
  const rng = makeRng(hashStr(key));
  ctx.globalCompositeOperation = 'lighter';
  const tint = hexToRgb(color);

  /* halo + bulb */
  let g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
  g.addColorStop(0, 'rgba(255,245,215,0.85)');
  g.addColorStop(0.08, 'rgba(255,235,190,0.45)');
  g.addColorStop(0.3, 'rgba(' + tint.join(',') + ',0.12)');
  g.addColorStop(1, 'rgba(' + tint.join(',') + ',0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

  if (shape === 'elliptical') {
    maskRound(ctx, S, 0.46);
    bigCache.set(key, cv); return cv;
  }

  /* brațe spiralate */
  const arms = shape === 'twoarm' ? 2 : 4;
  const N = 9000;
  for (let i = 0; i < N; i++) {
    const t = Math.pow(rng(), 0.55);
    const arm = i % arms;
    const spread = 0.42 / (t + 0.14);
    let th = (arm / arms) * Math.PI * 2 + t * 5.2 + (rng() - 0.5) * spread;
    const rr = t * S * 0.47 * (1 + (rng() - 0.5) * 0.08);
    const x = S / 2 + Math.cos(th) * rr;
    const y = S / 2 + Math.sin(th) * rr;
    const young = rng() > 0.72;
    const a = 0.05 + rng() * 0.2;
    ctx.fillStyle = young
      ? 'rgba(190,215,255,' + a + ')'
      : 'rgba(' + (255) + ',' + (235 - t * 40 | 0) + ',' + (200 - t * 30 | 0) + ',' + (a * 0.8) + ')';
    const sz = young ? 1.5 + rng() * 1.6 : 0.8 + rng();
    ctx.fillRect(x, y, sz, sz);
    if (young && rng() > 0.985) {
      const gg = ctx.createRadialGradient(x, y, 0, x, y, 9);
      gg.addColorStop(0, 'rgba(255,150,190,0.3)');
      gg.addColorStop(1, 'rgba(255,150,190,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }
  }
  /* dâre de praf */
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 150; i++) {
    const t = 0.2 + rng() * 0.8;
    const arm = i % arms;
    const th = (arm / arms) * Math.PI * 2 + t * 5.2 - 0.22 + (rng() - 0.5) * 0.14;
    const rr = t * S * 0.47;
    const x = S / 2 + Math.cos(th) * rr, y = S / 2 + Math.sin(th) * rr;
    ctx.fillStyle = 'rgba(20,10,20,' + (0.04 + rng() * 0.07) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, 10 + rng() * 26, 3 + rng() * 7, th, 0, Math.PI * 2); ctx.fill();
  }
  maskRound(ctx, S, 0.46);
  bigCache.set(key, cv);
  return cv;
}

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
