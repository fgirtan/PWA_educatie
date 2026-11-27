/* Modul: Viața pe Stația Spațială */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  /* astronaut în tricou (fără costum), plutind; pose: 'float' | 'sleep' | 'run' | 'eat' */
  function crew(ctx, x, y, s, rot, t, pose, o) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100);
    const skin = o.skin || '#e8b48e', shirt = o.shirt || '#2f5fb3', pants = '#6b6a4a', hair = o.hair || '#4a2e1a';
    const limb = (x0, y0, a1, a2, l1, l2, w, col, end) => { ctx.save(); ctx.translate(x0, y0); ctx.rotate(a1); ctx.fillStyle = col; A.roundRectPath(ctx, -w / 2, 0, w, l1, w / 2); ctx.fill(); ctx.translate(0, l1 - w * 0.3); ctx.rotate(a2); A.roundRectPath(ctx, -w / 2, 0, w, l2, w / 2); ctx.fill(); if (end) { ctx.fillStyle = end; ctx.beginPath(); ctx.arc(0, l2, w * 0.55, 0, TAU); ctx.fill(); } ctx.restore(); };
    const sw = Math.sin(t * 1.3), run = pose === 'run' ? Math.sin(t * 8) : 0;
    let la = [0.5 + sw * 0.15, -0.6], ra = [-0.6 - sw * 0.1, 0.9], ll = [0.25 + sw * 0.08, 0.4], rl = [-0.15, 0.6];
    if (pose === 'run') { la = [0.8 * run, -1]; ra = [-0.8 * run, -1]; ll = [0.7 * run, 0.6 + 0.4 * run]; rl = [-0.7 * run, 0.6 - 0.4 * run]; }
    if (pose === 'eat') { ra = [-2.4, 1.6]; }
    if (pose === 'sleep') { la = [0.15, -0.1]; ra = [-0.15, 0.1]; ll = [0.05, 0]; rl = [-0.05, 0]; }
    limb(8, 20, ll[0], ll[1], 34, 34, 13, pants, '#333');
    limb(14, -36, ra[0], ra[1], 26, 24, 10, shirt, skin);
    ctx.fillStyle = pants; A.roundRectPath(ctx, -14, 4, 30, 24, 8); ctx.fill();
    ctx.fillStyle = shirt; A.roundRectPath(ctx, -16, -42, 32, 50, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6, -30, 3.5, 0, TAU); ctx.fill();
    limb(-6, 20, rl[0], rl[1], 34, 34, 13, A.shade(pants, -0.12), '#2a2a2a');
    limb(-12, -36, la[0], la[1], 26, 24, 10, A.shade(shirt, -0.12), skin);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -58, 15, 0, TAU); ctx.fill();
    /* părul plutește puțin în imponderabilitate */
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -62, 15, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(-10 + i * 5, -74 - Math.abs(Math.sin(t * 1.5 + i)) * 3, 3, 6, (i - 2) * 0.3, 0, TAU); ctx.fill(); }
    if (pose === 'sleep') { ctx.fillStyle = '#2a2f45'; ctx.fillRect(-12, -62, 24, 6); }
    else { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(5, -59, 1.8, 0, TAU); ctx.arc(-4, -59, 1.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(1, -54, 4, 0.2, Math.PI - 0.2); ctx.stroke(); }
    ctx.restore();
  }
  const ACT = {
    float: ['🧑‍🚀 Plutim!', 'Pe Stația Spațială totul <b>plutește</b>: oamenii, creioanele, picăturile de apă. Stația cade mereu în jurul Pământului, așa că nimic nu are „greutate”. Atinge ecranul ca să împingi obiectele!'],
    sleep: ['😴 Somnul', 'Astronauții dorm într-un <b>sac de dormit prins de perete</b>, ca să nu plutească prin stație. Nu există „sus” și „jos”, așa că poți dormi și cu capul în jos!'],
    eat: ['🍽️ Masa', 'Mâncarea vine în pungi și cutii. Pâinea face firimituri care ar pluti peste tot, de aceea se mănâncă <b>lipii (tortilla)</b>. Băuturile se beau cu paiul din pungi. Sarea și piperul sunt lichide!'],
    water: ['💧 Apa', 'Apa nu curge: se adună într-o <b>bilă</b> care plutește și tremură. Astronauții se spală cu un prosop ud, iar apa se recuperează și se refolosește (chiar și din transpirație!).'],
    gym: ['🏋️ Sportul', 'Fără greutate, mușchii și oasele slăbesc. De aceea astronauții fac sport <b>2 ore pe zi</b>: aleargă pe o bandă, legați cu elastice ca să nu plutească.'],
    window: ['🪟 Fereastra', 'Prin cupola cu ferestre se vede Pământul. Stația zboară cu <b>28.000 km/h</b> și face un tur al Pământului în <b>90 de minute</b>, așa că astronauții văd <b>16 răsărituri</b> într-o singură zi!']
  };

  defineModule({
    id: 'isslife', title: 'Viața pe Stația Spațială', sub: 'Cum dorm, mănâncă și se spală astronauții',
    start: function (api) {
      const ctx = api.ctx; let act = 'float', at = 0;
      const r = api.row(''), bs = {};
      for (const k in ACT) bs[k] = api.button(r, ACT[k][0], () => set(k));
      function set(k) { act = k; at = 0; for (const q in bs) bs[q].classList.toggle('on', q === k); api.say(ACT[k][1]); }
      const items = [];
      const ITEM = ['pencil', 'apple', 'can', 'candy', 'candy', 'candy', 'book', 'spoon'];
      function reset() { items.length = 0; ITEM.forEach((k, i) => items.push({ k: k, x: 0.2 + Math.random() * 0.6, y: 0.25 + Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.04, vy: (Math.random() - 0.5) * 0.04, a: Math.random() * TAU, va: (Math.random() - 0.5) * 1.2, c: ['#ff5a6a', '#ffcf4a', '#4ade80', '#5aa8f0'][i % 4] })); }
      reset();
      let box = { x: 0, y: 0, w: 1, h: 1 };
      api.pointer({ down: (x, y) => { const px = (x - box.x) / box.w, py = (y - box.y) / box.h; for (const it of items) { const dx = it.x - px, dy = it.y - py, d = Math.hypot(dx, dy) + 0.02; if (d < 0.35) { it.vx += dx / d * 0.25 * (0.35 - d); it.vy += dy / d * 0.25 * (0.35 - d); it.va += (Math.random() - 0.5) * 4; } } } });
      const drawItem = (it, x, y, s) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(it.a);
        if (it.k === 'pencil') { ctx.fillStyle = '#ffcf4a'; ctx.fillRect(-s, -s * 0.12, s * 1.6, s * 0.24); ctx.fillStyle = '#f2c79a'; ctx.beginPath(); ctx.moveTo(s * 0.6, -s * 0.12); ctx.lineTo(s, 0); ctx.lineTo(s * 0.6, s * 0.12); ctx.fill(); ctx.fillStyle = '#ff8aa0'; ctx.fillRect(-s * 1.15, -s * 0.12, s * 0.2, s * 0.24); }
        else if (it.k === 'apple') { A.sphere(ctx, 0, 0, s * 0.45, '#e2333f', { rim: false }); ctx.strokeStyle = '#6a4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s * 0.4); ctx.lineTo(s * 0.05, -s * 0.6); ctx.stroke(); ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.ellipse(s * 0.17, -s * 0.55, s * 0.14, s * 0.07, -0.5, 0, TAU); ctx.fill(); }
        else if (it.k === 'can') { A.cylinder(ctx, -s * 0.3, -s * 0.45, s * 0.6, s * 0.9, '#c0c6d2', true); ctx.fillStyle = '#3a6ad0'; ctx.fillRect(-s * 0.3, -s * 0.15, s * 0.6, s * 0.3); }
        else if (it.k === 'candy') { A.sphere(ctx, 0, 0, s * 0.18, it.c, { rim: false }); }
        else if (it.k === 'book') { ctx.fillStyle = '#7a4ad0'; ctx.fillRect(-s * 0.5, -s * 0.35, s, s * 0.7); ctx.fillStyle = '#fff'; ctx.fillRect(-s * 0.45, -s * 0.3, s * 0.08, s * 0.6); }
        else { ctx.fillStyle = '#c0c6d2'; ctx.fillRect(-s * 0.6, -s * 0.05, s * 0.8, s * 0.1); ctx.beginPath(); ctx.ellipse(s * 0.35, 0, s * 0.2, s * 0.12, 0, 0, TAU); ctx.fill(); }
        ctx.restore();
      };
      const padL = () => api.W >= 700 ? 84 : 8;
      set('float');
      return {
        frame: function (dt, t) {
          at += dt;
          const W = api.freeW, U = api.unit;
          if (act === 'window') {
            A.scene(ctx, api.W, api.H, 'space'); A.stars(ctx, api.W, api.H, t, { alpha: 0.5 });
            const cx = padL() + (W - padL()) / 2, cy = api.cy, R = U * 0.92;
            /* Pământul văzut de sus, care trece pe sub stație */
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
            const day = (Math.sin(at * 0.7) + 1) / 2;
            const g = ctx.createLinearGradient(0, cy - R, 0, cy + R); g.addColorStop(0, A.mix('#020512', '#0a1a40', day)); g.addColorStop(0.35, A.mix('#0a1430', '#3a8ee0', day)); g.addColorStop(1, A.mix('#06102a', '#1e64b8', day)); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
            const hz = cy - R * 0.35; ctx.fillStyle = A.mix('#0b2348', '#2a7ad0', day); ctx.beginPath(); ctx.ellipse(cx, hz + R * 3, R * 3.2, R * 3, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = 'rgba(140,200,255,' + (0.4 + 0.4 * day) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, hz + R * 3, R * 3.2, R * 3, 0, Math.PI * 1.3, Math.PI * 1.7); ctx.stroke();
            for (let i = 0; i < 9; i++) { const xx = ((i * 0.37 + at * 0.05) % 1.4 - 0.2) * R * 2 + cx - R, yy = hz + R * 0.3 + (i % 3) * R * 0.3; if (i % 3 === 0) { ctx.fillStyle = A.mix('#1a2a1a', '#5a9a45', day); ctx.beginPath(); ctx.ellipse(xx, yy, R * 0.35, R * 0.1, 0, 0, TAU); ctx.fill(); } else { ctx.globalAlpha = 0.5 + day * 0.4; A.cloud(ctx, xx, yy - R * 0.05, R * 0.1); ctx.globalAlpha = 1; } }
            if (day < 0.35) for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,210,120,0.8)'; ctx.beginPath(); ctx.arc(((i * 0.173 + at * 0.05) % 1.4 - 0.2) * R * 2 + cx - R, hz + R * 0.25 + ((i * 37) % 60) / 60 * R * 1.2, 1.4, 0, TAU); ctx.fill(); }
            const sunx = cx - R * 0.7 + ((at * 0.11) % 1) * R * 1.4; if (day > 0.4) A.glow(ctx, sunx, hz - R * 0.1, R * 0.4, '#ffdd88', (day - 0.4) * 1.2);
            ctx.restore();
            /* rama cupolei */
            ctx.strokeStyle = '#c8ccd6'; ctx.lineWidth = Math.max(8, U * 0.05); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
            ctx.lineWidth = Math.max(5, U * 0.03); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.42, cy + Math.sin(a) * R * 0.42); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
            ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU; ctx.lineTo(cx + Math.cos(a) * R * 0.42, cy + Math.sin(a) * R * 0.42); } ctx.stroke();
            crew(ctx, cx + R * 0.95, cy + R * 0.55, U * 0.55, -0.5 + Math.sin(t * 0.5) * 0.05, t, 'float');
            const rs = Math.floor(at * 0.7 / TAU + 0.6);
            A.label(ctx, '🌅 Răsărituri văzute: ' + rs, cx, api.cy - R - 10 > 90 ? api.cy - R - 10 : 100, { size: A.labelSize(U) });
            return;
          }
          /* interiorul modulului */
          A.scene(ctx, api.W, api.H, 'lab');
          const x0 = padL() + 10, x1 = W - 10, y0 = api.cy - U * 0.78, y1 = api.cy + U * 0.78;
          box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
          const wall = ctx.createLinearGradient(0, y0, 0, y1); wall.addColorStop(0, '#d9dde5'); wall.addColorStop(0.15, '#eef1f6'); wall.addColorStop(0.85, '#e6e9f0'); wall.addColorStop(1, '#b9bec9');
          ctx.fillStyle = wall; A.roundRectPath(ctx, x0, y0, x1 - x0, y1 - y0, 30); ctx.fill();
          /* panouri, cabluri, balustrade, laptopuri */
          ctx.strokeStyle = 'rgba(120,130,150,0.35)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const xx = lerp(x0, x1, i / 6); ctx.beginPath(); ctx.moveTo(xx, y0 + 6); ctx.lineTo(xx, y1 - 6); ctx.stroke(); }
          ctx.fillStyle = '#ffcf4a'; for (let i = 0; i < 5; i++) { const xx = lerp(x0, x1, (i + 0.5) / 5); ctx.fillRect(xx - 22, y0 + 14, 44, 6); ctx.fillRect(xx - 22, y1 - 20, 44, 6); }
          [[0.12, 0.25], [0.55, 0.22], [0.83, 0.68]].forEach(([u, v], i) => { const lx = lerp(x0, x1, u), ly = lerp(y0, y1, v); ctx.fillStyle = '#2a2f3d'; ctx.fillRect(lx, ly, 52, 34); ctx.fillStyle = ['#3a8ee0', '#4ade80', '#ffb43d'][i]; ctx.fillRect(lx + 4, ly + 4, 44, 26); });
          ctx.strokeStyle = '#e04a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 30, y1 - 40); ctx.bezierCurveTo(x0 + 120, y1 - 70, x0 + 200, y1 - 20, x0 + 280, y1 - 50); ctx.stroke();
          ctx.strokeStyle = '#3a6ad0'; ctx.beginPath(); ctx.moveTo(x1 - 40, y0 + 40); ctx.bezierCurveTo(x1 - 120, y0 + 80, x1 - 200, y0 + 30, x1 - 300, y0 + 60); ctx.stroke();
          const cx = (x0 + x1) / 2, cy = api.cy, S = U * 0.62;
          if (act === 'sleep') {
            const bx = cx - S * 0.25, by = y0 + 30; ctx.fillStyle = '#2a7a5a'; A.roundRectPath(ctx, bx, by, S * 0.5, S * 1.15, S * 0.2); ctx.fill(); ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = 3; ctx.strokeRect(bx - 6, by - 6, 10, 10);
            crew(ctx, cx, by + S * 0.75, S * 0.85, 0, t, 'sleep');
            ctx.fillStyle = '#2a7a5a'; A.roundRectPath(ctx, bx, by + S * 0.36, S * 0.5, S * 0.8, S * 0.18); ctx.fill();
            for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i / 3) % 1; A.text(ctx, 'z', cx + S * 0.3 + ph * 40, by + S * 0.2 - ph * 60, { size: 14 + i * 5, color: 'rgba(60,80,140,' + (1 - ph) + ')', halo: false }); }
          } else if (act === 'gym') {
            const gy = y1 - 26; ctx.fillStyle = '#3a3f4f'; ctx.fillRect(cx - S * 0.7, gy, S * 1.4, 14); ctx.fillStyle = '#5b6577'; for (let i = 0; i < 10; i++) ctx.fillRect(cx - S * 0.7 + ((i * S * 0.14 - at * 120) % (S * 1.4) + S * 1.4) % (S * 1.4), gy + 3, 4, 8);
            crew(ctx, cx, gy - S * 0.62, S, 0, t, 'run');
            ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - S * 0.12, gy - S * 0.85); ctx.lineTo(cx - S * 0.6, gy); ctx.moveTo(cx + S * 0.12, gy - S * 0.85); ctx.lineTo(cx + S * 0.6, gy); ctx.stroke();
            A.label(ctx, 'elastice care îl țin pe bandă', cx + S * 0.85, gy - S * 0.5, { size: A.labelSize(U) * 0.85, tx: cx + S * 0.45, ty: gy - S * 0.2 });
          } else {
            const wb = Math.sin(t * 0.6) * 0.08;
            crew(ctx, cx - S * 0.2, cy + Math.sin(t * 0.8) * 10, S, wb + (act === 'float' ? t * 0.15 : 0.2), t, act === 'eat' ? 'eat' : 'float');
            if (act === 'eat') {
              const tx = cx + S * 0.5 + Math.sin(t) * 8, ty = cy - S * 0.3 + Math.cos(t * 0.8) * 8; ctx.save(); ctx.translate(tx, ty); ctx.rotate(t * 0.3); ctx.fillStyle = '#f0d9a0'; ctx.beginPath(); ctx.arc(0, 0, S * 0.18, 0, TAU); ctx.fill(); ctx.fillStyle = '#d9b46a'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(Math.cos(i) * S * 0.1, Math.sin(i * 2) * S * 0.1, 3, 0, TAU); ctx.fill(); } ctx.restore();
              A.label(ctx, 'lipie', tx, ty - S * 0.26, { size: A.labelSize(U) * 0.85 });
              const px = cx + S * 0.75, py = cy + S * 0.2 + Math.sin(t * 0.9) * 10; ctx.fillStyle = '#c9d6e8'; A.roundRectPath(ctx, px - 16, py - 24, 32, 46, 6); ctx.fill(); ctx.fillStyle = '#ff9a3a'; ctx.fillRect(px - 12, py - 4, 24, 22); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py - 24); ctx.lineTo(px + 6, py - 40); ctx.stroke();
              A.label(ctx, 'suc în pungă', px, py + 40, { size: A.labelSize(U) * 0.85 });
            }
            if (act === 'water') {
              const wx = cx + S * 0.55, wy = cy - S * 0.1, wr = S * 0.22;
              ctx.save(); A.blob(ctx, wx, wy, wr, t * 3, { amp: 0.09, points: 10 }); const g = ctx.createRadialGradient(wx - wr * 0.4, wy - wr * 0.4, 1, wx, wy, wr * 1.1); g.addColorStop(0, 'rgba(230,248,255,0.95)'); g.addColorStop(0.5, 'rgba(110,190,250,0.65)'); g.addColorStop(1, 'rgba(40,120,210,0.7)'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
              ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(wx - wr * 0.35, wy - wr * 0.4, wr * 0.2, wr * 0.1, -0.6, 0, TAU); ctx.fill();
              for (let i = 0; i < 6; i++) { const a = t * 0.4 + i, d = wr * (1.6 + 0.3 * Math.sin(t + i)); A.sphere(ctx, wx + Math.cos(a) * d, wy + Math.sin(a) * d, 3 + (i % 3) * 2, '#7ac4ff', { rim: false }); }
              A.label(ctx, 'o bilă de apă care plutește', wx, wy + wr + 26, { size: A.labelSize(U) * 0.85 });
            }
          }
          /* obiectele care plutesc */
          if (act === 'float' || act === 'eat') for (const it of items) {
            it.x += it.vx * dt; it.y += it.vy * dt; it.a += it.va * dt; it.va *= 0.995;
            if (it.x < 0.05 || it.x > 0.95) { it.vx *= -0.8; it.x = clamp(it.x, 0.05, 0.95); } if (it.y < 0.08 || it.y > 0.92) { it.vy *= -0.8; it.y = clamp(it.y, 0.08, 0.92); }
            drawItem(it, lerp(x0, x1, it.x), lerp(y0, y1, it.y), U * 0.12);
          }
          A.text(ctx, act === 'float' ? '👆 Atinge ca să împingi obiectele' : '', cx, y1 + 18, { size: A.fs(U, 0.035, 11), color: 'rgba(255,255,255,0.7)' });
        }
      };
    }
  });
})();
