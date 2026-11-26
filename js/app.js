/* ============================================================
   UNIVERSUL NOSTRU — motorul aplicației
   ============================================================ */

'use strict';

/* ---------- elemente DOM ---------- */
const $ = (s) => document.querySelector(s);
const canvas = $('#sky');
const ctx = canvas.getContext('2d', { alpha: false });

let W = 0, H = 0, DPR = 1;
let BELT_STEP = 1, STAR_STEP = 1;   // pe telefon desenăm mai puține particule
let viewShift = 0;                  // urcă imaginea când se deschide fișa pe telefon

/* ---------- cameră și timp ---------- */
const MIN_SCALE = 8e3;        // metri / pixel (zoom maxim)
const MAX_SCALE = 2.5e23;     // (zoom minim)

const cam = { x: 0, y: 0, scale: 9e8 };
let camTarget = null;         // animație de zbor
let followId = null;

const EPOCH = new Date(2026, 10, 26);  // 26 noiembrie 2026
let simDays = 0;              // zile scurse de la EPOCH
let speed = 3;                // zile pe secundă
let playing = true;

let showOrbits = true;
let showLabels = true;
let selected = null;          // obiectul selectat
let skyMode = false;          // harta cerului cu constelații
let kidAge = Number(localStorage.getItem('kidAge') || 0);
let PHOTO_CREDITS = null;     // completat din photos/credits.json

/* lista de obiecte „atingibile" reconstruită la fiecare cadru */
let hitList = [];

/* ---------- utilitare ---------- */
const DEG = Math.PI / 180;
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

function ramp(v, a, b) {
  const t = (Math.log(v) - Math.log(a)) / (Math.log(b) - Math.log(a));
  return clamp(t, 0, 1);
}
function fadeOut(v, a, b) { return 1 - ramp(v, a, b); }

function sx(wx) { return (wx - cam.x) / cam.scale + W / 2; }
function sy(wy) { return (wy - cam.y) / cam.scale + H / 2 + viewShift; }

/* ---------- mecanică orbitală (Kepler, plan 2D) ---------- */
function orbitAngleArg(body) {
  return ((body.phase || 0) * 1.7 + 30) % 360 * DEG;  // argumentul periheliului
}

function keplerPos(body, days) {
  const a = body.a, e = body.e || 0, P = body.P || 365;
  const M = ((body.phase || 0) * DEG + (2 * Math.PI * days) / P) % (Math.PI * 2);
  let E = M;
  for (let i = 0; i < 6; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  const r = a * (1 - e * Math.cos(E));
  const nu = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e);
  const w = orbitAngleArg(body);
  return { x: r * Math.cos(nu + w), y: r * Math.sin(nu + w), r: r };
}

/* poziții calculate o dată pe cadru */
const pos = {};

function computePositions() {
  pos.sun = { x: 0, y: 0, r: 0 };
  const all = PLANETS.concat(DWARFS, COMETS, ASTEROIDS);
  for (const b of all) {
    pos[b.id] = keplerPos(b, simDays);
    if (b.moons) {
      for (const m of b.moons) {
        const p = keplerPos(m, simDays);
        pos[m.id] = { x: pos[b.id].x + p.x, y: pos[b.id].y + p.y, r: p.r, parent: b.id };
      }
    }
  }
  for (const s of SPACECRAFT) {
    if (s.around === 'sun') {
      const ang = (s.phase * DEG) + (2 * Math.PI * simDays) / s.P;
      pos[s.id] = { x: Math.cos(ang) * s.r, y: Math.sin(ang) * s.r, r: s.r };
    } else {
      const host = pos[s.around] || pos.earth;
      pos[s.id] = { x: host.x, y: host.y, r: s.r, parent: s.around };
    }
  }
}

/* ---------- centuri de corpuri mici (generate o dată) ---------- */
function makeBelt(n, aMin, aMax, seed, spread) {
  const rng = makeRng(seed);
  const arr = new Float64Array(n * 4);  // a, phase, wobble, size
  for (let i = 0; i < n; i++) {
    const a = (aMin + rng() * (aMax - aMin)) * AU;
    arr[i * 4] = a;
    arr[i * 4 + 1] = rng() * Math.PI * 2;
    arr[i * 4 + 2] = 1 + (rng() - 0.5) * (spread || 0.1);
    arr[i * 4 + 3] = 0.6 + rng() * 1.5;
  }
  return arr;
}
const MAIN_BELT = makeBelt(1100, 2.06, 3.4, 7777, 0.1);
const KUIPER = makeBelt(1600, 30, 51, 4242, 0.12);
const TROJANS_A = makeBelt(160, 4.95, 5.45, 919, 0.06);
const TROJANS_B = makeBelt(160, 4.95, 5.45, 313, 0.06);

/* roci (sprite-uri umbrite, partea luminată spre Soare); mai mari când apropii imaginea */
function drawBelt(arr, color, alpha, sizeBoost, angOffset, refBody) {
  const n = arr.length / 4;
  const step = refBody ? 1 : BELT_STEP;
  const zb = clamp(Math.pow(3e9 / cam.scale, 0.28), 1, 3.2);
  const sprs = [getRockSprite(color, 0), getRockSprite(color, 1), getRockSprite(color, 2)];
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const base = refBody ? Math.atan2(pos[refBody].y, pos[refBody].x) : 0;
  let rotated = false;
  for (let i = 0; i < n; i += step) {
    const a = arr[i * 4], ph = arr[i * 4 + 1], wob = arr[i * 4 + 2], szf = arr[i * 4 + 3];
    const P = 365.256 * Math.pow(a / AU, 1.5);
    let ang;
    if (refBody) {
      ang = base + angOffset + (ph - Math.PI) * 0.16;
    } else {
      ang = ph + (2 * Math.PI * simDays) / P;
    }
    const rr = a * wob;
    const px = sx(Math.cos(ang) * rr), py = sy(Math.sin(ang) * rr);
    if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
    const s = szf * (sizeBoost || 1) * zb;
    if (s < 1.7) {
      if (rotated) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); rotated = false; }
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    } else {
      const c = Math.cos(ang + ph) * DPR, sn = Math.sin(ang + ph) * DPR;
      /* rotim sprite-ul ca partea luminată să privească spre Soare */
      const ca = Math.cos(ang) * DPR, sa = Math.sin(ang) * DPR;
      ctx.setTransform(ca, sa, -sa, ca, px * DPR, py * DPR);
      rotated = true;
      ctx.drawImage(sprs[(i + (c > sn ? 1 : 0)) % 3], -s, -s, s * 2, s * 2);
    }
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = 1;
}

/* ---------- fond de stele ---------- */
const BG_STARS = (function () {
  const rng = makeRng(20261126);
  const n = 1400, arr = new Float64Array(n * 4);
  for (let i = 0; i < n; i++) {
    arr[i * 4] = rng();                    // x relativ
    arr[i * 4 + 1] = rng();                // y relativ
    arr[i * 4 + 2] = 0.35 + rng() * 1.5;   // rază
    arr[i * 4 + 3] = 0.25 + rng() * 0.75;  // luminozitate
  }
  return arr;
})();

/* fundal curat: albastru-noapte foarte închis + stele statice de culori diferite */
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#060a19');
  g.addColorStop(1, '#03050c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const tile = getStarTile(DPR), T = tile.T;
  for (let y = 0; y < H; y += T) {
    for (let x = 0; x < W; x += T) ctx.drawImage(tile.cv, x, y, T, T);
  }
}

/* ---------- desenarea unui corp sferic ---------- */
/* atmosferele vizibile (culoare, intensitate) */
const ATMO = {
  earth: ['#8cc4ff', 0.9], venus: ['#ffe9b8', 0.7], mars: ['#ffb894', 0.3],
  jupiter: ['#fff0d8', 0.3], saturn: ['#fff3d6', 0.28], uranus: ['#d6fbff', 0.5],
  neptune: ['#9ab8ff', 0.55], titan: ['#ffc070', 0.85]
};
/* perioade de rotație (ore); negativ = se rotește invers */
const ROT_H = { sun: 609, mercury: 1407, venus: -5832, earth: 24, moon: 655, jupiter: 9.9, saturn: 10.7, uranus: -17.2, neptune: 16.1, pluto: -153 };
function globeSize(r) {
  const need = r * 2 * DPR;
  const sizes = [32, 64, 128, 192, 288, 416, 512, 768, 1024];   // 768/1024: planete mari pe ecrane mari (proiector)
  for (const s of sizes) if (need <= s * 1.1) return s;
  return 1024;
}
function bodyTurns(b) {
  if (b.id === 'mars') return 0;       // traseele roboților sunt desenate pe fața din față
  return simDays * 24 / (ROT_H[b.id] || 22) * 0.06;
}

function drawBody(b, p, alpha, minPx, kindOverride) {
  const Rpx = b.radius / cam.scale;
  const drawR = Math.max(Rpx, minPx);
  const px = sx(p.x), py = sy(p.y);
  const ext = b.rings ? drawR * 2.4 * (b.ringScale || 1) : drawR;
  if (px < -ext - 60 || px > W + ext + 60 || py < -ext - 60 || py > H + ext + 60) return null;

  ctx.globalAlpha = alpha;
  const isSun = b.id === 'sun';
  const d = Math.hypot(p.x, p.y);
  const ux = d ? -p.x / d : -1, uy = d ? -p.y / d : 0;   // direcția spre Soare

  /* inele — jumătatea din spate */
  if (b.rings && drawR > 4) drawRings(px, py, drawR, b, true, ux, uy);

  if (drawR < 4.5) {
    /* punct mic: jumătate luminată, jumătate în umbră */
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(px, py, drawR, 0, Math.PI * 2); ctx.fill();
    if (!isSun && drawR > 1.6) {
      const a = Math.atan2(-uy, -ux);
      ctx.fillStyle = 'rgba(2,4,12,0.6)';
      ctx.beginPath(); ctx.arc(px, py, drawR + 0.2, a - Math.PI / 2, a + Math.PI / 2); ctx.closePath(); ctx.fill();
    }
  } else if (isSun && drawR < 30) {
    /* Soarele mic: disc cald, fără detalii care s-ar transforma în „pete" */
    const g = ctx.createRadialGradient(px, py, 0, px, py, drawR);
    g.addColorStop(0, '#fff4c8'); g.addColorStop(0.6, '#ffcf55'); g.addColorStop(1, '#f39a24');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, drawR, 0, Math.PI * 2); ctx.fill();
  } else {
    const tex = getGlobe(b, globeSize(drawR), bodyTurns(b), kindOverride);
    if (b.id === 'saturn') {
      ctx.save(); ctx.translate(px, py); ctx.rotate(-18 * DEG);
      ctx.drawImage(tex, -drawR, -drawR, drawR * 2, drawR * 2);
      ctx.restore();
    } else {
      ctx.drawImage(tex, px - drawR, py - drawR, drawR * 2, drawR * 2);
    }
    if (isSun) sunLimb(px, py, drawR);
    else if (drawR > 3.5) lightBody(px, py, drawR, ux, uy, ATMO[b.id]);
  }

  if (b.rings && drawR > 4) drawRings(px, py, drawR, b, false, ux, uy);

  ctx.globalAlpha = 1;
  return { x: px, y: py, r: drawR };
}

/* lumina Soarelui pe o planetă: zi/noapte cu terminator moale, margini mai întunecate,
   și — doar unde există — o atmosferă subțire pe marginea luminată */
