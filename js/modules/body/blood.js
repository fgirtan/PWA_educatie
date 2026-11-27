/* Modul: Sângele — drumul sângelui și ce e în el */
(function () {
  const A = window.Art, TAU = Math.PI * 2, clamp = A.clamp, lerp = A.lerp;
  const RED = '#e8394f', BLUE = '#5a6ae0';
  /* globulă roșie (disc cu adâncitură) */
  function rbc(ctx, x, y, r, a, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(a * 1.3)));
    const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r); g.addColorStop(0, A.shade(col, -0.25)); g.addColorStop(0.55, A.shade(col, 0.1)); g.addColorStop(1, A.shade(col, -0.3));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore();
  }
  defineModule({
    id: 'blood', title: 'Sângele', sub: 'Drumul sângelui prin corp și ce e în el',
    start: function (api) {
      const ctx = api.ctx; let mode = 'map', hr = 80, wound = 0, woundT = 0;
      const rm = api.row(''), bs = {};
      [['map', '🫀 Drumul sângelui'], ['vessel', '🔬 În vasul de sânge']].forEach(([k, s]) => { bs[k] = api.button(rm, s, () => setMode(k)); });
      const r1 = api.row(''), r2 = api.row('');
      api.slider(r1, { label: 'Bătăile inimii', min: 50, max: 160, step: 1, value: hr, fmt: (v) => v + ' pe minut ' + (v > 120 ? '🏃 alergi' : v < 65 ? '😴 dormi' : '🙂 stai'), onInput: (v) => { hr = v; } });
      api.button(r2, '🩹 Fă o tăietură', () => { wound = 1; woundT = 0; api.say('<b>Te-ai tăiat!</b> Sângele începe să iasă, dar <b>trombocitele</b> (bucățelele mici, galbene) se adună imediat la rană și se lipesc ca un dop. Așa se face <b>coaja</b>. Iar <b>globulele albe</b> vin să mănânce microbii care au intrat.'); });
      api.button(r2, '🦠 Trimite un microb', () => { germs.push({ x: 0.05, y: 0.5 + (Math.random() - 0.5) * 0.4, vx: 0.05, vy: 0, dead: 0 }); api.say('Un <b>microb</b> a intrat în sânge! <b>Globulele albe</b> sunt soldații corpului: îl găsesc, îl înconjoară și îl „mănâncă”.'); });
      function setMode(m) { mode = m; for (const k in bs) bs[k].classList.toggle('on', k === m); r1.style.display = m === 'map' ? '' : 'none'; r2.style.display = m === 'vessel' ? '' : 'none'; api.say(m === 'map' ? 'Inima e o <b>pompă</b> care împinge sângele prin tot corpul, prin niște țevi numite <b>vase de sânge</b>. Sângele <b>roșu</b> duce oxigen de la plămâni la tot corpul. Sângele care se întoarce (desenat cu <b>albastru</b>) aduce înapoi „gunoiul” și merge la plămâni să ia oxigen nou. Un drum complet durează <b>cam un minut</b>!' : 'Hai să intrăm într-un vas de sânge! Sângele e plin de <b>globule roșii</b> (care cară oxigenul), câteva <b>globule albe</b> (soldații) și <b>trombocite</b> (care repară rănile).'); api.layout(); }
      /* drumuri pe hartă (în coordonatele desenului 1000×600) */
      const H = [500, 250];
      const loops = [
        { body: true, pts: [[H[0] + 10, H[1]], [560, 160], [560, 70], [520, 50], [480, 70], [450, 150], [H[0] - 10, H[1]]] },            // capul
        { body: true, pts: [[H[0] + 15, H[1] + 10], [640, 230], [700, 330], [690, 420], [640, 360], [580, 290], [H[0] - 5, H[1] + 20]] },  // brațul drept
        { body: true, pts: [[H[0] + 5, H[1] + 10], [380, 230], [310, 330], [310, 420], [360, 360], [420, 290], [H[0] - 15, H[1] + 20]] },  // brațul stâng
        { body: true, pts: [[H[0] + 10, H[1] + 20], [530, 360], [560, 470], [560, 560], [520, 560], [500, 420], [H[0] - 5, H[1] + 25]] },  // piciorul drept
        { body: true, pts: [[H[0] + 5, H[1] + 25], [470, 380], [440, 470], [440, 560], [480, 560], [490, 420], [H[0] - 10, H[1] + 20]] },  // piciorul stâng
        { lung: true, pts: [[H[0] - 10, H[1] - 10], [430, 210], [400, 180], [430, 160], [470, 200], [H[0], H[1] - 15]] },                // plămânul stâng
        { lung: true, pts: [[H[0] + 10, H[1] - 10], [570, 210], [600, 180], [570, 160], [530, 200], [H[0] + 5, H[1] - 15]] }              // plămânul drept
      ].map((l) => ({ ...l, S: A.pathSampler(l.pts, false, 60) }));
      const cells = []; for (let i = 0; i < 160; i++) cells.push({ l: i % loops.length, u: Math.random(), s: 0.8 + Math.random() * 0.4 });
      /* vasul de sânge */
      const vc = []; for (let i = 0; i < 70; i++) vc.push({ x: Math.random(), y: 0.15 + Math.random() * 0.7, a: Math.random() * TAU, va: (Math.random() - 0.5) * 2, s: 0.8 + Math.random() * 0.4 });
      const plt = []; for (let i = 0; i < 18; i++) plt.push({ x: Math.random(), y: 0.15 + Math.random() * 0.7, stuck: 0 });
      const wbc = [{ x: 0.3, y: 0.4, vx: 0, vy: 0 }, { x: 0.75, y: 0.65, vx: 0, vy: 0 }];
      const germs = [];
      let beat = 0;
      setMode('map');
      return {
        frame: function (dt, t) {
          A.scene(ctx, api.W, api.H, 'body');
          const v = window.Fit(api, 1000, 600); ctx.save(); v.apply(ctx);
          const bps = hr / 60; beat += dt * bps; const pulse = Math.pow(Math.max(0, Math.sin(beat * TAU)), 6);
          if (mode === 'map') {
            /* silueta */
            ctx.fillStyle = 'rgba(255,190,170,0.13)'; ctx.strokeStyle = 'rgba(255,200,180,0.35)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(520, 70, 48, 58, 0, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(430, 140); ctx.lineTo(610, 140); ctx.lineTo(720, 430); ctx.lineTo(680, 440); ctx.lineTo(600, 280); ctx.lineTo(590, 380); ctx.lineTo(580, 580); ctx.lineTo(530, 580); ctx.lineTo(520, 400); ctx.lineTo(500, 580); ctx.lineTo(450, 580); ctx.lineTo(440, 380); ctx.lineTo(430, 280); ctx.lineTo(340, 440); ctx.lineTo(300, 430); ctx.closePath(); ctx.fill(); ctx.stroke();
            /* plămânii */
            ctx.fillStyle = 'rgba(255,150,170,0.35)'; ctx.beginPath(); ctx.ellipse(425, 195, 42, 60, 0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(590, 195, 42, 60, -0.1, 0, TAU); ctx.fill();
            /* vasele */
            for (const l of loops) { const n = l.pts.length, half = Math.floor(n / 2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
              ctx.strokeStyle = A.rgba(l.lung ? BLUE : RED, 0.55); ctx.lineWidth = 8; ctx.beginPath(); A.smoothPath(ctx, l.pts.slice(0, half + 1), false); ctx.stroke();
              ctx.strokeStyle = A.rgba(l.lung ? RED : BLUE, 0.55); ctx.beginPath(); A.smoothPath(ctx, l.pts.slice(half), false); ctx.stroke(); }
            /* globulele care curg */
            for (const c of cells) { const l = loops[c.l]; c.u += dt * bps * 0.12 * c.s * (1 + pulse * 1.5); if (c.u > 1) { c.u -= 1; c.l = Math.floor(Math.random() * loops.length); } const p = l.S.at(c.u), ox = c.u < 0.5; const col = l.lung ? (ox ? BLUE : RED) : (ox ? RED : BLUE); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, TAU); ctx.fill(); }
            /* inima */
            const hs = 1 + pulse * 0.18; ctx.save(); ctx.translate(H[0], H[1]); ctx.scale(hs, hs); A.glow(ctx, 0, 0, 50, '#ff5a6a', 0.3 + pulse * 0.5);
            ctx.fillStyle = '#d42a40'; ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-40, 0, -34, -30, -14, -30); ctx.bezierCurveTo(-4, -30, 0, -22, 0, -16); ctx.bezierCurveTo(0, -22, 4, -30, 14, -30); ctx.bezierCurveTo(34, -30, 40, 0, 0, 26); ctx.fill(); ctx.restore();
            A.label(ctx, 'Inima — pompa', 230, 260, { size: 17, tx: H[0] - 30, ty: H[1] }); A.label(ctx, 'Plămânii: sângele ia oxigen', 210, 150, { size: 16, tx: 400, ty: 190 });
            A.label(ctx, '🔴 cu oxigen', 830, 260, { size: 16, color: '#ffb0b8' }); A.label(ctx, '🔵 fără oxigen', 830, 300, { size: 16, color: '#b8c4ff' });
            A.text(ctx, '❤️ ' + Math.round(hr * 60 * 24).toLocaleString('ro-RO') + ' de bătăi pe zi', 830, 380, { size: 17 });
            A.text(ctx, 'ai ~5 litri de sânge', 830, 410, { size: 16 }); A.text(ctx, '(cât 2 sticle mari de apă)', 830, 434, { size: 14, color: 'rgba(255,255,255,0.7)' });
          } else {
            const x0 = 40, x1 = 960, y0 = 120, y1 = 520, Hh = y1 - y0;
            const wg = ctx.createLinearGradient(0, y0 - 40, 0, y1 + 40); wg.addColorStop(0, '#7a1a2a'); wg.addColorStop(0.1, '#c84050'); wg.addColorStop(0.5, '#e86a72'); wg.addColorStop(0.9, '#c84050'); wg.addColorStop(1, '#7a1a2a');
            ctx.fillStyle = wg; ctx.fillRect(x0 - 40, y0 - 40, x1 - x0 + 80, Hh + 80); ctx.fillStyle = 'rgba(255,215,200,0.35)'; ctx.fillRect(x0 - 40, y0, x1 - x0 + 80, Hh);
            ctx.fillStyle = 'rgba(120,20,40,0.6)'; for (let i = 0; i < 14; i++) { const xx = x0 + ((i * 80 - t * 30) % (x1 - x0 + 80) + x1 - x0 + 80) % (x1 - x0 + 80) - 40; ctx.beginPath(); ctx.ellipse(xx, y0 - 20, 30, 8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(xx + 40, y1 + 20, 30, 8, 0, 0, TAU); ctx.fill(); }
            const flow = 0.08 * (1 + pulse);
            if (wound) woundT += dt; const wx = 520, wy = y1;
            /* rana: deschidere în peretele de jos */
            if (wound) { const closed = clamp((woundT - 3) / 4, 0, 1); ctx.fillStyle = '#2a0a12'; ctx.beginPath(); ctx.ellipse(wx, wy + 20, 60 * (1 - closed * 0.8), 30, 0, 0, TAU); ctx.fill(); if (closed < 1) for (let i = 0; i < 3; i++) { const u = ((t * 0.8 + i / 3) % 1); rbc(ctx, wx + (i - 1) * 20, wy + 20 + u * 80, 10, t + i, RED); } if (closed > 0.9) A.label(ctx, '✅ Coaja e gata!', wx, wy + 70, { size: 16 }); }
            for (const c of vc) { c.x += dt * flow * c.s; c.a += c.va * dt; if (c.x > 1.05) c.x -= 1.1; rbc(ctx, lerp(x0, x1, c.x), y0 + c.y * Hh + Math.sin(t + c.s * 9) * 4, 17, c.a, RED); }
            for (const p of plt) { if (wound && woundT < 9 && Math.random() < dt * 0.5) p.stuck = 1; if (p.stuck && wound) { const k = clamp(woundT / 3, 0, 1); p.x = lerp(p.x, (wx - x0) / (x1 - x0) + (p.y - 0.5) * 0.12, dt * 2); p.y = lerp(p.y, 0.97, dt * 2); } else { p.x += dt * flow * 1.1; if (p.x > 1.05) p.x -= 1.1; } ctx.fillStyle = '#ffd84a'; ctx.beginPath(); A.blob(ctx, lerp(x0, x1, p.x), y0 + p.y * Hh, 7, t + p.y * 10, { amp: 0.3, points: 6 }); ctx.fill(); }
            /* microbii și globulele albe */
            for (const g of germs) { if (g.dead) { g.dead += dt; continue; } g.x += dt * flow; g.y += Math.sin(t * 3 + g.x * 20) * dt * 0.05; }
            for (const w of wbc) { let tg = germs.find((g) => !g.dead); if (!tg && wound) tg = { x: (wx - x0) / (x1 - x0), y: 0.9 }; const tx = tg ? tg.x : 0.5 + Math.sin(t * 0.3 + w.y * 5) * 0.3, ty = tg ? tg.y : 0.5 + Math.cos(t * 0.4 + w.x * 5) * 0.25; w.vx = lerp(w.vx, (tx - w.x) * 0.6, dt * 2); w.vy = lerp(w.vy, (ty - w.y) * 0.6, dt * 2); w.x += w.vx * dt; w.y += w.vy * dt; for (const g of germs) if (!g.dead && Math.hypot(g.x - w.x, (g.y - w.y) * 0.5) < 0.03) g.dead = 0.01;
              const px = lerp(x0, x1, w.x), py = y0 + w.y * Hh; ctx.fillStyle = 'rgba(245,245,255,0.92)'; A.blob(ctx, px, py, 30, t * 1.5 + w.x * 9, { amp: 0.18, points: 9 }); ctx.fill(); ctx.fillStyle = '#9a7ad8'; A.blob(ctx, px + 4, py, 13, t + 1, { amp: 0.3, points: 7 }); ctx.fill(); }
            for (let i = germs.length - 1; i >= 0; i--) { const g = germs[i]; if (g.x > 1.05 || g.dead > 1) { germs.splice(i, 1); continue; } const px = lerp(x0, x1, g.x), py = y0 + g.y * Hh, s = g.dead ? 1 - g.dead : 1; ctx.save(); ctx.globalAlpha = s; ctx.fillStyle = '#5ac85a'; ctx.beginPath(); ctx.arc(px, py, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a8a3a'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * 13, py + Math.sin(a) * 13); ctx.lineTo(px + Math.cos(a) * 20, py + Math.sin(a) * 20); ctx.stroke(); } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - 4, py - 3, 3, 0, TAU); ctx.arc(px + 4, py - 3, 3, 0, TAU); ctx.fill(); ctx.restore(); }
            A.label(ctx, 'globulă roșie: cară oxigenul', 200, 70, { size: 16, color: '#ffb0b8' }); A.label(ctx, 'globulă albă: soldatul', 500, 70, { size: 16 }); A.label(ctx, 'trombocit: repară rănile', 790, 70, { size: 16, color: '#ffe08a' });
            A.arrow(ctx, 60, 570, 200, 570, { color: 'rgba(255,255,255,0.6)', width: 3 }); A.text(ctx, 'sângele curge așa', 290, 570, { size: 15, color: 'rgba(255,255,255,0.75)' });
          }
          ctx.restore();
        }
      };
    }
  });
})();
