/* ============================================================
   CREATURES — animale și plante ilustrate (global Creatures)
   Stil: ilustrație de carte pentru copii (siluete curbe, volum prin
   gradient, contur mai închis decât umplerea, ochi cu luciu).

   Fiecare desen: Creatures.NUME(ctx, x, y, size, t, opts)
   - orientat spre dreapta; opts.flip = true → spre stânga
     (sau opts.face ∈ [-1, 1] pentru o întoarcere lină)
   - size ≈ lungimea corpului în px (la plante: înălțimea)
   - animale de uscat și plante: (x, y) = punctul de pe sol de sub corp
     animale care înoată / zboară: (x, y) = centrul corpului
   - opts.speed (0 = stă pe loc), opts.ph (faza mersului, dată din afară),
     opts.color, opts.alpha, opts.v (variantă), opts.seed,
     opts.lightsOnly (doar luminile animalelor bioluminescente)
   Nu lasă starea ctx modificată.
   ============================================================ */
(function () {
  const A = window.Art, TAU = Math.PI * 2, PI = Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- culori (acceptă #hex și rgb()) ---------- */
  const _pc = new Map();
  function parse(c) {
    let r = _pc.get(c); if (r) return r;
    if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); r = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    else { const m = c.match(/[\d.]+/g); r = m ? [+m[0], +m[1], +m[2]] : [128, 128, 128]; }
    if (_pc.size > 4000) _pc.clear(); _pc.set(c, r); return r;
  }
  const toHex = (r) => '#' + r.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const _sc = new Map();
  function sh(c, t) { const k = c + '|' + t; let r = _sc.get(k); if (r) return r; const a = parse(c), b = t >= 0 ? 255 : 0, q = Math.abs(t); r = toHex(a.map((v) => v + (b - v) * q)); if (_sc.size > 4000) _sc.clear(); _sc.set(k, r); return r; }
  function mix(c1, c2, t) { const a = parse(c1), b = parse(c2); return toHex(a.map((v, i) => lerp(v, b[i], t))); }
  function rgba(c, a) { const r = parse(c); return 'rgba(' + r[0] + ',' + r[1] + ',' + r[2] + ',' + a + ')'; }

  /* ---------- cadru local: 100 unități = size ---------- */
  let LW = 1.5;
  function begin(ctx, x, y, size, o) {
    const s = size / 100; let f = o.face !== undefined ? o.face : (o.flip ? -1 : 1);
    if (Math.abs(f) < 0.06) f = f < 0 ? -0.06 : 0.06;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s); if (o.rot) ctx.rotate(o.rot);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    LW = Math.max(1.2, 0.95 / s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    return s;
  }
  const end = (ctx) => ctx.restore();
  function path(ctx, pts, closed, tension) { ctx.beginPath(); A.smoothPath(ctx, pts, closed !== false, tension); }
  function bb(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; }
  function gloss(ctx, x, y, rx, ry, a) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, 'rgba(255,255,255,' + (a === undefined ? 0.35 : a) * 0.45 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
  }
  /* umple drumul curent: gradient vertical (lumină sus), burtă mai deschisă, contur, luciu */
  function paint(ctx, col, y0, y1, o) {
    o = o || {}; const g = ctx.createLinearGradient(o.gx0 || 0, y0, o.gx1 || 0, y1);
    if (o.grad) o.grad.forEach((c, i) => g.addColorStop(i / (o.grad.length - 1), c));
    else { g.addColorStop(0, sh(col, o.hi === undefined ? 0.28 : o.hi)); g.addColorStop(0.55, col); g.addColorStop(1, sh(col, -(o.lo === undefined ? 0.38 : o.lo))); }
    ctx.fillStyle = g; ctx.fill();
    if (o.belly) { ctx.save(); ctx.clip(); const h = y1 - y0, b = ctx.createLinearGradient(0, y1 - h * 0.42, 0, y1); b.addColorStop(0, rgba(o.belly, 0)); b.addColorStop(1, rgba(o.belly, 0.8)); ctx.fillStyle = b; ctx.fillRect(-300, y0 - 10, 600, h + 20); ctx.restore(); }
    if (o.line !== false) { ctx.strokeStyle = o.stroke || sh(col, -0.5); ctx.lineWidth = LW * (o.lw || 1); ctx.stroke(); }
    if (o.sheen) { ctx.save(); ctx.clip(); const s = o.sheen; gloss(ctx, s[0], s[1], s[2], s[3], s[4]); ctx.restore(); }
  }
  function shape(ctx, pts, col, o) {
    o = o || {}; path(ctx, pts, o.closed, o.tension); const b = bb(pts);
    if (o.sheen === true) o = Object.assign({}, o, { sheen: [lerp(b[0], b[2], 0.42), lerp(b[1], b[3], 0.28), (b[2] - b[0]) * 0.33, (b[3] - b[1]) * 0.22, 0.32] });
    paint(ctx, col, b[1], b[3], o); return b;
  }
  /* contur al unui tub care se subțiază de-a lungul unei linii (cozi, gâturi, trompe, tentacule) */
  function taper(pts, w0, w1) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, w = lerp(w0, w1, i / (n - 1)) / 2;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    return L.concat(R.reverse());
  }
  /* linie groasă cu contur (membre subțiri, tulpini) */
  function stroke2(ctx, pts, w, col, o) {
    o = o || {}; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); A.smoothPath(ctx, pts, false);
    if (o.line !== false) { ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = w + LW * 1.6; ctx.stroke(); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
  }
  /* ochi realist: iris + pupilă, pleoapă discretă, un singur reflex mic; clipit rar */
  function eye(ctx, x, y, r, t, o) {
    o = o || {}; const per = o.period || 5.3, bl = o.noBlink ? 1 : (((t + (o.seed || 0) * 1.7) % per + per) % per) < 0.12 ? 0.15 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, bl);
    if (o.white) { ctx.fillStyle = o.white === true ? 'rgba(40,28,20,0.55)' : rgba(o.white, 0.9); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r * 1.12, 0, 0, TAU); ctx.fill(); }
    if (o.iris) { const g = ctx.createRadialGradient(0, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, sh(o.iris, 0.25)); g.addColorStop(1, sh(o.iris, -0.35)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#0c0806'; ctx.beginPath(); if (o.slit) ctx.ellipse(0, 0, r * 0.22, r * 0.8, 0, 0, TAU); else ctx.arc(0, 0, r * 0.5, 0, TAU); ctx.fill(); }
    else { const g = ctx.createRadialGradient(0, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, o.color ? sh(o.color, 0.2) : '#3a2a20'); g.addColorStop(1, o.color || '#0e0a08'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(20,12,8,0.6)'; ctx.lineWidth = Math.max(LW * 0.6, r * 0.18); ctx.beginPath(); ctx.arc(0, 0, r * 1.02, PI * 1.08, PI * 1.92); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.32, Math.max(r * 0.2, 0.35), 0, TAU); ctx.fill();
    ctx.restore();
  }
  /* blană: fire scurte de-a lungul conturului (doar pe marginea de sus) */
  function fur(ctx, pts, col, len, dir) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = LW * 0.7; ctx.beginPath();
    const n = pts.length;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if ((b[0] - a[0]) * (dir || 1) >= 0) continue; const k = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.4)); for (let j = 0; j < k; j++) { const u = j / k, px = lerp(a[0], b[0], u), py = lerp(a[1], b[1], u), l = len * (0.6 + ((i * 7 + j * 3) % 5) * 0.1); ctx.moveTo(px, py + 0.5); ctx.lineTo(px - l * 0.7, py - l * 0.5); } }
    ctx.stroke(); ctx.restore();
  }
  /* faza mersului */
  function gait(t, o, cad) { const sp = o.speed === undefined ? 1 : o.speed; return { ph: o.ph !== undefined ? o.ph : t * cad * Math.max(0.3, sp), on: o.moving === false || sp < 0.01 ? 0 : 1 }; }
  /* picior cu două segmente (IK) — talpa pe sol (y = 0) */
  function seg(ctx, a, b, c, d) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
  function leg(ctx, hx, hy, len, w, ph, col, o) {
    o = o || {}; const on = o.on === undefined ? 1 : o.on;
    const stride = (o.stride === undefined ? len * 0.3 : o.stride) * on, lift = (o.lift === undefined ? len * 0.15 : o.lift) * on;
    const fx = hx + (o.fx || 0) + Math.sin(ph) * stride, fy = (o.gy || 0) - Math.max(0, Math.cos(ph)) * lift;
    let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy); const L1 = len * (o.split || 0.5), L2 = len - L1;
    if (d > len * 0.995) { const k = len * 0.995 / d; dx *= k; dy *= k; d = len * 0.995; }
    const a = Math.atan2(dy, dx), c = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)) * (o.bend || 1);
    const kx = hx + Math.cos(a + c) * L1, ky = hy + Math.sin(a + c) * L1, ex = hx + dx, ey = hy + dy;
    const w1 = w * (o.thigh || 1.3);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = w1 + LW * 2; seg(ctx, hx, hy, kx, ky); ctx.lineWidth = w + LW * 2; seg(ctx, kx, ky, ex, ey);
    ctx.strokeStyle = col; ctx.lineWidth = w1; seg(ctx, hx, hy, kx, ky); ctx.lineWidth = w; seg(ctx, kx, ky, ex, ey);
    ctx.strokeStyle = rgba('#ffffff', 0.16); ctx.lineWidth = w * 0.28; seg(ctx, hx - w * 0.25, hy, kx - w * 0.25, ky); seg(ctx, kx - w * 0.22, ky, ex - w * 0.22, ey - w * 0.3);
    if (o.haunch) { const hp = taper([[hx + (o.hdx || 0), hy - len * (o.hup || 0.32)], [hx, hy], [lerp(hx, kx, 0.72), lerp(hy, ky, 0.72)]], w * o.haunch, w * 1.25); path(ctx, hp, true, 0.5); const b = bb(hp), g = ctx.createLinearGradient(0, b[1], 0, b[3]); g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.45, rgba(col, 1)); g.addColorStop(1, sh(col, -0.18)); ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW * 2; ctx.beginPath(); ctx.moveTo(lerp(hp[0][0], hp[1][0], 0.6), lerp(hp[0][1], hp[1][1], 0.6)); ctx.quadraticCurveTo(hp[1][0], hp[1][1], hp[2][0], hp[2][1]); ctx.moveTo(hp[3][0], hp[3][1]); ctx.quadraticCurveTo(hp[4][0], hp[4][1], lerp(hp[5][0], hp[4][0], 0.6), lerp(hp[5][1], hp[4][1], 0.6)); ctx.stroke(); ctx.restore(); }
    const ft = o.foot;
    if (ft === 'hoof') { ctx.fillStyle = sh(col, -0.6); ctx.beginPath(); ctx.ellipse(ex + w * 0.12, ey - w * 0.15, w * 0.62, w * 0.42, 0, 0, TAU); ctx.fill(); }
    else if (ft === 'pad') { ctx.fillStyle = sh(col, -0.12); ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.ellipse(ex + w * 0.25, ey - w * 0.2, w * 0.85, w * 0.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (ft === 'claw') { ctx.strokeStyle = sh(col, -0.45); ctx.lineWidth = w * 0.38; for (let i = -1; i <= 1; i++) seg(ctx, ex, ey - w * 0.2, ex + w * 0.9, ey - w * 0.15 + i * w * 0.25); ctx.strokeStyle = '#efe3c8'; ctx.lineWidth = w * 0.16; for (let i = -1; i <= 1; i++) seg(ctx, ex + w * 0.8, ey - w * 0.15 + i * w * 0.25, ex + w * 1.15, ey + i * w * 0.3); }
    else if (ft === 'stump') { ctx.fillStyle = sh(col, 0.1); ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.ellipse(ex, ey - w * 0.12, w * 0.62, w * 0.2, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    return [kx, ky, ex, ey];
  }
  /* dungi sau pete în interiorul unei forme (clip) */
  function clipDraw(ctx, pts, fn) { ctx.save(); path(ctx, pts); ctx.clip(); fn(); ctx.restore(); }

  /* ==========================================================
     VIAȚĂ MARINĂ
     ========================================================== */

  /* pește generic; v: 'fish' | 'tuna' | 'jawless' | 'placoderm' | 'viper' | 'snail' */
  function fish(ctx, x, y, size, t, o) {
    o = o || {}; const v = o.v || 'fish';
    const sp = o.speed === undefined ? 1 : o.speed, ph = o.ph !== undefined ? o.ph : t * (4 + 5 * sp) + (o.seed || 0) * 3;
    const H = { tuna: 1.12, viper: 0.62, snail: 1.15, placoderm: 1.2, jawless: 0.9 }[v] || 1;
    const amp = v === 'snail' ? 3 : 2.2;
    const wv = (xx) => Math.sin(ph - (xx + 50) * 0.06) * amp * Math.pow(clamp((50 - xx) / 100, 0, 1.3), 1.6);
    if (o.lightsOnly) {
      if (v !== 'viper') return; begin(ctx, x, y, size, o);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) { const xx = 30 - i * 8; glowDot(ctx, xx, 6 * H + wv(xx) + 3, 4, '#6fffe0', 0.8); }
      glowDot(ctx, -8, -44 + wv(-8), 6, '#9fffe8', 0.9); end(ctx); return;
    }
    begin(ctx, x, y, size, o);
    const col = o.color || { fish: '#6f9fb8', tuna: '#3c6596', jawless: '#8a7656', placoderm: '#6c7280', viper: '#1d3340', snail: '#f0b9c6' }[v];
    const grad = { fish: ['#2f5f80', '#76a6bf', '#e6f0ef'], tuna: ['#13325e', '#4e74a2', '#e9eef4'], jawless: ['#5a4630', '#8a7656', '#d8c7a0'], placoderm: ['#3e434e', '#737985', '#cfd2d6'], viper: ['#0b161d', '#1d3340', '#3c5e6a'], snail: ['#d58ea0', '#f2c3cf', '#fbe6ea'] }[v] || [sh(col, -0.3), col, sh(col, 0.6)];
    if (v === 'snail') ctx.globalAlpha *= 0.86;
    let top = [[50, 0], [45, -9], [32, -17], [12, -20], [-10, -17], [-28, -10], [-41, -4]];
    let bot = [[-41, 4], [-28, 9], [-10, 14], [12, 17], [32, 13], [45, 7]];
    if (v === 'snail') { top = [[50, 0], [44, -14], [26, -21], [2, -15], [-24, -7], [-44, -2]]; bot = [[-44, 2], [-24, 6], [2, 13], [26, 17], [44, 10]]; }
    if (v === 'viper') { top = [[52, -2], [46, -9], [30, -14], [6, -15], [-20, -12], [-40, -5]]; bot = [[-40, 4], [-20, 10], [6, 13], [30, 12], [46, 9], [53, 4]]; }
    const P = top.concat(bot).map((p) => [p[0], p[1] * H + wv(p[0])]);
    const tx = v === 'snail' ? -44 : -41, ty = wv(tx), tt = wv(tx - 20), fl = Math.sin(ph * 1.3) * 3;
    const finC = v === 'tuna' ? '#2d4f80' : sh(col, -0.12);
    const fin = (pts, c) => { ctx.save(); ctx.globalAlpha *= 0.92; shape(ctx, pts, c || finC, { tension: 0.35, hi: 0.2, lo: 0.3 }); ctx.restore(); };
    /* coada */
    if (v === 'tuna') fin([[tx + 2, ty - 3], [tx - 16, tt - 20], [tx - 10, tt - 4], [tx - 8, tt], [tx - 10, tt + 4], [tx - 16, tt + 20], [tx + 2, ty + 3]]);
    else if (v === 'jawless') fin([[tx + 2, ty - 3], [tx - 14, tt - 6], [tx - 20, tt + 6], [tx - 8, tt + 14], [tx + 2, ty + 4]]);
    else if (v === 'snail') fin([[tx + 4, ty - 4], [tx - 14, tt - 7], [tx - 16, tt + 4], [tx - 10, tt + 8], [tx + 4, ty + 5]], '#e9a9b8');
    else fin([[tx + 2, ty - 3], [tx - 18, tt - 16 * H], [tx - 12, tt], [tx - 18, tt + 16 * H], [tx + 2, ty + 3]]);
    /* aripioare spate / dorsale */
    if (v === 'tuna') { fin([[14, -19 * H + wv(14)], [2, -34 + wv(2)], [-6, -17 * H + wv(-6)]]); fin([[2, 16 * H + wv(2)], [-8, 30 + wv(-8)], [-14, 13 * H + wv(-14)]], '#e8b830'); }
    else if (v === 'fish') { fin([[12, -19 + wv(12)], [0, -30 + wv(0)], [-14, -28 + wv(-14)], [-22, -14 + wv(-22)]]); fin([[-8, 14 + wv(-8)], [-18, 24 + wv(-18)], [-26, 9 + wv(-26)]]); }
    else if (v === 'viper') { ctx.strokeStyle = sh(col, 0.2); ctx.lineWidth = LW * 1.2; ctx.beginPath(); ctx.moveTo(6, -14 * H); ctx.quadraticCurveTo(2, -40, -8, -44 + wv(-8)); ctx.stroke(); fin([[-22, -8 + wv(-22)], [-32, -16 + wv(-32)], [-36, -4 + wv(-36)]]); }
    else if (v === 'placoderm') { fin([[-6, -18 * H + wv(-6)], [-18, -32 + wv(-18)], [-26, -14 + wv(-26)]]); }
    else if (v === 'snail') { fin([[10, -15 * H + wv(10)], [-20, -16 + wv(-20)], [-44, -5 + wv(-44)], [-24, -7 * H + wv(-24)]], '#eab0be'); }
    /* corpul */
    shape(ctx, P, col, { grad: grad, sheen: [18, -9 * H, 26, 8 * H, v === 'viper' ? 0.18 : 0.38], stroke: sh(grad[0], -0.25) });
    /* model pe corp */
    clipDraw(ctx, P, () => {
      if (v === 'tuna') { ctx.fillStyle = 'rgba(255,214,70,0.85)'; for (let i = 0; i < 6; i++) { const xx = -14 - i * 4.4; ctx.beginPath(); ctx.moveTo(xx, -10 + wv(xx)); ctx.lineTo(xx - 2.2, -13 + wv(xx)); ctx.lineTo(xx - 4.4, -10 + wv(xx)); ctx.fill(); } ctx.strokeStyle = 'rgba(160,210,255,0.35)'; ctx.lineWidth = LW * 1.5; ctx.beginPath(); for (let xx = 40; xx > -40; xx -= 4) ctx.lineTo(xx, -2 + wv(xx)); ctx.stroke(); }
      if (v === 'fish') { ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = LW; for (let r = 0; r < 3; r++) for (let xx = 18; xx > -36; xx -= 7) { const yy = -8 + r * 7 + wv(xx); ctx.beginPath(); ctx.arc(xx, yy, 3.8, -1.2, 1.2); ctx.stroke(); } ctx.strokeStyle = 'rgba(40,80,110,0.4)'; ctx.lineWidth = LW * 1.2; ctx.beginPath(); for (let xx = 30; xx > -40; xx -= 4) ctx.lineTo(xx, 1 + wv(xx)); ctx.stroke(); }
      if (v === 'jawless') { shape(ctx, [[52, 0], [44, -10], [26, -17], [10, -16], [8, 0], [10, 12], [28, 14], [46, 8]].map((p) => [p[0], p[1] * H + wv(p[0])]), '#b49a6a', { tension: 0.4, sheen: true }); ctx.fillStyle = 'rgba(80,60,40,0.35)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-4 - i * 6, 4 + wv(-4 - i * 6), 2.4, 0, TAU); ctx.fill(); } }
      if (v === 'placoderm') { shape(ctx, [[54, 2], [48, -14], [30, -22], [6, -22], [2, 0], [6, 18], [30, 18], [48, 12]].map((p) => [p[0], p[1] * H + wv(p[0])]), '#9aa0a8', { tension: 0.35, sheen: true }); ctx.strokeStyle = 'rgba(40,44,52,0.5)'; ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(30, -26); ctx.lineTo(26, 20); ctx.moveTo(16, -26); ctx.quadraticCurveTo(10, 0, 16, 22); ctx.stroke(); }
      if (v === 'viper') { ctx.fillStyle = 'rgba(120,255,220,0.9)'; for (let i = 0; i < 9; i++) { const xx = 30 - i * 8; ctx.beginPath(); ctx.arc(xx, 6 * H + wv(xx) + 3, 1.4, 0, TAU); ctx.fill(); } }
      if (v === 'snail') { ctx.fillStyle = 'rgba(200,90,120,0.25)'; ctx.beginPath(); ctx.ellipse(14, 4, 14, 7, 0, 0, TAU); ctx.fill(); }
    });
    /* aripioara pectorală */
    const pf = Math.sin(ph * 0.9) * 0.3;
    ctx.save(); ctx.translate(24, 6 * H + wv(24)); ctx.rotate(0.5 + pf); fin([[0, -2], [-14, 2], [-16, 7], [-2, 4]], v === 'tuna' ? '#e8b830' : undefined); ctx.restore();
    /* branhii, gură, ochi */
    ctx.strokeStyle = rgba(sh(grad[0], -0.3), 0.55); ctx.lineWidth = LW * 1.1; ctx.beginPath(); ctx.arc(22, wv(22), 12 * H, -1.0, 1.0); ctx.stroke();
    if (v === 'viper') {
      ctx.strokeStyle = sh(col, -0.4); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(53, 2); ctx.lineTo(36, 3); ctx.stroke();
      ctx.fillStyle = '#eef4f4'; for (const [fx, fy, l] of [[50, 1, 14], [44, 2, 18], [40, 2, 10]]) { ctx.beginPath(); ctx.moveTo(fx - 1.5, fy); ctx.lineTo(fx + 1.5, fy); ctx.lineTo(fx + 3, fy + l); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(47, 6); ctx.lineTo(49, 6); ctx.lineTo(47, -6); ctx.closePath(); ctx.fill();
      eye(ctx, 40, -4 + wv(40), 3.6, t, { seed: o.seed, iris: '#9ff2ff', noBlink: true });
    } else {
      ctx.strokeStyle = sh(grad[0], -0.3); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(v === 'jawless' ? 51 : 49, 3 + wv(49)); ctx.quadraticCurveTo(44, 6, 40, 4 + wv(40)); ctx.stroke();
      eye(ctx, v === 'snail' ? 38 : 37, (v === 'jawless' ? -7 : -4) * H + wv(37), v === 'snail' ? 3 : 3.6, t, { seed: o.seed, white: v !== 'snail' && v !== 'jawless', noBlink: true });
    }
    end(ctx);
  }
  function glowDot(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(0.4, rgba(col, a * 0.4)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

  /* rechin */
  function shark(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const sp = o.speed === undefined ? 1 : o.speed, ph = o.ph !== undefined ? o.ph : t * (2.5 + 3 * sp) + (o.seed || 0) * 3;
    const wv = (xx) => Math.sin(ph - (xx + 50) * 0.05) * 2.2 * Math.pow(clamp((55 - xx) / 110, 0, 1.3), 1.8);
    const col = o.color || '#6d8396';
    const P = [[56, -1], [50, -8], [32, -12.5], [10, -13.5], [-14, -10], [-34, -5], [-44, -3], [-44, 3], [-30, 6], [-8, 9], [14, 11], [34, 9], [48, 5], [55, 2]].map((p) => [p[0], p[1] + wv(p[0])]);
    const tw = wv(-44), tt = wv(-66), fc = sh(col, -0.1);
    shape(ctx, [[-42, tw - 3], [-58, tt - 14], [-70, tt - 27], [-62, tt - 6], [-58, tt + 2], [-64, tt + 13], [-42, tw + 4]], fc, { tension: 0.3 });
    shape(ctx, [[-14, -9 + wv(-14)], [-22, -17 + wv(-22)], [-26, -8 + wv(-26)]], fc, { tension: 0.3 });
    shape(ctx, [[14, -13 + wv(14)], [4, -26 + wv(4)], [-3, -36 + wv(-3)], [-2, -24 + wv(-2)], [-8, -11 + wv(-8)]], fc, { tension: 0.4 });
    shape(ctx, P, col, { grad: ['#3d5468', '#6d8396', '#a8b8c4', '#f2f4f2', '#e8ecec'], sheen: [20, -7, 30, 6, 0.32], stroke: '#2a3a4a' });
    ctx.save(); ctx.translate(26, 8 + wv(26)); ctx.rotate(0.65 + Math.sin(ph) * 0.06); shape(ctx, [[2, -2], [-16, 6], [-24, 20], [-6, 6]], sh(col, -0.15), { tension: 0.3 }); ctx.restore();
    ctx.strokeStyle = 'rgba(30,45,60,0.55)'; ctx.lineWidth = LW * 1.1; for (let i = 0; i < 4; i++) { const xx = 33 - i * 3; ctx.beginPath(); ctx.moveTo(xx, -5 + wv(xx)); ctx.quadraticCurveTo(xx - 1.5, 0, xx, 5 + wv(xx)); ctx.stroke(); }
    ctx.strokeStyle = '#2a3a4a'; ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(52, 3.5); ctx.quadraticCurveTo(46, 7, 40, 5.5); ctx.stroke();
    eye(ctx, 43, -4 + wv(43), 2.4, t, { seed: o.seed, noBlink: true });
    end(ctx);
  }

  /* delfin; v: 'dolphin' | 'ichthyo' (ihtiozaur) */
  function dolphin(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const ich = o.v === 'ichthyo', sp = o.speed === undefined ? 1 : o.speed, ph = o.ph !== undefined ? o.ph : t * (2.4 + 2.5 * sp) + (o.seed || 0) * 3;
    const wv = (xx) => Math.sin(ph - (xx + 50) * 0.045) * 3.2 * Math.pow(clamp((55 - xx) / 110, 0, 1.3), 1.7);
    const col = o.color || (ich ? '#7a8a6a' : '#6f8ea8');
    const fc = sh(col, -0.15);
    let P;
    if (ich) P = [[64, 1], [50, -3], [40, -8], [24, -14], [0, -15], [-22, -10], [-40, -3], [-40, 2], [-22, 8], [0, 12], [24, 11], [40, 5], [50, 3], [64, 2.5]];
    else P = [[60, 2], [53, 0], [48, -7], [34, -13], [10, -14.5], [-18, -10], [-42, -3], [-42, 2], [-20, 7], [6, 12], [32, 11], [48, 6], [55, 4], [60, 3.2]];
    P = P.map((p) => [p[0], p[1] + wv(p[0])]);
    const tw = wv(-42), tt = wv(-58);
    if (ich) shape(ctx, [[-38, tw - 3], [-52, tt - 22], [-56, tt - 20], [-50, tt], [-56, tt + 20], [-52, tt + 22], [-38, tw + 3]], fc, { tension: 0.3 });
    else { shape(ctx, [[-40, tw - 2], [-58, tt - 6], [-62, tt - 4], [-55, tt + 1], [-62, tt + 6], [-58, tt + 7], [-40, tw + 3]], fc, { tension: 0.3 }); }
    shape(ctx, [[8, -14 + wv(8)], [-2, -26 + wv(-2)], [-10, -31 + wv(-10)], [-8, -22 + wv(-8)], [-14, -10 + wv(-14)]], fc, { tension: 0.4 });
    if (ich) { ctx.save(); ctx.translate(-14, 8 + wv(-14)); ctx.rotate(0.6 + Math.sin(ph + 1) * 0.2); shape(ctx, [[2, -2], [-10, 6], [-14, 12], [-2, 5]], fc, { tension: 0.3 }); ctx.restore(); }
    shape(ctx, P, col, { grad: [sh(col, -0.25), col, sh(col, 0.35), '#eef2f2'], sheen: [20, -8, 28, 6, 0.4], stroke: sh(col, -0.5) });
    ctx.save(); ctx.translate(30, 9 + wv(30)); ctx.rotate(0.7 + Math.sin(ph) * 0.12); shape(ctx, [[2, -2], [-12, 6], [-17, 14], [-3, 5]], fc, { tension: 0.3 }); ctx.restore();
    if (ich) { ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(63, 2); ctx.lineTo(42, 3); ctx.stroke(); ctx.fillStyle = '#f4efe0'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(60 - i * 3.2, 2); ctx.lineTo(59 - i * 3.2, 4); ctx.lineTo(58 - i * 3.2, 2); ctx.fill(); } eye(ctx, 37, -3 + wv(37), 4.4, t, { seed: o.seed, white: '#f0e8c8', iris: '#d8a040' }); }
    else { ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(58, 3); ctx.quadraticCurveTo(52, 6.5, 46, 4); ctx.stroke(); eye(ctx, 42, -1.5 + wv(42), 2.6, t, { seed: o.seed }); }
    end(ctx);
  }

  /* balenă; v: 'whale' (cu cocoașă, aripi lungi) | 'sperm' (cașalot) | 'blue' */
  function whale(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const v = o.v || 'whale', sp = o.speed === undefined ? 1 : o.speed, ph = o.ph !== undefined ? o.ph : t * (1.2 + 1.4 * sp) + (o.seed || 0) * 3;
    const wv = (xx) => Math.sin(ph - (xx + 50) * 0.04) * 3 * Math.pow(clamp((55 - xx) / 110, 0, 1.3), 1.8);
    const col = o.color || (v === 'sperm' ? '#5a5f6c' : v === 'blue' ? '#5f7f9e' : '#40566e');
    let P;
    if (v === 'sperm') P = [[58, -9], [59, 0], [56, 6], [44, 8], [24, 10], [0, 11], [-26, 7], [-46, 2], [-46, -2], [-28, -8], [-6, -11], [24, -12], [46, -12]];
    else P = [[58, 1], [55, -5], [40, -9], [10, -10.5], [-22, -8], [-46, -2], [-46, 2], [-24, 7], [4, 11], [32, 11], [50, 6]];
    P = P.map((p) => [p[0], p[1] + wv(p[0])]);
    const tw = wv(-46), tt = wv(-64), fc = sh(col, -0.1);
    shape(ctx, [[-44, tw - 2], [-62, tt - 9], [-67, tt - 7], [-60, tt + 1], [-67, tt + 9], [-62, tt + 10], [-44, tw + 3]], fc, { tension: 0.3 });
    if (v !== 'sperm') shape(ctx, [[-14, -8.5 + wv(-14)], [-19, -12 + wv(-19)], [-24, -7.5 + wv(-24)]], fc, { tension: 0.4 });
    shape(ctx, P, col, { grad: [sh(col, -0.2), col, sh(col, 0.2), v === 'sperm' ? sh(col, 0.25) : '#dfe6ea'], sheen: [16, -6, 34, 5, 0.3], stroke: sh(col, -0.5) });
    clipDraw(ctx, P, () => {
      ctx.strokeStyle = rgba(sh(col, -0.45), 0.5); ctx.lineWidth = LW * 0.9;
      if (v === 'sperm') { ctx.strokeStyle = rgba(sh(col, -0.45), 0.28); for (let i = 0; i < 6; i++) { const xx = 6 - i * 8; ctx.beginPath(); ctx.moveTo(xx, -10 + wv(xx)); ctx.quadraticCurveTo(xx - 2, 0, xx, 9 + wv(xx)); ctx.stroke(); } }
      else for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(52, 4 + i * 1.3); ctx.quadraticCurveTo(30, 8 + i * 1.6, 10, 9 + i * 0.6 + wv(10)); ctx.stroke(); }
      if (v === 'whale') { ctx.fillStyle = 'rgba(230,236,240,0.5)'; for (const [bx, by] of [[54, -4], [50, -7], [46, -8]]) { ctx.beginPath(); ctx.arc(bx, by, 1.1, 0, TAU); ctx.fill(); } }
    });
    const flen = v === 'whale' ? 28 : 13;
    ctx.save(); ctx.translate(28, 8 + wv(28)); ctx.rotate(0.55 + Math.sin(ph) * 0.15); shape(ctx, [[2, -2], [-flen * 0.4, 4], [-flen, 12], [-flen * 0.9, 14], [-3, 5]], v === 'whale' ? sh(col, 0.15) : fc, { tension: 0.3 }); ctx.restore();
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath();
    if (v === 'sperm') { ctx.moveTo(55, 7); ctx.lineTo(24, 9.5); } else { ctx.moveTo(57, 2); ctx.quadraticCurveTo(46, 7, 34, 4); } ctx.stroke();
    eye(ctx, v === 'sperm' ? 28 : 36, (v === 'sperm' ? -1 : 3) + wv(32), 1.9, t, { seed: o.seed });
    end(ctx);
  }

  /* plesiozaur */
  function plesio(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const ph = o.ph !== undefined ? o.ph : t * 2.2 + (o.seed || 0) * 3, col = o.color || '#5f7a6a';
    const nk = (k) => Math.sin(ph * 0.5 + k * 2) * 3 * k;
    const flip = (px, py, a, c) => { ctx.save(); ctx.translate(px, py); ctx.rotate(a); shape(ctx, [[3, -2], [-8, 3], [-24, 10], [-26, 13], [-6, 6]], c, { tension: 0.3 }); ctx.restore(); };
    flip(8, 4, 0.5 + Math.sin(ph) * 0.45, sh(col, -0.3)); flip(-20, 4, 0.5 + Math.sin(ph + 1) * 0.45, sh(col, -0.3));
    const neck = [[10, -4], [24, -9 + nk(0.3)], [38, -14 + nk(0.6)], [50, -16 + nk(1)]];
    const P = [[-46, 1], [-30, -6], [-10, -11], [10, -9], [14, -4], [10, 6], [-10, 9], [-30, 6]];
    shape(ctx, P, col, { grad: [sh(col, 0.2), col, sh(col, 0.3), '#e6e2cc'], sheen: [-8, -7, 18, 5, 0.35] });
    shape(ctx, taper(neck, 12, 6.5), col, { grad: [sh(col, 0.2), col, '#d8d4bc'], tension: 0.5 });
    const hx = 50, hy = -16 + nk(1);
    shape(ctx, [[hx - 3, hy - 4], [hx + 6, hy - 4.5], [hx + 13, hy - 1], [hx + 12, hy + 2], [hx + 2, hy + 3], [hx - 3, hy + 2]], col, { tension: 0.4 });
    ctx.fillStyle = '#f4efe0'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(hx + 4 + i * 2, hy + 0.6); ctx.lineTo(hx + 5 + i * 2, hy + 2.4); ctx.lineTo(hx + 6 + i * 2, hy + 0.6); ctx.fill(); }
    eye(ctx, hx + 3, hy - 1.5, 1.4, t, { seed: o.seed });
    flip(8, 4, 0.4 + Math.sin(ph + PI) * 0.45, sh(col, -0.08)); flip(-20, 4, 0.4 + Math.sin(ph + 1 + PI) * 0.45, sh(col, -0.08));
    end(ctx);
  }

  /* broască țestoasă; opts.land = true → țestoasă de uscat */
  function turtle(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const land = !!o.land, ph = o.ph !== undefined ? o.ph : t * (land ? 3 : 2) + (o.seed || 0) * 3, on = o.speed === 0 ? 0 : 1;
    const shell = land ? '#7a6a3a' : '#6a7a3e', skin = land ? '#8a8a5a' : '#7aa08a';
    const by = land ? -16 : 0;
    if (land) {
      leg(ctx, -14, by + 4, 12, 7, ph + PI, sh(skin, -0.25), { on, stride: 4, lift: 3, foot: 'stump', thigh: 1.1 });
      leg(ctx, 16, by + 4, 12, 7, ph, sh(skin, -0.25), { on, stride: 4, lift: 3, foot: 'stump', thigh: 1.1 });
    } else {
      const pa = (a) => { ctx.save(); ctx.translate(14, 3); ctx.rotate(a); shape(ctx, [[2, -3], [-14, 2], [-30, 12], [-28, 15], [-4, 6]], sh(skin, -0.25), { tension: 0.3 }); ctx.restore(); };
      pa(0.2 + Math.sin(ph + 0.6) * 0.6);
    }
    /* cap */
    const hb = Math.sin(t * 1.3 + (o.seed || 0)) * 1.2;
    const neck = [[18, by + 1], [27, by - 1 + hb], [34, by - 2 + hb]];
    shape(ctx, taper(neck, 9, 8), skin, { tension: 0.5 });
    shape(ctx, [[30, by - 6 + hb], [38, by - 7 + hb], [43, by - 3 + hb], [42, by + 1 + hb], [34, by + 2 + hb], [29, by]], skin, { tension: 0.5, sheen: true });
    eye(ctx, 38, by - 3.6 + hb, 1.5, t, { seed: o.seed });
    ctx.strokeStyle = sh(skin, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(43, by - 0.5 + hb); ctx.lineTo(36, by + 0.5 + hb); ctx.stroke();
    /* carapace */
    const S = land ? [[-26, by + 6], [-24, by - 6], [-12, by - 18], [4, by - 20], [18, by - 12], [24, by + 4], [0, by + 8]] : [[-28, 2], [-22, -7], [-4, -13], [14, -11], [26, -3], [24, 4], [0, 6]];
    shape(ctx, S, shell, { sheen: true, belly: '#d8c890' });
    clipDraw(ctx, S, () => {
      ctx.strokeStyle = rgba(sh(shell, -0.55), 0.8); ctx.lineWidth = LW * 1.1; ctx.fillStyle = rgba(sh(shell, 0.25), 0.5);
      const cy0 = land ? by - 8 : -4;
      for (let i = -2; i <= 2; i++) { const cx = i * 10, cy = cy0 - (2 - Math.abs(i)) * 1.5; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + PI / 6; ctx.lineTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 5); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-30, cy0 + 7); ctx.quadraticCurveTo(0, cy0 + 12, 30, cy0 + 7); ctx.stroke();
    });
    if (land) {
      leg(ctx, -10, by + 4, 12, 7.5, ph, skin, { on, stride: 4, lift: 3, foot: 'stump', thigh: 1.1 });
      leg(ctx, 12, by + 4, 12, 7.5, ph + PI, skin, { on, stride: 4, lift: 3, foot: 'stump', thigh: 1.1 });
    } else {
      ctx.save(); ctx.translate(14, 4); ctx.rotate(0.35 + Math.sin(ph) * 0.65); shape(ctx, [[2, -3], [-14, 2], [-32, 13], [-30, 16], [-4, 6]], skin, { tension: 0.3, sheen: true }); ctx.restore();
      ctx.save(); ctx.translate(-22, 3); ctx.rotate(0.6 + Math.sin(ph + 1) * 0.3); shape(ctx, [[2, -2], [-10, 3], [-12, 7], [-2, 4]], skin, { tension: 0.3 }); ctx.restore();
    }
    end(ctx);
  }

  /* meduză (verticală) */
  function jelly(ctx, x, y, size, t, o) {
    o = o || {}; const s0 = o.seed || 0, p = t * 2.2 + s0 * 5, pulse = Math.sin(p);
    const col = o.color || '#ff9ecf';
    if (o.lightsOnly) { begin(ctx, x, y, size, o); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, -4, 34, col, 0.35); end(ctx); return; }
    begin(ctx, x, y, size, o);
    const rx = 22 * (1 + 0.08 * pulse), ry = 17 * (1 - 0.1 * pulse);
    /* tentacule */
    ctx.save(); ctx.globalAlpha *= 0.75; ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const bx = (i / 8 - 0.5) * rx * 1.7; ctx.strokeStyle = rgba(sh(col, 0.2), 0.7); ctx.lineWidth = LW * 0.8; ctx.beginPath(); ctx.moveTo(bx, 2);
      for (let k = 1; k <= 10; k++) ctx.lineTo(bx + Math.sin(p - k * 0.6 + i) * k * 0.7, 2 + k * 6.2);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const bx = (i / 3 - 0.5) * rx * 0.7, pts = []; for (let k = 0; k <= 6; k++) pts.push([bx + Math.sin(p - k * 0.5 + i * 2) * k * 0.9, 1 + k * 6]);
      shape(ctx, taper(pts, 6, 2), sh(col, -0.05), { tension: 0.5, line: false, grad: [rgba(col, 0.9), rgba(sh(col, 0.3), 0.5)] });
    }
    ctx.restore();
    /* clopot */
    ctx.beginPath(); ctx.moveTo(-rx, 2); ctx.bezierCurveTo(-rx, -ry * 1.35, rx, -ry * 1.35, rx, 2);
    for (let i = 8; i >= 0; i--) { const xx = (i / 8 - 0.5) * 2 * rx; ctx.quadraticCurveTo(xx + rx / 8, 5.5, xx, 2); }
    ctx.closePath();
    const g = ctx.createRadialGradient(-rx * 0.3, -ry * 0.7, 1, 0, -ry * 0.2, rx * 1.2); g.addColorStop(0, rgba('#ffffff', 0.85)); g.addColorStop(0.35, rgba(col, 0.75)); g.addColorStop(1, rgba(sh(col, -0.3), 0.55));
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = rgba(sh(col, 0.4), 0.9); ctx.lineWidth = LW; ctx.stroke();
    ctx.strokeStyle = rgba(sh(col, -0.35), 0.45); ctx.lineWidth = LW * 1.2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc((i - 1.5) * 6, -ry * 0.3, 4, 0, TAU); ctx.stroke(); }
    gloss(ctx, -rx * 0.35, -ry * 0.75, rx * 0.4, ry * 0.25, 0.55);
    end(ctx);
  }

  /* calmar; v: 'squid' | 'giant' | 'ortho' (nautiloid cu cochilie dreaptă) */
  function squid(ctx, x, y, size, t, o) {
    o = o || {}; const v = o.v || 'squid', s0 = o.seed || 0, p = t * 2 + s0 * 4, jet = Math.max(0, Math.sin(p)) * 1;
    const col = o.color || (v === 'ortho' ? '#c89a6a' : v === 'giant' ? '#b8584a' : '#d0705e');
    if (o.lightsOnly) { if (v !== 'giant') return; begin(ctx, x, y, size, o); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 4, -2, 12, '#9fdcff', 0.5); end(ctx); return; }
    begin(ctx, x, y, size, o);
    /* brațe (spre dreapta) */
    const arms = v === 'ortho' ? 9 : 8;
    for (let i = 0; i < arms; i++) {
      const spread = (i / (arms - 1) - 0.5) * (12 - jet * 6), pts = [];
      for (let k = 0; k <= 6; k++) pts.push([12 + k * (v === 'ortho' ? 4 : 5.5), spread * (0.4 + k * 0.2) + Math.sin(p * 1.3 - k * 0.7 + i) * k * 0.5]);
      shape(ctx, taper(pts, 4.5, 1), i % 2 ? col : sh(col, -0.15), { tension: 0.5, lw: 0.6 });
    }
    if (v !== 'ortho') for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 9; k++) pts.push([12 + k * 6.6, s * (2 + k * 0.8) + Math.sin(p - k * 0.5) * k * 0.6]); stroke2(ctx, pts, 1.8, sh(col, -0.1)); const e = pts[9]; ctx.fillStyle = sh(col, -0.2); ctx.beginPath(); ctx.ellipse(e[0], e[1], 4, 2.2, 0, 0, TAU); ctx.fill(); }
    if (v === 'ortho') {
      /* cochilie conică lungă */
      const S = [[16, -9], [-10, -7.5], [-40, -5], [-62, -2], [-66, 0], [-62, 2], [-40, 5], [-10, 7.5], [16, 9]];
      shape(ctx, S, '#e8d6b0', { tension: 0.2, sheen: [-10, -4, 30, 3, 0.45] });
      clipDraw(ctx, S, () => { ctx.strokeStyle = 'rgba(140,90,50,0.55)'; ctx.lineWidth = LW * 1.4; for (let i = 0; i < 10; i++) { const xx = 10 - i * 7.5; ctx.beginPath(); ctx.moveTo(xx, -10); ctx.quadraticCurveTo(xx - 2, 0, xx, 10); ctx.stroke(); } ctx.strokeStyle = 'rgba(160,80,40,0.45)'; ctx.lineWidth = LW * 2.2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(14 - i * 13, -9); ctx.lineTo(8 - i * 13, -4); ctx.stroke(); } });
      shape(ctx, [[12, -7], [20, -6], [22, 0], [20, 6], [12, 7]], col, { tension: 0.4 });
      eye(ctx, 17, -2, 2.2, t, { seed: s0, white: true });
    } else {
      /* manta (spre stânga) cu aripioare */
      const L = 1 + jet * 0.05, W2 = 1 - jet * 0.12;
      shape(ctx, [[-50 * L, -2], [-66 * L, -12], [-56 * L, 0], [-66 * L, 12], [-50 * L, 2]], sh(col, -0.1), { tension: 0.3 });
      const M = [[14, -9 * W2], [-10, -10 * W2], [-36, -7 * W2], [-56 * L, -2], [-60 * L, 0], [-56 * L, 2], [-36, 7 * W2], [-10, 10 * W2], [14, 9 * W2]];
      shape(ctx, M, col, { grad: [sh(col, 0.25), col, sh(col, -0.25)], sheen: [-14, -5, 26, 4, 0.4] });
      clipDraw(ctx, M, () => { ctx.fillStyle = rgba(sh(col, -0.4), 0.45); for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(10 - (i * 37 % 64), ((i * 13) % 14) - 7, 1.3, 0, TAU); ctx.fill(); } });
      shape(ctx, [[10, -8], [20, -7], [22, 0], [20, 7], [10, 8]], sh(col, 0.05), { tension: 0.4 });
      eye(ctx, 14, -1, v === 'giant' ? 4.8 : 3.2, t, { seed: s0, white: '#f6eee2', iris: v === 'giant' ? '#2a3a5a' : '#2a1a10' });
    }
    end(ctx);
  }

  /* amonit */
  function ammonite(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 2 + s0 * 4, col = o.color || '#d9b98a';
    const bob = Math.sin(p * 0.6) * 0.06;
    ctx.rotate(bob);
    for (let i = 0; i < 8; i++) { const pts = []; const sp = (i / 7 - 0.5) * 8; for (let k = 0; k <= 5; k++) pts.push([26 + k * 4.4, 10 + sp * (0.5 + k * 0.15) + Math.sin(p * 1.4 - k * 0.8 + i) * k * 0.5]); shape(ctx, taper(pts, 3.6, 1), i % 2 ? '#d8846a' : '#c06c56', { tension: 0.5, lw: 0.6 }); }
    shape(ctx, [[18, 2], [28, 2], [33, 8], [28, 16], [18, 16]], '#d8846a', { tension: 0.4 });
    eye(ctx, 26, 5, 2.4, t, { seed: s0, white: true });
    const R = 30;
    ctx.beginPath(); ctx.arc(-4, 0, R, 0, TAU);
    paint(ctx, col, -R, R, { sheen: [-14, -14, 20, 14, 0.45] });
    ctx.save(); ctx.beginPath(); ctx.arc(-4, 0, R, 0, TAU); ctx.clip();
    ctx.lineCap = 'round';
    for (let i = 0; i < 44; i++) { const a = i / 44 * TAU * 3.2; const r = R * Math.exp(-a * 0.17); const r2 = r * Math.exp(-TAU * 0.17); const cx = -4, ca = Math.cos(a), sa = Math.sin(a); ctx.strokeStyle = rgba('#7a5230', 0.45); ctx.lineWidth = LW * 1.3 * (r / R + 0.3); ctx.beginPath(); ctx.moveTo(cx + ca * r * 0.98, sa * r * 0.98); ctx.lineTo(cx + ca * r2 * 1.02, sa * r2 * 1.02); ctx.stroke(); }
    ctx.strokeStyle = rgba('#5a3a1a', 0.7); ctx.lineWidth = LW * 1.4; ctx.beginPath(); for (let a = 0; a < TAU * 3.4; a += 0.12) { const r = R * Math.exp(-a * 0.17); ctx.lineTo(-4 + Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
    ctx.restore();
    end(ctx);
  }

  /* trilobit (văzut de sus, în perspectivă, pe fundul mării) */
  function trilobite(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 8 + s0 * 3, col = o.color || '#8a6c4e';
    ctx.scale(1, 0.62);
    ctx.strokeStyle = sh(col, -0.3); ctx.lineWidth = LW * 1.4;
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const xx = 22 - i * 8, w = Math.sin(p + i * 0.9 + (s > 0 ? PI : 0)) * 2; ctx.beginPath(); ctx.moveTo(xx, s * 18); ctx.lineTo(xx + w, s * 25); ctx.stroke(); }
    ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(40, -6); ctx.quadraticCurveTo(52, -14 + Math.sin(p * 0.3) * 2, 58, -18); ctx.moveTo(40, 6); ctx.quadraticCurveTo(52, 14, 58, 18 + Math.sin(p * 0.3) * 2); ctx.stroke();
    const B = [[42, 0], [38, -20], [20, -26], [12, -30], [-30, -18], [-46, -8], [-50, 0], [-46, 8], [-30, 18], [12, 30], [20, 26], [38, 20]];
    shape(ctx, B, col, { tension: 0.45 });
    /* cefalon */
    clipDraw(ctx, B, () => {
      ctx.fillStyle = rgba(sh(col, -0.25), 0.6);
      for (let i = 0; i < 9; i++) { const xx = 14 - i * 6; ctx.fillRect(xx - 0.8, -30, 1.6, 60); }
      const ax = ctx.createLinearGradient(0, -9, 0, 9); ax.addColorStop(0, sh(col, 0.45)); ax.addColorStop(1, sh(col, -0.15));
      ctx.fillStyle = ax; ctx.beginPath(); ctx.ellipse(-4, 0, 44, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(sh(col, -0.35), 0.5); for (let i = 0; i < 9; i++) ctx.fillRect(14 - i * 6 - 0.6, -8, 1.2, 16);
      const hg = ctx.createRadialGradient(28, -6, 2, 28, 0, 20); hg.addColorStop(0, sh(col, 0.4)); hg.addColorStop(1, sh(col, -0.1));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(18, -30); ctx.quadraticCurveTo(50, -24, 44, 0); ctx.quadraticCurveTo(50, 24, 18, 30); ctx.quadraticCurveTo(24, 0, 18, -30); ctx.fill();
      ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.stroke();
      ctx.fillStyle = sh(col, 0.5); ctx.beginPath(); ctx.ellipse(32, 0, 9, 7, 0, 0, TAU); ctx.fill();
    });
    ctx.strokeStyle = sh(col, -0.45); ctx.lineWidth = LW * 1.6; ctx.beginPath(); ctx.moveTo(18, -27); ctx.quadraticCurveTo(0, -36, -8, -34); ctx.moveTo(18, 27); ctx.quadraticCurveTo(0, 36, -8, 34); ctx.stroke();
    for (const s of [-1, 1]) { ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(26, s * 13, 4, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(25, s * 13 - 1, 1.2, 0, TAU); ctx.fill(); }
    end(ctx);
  }

  /* anomalocaris (văzut de sus, ușor înclinat) */
  function anomalo(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 5 + s0 * 3, col = o.color || '#c0603e';
    ctx.scale(1, 0.7);
    /* lobii laterali în val */
    for (let i = 0; i < 11; i++) for (const s of [-1, 1]) { const xx = 24 - i * 6, w = Math.sin(p - i * 0.6) * 0.35; ctx.save(); ctx.translate(xx, s * (11 - i * 0.4)); ctx.rotate(s * (0.25 + w)); shape(ctx, [[3, 0], [-2, s * 1], [-6, s * 14], [2, s * 13]], i % 2 ? sh(col, 0.1) : sh(col, -0.05), { tension: 0.4, lw: 0.7 }); ctx.restore(); }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(-42, s * 2); ctx.rotate(PI + s * (0.35 + k * 0.28) + Math.sin(p) * 0.1); shape(ctx, [[0, -2], [18, -3], [20, 0], [18, 3], [0, 2]], '#d8784a', { tension: 0.4, lw: 0.7 }); ctx.restore(); }
    const B = [[36, 0], [30, -11], [0, -12], [-30, -8], [-44, 0], [-30, 8], [0, 12], [30, 11]];
    shape(ctx, B, col, { sheen: [10, -6, 26, 5, 0.4] });
    clipDraw(ctx, B, () => { ctx.strokeStyle = rgba(sh(col, -0.4), 0.5); ctx.lineWidth = LW; for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.moveTo(24 - i * 6, -14); ctx.lineTo(24 - i * 6, 14); ctx.stroke(); } });
    for (const s of [-1, 1]) {
      stroke2(ctx, [[32, s * 7], [38, s * 16]], 2.4, sh(col, -0.2)); eye(ctx, 38, s * 17, 4, t, { seed: s0 + s, white: '#e8dcc0', iris: '#2a1a10', noBlink: true });
      const cu = Math.sin(p * 0.5) * 0.3, pts = []; for (let k = 0; k <= 8; k++) { const a = k * (0.32 + cu * 0.1); pts.push([36 + Math.cos(a * s * 0 + a) * 4 + k * 3 * Math.cos(a), s * (3 + k * 2.6 * Math.sin(a))]); }
      shape(ctx, taper(pts, 5, 1.6), '#e08a5a', { tension: 0.5, lw: 0.8 });
      ctx.strokeStyle = '#f4e0c0'; ctx.lineWidth = LW * 0.8; for (let k = 2; k < 8; k++) { const q = pts[k]; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 1, q[1] - s * 3); ctx.stroke(); }
    }
    end(ctx);
  }

  /* caracatiță „Dumbo” (verticală) */
  function dumbo(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 2.4 + s0 * 4, col = o.color || '#f0a07a', fl = Math.sin(p * 1.6) * 0.5;
    ctx.globalAlpha *= 0.92;
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 15, -22); ctx.rotate(s * (0.4 + fl)); shape(ctx, [[0, -3], [s * 16, -10], [s * 22, -2], [s * 14, 5], [0, 3]], sh(col, -0.05), { tension: 0.5, sheen: true }); ctx.restore(); }
    const sk = 1 + Math.sin(p) * 0.12;
    const W2 = [[-18, -8], [-26 * sk, 10], [-20 * sk, 18], [-8, 13], [0, 20], [8, 13], [20 * sk, 18], [26 * sk, 10], [18, -8]];
    shape(ctx, W2, sh(col, 0.08), { tension: 0.5, grad: [col, sh(col, 0.25), rgba(sh(col, 0.3), 0.8)] });
    const H2 = [[-18, -6], [-20, -24], [-10, -38], [10, -38], [20, -24], [18, -6]];
    shape(ctx, H2, col, { tension: 0.55, sheen: [-6, -28, 10, 8, 0.45] });
    for (const s of [-1, 1]) eye(ctx, s * 9, -14, 3.4, t, { seed: s0, white: '#fff3e8' });
    end(ctx);
  }

  /* castravete de mare (pe fund) */
  function cucumber(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 1.5 + s0 * 3, col = o.color || '#d49a86', sq = Math.sin(p) * 0.06;
    ctx.globalAlpha *= 0.92;
    const B = [[44 * (1 + sq), -6], [30, -15], [0, -17], [-30, -14], [-46, -6], [-44, 0], [0, 1], [42, 0]];
    shape(ctx, B, col, { grad: [sh(col, 0.35), col, sh(col, -0.2)], sheen: [0, -12, 30, 4, 0.4] });
    ctx.fillStyle = sh(col, 0.25); ctx.strokeStyle = sh(col, -0.35); ctx.lineWidth = LW * 0.8;
    for (let i = 0; i < 8; i++) { const xx = 34 - i * 10, h = 5 + Math.sin(p * 1.3 + i) * 1.5; ctx.beginPath(); ctx.moveTo(xx - 2.5, -14); ctx.quadraticCurveTo(xx, -14 - h * 2, xx + 2.5, -14); ctx.fill(); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { const a = -1 + i * 0.4 + Math.sin(p * 2 + i) * 0.15; stroke2(ctx, [[44, -6], [44 + Math.cos(a) * 7, -6 + Math.sin(a) * 7]], 1.6, sh(col, 0.15), { line: false }); }
    end(ctx);
  }

  /* amfipod / crevete (crustaceu mic, curbat) */
  function shrimp(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, p = t * 7 + s0 * 3, col = o.color || '#f0a070', cu = Math.sin(t * 1.5 + s0) * 0.05;
    ctx.strokeStyle = sh(col, -0.25); ctx.lineWidth = LW * 1.3;
    for (let i = 0; i < 6; i++) { const xx = 22 - i * 8; ctx.beginPath(); ctx.moveTo(xx, 8); ctx.lineTo(xx - 2 + Math.sin(p + i) * 2.5, 20); ctx.stroke(); }
    ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(36, -6); ctx.quadraticCurveTo(50, -20 + Math.sin(p * 0.4) * 3, 62, -22); ctx.moveTo(36, -4); ctx.quadraticCurveTo(52, -10, 60, -6); ctx.stroke();
    const segs = []; for (let i = 0; i < 8; i++) { const a = PI * (0.15 + i * (0.1 + cu)); segs.push([Math.cos(a) * 34 - 4 + (i === 0 ? 4 : 0), -Math.sin(a) * 22 + 12]); }
    for (let i = segs.length - 1; i >= 0; i--) { const [sx, sy] = segs[i]; ctx.beginPath(); ctx.ellipse(sx, sy, 10 - i * 0.6, 9 - i * 0.5, 0, 0, TAU); paint(ctx, col, sy - 9, sy + 9, { sheen: [sx - 3, sy - 5, 5, 3, 0.45], lw: 0.8 }); }
    const tl = segs[segs.length - 1]; shape(ctx, [[tl[0], tl[1]], [tl[0] - 10, tl[1] + 6], [tl[0] - 4, tl[1] + 10]], sh(col, 0.1), { lw: 0.8 });
    eye(ctx, 32, -4, 2.6, t, { seed: s0 });
    end(ctx);
  }

  /* pește-pescar (cu „undiță” luminoasă) */
  function angler(ctx, x, y, size, t, o) {
    o = o || {}; const s0 = o.seed || 0, p = t * 2 + s0 * 3, lx = 44 + Math.sin(p * 0.7) * 3, ly = -36 + Math.cos(p * 0.9) * 3, fl = 0.6 + 0.4 * Math.sin(t * 3 + s0);
    if (o.lightsOnly) { begin(ctx, x, y, size, o); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, lx, ly, 26, '#8dffe6', 0.75 * fl); glowDot(ctx, lx, ly, 8, '#ffffff', 0.9); end(ctx); return; }
    begin(ctx, x, y, size, o);
    const col = o.color || '#3a2e44', wv = Math.sin(p * 2) * 1.5;
    shape(ctx, [[-30, 0], [-46, -12 + wv], [-50, 0 + wv], [-46, 12 + wv], [-30, 3]], sh(col, -0.1), { tension: 0.4 });
    shape(ctx, [[-6, -22], [-18, -26], [-26, -12]], sh(col, -0.1), { tension: 0.4 });
    const B = [[36, -4], [30, -20], [10, -27], [-14, -22], [-30, -6], [-30, 4], [-14, 18], [10, 24], [30, 18], [40, 10]];
    shape(ctx, B, col, { grad: [sh(col, 0.15), col, sh(col, -0.35)], sheen: [4, -16, 18, 6, 0.25] });
    ctx.fillStyle = '#140c18'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.quadraticCurveTo(26, 8, 40, 14); ctx.quadraticCurveTo(44, 7, 40, 0); ctx.fill();
    ctx.fillStyle = '#f4f0e8'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 2.4, 3.5 + i * 0.4); ctx.lineTo(32 + i * 2.4, 10); ctx.lineTo(33 + i * 2.4, 3.5); ctx.fill(); ctx.beginPath(); ctx.moveTo(31 + i * 2.4, 14); ctx.lineTo(32.5 + i * 2.4, 7); ctx.lineTo(34 + i * 2.4, 14); ctx.fill(); }
    ctx.save(); ctx.translate(4, 8); ctx.rotate(0.4 + Math.sin(p * 2.5) * 0.3); shape(ctx, [[0, -2], [-10, 2], [-12, 8], [0, 3]], sh(col, 0.1), { tension: 0.4 }); ctx.restore();
    ctx.strokeStyle = sh(col, 0.25); ctx.lineWidth = LW * 1.4; ctx.beginPath(); ctx.moveTo(18, -24); ctx.quadraticCurveTo(28, -44, lx, ly); ctx.stroke();
    ctx.fillStyle = '#c8fff0'; ctx.beginPath(); ctx.arc(lx, ly, 3.4, 0, TAU); ctx.fill();
    eye(ctx, 24, -8, 2.2, t, { seed: s0, color: '#d8e0ff', noBlink: true });
    end(ctx);
  }

  /* scorpion de uscat (din profil); v: 'sea' → scorpion de mare (euripterid) */
  function scorpion(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const sea = o.v === 'sea', s0 = o.seed || 0, ph = o.ph !== undefined ? o.ph : t * 9 + s0 * 3, on = o.speed === 0 ? 0 : 1;
    const col = o.color || (sea ? '#7a5a4a' : '#5a3e2a');
    const by = sea ? 0 : -14;
    if (!sea) for (let i = 0; i < 4; i++) leg(ctx, 10 - i * 7, by + 2, 18, 2.2, ph + i * 1.6 + PI, sh(col, -0.25), { on, stride: 3, lift: 3, bend: -1, thigh: 1, gy: 0 });
    /* coada */
    const tail = [];
    if (sea) for (let i = 0; i <= 6; i++) tail.push([-24 - i * 6, Math.sin(t * 3 + s0 - i * 0.5) * i * 0.8]);
    else { const cu = Math.sin(t * 1.6 + s0) * 0.12; for (let i = 0; i <= 6; i++) { const a = PI * (0.98 - i * (0.17 + cu)); tail.push([-22 + Math.cos(a) * 20 + 2, by - 2 - Math.sin(a) * 26 + (i ? 0 : 0)]); } }
    for (let i = tail.length - 1; i >= 1; i--) { const [sx, sy] = tail[i]; ctx.beginPath(); ctx.ellipse(sx, sy, 5.2 - i * 0.25, 4.6 - i * 0.25, 0, 0, TAU); paint(ctx, col, sy - 5, sy + 5, { sheen: [sx - 1, sy - 2, 3, 2, 0.4], lw: 0.8 }); }
    const tp = tail[tail.length - 1];
    if (sea) shape(ctx, [[tp[0], tp[1] - 3], [tp[0] - 14, tp[1]], [tp[0], tp[1] + 3]], sh(col, 0.15), { lw: 0.8 });
    else { ctx.beginPath(); ctx.ellipse(tp[0] + 4, tp[1] + 3, 4.5, 3.5, 0.6, 0, TAU); paint(ctx, '#b07040', tp[1], tp[1] + 6, { lw: 0.8 }); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = LW * 1.2; ctx.beginPath(); ctx.moveTo(tp[0] + 7, tp[1] + 5); ctx.quadraticCurveTo(tp[0] + 12, tp[1] + 6, tp[0] + 11, tp[1] + 10); ctx.stroke(); }
    if (sea) for (const s of [0, 1]) { ctx.save(); ctx.translate(-2, 6); ctx.rotate(0.6 + Math.sin(t * 3 + s0 + s * 2) * 0.4); shape(ctx, [[0, -2], [-14, 2], [-22, 8], [-12, 6], [0, 3]], sh(col, s ? 0 : -0.25), { tension: 0.4, lw: 0.8 }); ctx.restore(); }
    const B = sea ? [[20, 0], [16, -9], [0, -11], [-24, -7], [-28, 0], [-24, 6], [0, 9], [16, 8]] : [[20, by], [14, by - 9], [-4, by - 10], [-24, by - 6], [-24, by + 3], [-4, by + 5], [14, by + 4]];
    shape(ctx, B, col, { sheen: true });
    clipDraw(ctx, B, () => { ctx.strokeStyle = rgba(sh(col, -0.5), 0.55); ctx.lineWidth = LW; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(8 - i * 6, by - 14); ctx.lineTo(8 - i * 6, by + 12); ctx.stroke(); } });
    /* clești */
    const cl = Math.sin(t * 2 + s0) * 0.15;
    for (const s of [0, 1]) { const c2 = s ? col : sh(col, -0.25); stroke2(ctx, [[16, by + 1], [26, by + 4 + s * 2], [32, by - 1 + s * 2]], 3, c2); ctx.save(); ctx.translate(34, by - 1 + s * 2); ctx.rotate(-0.2 + cl); shape(ctx, [[-4, -3], [6, -5], [12, -2], [4, 0], [12, 2], [6, 5], [-4, 3]], c2, { tension: 0.35, lw: 0.8, sheen: true }); ctx.restore(); }
    eye(ctx, 16, by - 5, 1.4, t, { seed: s0, noBlink: true });
    if (!sea) for (let i = 0; i < 4; i++) leg(ctx, 8 - i * 7, by + 3, 18, 2.4, ph + i * 1.6, col, { on, stride: 3, lift: 3, bend: -1, thigh: 1 });
    end(ctx);
  }

  /* bacterii / cianobacterii — o colonie */
  function bacteria(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0;
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4 + s0, r = 8 + (i * 7) % 26, bx = Math.cos(a) * r + Math.sin(t * 0.8 + i) * 3, by2 = Math.sin(a) * r * 0.7 + Math.cos(t * 0.7 + i) * 3, rot = a + t * 0.4 * (i % 2 ? 1 : -1);
      const col = i % 3 === 0 ? '#5ad8a0' : i % 3 === 1 ? '#7ae0d0' : '#a0e070';
      ctx.save(); ctx.translate(bx, by2); ctx.rotate(rot);
      const L = i % 2 ? 12 : 6;
      ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = LW * 0.6; ctx.beginPath(); ctx.moveTo(-L, 0); for (let k = 1; k <= 6; k++) ctx.lineTo(-L - k * 2.4, Math.sin(t * 6 + k + i) * 2); ctx.stroke();
      A.roundRectPath(ctx, -L, -4, L * 2, 8, 4); paint(ctx, col, -4, 4, { grad: [rgba(sh(col, 0.4), 0.9), rgba(col, 0.75), rgba(sh(col, -0.3), 0.8)], stroke: rgba(sh(col, -0.4), 0.8), lw: 0.8 });
      ctx.fillStyle = rgba(sh(col, -0.4), 0.6); ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, TAU); ctx.fill();
      ctx.restore();
    }
    end(ctx);
  }

  /* ==========================================================
     ANIMALE DE USCAT
     ========================================================== */

  /* T. rex / teropod; v: 'trex' | 'allo' | 'small' (Coelophysis) */
  function trex(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const v = o.v || 'trex', small = v === 'small';
    const col = o.color || (small ? '#b9944e' : v === 'allo' ? '#a06a3c' : '#5f7d3a');
    const G = gait(t, o, small ? 6 : 4), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const bob = -Math.abs(Math.cos(ph)) * 2 * on, sw = Math.sin(t * 1.6 + s0) * 3;
    const legO = { on, bend: -1, stride: 13, lift: 7, foot: 'claw', thigh: small ? 1.5 : 1.6, haunch: 2.6, hup: 0.3 };
    const lw = small ? 5 : 9, ll = small ? 48 : 45, hy = small ? -46 : -43;
    leg(ctx, -6, hy + bob, ll, lw, ph + PI, sh(col, -0.28), legO);
    ctx.save(); ctx.translate(0, bob);
    const k = small ? 0.72 : 1, yy = (v0) => hy + (v0 + 43) * k;
    const body = [[-62, yy(-50) + sw], [-42, yy(-54) + sw * 0.6], [-22, yy(-63)], [0, yy(-64)], [14, yy(-60)], [22, yy(-64)], [28, yy(-73)], [42, yy(-75)], [55, yy(-71)], [60, yy(-63)], [57, yy(-57)], [42, yy(-55)], [33, yy(-51)], [22, yy(-45)], [10, yy(-36)], [-8, yy(-35)], [-22, yy(-41)], [-42, yy(-47) + sw * 0.6], [-60, yy(-49) + sw]];
    if (small) for (const p of body) if (p[0] > 18) p[0] += (p[0] - 18) * 0.15, p[1] -= (p[0] - 18) * 0.25;
    /* braț îndepărtat */
    stroke2(ctx, [[18, yy(-46)], [24, yy(-41)], [27, yy(-43)]], small ? 2.5 : 3.4, sh(col, -0.3));
    shape(ctx, body, col, { belly: small ? '#f0dcb0' : '#d8d0a0', sheen: [0, yy(-58), 26, 6, 0.3] });
    clipDraw(ctx, body, () => { ctx.strokeStyle = rgba(sh(col, -0.45), 0.5); ctx.lineWidth = LW * 2.2; for (let i = 0; i < 9; i++) { const xx = -46 + i * 8; ctx.beginPath(); ctx.moveTo(xx, yy(-70)); ctx.quadraticCurveTo(xx + 3, yy(-60), xx - 1, yy(-54)); ctx.stroke(); } });
    const hx = small ? 1.15 : 1, hd = (a, b) => [a, b];
    const ex = small ? 50 : 45, ey = small ? yy(-75) - 6 : yy(-68);
    ctx.strokeStyle = sh(col, -0.55); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(small ? 64 : 58, small ? yy(-61) - 9 : yy(-59)); ctx.quadraticCurveTo(48, yy(-56) - (small ? 6 : 0), 38, yy(-58) - (small ? 4 : 0)); ctx.stroke();
    ctx.fillStyle = '#f4ecd6'; for (let i = 0; i < 5; i++) { const tx = (small ? 62 : 56) - i * 3.4, ty = small ? yy(-60) - 8 + i * 0.6 : yy(-58.5) + i * 0.3; ctx.beginPath(); ctx.moveTo(tx - 1.2, ty); ctx.lineTo(tx, ty + 2.4); ctx.lineTo(tx + 1.2, ty); ctx.fill(); }
    eye(ctx, ex, ey, small ? 1.8 : 2.4, t, { seed: s0, iris: '#e0a030' });
    ctx.strokeStyle = rgba(sh(col, -0.5), 0.7); ctx.lineWidth = LW * 1.4; ctx.beginPath(); ctx.moveTo(ex - 3, ey - 3.5); ctx.lineTo(ex + 4, ey - 4); ctx.stroke();
    stroke2(ctx, [[18, yy(-47)], [25, yy(-42)], [29, yy(-44)]], small ? 2.8 : 3.8, col);
    ctx.restore();
    leg(ctx, -4, hy + bob, ll, lw * 1.05, ph, col, legO);
    end(ctx);
    void hx; void hd;
  }

  /* sauropod (gât lung) */
  function sauropod(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#8a9a7c', G = gait(t, o, 2.4), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const legO = { on, bend: 1, stride: 7, lift: 4, foot: 'stump', thigh: 1.15, split: 0.55, haunch: 1.9 };
    const nk = Math.sin(t * 0.7 + s0) * 3, tl = Math.sin(t * 1.1 + s0) * 4;
    leg(ctx, -24, -38, 38, 11, ph + PI, sh(col, -0.28), legO); leg(ctx, 14, -38, 38, 10, ph + PI * 1.5, sh(col, -0.28), Object.assign({}, legO, { bend: -1 }));
    const body = [[-66, -30 + tl], [-50, -42 + tl * 0.5], [-30, -60], [-6, -66], [12, -62], [24, -66], [36, -82 + nk * 0.4], [46, -98 + nk], [54, -106 + nk], [62, -106 + nk], [67, -101 + nk], [64, -97 + nk], [56, -96 + nk], [49, -90 + nk], [40, -74 + nk * 0.4], [30, -56], [20, -40], [0, -32], [-22, -34], [-38, -40], [-52, -36 + tl * 0.5]];
    shape(ctx, body, col, { belly: '#d8d4b8', sheen: [-8, -58, 26, 7, 0.32] });
    clipDraw(ctx, body, () => { ctx.fillStyle = rgba(sh(col, -0.35), 0.4); for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(-40 + (i * 37) % 70, -62 + (i * 11) % 12, 3.2, 2.2, 0, 0, TAU); ctx.fill(); } });
    eye(ctx, 60, -102 + nk, 1.8, t, { seed: s0 });
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(66, -99 + nk); ctx.lineTo(58, -98.5 + nk); ctx.stroke();
    leg(ctx, -20, -38, 38, 12, ph, col, legO); leg(ctx, 18, -38, 38, 11, ph + PI * 0.5, col, Object.assign({}, legO, { bend: -1 }));
    end(ctx);
  }

  /* stegozaur */
  function stego(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#7d8a4c', G = gait(t, o, 3), ph = G.ph, on = G.on, s0 = o.seed || 0, tl = Math.sin(t * 1.3 + s0) * 3;
    const legO = { on, stride: 7, lift: 4, foot: 'stump', thigh: 1.2, haunch: 2 };
    leg(ctx, -16, -34, 34, 9, ph + PI, sh(col, -0.28), Object.assign({ bend: 1 }, legO)); leg(ctx, 18, -24, 24, 7, ph + PI * 1.5, sh(col, -0.28), Object.assign({ bend: -1 }, legO));
    /* plăci */
    const back = (u) => { const xx = lerp(-48, 24, u); return [xx, -30 - Math.sin(u * PI) * 32 + (u < 0.2 ? tl * (0.2 - u) * 5 : 0)]; };
    for (let i = 0; i < 9; i++) { const u = 0.08 + i * 0.1, [px, py] = back(u), h = 7 + Math.sin(u * PI) * 13; const c = i % 2 ? '#c86a3a' : '#d88a4a'; shape(ctx, [[px - h * 0.45, py + 4], [px - h * 0.2, py - h * 0.6], [px + h * 0.05, py - h], [px + h * 0.35, py - h * 0.5], [px + h * 0.45, py + 4]], c, { tension: 0.4, sheen: true }); }
    /* țepi coadă */
    for (let i = 0; i < 2; i++) for (const s of [0, 1]) { const bx = -58 + i * 7, by0 = -30 + tl * (1 - i * 0.3), ang = -2.2 + s * 0.5 - i * 0.15, L = 15 - s * 3; shape(ctx, [[bx - 2.2, by0 + 1], [bx + Math.cos(ang) * L, by0 + Math.sin(ang) * L], [bx + 2.2, by0 - 1]], s ? '#d8c8a0' : '#b8a880', { tension: 0.1, lw: 0.8 }); }
    const body = [[-64, -28 + tl], [-46, -40 + tl * 0.4], [-26, -58], [-4, -62], [14, -50], [24, -36], [34, -30], [44, -29], [50, -25], [46, -21], [36, -21], [26, -24], [16, -22], [0, -22], [-20, -26], [-40, -30], [-56, -26 + tl]];
    shape(ctx, body, col, { belly: '#e0d4a8', sheen: [-10, -52, 22, 6, 0.32] });
    eye(ctx, 40, -27, 1.6, t, { seed: s0 });
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(50, -24); ctx.lineTo(42, -23); ctx.stroke();
    leg(ctx, -12, -34, 34, 10, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 20, -24, 24, 8, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    end(ctx);
  }

  /* triceratops */
  function trike(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#8c7a5a', G = gait(t, o, 3), ph = G.ph, on = G.on, s0 = o.seed || 0, nod = Math.sin(t * 1.2 + s0) * 0.04;
    const legO = { on, stride: 8, lift: 4, foot: 'stump', thigh: 1.2, haunch: 2 };
    leg(ctx, -20, -26, 26, 10, ph + PI, sh(col, -0.28), Object.assign({ bend: 1 }, legO)); leg(ctx, 14, -24, 24, 9, ph + PI * 1.5, sh(col, -0.28), Object.assign({ bend: -1 }, legO));
    const body = [[-60, -26], [-42, -36], [-18, -48], [6, -48], [20, -40], [26, -26], [14, -16], [-10, -15], [-32, -19], [-50, -22]];
    shape(ctx, body, col, { belly: '#e0d0a8', sheen: [-12, -42, 24, 6, 0.32] });
    ctx.save(); ctx.translate(24, -34); ctx.rotate(nod);
    /* guler */
    const F = [[-6, -24], [4, -30], [12, -24], [14, -10], [10, 2], [-2, 6], [-8, -6]];
    shape(ctx, F, '#b8784a', { tension: 0.5, sheen: true });
    ctx.fillStyle = '#e8c890'; for (let i = 0; i < 7; i++) { const a = -2.4 + i * 0.5; ctx.beginPath(); ctx.arc(3 + Math.cos(a) * 15, -12 + Math.sin(a) * 16, 2, 0, TAU); ctx.fill(); }
    /* coarne */
    stroke2(ctx, [[10, -8], [20, -16], [28, -24]], 3.4, '#efe4c8'); stroke2(ctx, [[8, -6], [18, -15], [26, -22]], 3.6, '#f6ecd4');
    const Hd = [[0, -8], [12, -10], [22, -4], [28, 4], [26, 10], [16, 11], [4, 8], [-2, 0]];
    shape(ctx, Hd, col, { tension: 0.45, sheen: true, belly: '#e0d0a8' });
    stroke2(ctx, [[22, -2], [25, -8]], 2.6, '#f6ecd4');
    ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.moveTo(28, 3); ctx.quadraticCurveTo(31, 8, 26, 10); ctx.lineTo(25, 5); ctx.fill();
    eye(ctx, 12, -4, 1.7, t, { seed: s0 });
    ctx.restore();
    leg(ctx, -16, -26, 26, 11, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 16, -24, 24, 10, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    end(ctx);
  }

  /* reptilă târâtoare; v: 'lizard' | 'tetrapod' (amfibian timpuriu) | 'dimetro' (Dimetrodon) */
  function lizard(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const v = o.v || 'lizard', G = gait(t, o, v === 'lizard' ? 6 : 4), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const col = o.color || (v === 'tetrapod' ? '#6a7a3e' : v === 'dimetro' ? '#a0603e' : '#7a9a4a');
    const big = v === 'dimetro' ? 1.4 : 1, by = -10 * big, wig = Math.sin(ph) * 2 * on;
    const legO = { on, stride: 6, lift: 4, thigh: 1.15, foot: 'claw' };
    leg(ctx, -14, by + 2, 14 * big, 4.5 * big, ph + PI, sh(col, -0.28), Object.assign({ bend: -1 }, legO)); leg(ctx, 14, by + 2, 13 * big, 4 * big, ph, sh(col, -0.28), Object.assign({ bend: 1 }, legO));
    if (v === 'dimetro') {
      const sail = []; for (let i = 0; i <= 10; i++) { const u = i / 10, xx = lerp(-22, 18, u); sail.push([xx, by - 8 - Math.sin(u * PI) * 36]); }
      const S = [[-24, by - 4]].concat(sail, [[20, by - 4]]);
      ctx.save(); ctx.globalAlpha *= 0.95; shape(ctx, S, '#d8884a', { tension: 0.35, sheen: true, grad: ['#f0a860', '#d0703a', '#a04a2a'] }); ctx.restore();
      ctx.strokeStyle = rgba('#5a2a1a', 0.6); ctx.lineWidth = LW * 1.1; for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(sail[i][0], by - 4); ctx.lineTo(sail[i][0], sail[i][1] + 1); ctx.stroke(); }
    }
    const tw = (xx) => Math.sin(t * 2 + s0 - xx * 0.08) * 2 * (xx < -10 ? (-10 - xx) / 40 : 0);
    let body;
    if (v === 'tetrapod') body = [[-62, by + 2], [-40, by - 2], [-16, by - 9], [10, by - 10], [26, by - 9], [40, by - 7], [50, by - 3], [52, by + 1], [40, by + 4], [26, by + 5], [10, by + 6], [-16, by + 5], [-40, by + 4]];
    else body = [[-64, by + 3], [-40, by - 1], [-16, by - 7 * big], [12, by - 8 * big], [24, by - 6 * big], [32, by - 8 * big], [44, by - 6 * big], [52, by - 1], [48, by + 3], [34, by + 3], [24, by + 4], [10, by + 5], [-16, by + 5], [-40, by + 3]];
    body = body.map((p) => [p[0], p[1] + tw(p[0]) + (p[0] > 20 ? wig * 0.2 : 0)]);
    if (v === 'tetrapod') { const tf = body.slice(0, 3); shape(ctx, [[-64, by + 2 + tw(-64)], [-50, by - 6 + tw(-50)], [-30, by - 4], [-30, by + 2]], '#8a9a5a', { tension: 0.4 }); void tf; }
    shape(ctx, body, col, { belly: v === 'dimetro' ? '#e0b890' : '#e8e0a8', sheen: [6, by - 6, 22, 3, 0.35] });
    clipDraw(ctx, body, () => {
      ctx.fillStyle = rgba(v === 'lizard' ? '#3a5a20' : sh(col, -0.45), 0.45);
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(-50 + i * 8, by - 4 + (i % 2) * 2, 2.6, 1.8, 0, 0, TAU); ctx.fill(); }
    });
    if (v === 'lizard' && on) { const tg = Math.max(0, Math.sin(t * 3 + s0 * 2)) * 8; if (tg > 0.5) { ctx.strokeStyle = '#e04a5a'; ctx.lineWidth = LW * 1.2; ctx.beginPath(); ctx.moveTo(51, by); ctx.lineTo(51 + tg, by + 0.5); ctx.stroke(); } }
    if (v === 'dimetro') { ctx.fillStyle = '#f4ecd6'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(48 - i * 3, by + 0.5); ctx.lineTo(48.8 - i * 3, by + 3); ctx.lineTo(49.6 - i * 3, by + 0.5); ctx.fill(); } }
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(51, by + 0.5); ctx.lineTo(38, by + 1); ctx.stroke();
    eye(ctx, v === 'tetrapod' ? 40 : 42, by - 4 * big, v === 'tetrapod' ? 2.2 : 1.8, t, { seed: s0, iris: v === 'lizard' ? '#d8b040' : undefined });
    leg(ctx, -10, by + 3, 14 * big, 5 * big, ph, col, Object.assign({ bend: -1 }, legO)); leg(ctx, 18, by + 3, 13 * big, 4.5 * big, ph + PI, col, Object.assign({ bend: 1 }, legO));
    end(ctx);
  }

  /* broască (stă, apoi sare) */
  function frog(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, col = o.color || '#5aa83a', cyc = ((t * 0.5 + s0 * 0.37) % 1 + 1) % 1, on = o.speed === 0 ? 0 : 1;
    const hop = on && cyc < 0.25 ? Math.sin(cyc / 0.25 * PI) : 0, ext = hop;
    ctx.translate(0, -hop * 26);
    ctx.rotate(-hop * 0.25);
    /* picior din spate îndepărtat */
    shape(ctx, [[-26, -14], [-34, -6 + ext * 10], [-30, 0 + ext * 12], [-14, -2], [-12, -10]], sh(col, -0.25), { tension: 0.5 });
    const thr = 1 + Math.sin(t * 6 + s0) * 0.06 * (1 - hop);
    const B = [[-30, -10], [-22, -24], [0, -34], [18, -34], [30, -26], [34, -16], [24, -8 * thr], [6, -2 * thr], [-14, -2], [-28, -4]];
    shape(ctx, B, col, { belly: '#e8f0a0', sheen: [4, -28, 16, 5, 0.4] });
    clipDraw(ctx, B, () => { ctx.fillStyle = rgba('#2a5a1a', 0.45); for (const [sx, sy, r] of [[-12, -22, 4], [2, -28, 3], [-20, -14, 3], [12, -26, 2.5]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); } });
    /* ochi bombat */
    ctx.beginPath(); ctx.arc(18, -33, 7, 0, TAU); paint(ctx, col, -40, -26, { sheen: [16, -36, 4, 3, 0.5] });
    eye(ctx, 19.5, -33.5, 3.6, t, { seed: s0, iris: '#e8c040' });
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW * 1.1; ctx.beginPath(); ctx.moveTo(33, -18); ctx.quadraticCurveTo(24, -15, 14, -18); ctx.stroke();
    /* picior din spate apropiat */
    const Lg = [[-26, -16], [-30, -6 + ext * 12], [-22, ext * 14], [-6, -2 + ext * 4], [-4, -12]];
    shape(ctx, Lg, col, { tension: 0.5, sheen: true });
    stroke2(ctx, [[-20, -1 + ext * 14], [-6 - ext * 26, ext * 18 + 1]], 3, sh(col, -0.1));
    /* picior din față */
    stroke2(ctx, [[20, -12], [24, -4], [28, -1]], 4, col);
    end(ctx);
  }

  /* mamifer mic (ca un șoarece / chițcan) */
  function mouse(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#8a6a52', G = gait(t, o, 12), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const bob = -Math.abs(Math.sin(ph)) * 2 * on;
    const legO = { on, stride: 4, lift: 3, thigh: 1.4, haunch: 2.4 };
    leg(ctx, -12, -12 + bob, 12, 4, ph + PI, sh(col, -0.3), legO); leg(ctx, 14, -10 + bob, 10, 3.5, ph, sh(col, -0.3), legO);
    ctx.save(); ctx.translate(0, bob);
    const tl = []; for (let i = 0; i <= 8; i++) tl.push([-26 - i * 6, -10 + Math.sin(t * 3 + s0 - i * 0.5) * i * 0.5 - i * 0.6]);
    stroke2(ctx, tl, 2.2, '#d8a898');
    const B = [[-28, -10], [-20, -26], [0, -30], [16, -26], [28, -18], [38, -12], [40, -10], [30, -6], [10, -6], [-20, -6]];
    shape(ctx, B, col, { belly: '#e8d8c0', sheen: [-4, -24, 16, 5, 0.35] }); fur(ctx, B, rgba(sh(col, -0.4), 0.6), 1.8, -1);
    ctx.beginPath(); ctx.ellipse(16, -27, 6, 7, -0.3, 0, TAU); paint(ctx, col, -34, -20, {}); ctx.fillStyle = '#e8a8a0'; ctx.beginPath(); ctx.ellipse(16.5, -26.5, 3.6, 4.6, -0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a2020'; ctx.beginPath(); ctx.arc(40, -10.5, 1.8, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,30,0.6)'; ctx.lineWidth = LW * 0.6; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(36, -11); ctx.lineTo(46, -12 + i * 3.5); ctx.stroke(); }
    eye(ctx, 28, -17, 2.2, t, { seed: s0 });
    ctx.restore();
    leg(ctx, -8, -12 + bob, 12, 4.5, ph, col, legO); leg(ctx, 18, -10 + bob, 10, 4, ph + PI, col, legO);
    end(ctx);
  }

  /* cal / căprior; v: 'horse' | 'deer' */
  function horse(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const deer = o.v === 'deer', col = o.color || (deer ? '#a86e40' : '#8a5a36'), G = gait(t, o, 4.5), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const bob = -Math.abs(Math.cos(ph * 2)) * 1.2 * on, nod = Math.sin(ph * 2) * 0.03 * on + Math.sin(t * 0.8 + s0) * 0.02;
    const legO = { on, stride: 10, lift: 7, foot: 'hoof', thigh: deer ? 1.45 : 1.5, split: 0.48, haunch: 2.9, hup: 0.22 };
    const lw = deer ? 4.2 : 5.2;
    leg(ctx, -26, -46 + bob, 46, lw, ph + PI, sh(col, -0.3), Object.assign({ bend: 1 }, legO)); leg(ctx, 14, -44 + bob, 44, lw, ph + PI * 1.5, sh(col, -0.3), Object.assign({ bend: -1 }, legO));
    ctx.save(); ctx.translate(0, bob);
    /* coadă */
    const sw = Math.sin(t * 2 + s0) * 3;
    if (deer) shape(ctx, [[-36, -58], [-44, -62], [-44, -54]], '#f4ece0', { tension: 0.5 });
    else shape(ctx, [[-34, -58], [-46, -52 + sw * 0.3], [-50, -36 + sw], [-46, -26 + sw], [-42, -36], [-38, -50]], '#3a2418', { tension: 0.5 });
    const B = [[-38, -50], [-32, -62], [-8, -60], [14, -64], [22, -58], [22, -46], [12, -40], [-10, -40], [-30, -42]];
    shape(ctx, B, col, { belly: deer ? '#f0e0c8' : '#c8a080', sheen: [-8, -58, 22, 5, 0.32] }); fur(ctx, B, rgba(sh(col, -0.45), 0.6), 2.2, -1);
    ctx.save(); ctx.translate(16, -58); ctx.rotate(nod);
    shape(ctx, taper([[-4, 4], [8, -10], [16, -22]], 15, 9), col, { tension: 0.5 });
    if (!deer) { ctx.strokeStyle = '#3a2418'; ctx.lineWidth = LW * 2.6; ctx.beginPath(); for (let i = 0; i < 7; i++) { const u = i / 6, px = lerp(-2, 13, u), py = lerp(-2, -24, u); ctx.moveTo(px - 2, py - 2); ctx.quadraticCurveTo(px - 6, py + 2, px - 7, py + 6); } ctx.stroke(); }
    const Hd = [[10, -26], [16, -29], [22, -24], [32, -12], [33, -7], [28, -4], [22, -7], [12, -16]];
    shape(ctx, Hd, col, { tension: 0.45, sheen: true, belly: deer ? '#e8d8c0' : undefined });
    shape(ctx, [[12, -26], [13, -35], [17, -27]], sh(col, -0.1), { tension: 0.3 });
    if (deer) { shape(ctx, [[10, -25], [4, -32], [8, -33], [14, -26]], sh(col, -0.05), { tension: 0.4 }); ctx.strokeStyle = '#d8c8a0'; ctx.lineWidth = LW * 1.8; ctx.beginPath(); ctx.moveTo(15, -28); ctx.quadraticCurveTo(10, -44, 2, -52); ctx.moveTo(12, -38); ctx.lineTo(18, -48); ctx.moveTo(8, -45); ctx.lineTo(10, -56); ctx.moveTo(5, -48); ctx.lineTo(-4, -52); ctx.stroke(); }
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(31, -8, 1.2, 0, TAU); ctx.fill();
    eye(ctx, 19, -22, 1.9, t, { seed: s0 });
    ctx.restore(); ctx.restore();
    leg(ctx, -22, -46 + bob, 46, lw * 1.05, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 16, -44 + bob, 44, lw * 1.05, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    end(ctx);
  }

  /* girafă */
  function giraffe(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#e0a654', G = gait(t, o, 3.2), ph = G.ph, on = G.on, s0 = o.seed || 0, nk = Math.sin(t * 0.8 + s0) * 2;
    const legO = { on, stride: 12, lift: 7, foot: 'hoof', thigh: 1.35, haunch: 2.8, hup: 0.16 };
    leg(ctx, -18, -62, 62, 5, ph + PI, sh(col, -0.3), Object.assign({ bend: 1 }, legO)); leg(ctx, 12, -64, 64, 5, ph + PI * 1.5, sh(col, -0.3), Object.assign({ bend: -1 }, legO));
    stroke2(ctx, [[-24, -76], [-30, -64], [-31, -52]], 1.6, sh(col, -0.2)); ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.ellipse(-31, -50, 2, 3.4, 0, 0, TAU); ctx.fill();
    const neck = [[8, -82], [18, -100], [26, -118 + nk * 0.5], [32, -132 + nk]];
    const N = taper(neck, 13, 7);
    const B = [[-26, -70], [-22, -80], [0, -86], [16, -88], [22, -80], [18, -66], [-4, -64], [-22, -64]];
    const spots = (pts) => clipDraw(ctx, pts, () => { ctx.fillStyle = '#8a4a1e'; for (let i = 0; i < 40; i++) { const sx = -30 + (i * 23) % 70, sy = -140 + (i * 37) % 80; A.blob(ctx, sx, sy, 3.4, 0, { seed: i, amp: 0.3, points: 6 }); ctx.fill(); } });
    shape(ctx, N, col, { tension: 0.5, belly: '#f4dcb0' }); spots(N);
    ctx.strokeStyle = '#6a3a18'; ctx.lineWidth = LW * 2; ctx.beginPath(); ctx.moveTo(6, -86); ctx.quadraticCurveTo(18, -104, 28, -128 + nk); ctx.stroke();
    shape(ctx, B, col, { belly: '#f4dcb0', sheen: [-4, -82, 18, 4, 0.32] }); spots(B);
    const hx = 32, hy = -132 + nk;
    shape(ctx, [[hx - 4, hy - 3], [hx + 2, hy - 6], [hx + 14, hy + 2], [hx + 15, hy + 6], [hx + 10, hy + 7], [hx - 2, hy + 3]], col, { tension: 0.45, sheen: true });
    for (const d of [0, 3]) { stroke2(ctx, [[hx + d - 1, hy - 4], [hx + d - 2, hy - 11]], 1.6, '#8a5a2a'); ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(hx + d - 2, hy - 11.5, 1.6, 0, TAU); ctx.fill(); }
    shape(ctx, [[hx - 3, hy - 3], [hx - 9, hy - 6], [hx - 4, hy]], sh(col, -0.1), { tension: 0.4 });
    eye(ctx, hx + 4, hy - 1.5, 1.5, t, { seed: s0 });
    leg(ctx, -14, -62, 62, 5.4, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 14, -64, 64, 5.4, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    end(ctx);
  }

  /* elefant / mamut; v: 'elephant' | 'mammoth' */
  function elephant(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const mam = o.v === 'mammoth', col = o.color || (mam ? '#7a5434' : '#8e8c94'), G = gait(t, o, 2.6), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const legO = { on, stride: 8, lift: 5, foot: 'stump', thigh: 1.1, split: 0.55, haunch: 1.6 };
    const bob = -Math.abs(Math.cos(ph)) * 1 * on;
    leg(ctx, -24, -44 + bob, 44, 13, ph + PI, sh(col, -0.28), Object.assign({ bend: 1 }, legO)); leg(ctx, 16, -44 + bob, 44, 13, ph + PI * 1.5, sh(col, -0.28), Object.assign({ bend: -1 }, legO));
    ctx.save(); ctx.translate(0, bob);
    stroke2(ctx, [[-40, -60], [-44, -48 + Math.sin(t * 2 + s0) * 2], [-45, -40]], 1.8, sh(col, -0.2));
    const B = mam ? [[-42, -50], [-38, -70], [-16, -80], [10, -90], [26, -94], [38, -98], [48, -90], [52, -72], [48, -56], [36, -50], [22, -44], [0, -36], [-24, -36], [-38, -40]]
      : [[-42, -52], [-36, -76], [-10, -84], [14, -82], [28, -80], [38, -86], [48, -80], [52, -66], [48, -54], [36, -50], [22, -44], [0, -36], [-24, -36], [-38, -40]];
    const furC = mam ? '#5a3a20' : col;
    /* colț îndepărtat */
    const tusk = (dx, c) => { const pts = mam ? [[44 + dx, -54], [56 + dx, -44], [70 + dx, -48], [74 + dx, -62]] : [[46 + dx, -54], [56 + dx, -46], [64 + dx, -48]]; shape(ctx, taper(pts, mam ? 6 : 5, 2), c, { tension: 0.5, sheen: true }); };
    tusk(-3, '#d8ccb0');
    shape(ctx, B, col, { belly: mam ? '#5a3a20' : '#b8b6bc', sheen: [-6, -78, 26, 7, 0.3] });
    if (mam) { fur(ctx, B, '#4a2e18', 4, -1); ctx.strokeStyle = furC; ctx.lineWidth = LW * 1.6; ctx.beginPath(); for (let i = 0; i < 18; i++) { const px = -36 + i * 4.2, py = -38 - (i > 12 ? (i - 12) * 2 : 0); const s = Math.sin(t * 1.5 + i) * 1.5; ctx.moveTo(px, py - 4); ctx.quadraticCurveTo(px + 1 + s, py + 6, px - 1 + s, py + 12); } ctx.stroke(); clipDraw(ctx, B, () => { ctx.strokeStyle = rgba('#3a2412', 0.5); ctx.lineWidth = LW * 1.2; ctx.beginPath(); for (let i = 0; i < 40; i++) { const px = -40 + (i * 23) % 92, py = -90 + (i * 17) % 50; ctx.moveTo(px, py); ctx.quadraticCurveTo(px + 1, py + 4, px - 1, py + 8); } ctx.stroke(); }); }
    /* ureche */
    const fl = 1 + Math.sin(t * 1.8 + s0) * 0.08;
    ctx.save(); ctx.translate(28, -74); ctx.scale(fl, 1);
    if (mam) shape(ctx, [[-2, -6], [-8, -8], [-10, 0], [-4, 6], [2, 2]], sh(col, -0.15), { tension: 0.5 });
    else shape(ctx, [[2, -10], [-8, -14], [-16, -6], [-16, 10], [-10, 22], [-2, 20], [2, 8]], sh(col, -0.05), { tension: 0.5, sheen: true });
    ctx.restore();
    /* trompă */
    const ts = Math.sin(t * 1.1 + s0) * 4;
    const tr = [[46, -70], [54, -60], [56 + ts * 0.3, -44], [54 + ts * 0.6, -28], [56 + ts, -16], [60 + ts, -14]];
    shape(ctx, taper(tr, mam ? 11 : 12, 4.5), col, { tension: 0.5, belly: mam ? undefined : '#a8a6ac' });
    ctx.strokeStyle = rgba(sh(col, -0.5), 0.5); ctx.lineWidth = LW * 0.8; for (let i = 0; i < 8; i++) { const p = tr[1 + Math.min(4, Math.floor(i / 2))]; ctx.beginPath(); ctx.moveTo(p[0] - 4, p[1] + (i % 2) * 5); ctx.lineTo(p[0] + 3, p[1] + (i % 2) * 5); ctx.stroke(); }
    tusk(0, '#f2ead6');
    eye(ctx, 40, -74, 1.8, t, { seed: s0 });
    ctx.restore();
    leg(ctx, -20, -44 + bob, 44, 14, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 20, -44 + bob, 44, 14, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    if (mam) { ctx.strokeStyle = furC; ctx.lineWidth = LW * 1.4; ctx.beginPath(); for (const lx of [-20, 20]) for (let i = 0; i < 5; i++) { const px = lx - 6 + i * 3; ctx.moveTo(px, -24); ctx.lineTo(px - 1, -12); } ctx.stroke(); }
    end(ctx);
  }

  /* felină; v: 'tiger' | 'saber' (tigru cu dinți-sabie) */
  function cat(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const saber = o.v === 'saber', col = o.color || (saber ? '#c8964e' : '#e88a2e'), G = gait(t, o, 4.2), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const legO = { on, stride: 10, lift: 6, foot: 'pad', thigh: 1.5, haunch: 2.5, hup: 0.3 };
    const bob = -Math.abs(Math.cos(ph)) * 1.4 * on;
    leg(ctx, -26, -32 + bob, 32, 7, ph + PI, sh(col, -0.3), Object.assign({ bend: 1 }, legO)); leg(ctx, 16, -32 + bob, 32, 6.5, ph + PI * 1.5, sh(col, -0.3), Object.assign({ bend: -1 }, legO));
    ctx.save(); ctx.translate(0, bob);
    const tw = Math.sin(t * 1.8 + s0) * 4;
    if (saber) shape(ctx, taper([[-34, -40], [-42, -38], [-46, -34 + tw * 0.3]], 6, 4), col, { tension: 0.5 });
    else shape(ctx, taper([[-34, -40], [-48, -38], [-58, -30 + tw * 0.5], [-62, -40 + tw], [-58, -50 + tw]], 6, 4.5), col, { tension: 0.5 });
    const B = saber ? [[-38, -36], [-32, -46], [-8, -46], [14, -52], [24, -46], [24, -30], [10, -26], [-12, -26], [-30, -28]] : [[-38, -36], [-32, -46], [-6, -46], [14, -48], [24, -44], [24, -30], [10, -24], [-12, -25], [-30, -28]];
    shape(ctx, B, col, { belly: '#f8ecd4', sheen: [-6, -44, 22, 5, 0.32] }); fur(ctx, B, rgba(sh(col, -0.4), 0.6), 2.2, -1);
    if (!saber) clipDraw(ctx, B, () => { ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = LW * 2.4; for (let i = 0; i < 8; i++) { const xx = -32 + i * 7; ctx.beginPath(); ctx.moveTo(xx, -50); ctx.quadraticCurveTo(xx + 4, -42, xx + 1, -34); ctx.stroke(); } });
    else clipDraw(ctx, B, () => { ctx.fillStyle = rgba('#8a5a2a', 0.4); for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(-30 + (i * 29) % 52, -44 + (i * 7) % 12, 1.8, 0, TAU); ctx.fill(); } });
    /* cap */
    const nod = Math.sin(t * 1.1 + s0) * 0.04;
    ctx.save(); ctx.translate(28, -44); ctx.rotate(nod);
    for (const ex of [-2, 4]) { ctx.beginPath(); ctx.arc(ex, -9, 3.6, 0, TAU); paint(ctx, col, -13, -5, {}); ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(ex, -8.5, 1.6, 0, TAU); ctx.fill(); }
    const Hd = [[-6, -6], [2, -10], [10, -8], [16, -2], [17, 3], [12, 7], [2, 8], [-6, 4]];
    shape(ctx, Hd, col, { tension: 0.5, sheen: true, belly: '#f8ecd4' });
    if (!saber) { ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = LW * 1.6; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(2, -3); ctx.moveTo(4, -9); ctx.lineTo(5, -4); ctx.moveTo(-4, -2); ctx.lineTo(1, 0); ctx.stroke(); }
    ctx.fillStyle = '#5a2a20'; ctx.beginPath(); ctx.ellipse(16, 0.5, 1.8, 1.3, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#4a2a18'; ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(16, 2); ctx.quadraticCurveTo(14, 5, 10, 5); ctx.stroke();
    if (saber) { ctx.fillStyle = '#f6f0e0'; ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = LW * 0.6; ctx.beginPath(); ctx.moveTo(11, 4); ctx.quadraticCurveTo(12, 12, 9, 17); ctx.quadraticCurveTo(10, 10, 8, 4.5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    eye(ctx, 9, -3, 1.7, t, { seed: s0, iris: '#c8a020' });
    ctx.restore(); ctx.restore();
    leg(ctx, -22, -32 + bob, 32, 7.5, ph, col, Object.assign({ bend: 1 }, legO)); leg(ctx, 18, -32 + bob, 32, 7, ph + PI * 0.5, col, Object.assign({ bend: -1 }, legO));
    end(ctx);
  }

  /* primată: v: 'ape' (gorilă, merge în patru labe) | 'monkey' */
  function ape(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const mk = o.v === 'monkey', col = o.color || (mk ? '#9a6a3e' : '#3c363a'), face = mk ? '#e8c8a0' : '#6a5a58', G = gait(t, o, 3.2), ph = G.ph, on = G.on, s0 = o.seed || 0;
    const bob = -Math.abs(Math.cos(ph)) * 1.5 * on;
    const legO = { on, stride: 9, lift: 6, thigh: 1.3, foot: 'pad', haunch: 2.2, hup: 0.25 };
    leg(ctx, -20, -34 + bob, 34, 8, ph + PI, sh(col, -0.28), Object.assign({ bend: -1 }, legO)); leg(ctx, 14, -52 + bob, 52, 7, ph + PI * 1.5, sh(col, -0.28), Object.assign({ bend: 1, split: 0.5 }, legO));
    ctx.save(); ctx.translate(0, bob);
    if (mk) { const pts = []; for (let i = 0; i <= 8; i++) { const a = i * 0.45 + Math.sin(t * 1.3 + s0) * 0.2; pts.push([-28 - i * 4.4, -38 - Math.sin(a) * i * 3 + i * 1.2]); } stroke2(ctx, pts, 3, col); }
    const B = mk ? [[-30, -36], [-24, -46], [0, -52], [16, -54], [22, -46], [16, -36], [0, -32], [-20, -30]] : [[-30, -32], [-26, -48], [-6, -58], [14, -64], [24, -58], [24, -44], [12, -34], [-10, -30]];
    shape(ctx, B, col, { sheen: [0, -56, 22, 6, 0.28], belly: mk ? '#d8b890' : '#5a5458' }); fur(ctx, B, rgba(sh(col, mk ? -0.4 : 0.25), 0.7), 3, -1);
    if (!mk) clipDraw(ctx, B, () => { const g = ctx.createLinearGradient(-30, 0, 10, 0); g.addColorStop(0, 'rgba(200,200,210,0)'); g.addColorStop(0.5, 'rgba(200,200,210,0.55)'); g.addColorStop(1, 'rgba(200,200,210,0)'); ctx.fillStyle = g; ctx.fillRect(-30, -62, 40, 16); });
    const hx = mk ? 24 : 28, hy = mk ? -52 : -60, hr = mk ? 9 : 11;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); paint(ctx, col, hy - hr, hy + hr, { sheen: [hx - 3, hy - 5, 5, 3, 0.3] });
    if (mk) { ctx.beginPath(); ctx.arc(hx - 6, hy - 3, 3.6, 0, TAU); paint(ctx, face, hy - 6, hy, {}); }
    shape(ctx, [[hx + 1, hy - 6], [hx + 9, hy - 5], [hx + 13, hy + 2], [hx + 10, hy + 8], [hx + 2, hy + 8], [hx - 1, hy + 2]], face, { tension: 0.5, sheen: true });
    ctx.fillStyle = sh(col, -0.3); if (!mk) { ctx.beginPath(); ctx.ellipse(hx + 6, hy - 5, 7, 2.6, 0.1, 0, TAU); ctx.fill(); }
    eye(ctx, hx + 7, hy - 2, 1.6, t, { seed: s0 });
    ctx.fillStyle = sh(face, -0.5); ctx.beginPath(); ctx.arc(hx + 12, hy + 2.5, 1, 0, TAU); ctx.fill();
    ctx.strokeStyle = sh(face, -0.5); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(hx + 11, hy + 5.5); ctx.lineTo(hx + 6, hy + 6); ctx.stroke();
    ctx.restore();
    leg(ctx, -16, -34 + bob, 34, 8.5, ph, col, Object.assign({ bend: -1 }, legO)); leg(ctx, 18, -52 + bob, 52, 7.5, ph + PI * 0.5, col, Object.assign({ bend: 1, split: 0.5 }, legO));
    end(ctx);
  }

  /* om preistoric (vânător cu suliță) — size = înălțimea */
  function human(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const G = gait(t, o, 3.6), ph = G.ph, on = G.on, s0 = o.seed || 0, skin = o.color || '#c98e64', fur = '#8a6238', hair = '#3a2418';
    const bob = -Math.abs(Math.cos(ph)) * 1.6 * on;
    const legO = { on, stride: 9, lift: 6, thigh: 1.25, bend: -1, foot: 'pad' };
    leg(ctx, 0, -48 + bob, 48, 6, ph + PI, sh(skin, -0.25), legO);
    const arm = (a, c) => { const ex = 6 + Math.sin(a) * 9, ey = -54 + bob; stroke2(ctx, [[4, -80 + bob], [3 + Math.sin(a) * 6, -66 + bob], [ex, ey]], 5, c); return [ex, ey]; };
    arm(ph, sh(skin, -0.25));
    /* trunchi + blană */
    const T = [[-6, -84], [6, -86], [10, -70], [9, -50], [-8, -46], [-8, -66]].map((p) => [p[0], p[1] + bob]);
    shape(ctx, T, fur, { tension: 0.4, sheen: true });
    clipDraw(ctx, T, () => { ctx.strokeStyle = rgba('#4a3018', 0.5); ctx.lineWidth = LW * 1.2; ctx.beginPath(); for (let i = 0; i < 12; i++) { const px = -8 + (i * 7) % 18, py = -84 + i * 3 + bob; ctx.moveTo(px, py); ctx.lineTo(px - 1, py + 4); } ctx.stroke(); });
    ctx.fillStyle = sh(fur, -0.2); ctx.beginPath(); for (let i = 0; i < 6; i++) { const px = -8 + i * 3.4, py = -47 + bob; ctx.moveTo(px, py); ctx.lineTo(px + 1.7, py + 4); ctx.lineTo(px + 3.4, py); } ctx.fill();
    /* cap */
    const hy = -94 + bob;
    stroke2(ctx, [[1, -86 + bob], [2, -89 + bob]], 5, skin);
    ctx.beginPath(); ctx.ellipse(2, hy, 7, 8, 0, 0, TAU); paint(ctx, skin, hy - 8, hy + 8, { sheen: [0, hy - 3, 4, 3, 0.3] });
    shape(ctx, [[8, hy - 2], [10, hy + 1], [8, hy + 2]], skin, { tension: 0.3, lw: 0.7 });
    shape(ctx, [[-6, hy + 8], [-9, hy - 2], [-4, hy - 9], [4, hy - 10], [9, hy - 6], [5, hy - 5], [0, hy - 3], [-2, hy + 4]], hair, { tension: 0.5 });
    eye(ctx, 5.5, hy - 1.5, 1.1, t, { seed: s0 });
    leg(ctx, 2, -48 + bob, 48, 6.4, ph, skin, legO);
    /* brațul apropiat cu sulița */
    const [hx2, hy2] = arm(ph + PI, skin);
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = LW * 1.8; ctx.beginPath(); ctx.moveTo(hx2 - 22, hy2 + 14); ctx.lineTo(hx2 + 26, hy2 - 18); ctx.stroke();
    shape(ctx, [[hx2 + 24, hy2 - 17], [hx2 + 31, hy2 - 24], [hx2 + 28, hy2 - 15]], '#8a8a8a', { tension: 0.1, lw: 0.6 });
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx2, hy2, 2.8, 0, TAU); ctx.fill();
    end(ctx);
  }

  /* ==========================================================
     ZBURĂTOARE
     ========================================================== */

  /* pasăre; v: 'bird' | 'eagle' | 'archae' (Archaeopteryx) | 'owl' — (x,y) = centrul */
  function bird(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const v = o.v || 'bird', s0 = o.seed || 0, fr = v === 'eagle' ? 3.2 : 6.5;
    const ph = t * fr + s0 * 3, glide = v === 'eagle' ? Math.max(0, Math.sin(t * 0.6 + s0)) : 0, f = Math.sin(ph) * (1 - glide * 0.85);
    const col = o.color || { bird: '#4a7ac0', eagle: '#6a4428', archae: '#3a6a8a', owl: '#9a7a5a' }[v];
    const wing = (sgn, c) => {
      ctx.save(); ctx.translate(4, -4); const a = -f * 0.9 * sgn; ctx.rotate(a); ctx.scale(1, sgn < 0 ? -0.7 : 1);
      const W2 = [[4, 0], [-4, -16], [-12, -32], [-22, -44], [-30, -40], [-26, -32], [-30, -28], [-24, -22], [-26, -16], [-18, -10], [-16, -2]];
      shape(ctx, W2, c, { tension: 0.4, sheen: sgn > 0 });
      if (v !== 'owl') { ctx.strokeStyle = rgba(sh(c, -0.5), 0.6); ctx.lineWidth = LW * 0.8; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-6 - i * 2, -10 - i * 6); ctx.lineTo(-20 - i * 2.4, -16 - i * 6); ctx.stroke(); } }
      if (v === 'archae') { ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(-7, -34); ctx.stroke(); }
      ctx.restore();
    };
    wing(-1, sh(col, -0.3));
    /* coadă */
    if (v === 'archae') { const pts = [[-14, 0], [-28, 1], [-42, 3]]; shape(ctx, taper(pts, 6, 3), col, { tension: 0.5 }); ctx.fillStyle = sh(col, 0.1); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-20 - i * 4, 2 + (i % 2 ? 3 : -3), 4, 1.6, i % 2 ? 0.4 : -0.4, 0, TAU); ctx.fill(); } }
    else shape(ctx, [[-14, -2], [-30, -6], [-32, 0], [-30, 6], [-14, 3]], v === 'eagle' ? '#f2efe8' : sh(col, -0.1), { tension: 0.35 });
    const B = [[22, -6], [10, -10], [-6, -8], [-16, -2], [-8, 5], [8, 6], [20, 2]];
    shape(ctx, B, col, { belly: v === 'eagle' ? '#8a5a30' : v === 'owl' ? '#e8d8b8' : '#f0e0c0', sheen: [4, -7, 12, 3, 0.4] });
    /* cap */
    const hx = 24, hy = -8;
    const hc = v === 'eagle' ? '#f4f2ea' : col;
    ctx.beginPath(); ctx.arc(hx, hy, v === 'owl' ? 9 : 6.5, 0, TAU); paint(ctx, hc, hy - 7, hy + 7, { sheen: [hx - 2, hy - 3, 3, 2, 0.5] });
    if (v === 'owl') { ctx.fillStyle = '#f4ead4'; ctx.beginPath(); ctx.arc(hx + 3, hy, 6, 0, TAU); ctx.fill(); shape(ctx, [[hx - 4, hy - 8], [hx - 2, hy - 13], [hx + 1, hy - 8]], col, { lw: 0.7 }); eye(ctx, hx + 4, hy - 1, 2.8, t, { seed: s0, iris: '#f0b020' }); shape(ctx, [[hx + 8, hy + 1], [hx + 11, hy + 3], [hx + 8, hy + 5]], '#d8a030', { tension: 0.2, lw: 0.6 }); }
    else {
      const bk = v === 'eagle' ? [[hx + 4, hy - 3], [hx + 13, hy - 1], [hx + 13, hy + 3], [hx + 10, hy + 1], [hx + 4, hy + 2]] : v === 'archae' ? [[hx + 4, hy - 2], [hx + 13, hy], [hx + 4, hy + 3]] : [[hx + 4, hy - 2], [hx + 11, hy + 0.5], [hx + 4, hy + 2.5]];
      shape(ctx, bk, v === 'archae' ? '#5a4a3a' : '#f0b830', { tension: 0.15, lw: 0.7 });
      eye(ctx, hx + 2, hy - 1.5, 1.6, t, { seed: s0, iris: v === 'eagle' ? '#e0a020' : undefined });
    }
    wing(1, col);
    end(ctx);
  }

  /* pterozaur (Pteranodon) */
  function ptero(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, ph = t * 3.4 + s0 * 3, glide = Math.max(0, Math.sin(t * 0.5 + s0)), f = Math.sin(ph) * (1 - glide * 0.8);
    const col = o.color || '#b06a4a', mem = '#d89a6a';
    const wing = (sgn, c, m) => {
      ctx.save(); ctx.translate(4, -2); ctx.rotate(-f * 0.8 * sgn); ctx.scale(1, sgn < 0 ? -0.6 : 1);
      const W2 = [[6, 0], [0, -20], [-6, -40], [-14, -56], [-20, -50], [-22, -34], [-18, -16], [-14, 2]];
      shape(ctx, W2, m, { tension: 0.35, grad: [sh(m, 0.2), m, sh(m, -0.2)] });
      ctx.strokeStyle = sh(c, -0.3); ctx.lineWidth = LW * 1.6; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(0, -20); ctx.lineTo(-6, -40); ctx.lineTo(-14, -56); ctx.stroke();
      ctx.restore();
    };
    wing(-1, sh(col, -0.3), sh(mem, -0.3));
    const B = [[14, -4], [4, -7], [-12, -4], [-18, 0], [-10, 4], [6, 4]];
    shape(ctx, B, col, { belly: '#e8d0b0', sheen: true });
    /* cap cu creastă și cioc lung */
    const hx = 16, hy = -6;
    shape(ctx, [[hx - 4, hy - 1], [hx - 18, hy - 12], [hx - 14, hy - 4], [hx - 2, hy + 3]], '#c84a3a', { tension: 0.3 });
    shape(ctx, [[hx - 3, hy - 3], [hx + 4, hy - 5], [hx + 30, hy], [hx + 30, hy + 1.5], [hx + 4, hy + 4], [hx - 3, hy + 3]], col, { tension: 0.25, sheen: true });
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW * 0.8; ctx.beginPath(); ctx.moveTo(hx + 29, hy + 1); ctx.lineTo(hx + 6, hy + 1.6); ctx.stroke();
    eye(ctx, hx + 2, hy - 1.4, 1.5, t, { seed: s0 });
    wing(1, col, mem);
    end(ctx);
  }

  /* liliac (din față) */
  function bat(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, f = Math.sin(t * 9 + s0 * 3), col = o.color || '#4a3a44', mem = '#6a4a5a';
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1); ctx.rotate(-f * 0.5);
      const W2 = [[4, -4], [20, -18], [40, -20], [48, -10], [40, -6], [36, 4], [28, -2], [22, 8], [14, 2], [6, 6]];
      shape(ctx, W2, mem, { tension: 0.25, grad: [sh(mem, 0.15), mem, sh(mem, -0.3)] });
      ctx.strokeStyle = sh(col, -0.3); ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(20, -18); ctx.lineTo(40, -20); ctx.moveTo(20, -18); ctx.lineTo(36, 4); ctx.moveTo(20, -18); ctx.lineTo(28, -2); ctx.moveTo(20, -18); ctx.lineTo(22, 8); ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.ellipse(0, 2, 7, 11, 0, 0, TAU); paint(ctx, col, -9, 13, { sheen: [-2, -2, 4, 5, 0.3] });
    for (const s of [-1, 1]) shape(ctx, [[s * 2, -10], [s * 7, -20], [s * 7, -8]], col, { tension: 0.2, lw: 0.7 });
    ctx.beginPath(); ctx.arc(0, -7, 6, 0, TAU); paint(ctx, col, -13, -1, {});
    for (const s of [-1, 1]) eye(ctx, s * 2.6, -8, 1.3, t, { seed: s0 });
    end(ctx);
  }

  /* libelulă uriașă (Meganeura) — (x,y) = centrul */
  function dragonfly(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0, col = o.color || '#2a8a9a', fl = Math.sin(t * 40 + s0 * 3);
    const wing = (wx, ang, len) => { ctx.save(); ctx.translate(wx, -3); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(-2, -len / 2, 5, len / 2, 0, 0, TAU); ctx.fillStyle = 'rgba(210,240,255,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(80,120,140,0.6)'; ctx.lineWidth = LW * 0.6; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-2, -len * 0.95); ctx.stroke(); ctx.fillStyle = 'rgba(60,60,60,0.5)'; ctx.beginPath(); ctx.ellipse(-2, -len * 0.85, 2, 3, 0, 0, TAU); ctx.fill(); ctx.restore(); };
    wing(10, -0.3 + fl * 0.25, 40); wing(4, -0.6 + fl * 0.25, 36);
    const ab = []; for (let i = 0; i <= 8; i++) ab.push([4 - i * 6.5, Math.sin(t * 2 + s0) * i * 0.2]);
    shape(ctx, taper(ab, 6, 3), col, { tension: 0.5, grad: [sh(col, 0.35), col, sh(col, -0.35)] });
    ctx.strokeStyle = rgba(sh(col, -0.6), 0.7); ctx.lineWidth = LW; for (let i = 1; i < 8; i++) { const p = ab[i]; ctx.beginPath(); ctx.moveTo(p[0], p[1] - 3); ctx.lineTo(p[0], p[1] + 3); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(10, 0, 9, 5.5, 0, 0, TAU); paint(ctx, sh(col, -0.1), -5, 5, { sheen: [8, -3, 5, 2, 0.4] });
    ctx.beginPath(); ctx.arc(21, -1, 5.5, 0, TAU); paint(ctx, '#3aaa6a', -6, 4, { sheen: [19, -3, 3, 2, 0.6] });
    ctx.strokeStyle = sh(col, -0.5); ctx.lineWidth = LW; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(8 + i * 4, 4); ctx.lineTo(6 + i * 5, 10); ctx.stroke(); }
    wing(10, 0.3 - fl * 0.25, 40); wing(4, 0.0 - fl * 0.25, 36);
    end(ctx);
  }

  /* ==========================================================
     PLANTE (size = înălțimea; (x,y) = baza, pe sol)
     ========================================================== */
  const sway = (t, o, k) => Math.sin(t * (o.swaySpeed || 1.1) + (o.seed || 0) * 2.1) * (k || 0.04) + A.noise1(t * 0.4 + (o.seed || 0) * 5) * (k || 0.04) * 0.5;

  /* frunză penată (ferigă / palmier): spine din (0,0) cu unghi, lungime */
  function frond(ctx, ang, len, col, curl, leaf, t, o) {
    const pts = [], n = 12;
    for (let i = 0; i <= n; i++) { const u = i / n, a = ang + curl * u * u; pts.push([Math.cos(a) * len * u, Math.sin(a) * len * u]); }
    const L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const p = pts[i], q = pts[Math.min(n, i + 1)], r = pts[Math.max(0, i - 1)], dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      const w = leaf * Math.sin(Math.min(1, (i / n) * 1.15) * PI) * (i % 2 ? 1 : 0.55) + 0.4;
      L.push([p[0] + nx * w - dx / d * w * 0.4, p[1] + ny * w - dy / d * w * 0.4]); R.push([p[0] - nx * w - dx / d * w * 0.4, p[1] - ny * w - dy / d * w * 0.4]);
    }
    shape(ctx, L.concat(R.reverse()), col, { tension: 0.3, lw: 0.7, hi: 0.25, lo: 0.3 });
    ctx.strokeStyle = sh(col, -0.35); ctx.lineWidth = LW * 0.8; ctx.beginPath(); A.smoothPath(ctx, pts, false); ctx.stroke();
  }
  function fern(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#4a9a3a', n = 7;
    for (let i = 0; i < n; i++) { const u = i / (n - 1), a = -PI / 2 + (u - 0.5) * 2.4 + sway(t, o, 0.06) * (1 + i * 0.1), c = i % 2 ? col : sh(col, -0.12); frond(ctx, a, 70 + (1 - Math.abs(u - 0.5) * 2) * 30, c, (u - 0.5) * 1.6, 7, t, o); }
    end(ctx);
  }
  /* ferigă arborescentă / palmier / Lepidodendron; v: 'treefern' | 'palm' | 'lepido' | 'cycad' */
  function palm(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const v = o.v || 'palm', sw = sway(t, o, 0.03);
    const trunkC = v === 'lepido' ? '#6a6a3a' : v === 'treefern' ? '#5a4030' : '#8a6a44';
    const H = v === 'cycad' ? 34 : 88, lean = v === 'palm' ? 10 : 3;
    const tp = []; for (let i = 0; i <= 6; i++) { const u = i / 6; tp.push([Math.sin(u * 1.4) * lean + sw * u * 60, -u * H]); }
    const TR = taper(tp, v === 'cycad' ? 16 : v === 'lepido' ? 11 : 8, v === 'cycad' ? 12 : v === 'lepido' ? 7 : 5.5);
    shape(ctx, TR, trunkC, { tension: 0.5, gx0: -8, gx1: 8, grad: [sh(trunkC, 0.25), trunkC, sh(trunkC, -0.35)] });
    clipDraw(ctx, TR, () => {
      ctx.strokeStyle = rgba(sh(trunkC, -0.5), 0.6); ctx.lineWidth = LW;
      if (v === 'lepido') { for (let i = 0; i < 24; i++) { const u = i / 24, p = tp[Math.min(6, Math.round(u * 6))]; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(p[0] + k * 4 - 2, -u * H); ctx.lineTo(p[0] + k * 4, -u * H - 2); ctx.lineTo(p[0] + k * 4 + 2, -u * H); ctx.stroke(); } } }
      else for (let i = 0; i < 14; i++) { const u = i / 14, p = tp[Math.min(6, Math.round(u * 6))]; ctx.beginPath(); ctx.moveTo(p[0] - 8, -u * H); ctx.quadraticCurveTo(p[0], -u * H + 2, p[0] + 8, -u * H); ctx.stroke(); }
    });
    const top = tp[6];
    ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(sw * 0.6);
    if (v === 'lepido') {
      const tuft = () => { ctx.strokeStyle = '#3e7a26'; ctx.lineWidth = LW * 1.1; ctx.beginPath(); for (let i = 0; i < 11; i++) { const a = -PI / 2 + (i / 10 - 0.5) * 2.6 + Math.sin(t * 1.2 + i) * 0.04; ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a) * 6, Math.sin(a) * 6 - 2, Math.cos(a) * 11, Math.sin(a) * 11 + 2); } ctx.stroke(); ctx.strokeStyle = '#6aa040'; ctx.lineWidth = LW * 0.6; ctx.stroke(); };
      const br = (a, l, d) => { ctx.save(); ctx.rotate(a); stroke2(ctx, [[0, 0], [0, -l]], 6 - d * 1.3, trunkC); ctx.translate(0, -l); if (d >= 2) tuft(); else { br(-0.5, l * 0.8, d + 1); br(0.5, l * 0.8, d + 1); } ctx.restore(); };
      br(0, 10, 0);
    } else {
      const col = o.color || (v === 'treefern' ? '#4a9040' : v === 'cycad' ? '#5a8a3a' : '#5aa040');
      const n = v === 'cycad' ? 9 : 8;
      for (let i = 0; i < n; i++) { const u = i / (n - 1), a = -PI / 2 + (u - 0.5) * (v === 'cycad' ? 2.6 : 3.6) + Math.sin(t * 1.3 + i + (o.seed || 0)) * 0.04; frond(ctx, a, v === 'cycad' ? 40 : 46, i % 2 ? col : sh(col, -0.15), (u - 0.5) * (v === 'palm' ? 2.2 : 1.6), v === 'palm' ? 6 : 5, t, o); }
      if (v === 'palm') for (const dx of [-2, 2]) { ctx.beginPath(); ctx.arc(dx, 3, 3, 0, TAU); paint(ctx, '#8a5a2a', 0, 6, { lw: 0.6 }); }
    }
    ctx.restore();
    end(ctx);
  }
  /* conifer (brad); opts.snow */
  function conifer(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#2e6a3e', sw = sway(t, o, 0.025);
    shape(ctx, [[-4, 0], [-3, -20], [3, -20], [4, 0]], '#5a3a22', { tension: 0.1 });
    ctx.rotate(sw);
    for (let i = 0; i < 5; i++) {
      const u = i / 4, yb = -14 - u * 66, w = 30 * (1 - u * 0.75), h = 26 - u * 8;
      const P = [[0, yb - h], [-w * 0.45, yb - h * 0.35], [-w, yb + 2], [-w * 0.6, yb - 1], [-w * 0.3, yb + 3], [0, yb], [w * 0.3, yb + 3], [w * 0.6, yb - 1], [w, yb + 2], [w * 0.45, yb - h * 0.35]];
      shape(ctx, P, i % 2 ? col : sh(col, 0.06), { tension: 0.25, gx0: -w, gx1: w, grad: [sh(col, 0.3), col, sh(col, -0.35)] });
      if (o.snow) { ctx.fillStyle = 'rgba(248,252,255,0.95)'; ctx.beginPath(); ctx.moveTo(0, yb - h); ctx.quadraticCurveTo(-w * 0.5, yb - h * 0.4, -w * 0.8, yb - 2); ctx.quadraticCurveTo(-w * 0.3, yb - h * 0.3, 0, yb - h * 0.55); ctx.quadraticCurveTo(w * 0.3, yb - h * 0.3, w * 0.7, yb - 3); ctx.quadraticCurveTo(w * 0.4, yb - h * 0.45, 0, yb - h); ctx.fill(); }
    }
    end(ctx);
  }
  /* copac cu frunze lată; v: 'tree' | 'acacia' */
  function tree(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const ac = o.v === 'acacia', col = o.color || (ac ? '#6a9a3a' : '#4a9a3e'), sw = sway(t, o, 0.025), s0 = o.seed || 0;
    const tc = '#6a4a2e';
    shape(ctx, taper([[0, 0], [2, -30], [ac ? 4 : 1, -55]], 12, 7), tc, { tension: 0.5, gx0: -6, gx1: 6, grad: [sh(tc, 0.25), tc, sh(tc, -0.4)] });
    stroke2(ctx, [[2, -40], [-14, -60]], 4, tc); stroke2(ctx, [[2, -45], [18, -62]], 4, tc);
    ctx.save(); ctx.translate(0, -62); ctx.rotate(sw);
    const blobs = ac ? [[-24, -4, 14, 0.5], [-6, -8, 16, 0.5], [14, -6, 15, 0.5], [30, -2, 11, 0.5]] : [[-18, 4, 16], [16, 4, 16], [-8, -14, 18], [12, -16, 17], [0, -2, 20], [-24, -8, 12], [24, -8, 12]];
    for (let i = 0; i < blobs.length; i++) { const [bx, by2, r, sy] = blobs[i]; A.blob(ctx, bx, by2, r, t * 0.6, { seed: i + s0, amp: 0.12, sy: sy || 1 }); paint(ctx, col, by2 - r, by2 + r * (sy || 1), { hi: 0.25, lo: 0.42, sheen: [bx - r * 0.3, by2 - r * 0.4, r * 0.5, r * 0.3, 0.25], lw: 0.8 }); }
    if (o.fruit) { ctx.fillStyle = o.fruit; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-20 + (i * 13) % 40, -14 + (i * 7) % 20, 2.4, 0, TAU); ctx.fill(); } }
    ctx.restore();
    end(ctx);
  }
  /* flori — un mic tufiș cu 3 flori */
  function flower(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#ff7fb0', ctr = o.center || '#ffd23a', s0 = o.seed || 0;
    const F = [[-12, 70, -0.25], [4, 92, 0.05], [16, 62, 0.3]];
    for (let i = 0; i < F.length; i++) {
      const [bx, h, lean] = F[i], sw2 = Math.sin(t * 1.4 + s0 + i * 1.3) * 0.06, tip = [bx + Math.sin(lean + sw2) * h * 0.5, -h];
      stroke2(ctx, [[bx * 0.3, 0], [bx * 0.6 + tip[0] * 0.3, -h * 0.5], tip], 2.6, '#3a8a2a');
      ctx.save(); ctx.translate(bx * 0.5 + tip[0] * 0.25, -h * 0.4); ctx.rotate(lean > 0 ? 0.6 : -2.2); shape(ctx, [[0, 0], [10, -5], [20, 0], [10, 4]], '#4aa83a', { tension: 0.5, lw: 0.6 }); ctx.restore();
      ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(sw2 * 2);
      const pc = i === 1 ? col : sh(col, i ? 0.15 : -0.1);
      for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k / 6 * TAU + t * 0.05); ctx.beginPath(); ctx.ellipse(0, -8, 4.6, 8, 0, 0, TAU); paint(ctx, pc, -16, 0, { lw: 0.6, hi: 0.4 }); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, TAU); paint(ctx, ctr, -4, 4, { lw: 0.6, sheen: [-1, -1.5, 2, 1.5, 0.6] });
      ctx.restore();
    }
    end(ctx);
  }
  /* iarbă; v: 'grass' | 'grain' (cu spice) */
  function grass(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#6aa83a', s0 = o.seed || 0, n = 11;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), h = 60 + ((i * 37) % 40), bx = (u - 0.5) * 30, lean = (u - 0.5) * 0.9 + Math.sin(t * 1.6 + s0 + i * 0.7) * 0.12;
      const tip = [bx + Math.sin(lean) * h, -Math.cos(lean) * h];
      const c = i % 3 === 0 ? sh(col, -0.2) : i % 3 === 1 ? col : sh(col, 0.15);
      ctx.beginPath(); ctx.moveTo(bx - 2.5, 0); ctx.quadraticCurveTo(bx + Math.sin(lean) * h * 0.4 - 2, -h * 0.5, tip[0], tip[1]); ctx.quadraticCurveTo(bx + Math.sin(lean) * h * 0.4 + 2, -h * 0.5, bx + 2.5, 0); ctx.closePath();
      paint(ctx, c, -h, 0, { lw: 0.5, hi: 0.3, lo: 0.3 });
      if (o.v === 'grain' && i % 2 === 0) { ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(lean); for (let k = 0; k < 5; k++) for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 2, 3 + k * 4, 1.8, 3.2, s * 0.4, 0, TAU); ctx.fillStyle = k % 2 ? '#e8c060' : '#d8a840'; ctx.fill(); } ctx.restore(); }
    }
    end(ctx);
  }
  /* plante primitive; v: 'moss' (mușchi) | 'cooksonia' */
  function sprout(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const s0 = o.seed || 0;
    if (o.v === 'cooksonia') {
      for (let i = 0; i < 6; i++) {
        const bx = (i - 2.5) * 9, h = 50 + (i * 17) % 30, sw2 = Math.sin(t * 1.5 + s0 + i) * 4;
        const br = (x0, y0, a, l, d) => { const x1 = x0 + Math.cos(a) * l + sw2 * 0.2, y1 = y0 + Math.sin(a) * l; stroke2(ctx, [[x0, y0], [x1, y1]], 2.4 - d * 0.4, '#6a9a3a', { line: d === 0 }); if (d < 2) { br(x1, y1, a - 0.4, l * 0.65, d + 1); br(x1, y1, a + 0.4, l * 0.65, d + 1); } else { ctx.beginPath(); ctx.arc(x1, y1, 3.2, 0, TAU); paint(ctx, '#c8a040', y1 - 3, y1 + 3, { lw: 0.6 }); } };
        br(bx, 0, -PI / 2 + sw2 * 0.01, h * 0.45, 0);
      }
    } else {
      for (let i = 0; i < 9; i++) { const bx = (i - 4) * 9, r = 9 + (i * 7) % 7; A.blob(ctx, bx, -r * 0.4, r, t * 0.3, { seed: i + s0, amp: 0.15, sy: 0.7 }); paint(ctx, i % 2 ? '#5a9a3a' : '#4a8a30', -r, r * 0.3, { lw: 0.6, sheen: [bx - 2, -r * 0.6, r * 0.6, r * 0.3, 0.3] }); }
      ctx.strokeStyle = '#7aba4a'; ctx.lineWidth = LW * 0.8; for (let i = 0; i < 14; i++) { const bx = -36 + i * 5.5, h = 10 + (i * 5) % 8; ctx.beginPath(); ctx.moveTo(bx, -6); ctx.lineTo(bx + Math.sin(t + i) * 1.5, -6 - h); ctx.stroke(); ctx.fillStyle = '#a0702a'; ctx.beginPath(); ctx.arc(bx + Math.sin(t + i) * 1.5, -6 - h, 1.4, 0, TAU); ctx.fill(); }
    }
    end(ctx);
  }
  /* alge / kelp (subacvatic) */
  function algae(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#5a8a2a', s0 = o.seed || 0;
    for (let k = 0; k < 3; k++) {
      const bx = (k - 1) * 12, h = 80 + k * 12 - (k === 1 ? 0 : 20), pts = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([bx + Math.sin(t * 1.2 + s0 + k - u * 2.5) * 10 * u, -u * h]); }
      const c = k === 1 ? col : sh(col, -0.15);
      shape(ctx, taper(pts, 5, 3), c, { tension: 0.5, lw: 0.6 });
      for (let i = 2; i <= 8; i += 2) { const p = pts[i], s = i % 4 ? 1 : -1; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(s * 0.9 + Math.sin(t * 1.5 + i + k) * 0.2); shape(ctx, [[0, 0], [s * 8, -6], [s * 16, -4], [s * 8, 1]], sh(c, 0.12), { tension: 0.5, lw: 0.5 }); ctx.restore(); }
    }
    end(ctx);
  }
  /* corali */
  function coral(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#ff7f6e', s0 = o.seed || 0;
    /* coral-creier */
    ctx.beginPath(); ctx.ellipse(18, -10, 20, 14, 0, PI, 0); ctx.closePath(); paint(ctx, '#e8a060', -24, 0, { sheen: [12, -18, 8, 4, 0.4] });
    ctx.save(); ctx.beginPath(); ctx.ellipse(18, -10, 20, 14, 0, PI, 0); ctx.closePath(); ctx.clip(); ctx.strokeStyle = 'rgba(140,80,40,0.5)'; ctx.lineWidth = LW; for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let xx = -2; xx < 40; xx += 3) ctx.lineTo(xx, -22 + i * 4 + Math.sin(xx * 0.5 + i) * 1.5); ctx.stroke(); } ctx.restore();
    /* coral ramificat */
    const br = (x0, y0, a, l, w, d) => { const sw2 = Math.sin(t * 0.9 + s0 + d) * 0.03, x1 = x0 + Math.cos(a + sw2) * l, y1 = y0 + Math.sin(a + sw2) * l; stroke2(ctx, [[x0, y0], [x1, y1]], w, col); if (d < 3) { br(x1, y1, a - 0.45, l * 0.72, w * 0.78, d + 1); br(x1, y1, a + 0.4, l * 0.7, w * 0.78, d + 1); } else { ctx.fillStyle = sh(col, 0.4); ctx.beginPath(); ctx.arc(x1, y1, w * 0.6, 0, TAU); ctx.fill(); } };
    br(-14, 0, -PI / 2, 30, 8, 0);
    end(ctx);
  }
  /* stromatolite (movile de cianobacterii) */
  function stroma(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    for (const [bx, w, h] of [[-26, 18, 28], [6, 24, 44], [34, 16, 22]]) {
      const P = [[bx - w, 0], [bx - w * 0.9, -h * 0.6], [bx - w * 0.5, -h], [bx + w * 0.5, -h], [bx + w * 0.9, -h * 0.6], [bx + w, 0]];
      shape(ctx, P, '#8a7a5a', { tension: 0.5, sheen: true });
      clipDraw(ctx, P, () => { ctx.strokeStyle = 'rgba(70,55,35,0.5)'; ctx.lineWidth = LW; for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.ellipse(bx, 0, w * (1 - i * 0.04), h * i / 7, 0, PI, 0); ctx.stroke(); } });
      ctx.fillStyle = rgba('#4ad0a0', 0.5 + 0.2 * Math.sin(t * 2 + bx)); ctx.beginPath(); ctx.ellipse(bx, -h + 1, w * 0.5, 2.4, 0, 0, TAU); ctx.fill();
    }
    end(ctx);
  }
  /* Charnia — „frunză” ediacariană fixată de fund */
  function charnia(ctx, x, y, size, t, o) {
    o = o || {}; begin(ctx, x, y, size, o);
    const col = o.color || '#d8a080', sw = sway(t, o, 0.06);
    ctx.beginPath(); ctx.ellipse(0, -2, 8, 3, 0, 0, TAU); paint(ctx, sh(col, -0.1), -5, 1, {});
    ctx.rotate(sw);
    stroke2(ctx, [[0, -2], [0, -14]], 2.4, sh(col, -0.15));
    const P = [[0, -12], [-9, -30], [-10, -60], [-5, -88], [0, -96], [5, -88], [10, -60], [9, -30]];
    shape(ctx, P, col, { tension: 0.5, sheen: true });
    clipDraw(ctx, P, () => { ctx.strokeStyle = rgba(sh(col, -0.45), 0.6); ctx.lineWidth = LW; for (let i = 0; i < 16; i++) { const yy = -16 - i * 5; ctx.beginPath(); ctx.moveTo(-12, yy + 4); ctx.lineTo(0, yy); ctx.lineTo(12, yy + 4); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -96); ctx.stroke(); });
    end(ctx);
  }

  const API = {
    fish, shark, dolphin, whale, plesio, turtle, jelly, squid, ammonite, trilobite, anomalo, dumbo, cucumber, shrimp, angler, scorpion, bacteria,
    trex, sauropod, stego, trike, lizard, frog, mouse, horse, giraffe, elephant, cat, ape, human,
    bird, ptero, bat, dragonfly,
    fern, palm, conifer, tree, flower, grass, sprout, algae, coral, stroma, charnia,
    /* utilitare pentru module */
    shade: sh, mix: mix, rgba: rgba
  };
  /* Creatures.draw('nume', ctx, x, y, size, t, opts) */
  API.draw = function (name, ctx, x, y, size, t, o) { const f = API[name]; if (f) f(ctx, x, y, size, t, o || {}); };
  window.Creatures = API;
})();