function lightBody(px, py, r, ux, uy, atmo) {
  const TAU = Math.PI * 2;
  if (atmo && r > 6) {
    const rgb = hexToRgb(atmo[0]).join(',');
    const g = ctx.createRadialGradient(px + ux * r * 0.1, py + uy * r * 0.1, r * 0.8, px, py, r);
    g.addColorStop(0, 'rgba(' + rgb + ',0)');
    g.addColorStop(1, 'rgba(' + rgb + ',' + (atmo[1] * 0.5) + ')');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
  }
  const l = ctx.createRadialGradient(px, py, r * 0.55, px, py, r);
  l.addColorStop(0, 'rgba(0,0,0,0)');
  l.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = l;
  ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(px + ux * r, py + uy * r, px - ux * r, py - uy * r);
  g.addColorStop(0, 'rgba(255,250,236,0.10)');
  g.addColorStop(0.28, 'rgba(0,0,0,0)');
  g.addColorStop(0.45, 'rgba(2,4,12,0.12)');
  g.addColorStop(0.57, 'rgba(2,4,12,0.62)');
  g.addColorStop(0.7, 'rgba(2,4,12,0.88)');
  g.addColorStop(1, 'rgba(2,4,12,0.94)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, r + 0.3, 0, TAU); ctx.fill();
  if (atmo && r > 10) {
    /* linia subțire a atmosferei, doar pe partea de zi */
    const rgb = hexToRgb(atmo[0]).join(',');
    const s = ctx.createLinearGradient(px + ux * r, py + uy * r, px - ux * r, py - uy * r);
    s.addColorStop(0, 'rgba(' + rgb + ',' + (atmo[1] * 0.75) + ')');
    s.addColorStop(0.55, 'rgba(' + rgb + ',0)');
    ctx.strokeStyle = s;
    ctx.lineWidth = Math.max(1, r * 0.025);
    ctx.beginPath(); ctx.arc(px, py, r + ctx.lineWidth * 0.5, 0, TAU); ctx.stroke();
  }
}

/* Soarele: discul mai întunecat și mai roșiatic spre margine (ca în fotografii) */
function sunLimb(px, py, r) {
  const g = ctx.createRadialGradient(px, py, r * 0.4, px, py, r);
  g.addColorStop(0, 'rgba(255,220,150,0)');
  g.addColorStop(0.75, 'rgba(230,110,20,0.18)');
  g.addColorStop(1, 'rgba(170,55,0,0.55)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
}


/* inelele: textură cu benzi reale (C, B, Cassini, A, Encke) + umbra planetei pe inele */
function drawRings(px, py, r, b, back, ux, uy) {
  const k = b.ringScale || 1;
  const outer = r * 2.25 * k, inner = outer * 0.57;
  const squash = 0.3, tilt = -18 * DEG;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(tilt);
  ctx.scale(1, squash);
  ctx.beginPath();
  if (back) ctx.rect(-outer - 2, -outer - 2, outer * 2 + 4, outer + 2);
  else ctx.rect(-outer - 2, 0, outer * 2 + 4, outer + 2);
  ctx.clip();
  ctx.drawImage(getRingTexture(b.id), -outer, -outer, outer * 2, outer * 2);
  /* umbra planetei: o fâșie spre partea opusă Soarelui, în planul inelelor */
  if (r > 7 && b.id === 'saturn') {
    const ax = -ux, ay = -uy, c = Math.cos(-tilt), s = Math.sin(-tilt);
    let lx = ax * c - ay * s, ly = (ax * s + ay * c) / squash;
    const L = Math.hypot(lx, ly) || 1; lx /= L; ly /= L;
    const nx = -ly, ny = lx;
    ctx.beginPath();
    ctx.arc(0, 0, outer, 0, Math.PI * 2);
    ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath();
    ctx.moveTo(nx * r, ny * r);
    ctx.lineTo(nx * r * 0.9 + lx * outer * 1.1, ny * r * 0.9 + ly * outer * 1.1);
    ctx.lineTo(-nx * r * 0.9 + lx * outer * 1.1, -ny * r * 0.9 + ly * outer * 1.1);
    ctx.lineTo(-nx * r, -ny * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function hexA(hex, a) {
  const c = hexToRgb(hex);
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
}

/* ---------- orbite ---------- */
/* linie fină; puțin mai clară lângă corp și estompată în rest */
function drawOrbit(b, cx, cy, alpha, rgba) {
  const a = b.a / cam.scale;
  if (a < 6) return;
  const e = b.e || 0;
  const bb = a * Math.sqrt(1 - e * e);
  const w = orbitAngleArg(b);
  const ox = cx - a * e * Math.cos(w), oy = cy - a * e * Math.sin(w);
  if (a > 60000) return;
  const sel = selected === b;
  const c = 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',';
  const A = Math.min(1, rgba[3] * (sel ? 1.8 : 1));
  const bp = pos[b.id];
  ctx.globalAlpha = alpha;
  if (ctx.createConicGradient && bp) {
    const th = Math.atan2(sy(bp.y) - oy, sx(bp.x) - ox);
    const g = ctx.createConicGradient(th, ox, oy);
    g.addColorStop(0, c + A + ')');
    g.addColorStop(0.12, c + (A * 0.5) + ')');
    g.addColorStop(0.75, c + (A * 0.5) + ')');
    g.addColorStop(1, c + A + ')');
    ctx.strokeStyle = g;
  } else ctx.strokeStyle = c + (A * 0.7) + ')';
  ctx.lineWidth = sel ? 1.6 : 1;
  ctx.beginPath();
  ctx.ellipse(ox, oy, a, bb, w, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ---------- etichete ---------- */
/* text curat, cu un contur subțire închis; mai mare pe ecrane mari (proiector) */
const labelBoxes = [];
const LABEL_FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif';
function label(text, x, y, size, color, important) {
  if (!showLabels) return;
  const k = clamp(Math.min(W, H) / 760, 0.95, 1.45);
  const fs = Math.max(13, Math.round((size || 13) * k));
  ctx.font = (important ? '700 ' : '600 ') + fs + 'px ' + LABEL_FONT;
  const w = ctx.measureText(text).width;
  /* ținem eticheta în ecran, ca să nu fie tăiată pe telefon */
  x = clamp(x, w / 2 + 6, W - w / 2 - 6);
  y = clamp(y, fs + 54, H - 12);
  const bx = x - w / 2, by = y - fs;
  if (!important) {
    for (const b of labelBoxes) {
      if (bx < b.x + b.w + 6 && bx + w + 6 > b.x && by < b.y + b.h + 4 && by + fs + 4 > b.y) return;
    }
  }
  labelBoxes.push({ x: bx, y: by, w: w, h: fs });
  ctx.save();
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(3,6,16,0.82)';
  ctx.lineWidth = Math.max(2.5, fs * 0.22);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color || 'rgba(235,242,255,0.95)';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* ============================================================
   NIVELUL 1 — SISTEMUL SOLAR
   ============================================================ */
function drawSolarSystem(alpha) {
  const s = cam.scale;

  /* centuri */
  const beltA = alpha * fadeOut(s, 2e12, 8e12) * ramp(s, 4e7, 3e8);
  if (beltA > 0.01) drawBelt(MAIN_BELT, '#a89c8c', beltA * 0.85, 1, 0, null);
  const kuiA = alpha * ramp(s, 2e9, 2e10);
  if (kuiA > 0.01) drawBelt(KUIPER, '#9fb0c4', kuiA * 0.65, 1, 0, null);
  const troA = alpha * fadeOut(s, 2e12, 8e12) * ramp(s, 2e8, 1e9);
  if (troA > 0.01) {
    drawBelt(TROJANS_A, '#b49a76', troA * 0.85, 1.2, 60 * DEG, 'jupiter');
    drawBelt(TROJANS_B, '#b49a76', troA * 0.85, 1.2, -60 * DEG, 'jupiter');
  }

  const cx = sx(0), cy = sy(0);

  /* orbite */
  if (showOrbits) {
    for (const b of PLANETS) drawOrbit(b, cx, cy, alpha * 0.9, [150, 180, 240, 0.34]);
    for (const b of DWARFS) drawOrbit(b, cx, cy, alpha * 0.7, [190, 170, 230, 0.26]);
    for (const b of COMETS) drawOrbit(b, cx, cy, alpha * 0.8, [150, 220, 250, 0.3]);
    for (const b of ASTEROIDS) drawOrbit(b, cx, cy, alpha * 0.5, [200, 190, 170, 0.22]);
    /* orbitele sateliților naturali */
    for (const b of PLANETS.concat(DWARFS)) {
      if (!b.moons) continue;
      const p = pos[b.id];
      for (const m of b.moons) {
        if (m.a / cam.scale > 7) drawOrbit(m, sx(p.x), sy(p.y), alpha * 0.55, [200, 215, 255, 0.3]);
      }
    }
  }

  /* Soarele */
  const sunRpx = SUN.radius / s;
  const sunDraw = Math.max(sunRpx, 7);
  if (cx > -sunDraw - 600 && cx < W + sunDraw + 600 && cy > -sunDraw - 600 && cy < H + sunDraw + 600) {
    const hit = drawBody(SUN, pos.sun, alpha, 7, 'sun');
    if (hit && alpha > 0.3) {
      hitList.push({ x: hit.x, y: hit.y, r: Math.max(hit.r, 16), obj: SUN });
      if (sunDraw > 4) label('Soarele', cx, cy - sunDraw - 10, 15, '#ffd98a', true);
    }
  }

  /* comete (cozile se desenează înaintea nucleului) */
  for (const c of COMETS) {
    const p = pos[c.id];
    const px = sx(p.x), py = sy(p.y);
    drawCometTails(c, p, px, py, alpha);
    const hit = drawBody(c, p, alpha, 2.6);
    if (hit && alpha > 0.3) {
      hitList.push({ x: hit.x, y: hit.y, r: Math.max(hit.r, 14), obj: c });
      if (cam.scale < 3e10) label(c.name, hit.x, hit.y - hit.r - 8, 12, '#bfe9ff');
    }
  }

  /* asteroizi numiți + planete pitice */
  for (const b of ASTEROIDS.concat(DWARFS)) {
    const hit = drawBody(b, pos[b.id], alpha, 2.8);
    if (hit && alpha > 0.3) {
      hitList.push({ x: hit.x, y: hit.y, r: Math.max(hit.r, 14), obj: b });
      if (cam.scale < 4e10) label(b.name, hit.x, hit.y - hit.r - 8, 12, '#e0d6c4');
    }
    drawMoonsOf(b, alpha);
  }

  /* planete + sateliți naturali */
  for (const b of PLANETS) {
    const p = pos[b.id];
    const hit = drawBody(b, p, alpha, 5.2);
    if (hit) {
      if (alpha > 0.25) {
        hitList.push({ x: hit.x, y: hit.y, r: Math.max(hit.r, 18), obj: b });
        label(b.name, hit.x, hit.y - hit.r * (b.rings ? 1.15 : 1) - 11, 15, '#dfe9ff', true);
      }
      /* sateliți artificiali, sonde și roboți din jurul planetei */
      drawHostCraft(b.id, hit, alpha);
    }
    drawMoonsOf(b, alpha);
  }

  /* sonde care orbitează Soarele */
  const scA = alpha * ramp(cam.scale, 6e7, 4e8);
  if (scA > 0.02) {
    for (const s2 of SPACECRAFT) {
      if (s2.around !== 'sun') continue;
      const p = pos[s2.id];
      const px = sx(p.x), py = sy(p.y);
      if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;
      drawCraftMarker(px, py, s2, scA);
      hitList.push({ x: px, y: py, r: 15, obj: s2 });
      label(s2.short || s2.name, px, py - 17, 12, '#ffe9b8');
    }
  }
}

/* coada de praf (curbată, gălbuie, rămâne în urma mișcării) și coada de ioni
   (dreaptă, albăstruie, mereu în direcția opusă Soarelui) */
function drawCometTails(c, p, px, py, alpha) {
  const d = p.r / AU;
  const act = clamp(3.2 / d, 0, 1.6);
  const tailLen = (0.55 * AU * act) / cam.scale;
  if (!(tailLen > 3 && px > -400 && px < W + 400 && py > -400 && py < H + 400)) return;
  const ax = p.x / p.r, ay = p.y / p.r;
  const q = keplerPos(c, simDays + 1);
  let vx = q.x - p.x, vy = q.y - p.y;
  const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
  ctx.save();
  ctx.globalAlpha = alpha;
  /* praf */
  const L = tailLen * 0.9;
  const x1 = px + ax * L * 0.55, y1 = py + ay * L * 0.55;
  const x2 = px + ax * L - vx * L * 0.42, y2 = py + ay * L - vy * L * 0.42;
  const left = [], right = [], N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N, mt = 1 - t;
    const bx = mt * mt * px + 2 * mt * t * x1 + t * t * x2;
    const by = mt * mt * py + 2 * mt * t * y1 + t * t * y2;
    let tx = 2 * mt * (x1 - px) + 2 * t * (x2 - x1), ty = 2 * mt * (y1 - py) + 2 * t * (y2 - y1);
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const wd = Math.max(1, L * (0.012 + 0.12 * Math.pow(t, 0.85)));
    left.push([bx - ty * wd, by + tx * wd]); right.push([bx + ty * wd, by - tx * wd]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (const pt of left) ctx.lineTo(pt[0], pt[1]);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  let g = ctx.createLinearGradient(px, py, x2, y2);
  g.addColorStop(0, 'rgba(255,238,205,0.45)');
  g.addColorStop(0.45, 'rgba(255,228,190,0.16)');
  g.addColorStop(1, 'rgba(255,220,180,0)');
  ctx.fillStyle = g; ctx.fill();
  /* ioni */
  const ex = px + ax * tailLen * 1.2, ey = py + ay * tailLen * 1.2;
  const nx = -ay, ny = ax, w0 = 0.8, w1 = Math.max(1.5, tailLen * 0.035);
  ctx.beginPath();
  ctx.moveTo(px + nx * w0, py + ny * w0);
  ctx.lineTo(ex + nx * w1, ey + ny * w1);
  ctx.lineTo(ex - nx * w1, ey - ny * w1);
  ctx.lineTo(px - nx * w0, py - ny * w0);
  ctx.closePath();
  g = ctx.createLinearGradient(px, py, ex, ey);
  g.addColorStop(0, 'rgba(160,210,255,0.6)');
  g.addColorStop(0.4, 'rgba(130,185,255,0.2)');
  g.addColorStop(1, 'rgba(120,170,255,0)');
  ctx.fillStyle = g; ctx.fill();
  /* coama: norul mic de gaz din jurul nucleului */
  const cr = clamp(3 + act * 4 + tailLen * 0.01, 3, 40);
  g = ctx.createRadialGradient(px, py, 0, px, py, cr);
  g.addColorStop(0, 'rgba(225,245,255,0.55)');
  g.addColorStop(1, 'rgba(190,230,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, cr, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* sateliții naturali ai unei planete sau planete pitice */
function drawMoonsOf(b, alpha) {
  if (!b.moons) return;
  for (const m of b.moons) {
    if (m.a / cam.scale < 6) continue;
    const mh = drawBody(m, pos[m.id], alpha, 2.4);
    if (mh && alpha > 0.3) {
      hitList.push({ x: mh.x, y: mh.y, r: Math.max(mh.r, 12), obj: m });
      label(m.name, mh.x, mh.y - mh.r - 8, 12, '#cfe0ff');
    }
  }
}

/* sateliți artificiali și roboți — distanțe exagerate ca să fie vizibili */
function drawHostCraft(hostId, hostHit, alpha) {
  const a = alpha * ramp(hostHit.r, 9, 26);
  if (a < 0.03) return;
  const ks = { iss: 1.5, tiangong: 1.72, hubble: 1.95, starlink: 2.25, chandra: 2.6 };
  for (const s of SPACECRAFT) {
    if (s.around !== hostId) continue;

    /* roboți pe suprafață: pictogramă care seamănă cu robotul, pe traseul lui */
    if (s.kind === 'rover') {
      drawRover(s, hostHit, a);
      continue;
    }

    const k = ks[s.id] || 2;
    const rr = hostHit.r * k;
    const ang = s.phase * DEG + (2 * Math.PI * simDays) / s.P;
    const isSel = selected === s;
    ctx.globalAlpha = a * (isSel ? 0.95 : 0.5);
    ctx.strokeStyle = isSel ? '#ffd166' : 'rgba(190,215,255,0.5)';
    ctx.lineWidth = isSel ? 2.4 : 1;
    if (isSel) { ctx.setLineDash([8, 6]); ctx.lineDashOffset = -performance.now() / 60; }
    ctx.beginPath(); ctx.arc(hostHit.x, hostHit.y, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    if (s.kind === 'swarm') {
      for (let i = 0; i < 16; i++) {
        const aa = ang * 0.6 + (i / 16) * Math.PI * 2;
        const px = hostHit.x + Math.cos(aa) * rr * (0.97 + (i % 3) * 0.03);
        const py = hostHit.y + Math.sin(aa) * rr * (0.97 + (i % 3) * 0.03);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (i === 0) {
          hitList.push({ x: px, y: py, r: 13, obj: s });
          label(s.short, px, py - 10, 12, '#9fe6c0');
        }
      }
      continue;
    }
    const px = hostHit.x + Math.cos(ang) * rr;
    const py = hostHit.y + Math.sin(ang) * rr;
    drawCraftMarker(px, py, s, a);
    hitList.push({ x: px, y: py, r: s.id === 'iss' ? 30 : 14, obj: s });
    label(s.short || s.name, px, py - 12, 12, '#ffffff');
  }
}


/* ---------- roboții de pe Marte: traseu + pictogramă ---------- */
function roverPoly(s) {
  if (s._poly) return s._poly;
  const P = s.trail, pts = [];
  const g = (i) => P[Math.max(0, Math.min(P.length - 1, i))];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < 12; k++) {
      const t = k / 12, t2 = t * t, t3 = t2 * t;
      const f = (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t +
        (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
        (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      pts.push([f(0), f(1)]);
    }
  }
  pts.push(P[P.length - 1]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  s._poly = { pts: pts, cum: cum, len: cum[cum.length - 1] };
  return s._poly;
}

/* progresul pe traseu (0..1): robotul merge înainte și înapoi */
function roverProgress(s) {
  const ph = (simDays / (s.P * 0.6) + s.phase / 360) % 2;
  const u = ph < 1 ? ph : 2 - ph;
  return u * u * (3 - 2 * u);   // pornește și se oprește lin
}

function roverAt(s, u) {
  const poly = roverPoly(s), d = u * poly.len;
  let i = 1;
  while (i < poly.cum.length - 1 && poly.cum[i] < d) i++;
  const seg = (poly.cum[i] - poly.cum[i - 1]) || 1;
  const k = clamp((d - poly.cum[i - 1]) / seg, 0, 1);
  const A = poly.pts[i - 1], B = poly.pts[i];
  return { x: lerp(A[0], B[0], k), y: lerp(A[1], B[1], k), ang: Math.atan2(B[1] - A[1], B[0] - A[0]) };
}

function drawRover(s, hostHit, alpha) {
  const R = hostHit.r;
  const poly = roverPoly(s);
  const isSel = selected === s;
  const cx = hostHit.x, cy = hostHit.y;
  const u = roverProgress(s);
  const me = roverAt(s, u);
  const X = (p) => cx + p[0] * R, Y = (p) => cy + p[1] * R;

  /* traseul */
  ctx.save();
  ctx.globalAlpha = alpha * (isSel ? 1 : 0.7);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = isSel ? 6 : 4;
  ctx.beginPath();
  poly.pts.forEach((p, i) => i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p)));
  ctx.stroke();
  ctx.strokeStyle = hexA(s.color, 0.98); ctx.lineWidth = isSel ? 3 : 2;
  ctx.setLineDash(isSel ? [8, 6] : [4, 5]);
  ctx.lineDashOffset = isSel ? -performance.now() / 55 : 0;
  ctx.stroke();
  ctx.setLineDash([]);
  if (isSel) {
    /* porțiunea deja parcursă, plină */
    const done = Math.max(2, Math.round(u * (poly.pts.length - 1)));
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(done, poly.pts.length - 1); i++) {
      const p = poly.pts[i]; i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p));
    }
    ctx.stroke();
    /* oprirea 'aterizare' și 'ținta' */
    const A = poly.pts[0], B = poly.pts[poly.pts.length - 1];
    ctx.fillStyle = '#7dffb0'; ctx.beginPath(); ctx.arc(X(A), Y(A), 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff7a8a'; ctx.beginPath(); ctx.arc(X(B), Y(B), 5, 0, 7); ctx.fill();
    if (s.icon === 'heli') {
      for (const p of s.trail) {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(X(p), Y(p), 3, 0, 7); ctx.fill();
      }
    }
    ctx.globalAlpha = alpha;
    label(s.startLabel || 'Aterizare', X(A), Y(A) + 18, 12, '#7dffb0', true);
    label(s.endLabel || 'Acum încolo', X(B), Y(B) - 14, 12, '#ff9aa6', true);
  }
  ctx.restore();

  /* pictograma */
  const size = clamp(R * 0.34, 32, 66);
  const px = X([me.x, me.y]), py = Y([me.x, me.y]);
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(px, py, 0, px, py, size * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, size * 0.95, 0, 7); ctx.fill();
  drawRoverIcon(px, py, size, s, me.ang);
  ctx.restore();
  hitList.push({ x: px, y: py, r: Math.max(size * 0.75, 16), obj: s });
  if (s.icon === 'heli') label(s.short || s.name, px, py + size * 0.95, 12, hexA(s.color, 0.97));
  else label(s.short || s.name, px, py - size * 0.8, 12, hexA(s.color, 0.97));
}

function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

/* rover văzut din lateral (sau elicopter), desenat cu ~46 de pixeli lățime */
function drawRoverIcon(px, py, size, s, ang) {
  const u = size / 46;                      // unitate de desen
  const flip = Math.cos(ang) < 0 ? -1 : 1;  // se uită în direcția de mers
  ctx.save();
  ctx.translate(px, py); ctx.scale(u * flip, u);
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#1b1f2b';

  if (s.icon === 'heli') {
    const t = performance.now() / 1000;
    /* picioare */
    ctx.strokeStyle = '#2a2f3d'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(-10, 13); ctx.moveTo(6, 5); ctx.lineTo(10, 13);
    ctx.moveTo(-12, 13); ctx.lineTo(-7, 13); ctx.moveTo(7, 13); ctx.lineTo(12, 13); ctx.stroke();
    /* corp */
    ctx.fillStyle = '#e8eef5'; ctx.strokeStyle = '#1b1f2b'; ctx.lineWidth = 1.2;
    roundRectPath(-6, -4, 12, 10, 2); ctx.fill(); ctx.stroke();
    /* panou solar */
    ctx.fillStyle = '#1d3c78';
    roundRectPath(-8, -13, 16, 7, 1); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#5f8be0'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-3, -13); ctx.lineTo(-3, -6); ctx.moveTo(3, -13); ctx.lineTo(3, -6); ctx.stroke();
    /* elicele (două, în contra-rotație) */
    ctx.strokeStyle = '#1b1f2b'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, -17); ctx.stroke();
    const w1 = 22 * Math.abs(Math.cos(t * 19)), w2 = 22 * Math.abs(Math.cos(t * 17 + 1));
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(-w1 / 2, -17.6, w1, 1.8);
    ctx.fillStyle = 'rgba(190,230,255,0.8)';
    ctx.fillRect(-w2 / 2, -20.4, w2, 1.8);
    ctx.restore();
    return;
  }

  const tan = s.id === 'curiosity';
  const body = tan ? '#d8c3a2' : '#f1f3f6';
  const dark = '#2a2f3d';
  /* mastul cu „capul” și camera */
  ctx.strokeStyle = dark; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(10, -16); ctx.stroke();
  ctx.fillStyle = body; ctx.strokeStyle = '#1b1f2b'; ctx.lineWidth = 1.1;
  roundRectPath(6.5, -21, 9, 6, 1.5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(13, -18, 1.5, 0, 7); ctx.fill();
  /* generator radioactiv în spate (Curiosity) sau mic (Perseverance) */
  ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-17, -9); ctx.lineTo(-17, -3); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
  /* corpul */
  ctx.fillStyle = body;
  roundRectPath(-11, -6, 24, 11, 2.5); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(-11, -1); ctx.lineTo(13, -1); ctx.stroke();
  /* brațul */
  ctx.strokeStyle = dark; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(13, 1); ctx.lineTo(19, 4); ctx.lineTo(21, 9); ctx.stroke();
  /* suspensia și 6 roți */
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-9, 5); ctx.lineTo(-13, 11); ctx.moveTo(-9, 5); ctx.lineTo(0, 11);
  ctx.moveTo(8, 5); ctx.lineTo(0, 11); ctx.moveTo(8, 5); ctx.lineTo(13, 11); ctx.stroke();
  const spin = simDays * 6;
  for (const wx of [-13, 0, 13]) {
    ctx.fillStyle = '#9aa3b2'; ctx.strokeStyle = '#1b1f2b'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(wx, 12, 4.2, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a2f3d'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(wx + Math.cos(spin) * 3.4, 12 + Math.sin(spin) * 3.4);
    ctx.lineTo(wx - Math.cos(spin) * 3.4, 12 - Math.sin(spin) * 3.4); ctx.stroke();
  }
  ctx.restore();
}

/* ISS: lungul „fermă” cu 4 perechi de panouri solare, module și radiatoare */
function drawIssIcon(px, py, alpha, rot) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(px, py); ctx.rotate(rot); ctx.scale(1.5, 1.5);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 26);
  g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
  /* panourile solare: 2 perechi la fiecare capăt */
  for (const sx_ of [-1, 1]) for (const off of [11, 19]) {
    for (const sy_ of [-1, 1]) {
      ctx.fillStyle = '#1f4fa8'; ctx.strokeStyle = '#8fb4ff'; ctx.lineWidth = 0.6;
      ctx.fillRect(sx_ * off - 3, sy_ > 0 ? 1.5 : -13.5, 6, 12);
      ctx.strokeRect(sx_ * off - 3, sy_ > 0 ? 1.5 : -13.5, 6, 12);
      ctx.beginPath(); ctx.moveTo(sx_ * off, sy_ > 0 ? 1.5 : -13.5); ctx.lineTo(sx_ * off, sy_ > 0 ? 13.5 : -1.5); ctx.stroke();
    }
  }
  /* ferma */
  ctx.fillStyle = '#d6dae3'; ctx.fillRect(-23, -1, 46, 2);
  /* module (perpendicular pe fermă) */
  ctx.fillStyle = '#f3f4f7'; ctx.strokeStyle = '#4a5160'; ctx.lineWidth = 0.7;
  ctx.fillRect(-2.2, -9, 4.4, 18); ctx.strokeRect(-2.2, -9, 4.4, 18);
  ctx.fillStyle = '#c9ced9'; ctx.fillRect(-5, -2.2, 10, 4.4); ctx.strokeRect(-5, -2.2, 10, 4.4);
  /* radiatoare */
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-1, -13, 2, 4); ctx.fillRect(-1, 9, 2, 4);
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* sondele, desenate mic dar cu forma lor reală (antene, panouri, scuturi) */
function drawCraftMarker(px, py, s, alpha) {
  if (s.id === 'iss') { drawIssIcon(px, py, alpha, 0); return; }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(px, py);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const edge = 'rgba(10,14,26,0.9)';
  const panel = (x, y, w, h) => {
    ctx.fillStyle = '#23468f'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#7fa6e6'; ctx.lineWidth = 0.6; ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    if (w > h) for (let i = 1; i < 4; i++) { ctx.moveTo(x + w * i / 4, y); ctx.lineTo(x + w * i / 4, y + h); }
    else for (let i = 1; i < 4; i++) { ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + w, y + h * i / 4); }
    ctx.stroke();
  };
  const dish = (x, y, rx, ry, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#9aa3b2');
    ctx.fillStyle = g; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  const box = (x, y, w, h, col) => {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#fff0b0'); g.addColorStop(0.5, col || '#d9a63a'); g.addColorStop(1, '#8a5a14');
    ctx.fillStyle = g; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  };
  const id = s.id;
  if (id === 'jwst') {
    /* scutul solar în formă de romb, oglinda aurie din 18 hexagoane */
    ctx.fillStyle = '#b9a9d6'; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-13, 3); ctx.lineTo(0, -1); ctx.lineTo(13, 3); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-9, 3); ctx.lineTo(0, 0.5); ctx.lineTo(9, 3); ctx.stroke();
    for (const [hx, hy] of [[0, -6], [-3, -7.7], [3, -7.7], [-3, -4.3], [3, -4.3], [0, -9.4], [0, -2.6]]) {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.lineTo(hx + Math.cos(a) * 1.9, hy + Math.sin(a) * 1.9); }
      ctx.closePath(); ctx.fillStyle = '#f2c14e'; ctx.fill(); ctx.strokeStyle = '#8a6412'; ctx.lineWidth = 0.4; ctx.stroke();
    }
  } else if (id === 'parker') {
    /* scutul termic gros, alb, cu sonda ascunsă în umbra lui */
    panel(-9, 3, 6, 3); panel(3, 3, 6, 3);
    box(-2.5, -1, 5, 7, '#c9c9c9');
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(0, -3, 8, 2.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (id === 'juno-probe') {
    /* trei panouri solare lungi, la 120° */
    for (let k = 0; k < 3; k++) {
      ctx.save(); ctx.rotate(k * Math.PI * 2 / 3 - Math.PI / 2); panel(3, -1.8, 11, 3.6); ctx.restore();
    }
    ctx.fillStyle = '#d0d4dc'; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.lineTo(Math.cos(a) * 3.6, Math.sin(a) * 3.6); } ctx.closePath(); ctx.fill(); ctx.stroke();
    dish(0, 0, 2.4, 2.4);
  } else if (id === 'clipper') {
    panel(-15, -2, 11, 4); panel(4, -2, 11, 4);
    box(-3, -3.5, 6, 7, '#c8ccd4');
    dish(0, -5, 4.2, 1.6);
  } else if (id === 'lucy') {
    /* două panouri solare rotunde, uriașe */
    for (const sx_ of [-1, 1]) {
      ctx.fillStyle = '#23468f'; ctx.strokeStyle = '#7fa6e6'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.arc(sx_ * 9, 0, 5.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = k * Math.PI / 5; ctx.moveTo(sx_ * 9 + Math.cos(a) * 5.4, Math.sin(a) * 5.4); ctx.lineTo(sx_ * 9 - Math.cos(a) * 5.4, -Math.sin(a) * 5.4); } ctx.stroke();
    }
    box(-3, -3, 6, 6);
    dish(0, -4.5, 3, 1.2);
  } else if (id === 'newhorizons') {
    /* corp triunghiular auriu, antenă mare, generator pe braț */
    ctx.strokeStyle = '#3a3f4c'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(10, 6); ctx.stroke();
    ctx.fillStyle = '#2b2f3a'; ctx.fillRect(9, 4.5, 4, 3);
    ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(6, 5); ctx.lineTo(0, -3); ctx.closePath();
    const g = ctx.createLinearGradient(-6, -3, 6, 5); g.addColorStop(0, '#ffe7a0'); g.addColorStop(1, '#b07a1a');
    ctx.fillStyle = g; ctx.strokeStyle = edge; ctx.lineWidth = 0.8; ctx.fill(); ctx.stroke();
    dish(0, -4, 6, 2.2);
  } else if (id === 'voyager1' || id === 'voyager2') {
    /* antena albă mare, corpul zece-laturi, brațul magnetometrului și generatorul */
    ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-15, 7); ctx.moveTo(0, 2); ctx.lineTo(10, 7); ctx.stroke();
    ctx.fillStyle = '#3a3f4c'; ctx.fillRect(8.5, 6, 4, 2.6);
    ctx.fillStyle = '#7d8696'; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; ctx.lineTo(Math.cos(a) * 3.2, 2 + Math.sin(a) * 1.6); } ctx.closePath(); ctx.fill(); ctx.stroke();
    dish(0, -2.5, 7, 2.6);
    ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -2.5); ctx.lineTo(0, -6); ctx.stroke();
  } else if (s.kind === 'telescope') {
    /* telescop: tub argintiu cu panouri solare (ca Hubble) */
    panel(-4, -12, 8, 6); panel(-4, 6, 8, 6);
    const g = ctx.createLinearGradient(0, -4, 0, 4); g.addColorStop(0, '#f4f6fa'); g.addColorStop(0.5, '#b8c0cc'); g.addColorStop(1, '#6b7482');
    ctx.fillStyle = g; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.fillRect(-10, -4, 20, 8); ctx.strokeRect(-10, -4, 20, 8);
    ctx.fillStyle = '#1a1e28'; ctx.fillRect(10, -3.4, 1.6, 6.8);
  } else if (s.kind === 'station') {
    /* stație: module în formă de T și două perechi de panouri */
    panel(-15, -9, 6, 18); panel(9, -9, 6, 18);
    ctx.fillStyle = '#d9dce3'; ctx.fillRect(-9, -0.8, 18, 1.6);
    const g = ctx.createLinearGradient(0, -3, 0, 3); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#9aa3b2');
    ctx.fillStyle = g; ctx.strokeStyle = edge; ctx.lineWidth = 0.8;
    ctx.fillRect(-6, -2.6, 12, 5.2); ctx.strokeRect(-6, -2.6, 12, 5.2);
    ctx.fillRect(-2, -8, 4, 6); ctx.strokeRect(-2, -8, 4, 6);
  } else {
    panel(-12, -1.6, 8, 3.2); panel(4, -1.6, 8, 3.2);
    box(-3.5, -3, 7, 6);
    dish(0, -4.5, 4.4, 1.6);
  }
  ctx.restore();
}

/* ============================================================
   NIVELUL 2 — VECINII SOARELUI
   ============================================================ */
function drawStarField(alpha) {
  for (const st of STARS) {
    const d = st.dist * LY;
    const x = Math.cos(st.ang * DEG) * d, y = Math.sin(st.ang * DEG) * d;
    const px = sx(x), py = sy(y);
    if (px < -60 || px > W + 60 || py < -60 || py > H + 60) continue;
    const r = st.size * 1.25;
    ctx.globalAlpha = alpha;
    const R = r * 3.4;
    ctx.drawImage(getGlowSprite(st.color, true), px - R, py - R, R * 2, R * 2);
    ctx.globalAlpha = 1;
    hitList.push({ x: px, y: py, r: Math.max(r * 2, 16), obj: st });
    label(st.name, px, py - r * 2.4 - 6, 13, hexA(st.color, 0.95));
  }
  /* marcajul Soarelui */
  const cx = sx(0), cy = sy(0);
  if (cx > -50 && cx < W + 50 && cy > -50 && cy < H + 50) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(getGlowSprite('#ffd27a', true), cx - 22, cy - 22, 44, 44);
    ctx.globalAlpha = 1;
    hitList.push({ x: cx, y: cy, r: 18, obj: SUN });
    label('Soarele (noi)', cx, cy - 16, 14, '#ffe08a', true);
  }
}

/* ============================================================
   NIVELUL 3 — CALEA LACTEE
   ============================================================ */
const MW_RADIUS = 5.0e20;                 // ≈ 53.000 ani-lumină
const MW_CENTER = { x: -8.178 * KPC, y: 0 };

function drawMilkyWay(alpha) {
  const rpx = MW_RADIUS / cam.scale;
  const px = sx(MW_CENTER.x), py = sy(MW_CENTER.y);
  /* când suntem „în interiorul" galaxiei, imaginea ei se estompează */
  if (rpx > 1400) {
    alpha *= clamp((3800 - rpx) / 2400, 0, 1);
    if (alpha < 0.02) return;
  }
  if (rpx < 5) {
    /* prea mică: rămâne doar un reper „aici suntem noi" */
    if (rpx < 0.2 || px < 0 || px > W || py < 0 || py > H) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(getGlowSprite('#e6ecff', true), px - 10, py - 10, 20, 20);
    ctx.strokeStyle = 'rgba(160,220,255,0.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    hitList.push({ x: px, y: py, r: 18, obj: byId('milkyway') });
    label('Calea Lactee (noi)', px, py - 20, 13, '#dfe6ff', true);
    return;
  }
  if (px + rpx < -50 || px - rpx > W + 50 || py + rpx < -50 || py - rpx > H + 50) return;
  ctx.globalAlpha = alpha;
  const tex = getGalaxyTexture('milkyway', '#cfd8ff', 'fourarm');
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(0.6);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(tex, -rpx, -rpx, rpx * 2, rpx * 2);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  hitList.push({ x: px, y: py, r: Math.max(rpx * 0.25, 20), obj: byId('milkyway') });
  if (rpx > 30) label('Calea Lactee', px, py - rpx * 0.55, 16, '#dfe6ff', true);
}

function drawGalacticObjects(alpha) {
  for (const o of GALACTIC) {
    const d = o.dist * KPC;
    const x = MW_CENTER.x + Math.cos(o.ang * DEG) * 0 + Math.cos(o.ang * DEG) * d;
    const y = Math.sin(o.ang * DEG) * d;
    /* obiectele sunt date relativ la Soare (origine) */
    const wx = Math.cos(o.ang * DEG) * d, wy = Math.sin(o.ang * DEG) * d;
    const px = sx(wx), py = sy(wy);
    const rad = (o.size * LY) / 2 / cam.scale;
    const drawR = Math.max(rad, o.kind === 'blackhole' ? 9 : 7);
    if (px < -drawR * 3 - 40 || px > W + drawR * 3 + 40 || py < -drawR * 3 - 40 || py > H + drawR * 3 + 40) continue;
    ctx.globalAlpha = alpha;
    const tex = getNebulaTexture(o.id, o.color, o.kind);
    ctx.save();
    ctx.translate(px, py);
    if (o.kind !== 'blackhole') ctx.globalCompositeOperation = 'lighter';
    const R = drawR * 1.7;
    ctx.drawImage(tex, -R, -R, R * 2, R * 2);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    hitList.push({ x: px, y: py, r: Math.max(drawR, 16), obj: o });
    label(o.name, px, py - drawR * 1.5 - 6, 13, hexA(o.color, 0.95));
  }
}

/* ============================================================
   NIVELUL 4 — UNIVERSUL ÎNDEPĂRTAT
   ============================================================ */
const BG_GALAXIES = (function () {
  const rng = makeRng(99887766);
  const n = 420, arr = [];
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const d = (3 + Math.pow(rng(), 0.6) * 160) * MPC;
    arr.push({
      x: Math.cos(a) * d, y: Math.sin(a) * d,
      r: (8 + rng() * 55) * 1000 * LY,
      rot: rng() * Math.PI,
      sq: 0.3 + rng() * 0.7,
      hue: rng(),
      shape: rng() > 0.55 ? 'twoarm' : 'elliptical',
      seed: i
    });
  }
  return arr;
})();

