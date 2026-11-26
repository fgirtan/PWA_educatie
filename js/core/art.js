/* ============================================================
   ART — biblioteca comună de desen pentru module
   Scopul: desene ilustrate, nu schematice. Lumină moale, umbre,
   gradienți, contururi curbe, etichete lizibile, mișcare cu easing.
   Toate funcțiile primesc ctx ca prim argument și NU lasă starea
   ctx modificată (save/restore intern).
   ============================================================ */
(function () {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- paletă comună (aceleași culori în toate modulele) ---------- */
  const C = {
    ink: '#0b1020', night: '#070b18', deep: '#0d1530',
    text: '#f4f7ff', dim: 'rgba(226,234,255,0.72)',
    blood: '#e8394f', bloodHi: '#ff7a88', vein: '#3d63e0', veinHi: '#8aa8ff',
    skin: '#f2b8a0', bone: '#efe6d2', boneShade: '#b9ab8c',
    fire: '#ff7a2f', flame: '#ffc94a', lava: '#ff5a1f',
    sky: '#5aa8f0', skyHi: '#bfe3ff', grass: '#4caf50', grassDk: '#2e7d32', soil: '#7a5536', rock: '#8a8f99',
    water: '#2a8fd8', waterDk: '#0b3d78', sand: '#e9cf8f',
    metal: '#aab4c4', metalDk: '#5b6577', copper: '#d0843f', gold: '#ffcf4a',
    electric: '#5ee7ff', spark: '#fff6b0', good: '#4ade80', bad: '#ff5a6a',
    space: '#8b7bff', body: '#ff6b8a', how: '#ffb43d', earth: '#35c3a0'
  };

  /* ---------- easing ---------- */
  const ease = {
    inOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    elastic: (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1,
    sine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t)
  };
  /* apropiere lină (independentă de framerate): v = Art.damp(v, țintă, 8, dt) */
  const damp = (v, target, k, dt) => lerp(v, target, 1 - Math.exp(-k * dt));
  /* arc (spring) — st = {x, v}; returnează x */
  function spring(st, target, dt, k, d) { k = k || 120; d = d || 14; const a = (target - st.x) * k - st.v * d; st.v += a * dt; st.x += st.v * dt; return st.x; }

  /* ---------- zgomot lin (pentru mișcări organice) ---------- */
  const P = new Uint8Array(512); (function () { const p = []; for (let i = 0; i < 256; i++) p[i] = i; let s = 1337; for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; })();
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); const g = (h, d) => ((P[h & 255] & 1) ? d : -d) * (0.5 + (P[(h + 77) & 255] / 255) * 0.5); return lerp(g(i, f), g(i + 1, f - 1), u) * 2; }
  function noise2(x, y) { const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, xf = x - Math.floor(x), yf = y - Math.floor(y); const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const gr = (h, dx, dy) => { const k = h & 3; return (k & 1 ? -dx : dx) + (k & 2 ? -dy : dy); }; const aa = P[P[X] + Y], ab = P[P[X] + Y + 1], ba = P[P[X + 1] + Y], bb = P[P[X + 1] + Y + 1]; return lerp(lerp(gr(aa, xf, yf), gr(ba, xf - 1, yf), u), lerp(gr(ab, xf, yf - 1), gr(bb, xf - 1, yf - 1), u), v); }
  /* tremur organic pentru un obiect: Art.wobble(t, seed, amplitudine) */
  const wobble = (t, seed, amp) => noise1(t * 0.9 + seed * 13.7) * (amp || 1);

  /* ---------- culori ---------- */
  function hex(c) { if (c[0] !== '#') return null; let h = c.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(c, a) { const r = hex(c); return r ? 'rgba(' + r[0] + ',' + r[1] + ',' + r[2] + ',' + a + ')' : c; }
  function mix(c1, c2, t) { const a = hex(c1), b = hex(c2); if (!a || !b) return c1; return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  const shade = (c, t) => t >= 0 ? mix(c, '#ffffff', t) : mix(c, '#000000', -t);

  /* ---------- fundaluri (scene) ---------- */
  /* fundal cu lumină moale + vignetă; opts: {top, bottom, glow:[x,y,r,color], vignette} */
  function backdrop(ctx, W, H, o) {
    o = o || {};
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#121a38'); g.addColorStop(1, o.bottom || '#05070f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glows = o.glows || (o.glow ? [o.glow] : []);
    for (const gl of glows) { const r = ctx.createRadialGradient(gl[0], gl[1], 0, gl[0], gl[1], gl[2]); r.addColorStop(0, gl[3]); r.addColorStop(1, rgba('#000000', 0)); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); }
    if (o.vignette !== false) vignette(ctx, W, H, o.vignette || 0.55);
    ctx.restore();
  }
  function vignette(ctx, W, H, a) { ctx.save(); const r = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,' + (a === undefined ? 0.55 : a) + ')'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  /* cer de zi cu soare/nori; t = timp; opts: {sun:[x,y], top, bottom} */
  function daySky(ctx, W, H, o) {
    o = o || {}; ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#3f8fe0'); g.addColorStop(1, o.bottom || '#cfe9ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (o.sun) { const [sx, sy] = o.sun, r = Math.min(W, H) * 0.5; const s = ctx.createRadialGradient(sx, sy, 0, sx, sy, r); s.addColorStop(0, 'rgba(255,250,220,0.95)'); s.addColorStop(0.08, 'rgba(255,236,170,0.7)'); s.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = s; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }
  /* stele (deterministe) — pentru scene de spațiu */
  const _stars = {};
  function stars(ctx, W, H, t, o) {
    o = o || {}; const n = o.n || Math.round(Math.min(260, W * H / 5200)); const key = n + '_' + Math.round(W) + '_' + Math.round(H);
    if (!_stars[key]) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; _stars[key] = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, r: Math.pow(rnd(), 3) * 1.6 + 0.35, p: rnd() * TAU, s: 0.4 + rnd() * 1.6, h: rnd() })); }
    ctx.save();
    for (const st of _stars[key]) { const a = (o.alpha || 1) * (0.45 + 0.55 * Math.abs(Math.sin((t || 0) * st.s + st.p))); ctx.fillStyle = st.h < 0.15 ? 'rgba(170,200,255,' + a + ')' : st.h > 0.92 ? 'rgba(255,215,170,' + a + ')' : 'rgba(255,255,255,' + a + ')'; ctx.beginPath(); ctx.arc(st.x + (o.dx || 0) * st.r % W, st.y, st.r, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  /* nor pufos */
  function cloud(ctx, x, y, s, a) {
    ctx.save(); ctx.globalAlpha = a === undefined ? 0.9 : a;
    const g = ctx.createLinearGradient(0, y - s, 0, y + s * 0.5); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d6e6f7'); ctx.fillStyle = g;
    ctx.beginPath(); for (const [dx, dy, r] of [[-0.9, 0.1, 0.45], [-0.4, -0.25, 0.6], [0.25, -0.35, 0.7], [0.85, 0, 0.5], [0, 0.15, 0.55]]) { ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); } ctx.fill();
    ctx.restore();
  }

  /* ---------- lumină și umbre ---------- */
  /* halou luminos (aditiv) */
  function glow(ctx, x, y, r, color, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(color, a === undefined ? 0.8 : a)); g.addColorStop(0.35, rgba(color, (a === undefined ? 0.8 : a) * 0.35)); g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  }
  /* umbră de contact sub un obiect (elipsă difuză) */
  function groundShadow(ctx, x, y, rx, ry, a) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, 'rgba(0,0,0,' + (a === undefined ? 0.45 : a) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
  }
  /* umbră moale pentru tot ce desenezi în fn() */
  function softShadow(ctx, fn, o) { o = o || {}; ctx.save(); ctx.shadowColor = o.color || 'rgba(0,0,0,0.45)'; ctx.shadowBlur = o.blur === undefined ? 18 : o.blur; ctx.shadowOffsetY = o.dy === undefined ? 6 : o.dy; ctx.shadowOffsetX = o.dx || 0; fn(); ctx.restore(); }

  /* ---------- volume (corpuri cu lumină) ---------- */
  /* sferă cu lumină din stânga-sus, umbră proprie și reflex */
  function sphere(ctx, x, y, r, color, o) {
    o = o || {}; const lx = o.lx === undefined ? -0.38 : o.lx, ly = o.ly === undefined ? -0.42 : o.ly;
    ctx.save();
    const g = ctx.createRadialGradient(x + lx * r, y + ly * r, r * 0.05, x, y, r * 1.02);
    g.addColorStop(0, shade(color, 0.45)); g.addColorStop(0.45, color); g.addColorStop(1, shade(color, -0.55));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (o.rim !== false) { const rim = ctx.createRadialGradient(x, y, r * 0.75, x, y, r); rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(1, rgba(o.rimColor || '#9fc4ff', 0.22)); ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    if (o.gloss !== false) { const s = ctx.createRadialGradient(x + lx * r * 0.9, y + ly * r * 0.9, 0, x + lx * r * 0.9, y + ly * r * 0.9, r * 0.45); s.addColorStop(0, 'rgba(255,255,255,0.55)'); s.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  /* umple calea curentă cu un gradient „volum” (lumină sus-stânga) */
  function volumeFill(ctx, x0, y0, x1, y1, color, o) {
    o = o || {}; const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, shade(color, o.hi === undefined ? 0.28 : o.hi)); g.addColorStop(0.5, color); g.addColorStop(1, shade(color, o.lo === undefined ? -0.42 : -o.lo));
    ctx.fillStyle = g; ctx.fill();
  }
  /* cilindru orizontal/vertical (țevi, pistoane, axe) — x,y = colț, w,h */
  function cylinder(ctx, x, y, w, h, color, vertical) {
    ctx.save(); const g = vertical ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, shade(color, -0.35)); g.addColorStop(0.3, shade(color, 0.45)); g.addColorStop(0.55, color); g.addColorStop(1, shade(color, -0.55));
    ctx.fillStyle = g; roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.18); ctx.fill(); ctx.restore();
  }
  /* metal periat (plăci, carcase) */
  function metalPlate(ctx, x, y, w, h, r, color) {
    ctx.save(); roundRectPath(ctx, x, y, w, h, r);
    const g = ctx.createLinearGradient(x, y, x + w * 0.3, y + h); const c = color || C.metal;
    g.addColorStop(0, shade(c, 0.35)); g.addColorStop(0.5, c); g.addColorStop(1, shade(c, -0.45)); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }

  /* ---------- forme ---------- */
  function roundRectPath(ctx, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  /* drum neted (Catmull-Rom) prin puncte [[x,y],...]; closed = buclă */
  function smoothPath(ctx, pts, closed, tension) {
    const n = pts.length; if (n < 2) return; const k = (tension === undefined ? 0.5 : tension) / 3;
    const at = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2); ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]); }
    if (closed) ctx.closePath();
  }
  /* formă organică („blob”) în jurul (x,y), care respiră ușor în timp */
  function blob(ctx, x, y, r, t, o) {
    o = o || {}; const n = o.points || 9, amp = o.amp === undefined ? 0.12 : o.amp, seed = o.seed || 0, sx = o.sx || 1, sy = o.sy || 1;
    const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + amp * noise2(Math.cos(a) + seed, Math.sin(a) + (t || 0) * 0.3)); pts.push([x + Math.cos(a) * rr * sx, y + Math.sin(a) * rr * sy]); }
    ctx.beginPath(); smoothPath(ctx, pts, true); return pts;
  }
  /* tub (vas de sânge, cablu, țeavă) de-a lungul unui drum neted, cu luciu */
  function tube(ctx, pts, width, color, o) {
    o = o || {}; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); smoothPath(ctx, pts, o.closed);
    ctx.strokeStyle = shade(color, -0.5); ctx.lineWidth = width + Math.max(2, width * 0.18); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff', o.gloss === undefined ? 0.28 : o.gloss); ctx.lineWidth = Math.max(1, width * 0.22);
    ctx.save(); ctx.translate(-width * 0.18, -width * 0.18); ctx.beginPath(); smoothPath(ctx, pts, o.closed); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  /* punct pe drum neted (pentru particule care curg): returnează {x,y,angle} la fracția u ∈ [0,1] */
  function pathSampler(pts, closed, steps) {
    steps = steps || 24; const out = []; const n = pts.length; const at = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2); for (let s = 0; s < steps; s++) { const t = s / steps, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((d) => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } }
    out.push(closed ? out[0] : pts[n - 1].slice());
    const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    const len = cum[cum.length - 1];
    return { len: len, at: function (u) { u = closed ? ((u % 1) + 1) % 1 : clamp(u, 0, 1); const d = u * len; let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < d) lo = m; else hi = m; } const k = (d - cum[lo]) / ((cum[hi] - cum[lo]) || 1); return { x: lerp(out[lo][0], out[hi][0], k), y: lerp(out[lo][1], out[hi][1], k), angle: Math.atan2(out[hi][1] - out[lo][1], out[hi][0] - out[lo][0]) }; } };
  }
  /* săgeată curbă, prietenoasă */
  function arrow(ctx, x0, y0, x1, y1, o) {
    o = o || {}; const col = o.color || '#ffffff', w = o.width || 4, bend = o.bend || 0;
    const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(y1 - my, x1 - mx), h = w * 3.2;
    ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * h * 0.4, y1 + Math.sin(a) * h * 0.4); ctx.lineTo(x1 - Math.cos(a - 0.5) * h, y1 - Math.sin(a - 0.5) * h); ctx.lineTo(x1 - Math.cos(a + 0.5) * h, y1 - Math.sin(a + 0.5) * h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ---------- text ---------- */
  const FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif';
  /* mărime de font care crește cu ecranul (U = api.unit) */
  const fs = (U, k, min) => Math.max(min || 12, Math.round(U * (k || 0.055)));
  function font(px, weight) { return (weight || 700) + ' ' + Math.round(px) + 'px ' + FONT; }
  /* text cu contur întunecat — lizibil peste orice desen */
  function text(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o.size || 15, o.weight); ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
    if (o.halo !== false) { ctx.lineJoin = 'round'; ctx.strokeStyle = o.haloColor || 'rgba(5,8,20,0.78)'; ctx.lineWidth = Math.max(3, (o.size || 15) * 0.32); ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color || C.text; ctx.fillText(s, x, y); ctx.restore();
  }
  /* etichetă „pastilă” (fundal rotunjit), opțional cu linie spre un punct (tx,ty) */
  function label(ctx, s, x, y, o) {
    o = o || {}; const size = o.size || 14; ctx.save(); ctx.font = font(size, o.weight || 700);
    const w = ctx.measureText(s).width + size * 1.1, h = size * 1.75;
    let bx = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2; const by = y - h / 2;
    if (o.tx !== undefined) { ctx.strokeStyle = o.lineColor || 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o.tx, o.ty); ctx.lineTo(clamp(o.tx, bx, bx + w), clamp(o.ty, by, by + h)); ctx.stroke(); ctx.fillStyle = o.lineColor || 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(o.tx, o.ty, 3, 0, TAU); ctx.fill(); }
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    roundRectPath(ctx, bx, by, w, h, h / 2); ctx.fillStyle = o.bg || 'rgba(10,15,35,0.82)'; ctx.fill(); ctx.shadowColor = 'transparent';
    if (o.border !== false) { ctx.strokeStyle = o.border || 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = o.color || C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + w / 2, y + 0.5);
    ctx.restore(); return { x: bx, y: by, w: w, h: h };
  }
  /* card / panou în canvas (pentru afișaje: EKG, contoare, legende) */
  function panel(ctx, x, y, w, h, o) {
    o = o || {}; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
    roundRectPath(ctx, x, y, w, h, o.r || 14); ctx.fillStyle = o.bg || 'rgba(10,15,35,0.78)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = o.border || 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  /* bară de progres / indicator rotunjit */
  function meter(ctx, x, y, w, h, v, color, o) {
    o = o || {}; ctx.save(); roundRectPath(ctx, x, y, w, h, h / 2); ctx.fillStyle = o.track || 'rgba(255,255,255,0.12)'; ctx.fill();
    const vv = clamp(v, 0, 1); if (vv > 0) { roundRectPath(ctx, x, y, Math.max(h, w * vv), h, h / 2); const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(color, -0.15)); g.addColorStop(1, shade(color, 0.25)); ctx.fillStyle = g; ctx.fill(); }
    ctx.restore();
  }

  /* ---------- particule ---------- */
  /* sistem simplu: const ps = Art.particles(); ps.emit({...}); ps.update(dt); ps.draw(ctx) */
  function particles(max) {
    const L = []; max = max || 600;
    return {
      list: L,
      emit: function (p) { if (L.length >= max) L.shift(); L.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 1, age: 0, size: 3, grow: 0, color: '#ffffff', drag: 0.4, g: 0, glow: false, fade: true }, p)); },
      update: function (dt) { for (let i = L.length - 1; i >= 0; i--) { const p = L[i]; p.age += dt; if (p.age >= p.life) { L.splice(i, 1); continue; } const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy = p.vy * d + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.size += p.grow * dt; } },
      draw: function (ctx) { ctx.save(); for (const p of L) { const k = p.age / p.life, a = p.fade ? (1 - k) * (k < 0.1 ? k / 0.1 : 1) : 1; if (p.glow) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(0.5, p.size)); g.addColorStop(0, rgba(p.color, a)); g.addColorStop(1, rgba(p.color, 0)); ctx.fillStyle = g; } else { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = rgba(p.color, a); } ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, p.size), 0, TAU); ctx.fill(); } ctx.restore(); },
      clear: function () { L.length = 0; }
    };
  }

  /* ---------- texturi pre-randate (cache) ---------- */
  const _tex = {};
  /* Art.cached(key, w, h, draw(ctx,w,h)) → canvas; desenează o singură dată ce e scump */
  function cached(key, w, h, draw) {
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h)); const k = key + '|' + w + 'x' + h;
    if (!_tex[k]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); _tex[k] = c; }
    return _tex[k];
  }
  /* granulație fină peste scenă (dă aspect „pictat”) */
  function grain(ctx, W, H, a) {
    const tex = cached('grain', 160, 160, (c, w, h) => { const d = c.createImageData(w, h); let s = 99; for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s & 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); });
    ctx.save(); ctx.globalAlpha = a === undefined ? 0.035 : a; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(tex, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  /* ---------- stil unitar pe secțiuni (folosește-le în loc de culori alese local) ---------- */
  /* fundalul unei scene, după tipul ei:
     'space' = spațiu (Spațiul, vederi din cosmos) · 'body' = Corpul omenesc · 'lab' = obiecte tehnice în interior
     'day' = scenă în aer liber, ziua · 'dusk' = în aer liber, seara · 'night' = în aer liber, noaptea */
  const SCENE = {
    space: ['#0b1026', '#04060f'], body: ['#1b1828', '#0d0b16'], lab: ['#18213f', '#0c1226'],
    day: ['#5aa0e6', '#d6ecfb'], dusk: ['#3b4a86', '#f0b48a'], night: ['#0b1433', '#1c2650']
  };
  function scene(ctx, W, H, kind) {
    const c = SCENE[kind] || SCENE.lab;
    ctx.save(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  /* etichete: aceeași mărime și același fundal peste tot */
  const labelSize = (U) => fs(U, 0.04, 13);
  const LABEL_BG = 'rgba(10,15,35,0.82)';
  /* conturul unei forme: culoarea ei, mai închisă (nu negru) — și grosimea, proporțională cu ecranul */
  const ink = (color) => shade(color, -0.45);
  const lineW = (U) => Math.max(1, U * 0.006);

  window.Art = {
    SCENE, scene, labelSize, LABEL_BG, ink, lineW,
    TAU, C, clamp, lerp, ease, damp, spring, noise1, noise2, wobble,
    hex, rgba, mix, shade,
    backdrop, vignette, daySky, stars, cloud,
    glow, groundShadow, softShadow, sphere, volumeFill, cylinder, metalPlate,
    roundRectPath, smoothPath, blob, tube, pathSampler, arrow,
    FONT, fs, font, text, label, panel, meter,
    particles, cached, grain
  };
})();
