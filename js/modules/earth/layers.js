/* Modul: Straturile Pământului */
(function () {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtN = (v, d) => v.toLocaleString('ro-RO', { maximumFractionDigits: d === undefined ? 0 : d });
  const mix = (c1, c2, t) => [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], clamp(t, 0, 1))));
  const rgb = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  function stars(n) { const a = []; for (let i = 0; i < n; i++) a.push([Math.random(), Math.random(), Math.random() * 1.4 + 0.3]); return a; }
  function drawStars(api, st) { api.ctx.fillStyle = 'rgba(255,255,255,0.65)'; for (const s of st) api.ctx.fillRect(s[0] * api.W, s[1] * api.H, s[2], s[2]); }

  /* ============================================================
     4) STRATURILE PĂMÂNTULUI
     ============================================================ */
  defineModule({
    id: 'layers', title: 'Straturile Pământului', sub: 'Coboară până în centrul planetei',
    start: function (api) {
      const ctx = api.ctx, ST = stars(100);
      let depth = 0, drilling = false, quake = null, selLayer = -1;
      const LAY = [
        { n: 'Scoarța', a: 0, b: 35, c: '#8b6d4a', t: 'Stratul subțire pe care trăim: 5–70 km grosime. Pe scara unui măr, e cât coaja lui.' },
        { n: 'Mantaua', a: 35, b: 2900, c: '#d2531c', t: 'Rocă fierbinte, care curge foarte, foarte încet (cm pe an). Reprezintă ~84% din volumul Pământului. Curenții ei mișcă plăcile tectonice.' },
        { n: 'Nucleul extern', a: 2900, b: 5150, c: '#f5a623', t: 'Fier și nichel topite, lichide! Mișcarea lor creează câmpul magnetic al Pământului, care ne apără de vântul solar.' },
        { n: 'Nucleul intern', a: 5150, b: 6371, c: '#fff1b5', t: 'O bilă solidă de fier, cât 70% din Lună. E atât de fierbinte ca suprafața Soarelui (~5.400°C), dar presiunea uriașă o ține solidă.' }
      ];
      const TAB = [[0, 15, 0], [35, 600, 1], [100, 1300, 3.5], [410, 1600, 14], [2900, 3700, 135], [5150, 5000, 329], [6371, 5400, 364]];
      const lookup = (d, k) => { for (let i = 1; i < TAB.length; i++) if (d <= TAB[i][0]) return lerp(TAB[i - 1][k], TAB[i][k], (d - TAB[i - 1][0]) / (TAB[i][0] - TAB[i - 1][0])); return TAB[TAB.length - 1][k]; };
      const layerOf = (d) => LAY.findIndex((l) => d >= l.a && d < l.b) < 0 ? 3 : LAY.findIndex((l) => d >= l.a && d < l.b);
      const r1 = api.row('');
      const sl = api.slider(r1, { label: 'Adâncimea', min: 0, max: 1, step: 0.001, value: 0, fmt: () => fmtN(depth) + ' km', onInput: (v) => { depth = Math.pow(v, 2.2) * 6371; drilling = false; } });
      api.button(r1, '⛏️ Sapă singur', () => { drilling = true; if (depth >= 6370) { depth = 0; } });
      api.button(r1, '💥 Cutremur', () => { quake = { t: 0 }; api.say('<b>Unde seismice.</b> Undele P (verzi) trec prin tot Pământul. Undele S (roșii) NU trec prin nucleul extern — așa au aflat oamenii de știință că e lichid!', 10000); });
      const info = api.row('');
      const readout = document.createElement('div'); readout.className = 'mod-readout'; info.appendChild(readout);
      api.say('Trage de glisor ca să sapi spre centrul Pământului. Atinge un strat ca să afli despre el. Cea mai adâncă gaură făcută de oameni (Kola, Rusia) are doar 12 km!', 9000);
      api.pointer({ down: (x, y) => { const dx = x - api.cx, dy = y - api.cy, r = Math.hypot(dx, dy) / (api.unit * 0.86) * 6371; if (r < 6371) { const li = layerOf(6371 - r); selLayer = li; api.say('<b>' + LAY[li].n + '</b> (' + fmtN(LAY[li].a) + '–' + fmtN(LAY[li].b) + ' km). ' + LAY[li].t, 12000); } } });
      let lastL = -1;
      /* tremur natural: unde netede cu frecvențe diferite (nu zgomot aleator la fiecare cadru) */
      const nz = (t, k, ph) => 0.5 * Math.sin(t * 6.7 * k + ph) + 0.3 * Math.sin(t * 11.9 * k + ph * 2.3 + 1.7) + 0.2 * Math.sin(t * 19.3 * k + ph * 0.6 + 0.4);
      function frame(dt, t) {
        if (drilling) { depth = Math.min(6371, depth + dt * 330 + depth * dt * 0.12); sl.set(Math.pow(depth / 6371, 1 / 2.2)); if (depth >= 6371) drilling = false; }
        if (quake) { quake.t += dt; if (quake.t > 9) quake = null; }
        const cx = api.cx, cy = api.cy, R = api.unit * 0.86;
        ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, api.W, api.H); drawStars(api, ST);
        /* cutremur: tot desenul tremură, tot mai slab pe măsură ce undele se sting */
        ctx.save();
        if (quake) {
          const q = quake.t, jolt = Math.exp(-Math.pow((q - 0.35) / 0.18, 2)) * 5;                       // prima zdruncinătură (unda P)
          const main = (q < 0.7 ? 0 : Math.min(1, (q - 0.7) / 0.9)) * Math.exp(-Math.max(0, q - 2.4) / 1.7) * 11;   // scuturarea principală (unda S), apoi se stinge lent
          const amp = jolt + main;
          ctx.translate(nz(q, 1, 0.3) * amp, nz(q, 1.25, 2.1) * amp * 0.42);
          ctx.rotate(nz(q, 0.8, 4.2) * amp * 0.0011);
        }
        const px = (km) => km / 6371 * R;
        /* câmp magnetic */
        ctx.strokeStyle = 'rgba(140,200,255,0.28)'; ctx.lineWidth = 1.5;
        for (const k of [1.25, 1.5, 1.8]) { ctx.beginPath(); ctx.ellipse(cx, cy, R * k * 0.62, R * k, 0, 0, 7); ctx.stroke(); }
        /* felia scoasă */
        const wa0 = -Math.PI / 2 - 0.5, wa1 = -Math.PI / 2 + 0.5;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 1.3, wa1, wa0 + Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.fillStyle = '#2a6fb5'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        ctx.fillStyle = '#4f9a4a'; for (const [bx, by, br] of [[-0.45, -0.1, 0.28], [0.35, 0.3, 0.25], [0.2, -0.55, 0.17], [-0.2, 0.55, 0.15], [0.7, -0.1, 0.13]]) { ctx.beginPath(); ctx.arc(cx + bx * R, cy + by * R, br * R, 0, 7); ctx.fill(); }
        /* curenți în manta */
        ctx.strokeStyle = 'rgba(255,200,120,0.35)'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 0.12, rr = px(1700 + (i % 2) * 600); ctx.beginPath(); ctx.arc(cx, cy, rr, a, a + 0.8); ctx.stroke(); }
        ctx.restore();
        /* felia (interior) */
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, wa0, wa1); ctx.closePath(); ctx.clip();
        for (let i = 0; i < LAY.length; i++) { ctx.fillStyle = LAY[i].c; ctx.beginPath(); ctx.arc(cx, cy, px(6371 - LAY[i].a), 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wa0) * R, cy + Math.sin(wa0) * R); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(wa1) * R, cy + Math.sin(wa1) * R); ctx.stroke();
        /* atmosfera */
        ctx.strokeStyle = 'rgba(110,180,255,0.35)'; ctx.lineWidth = R * 0.06; ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, wa1, wa0 + Math.PI * 2); ctx.stroke();
        /* burghiul */
        const by = cy - R + px(depth); ctx.strokeStyle = '#e8eef7'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - R - 24); ctx.lineTo(cx, by); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(cx, by + 8); ctx.lineTo(cx - 6, by - 4); ctx.lineTo(cx + 6, by - 4); ctx.fill();
        if (depth > 0 && depth < 13) { ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Kola: 12 km', cx + 12, cy - R + px(12) + 4); }
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, by, 7, 0, 7); ctx.stroke();
        /* unde seismice */
        if (quake) {
          const ep = { x: cx - Math.sin(0.3) * R * 0, y: cy - R };
          const pr = quake.t * 0.6 * R, sr = quake.t * 0.34 * R;
          ctx.lineWidth = 2;
          for (let i = -4; i <= 4; i++) {
            const a = -Math.PI / 2 + i * 0.34 + Math.PI * 0 + 0.0; const ang = Math.PI / 2 + i * 0.3;
            const dxx = Math.cos(ang), dyy = Math.sin(ang);
            /* P: trece prin tot; S: se oprește la nucleul extern (distanța 0.55R de centru) */
            const lenP = Math.min(pr, 2 * R), lenS = Math.min(sr, Math.abs(i) < 3 ? R * 0.9 : 2 * R * 0.95);
            ctx.strokeStyle = 'rgba(80,255,150,0.8)'; ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx + dxx * lenP * Math.sin(Math.abs(i) * 0.18 + 0.01) * 0.0 + (i * 0.17 * lenP) * 0.5, cy - R + lenP * 0.98); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,90,90,0.8)'; ctx.beginPath(); ctx.moveTo(cx, cy - R); const sl2 = Math.abs(i) < 2 ? Math.min(lenS, R * 0.55) : lenS; ctx.lineTo(cx + (i * 0.17 * sl2) * 0.5, cy - R + sl2 * 0.98); ctx.stroke();
          }
        }
        /* panou */
        const li = layerOf(depth);
        if (li !== lastL) { lastL = li; if (!quake) api.say('<b>' + LAY[li].n + '.</b> ' + LAY[li].t, 9000); }
        const T = lookup(depth, 1), P = lookup(depth, 2);
        readout.innerHTML = '<b>' + LAY[li].n + '</b> · adâncime <b>' + fmtN(depth) + ' km</b> · temperatură ~<b>' + fmtN(T) + '°C</b> · presiune ~<b>' + (P < 0.01 ? '1' : fmtN(P * 9869)) + '</b> atmosfere' + (depth > 12 ? ' · oamenii au săpat doar 12 km' : '');
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '600 12px system-ui,sans-serif'; ctx.textAlign = 'left';
        LAY.forEach((l, i) => { const mid = (l.a + l.b) / 2; ctx.fillStyle = i === 3 ? '#4a3a00' : '#fff'; if (i > 0) ctx.fillText(l.n, cx - R * 0.05 + 6, cy - R + px(mid) + 4 - (i === 1 ? 0 : 0)); });
        ctx.fillStyle = '#fff'; ctx.fillText('Scoarța', cx + R * 0.1, cy - R - 8);
        /* valuri la suprafață, în jurul epicentrului */
        if (quake) for (let k = 0; k < 3; k++) { const ph = (quake.t * 0.8 - k * 0.35); if (ph > 0 && ph < 1.4) { ctx.strokeStyle = 'rgba(255,220,120,' + (0.7 * (1 - ph / 1.4)).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy - R, 10 + ph * R * 0.35, 0, Math.PI); ctx.stroke(); } }
        ctx.restore();
      }
      return { frame: frame };
    }
  });
})();