const COSMIC_WEB = (function () {
  const rng = makeRng(55443322);
  const nodes = [];
  for (let i = 0; i < 260; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.55) * 900 * MPC;
    nodes.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, m: 0.3 + rng() });
  }
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    const cand = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      cand.push({ j: j, d: dx * dx + dy * dy });
    }
    cand.sort((a, b) => a.d - b.d);
    for (let k = 0; k < 3; k++) if (cand[k] && i < cand[k].j) links.push([i, cand[k].j]);
  }
  return { nodes: nodes, links: links };
})();

function drawDeepSpace(alpha) {
  /* galaxii de fundal */
  const bgA = alpha * ramp(cam.scale, 2e20, 2e21);
  if (bgA > 0.02) {
    for (const g of BG_GALAXIES) {
      const px = sx(g.x), py = sy(g.y);
      const rpx = g.r / cam.scale;
      if (rpx < 0.8) continue;
      if (px < -60 || px > W + 60 || py < -60 || py > H + 60) continue;
      ctx.globalAlpha = bgA * clamp(rpx / 3, 0.25, 1);
      ctx.globalCompositeOperation = 'lighter';
      ctx.save(); ctx.translate(px, py); ctx.rotate(g.rot); ctx.scale(1, g.sq);
      if (rpx > 7) {
        const tex = getGalaxyTexture('bg' + (g.seed % 14), g.hue > 0.5 ? '#dbe4ff' : '#ffe8d8', g.shape);
        ctx.drawImage(tex, -rpx, -rpx, rpx * 2, rpx * 2);
      } else {
        const rr = Math.max(rpx, 0.9) * 1.7;
        ctx.drawImage(getGlowSprite(g.hue > 0.5 ? '#e4eaff' : '#fff0e0', true), -rr, -rr, rr * 2, rr * 2);
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }

  /* pânza cosmică: filamente subțiri între roiuri de galaxii */
  const webA = alpha * ramp(cam.scale, 3e21, 2e22);
  if (webA > 0.02) {
    ctx.globalAlpha = webA * 0.55;
    ctx.strokeStyle = 'rgba(150,175,230,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const l of COSMIC_WEB.links) {
      const a = COSMIC_WEB.nodes[l[0]], b = COSMIC_WEB.nodes[l[1]];
      ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y));
    }
    ctx.stroke();
    ctx.globalAlpha = webA;
    const spr = getGlowSprite('#e8eeff', true);
    for (const n of COSMIC_WEB.nodes) {
      const px = sx(n.x), py = sy(n.y);
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
      const r = (0.9 + n.m * 2.1) * 2.2;
      ctx.drawImage(spr, px - r, py - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
}

/* galaxiile și structurile cu nume — vizibile și când zbori aproape de ele */
function drawDeepNamed(alpha) {
  for (const o of DEEPSPACE) {
    if (o.id === 'milkyway') continue;
    const d = o.dist * MPC;
    const wx = Math.cos(o.ang * DEG) * d, wy = Math.sin(o.ang * DEG) * d;
    const px = sx(wx), py = sy(wy);
    const rpx = (o.size * 1000 * LY) / 2 / cam.scale;
    if (o.kind !== 'web' && rpx < 1.4) continue;   // prea mic la scara asta
    const drawR = clamp(rpx, 6, Math.max(W, H) * 0.9);

    /* structurile uriașe (superroiuri, pânza cosmică): doar un contur discret */
    if (o.kind === 'web') {
      if (rpx < 26) continue;
      ctx.save();
      ctx.globalAlpha = alpha * 0.45;
      ctx.strokeStyle = hexA(o.color, 0.5);
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px, py, drawR, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      const ly = py - Math.min(drawR, H * 0.42);
      hitList.push({ x: px, y: ly + 10, r: 22, obj: o });
      label(o.name, px, ly, 14, hexA(o.color, 0.95), true);
      continue;
    }

    if (px < -drawR * 3 - 50 || px > W + drawR * 3 + 50 || py < -drawR * 3 - 50 || py > H + drawR * 3 + 50) continue;
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.translate(px, py);
    if (o.kind === 'galaxy') {
      const tex = getGalaxyTexture(o.id, o.color, galaxyShapeFor(o));
      ctx.rotate(o.ang * DEG * 0.7);
      if (o.id === 'sombrero') ctx.scale(1, 0.32);
      if (o.id === 'andromeda') ctx.scale(1, 0.55);
      ctx.drawImage(tex, -drawR, -drawR, drawR * 2, drawR * 2);
    } else {
      const tex = getNebulaTexture(o.id, o.color, o.kind === 'web' ? 'cluster' : o.kind);
      const R = drawR * 1.6;
      ctx.drawImage(tex, -R, -R, R * 2, R * 2);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    hitList.push({ x: px, y: py, r: Math.max(drawR * 0.6, 16), obj: o });
    label(o.name, px, py - drawR * 0.7 - 8, 13, hexA(o.color, 0.95));
  }
}

/* ============================================================
   CADRU
   ============================================================ */
let lastT = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  if (playing) simDays += speed * dt;

  /* animația de zbor */
  if (camTarget) {
    camTarget.t += dt / camTarget.dur;
    const k = camTarget.t >= 1 ? 1 : (1 - Math.pow(1 - camTarget.t, 3));
    cam.x = lerp(camTarget.x0, camTarget.x1, k);
    cam.y = lerp(camTarget.y0, camTarget.y1, k);
    cam.scale = Math.exp(lerp(Math.log(camTarget.s0), Math.log(camTarget.s1), k));
    if (camTarget.t >= 1) { camTarget = null; }
    syncZoomSlider();
  }

  /* pe ecran mic, când e deschisă o fișă, mutăm imaginea mai sus */
  let wantShift = 0;
  if (W <= 860) {
    const openSheet = $('#info').classList.contains('open') ? $('#info')
      : ($('#catalog').classList.contains('open') ? $('#catalog') : null);
    if (openSheet) {
      const top = openSheet.getBoundingClientRect().top;
      /* centrul zonei rămase libere, între bara de sus și marginea fișei */
      wantShift = clamp((58 + top) / 2 - H / 2, -H * 0.42, 0);
    }
  }
  viewShift += (wantShift - viewShift) * Math.min(1, dt * 7);

  computePositions();

  /* harta cerului cu constelații */
  if (skyMode) {
    hitList = [];
    labelBoxes.length = 0;
    drawSky(W, H, ctx, hitList, showLabels, selected);
    drawSelectionRing();
    updateHud();
    requestAnimationFrame(frame);
    return;
  }

  /* urmărirea unui obiect */
  if (followId && !camTarget) {
    const p = objWorldPos(followId);
    if (p) { cam.x = p.x; cam.y = p.y; }
  }

  hitList = [];
  labelBoxes.length = 0;

  drawBackground();

  const s = cam.scale;
  const aDeep = ramp(s, 1.2e20, 7e20);
  const aGal = ramp(s, 1.2e16, 9e16) * fadeOut(s, 3e20, 1.2e21);
  const aStars = ramp(s, 1.5e12, 9e12) * fadeOut(s, 4e16, 2.2e17);
  const aSolar = fadeOut(s, 5e12, 3.5e13);

  const aGalObj = ramp(s, 1.5e14, 6e14) * fadeOut(s, 3e20, 1.2e21);
  const aDeepNamed = ramp(s, 4e17, 2e18);

  if (aDeep > 0.01) drawDeepSpace(aDeep);
  if (aDeepNamed > 0.01) drawDeepNamed(aDeepNamed);
  if (aGal > 0.01 || aDeep > 0.01) drawMilkyWay(Math.max(aGal, aDeep * 0.9));
  if (aGalObj > 0.01) drawGalacticObjects(aGalObj);
  if (aStars > 0.01) drawStarField(aStars);
  if (aSolar > 0.01) drawSolarSystem(aSolar);

  drawSelectionRing();
  updateHud();

  requestAnimationFrame(frame);
}

function drawSelectionRing() {
  if (!selected) return;
  const h = hitList.find((e) => e.obj === selected);
  if (!h) return;
  const r = Math.max(h.r * 1.45, 16);
  const t = performance.now() / 1000;
  ctx.save();
  ctx.strokeStyle = 'rgba(130,215,255,0.85)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 7]);
  ctx.lineDashOffset = -t * 6;
  ctx.beginPath(); ctx.arc(h.x, h.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

/* ============================================================
   CĂUTAREA OBIECTELOR
   ============================================================ */
const ALL_OBJECTS = (function () {
  const list = [SUN];
  for (const p of PLANETS) { list.push(p); if (p.moons) for (const m of p.moons) list.push(m); }
  return list.concat(DWARFS, COMETS, ASTEROIDS, SPACECRAFT, STARS, GALACTIC, DEEPSPACE);
})();

function byId(id) { return ALL_OBJECTS.find((o) => o.id === id); }

function objWorldPos(id) {
  const o = byId(id);
  if (!o) return null;
  if (o.kind === 'rover' && o.trail && pos[o.around]) {
    /* camera stă pe robot, nu pe centrul planetei */
    const hb = byId(o.around), hp = pos[o.around], m = roverAt(o, roverProgress(o));
    return { x: hp.x + m.x * hb.radius, y: hp.y + m.y * hb.radius };
  }
  if (pos[id]) return pos[id];
  if (o.dist !== undefined) {
    let d;
    if (STARS.indexOf(o) >= 0) d = o.dist * LY;
    else if (GALACTIC.indexOf(o) >= 0) d = o.dist * KPC;
    else d = o.dist * MPC;
    if (o.id === 'milkyway') return { x: MW_CENTER.x, y: MW_CENTER.y };
    return { x: Math.cos(o.ang * DEG) * d, y: Math.sin(o.ang * DEG) * d };
  }
  return { x: 0, y: 0 };
}

function objViewScale(o) {
  const minDim = Math.min(W, H);
  if (o.radius) {
    if (o.id === 'sun') return clamp(o.radius * 7 / minDim, MIN_SCALE, MAX_SCALE);
    return clamp(o.radius * 7 / minDim, MIN_SCALE, MAX_SCALE);
  }
  if (SPACECRAFT.indexOf(o) >= 0) {
    if (o.kind === 'rover') {
      const hostB = byId(o.around);
      return clamp((hostB ? hostB.radius : 3.39e6) * 2.1 / minDim, MIN_SCALE, MAX_SCALE);
    }
    if (o.around && o.around !== 'sun') {
      const host = byId(o.around);
      return clamp((host ? host.radius : 6.371e6) * 26 / minDim, MIN_SCALE, MAX_SCALE);
    }
    return clamp(o.r * 2.6 / minDim, MIN_SCALE, MAX_SCALE);
  }
  if (STARS.indexOf(o) >= 0) return clamp(Math.max(o.dist * LY * 1.2 / minDim, 2e13), MIN_SCALE, MAX_SCALE);
  if (GALACTIC.indexOf(o) >= 0) return clamp(Math.max(o.size * LY * 2.6 / minDim, 3e14), MIN_SCALE, MAX_SCALE);
  if (o.id === 'milkyway') return clamp(MW_RADIUS * 3.4 / minDim, MIN_SCALE, MAX_SCALE);
  if (o.kind === 'web') return clamp(o.size * 1000 * LY * 1.1 / minDim, MIN_SCALE, MAX_SCALE);
  return clamp(Math.max(o.size * 1000 * LY * 2.6 / minDim, 5e17), MIN_SCALE, MAX_SCALE);
}

function flyTo(o, opts) {
  opts = opts || {};
  const p = objWorldPos(o.id);
  if (!p) return;
  const s1 = opts.scale || objViewScale(o);
  camTarget = {
    x0: cam.x, y0: cam.y, s0: cam.scale,
    x1: p.x, y1: p.y, s1: s1,
    t: 0, dur: opts.dur || 1.5
  };
  followId = o.radius || SPACECRAFT.indexOf(o) >= 0 ? o.id : null;
  select(o);
}

/* ============================================================
   INTERFAȚĂ
   ============================================================ */
/* ---------- fotografii reale ---------- */
function loadPhotoCredits() {
  fetch('photos/credits.json', { cache: 'no-cache' })
    .then((r) => r.ok ? r.json() : null)
    .then((j) => { PHOTO_CREDITS = j || {}; if (selected) showPhoto(selected); })
    .catch(() => { PHOTO_CREDITS = {}; });
}

function showPhoto(o) {
  const wrap = $('#info-photo'), img = $('#info-photo-img'), cap = $('#info-photo-cap');
  const info = PHOTO_CREDITS && PHOTO_CREDITS[o.id];
  const file = info ? info.file : (o.id + '.jpg');
  img.onload = null; img.onerror = null;
  wrap.style.display = 'none';
  const want = 'photos/' + file;
  img.alt = 'Fotografie: ' + o.name;
  img.onerror = function () { if (img.getAttribute('src') === want) wrap.style.display = 'none'; };
  img.onload = function () { if (img.getAttribute('src') === want) wrap.style.display = 'block'; };
  img.setAttribute('src', want);
  const isFig = CONSTELLATIONS.indexOf(o) >= 0;
  const word = isFig ? 'Desen vechi' : 'Foto';
  let credit = word + ': NASA / ESA';
  if (info) {
    const a = (info.artist || '').trim();
    credit = word + ': ' + (a || 'NASA') + (info.license ? ' · ' + info.license : '');
  }
  cap.textContent = credit;
}

function select(o) {
  selected = o;
  if (!o) {
    followId = null;
    $('#info').classList.remove('open');
    return;
  }
  showPhoto(o);
  $('#info-name').textContent = o.name;
  $('#info-type').textContent = o.type || '';
  $('#info-desc').textContent = o.desc || '';
  const tb = $('#info-facts');
  tb.innerHTML = '';
  (o.facts || []).forEach(([k, v]) => {
    const row = document.createElement('div');
    row.className = 'fact';
    row.innerHTML = '<span class="fk"></span><span class="fv"></span>';
    row.querySelector('.fk').textContent = k;
    row.querySelector('.fv').textContent = v;
    tb.appendChild(row);
  });
  $('#info-fun').textContent = o.fun || '';
  $('#info-fun-wrap').style.display = o.fun ? 'flex' : 'none';
  const note = $('#info-note');
  if (SPACECRAFT.indexOf(o) >= 0 && o.kind === 'rover') {
    note.style.display = 'block';
    note.textContent = 'Notă: robotul și traseul lui sunt desenate schematic și mult mai mari decât în realitate. Atinge robotul ca să vezi drumul pe care merge.';
  } else if (SPACECRAFT.indexOf(o) >= 0 && o.around && o.around !== 'sun') {
    note.style.display = 'block';
    note.textContent = 'Notă: orbitele sateliților sunt desenate mai mari decât în realitate, ca să poată fi văzute.';
  } else { note.style.display = 'none'; }
  $('#info').classList.add('open');
  $('#btn-follow').textContent = followId === o.id ? 'Nu mai urmări' : 'Urmărește';
  $('#btn-follow').style.display = (o.radius || SPACECRAFT.indexOf(o) >= 0) ? '' : 'none';
  $('#btn-zoomto').style.display = skyMode ? 'none' : '';
  updateLiveInfo();
}

/* ---------- informații care se schimbă în timp ---------- */
function updateLiveInfo() {
  const box = $('#info-live');
  const o = selected;
  if (!o || !box) return;
  const rows = [];
  const p = pos[o.id];
  if (p && o.id !== 'earth') {
    const e = pos.earth;
    const d = Math.hypot(p.x - e.x, p.y - e.y);
    rows.push(['Distanța față de Pământ acum', fmtDist(d)]);
    rows.push(['Lumina face până acolo', fmtLight(d)]);
  } else if (o.dist !== undefined && o.dist > 0) {
    let m;
    if (STARS.indexOf(o) >= 0) m = o.dist * LY;
    else if (GALACTIC.indexOf(o) >= 0) m = o.dist * KPC;
    else m = o.dist * MPC;
    rows.push(['Distanța', fmtDist(m)]);
    rows.push(['Lumina face până aici', fmtLight(m)]);
  }
  if (o.rsun) {
    rows.push(['Mărimea față de Soare', o.rsun >= 1
      ? 'de ' + String(o.rsun).replace('.', ',') + ' ori mai mare'
      : 'de ' + Math.round(1 / o.rsun) + ' ori mai mică']);
  }
  if (o.radius && o.id !== 'earth' && o.id !== 'sun' && !o.rsun) {
    const k = o.radius / 6.371e6;
    rows.push(['Mărimea față de Pământ', k >= 1
      ? 'de ' + (Math.round(k * 10) / 10).toString().replace('.', ',') + ' ori mai mare'
      : 'de ' + Math.round(1 / k) + ' ori mai mică']);
  }
  if (o.P && kidAge > 0 && (PLANETS.indexOf(o) >= 0 || DWARFS.indexOf(o) >= 0)) {
    const yrs = kidAge * 365.256 / o.P;
    const txt = yrs >= 1
      ? (Math.round(yrs * 10) / 10).toString().replace('.', ',') + ' ani'
      : Math.max(1, Math.round(yrs * 12)) + ' luni';
    rows.push(['Vârsta ta pe ' + o.name, txt]);
  }
  if (!rows.length) { box.style.display = 'none'; return; }
  box.style.display = 'flex';
  box.innerHTML = '';
  for (const [k, v] of rows) {
    const row = document.createElement('div');
    row.className = 'fact live';
    row.innerHTML = '<span class="fk"></span><span class="fv"></span>';
    row.querySelector('.fk').textContent = k;
    row.querySelector('.fv').textContent = v;
    box.appendChild(row);
  }
}

function fmtLight(m) {
  const s = m / 299792458;
  if (s < 90) return Math.round(s) + ' secunde';
  if (s < 5400) return (s / 60).toFixed(1).replace('.', ',') + ' minute';
  if (s < 172800) return (s / 3600).toFixed(1).replace('.', ',') + ' ore';
  if (s < 3.156e7) return Math.round(s / 86400) + ' zile';
  const y = s / 3.156e7;
  if (y < 1000) return y.toFixed(1).replace('.0', '').replace('.', ',') + ' ani';
  return Math.round(y).toLocaleString('ro-RO') + ' ani';
}


function pickAt(mx, my) {
  let best = null, bestD = 1e9;
  for (const h of hitList) {
    const d = Math.hypot(h.x - mx, h.y - my);
    const lim = Math.max(h.r, 15);
    if (d < lim && d < bestD) { bestD = d; best = h.obj; }
  }
  return best;
}

/* ---------- HUD ---------- */
const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

function fmtDate() {
  const d = new Date(EPOCH.getTime() + simDays * 86400000);
  const y = d.getFullYear();
  if (y < -100000 || y > 1e6) return (y > 0 ? 'anul ' : 'cu ') + Math.round(y).toLocaleString('ro-RO');
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + y;
}

function fmtDist(m) {
  if (m < 1e4) return Math.round(m) + ' m';
  if (m < 1e9) return (m / 1000).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' km';
  if (m < 0.05 * AU) return (m / 1e9).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' mil. km';
  if (m < 0.1 * LY) return (m / AU).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' UA';
  if (m < 800 * LY) return (m / LY).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' ani-lumină';
  if (m < 0.6 * MPC) return (m / (1000 * LY)).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' mii de ani-lumină';
  return (m / (1e6 * LY)).toLocaleString('ro-RO', { maximumFractionDigits: 1 }) + ' mil. ani-lumină';
}

function levelName() {
  if (skyMode) return 'Cerul nopții';
  const s = cam.scale;
  if (s < 2e7) return 'Aproape de planetă';
  if (s < 4e13) return 'Sistemul Solar';
  if (s < 2.2e17) return 'Vecinii Soarelui';
  if (s < 1.2e21) return 'Calea Lactee';
  return 'Universul îndepărtat';
}

let hudT = 0;
function updateHud() {
  const now = performance.now();
  if (now - hudT < 120) return;
  hudT = now;
  $('#date').textContent = fmtDate();
  $('#level').textContent = levelName();
  $('#fov').textContent = skyMode
    ? 'Câmp vizual ' + Math.round(sky.fov) + '° · cerul văzut de pe Pământ'
    : 'Lățimea ecranului: ' + fmtDist(W * cam.scale);
  $('#speed-val').textContent = speedLabel();
  if (selected && $('#info').classList.contains('open')) updateLiveInfo();
}

function speedLabel() {
  if (!playing) return 'pauză';
  const d = speed;
  if (d < 0.9) return (d * 24).toFixed(1).replace('.0', '') + ' ore/sec';
  if (d < 20) return d.toFixed(d < 3 ? 1 : 0).replace('.0', '') + ' zile/sec';
  if (d < 700) return (d / 30.4).toFixed(1).replace('.0', '') + ' luni/sec';
  if (d < 400000) return (d / 365.25).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' ani/sec';
  return (d / 365250).toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' mii de ani/sec';
}

/* ---------- zoom ---------- */
function zoomAt(factor, mx, my) {
  camTarget = null;
  const old = cam.scale;
  const ns = clamp(old * factor, MIN_SCALE, MAX_SCALE);
  if (ns === old) return;
  if (mx !== undefined && !followId) {
    cam.x += (mx - W / 2) * (old - ns);
    cam.y += (my - H / 2 - viewShift) * (old - ns);
  }
  cam.scale = ns;
  syncZoomSlider();
}

const zSlider = () => $('#zoom');
function syncZoomSlider() {
  const t = (Math.log(cam.scale) - Math.log(MIN_SCALE)) / (Math.log(MAX_SCALE) - Math.log(MIN_SCALE));
  zSlider().value = String(Math.round((1 - t) * 1000));
}

/* ---------- redimensionare ---------- */
function resize() {
  const small = Math.min(window.innerWidth, window.innerHeight) < 620;
  DPR = Math.min(window.devicePixelRatio || 1, small ? 2 : 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  BELT_STEP = small ? 2 : 1;
  STAR_STEP = small ? 2 : 1;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* ============================================================
   EVENIMENTE
   ============================================================ */
function setupEvents() {
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 250));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

  /* mouse */
  let dragging = false, moved = 0, lastX = 0, lastY = 0;
  const activePtrs = new Set();     // degetele aflate pe ecran
  let multiTouch = false;           // true cât timp s-a folosit pinch
  canvas.addEventListener('pointercancel', (e) => { activePtrs.delete(e.pointerId); dragging = false; });
  canvas.addEventListener('pointerdown', (e) => {
    activePtrs.add(e.pointerId);
    if (activePtrs.size > 1) multiTouch = true;
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || activePtrs.size > 1) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 4) {
      if (skyMode) { skyPan(dx, dy); return; }
      camTarget = null; followId = null;
      cam.x -= dx * cam.scale; cam.y -= dy * cam.scale;
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    activePtrs.delete(e.pointerId);
    dragging = false;
    if (multiTouch) { if (activePtrs.size === 0) multiTouch = false; return; }
    if (moved <= 4) {
      const r = canvas.getBoundingClientRect();
      const o = pickAt(e.clientX - r.left, e.clientY - r.top);
      if (quiz.on) { quizAnswer(o); return; }
      if (o) {
        followId = (!skyMode && (o.radius || SPACECRAFT.indexOf(o) >= 0)) ? o.id : null;
        select(o);
      } else select(null);
    }
  });
  canvas.addEventListener('dblclick', (e) => {
    const r = canvas.getBoundingClientRect();
    const o = pickAt(e.clientX - r.left, e.clientY - r.top);
    if (o) flyTo(o);
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = Math.exp(e.deltaY * 0.0022);
    if (skyMode) { sky.fov = clamp(sky.fov * f, 10, 165); return; }
    const r = canvas.getBoundingClientRect();
    zoomAt(f, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  /* atingere: pinch */
  let pinchD = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY);
      if (pinchD > 0) {
        const r = canvas.getBoundingClientRect();
        zoomAt(pinchD / d, (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left,
          (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top);
      }
      pinchD = d;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { pinchD = 0; }, { passive: true });

  /* butoane */
  $('#btn-play').addEventListener('click', togglePlay);
  $('#btn-zoom-in').addEventListener('click', () => zoomAt(0.6));
  $('#btn-zoom-out').addEventListener('click', () => zoomAt(1 / 0.6));
  $('#btn-orbits').addEventListener('click', (e) => {
    showOrbits = !showOrbits; e.currentTarget.classList.toggle('off', !showOrbits);
  });
  $('#btn-labels').addEventListener('click', (e) => {
    showLabels = !showLabels; e.currentTarget.classList.toggle('off', !showLabels);
  });
  $('#btn-home-view').addEventListener('click', () => {
    followId = null;
    camTarget = { x0: cam.x, y0: cam.y, s0: cam.scale, x1: 0, y1: 0, s1: 9e8, t: 0, dur: 1.4 };
    select(null);
  });
  $('#btn-full').addEventListener('click', toggleFullscreen);
  $('#btn-sky').addEventListener('click', () => setSkyMode(!skyMode));
  $('#btn-quiz').addEventListener('click', () => { if (quiz.on) quizStop(); else quizStart(); });
  $('#quiz-close').addEventListener('click', quizStop);
  $('#quiz-skip').addEventListener('click', () => { if (quiz.on) quizNext(); });
  const ageInput = $('#kid-age');
  ageInput.value = kidAge || '';
  ageInput.addEventListener('input', () => {
    kidAge = Math.max(0, Math.min(120, Number(ageInput.value) || 0));
    localStorage.setItem('kidAge', String(kidAge));
    updateLiveInfo();
  });
  $('#btn-menu').addEventListener('click', () => $('#catalog').classList.toggle('open'));
  $('#catalog-close').addEventListener('click', () => $('#catalog').classList.remove('open'));
  $('#info-close').addEventListener('click', () => select(null));
  $('#btn-zoomto').addEventListener('click', () => { if (selected) flyTo(selected); });
  $('#btn-follow').addEventListener('click', () => {
    if (!selected) return;
    followId = followId === selected.id ? null : selected.id;
    $('#btn-follow').textContent = followId === selected.id ? 'Nu mai urmări' : 'Urmărește';
  });

  /* viteză */
  const sp = $('#speed');
  sp.addEventListener('input', () => {
    const t = Number(sp.value) / 1000;
    speed = Math.exp(lerp(Math.log(0.02), Math.log(2e6), t));
    if (!playing) togglePlay();
  });
  sp.value = String(Math.round(1000 * (Math.log(speed / 0.02) / Math.log(2e6 / 0.02))));

  /* zoom slider */
  zSlider().addEventListener('input', () => {
    camTarget = null;
    const t = 1 - Number(zSlider().value) / 1000;
    cam.scale = Math.exp(lerp(Math.log(MIN_SCALE), Math.log(MAX_SCALE), t));
  });

  /* taste */
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key) {
      case ' ': e.preventDefault(); togglePlay(); break;
      case '+': case '=': zoomAt(0.65); break;
      case '-': case '_': zoomAt(1 / 0.65); break;
      case 'ArrowLeft': followId = null; cam.x -= 60 * cam.scale; break;
      case 'ArrowRight': followId = null; cam.x += 60 * cam.scale; break;
      case 'ArrowUp': followId = null; cam.y -= 60 * cam.scale; break;
      case 'ArrowDown': followId = null; cam.y += 60 * cam.scale; break;
      case 'l': case 'L': showLabels = !showLabels; $('#btn-labels').classList.toggle('off', !showLabels); break;
      case 'o': case 'O': showOrbits = !showOrbits; $('#btn-orbits').classList.toggle('off', !showOrbits); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': select(null); $('#catalog').classList.remove('open'); $('#help').classList.remove('open'); break;
      case 'n': case 'N': tourNext(); break;
      case 'c': case 'C': setSkyMode(!skyMode); break;
      case 'g': case 'G': if (quiz.on) quizStop(); else quizStart(); break;
    }
  });
}

/* iconițele din sprite-ul SVG din index.html */
function uiIcon(n) { return '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }

function togglePlay() {
  playing = !playing;
  $('#btn-play').innerHTML = uiIcon(playing ? 'pause' : 'play');
  $('#btn-play').title = playing ? 'Pauză' : 'Pornește';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
  else document.exitFullscreen().catch(() => { });
}

/* ============================================================
   MODUL „CERUL NOPȚII"
   ============================================================ */
function skyPan(dx, dy) {
  const scale = (Math.min(W, H) * 0.5) / (2 * Math.tan((sky.fov * Math.PI / 180) / 4));
  const degPerPx = (180 / Math.PI) / scale;
  const cd = Math.max(0.18, Math.cos(sky.dec * DEG));
  sky.ra = (sky.ra + (dx * degPerPx) / 15 / cd + 24) % 24;
  sky.dec = clamp(sky.dec + dy * degPerPx, -89, 89);
}

function setSkyMode(on) {
  skyMode = on;
  document.body.classList.toggle('sky-mode', on);
  $('#btn-sky').classList.toggle('tgl', on);
  $('#btn-sky').querySelector('.ico').innerHTML = uiIcon(on ? 'planet' : 'sparkle');
  $('#btn-sky').querySelector('.t').textContent = on ? 'În spațiu' : 'Cerul nopții';
  select(null);
  if (quiz.on) quizStop();
}

/* ============================================================
   JOCUL „GĂSEȘTE!"
   ============================================================ */
const quiz = { on: false, target: null, score: 0, round: 0, total: 10, locked: false };

/* doar obiecte ușor de recunoscut de un copil */
const QUIZ_OK = new Set(['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'moon', 'phobos', 'deimos', 'io', 'europa', 'ganymede', 'callisto',
  'titan', 'enceladus', 'triton', 'charon', 'pluto', 'ceres', 'eris', 'vesta', 'bennu',
  'halley', 'churyumov', 'halebopp', 'iss', 'hubble', 'jwst', 'tiangong', 'voyager1',
  'voyager2', 'perseverance', 'curiosity', 'ingenuity', 'parker', 'sirius', 'betelgeuse',
  'rigel', 'vega', 'polaris', 'alphacen', 'proxima', 'aldebaran', 'antares', 'orion-neb',
  'crab', 'eagle', 'pleiades', 'carina', 'sgrA', 'milkyway', 'andromeda', 'lmc', 'smc',
  'whirlpool', 'sombrero', 'triangulum', 'virgo']);

function quizCandidates() {
  const seen = new Set();
  return hitList.filter((h) => {
    const o = h.obj;
    if (!o || !o.name || seen.has(o.id)) return false;
    if (h.r < 4 || (h.weak && !skyMode)) return false;
    if (h.x < 40 || h.x > W - 40 || h.y < 80 || h.y > H - 90) return false;
    if (skyMode) {
      /* pe cer întrebăm constelații și stele cunoscute */
      if (CONSTELLATIONS.indexOf(o) < 0 && STARS.indexOf(o) < 0) return false;
    } else if (!QUIZ_OK.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

function quizStart() {
  quiz.on = true; quiz.score = 0; quiz.round = 0; quiz.locked = false;
  $('#quiz').classList.add('open');
  select(null);
  quizNext();
}

function quizStop() {
  quiz.on = false; quiz.target = null;
  $('#quiz').classList.remove('open');
}

function quizNext() {
  quiz.locked = false;
  if (quiz.round >= quiz.total) {
    $('#quiz-q').textContent = 'Gata! Ai găsit ' + quiz.score + ' din ' + quiz.total + '.';
    $('#quiz-score').textContent = quiz.score + ' / ' + quiz.total;
    $('#quiz-feedback').textContent = quiz.score >= 8 ? 'Ești un adevărat astronom! 🏆'
      : (quiz.score >= 5 ? 'Bravo! Mai încearcă o dată. ⭐' : 'Hai să mai explorăm puțin și reîncercăm!');
    quiz.target = null;
    return;
  }
  const cands = quizCandidates();
  if (cands.length < 3) {
    $('#quiz-q').textContent = 'Dă zoom până se văd mai multe obiecte pe ecran…';
    $('#quiz-feedback').textContent = '';
    quiz.target = null;
    setTimeout(() => { if (quiz.on && !quiz.target) quizNext(); }, 1200);
    return;
  }
  quiz.round++;
  quiz.target = cands[Math.floor(Math.random() * cands.length)].obj;
  const q = 'Găsește: ' + quiz.target.name;
  $('#quiz-q').textContent = q;
  $('#quiz-score').textContent = quiz.score + ' / ' + quiz.total;
  $('#quiz-feedback').textContent = 'Întrebarea ' + quiz.round + ' din ' + quiz.total;
}

/* în modul „cerul nopții" e corect și dacă dă click pe o stea a constelației */
function quizMatches(o, t) {
  if (!o || !t) return false;
  if (o.id === t.id) return true;
  if (t.stars) {
    if (String(o.id).indexOf('skystar-' + t.id + '|') === 0) return true;
    return t.stars.some((st) => st[0].toLowerCase() === String(o.name).toLowerCase());
  }
  return false;
}

function quizAnswer(o) {
  if (!quiz.target || quiz.locked) return;
  if (quizMatches(o, quiz.target)) {
    quiz.locked = true;
    quiz.score++;
    $('#quiz-feedback').textContent = '✅ Bravo! Ai găsit ' + quiz.target.name + '.';
    $('#quiz-score').textContent = quiz.score + ' / ' + quiz.total;
    setTimeout(() => { if (quiz.on) quizNext(); }, 1400);
  } else {
    $('#quiz-feedback').textContent = o
      ? '❌ Acela e ' + o.name + '. Mai încearcă!'
      : '❌ Acolo nu e nimic. Mai încearcă!';
  }
}

/* ============================================================
   CATALOG
   ============================================================ */
function buildCatalog() {
  const groups = [
    ['Soarele și planetele', [SUN].concat(PLANETS)],
    ['Sateliți naturali', PLANETS.filter((p) => p.moons).reduce((a, p) => a.concat(p.moons), [])],
    ['Planete pitice', DWARFS],
    ['Comete', COMETS],
    ['Asteroizi', ASTEROIDS],
    ['Sateliți și sonde (acum)', SPACECRAFT],
    ['Stele', STARS],
    ['Nebuloase, roiuri, gaura neagră', GALACTIC],
    ['Galaxii și structuri uriașe', DEEPSPACE],
    ['Constelații (cerul de pe Pământ)', CONSTELLATIONS]
  ];
  const wrap = $('#catalog-body');
  wrap.innerHTML = '';
  const search = $('#catalog-search');
  const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (search && !search._wired) {
    search._wired = true;
    search.addEventListener('input', () => {
      const q = norm(search.value.trim());
      let any = false;
      wrap.querySelectorAll('.cat-group').forEach((g) => {
        let n = 0;
        g.querySelectorAll('.chip').forEach((c) => { const ok = !q || norm(c.textContent).includes(q); c.hidden = !ok; if (ok) n++; });
        g.hidden = n === 0; if (n) any = true;
      });
      const em = $('#catalog-empty'); if (em) em.hidden = any;
    });
  }
  for (const [title, items] of groups) {
    const grp = document.createElement('section');
    grp.className = 'cat-group';
    const h = document.createElement('h3');
    h.textContent = title;
    const cnt = document.createElement('span'); cnt.className = 'cat-n'; cnt.textContent = items.length; h.appendChild(cnt);
    grp.appendChild(h);
    wrap.appendChild(grp);
    const box = document.createElement('div');
    box.className = 'chips';
    for (const o of items) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = o.short || o.name;
      b.addEventListener('click', () => {
        if (CONSTELLATIONS.indexOf(o) >= 0) {
          if (!skyMode) setSkyMode(true);
          skyGoTo(o);
          select(o);
        } else {
          if (skyMode) setSkyMode(false);
          flyTo(o);
        }
        if (window.innerWidth < 900) $('#catalog').classList.remove('open');
      });
      box.appendChild(b);
    }
    grp.appendChild(box);
  }
}

/* ============================================================
   TUR GHIDAT
   ============================================================ */
const TOUR = [
  { id: 'sun', say: 'Pornim de la Soare, steaua noastră. Totul în jur se învârte în jurul lui.' },
  { id: 'mercury', say: 'Mercur — cel mai aproape de Soare și cel mai mic.' },
  { id: 'venus', say: 'Venus — cea mai fierbinte, cu nori de acid.' },
  { id: 'earth', say: 'Pământul — casa noastră. Dă zoom și o să vezi Luna și sateliții.' },
  { id: 'moon', say: 'Luna — singurul loc din spațiu pe care au pășit oameni.' },
  { id: 'iss', say: 'Stația Spațială Internațională: chiar acum, oameni trăiesc acolo sus.' },
  { id: 'mars', say: 'Marte — Planeta Roșie, unde lucrează roboții noștri.' },
  { id: 'perseverance', say: 'Perseverance — un robot cât o mașină, care caută urme de viață veche pe Marte.' },
  { id: 'jupiter', say: 'Jupiter — uriașul, cu Marea Pată Roșie și 95 de sateliți.' },
  { id: 'europa', say: 'Europa — un ocean de apă ascuns sub gheață.' },
  { id: 'saturn', say: 'Saturn și inelele lui de gheață.' },
  { id: 'titan', say: 'Titan — cu fluvii și lacuri, dar de metan.' },
  { id: 'uranus', say: 'Uranus — planeta care stă culcată.' },
  { id: 'neptune', say: 'Neptun — ultima planetă, cu cele mai puternice vânturi.' },
  { id: 'pluto', say: 'Pluto — planeta pitică de la marginea Sistemului Solar.' },
  { id: 'halley', say: 'Cometa Halley — se întoarce în 2061!' },
  { id: 'voyager1', say: 'Voyager 1 — cel mai departe obiect trimis de oameni.' },
  { id: 'alphacen', say: 'Alpha Centauri — cel mai apropiat sistem stelar, la 4,4 ani-lumină.' },
  { id: 'betelgeuse', say: 'Betelgeuse — un uriaș roșu care va exploda.' },
  { id: 'orion-neb', say: 'Nebuloasa Orion — aici se nasc stele chiar acum.' },
  { id: 'pleiades', say: 'Pleiadele, sau Cloșca cu pui — stele surori.' },
  { id: 'sgrA', say: 'Sagittarius A* — gaura neagră din centrul galaxiei noastre.' },
  { id: 'milkyway', say: 'Calea Lactee — galaxia noastră, cu sute de miliarde de stele.' },
  { id: 'andromeda', say: 'Andromeda — vine spre noi și ne vom uni în 4 miliarde de ani.' },
  { id: 'virgo', say: 'Roiul Fecioarei — mii de galaxii împreună.' },
  { id: 'cosmicweb', say: 'Pânza cosmică — Universul la cea mai mare scară. Fiecare punct e o galaxie.' },
  { id: 'ursamajor', say: 'Acum ne întoarcem pe Pământ și ne uităm în sus: Carul Mare, pe care îl poți găsi diseară.' },
  { id: 'orion', say: 'Orion, vânătorul — cel mai ușor de recunoscut pe cerul de iarnă, după cele trei stele din centură.' },
  { id: 'cassiopeia', say: 'Cassiopeia, litera W de pe cer, de partea cealaltă a Stelei Polare față de Carul Mare.' }
];
let tourIdx = -1;

function tourGo(i) {
  if (i < 0 || i >= TOUR.length) { tourEnd(); return; }
  tourIdx = i;
  const stop = TOUR[i];
  const c = CONSTELLATIONS.find((x) => x.id === stop.id);
  if (c) {
    if (!skyMode) setSkyMode(true);
    skyGoTo(c); select(c);
  } else {
    if (skyMode) setSkyMode(false);
    const o = byId(stop.id);
    if (o) flyTo(o, { dur: 1.8 });
  }
  $('#tour').classList.add('open');
  $('#tour-text').textContent = stop.say;
  $('#tour-count').textContent = 'Oprirea ' + (i + 1) + ' din ' + TOUR.length;
  const tp = $('#tour-progress'); if (tp) tp.style.width = ((i + 1) / TOUR.length * 100) + '%';
  $('#tour-prev').disabled = i === 0;
}
function tourNext() { if (tourIdx >= 0) tourGo(tourIdx + 1); }
function tourPrev() { if (tourIdx > 0) tourGo(tourIdx - 1); }
function tourEnd() { tourIdx = -1; $('#tour').classList.remove('open'); }

/* ============================================================
   PORNIRE
   ============================================================ */
function startApp() {
  $('#home').classList.add('hidden');
  $('#app').classList.remove('hidden');
  resize();
  syncZoomSlider();
  if (!startApp.started) {
    startApp.started = true;
    requestAnimationFrame(frame);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  resize();
  buildCatalog();
  setupEvents();
  loadPhotoCredits();
  $('#start-space').addEventListener('click', startApp);
  $('#btn-menu-home').addEventListener('click', () => {
    $('#home').classList.remove('hidden');
    $('#app').classList.add('hidden');
  });
  $('#btn-tour').addEventListener('click', () => tourGo(0));
  $('#tour-next').addEventListener('click', tourNext);
  $('#tour-prev').addEventListener('click', tourPrev);
  $('#tour-close').addEventListener('click', tourEnd);
  $('#btn-help').addEventListener('click', () => $('#help').classList.toggle('open'));
  $('#help-close').addEventListener('click', () => $('#help').classList.remove('open'));
  document.querySelectorAll('.soon').forEach((el) => {
    el.addEventListener('click', () => {
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 500);
    });
  });
});

/* service worker (dezactivat cu ?nosw=1, util când modifici codul) */
if ('serviceWorker' in navigator && !location.search.includes('nosw')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { });
    /* când apare o versiune nouă, reîncarcă o singură dată */
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded || !navigator.serviceWorker.controller) return;
      reloaded = true; location.reload();
    });
  });
}
