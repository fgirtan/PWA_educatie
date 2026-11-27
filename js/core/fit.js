/* Fit — încadrează un desen de mărime fixă (ex. 1000×600) în zona liberă a modulului.
   const v = Fit(api, 1000, 600); ctx.save(); v.apply(ctx); …desen…; ctx.restore();  v.inv(x, y) → coordonate în desen */
(function () {
  window.Fit = function (api, dw, dh, o) {
    o = o || {};
    const L = o.noPad ? 6 : (api.W >= 700 ? 80 : 6);
    const ph = api.panel ? api.panel.offsetHeight : 0;
    const fh = Math.max(120, 2 * (api.H - ph - api.cy) - 8);
    const fw = Math.max(120, api.freeW - L - 8);
    const k = Math.min(fw / dw, fh / dh);
    const ox = L + (fw - dw * k) / 2, oy = api.cy - dh * k / 2;
    return { k: k, ox: ox, oy: oy, apply: function (ctx) { ctx.translate(ox, oy); ctx.scale(k, k); }, inv: function (x, y) { return [(x - ox) / k, (y - oy) / k]; } };
  };
  /* semnal nervos: puncte luminoase care merg de-a lungul unui drum */
  window.NervePulse = function (ctx, pts, t, o) {
    o = o || {}; const A = window.Art, S = A.pathSampler(pts, false, 80), n = o.n || 3, col = o.color || '#ffe36a', sp = o.speed || 0.8;
    ctx.save(); ctx.strokeStyle = o.nerve || 'rgba(255,220,120,0.55)'; ctx.lineWidth = o.width || 4; ctx.lineCap = 'round'; ctx.beginPath(); A.smoothPath(ctx, pts, false); ctx.stroke(); ctx.restore();
    if (o.active === false) return;
    for (let i = 0; i < n; i++) { const u = ((t * sp + i / n) % 1), p = S.at(u); A.glow(ctx, p.x, p.y, (o.r || 10) * 1.8, col, 0.9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, (o.r || 10) * 0.35, 0, Math.PI * 2); ctx.fill(); }
  };
  /* creier mic (simbol), văzut din lateral */
  window.MiniBrain = function (ctx, x, y, r, glow, t) {
    const A = window.Art; if (glow > 0) A.glow(ctx, x, y, r * 2.2, '#ffe36a', 0.6 * glow);
    ctx.save(); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 1.1); g.addColorStop(0, '#ffc6d2'); g.addColorStop(1, '#d9708a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.15, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(140,40,70,0.55)'; ctx.lineWidth = Math.max(1.5, r * 0.07); ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); const yy = y - r * 0.55 + i * r * 0.2; ctx.moveTo(x - r * 0.9 + (i % 2) * r * 0.2, yy); ctx.bezierCurveTo(x - r * 0.3, yy - r * 0.2, x + r * 0.1, yy + r * 0.2, x + r * 0.8 - (i % 3) * r * 0.1, yy); ctx.stroke(); }
    ctx.restore();
  };
  /* bulă de gând (de la creier) */
  window.ThinkBubble = function (ctx, x, y, s, txt, a) {
    const A = window.Art; ctx.save(); ctx.globalAlpha = a === undefined ? 1 : a;
    ctx.font = A.font(s, 800); const w = ctx.measureText(txt).width + s * 1.4, h = s * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; A.roundRectPath(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - w * 0.3, y + h * 0.65, s * 0.25, 0, Math.PI * 2); ctx.arc(x - w * 0.38, y + h * 0.95, s * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1f33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 1); ctx.restore();
  };
})();
/* desenează o creatură cu o înălțime dată în pixeli, cu picioarele pe y */
(function () {
  const M = {};
  function measure(name, o) {
    const key = name + (o && o.v ? ':' + o.v : '');
    if (M[key]) return M[key];
    const c = document.createElement('canvas'); c.width = 700; c.height = 700; const x = c.getContext('2d');
    window.Creatures.draw(name, x, 350, 500, 100, 0, Object.assign({}, o || {}, { face: 1 }));
    const d = x.getImageData(0, 0, 700, 700).data; let y0 = 700, y1 = 0, x0 = 700, x1 = 0;
    for (let yy = 0; yy < 700; yy += 2) for (let xx = 0; xx < 700; xx += 2) if (d[(yy * 700 + xx) * 4 + 3] > 30) { if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; }
    return (M[key] = { h: Math.max(1, y1 - y0), w: Math.max(1, x1 - x0), base: y1 - 500, cx: (x0 + x1) / 2 - 350 });
  }
  window.CreatureH = function (name, ctx, x, y, hpx, t, o) {
    o = o || {}; const m = measure(name, o), s = 100 * hpx / m.h, f = o.face === undefined ? 1 : o.face;
    window.Creatures.draw(name, ctx, x - m.cx * s / 100 * f, y - m.base * s / 100, s, t, o);
    return { w: m.w * s / 100, h: hpx };
  };
  window.CreatureW = function (name, hpx, o) { const m = measure(name, o); return m.w * hpx / m.h; };
  window.Emoji = function (ctx, e, x, y, s, rot) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.font = Math.round(s) + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, 0); ctx.restore(); };
})();
