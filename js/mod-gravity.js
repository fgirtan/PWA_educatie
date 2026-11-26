/* MODUL: LABORATOR DE GRAVITAȚIE — lansează planete și vezi orbitele */
defineModule({
  id: 'gravity',
  title: 'Laborator de gravitație',
  sub: 'Pune planete pe orbită în jurul unei stele',
  start: function (api) {
    const ctx = api.ctx;
    let strength = 1, objs = [], aim = null, orbits = 0, fell = 0, lost = 0, flash = 0;
    const COLS = ['#7fd1ff', '#ffb36b', '#b7ff8a', '#ff8fb8', '#d8b4ff', '#ffe27a'];
    const GM = () => Math.pow(2 * Math.PI / 6, 2) * Math.pow(api.unit * 0.55, 3) * strength;   // pe raza R0 orbita durează 6 s
    const r1 = api.row('');
    api.slider(r1, { label: 'Masa stelei', min: 0.25, max: 4, step: 0.01, value: 1, fmt: (v) => (v < 1.2 ? 'cât Soarele ×' : 'de ') + v.toFixed(2), onInput: (v) => { strength = v; } });
    api.button(r1, '🧹 Curăță', () => { objs = []; });
    api.button(r1, '🪐 Sistem gata făcut', () => { objs = []; [0.3, 0.5, 0.75, 1.0].forEach((k, i) => { const r = api.unit * k; objs.push(mk(api.cx + r, api.cy, 0, -Math.sqrt(GM() / r), COLS[i])); }); });
    function mk(x, y, vx, vy, col) { return { x: x, y: y, vx: vx, vy: vy, col: col, tr: [], ang: 0, last: Math.atan2(y - api.cy, x - api.cx), done: 0 }; }
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
    const ST = []; for (let i = 0; i < 140; i++) ST.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.4]);
    function frame(dt, t) {
      const g = GM(), cx = api.cx, cy = api.cy, sub = 6, h = dt / sub, R = api.unit * 0.07 * (0.7 + 0.3 * strength);
      for (let s = 0; s < sub; s++) for (const o of objs) {
        if (o.dead) continue;
        const dx = o.x - cx, dy = o.y - cy, r = Math.hypot(dx, dy);
        if (r < R) { o.dead = 1; fell++; flash = 1; api.say('💥 A căzut în stea! Viteza nu a fost suficientă ca să rămână pe orbită.', 4000); continue; }
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
      ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H);
      for (const s of ST) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }
      /* cercul orbitei circulare de referință */
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.arc(cx, cy, api.unit * 0.55, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      for (const o of objs) {
        ctx.strokeStyle = o.col; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o.tr[0], o.tr[1]);
        for (let i = 2; i < o.tr.length; i += 2) ctx.lineTo(o.tr[i], o.tr[i + 1]); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(o.x, o.y, 6, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const [rad, a] of [[R * 4, 0.3], [R * 2, 0.6]]) { const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad); gr.addColorStop(0, 'rgba(255,200,90,' + (a + flash * 0.3) + ')'); gr.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over'; flash = Math.max(0, flash - dt * 2);
      ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      if (aim && Math.hypot(aim.x1 - aim.x0, aim.y1 - aim.y0) > 12) { ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(aim.x0, aim.y0); ctx.lineTo(aim.x1, aim.y1); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '600 14px system-ui,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('Orbite complete: ' + orbits, api.W - 14, 80); ctx.fillText('Căzute: ' + fell + ' · Scăpate: ' + lost, api.W - 14, 100);
    }
    return { frame: frame };
  }
});
