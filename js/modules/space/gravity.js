/* MODUL: LABORATOR DE GRAVITAȚIE — lansează planete și vezi orbitele */
defineModule({
  id: 'gravity',
  title: 'Laborator de gravitație',
  sub: 'Pune planete pe orbită în jurul unei stele',
  start: function (api) {
    const ctx = api.ctx, TAU = Math.PI * 2;
    let strength = 1, objs = [], aim = null, orbits = 0, fell = 0, lost = 0, flash = 0;
    const COLS = ['#7fd1ff', '#ffb36b', '#b7ff8a', '#ff8fb8', '#d8b4ff', '#ffe27a'];
    const GM = () => Math.pow(2 * Math.PI / 6, 2) * Math.pow(api.unit * 0.55, 3) * strength;   // pe raza R0 orbita durează 6 s
    const r1 = api.row('');
    api.slider(r1, { label: 'Masa stelei', min: 0.25, max: 4, step: 0.01, value: 1, fmt: (v) => (v < 1.2 ? 'cât Soarele ×' : 'de ') + v.toFixed(2), onInput: (v) => { strength = v; } });
    api.button(r1, '🧹 Curăță', () => { objs = []; });
    api.button(r1, '🪐 Sistem gata făcut', () => { objs = []; [0.3, 0.5, 0.75, 1.0].forEach((k, i) => { const r = api.unit * k; objs.push(mk(api.cx + r, api.cy, 0, -Math.sqrt(GM() / r), COLS[i])); }); });
    function mk(x, y, vx, vy, col) {
      return { x: x, y: y, vx: vx, vy: vy, col: col, tr: [], ang: 0, last: Math.atan2(y - api.cy, x - api.cx), done: 0,
        sz: 0.8 + Math.random() * 0.5, ring: Math.random() < 0.22, band: Math.random() < 0.5, seed: Math.random() * 50 };
    }
    api.say('<b>Atinge</b> ca să pui o planetă pe orbită circulară. <b>Trage</b> ca să-i dai viteza și direcția ta. Ce se întâmplă dacă e prea lentă? Dar prea rapidă?', 9000);
    api.pointer({
      down: (x, y) => { aim = { x0: x, y0: y, x1: x, y1: y }; },
      move: (x, y) => { if (aim) { aim.x1 = x; aim.y1 = y; } },
      up: (x, y) => {
        if (!aim) return;
        const col = COLS[Math.floor(Math.random() * COLS.length)], dx = x - aim.x0, dy = y - aim.y0;
        if (Math.hypot(dx, dy) < 12) {
          const ddx = aim.x0 - api.cx, ddy = aim.y0 - api.cy, r = Math.hypot(ddx, ddy) || 1, v = Math.sqrt(GM() / r);
          objs.push(mk(aim.x0, aim.y0, -ddy / r * v, ddx / r * v, col));
        } else objs.push(mk(aim.x0, aim.y0, dx * 1.2, dy * 1.2, col));
        if (objs.length > 40) objs.shift();
        aim = null;
      }
    });

    /* ---------- fundal pre-randat: cer adânc cu nebuloase discrete ---------- */
    /* fundal curat: gradient blând + câteva stele fixe, discrete */
    function background() {
      return Art.cached('grav-bg2', api.W, api.H, (c, w, h) => {
        Art.backdrop(c, w, h, { top: '#0b1026', bottom: '#04060f', vignette: false });
        let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        const n = Math.round(w * h / 9000);
        for (let i = 0; i < n; i++) { c.fillStyle = 'rgba(225,232,255,' + (0.25 + rnd() * 0.4).toFixed(2) + ')'; c.beginPath(); c.arc(rnd() * w, rnd() * h, 0.5 + rnd() * 0.9, 0, TAU); c.fill(); }
      });
    }
    /* suprafața granulară a stelei (cache, culoare fixă; mărimea se scalează) */
    const starTex = () => Art.cached('grav-star', 256, 256, (c, w) => {
      const r = w / 2;
      const g = c.createRadialGradient(r * 0.8, r * 0.75, 0, r, r, r);
      g.addColorStop(0, '#fffbe6'); g.addColorStop(0.45, '#ffe08a'); g.addColorStop(0.85, '#ffab3d'); g.addColorStop(1, '#e8641c');
      c.fillStyle = g; c.beginPath(); c.arc(r, r, r, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(r, r, r, 0, TAU); c.clip();
      let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 900; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r, x = r + Math.cos(a) * d, y = r + Math.sin(a) * d, rr = 2 + rnd() * 5; c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,230,0.16)' : 'rgba(170,70,10,0.14)'; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); }
      const limb = c.createRadialGradient(r, r, r * 0.55, r, r, r); limb.addColorStop(0, 'rgba(120,40,0,0)'); limb.addColorStop(1, 'rgba(140,40,0,0.55)');
      c.fillStyle = limb; c.fillRect(0, 0, w, w); c.restore();
    });

    /* ---------- scântei când o planetă cade în stea ---------- */
    const sparks = [];
    function burst(x, y) {
      for (let i = 0; i < 12; i++) { const a = Math.random() * TAU, v = 30 + Math.random() * 80; sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: 0.5 + Math.random() * 0.7 }); }
      if (sparks.length > 400) sparks.splice(0, sparks.length - 400);
    }

    const pr = (o) => api.unit * 0.022 * o.sz + 3;     // raza desenată a unei planete

    function drawTrail(o) {
      const n = o.tr.length / 2; if (n < 3) return;
      const chunks = 14, per = Math.ceil(n / chunks), base = pr(o);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let c = 0; c < chunks; c++) {
        const i0 = c * per, i1 = Math.min(n - 1, (c + 1) * per); if (i1 <= i0) continue;
        const k = (c + 1) / chunks;
        ctx.strokeStyle = Art.rgba(o.col, 0.04 + 0.5 * k * k);
        ctx.lineWidth = 0.8 + base * 0.7 * k;
        ctx.beginPath(); ctx.moveTo(o.tr[i0 * 2], o.tr[i0 * 2 + 1]);
        for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(o.tr[i * 2], o.tr[i * 2 + 1]);
        ctx.stroke();
      }
    }
    function drawPlanet(o, cx, cy) {
      const r = pr(o), dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy) || 1;
      const lx = -dx / d * 0.45, ly = -dy / d * 0.45;      // lumina vine dinspre stea
      if (o.ring) { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(0.45); ctx.strokeStyle = Art.rgba(Art.shade(o.col, 0.3), 0.55); ctx.lineWidth = r * 0.28; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * 0.55, 0, Math.PI, TAU); ctx.stroke(); ctx.restore(); }
      Art.sphere(ctx, o.x, o.y, r, o.col, { lx: lx, ly: ly, rimColor: o.col });
      if (o.band) {
        ctx.save(); ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, TAU); ctx.clip();
        ctx.strokeStyle = Art.rgba(Art.shade(o.col, -0.4), 0.35); ctx.lineWidth = r * 0.22;
        for (const k of [-0.35, 0.2]) { ctx.beginPath(); ctx.ellipse(o.x, o.y + k * r, r * 1.1, r * 0.18, 0.12, 0, TAU); ctx.stroke(); }
        ctx.restore();
      }
      /* umbra nopții: jumătatea opusă stelei */
      ctx.save(); ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, TAU); ctx.clip();
      const sh = ctx.createLinearGradient(o.x - dx / d * r, o.y - dy / d * r, o.x + dx / d * r, o.y + dy / d * r);
      sh.addColorStop(0, 'rgba(0,0,10,0)'); sh.addColorStop(0.55, 'rgba(0,0,10,0.15)'); sh.addColorStop(1, 'rgba(0,0,15,0.75)');
      ctx.fillStyle = sh; ctx.fillRect(o.x - r, o.y - r, r * 2, r * 2); ctx.restore();
      if (o.ring) { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(0.45); ctx.strokeStyle = Art.rgba(Art.shade(o.col, 0.35), 0.75); ctx.lineWidth = r * 0.28; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * 0.55, 0, 0, Math.PI); ctx.stroke(); ctx.restore(); }
    }
    function drawStar(cx, cy, R, t) {
      /* lumina stelei (reținută) + coroana: un singur strat moale */
      const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.4);
      g.addColorStop(0, 'rgba(255,200,110,' + (0.35 + flash * 0.2).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,160,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 2.4, 0, TAU); ctx.fill();
      Art.blob(ctx, cx, cy, R * 1.22, t * 0.3, { points: 16, amp: 0.06, seed: 1.3 });
      ctx.fillStyle = 'rgba(255,190,100,0.35)'; ctx.fill();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.03);
      ctx.drawImage(starTex(), -R, -R, R * 2, R * 2); ctx.restore();
    }
    /* câmpul gravitațional, sugerat discret: inele care „curg” spre stea */
    function drawField(cx, cy) {
      const U = api.unit;
      ctx.save(); ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        const r = U * 0.22 * i * i * 0.45 + U * 0.12;
        ctx.strokeStyle = 'rgba(150,175,235,' + (0.07 * Math.min(1.5, strength) * (1 - i / 6)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }

    function frame(dt, t) {
      const g = GM(), cx = api.cx, cy = api.cy, sub = 6, h = dt / sub, R = api.unit * 0.07 * (0.7 + 0.3 * strength);
      for (let s = 0; s < sub; s++) for (const o of objs) {
        if (o.dead) continue;
        const dx = o.x - cx, dy = o.y - cy, r = Math.hypot(dx, dy);
        if (r < R) { o.dead = 1; fell++; flash = 1; burst(o.x, o.y); api.say('💥 A căzut în stea! Viteza nu a fost suficientă ca să rămână pe orbită.', 4000); continue; }
        const a = g / (r * r + 25);
        o.vx -= a * dx / r * h; o.vy -= a * dy / r * h; o.x += o.vx * h; o.y += o.vy * h;
      }
      for (const o of objs) {
        if (o.dead) continue;
        const an = Math.atan2(o.y - cy, o.x - cx); let d = an - o.last; if (d > Math.PI) d -= 6.283; if (d < -Math.PI) d += 6.283;
        o.ang += d; o.last = an;
        if (Math.abs(o.ang) >= (o.done + 1) * 6.283) { o.done++; orbits++; api.say('🎉 <b>Orbită completă!</b> Planeta s-a întors de unde a plecat.', 3500); }
        o.tr.push(o.x, o.y); if (o.tr.length > 700) o.tr.splice(0, 2);
        if (Math.hypot(o.x - cx, o.y - cy) > api.unit * 4.5) { o.dead = 2; lost++; api.say('🚀 A scăpat în spațiu! Viteza ei a depășit <b>viteza de evadare</b>.', 4000); }
      }
      objs = objs.filter((o) => !o.dead);
      for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.age += dt; if (p.age > p.life) { sparks.splice(i, 1); continue; } p.vx *= 0.96; p.vy *= 0.96; p.x += p.vx * dt; p.y += p.vy * dt; }

      ctx.drawImage(background(), 0, 0, api.W, api.H);
      drawField(cx, cy);
      /* cercul orbitei circulare de referință */
      ctx.save(); ctx.strokeStyle = 'rgba(200,220,255,0.13)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 9]); ctx.beginPath(); ctx.arc(cx, cy, api.unit * 0.55, 0, TAU); ctx.stroke(); ctx.restore();

      ctx.save();
      for (const o of objs) drawTrail(o);
      ctx.restore();
      drawStar(cx, cy, R, t);
      for (const o of objs) drawPlanet(o, cx, cy);

      if (sparks.length) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (const p of sparks) { const a = 1 - p.age / p.life; ctx.strokeStyle = 'rgba(255,' + Math.round(160 + 80 * a) + ',90,' + a.toFixed(2) + ')'; ctx.lineWidth = 1 + 2 * a; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); ctx.stroke(); }
        ctx.restore();
      }
      flash = Math.max(0, flash - dt * 2);

      if (aim) {
        const len = Math.hypot(aim.x1 - aim.x0, aim.y1 - aim.y0);
        ctx.fillStyle = '#7dffb0'; ctx.beginPath(); ctx.arc(aim.x0, aim.y0, 4, 0, TAU); ctx.fill();
        if (len > 12) Art.arrow(ctx, aim.x0, aim.y0, aim.x1, aim.y1, { color: 'rgba(125,255,176,0.9)', width: 3, dash: [8, 6] });
      }
      const fz = Art.fs(api.unit, 0.04, 13);
      Art.label(ctx, 'Orbite complete: ' + orbits, api.freeW - 14, 80, { size: fz, align: 'right', color: '#ffe8a8' });
      Art.label(ctx, 'Căzute: ' + fell + ' · Scăpate: ' + lost, api.freeW - 14, 80 + fz * 2.1, { size: fz, align: 'right' });
    }
    return { frame: frame };
  }
});
